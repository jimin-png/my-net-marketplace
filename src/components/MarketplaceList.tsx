'use client'

import { useMarketplaceListings } from '@/hooks/useMarketplaceListings'
import { NFTCard } from '@/components/ui/NFTCard'

export function MarketplaceList() {
    const { data: listings, isLoading } = useMarketplaceListings()

    if (isLoading) return <div className="text-center py-8">Loading Marketplace...</div>
    if (!listings || listings.length === 0) return (
        <div className="text-center py-12">
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">No items for sale yet</p>
            <a
                href="/profile"
                className="text-blue-600 hover:text-blue-700 underline"
            >
                Go to your profile to list an NFT
            </a>
        </div>
    )

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map((listing) => (
                <NFTCard
                    key={listing.tokenId.toString()}
                    tokenId={listing.tokenId}
                    price={listing.price}
                    seller={listing.seller}
                    isMarketplaceItem
                />
            ))}
        </div>
    )
}
