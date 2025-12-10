// src/app/api/upload/route.ts

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

// Pinata 환경 변수 (Vercel 대시보드에서 등록된 변수 사용)
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

export async function POST(req: NextRequest) {
  // 1. Pinata 키 검증
  if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
      return NextResponse.json(
          { error: "Pinata API Key/Secret Key가 서버 환경 변수에 설정되지 않았습니다." },
          { status: 500 }
      );
  }

  try {
    // 2. 클라이언트에서 받은 raw body와 Content-Type 헤더를 그대로 가져옵니다.
    // 이는 파일 업로드의 멀티파트(multipart) 데이터를 Pinata로 통과시키는 핵심입니다.

    // 🚨 req.body를 직접 Pinata로 스트리밍하거나 복사하기 위해 raw 데이터를 가져옵니다.
    const rawBody = req.body;

    // 🚨 Content-Type 헤더는 Pinata에 파일을 업로드할 때 핵심입니다.
    const contentType = req.headers.get('content-type');

    if (!rawBody || !contentType || !contentType.includes('multipart/form-data')) {
        return NextResponse.json(
            { error: "올바른 파일 데이터(multipart/form-data)가 수신되지 않았습니다." },
            { status: 400 }
        );
    }

    // 3. Pinata API 호출 (인증 헤더만 추가하여 요청을 재전송)
    const uploadRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      // 🚨 클라이언트의 Content-Type 헤더를 그대로 사용해야 Pinata가 파일을 인식합니다.
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_API_KEY,
        'Content-Type': contentType,
      },
      body: rawBody, // 👈 클라이언트에서 받은 raw body를 그대로 Pinata로 전달
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