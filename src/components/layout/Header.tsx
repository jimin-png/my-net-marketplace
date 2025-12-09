'use client'

import { WalletConnect } from '@/components/WalletConnect'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Header() {
    const pathname = usePathname()

    const isActive = (path: string) => pathname === path

    return (
        <header className="flex flex-col sm:flex-row justify-between items-center p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800 gap-4 bg-white dark:bg-black sticky top-0 z-10">
            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                <Link href="/" className="text-2xl font-bold hover:opacity-80 transition-opacity">
                    NFT Marketplace
                </Link>
                <nav className="flex gap-6">
                    <Link
                        href="/marketplace"
                        className={`text-sm font-medium transition-colors ${isActive('/marketplace')
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'hover:text-blue-600 dark:hover:text-blue-400 text-gray-600 dark:text-gray-300'
                            }`}
                    >
                        Browse Marketplace
                    </Link>
                    <Link
                        href="/profile"
                        className={`text-sm font-medium transition-colors ${isActive('/profile')
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'hover:text-blue-600 dark:hover:text-blue-400 text-gray-600 dark:text-gray-300'
                            }`}
                    >
                        My Profile
                    </Link>
                </nav>
            </div>
            <WalletConnect />
        </header>
    )
}
