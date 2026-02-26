import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Container, Section, Button, ProductGridSkeleton } from '#/components/ui'
import { ProductCard } from '#/components/product/ProductCard'
import { getProducts } from '#/lib/server-functions/products'
import { getCategoryBySlug } from '#/lib/server-functions/categories'
import { z } from 'zod'

const searchSchema = z.object({
  sort: z.string().optional(),
  page: z.coerce.number().optional().default(1),
})

export const Route = createFileRoute('/categories/$slug')({
  validateSearch: searchSchema,
  component: CategoryPage,
})

const sortOptions = [
  { value: 'createdAt desc', label: 'Newest' },
  { value: 'price asc', label: 'Price: Low to High' },
  { value: 'price desc', label: 'Price: High to Low' },
  { value: 'name.en asc', label: 'Name: A to Z' },
]

const ITEMS_PER_PAGE = 12

function CategoryPage() {
  const { slug } = Route.useParams()
  const search = Route.useSearch()
  const navigate = useNavigate()

  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => getCategoryBySlug({ data: { slug } }),
    staleTime: 1000 * 60 * 30,
  })

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['category-products', slug, search],
    queryFn: () =>
      getProducts({
        data: {
          categorySlug: slug,
          sort: search.sort || 'createdAt desc',
          limit: ITEMS_PER_PAGE,
          offset: ((search.page || 1) - 1) * ITEMS_PER_PAGE,
        },
      }),
    staleTime: 1000 * 60 * 2,
    enabled: !!category,
  })

  const updateSearch = (updates: Partial<z.infer<typeof searchSchema>>) => {
    navigate({
      to: '/categories/$slug',
      params: { slug },
      search: (prev) => ({ ...prev, ...updates }),
    })
  }

  const totalPages = Math.ceil((productsData?.total || 0) / ITEMS_PER_PAGE)
  const currentPage = search.page || 1

  if (categoryLoading) {
    return (
      <Section>
        <Container>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-[var(--color-cream-dark)] rounded w-1/4" />
            <div className="h-12 bg-[var(--color-cream-dark)] rounded w-1/2" />
          </div>
        </Container>
      </Section>
    )
  }

  if (!category) {
    return (
      <Section>
        <Container>
          <div className="text-center py-20">
            <h1 className="mb-4">Category Not Found</h1>
            <p className="text-[var(--color-slate)] mb-8">
              The category you're looking for doesn't exist.
            </p>
            <Link to="/products" className="btn btn-primary">
              Browse All Products
            </Link>
          </div>
        </Container>
      </Section>
    )
  }

  return (
    <>
      {/* Breadcrumb and header */}
      <div className="bg-[var(--color-charcoal)] text-white py-16 md:py-24">
        <Container>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/products" className="hover:text-white transition-colors">
              Shop
            </Link>
            {category.ancestors?.map((ancestor) => (
              <span key={ancestor.id} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4" />
                <Link
                  to="/categories/$slug"
                  params={{ slug: ancestor.slug }}
                  className="hover:text-white transition-colors"
                >
                  {ancestor.name}
                </Link>
              </span>
            ))}
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">{category.name}</span>
          </nav>

          <div className="max-w-2xl">
            <h1 className="mb-4">{category.name}</h1>
            {category.description && (
              <p className="text-lg text-white/70">{category.description}</p>
            )}
            <p className="mt-4 text-white/60">
              {productsData?.total
                ? `${productsData.total} products`
                : 'Loading products...'}
            </p>
          </div>
        </Container>
      </div>

      <Section className="py-8 md:py-12">
        <Container>
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 mb-8 pb-6 border-b border-[var(--color-cream-dark)]">
            <p className="text-[var(--color-slate)]">
              Showing{' '}
              {Math.min(
                (currentPage - 1) * ITEMS_PER_PAGE + 1,
                productsData?.total || 0
              )}
              -
              {Math.min(currentPage * ITEMS_PER_PAGE, productsData?.total || 0)}{' '}
              of {productsData?.total || 0} products
            </p>

            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--color-slate)]">Sort by:</span>
              <div className="relative">
                <select
                  value={search.sort || 'createdAt desc'}
                  onChange={(e) => updateSearch({ sort: e.target.value, page: 1 })}
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

          {/* Products grid */}
          {productsLoading ? (
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
              <h3 className="text-xl font-display font-semibold mb-2">
                No products in this category
              </h3>
              <p className="text-[var(--color-slate)] mb-6">
                Check back soon for new arrivals
              </p>
              <Link to="/products" className="btn btn-primary">
                Browse All Products
              </Link>
            </div>
          )}
        </Container>
      </Section>
    </>
  )
}
