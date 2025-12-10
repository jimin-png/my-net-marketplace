export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import FormData from "form-data";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "파일 없음" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pinataJwt = process.env.PINATA_JWT;

    if (!pinataJwt) {
      return NextResponse.json({ error: "환경변수 PINATA_JWT 없음" }, { status: 500 });
    }

    // 🔥 Node 전용 FormData 사용
    const data = new FormData();
    data.append("file", buffer, {
      filename: file.name,
      contentType: file.type || "application/octet-stream",
    });

    const uploadRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: pinataJwt, // Bearer 포함해서 저장했기 때문에 그대로 사용
        ...data.getHeaders(), // 🔥 Node 환경에서는 헤더 직접 넣어야함
      },
      body: data as any, // TS 오류 제거
    });

    const json = await uploadRes.json();
    return NextResponse.json(json);

  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ error: "Server error", detail: `${err}` }, { status: 500 });
  }
}
