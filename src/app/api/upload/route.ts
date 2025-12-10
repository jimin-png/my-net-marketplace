// src/app/api/upload/route.ts

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
// 🚨 (주요 변경): form-data 라이브러리 사용을 제거하고, 웹 표준 FormData와 Buffer만 사용합니다.

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
    // 1. NextRequest에서 FormData 가져오기 (웹 표준)
    const reqFormData = await req.formData();
    const file = reqFormData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "파일 없음" }, { status: 400 });
    }

    // 2. 새로운 웹 표준 FormData 객체를 생성하여 Pinata 전송 구조를 만듭니다.
    // Pinata 공식 문서에 따라, 파일을 FormData의 'file' 필드에 추가합니다.
    const pinataFormData = new FormData();
    pinataFormData.append("file", file); // 👈 Node.js Buffer 변환 불필요. File 객체를 직접 전달합니다.

    // 3. Pinata API 호출
    const uploadRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      // 🚨 인증 헤더는 API Key/Secret Key로 구성
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_API_KEY,
        // FormData를 body로 사용할 경우, Content-Type 헤더는 fetch가 자동으로 처리합니다.
      },
      body: pinataFormData as any, // 👈 FormData 객체를 body로 직접 전달
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