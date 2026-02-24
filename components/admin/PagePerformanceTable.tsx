'use client'

import { useState } from 'react'
import Link from 'next/link'

const PAGE_SIZE = 10

interface PageRow {
    title: string
    path: string
    views: number
    visitors: number
    leads: number
    conversionRate: number
}

interface Props {
    data: PageRow[]
    csvRows: (string | number)[][]
    fromStr: string
    toStr: string
}

export default function PagePerformanceTable({ data, csvRows, fromStr, toStr }: Props) {
    const [page, setPage] = useState(1)

    const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE))
    const safePage = Math.min(Math.max(page, 1), totalPages)
    const start = (safePage - 1) * PAGE_SIZE
    const visible = data.slice(start, start + PAGE_SIZE)

    // CSV download helper (inline, no extra dep)
    function downloadCsv() {
        const headers = ['Page', 'Path', 'Views', 'Visitors', 'Leads', 'Conv. Rate']
        const lines = [headers, ...csvRows].map(row =>
            row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        )
        const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `page-performance-${fromStr}_to_${toStr}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-700">Page Performance</h2>
                <button
                    onClick={downloadCsv}
                    className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                    Export CSV
                </button>
            </div>

            {data.length === 0 ? (
                <p className="text-sm text-gray-400">No page performance data in this period.</p>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 border-b border-gray-100">
                                    <th className="py-2 pr-4 font-medium">Page</th>
                                    <th className="py-2 pr-4 font-medium text-right">Views</th>
                                    <th className="py-2 pr-4 font-medium text-right">Visitors</th>
                                    <th className="py-2 pr-4 font-medium text-right">Leads</th>
                                    <th className="py-2 font-medium text-right">Conv. Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visible.map(row => (
                                    <tr key={row.path} className="border-b border-gray-50">
                                        <td className="py-2 pr-4">
                                            <Link
                                                href={row.path}
                                                target="_blank"
                                                className="text-gray-700 hover:text-[#08507f] truncate inline-block max-w-[420px]"
                                                title={row.path}
                                            >
                                                {row.title}
                                            </Link>
                                        </td>
                                        <td className="py-2 pr-4 text-right font-semibold text-gray-900">{row.views.toLocaleString()}</td>
                                        <td className="py-2 pr-4 text-right font-semibold text-gray-900">{row.visitors.toLocaleString()}</td>
                                        <td className="py-2 pr-4 text-right font-semibold text-gray-900">{row.leads.toLocaleString()}</td>
                                        <td className="py-2 text-right font-semibold text-gray-900">{row.conversionRate.toFixed(1)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-end gap-3 text-sm">
                            <button
                                onClick={() => setPage(p => Math.max(p - 1, 1))}
                                disabled={safePage <= 1}
                                className="text-gray-600 hover:text-[#08507f] disabled:text-gray-300 cursor-pointer disabled:cursor-default"
                            >
                                Previous
                            </button>
                            <span className="text-gray-500">Page {safePage} of {totalPages}</span>
                            <button
                                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                                disabled={safePage >= totalPages}
                                className="text-gray-600 hover:text-[#08507f] disabled:text-gray-300 cursor-pointer disabled:cursor-default"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
