import { Suspense } from 'react'
import SearchContent from './SearchContent'

export default function SearchPage() {
    return (
        <Suspense
            fallback={
                <div className="px-4 py-6 md:p-8">
                    <div className="skeleton h-12 w-full max-w-lg rounded-2xl mb-6 opacity-20"
                         style={{ background: 'rgba(255,255,255,0.05)' }}
                    />
                </div>
            }
        >
            <SearchContent />
        </Suspense>
    )
}