'use client'

import { MarketplaceList } from '@/components/MarketplaceList'

export default function MarketplacePage() {
    return (
        <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="max-w-6xl mx-auto">
                <MarketplaceList />
            </main>
        </div>
    )
}
