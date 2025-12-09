export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "파일이 없습니다" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const pinataJwt = process.env.PINATA_JWT;

    if (!pinataJwt) {
      return NextResponse.json({ error: "환경변수 PINATA_JWT 없음" }, { status: 500 });
    }

    const uploadRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${pinataJwt}`,
      },
      body: buffer,
    });

    const uploadJson = await uploadRes.json();

    return NextResponse.json(uploadJson);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "업로드 실패" }, { status: 500 });
  }
}
