import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // 🔥 Vercel에서 FormData 처리 가능하게 만드는 핵심

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

    // 📌 Pinata 업로드
    const uploadRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: pinataJwt,
      },
      body: (() => {
        const form = new FormData();
        form.append("file", new Blob([buffer]), file.name);
        return form;
      })(),
    });

    const result = await uploadRes.json();

    if (!uploadRes.ok) {
      return NextResponse.json({ error: result }, { status: 500 });
    }

    return NextResponse.json({ ipfsHash: result.IpfsHash }, { status: 200 });

  } catch (err) {
    console.error("Upload Error →", err);
    return NextResponse.json({ error: "서버 내부 오류" }, { status: 500 });
  }
}
