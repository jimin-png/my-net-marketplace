'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useState, useEffect } from 'react'

export function WalletConnect() {
    const { address, isConnected } = useAccount()
    const { connectors, connect } = useConnect()
    const { disconnect } = useDisconnect()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    if (isConnected) {
        return (
            <div className="flex items-center gap-4">
                <span className="text-sm font-mono bg-gray-100 px-3 py-1 rounded-full dark:bg-gray-800">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                <button
                    onClick={() => disconnect()}
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                >
                    Disconnect
                </button>
            </div>
        )
    }

    return (
        <div className="flex gap-2">
            {connectors.map((connector) => (
                <button
                    key={connector.uid}
                    onClick={() => connect({ connector })}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Connect {connector.name}
                </button>
            ))}
        </div>
    )
}
