import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { SlidersHorizontal, Grid, List, ChevronDown, X } from 'lucide-react'
import { Container, Section, Button, ProductGridSkeleton } from '#/components/ui'
import { ProductCard } from '#/components/product/ProductCard'
import { getProducts } from '#/lib/server-functions/products'
import { getAllCategories } from '#/lib/server-functions/categories'
import { z } from 'zod'

const searchSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  sort: z.string().optional(),
  priceMin: z.coerce.number().optional(),
  priceMax: z.coerce.number().optional(),
  page: z.coerce.number().optional().default(1),
})

export const Route = createFileRoute('/products/')({
  validateSearch: searchSchema,
  component: ProductListingPage,
  head: () => ({
    meta: [
      { title: 'Shop All Products | LUXE' },
      { name: 'description', content: 'Browse our curated collection of premium products. Filter by category, price, and more.' },
    ],
  }),
})

const sortOptions = [
  { value: 'createdAt desc', label: 'Newest' },
  { value: 'price asc', label: 'Price: Low to High' },
  { value: 'price desc', label: 'Price: High to Low' },
  { value: 'name.en asc', label: 'Name: A to Z' },
]

const ITEMS_PER_PAGE = 12

function ProductListingPage() {
  const navigate = useNavigate()
  const search = Route.useSearch()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', search],
    queryFn: () =>
      getProducts({
        data: {
          search: search.search,
          categoryId: search.category,
          sort: search.sort || 'createdAt desc',
          priceMin: search.priceMin,
          priceMax: search.priceMax,
          limit: ITEMS_PER_PAGE,
          offset: ((search.page || 1) - 1) * ITEMS_PER_PAGE,
        },
      }),
    staleTime: 1000 * 60 * 2,
  })

  const { data: categories } = useQuery({
    queryKey: ['all-categories'],
    queryFn: () => getAllCategories(),
    staleTime: 1000 * 60 * 30,
  })

  const updateSearch = (updates: Partial<z.infer<typeof searchSchema>>) => {
    navigate({
      to: '/products',
      search: (prev) => ({ ...prev, ...updates, page: updates.page ?? 1 }),
    })
  }

  const clearFilters = () => {
    navigate({ to: '/products', search: {} })
  }

  const hasActiveFilters = search.category || search.priceMin || search.priceMax || search.search

  const totalPages = Math.ceil((productsData?.total || 0) / ITEMS_PER_PAGE)
  const currentPage = search.page || 1

  return (
    <>
      {/* Page header */}
      <div className="bg-[var(--color-charcoal)] text-white py-16 md:py-24">
        <Container>
          <div className="max-w-2xl">
            <h1 className="mb-4">
              {search.search ? `Results for "${search.search}"` : 'All Products'}
            </h1>
            <p className="text-lg text-white/70">
              {productsData?.total
                ? `${productsData.total} products found`
                : 'Discover our curated collection'}
            </p>
          </div>
        </Container>
      </div>

      <Section className="py-8 md:py-12">
        <Container>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar filters - Desktop */}
            <aside className="hidden lg:block w-64 shrink-0">
              <FilterSidebar
                categories={categories || []}
                selectedCategory={search.category}
                priceMin={search.priceMin}
                priceMax={search.priceMax}
                onCategoryChange={(category) => updateSearch({ category })}
                onPriceChange={(min, max) =>
                  updateSearch({ priceMin: min, priceMax: max })
                }
                onClearFilters={clearFilters}
                hasActiveFilters={!!hasActiveFilters}
              />
            </aside>

            {/* Main content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-[var(--color-cream-dark)]">
                {/* Mobile filter button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setFiltersOpen(true)}
                  leftIcon={<SlidersHorizontal className="w-4 h-4" />}
                >
                  Filters
                  {hasActiveFilters && (
                    <span className="ml-1 w-2 h-2 bg-[var(--color-coral)] rounded-full" />
                  )}
                </Button>

                {/* Sort dropdown */}
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-sm text-[var(--color-slate)]">Sort by:</span>
                  <div className="relative">
                    <select
                      value={search.sort || 'createdAt desc'}
                      onChange={(e) => updateSearch({ sort: e.target.value })}
                      className="appearance-none bg-transparent text-sm font-medium pr-6 cursor-pointer focus:outline-none"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Active filters */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <span className="text-sm text-[var(--color-slate)]">Active filters:</span>
                  {search.search && (
                    <FilterTag
                      label={`Search: ${search.search}`}
                      onRemove={() => updateSearch({ search: undefined })}
                    />
                  )}
                  {search.category && (
                    <FilterTag
                      label={categories?.find((c) => c.id === search.category)?.name || 'Category'}
                      onRemove={() => updateSearch({ category: undefined })}
                    />
                  )}
                  {(search.priceMin || search.priceMax) && (
                    <FilterTag
                      label={`$${search.priceMin || 0} - $${search.priceMax || '∞'}`}
                      onRemove={() => updateSearch({ priceMin: undefined, priceMax: undefined })}
                    />
                  )}
                  <button
                    onClick={clearFilters}
                    className="text-sm text-[var(--color-coral)] hover:underline"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {/* Products grid */}
              {isLoading ? (
                <ProductGridSkeleton count={ITEMS_PER_PAGE} />
              ) : productsData?.results && productsData.results.length > 0 ? (
                <>
                  <div className="product-grid">
                    {productsData.results.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-12">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => updateSearch({ page: currentPage - 1 })}
                      >
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum: number
                          if (totalPages <= 5) {
                            pageNum = i + 1
                          } else if (currentPage <= 3) {
                            pageNum = i + 1
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i
                          } else {
                            pageNum = currentPage - 2 + i
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => updateSearch({ page: pageNum })}
                              className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                                pageNum === currentPage
                                  ? 'bg-[var(--color-charcoal)] text-white'
                                  : 'hover:bg-[var(--color-cream-dark)]'
                              }`}
                            >
                              {pageNum}
                            </button>
                          )
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => updateSearch({ page: currentPage + 1 })}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[var(--color-cream-dark)] flex items-center justify-center">
                    <Grid className="w-10 h-10 text-[var(--color-slate)]" />
                  </div>
                  <h3 className="text-xl font-display font-semibold mb-2">No products found</h3>
                  <p className="text-[var(--color-slate)] mb-6">
                    Try adjusting your filters or search terms
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Container>
      </Section>

      {/* Mobile filters drawer */}
      {filtersOpen && (
        <MobileFiltersDrawer
          categories={categories || []}
          selectedCategory={search.category}
          priceMin={search.priceMin}
          priceMax={search.priceMax}
          onCategoryChange={(category) => updateSearch({ category })}
          onPriceChange={(min, max) => updateSearch({ priceMin: min, priceMax: max })}
          onClearFilters={clearFilters}
          hasActiveFilters={!!hasActiveFilters}
          onClose={() => setFiltersOpen(false)}
        />
      )}
    </>
  )
}

interface FilterSidebarProps {
  categories: Array<{ id: string; name: string; slug: string }>
  selectedCategory?: string
  priceMin?: number
  priceMax?: number
  onCategoryChange: (id?: string) => void
  onPriceChange: (min?: number, max?: number) => void
  onClearFilters: () => void
  hasActiveFilters: boolean
}

function FilterSidebar({
  categories,
  selectedCategory,
  priceMin,
  priceMax,
  onCategoryChange,
  onPriceChange,
  onClearFilters,
  hasActiveFilters,
}: FilterSidebarProps) {
  const [localPriceMin, setLocalPriceMin] = useState(priceMin?.toString() || '')
  const [localPriceMax, setLocalPriceMax] = useState(priceMax?.toString() || '')

  const applyPriceFilter = () => {
    onPriceChange(
      localPriceMin ? Number(localPriceMin) : undefined,
      localPriceMax ? Number(localPriceMax) : undefined
    )
  }

  return (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h4 className="font-display font-semibold mb-4">Categories</h4>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => onCategoryChange(undefined)}
              className={`text-sm transition-colors ${
                !selectedCategory
                  ? 'text-[var(--color-coral)] font-medium'
                  : 'text-[var(--color-slate)] hover:text-[var(--color-charcoal)]'
              }`}
            >
              All Products
            </button>
          </li>
          {categories.map((category) => (
            <li key={category.id}>
              <button
                onClick={() => onCategoryChange(category.id)}
                className={`text-sm transition-colors ${
                  selectedCategory === category.id
                    ? 'text-[var(--color-coral)] font-medium'
                    : 'text-[var(--color-slate)] hover:text-[var(--color-charcoal)]'
                }`}
              >
                {category.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price range */}
      <div>
        <h4 className="font-display font-semibold mb-4">Price Range</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={localPriceMin}
            onChange={(e) => setLocalPriceMin(e.target.value)}
            className="input py-2 px-3 text-sm w-full"
            min="0"
          />
          <span className="text-[var(--color-slate)]">—</span>
          <input
            type="number"
            placeholder="Max"
            value={localPriceMax}
            onChange={(e) => setLocalPriceMax(e.target.value)}
            className="input py-2 px-3 text-sm w-full"
            min="0"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-3"
          onClick={applyPriceFilter}
        >
          Apply
        </Button>
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" className="w-full" onClick={onClearFilters}>
          Clear All Filters
        </Button>
      )}
    </div>
  )
}

function MobileFiltersDrawer({
  categories,
  selectedCategory,
  priceMin,
  priceMax,
  onCategoryChange,
  onPriceChange,
  onClearFilters,
  hasActiveFilters,
  onClose,
}: FilterSidebarProps & { onClose: () => void }) {
  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white z-[var(--z-modal)] animate-slide-in-right shadow-2xl">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-[var(--color-cream-dark)]">
            <h3 className="font-display font-semibold text-lg">Filters</h3>
            <button
              onClick={onClose}
              className="btn-ghost p-2 -mr-2 hover:bg-[var(--color-cream)] rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <FilterSidebar
              categories={categories}
              selectedCategory={selectedCategory}
              priceMin={priceMin}
              priceMax={priceMax}
              onCategoryChange={(id) => {
                onCategoryChange(id)
                onClose()
              }}
              onPriceChange={(min, max) => {
                onPriceChange(min, max)
                onClose()
              }}
              onClearFilters={() => {
                onClearFilters()
                onClose()
              }}
              hasActiveFilters={hasActiveFilters}
            />
          </div>
          <div className="p-4 border-t border-[var(--color-cream-dark)]">
            <Button className="w-full" onClick={onClose}>
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--color-cream-dark)] rounded-full text-sm">
      {label}
      <button
        onClick={onRemove}
        className="hover:text-[var(--color-coral)] transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </span>
  )
}
