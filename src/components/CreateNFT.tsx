'use client'

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import nftAbi from "@/lib/nftAbi.json";
import { nftContractAddress } from "@/lib/constants";

export default function CreateNFT() {
  const { address, isConnected } = useAccount();

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");

  const { writeContract, data: hash, error: writeError } = useWriteContract();
  const { isSuccess, isLoading } = useWaitForTransactionReceipt({ hash });

  async function uploadToPinata() {
    if (!file) throw new Error("이미지 파일 없음");

    // 🔹 이미지 업로드 (JWT는 서버에서만 사용)
    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: form,
    });

    const imageJson = await res.json();
    if (!imageJson.IpfsHash) throw new Error("이미지 업로드 실패");

    const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY;
    if (!gateway) throw new Error("NEXT_PUBLIC_PINATA_GATEWAY 없음");

    const imageURL = `${gateway}/${imageJson.IpfsHash}`;

    // 🔹 메타데이터 업로드
    const metaRes = await fetch("/api/uploadJson", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description: desc,
        image: imageURL,
      }),
    });

    const metaJson = await metaRes.json();
    if (!metaJson.cid) throw new Error("메타데이터 업로드 실패");

    return metaJson.cid;
  }

  async function handleMint() {
    if (!isConnected) return setStatus("⚠ 지갑 먼저 연결하세요.");
    if (!name || !file) return setStatus("⚠ 입력값 부족");

    try {
      setStatus("📤 Pinata 업로드 중...");
      const metadataCID = await uploadToPinata();

      setStatus("⛓️ 민팅 중...");
      writeContract({
        address: nftContractAddress as `0x${string}`,
        abi: nftAbi,
        functionName: "safeMint",
        args: [address as `0x${string}`, `ipfs://${metadataCID}`],
      });
    } catch (err: any) {
      setStatus("❌ 오류: " + err.message);
    }
  }

  return (
    <div>
      <input value={name} onChange={e => setName(e.target.value)} />
      <textarea value={desc} onChange={e => setDesc(e.target.value)} />
      <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
      <button onClick={handleMint}>NFT 생성하기</button>
      {status}
    </div>
  );
}
