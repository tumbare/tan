import { Link } from '@tanstack/react-router'
import { Minus, Plus, X, ShoppingBag } from 'lucide-react'
import { formatPrice } from '#/lib/commercetools/client'
import type { CartLineItem } from '#/lib/commercetools/types'

interface CartItemProps {
  item: CartLineItem
  onUpdateQuantity: (lineItemId: string, quantity: number) => void
  onRemove: (lineItemId: string) => void
  isUpdating?: boolean
}

export function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  isUpdating,
}: CartItemProps) {
  const image = item.variant.images[0]

  return (
    <div className={`flex gap-4 py-6 border-b border-[var(--color-cream-dark)] ${isUpdating ? 'opacity-50' : ''}`}>
      {/* Image */}
      <Link
        to="/products/$slug"
        params={{ slug: item.slug }}
        className="shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden bg-[var(--color-cream-dark)]"
      >
        {image ? (
          <img src={image.url} alt={item.name} className="img-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-[var(--color-slate)]" />
          </div>
        )}
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-4">
          <div>
            <Link
              to="/products/$slug"
              params={{ slug: item.slug }}
              className="font-medium hover:text-[var(--color-coral)] transition-colors line-clamp-2"
            >
              {item.name}
            </Link>
            {item.variant.sku && (
              <p className="text-sm text-[var(--color-slate)] mt-1">
                SKU: {item.variant.sku}
              </p>
            )}
          </div>
          <button
            onClick={() => onRemove(item.id)}
            disabled={isUpdating}
            className="shrink-0 w-8 h-8 rounded-full hover:bg-[var(--color-cream-dark)] flex items-center justify-center transition-colors"
            aria-label="Remove item"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-end justify-between mt-4">
          {/* Quantity controls */}
          <div className="flex items-center border border-[var(--color-cream-dark)] rounded-lg">
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1 || isUpdating}
              className="w-9 h-9 flex items-center justify-center hover:bg-[var(--color-cream)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 text-center text-sm font-medium">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              disabled={isUpdating}
              className="w-9 h-9 flex items-center justify-center hover:bg-[var(--color-cream)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="font-display font-semibold">
              {formatPrice(item.totalPrice.value, item.totalPrice.currencyCode)}
            </p>
            {item.quantity > 1 && (
              <p className="text-sm text-[var(--color-slate)]">
                {formatPrice(item.price.value, item.price.currencyCode)} each
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
