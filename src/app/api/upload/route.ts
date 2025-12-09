import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const uploadRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      body: formData,
    });

    const result = await uploadRes.json();

    if (!result?.IpfsHash) {
      return NextResponse.json({ error: "Pinata Upload Failed", result }, { status: 500 });
    }

    return NextResponse.json({ cid: result.IpfsHash });
  } catch (err) {
    console.error("Pinata upload error:", err);
    return NextResponse.json({ error: "Server error", detail: `${err}` }, { status: 500 });
  }
}
