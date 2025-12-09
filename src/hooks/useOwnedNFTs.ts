import { useState, useEffect } from "react";
import { publicClient } from "@/lib/client";
import { nftContractAddress } from "@/lib/constants";
// 이 ABI 파일은 MyNFT.sol에 새로 추가된 nextTokenId 함수 정의를 포함해야 합니다!
import nftAbi from "@/lib/nftAbi.json";

export interface OwnedNFT {
  tokenId: number;
  metadata: {
    name?: string;
    description?: string;
    image?: string;
  };
}

export default function useOwnedNFTs(address?: string) {
  const [nfts, setNfts] = useState<OwnedNFT[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) return;
    fetchNFTs();
  }, [address]);

  async function fetchNFTs() {
    setLoading(true);

    try {
      // 🚨 수정된 부분: "nextId" 대신 컨트랙트에 추가한 "nextTokenId"를 호출합니다.
      const nextTokenId = await publicClient.readContract({
        address: nftContractAddress as `0x${string}`,
        abi: nftAbi,
        functionName: "nextTokenId", // 이제 이 함수는 ABI에 포함되어야 합니다.
      }) as bigint;

      // nextTokenId는 다음에 민팅될 ID이므로, 현재 발행된 토큰은 이 ID 미만입니다.
      const maxSupply = nextTokenId;

      const results: OwnedNFT[] = [];

      // 반복문은 1부터 현재 발행된 마지막 토큰 ID까지 (maxSupply - 1) 실행됩니다.
      for (let id = 1n; id < maxSupply; id++) {
        // 1. 소유자 확인
        const owner = await publicClient.readContract({
          address: nftContractAddress as `0x${string}`,
          abi: nftAbi,
          functionName: "ownerOf",
          args: [id],
        }) as string;

        // 현재 지갑 주소가 소유자가 아니면 건너뜁니다.
        if (typeof owner !== "string" || !address || owner.toLowerCase() !== address.toLowerCase()) continue;

        // 2. Token URI 가져오기
        const tokenURI = await publicClient.readContract({
          address: nftContractAddress as `0x${string}`,
          abi: nftAbi,
          functionName: "tokenURI",
          args: [id],
        }) as string;

        // 3. 메타데이터 불러오기
        // IPFS URI를 Pinata 게이트웨이 URL로 변환하여 HTTP 요청을 보냅니다.
        const jsonUrl = tokenURI.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
        const metadata = await fetch(jsonUrl).then((res) => res.json());

        results.push({
          tokenId: Number(id),
          metadata,
        });
      }

      setNfts(results);
    } catch (err) {
      // 에러가 발생하면 콘솔에 자세히 출력 (ABI/주소 오류 등을 여기서 확인 가능)
      console.error("NFT 불러오기 오류:", err);
    }

    setLoading(false);
  }

  return { nfts, loading };
}