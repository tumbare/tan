import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { ShoppingBag, ArrowLeft, Trash2, Tag } from 'lucide-react'
import { Container, Section, Button, LinkButton, Input } from '#/components/ui'
import { CartItem } from '#/components/cart/CartItem'
import { useCart } from '#/hooks/useCart'

export const Route = createFileRoute('/cart')({
  component: CartPage,
  head: () => ({
    meta: [
      { title: 'Shopping Cart | LUXE' },
      { name: 'description', content: 'Review and manage your shopping cart' },
    ],
  }),
})

function CartPage() {
  const {
    cart,
    isLoading,
    subtotal,
    updateItem,
    removeItem,
    applyCode,
    clear,
    isUpdating,
    isRemoving,
  } = useCart()
  const [promoCode, setPromoCode] = useState('')
  const [promoError, setPromoError] = useState('')

  const handleApplyPromo = () => {
    if (!promoCode.trim()) return

    setPromoError('')
    applyCode(promoCode, {
      onError: () => {
        setPromoError('Invalid or expired promo code')
      },
      onSuccess: () => {
        setPromoCode('')
      },
    })
  }

  if (isLoading) {
    return (
      <Section>
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="h-10 w-1/3 skeleton rounded mb-8" />
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-6 py-6 border-b border-[var(--color-cream-dark)]">
                  <div className="w-32 h-32 skeleton rounded-lg" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-2/3 skeleton rounded" />
                    <div className="h-4 w-1/4 skeleton rounded" />
                    <div className="h-10 w-32 skeleton rounded mt-4" />
                  </div>
                  <div className="h-6 w-20 skeleton rounded" />
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>
    )
  }

  const isEmpty = !cart || cart.lineItems.length === 0

  return (
    <Section className="py-8 md:py-12">
      <Container>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="mb-2">Shopping Cart</h1>
              {!isEmpty && (
                <p className="text-[var(--color-slate)]">
                  {cart.totalLineItemQuantity} item{cart.totalLineItemQuantity !== 1 ? 's' : ''} in your cart
                </p>
              )}
            </div>
            <Link
              to="/products"
              className="flex items-center gap-2 text-sm font-medium hover:text-[var(--color-coral)] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>

          {isEmpty ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 rounded-full bg-[var(--color-cream-dark)] mx-auto mb-6 flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-[var(--color-slate)]" />
              </div>
              <h2 className="text-2xl font-display font-semibold mb-4">
                Your cart is empty
              </h2>
              <p className="text-[var(--color-slate)] mb-8 max-w-md mx-auto">
                Looks like you haven't added anything to your cart yet.
                Start shopping to fill it up!
              </p>
              <LinkButton href="/products" size="lg">
                Start Shopping
              </LinkButton>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Cart items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm">
                  {/* Clear cart button */}
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={() => clear()}
                      className="flex items-center gap-2 text-sm text-[var(--color-slate)] hover:text-[var(--color-error)] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear Cart
                    </button>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-[var(--color-cream-dark)]">
                    {cart.lineItems.map((item) => (
                      <CartItem
                        key={item.id}
                        item={item}
                        onUpdateQuantity={(id, qty) =>
                          updateItem({ lineItemId: id, quantity: qty })
                        }
                        onRemove={(id) => removeItem(id)}
                        isUpdating={isUpdating || isRemoving}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Order summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
                  <h3 className="font-display font-semibold text-xl mb-6">
                    Order Summary
                  </h3>

                  {/* Promo code */}
                  <div className="mb-6">
                    <label className="label flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Promo Code
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Enter code"
                        error={promoError}
                      />
                      <Button
                        variant="outline"
                        onClick={handleApplyPromo}
                        disabled={!promoCode.trim()}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>

                  {/* Applied discounts */}
                  {cart.discountCodes.length > 0 && (
                    <div className="mb-6 space-y-2">
                      {cart.discountCodes.map((dc) => (
                        <div
                          key={dc.discountCode.id}
                          className="flex items-center justify-between bg-[var(--color-cream)] px-3 py-2 rounded-lg text-sm"
                        >
                          <span className="font-medium">
                            {dc.discountCode.code}
                          </span>
                          <span className="text-[var(--color-success)]">
                            Applied
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Totals */}
                  <div className="space-y-3 py-4 border-t border-[var(--color-cream-dark)]">
                    <div className="flex justify-between text-[var(--color-slate)]">
                      <span>Subtotal</span>
                      <span>{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-[var(--color-slate)]">
                      <span>Shipping</span>
                      <span>Calculated at checkout</span>
                    </div>
                    <div className="flex justify-between text-[var(--color-slate)]">
                      <span>Tax</span>
                      <span>Calculated at checkout</span>
                    </div>
                  </div>

                  <div className="flex justify-between py-4 border-t border-[var(--color-cream-dark)]">
                    <span className="font-display font-semibold text-lg">
                      Estimated Total
                    </span>
                    <span className="font-display font-bold text-xl">
                      {subtotal}
                    </span>
                  </div>

                  {/* Checkout button */}
                  <LinkButton
                    href="/checkout"
                    variant="accent"
                    size="lg"
                    className="w-full mt-4"
                  >
                    Proceed to Checkout
                  </LinkButton>

                  {/* Trust badges */}
                  <div className="mt-6 pt-6 border-t border-[var(--color-cream-dark)]">
                    <p className="text-xs text-[var(--color-slate)] text-center mb-4">
                      Secure checkout powered by industry-leading encryption
                    </p>
                    <div className="flex justify-center gap-4">
                      <div className="w-12 h-8 bg-[var(--color-cream)] rounded flex items-center justify-center text-xs font-bold">
                        VISA
                      </div>
                      <div className="w-12 h-8 bg-[var(--color-cream)] rounded flex items-center justify-center text-xs font-bold">
                        MC
                      </div>
                      <div className="w-12 h-8 bg-[var(--color-cream)] rounded flex items-center justify-center text-xs font-bold">
                        AMEX
                      </div>
                      <div className="w-12 h-8 bg-[var(--color-cream)] rounded flex items-center justify-center text-xs font-bold">
                        PP
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>
    </Section>
  )
}
