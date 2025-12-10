// src/app/api/upload/route.ts

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

// 🚨 Vercel 환경 변수에서 Pinata 키를 가져옵니다.
const PINATA_API_KEY = process.env.PINATA_API_KEY;
// 🚨 Vercel 환경 변수 이름을 PINATA_SECRET_API_KEY로 통일합니다.
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;


export async function POST(req: NextRequest) {
  // 1. API 키 유효성 검사 (500 오류의 주 원인 해결)
  if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
      return NextResponse.json(
          { error: "Pinata API Key/Secret Key가 서버 환경 변수에 설정되지 않았습니다." },
          { status: 500 }
      );
  }

  try {
    // 2. Next.js의 표준 req.formData()를 사용하여 파일 데이터 가져오기
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "파일 없음" }, { status: 400 });
    }

    // 3. Pinata에 전송할 새로운 Web API FormData 객체 생성
    const pinataData = new FormData();
    // Pinata가 파일을 인식하도록 필드 이름을 'file'로 지정합니다.
    pinataData.append("file", file, file.name);

    // 4. Pinata API 호출 (API Key/Secret Header 사용)
    const uploadRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      // 🚨 인증 헤더를 API Key와 Secret Key로 구성
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_API_KEY,
        // FormData를 body로 사용하면 Content-Type 헤더는 fetch가 자동으로 설정합니다.
      },
      body: pinataData,
    });

    const json = await uploadRes.json();

    if (!uploadRes.ok) {
        // Pinata에서 401 Unauthorized 등의 오류가 발생했을 경우 처리
        return NextResponse.json({
            error: "Pinata 업로드 실패",
            detail: json.error || 'Pinata 인증 또는 파일 형식 오류'
        }, { status: uploadRes.status });
    }

    return NextResponse.json(json);

  } catch (err: any) {
    console.error("Server error:", err);
    return NextResponse.json({ error: "Server error", detail: err.message || `${err}` }, { status: 500 });
  }
}