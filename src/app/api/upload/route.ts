import { NextRequest, NextResponse } from 'next/server';

const PINATA_FILE_UPLOAD_URL =
  'https://api.pinata.cloud/pinning/pinFileToIPFS';

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

export async function POST(req: NextRequest) {
  if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
    return NextResponse.json(
      { error: 'Pinata API 키가 설정되지 않았습니다.' },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: '파일이 전달되지 않았습니다.' },
        { status: 400 }
      );
    }

    // Pinata로 보낼 FormData
    const pinataForm = new FormData();
    pinataForm.append('file', file);

    const pinataRes = await fetch(PINATA_FILE_UPLOAD_URL, {
      method: 'POST',
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
      body: pinataForm,
    });

    if (!pinataRes.ok) {
      const text = await pinataRes.text();
      throw new Error(text);
    }

    const result = await pinataRes.json();

    return NextResponse.json({
      IpfsHash: result.IpfsHash,
    });
  } catch (err: any) {
    console.error('이미지 업로드 오류:', err);
    return NextResponse.json(
      { error: err.message || '이미지 업로드 실패' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method Not Allowed' },
    { status: 405 }
  );
}
