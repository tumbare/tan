import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Package, ChevronLeft, ChevronRight, ShoppingBag, Check } from 'lucide-react'
import { Container, Section, Button } from '#/components/ui'
import { useAuth } from '#/hooks/useAuth'
import { getMyOrders, getOrder } from '#/lib/server-functions/auth'
import { formatPrice } from '#/lib/commercetools/client'
import { z } from 'zod'

const searchSchema = z.object({
  orderId: z.string().optional(),
  success: z.string().optional(),
  page: z.coerce.number().optional().default(1),
})

export const Route = createFileRoute('/account/orders')({
  validateSearch: searchSchema,
  component: OrdersPage,
  head: () => ({
    meta: [
      { title: 'My Orders | LUXE' },
      { name: 'description', content: 'View your order history' },
    ],
  }),
})

const ITEMS_PER_PAGE = 10

function OrdersPage() {
  const navigate = useNavigate()
  const search = Route.useSearch()
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['my-orders', search.page],
    queryFn: () =>
      getMyOrders({
        data: {
          limit: ITEMS_PER_PAGE,
          offset: ((search.page || 1) - 1) * ITEMS_PER_PAGE,
        },
      }),
    enabled: isAuthenticated,
  })

  const { data: selectedOrder } = useQuery({
    queryKey: ['order', search.orderId],
    queryFn: () => getOrder({ data: { orderId: search.orderId! } }),
    enabled: !!search.orderId && isAuthenticated,
  })

  if (authLoading) {
    return (
      <Section>
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="h-10 w-1/3 skeleton rounded mb-8" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 skeleton rounded-xl" />
              ))}
            </div>
          </div>
        </Container>
      </Section>
    )
  }

  if (!isAuthenticated) {
    navigate({ to: '/account/login', search: { redirect: '/account/orders' } })
    return null
  }

  const totalPages = Math.ceil((ordersData?.total || 0) / ITEMS_PER_PAGE)
  const currentPage = search.page || 1

  return (
    <Section className="py-8 md:py-12">
      <Container>
        <div className="max-w-4xl mx-auto">
          {/* Success message */}
          {search.success && (
            <div className="mb-8 p-6 bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-success)] text-white flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-[var(--color-success)]">
                    Order placed successfully!
                  </p>
                  <p className="text-sm text-[var(--color-slate)]">
                    Order ID: {search.success.slice(0, 8)}...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              to="/account"
              className="btn-ghost p-2 hover:bg-[var(--color-cream-dark)] rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1>My Orders</h1>
          </div>

          {/* Order detail view */}
          {selectedOrder ? (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-[var(--color-cream-dark)]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-[var(--color-slate)]">Order</p>
                    <p className="font-display font-semibold text-xl">
                      #{selectedOrder.orderNumber || selectedOrder.id.slice(0, 8)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate({ to: '/account/orders' })}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Orders
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-[var(--color-slate)]">Date</p>
                    <p className="font-medium">
                      {new Date(selectedOrder.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--color-slate)]">Status</p>
                    <p className="font-medium capitalize">
                      {selectedOrder.orderState.toLowerCase().replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--color-slate)]">Payment</p>
                    <p className="font-medium capitalize">
                      {selectedOrder.paymentState?.toLowerCase() || 'Pending'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--color-slate)]">Total</p>
                    <p className="font-medium">
                      {formatPrice(
                        selectedOrder.totalPrice.value,
                        selectedOrder.totalPrice.currencyCode
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="p-6">
                <h3 className="font-display font-semibold mb-4">Items</h3>
                <div className="space-y-4">
                  {selectedOrder.lineItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 bg-[var(--color-cream)] rounded-xl"
                    >
                      <div className="w-16 h-16 rounded-lg bg-white overflow-hidden">
                        {item.variant.images[0] ? (
                          <img
                            src={item.variant.images[0].url}
                            alt={item.name}
                            className="img-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-[var(--color-slate)]" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium line-clamp-1">{item.name}</p>
                        <p className="text-sm text-[var(--color-slate)]">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatPrice(item.totalPrice.value, item.totalPrice.currencyCode)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Addresses */}
              {(selectedOrder.shippingAddress || selectedOrder.billingAddress) && (
                <div className="p-6 border-t border-[var(--color-cream-dark)]">
                  <div className="grid md:grid-cols-2 gap-6">
                    {selectedOrder.shippingAddress && (
                      <div>
                        <h4 className="font-medium mb-2">Shipping Address</h4>
                        <p className="text-sm text-[var(--color-slate)]">
                          {selectedOrder.shippingAddress.firstName}{' '}
                          {selectedOrder.shippingAddress.lastName}
                          <br />
                          {selectedOrder.shippingAddress.streetName}{' '}
                          {selectedOrder.shippingAddress.streetNumber}
                          <br />
                          {selectedOrder.shippingAddress.city},{' '}
                          {selectedOrder.shippingAddress.region}{' '}
                          {selectedOrder.shippingAddress.postalCode}
                          <br />
                          {selectedOrder.shippingAddress.country}
                        </p>
                      </div>
                    )}
                    {selectedOrder.billingAddress && (
                      <div>
                        <h4 className="font-medium mb-2">Billing Address</h4>
                        <p className="text-sm text-[var(--color-slate)]">
                          {selectedOrder.billingAddress.firstName}{' '}
                          {selectedOrder.billingAddress.lastName}
                          <br />
                          {selectedOrder.billingAddress.streetName}{' '}
                          {selectedOrder.billingAddress.streetNumber}
                          <br />
                          {selectedOrder.billingAddress.city},{' '}
                          {selectedOrder.billingAddress.region}{' '}
                          {selectedOrder.billingAddress.postalCode}
                          <br />
                          {selectedOrder.billingAddress.country}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Orders list */}
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 skeleton rounded-xl" />
                  ))}
                </div>
              ) : ordersData?.orders && ordersData.orders.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {ordersData.orders.map((order) => (
                      <button
                        key={order.id}
                        onClick={() =>
                          navigate({
                            to: '/account/orders',
                            search: { orderId: order.id },
                          })
                        }
                        className="w-full flex items-center justify-between p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-[var(--color-cream)] flex items-center justify-center">
                            <Package className="w-6 h-6 text-[var(--color-slate)]" />
                          </div>
                          <div>
                            <p className="font-medium">
                              Order #{order.orderNumber || order.id.slice(0, 8)}
                            </p>
                            <p className="text-sm text-[var(--color-slate)]">
                              {new Date(order.createdAt).toLocaleDateString()} •{' '}
                              {order.lineItems.length} item
                              {order.lineItems.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium">
                              {formatPrice(
                                order.totalPrice.value,
                                order.totalPrice.currencyCode
                              )}
                            </p>
                            <span
                              className={`text-sm capitalize ${
                                order.orderState === 'Complete'
                                  ? 'text-[var(--color-success)]'
                                  : 'text-[var(--color-slate)]'
                              }`}
                            >
                              {order.orderState.toLowerCase().replace('_', ' ')}
                            </span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-[var(--color-slate)]" />
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() =>
                          navigate({
                            to: '/account/orders',
                            search: { page: currentPage - 1 },
                          })
                        }
                      >
                        Previous
                      </Button>
                      <span className="px-4 text-sm text-[var(--color-slate)]">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() =>
                          navigate({
                            to: '/account/orders',
                            search: { page: currentPage + 1 },
                          })
                        }
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
                  <div className="w-20 h-20 rounded-full bg-[var(--color-cream)] mx-auto mb-6 flex items-center justify-center">
                    <Package className="w-10 h-10 text-[var(--color-slate)]" />
                  </div>
                  <h3 className="font-display font-semibold text-xl mb-2">
                    No orders yet
                  </h3>
                  <p className="text-[var(--color-slate)] mb-6">
                    When you place an order, it will appear here
                  </p>
                  <Link to="/products" className="btn btn-primary">
                    Start Shopping
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </Container>
    </Section>
  )
}
