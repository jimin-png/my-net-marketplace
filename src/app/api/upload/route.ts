export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // Edge 실행 방지 (중요)

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    }

    const pinataJwt = process.env.PINATA_JWT;
    if (!pinataJwt) {
      return NextResponse.json({ error: "환경변수 PINATA_JWT 없음" }, { status: 500 });
    }

    // Pinata가 요구하는 multipart 방식으로 변환
    const formData = new FormData();
    formData.append("file", file);

    const uploadResult = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${pinataJwt}`,
      },
      body: formData,
    });

    if (!uploadResult.ok) {
      const msg = await uploadResult.text();
      console.error("Pinata Upload Error: ", msg);
      return NextResponse.json({ error: "Pinata 업로드 실패", detail: msg }, { status: 500 });
    }

    const data = await uploadResult.json();
    return NextResponse.json({ success: true, ...data });

  } catch (err: any) {
    console.error("Server Upload Error:", err);
    return NextResponse.json({ error: err.message || "서버 오류" }, { status: 500 });
  }
}
