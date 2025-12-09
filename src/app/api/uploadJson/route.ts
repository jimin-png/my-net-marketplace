import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const jwt = process.env.NEXT_PUBLIC_PINATA_JWT;

    if (!jwt) {
      return NextResponse.json({ error: "Missing JWT" }, { status: 500 });
    }

    const metadata = await req.json();

    const upload = await fetch(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(metadata),
      }
    );

    const result = await upload.json();
    console.log("Metadata upload result →", result);

    if (!result.IpfsHash) {
      return NextResponse.json(
        { error: "Pinata JSON upload failed", details: result },
        { status: 500 }
      );
    }

    return NextResponse.json({ cid: result.IpfsHash });
  } catch (err) {
    console.error("uploadJson route error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
