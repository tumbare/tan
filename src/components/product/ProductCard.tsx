import { Link } from '@tanstack/react-router'
import { Heart, ShoppingBag } from 'lucide-react'
import { Badge } from '#/components/ui'
import { formatPrice } from '#/lib/commercetools/client'
import type { ProductData } from '#/lib/commercetools/types'

interface ProductCardProps {
  product: ProductData
  priority?: boolean
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const image = product.images[0]
  const hasDiscount = !!product.price?.discounted
  const currentPrice = hasDiscount
    ? product.price!.discounted!.value
    : product.price?.value ?? 0
  const originalPrice = product.price?.value ?? 0
  const currencyCode = product.price?.currencyCode ?? 'USD'

  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className="card card-hover group block"
    >
      {/* Image container */}
      <div className="relative aspect-product overflow-hidden bg-[var(--color-cream-dark)]">
        {image ? (
          <img
            src={image.url}
            alt={product.name}
            loading={priority ? 'eager' : 'lazy'}
            className="img-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--color-slate)]">
            <ShoppingBag className="w-12 h-12" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {hasDiscount && <Badge variant="sale">Sale</Badge>}
        </div>

        {/* Quick actions */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-[var(--color-coral)] hover:text-white transition-colors"
            aria-label="Add to wishlist"
          >
            <Heart className="w-5 h-5" />
          </button>
        </div>

        {/* Add to cart overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            className="w-full btn bg-white text-[var(--color-charcoal)] hover:bg-[var(--color-cream)] font-medium"
          >
            <ShoppingBag className="w-4 h-4" />
            Quick Add
          </button>
        </div>
      </div>

      {/* Product info */}
      <div className="p-4">
        {/* Category */}
        {product.categories[0] && (
          <p className="text-xs uppercase tracking-wider text-[var(--color-slate)] mb-1">
            {product.categories[0].name || 'Shop'}
          </p>
        )}

        {/* Name */}
        <h3 className="font-medium text-[var(--color-charcoal)] line-clamp-2 mb-2 group-hover:text-[var(--color-coral)] transition-colors">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span
            className={`price price-current ${hasDiscount ? 'price-sale' : ''}`}
          >
            {formatPrice(currentPrice, currencyCode)}
          </span>
          {hasDiscount && (
            <span className="price price-original">
              {formatPrice(originalPrice, currencyCode)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
