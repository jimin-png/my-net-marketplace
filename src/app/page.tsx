'use client'

import { useState } from 'react'
import { useMarketplaceListings } from '@/hooks/useMarketplaceListings'
import { NFTCard } from '@/components/ui/NFTCard'
import { TokenDrop } from '@/components/TokenDrop'
import CreateNFT from '@/components/CreateNFT'   // ✅ 수정한 부분

type TabType = 'marketplace' | 'create' | 'drop'

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('marketplace')
  const { data: listings, isLoading } = useMarketplaceListings()

  return (
    <div className="container mx-auto mt-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">NFT Marketplace</h1>

      {/* 탭 네비게이션 */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'marketplace'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Marketplace
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'create'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            NFT 등록
          </button>
          <button
            onClick={() => setActiveTab('drop')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'drop'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            토큰 드랍
          </button>
        </nav>
      </div>

      {/* 탭 컨텐츠 */}
      {activeTab === 'marketplace' && (
        <div>
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : listings && listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {listings.map((listing) => (
                <NFTCard
                  key={listing.tokenId.toString()}
                  tokenId={listing.tokenId}
                  price={listing.price}
                  seller={listing.seller}
                  isListed={listing.isListed}
                  isMarketplaceItem
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500 text-lg">
              No NFTs currently listed for sale.
            </div>
          )}
        </div>
      )}

      {activeTab === 'create' && (
        <div className="max-w-2xl mx-auto">
          <CreateNFT />
        </div>
      )}

      {activeTab === 'drop' && (
        <div className="max-w-2xl mx-auto">
          <TokenDrop />
        </div>
      )}
    </div>
  )
}
