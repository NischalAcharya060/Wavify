import { Suspense } from 'react'
import SearchContent from './SearchContent'

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8"><div className="skeleton h-12 w-full max-w-lg rounded-2xl mb-6" /></div>}>
      <SearchContent />
    </Suspense>
  )
}
