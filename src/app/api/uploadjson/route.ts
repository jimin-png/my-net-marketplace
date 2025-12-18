// src/app/api/uploadJson/route.ts

import { NextResponse, NextRequest } from 'next/server';

const PINATA_JSON_UPLOAD_URL =
  'https://api.pinata.cloud/pinning/pinJSONToIPFS';

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

export async function POST(req: NextRequest) {
  // 1️⃣ 환경 변수 체크
  if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
    return NextResponse.json(
      { error: 'Pinata API 키가 설정되지 않았습니다.' },
      { status: 500 }
    );
  }

  try {
    // 2️⃣ FormData 수신
    const formData = await req.formData();

    const name = formData.get('name');
    const description = formData.get('description');
    const imageUrl = formData.get('imageUrl'); // 프론트에서 넣은 값

    if (!name || !description || !imageUrl) {
      return NextResponse.json(
        { error: '필수 메타데이터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 3️⃣ Pinata로 보낼 JSON 메타데이터 구성
    const metadata = {
      name,
      description,
      image: imageUrl,
    };

    // 4️⃣ Pinata API 호출
    const pinataResponse = await fetch(PINATA_JSON_UPLOAD_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
      body: JSON.stringify({
        pinataMetadata: {
          name: String(name),
        },
        pinataContent: metadata,
      }),
    });

    if (!pinataResponse.ok) {
      const text = await pinataResponse.text();
      throw new Error(`Pinata 업로드 실패: ${text}`);
    }

    const result = await pinataResponse.json();

    // 5️⃣ 반드시 JSON 응답 반환
    return NextResponse.json({
      success: true,
      cid: result.IpfsHash,
      url: `ipfs://${result.IpfsHash}`,
    });
  } catch (error: any) {
    console.error('uploadJson error:', error);

    return NextResponse.json(
      { error: error.message || '메타데이터 업로드 실패' },
      { status: 500 }
    );
  }
}

// GET 차단
export async function GET() {
  return NextResponse.json(
    { error: 'Method Not Allowed' },
    { status: 405 }
  );
}
