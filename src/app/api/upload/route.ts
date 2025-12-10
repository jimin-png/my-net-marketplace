// src/app/api/upload/route.ts

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
// 🚨 Vercel Node 환경에서 FormData를 안전하게 사용하기 위해 node:buffer 임포트
import { Buffer } from "node:buffer";
import FormData from "form-data"; // 🚨 Node 환경에서 multipart/form-data를 정확히 구성하기 위해 다시 사용

// Pinata 환경 변수
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

    // 2. 파일 데이터를 Node.js Buffer로 변환 (Vercel Node.js 런타임용)
    const buffer = Buffer.from(await file.arrayBuffer());

    // 3. Node.js 'form-data' 라이브러리를 사용하여 안정적인 multipart 요청 구성
    const pinataData = new FormData();

    // Buffer와 filename을 지정하여 정확히 파일로 인식되도록 합니다.
    pinataData.append("file", buffer, {
        filename: file.name,
        contentType: file.type || "application/octet-stream",
    });

    // 4. Pinata API 호출 (API Key/Secret Header 사용)
    const uploadRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      // 🚨 Node.js FormData 사용 시, 헤더는 FormData 객체 자체에서 생성해야 합니다.
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_API_KEY,
        // FormData 라이브러리에서 Content-Type과 Boundary를 가져와 헤더에 추가합니다.
        ...pinataData.getHeaders(),
      },
      body: pinataData as any, // TypeScript 오류 회피
    });

    const json = await uploadRes.json();

    if (!uploadRes.ok) {
        // Pinata에서 오류 메시지가 명확하게 전달되도록 처리
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