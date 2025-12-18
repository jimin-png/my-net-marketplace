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

  /**
   * ✅ Pinata 업로드 (이미지는 브라우저 → Pinata 직행)
   * ✅ 서버는 JSON 메타데이터만 처리
   */
  async function uploadToPinata() {
    if (!file) throw new Error("이미지 파일 없음");

    // ===== 1️⃣ 이미지 업로드 =====
    const pinataJwt = process.env.NEXT_PUBLIC_PINATA_JWT;
    if (!pinataJwt) throw new Error("NEXT_PUBLIC_PINATA_JWT 없음");

    const imgForm = new FormData();
    imgForm.append("file", file);

    const imgRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${pinataJwt}`,
      },
      body: imgForm,
    });

    const imgJson = await imgRes.json();
    if (!imgJson.IpfsHash) {
      console.error(imgJson);
      throw new Error("이미지 업로드 실패");
    }

    const imageCID = imgJson.IpfsHash;
    const imageURI = `ipfs://${imageCID}`;

    // ===== 2️⃣ 메타데이터 업로드 =====
    const metadata = {
      name,
      description: desc,
      image: imageURI,
    };

    const metaRes = await fetch("/api/uploadJson", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(metadata),
    });

    const metaJson = await metaRes.json();
    if (!metaJson.cid) {
      console.error(metaJson);
      throw new Error("메타데이터 업로드 실패");
    }

    return metaJson.cid;
  }

  async function handleMint() {
    if (!isConnected) return setStatus("⚠ 지갑을 먼저 연결하세요.");
    if (!name.trim() || !file) return setStatus("⚠ NFT 정보 입력 필요.");

    try {
      setStatus("📤 Pinata 업로드 중...");
      const metadataCID = await uploadToPinata();

      setStatus("⛓️ 블록체인 민팅 중...");

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
    <div className="bg-white p-6 rounded-lg shadow max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">NFT 등록</h2>
      <p className="text-gray-600 mb-4">
        새로운 NFT를 생성하고 등록할 수 있습니다.
      </p>

      <label className="font-semibold">NFT 이름</label>
      <input
        className="border p-2 w-full mb-4"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label className="font-semibold">설명</label>
      <textarea
        className="border p-2 w-full mb-4"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />

      <label className="font-semibold">이미지</label>
      <input
        type="file"
        accept="image/*"
        className="mb-4"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button
        onClick={handleMint}
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg"
      >
        {isLoading ? "⏳ 민팅 중..." : "NFT 생성하기"}
      </button>

      {status && <p className="mt-3 text-center">{status}</p>}
      {writeError && <p className="mt-3 text-red-500">{writeError.message}</p>}
      {isSuccess && (
        <p className="mt-3 text-green-500 text-center">
          🎉 NFT 민팅 완료!
        </p>
      )}
    </div>
  );
}
