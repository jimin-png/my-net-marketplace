// src/app/api/upload/route.ts (수정된 코드 - API Key/Secret 사용)

export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
// FormData 라이브러리를 임포트하는 대신 표준 Web API의 FormData를 사용합니다.

export async function POST(req: NextRequest) {
  // 🚨 JWT 대신 Pinata API Key/Secret Key를 환경 변수에서 가져옵니다.
  const PINATA_API_KEY = process.env.PINATA_API_KEY;
  const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY; // 👈 이름 일치 확인

  if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
      return NextResponse.json(
          { error: "Pinata API Key/Secret Key 누락" },
          { status: 500 }
      );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    // ... (파일 유효성 검사 및 데이터 구성 로직) ...
    const pinataData = new FormData();
    pinataData.append("file", file, file.name);

    // 🚨 API Key/Secret Header 사용
    const uploadRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_API_KEY,
      },
      body: pinataData,
    });

    // ... (응답 처리 로직) ...
    const json = await uploadRes.json();

    if (!uploadRes.ok) {
        return NextResponse.json({ error: "Pinata 업로드 실패", detail: json.error || '알 수 없는 Pinata 오류' }, { status: uploadRes.status });
    }

    return NextResponse.json(json);

  } catch (err: any) {
    console.error("Server error:", err);
    return NextResponse.json({ error: "Server error", detail: err.message || `${err}` }, { status: 500 });
  }
}