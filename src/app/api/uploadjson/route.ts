// src/app/api/uploadJson/route.ts
import { NextResponse, NextRequest } from 'next/server';

// Pinata 업로드를 위한 URL
const PINATA_JSON_UPLOAD_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

// 🚨 환경 변수 확인 (Vercel 대시보드에 설정 필요)
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;


export async function POST(req: NextRequest) {
  // 1. API 키 유효성 검사
  if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
    return NextResponse.json(
      { error: "Pinata API 키가 서버 환경 변수에 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  try {
    // 2. 클라이언트에서 전송된 JSON 메타데이터 읽기
    const metadata = await req.json();

    // 3. Pinata API 호출 (메타데이터 업로드)
    const pinataResponse = await fetch(PINATA_JSON_UPLOAD_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Pinata 인증을 위한 헤더
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_API_KEY,
      },
      body: JSON.stringify({
        pinataMetadata: {
          name: metadata.name || "NFT Metadata"
        },
        pinataContent: metadata, // 클라이언트에서 받은 메타데이터 객체를 전송
      }),
    });

    if (!pinataResponse.ok) {
      const errorText = await pinataResponse.text();
      throw new Error(`Pinata 업로드 실패: ${pinataResponse.status} - ${errorText}`);
    }

    const pinataJson = await pinataResponse.json();

    // 4. 성공 시 CID 반환
    return NextResponse.json({
      cid: pinataJson.IpfsHash, // Pinata는 CID를 IpfsHash 필드에 반환합니다.
      url: `ipfs://${pinataJson.IpfsHash}`
    });

  } catch (error: any) {
    console.error("메타데이터 업로드 중 서버 오류:", error.message);
    return NextResponse.json(
      { error: error.message || "메타데이터 업로드 실패" },
      { status: 500 }
    );
  }
}

// 다른 HTTP 메서드는 허용하지 않습니다.
export async function GET() {
    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}