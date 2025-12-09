'use client';

import Link from 'next/link';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useState, useEffect } from 'react';

export function Header() {
    const { address, isConnected } = useAccount();
    const { connect, connectors, isPending } = useConnect();
    const { disconnect } = useDisconnect();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const formattedAddress = address
        ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
        : '';

    return (
        <header className="bg-white border-b shadow-sm">
            <div className="container mx-auto flex items-center justify-between py-4 px-4 sm:px-6 lg:px-8">

                {/* 앱 제목: "NFT Marketplace" */}
                <div className="text-xl font-bold text-gray-800">
                    <Link href="/">NFT Marketplace</Link>
                </div>

                {/* 내비게이션 링크 */}
                <nav className="flex space-x-6">
                    <Link
                        href="/"
                        className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                    >
                        Browse Marketplace
                    </Link>

                    <Link
                        href="/profile"
                        className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                    >
                        My Profile
                    </Link>
                </nav>

                {/* 지갑 연결/해제 영역 */}
                <div>
                    {mounted && isConnected ? (
                        <div className="flex items-center space-x-4">
                            <span className="text-sm font-mono bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                                {formattedAddress}
                            </span>
                            <button
                                onClick={() => disconnect()}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                            >
                                Disconnect
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => connect({ connector: connectors[0] })}
                            disabled={isPending}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                            {isPending ? 'Connecting...' : 'Connect Wallet'}
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
