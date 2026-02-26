import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import {
  ChevronRight,
  Minus,
  Plus,
  Heart,
  Share2,
  Truck,
  Shield,
  RefreshCw,
  Check,
} from 'lucide-react'
import { Container, Section, Button, Badge, ProductGridSkeleton } from '#/components/ui'
import { ProductGallery } from '#/components/product/ProductGallery'
import { ProductCard } from '#/components/product/ProductCard'
import { getProductBySlug, getRelatedProducts } from '#/lib/server-functions/products'
import { formatPrice } from '#/lib/commercetools/client'
import { useCart } from '#/hooks/useCart'
import type { ProductVariantData } from '#/lib/commercetools/types'

export const Route = createFileRoute('/products/$slug')({
  component: ProductDetailPage,
})

function ProductDetailPage() {
  const { slug } = Route.useParams()
  const { addItem, isAdding } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0)
  const [addedToCart, setAddedToCart] = useState(false)

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProductBySlug({ data: { slug } }),
    staleTime: 1000 * 60 * 5,
  })

  const { data: relatedProducts } = useQuery({
    queryKey: ['related-products', product?.id],
    queryFn: () =>
      getRelatedProducts({
        data: {
          productId: product!.id,
          categoryId: product!.categories[0]?.id,
          limit: 4,
        },
      }),
    enabled: !!product,
    staleTime: 1000 * 60 * 5,
  })

  if (isLoading) {
    return (
      <Section>
        <Container>
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="aspect-square rounded-2xl bg-[var(--color-cream-dark)] skeleton" />
            <div className="space-y-6">
              <div className="h-8 w-1/3 skeleton rounded" />
              <div className="h-12 w-2/3 skeleton rounded" />
              <div className="h-6 w-1/4 skeleton rounded" />
              <div className="h-24 skeleton rounded" />
              <div className="h-14 w-full skeleton rounded" />
            </div>
          </div>
        </Container>
      </Section>
    )
  }

  if (!product) {
    return (
      <Section>
        <Container>
          <div className="text-center py-20">
            <h1 className="mb-4">Product Not Found</h1>
            <p className="text-[var(--color-slate)] mb-8">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/products" className="btn btn-primary">
              Browse Products
            </Link>
          </div>
        </Container>
      </Section>
    )
  }

  const selectedVariant = product.variants[selectedVariantIndex]
  const hasDiscount = !!product.price?.discounted
  const currentPrice = hasDiscount
    ? product.price!.discounted!.value
    : selectedVariant.price?.value ?? product.price?.value ?? 0
  const originalPrice = product.price?.value ?? 0
  const currencyCode = product.price?.currencyCode ?? 'USD'
  const isInStock = selectedVariant.availability?.isOnStock ?? true
  const stockQuantity = selectedVariant.availability?.availableQuantity

  const handleAddToCart = () => {
    addItem(
      {
        productId: product.id,
        variantId: selectedVariant.id,
        quantity,
      },
      {
        onSuccess: () => {
          setAddedToCart(true)
          setTimeout(() => setAddedToCart(false), 2000)
        },
      }
    )
  }

  const incrementQuantity = () => setQuantity((q) => Math.min(q + 1, stockQuantity ?? 99))
  const decrementQuantity = () => setQuantity((q) => Math.max(q - 1, 1))

  const allImages = selectedVariant.images.length > 0 ? selectedVariant.images : product.images

  return (
    <>
      <Section className="pt-8 md:pt-12 pb-16">
        <Container>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-[var(--color-slate)] mb-8">
            <Link to="/" className="hover:text-[var(--color-charcoal)] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link
              to="/products"
              className="hover:text-[var(--color-charcoal)] transition-colors"
            >
              Shop
            </Link>
            {product.categories[0] && (
              <>
                <ChevronRight className="w-4 h-4" />
                <Link
                  to="/categories/$slug"
                  params={{ slug: product.categories[0].slug }}
                  className="hover:text-[var(--color-charcoal)] transition-colors"
                >
                  {product.categories[0].name || 'Category'}
                </Link>
              </>
            )}
            <ChevronRight className="w-4 h-4" />
            <span className="text-[var(--color-charcoal)]">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Gallery */}
            <ProductGallery images={allImages} productName={product.name} />

            {/* Product info */}
            <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
              {/* Badges */}
              <div className="flex items-center gap-2">
                {hasDiscount && <Badge variant="sale">Sale</Badge>}
                {!isInStock && <Badge variant="outline">Out of Stock</Badge>}
              </div>

              {/* Title */}
              <div>
                {product.categories[0] && (
                  <p className="text-sm uppercase tracking-wider text-[var(--color-slate)] mb-2">
                    {product.categories[0].name}
                  </p>
                )}
                <h1 className="text-3xl md:text-4xl">{product.name}</h1>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span
                  className={`text-3xl font-display font-bold ${
                    hasDiscount ? 'text-[var(--color-coral)]' : ''
                  }`}
                >
                  {formatPrice(currentPrice, currencyCode)}
                </span>
                {hasDiscount && (
                  <span className="text-xl text-[var(--color-slate)] line-through">
                    {formatPrice(originalPrice, currencyCode)}
                  </span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-[var(--color-slate)] leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Variant selection */}
              {product.variants.length > 1 && (
                <div>
                  <label className="label">Options</label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant, index) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariantIndex(index)}
                        className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                          index === selectedVariantIndex
                            ? 'border-[var(--color-charcoal)] bg-[var(--color-charcoal)] text-white'
                            : 'border-[var(--color-cream-dark)] hover:border-[var(--color-charcoal)]'
                        }`}
                      >
                        {variant.sku || `Option ${index + 1}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity selector */}
              <div>
                <label className="label">Quantity</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-[var(--color-cream-dark)] rounded-lg">
                    <button
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="w-12 h-12 flex items-center justify-center hover:bg-[var(--color-cream)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={incrementQuantity}
                      disabled={quantity >= (stockQuantity ?? 99)}
                      className="w-12 h-12 flex items-center justify-center hover:bg-[var(--color-cream)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {stockQuantity !== undefined && stockQuantity <= 10 && isInStock && (
                    <span className="text-sm text-[var(--color-coral)]">
                      Only {stockQuantity} left in stock
                    </span>
                  )}
                </div>
              </div>

              {/* Add to cart */}
              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  isLoading={isAdding}
                  disabled={!isInStock}
                  variant={addedToCart ? 'accent' : 'primary'}
                >
                  {addedToCart ? (
                    <>
                      <Check className="w-5 h-5" />
                      Added to Cart
                    </>
                  ) : (
                    'Add to Cart'
                  )}
                </Button>
                <Button size="lg" variant="outline" className="px-4">
                  <Heart className="w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" className="px-4">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[var(--color-cream-dark)]">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-cream)] mx-auto mb-2 flex items-center justify-center">
                    <Truck className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-medium">Free Shipping</p>
                  <p className="text-xs text-[var(--color-slate)]">Orders $100+</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-cream)] mx-auto mb-2 flex items-center justify-center">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-medium">Easy Returns</p>
                  <p className="text-xs text-[var(--color-slate)]">30 days</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-cream)] mx-auto mb-2 flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-medium">Secure</p>
                  <p className="text-xs text-[var(--color-slate)]">Payment</p>
                </div>
              </div>

              {/* SKU */}
              {selectedVariant.sku && (
                <p className="text-sm text-[var(--color-slate)]">
                  SKU: {selectedVariant.sku}
                </p>
              )}
            </div>
          </div>
        </Container>
      </Section>

      {/* Related products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <Section className="bg-[var(--color-cream-dark)]">
          <Container>
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-sm font-medium uppercase tracking-[0.15em] text-[var(--color-coral)] mb-2 block">
                  You May Also Like
                </span>
                <h2>Related Products</h2>
              </div>
              <Link
                to="/products"
                className="hidden md:flex items-center gap-2 text-sm font-medium hover:text-[var(--color-coral)] transition-colors"
              >
                View All
              </Link>
            </div>

            <div className="product-grid">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </Container>
        </Section>
      )}
    </>
  )
}
