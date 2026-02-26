import { Link } from '@tanstack/react-router'
import { X, ShoppingBag, ArrowRight } from 'lucide-react'
import { useEffect } from 'react'
import { Button, LinkButton } from '#/components/ui'
import { CartItem } from './CartItem'
import { useCart } from '#/hooks/useCart'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, isLoading, subtotal, updateItem, removeItem, isUpdating, isRemoving } = useCart()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const isEmpty = !cart || cart.lineItems.length === 0

  return (
    <>
      {/* Overlay */}
      <div className="overlay animate-fade-in" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-[var(--z-modal)] animate-slide-in-right shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-cream-dark)]">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5" />
            <h2 className="font-display font-semibold text-lg">Your Cart</h2>
            {cart && cart.lineItems.length > 0 && (
              <span className="bg-[var(--color-charcoal)] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {cart.totalLineItemQuantity}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="btn-ghost p-2 -mr-2 hover:bg-[var(--color-cream)] rounded-full"
            aria-label="Close cart"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="w-24 h-24 rounded-lg skeleton" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 skeleton rounded" />
                    <div className="h-4 w-1/2 skeleton rounded" />
                    <div className="h-8 w-1/3 skeleton rounded mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-[var(--color-cream-dark)] flex items-center justify-center mb-6">
                <ShoppingBag className="w-10 h-10 text-[var(--color-slate)]" />
              </div>
              <h3 className="font-display font-semibold text-xl mb-2">
                Your cart is empty
              </h3>
              <p className="text-[var(--color-slate)] mb-6">
                Looks like you haven't added anything yet
              </p>
              <Button onClick={onClose}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="px-4">
              {cart.lineItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={(id, qty) => updateItem({ lineItemId: id, quantity: qty })}
                  onRemove={(id) => removeItem(id)}
                  isUpdating={isUpdating || isRemoving}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isEmpty && (
          <div className="border-t border-[var(--color-cream-dark)] p-4 space-y-4 bg-[var(--color-cream)]">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-slate)]">Subtotal</span>
              <span className="font-display font-bold text-xl">{subtotal}</span>
            </div>
            <p className="text-sm text-[var(--color-slate)]">
              Shipping and taxes calculated at checkout
            </p>

            {/* Actions */}
            <div className="space-y-3">
              <LinkButton
                href="/checkout"
                variant="accent"
                size="lg"
                className="w-full"
              >
                Checkout
                <ArrowRight className="w-5 h-5" />
              </LinkButton>
              <Link
                to="/cart"
                onClick={onClose}
                className="block text-center text-sm font-medium hover:text-[var(--color-coral)] transition-colors"
              >
                View Full Cart
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
