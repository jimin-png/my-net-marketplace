import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const data = await request.formData();
  const file = data.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
  }

  const jwt = process.env.PINATA_JWT;

  if (!jwt) {
    return NextResponse.json({ error: "Missing JWT" }, { status: 500 });
  }

  const uploadData = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: jwt,
    },
    body: file,
  });

  const result = await uploadData.json();
  return NextResponse.json({ cid: result.IpfsHash });
}
