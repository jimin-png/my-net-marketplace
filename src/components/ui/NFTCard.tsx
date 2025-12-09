'use client'

import { useReadContract, useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { nftContractAddress, marketplaceContractAddress, tokenContractAddress } from '@/lib/constants'
import nftAbi from '@/lib/nftAbi.json'
import marketplaceAbi from '@/lib/marketplaceAbi.json'
import tokenAbi from '@/lib/tokenAbi.json'
import { useState, useEffect } from 'react'
import { parseEther, formatEther } from 'viem'

interface NFTCardProps {
    tokenId: bigint
    isMarketplaceItem?: boolean
    price?: bigint
    seller?: string
    isListed?: boolean
}

export function NFTCard({ tokenId, isMarketplaceItem, price: propPrice, seller: propSeller }: NFTCardProps) {
    const { address } = useAccount()
    const [metadata, setMetadata] = useState<{ name?: string; image?: string; description?: string } | null>(null)
    const [price, setPrice] = useState('')
    const [isListing, setIsListing] = useState(false)

    const { data: tokenURI } = useReadContract({
        address: nftContractAddress as `0x${string}`,
        abi: nftAbi,
        functionName: 'tokenURI',
        args: [tokenId],
    })

    // Use passed props if available (from useMarketplaceListings), otherwise fetch? 
    // Actually, for "My Profile", we might not pass listing data if it's not listed.
    // But for Marketplace, we pass it.
    // The original code fetched it if isMarketplaceItem was true.
    // Let's keep fetching if props are missing, or rely on props.
    // To be safe and efficient, if props are provided, use them.

    const listingPrice = propPrice
    const seller = propSeller

    const { writeContract, data: hash, isPending } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    })

    useEffect(() => {
        if (tokenURI) {
            const url = (tokenURI as string).replace('ipfs://', 'https://ipfs.io/ipfs/')
            fetch(url)
                .then((res) => res.json())
                .then((data) => setMetadata(data))
                .catch((err) => console.error('Error fetching metadata:', err))
        }
    }, [tokenURI])

    const handleList = async () => {
        if (!price) return
        try {
            // 1. Approve NFT
            await writeContract({
                address: nftContractAddress as `0x${string}`,
                abi: nftAbi,
                functionName: 'approve',
                args: [marketplaceContractAddress, tokenId],
            })
            // Note: In a real app we should wait for approval before listing, 
            // but for simplicity we might need a multi-step UI or optimistic updates.
            // Here we just trigger the next step after user confirms the first? 
            // Actually, we can't chain them easily without waiting.
            // Let's just do approval first, then user clicks "List" again? 
            // Or better: Check approval status first.
        } catch (err) {
            console.error(err)
        }
    }

    const handleListAction = async () => {
        if (!price) return
        writeContract({
            address: marketplaceContractAddress as `0x${string}`,
            abi: marketplaceAbi,
            functionName: 'listNFT',
            args: [tokenId, parseEther(price)],
        })
    }

    const handleApprove = () => {
        writeContract({
            address: nftContractAddress as `0x${string}`,
            abi: nftAbi,
            functionName: 'approve',
            args: [marketplaceContractAddress, tokenId],
        })
    }

    const handleBuy = async () => {
        if (!listingPrice) return
        // Approve Token first
        writeContract({
            address: tokenContractAddress as `0x${string}`,
            abi: tokenAbi,
            functionName: 'approve',
            args: [marketplaceContractAddress, listingPrice],
        })
    }

    const handleBuyAction = () => {
        writeContract({
            address: marketplaceContractAddress as `0x${string}`,
            abi: marketplaceAbi,
            functionName: 'buyNFT',
            args: [tokenId],
        })
    }

    return (
        <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800 flex flex-col">
            <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                {metadata?.image ? (
                    <img
                        src={metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/')}
                        alt={metadata.name || `NFT #${tokenId}`}
                        className="object-cover w-full h-full"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        Loading...
                    </div>
                )}
            </div>
            <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-lg">{metadata?.name || `NFT #${tokenId}`}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    ID: {tokenId.toString()}
                </p>

                {isMarketplaceItem && listingPrice && (
                    <div className="mt-2">
                        <p className="text-lg font-bold text-blue-600">
                            {formatEther(listingPrice)} MTK
                        </p>
                        {address !== seller && (
                            <div className="flex flex-col gap-2 mt-2">
                                <button
                                    onClick={handleBuy}
                                    disabled={isPending || isConfirming}
                                    className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
                                >
                                    Approve Token
                                </button>
                                <button
                                    onClick={handleBuyAction}
                                    disabled={isPending || isConfirming}
                                    className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
                                >
                                    Buy Now
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {!isMarketplaceItem && (
                    <div className="mt-4 pt-4 border-t">
                        {!isListing ? (
                            <button
                                onClick={() => setIsListing(true)}
                                className="w-full py-2 border border-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                            >
                                List for Sale
                            </button>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <input
                                    type="text"
                                    placeholder="Price in MTK"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="p-2 border rounded text-sm bg-transparent"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleApprove}
                                        disabled={isPending || isConfirming}
                                        className="flex-1 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 text-xs"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={handleListAction}
                                        disabled={isPending || isConfirming}
                                        className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-xs"
                                    >
                                        List
                                    </button>
                                </div>
                                <button
                                    onClick={() => setIsListing(false)}
                                    className="text-xs text-gray-500 hover:text-gray-700 text-center"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
