// src/app/api/upload/route.ts (웹 표준 API 버전)

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

export async function POST(req: NextRequest) {
  if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
      return NextResponse.json(
          { error: "Pinata API Key/Secret Key가 서버 환경 변수에 설정되지 않았습니다." },
          { status: 500 }
      );
  }

  try {
    // 1. NextRequest에서 FormData 가져오기
    const reqFormData = await req.formData();
    const file = reqFormData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "파일 없음" }, { status: 400 });
    }

    // 2. 새로운 웹 표준 FormData 객체를 생성하여 Pinata 전송 구조를 만듭니다.
    const pinataFormData = new FormData();
    pinataFormData.append("file", file, file.name); // File 객체를 직접 전달

    // 3. Pinata API 호출
    const uploadRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      // Content-Type 헤더는 fetch가 자동으로 multipart/form-data로 설정합니다.
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_API_KEY,
      },
      body: pinataFormData as any,
    });

    const json = await uploadRes.json();

    if (!uploadRes.ok) {
        return NextResponse.json({
            error: "Pinata 업로드 실패",
            detail: json.error || JSON.stringify(json)
        }, { status: uploadRes.status });
    }

    return NextResponse.json({
      cid: json.IpfsHash,
      url: `ipfs://${json.IpfsHash}`
    });

  } catch (err: any) {
    console.error("Server error:", err);
    return NextResponse.json({ error: "Server error", detail: err.message || `${err}` }, { status: 500 });
  }
}