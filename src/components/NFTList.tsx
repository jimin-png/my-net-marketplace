"use client";

import { useState, useEffect } from "react"; // 🚨 [수정]: useEffect를 import 합니다.
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import marketplaceAbi from "@/lib/marketplaceAbi.json";
import nftAbi from "@/lib/nftAbi.json";
import { marketplaceContractAddress, nftContractAddress } from "@/lib/constants";

interface Props {
  tokenId: number;
  metadata: {
    name?: string;
    description?: string;
    image?: string;
  };
}

export default function NFTList({ tokenId, metadata }: Props) {
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("");

  const { writeContract, data: hash, error } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  // 🚨 [수정된 부분]: isSuccess에 따른 상태 업데이트를 useEffect로 분리
  useEffect(() => {
    // 트랜잭션이 성공하고 hash가 있을 때만 실행
    if (isSuccess && hash) {
      // 100ms 지연 후 메시지를 표시하여 트랜잭션 완료를 시각적으로 보여줄 수 있습니다.
      const timer = setTimeout(() => {
        setStatus("🎉 등록 완료! Marketplace에서 확인하세요!");
      }, 100);

      // 클린업 함수: 컴포넌트 언마운트 시 타이머를 정리
      return () => clearTimeout(timer);
    }
  }, [isSuccess, hash]); // isSuccess나 hash가 변경될 때만 실행

  async function approve() {
    setStatus("⏳ 승인 요청 중... 메타마스크 확인하세요.");

    writeContract({
      address: nftContractAddress as `0x${string}`,
      abi: nftAbi,
      functionName: "approve",
      args: [marketplaceContractAddress, BigInt(tokenId)],
      gas: 500_000n,
    });
  }

  async function listNFT() {
    if (!price) return setStatus("⚠️ 가격 입력 필요!");

    setStatus("📦 판매 등록 진행 중... 메타마스크 확인하세요.");

    writeContract({
      address: marketplaceContractAddress as `0x${string}`,
      abi: marketplaceAbi,
      functionName: "listNFT",
      args: [BigInt(tokenId), BigInt(price)],
      gas: 500_000n,
    });
  }

  // 🚨 [제거된 부분]: 이전의 if (isSuccess) setStatus(...) 코드를 제거했습니다.
  // if (isSuccess) setStatus("🎉 등록 완료! Marketplace에서 확인하세요!");


  return (
    <div className="p-4 border rounded-xl shadow-md bg-white text-center">
      <img
        src={metadata.image?.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")}
        alt="NFT"
        className="w-full h-48 object-cover rounded-lg mb-3"
      />

      <h3 className="font-semibold text-lg">{metadata.name || `NFT #${tokenId}`}</h3>

      <p className="text-gray-500 text-sm mb-2">ID: {tokenId}</p>

      <input
        className="border p-2 w-full mb-2 rounded"
        type="number"
        placeholder="판매 가격 입력 (MTK)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <button
        onClick={approve}
        className="w-full bg-gray-700 hover:bg-gray-800 text-white py-2 rounded mb-2 transition"
      >
        Approve
      </button>

      <button
        onClick={listNFT}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
      >
        List
      </button>

      {status && <p className="mt-2 text-center text-sm">{status}</p>}
      {error && <p className="mt-2 text-red-500 text-sm">트랜잭션 오류: {error.message}</p>}
    </div>
  );
}