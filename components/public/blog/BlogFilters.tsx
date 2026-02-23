'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState, useEffect } from 'react'
import { Search } from 'lucide-react'

interface Category {
    id: string
    name: string
    slug: string
}

interface BlogFiltersProps {
    categories: Category[]
}

export default function BlogFilters({ categories }: BlogFiltersProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const currentCategory = searchParams.get('category')
    const currentQ = searchParams.get('q')

    const [inputValue, setInputValue] = useState(currentQ || '')

    useEffect(() => {
        setInputValue(currentQ || '')
    }, [currentQ])

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString())
            if (value) {
                params.set(name, value)
            } else {
                params.delete(name)
            }
            params.delete('page') // Reset page on filter change
            return params.toString()
        },
        [searchParams]
    )

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        // only push if there is actual input or if we are clearing a previous search
        router.push(pathname + '?' + createQueryString('q', inputValue))
    }

    const handleCategoryClick = (slug: string) => {
        const newCategory = currentCategory === slug ? '' : slug
        router.push(pathname + '?' + createQueryString('category', newCategory))
    }

    return (
        <div className="mb-10 space-y-6">
            <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search articles..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                    />
                </div>
                <button
                    type="submit"
                    className="px-6 py-2 bg-[#08507f] text-white font-medium rounded-lg hover:bg-[#074066] transition-colors"
                >
                    Search
                </button>
            </form>

            {categories.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                        onClick={() => handleCategoryClick('')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${!currentCategory
                                ? 'bg-[#08507f] text-white border border-[#08507f]'
                                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        All Fields
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat.slug)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${currentCategory === cat.slug
                                    ? 'bg-[#08507f] text-white border border-[#08507f]'
                                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
