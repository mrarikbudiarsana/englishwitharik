import Link from 'next/link'
import ToeflTestSetEditor from '@/components/admin/ToeflTestSetEditor'

export default function NewToeflTestSetPage() {
  return (
    <div className="p-8 pb-24">
      <div className="mx-auto max-w-4xl">
        <Link href="/admin/toefl" className="text-sm font-semibold text-[#08507f] hover:underline">
          &larr; Back to TOEFL dashboard
        </Link>
        <div className="mt-6 mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Create TOEFL test set</h1>
          <p className="mt-2 text-sm text-slate-500">Create a new shareable test set, then configure each section.</p>
        </div>

        <ToeflTestSetEditor mode="create" />
      </div>
    </div>
  )
}
