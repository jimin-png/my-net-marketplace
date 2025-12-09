"use client";

import { usePublicClient } from "wagmi";
import { useEffect, useState } from "react";
import { marketplaceContractAddress } from "@/lib/constants";
import marketplaceAbi from "@/lib/marketplaceAbi.json";

export interface Listing {
  tokenId: bigint;
  price: bigint;
  seller: string;
  isListed: boolean;
}

export function useMarketplaceListings() {
  const publicClient = usePublicClient();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchListings() {
      if (!publicClient) return;

      setIsLoading(true);

      try {
        // 최신 블록 가져오기
        const blockNumber = await publicClient.getBlockNumber();

        // 🔍 최근 50,000개 블록만 스캔 (전체 스캔 방지)
        const fromBlock = blockNumber > 50000n ? blockNumber - 50000n : 0n;

        const logs = await publicClient.getLogs({
          address: marketplaceContractAddress as `0x${string}`,
          fromBlock,
          event: {
            type: "event",
            name: "NFTListed",
            inputs: [
              { indexed: true, name: "tokenId", type: "uint256" },
              { indexed: true, name: "seller", type: "address" },
              { indexed: false, name: "price", type: "uint256" },
            ],
          },
        });

        // 중복 제거
        const tokenIds = [...new Set(logs.map((l) => l.args.tokenId as bigint))];

        const results = await Promise.allSettled(
          tokenIds.map(async (tokenId) => {
            const listing = await publicClient.readContract({
              address: marketplaceContractAddress as `0x${string}`,
              abi: marketplaceAbi,
              functionName: "getListing",
              args: [tokenId],
            });

            // listing의 타입을 명시적으로 정의 (listing: unknown 이므로)
            if (
              !Array.isArray(listing) ||
              listing.length < 3 ||
              typeof listing[0] !== "bigint" ||
              typeof listing[1] !== "string" ||
              typeof listing[2] !== "boolean"
            ) {
              return null;
            }

            const price = listing[0] as bigint;
            const seller = listing[1] as string;
            const isListed = listing[2] as boolean;

            if (!isListed) return null;


            return { tokenId, price, seller, isListed } as Listing;
          })
        );

        setListings(
          results
            .filter((res) => res.status === "fulfilled" && res.value !== null)
            .map((res: any) => res.value)
        );
      } catch (err) {
        console.error("❌ Error loading marketplace listings:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchListings();

    //  🔄 10초마다 자동 새로고침
    const interval = setInterval(fetchListings, 10_000);
    return () => clearInterval(interval);
  }, [publicClient]);

  return { data: listings, isLoading };
}
