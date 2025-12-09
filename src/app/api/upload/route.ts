export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "파일이 없습니다" }, { status: 400 });
    }

    // 파일 버퍼 변환
    const buffer = Buffer.from(await file.arrayBuffer());

    // Pinata JWT 불러오기
    const pinataJwt = process.env.PINATA_JWT;
    if (!pinataJwt) {
      return NextResponse.json({ error: "환경변수 PINATA_JWT 없음" }, { status: 500 });
    }

    // multipart/form-data 구성
    const uploadData = new FormData();
    uploadData.append("file", new Blob([buffer]), file.name);

    // Pinata 업로드 요청
    const uploadRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: pinataJwt, // ❗ 이미 Bearer 포함됨
      },
      body: uploadData,
    });

    const json = await uploadRes.json();

    if (!uploadRes.ok) {
      return NextResponse.json({ error: json.error || "업로드 실패" }, { status: 500 });
    }

    return NextResponse.json(json);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "업로드 중 서버 오류" }, { status: 500 });
  }
}
