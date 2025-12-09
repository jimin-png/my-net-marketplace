'use client'

import { useAccount, useReadContract } from 'wagmi'
import { useState, useEffect } from 'react'
import { formatUnits } from 'viem'
import { tokenContractAddress } from '@/lib/constants'
import tokenAbi from '@/lib/tokenAbi.json'

export function TokenBalance() {
    const { address } = useAccount()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const { data: balance, isError, isLoading } = useReadContract({
        address: tokenContractAddress as `0x${string}`,
        abi: tokenAbi,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    })

    if (!mounted) return null
    if (!address) return null
    if (isLoading) return <div className="animate-pulse h-6 w-24 bg-gray-200 rounded"></div>
    if (isError) return <div className="text-red-500">Error loading balance</div>

    return (
        <div className="flex flex-col gap-1 p-4 border rounded-lg bg-white dark:bg-gray-900 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Token Balance</h3>
            <div className="text-2xl font-bold">
                {balance ? formatUnits(balance as bigint, 18) : '0'} MTK
            </div>
        </div>
    )
}
