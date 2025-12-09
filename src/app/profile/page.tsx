"use client";

import useOwnedNFTs from "@/hooks/useOwnedNFTs";
import { useAccount } from "wagmi";
import NFTList from "@/components/NFTList";

export default function ProfilePage() {
  const { address } = useAccount();
  const { nfts, loading } = useOwnedNFTs(address);

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">My NFTs</h2>

      {loading && <p>⏳ 불러오는 중...</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {nfts.length > 0 ? (
          nfts.map((nft) => (
            <NFTList
              key={nft.tokenId.toString()}
              tokenId={Number(nft.tokenId)}
              metadata={nft.metadata}
            />
          ))
        ) : (
          <p className="text-gray-500">보유한 NFT가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
