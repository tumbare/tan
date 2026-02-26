import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Package, MapPin, Heart, LogOut, ChevronRight, User } from 'lucide-react'
import { Container, Section, Button } from '#/components/ui'
import { useAuth } from '#/hooks/useAuth'
import { getMyOrders } from '#/lib/server-functions/auth'
import { formatPrice } from '#/lib/commercetools/client'

export const Route = createFileRoute('/account/')({
  component: AccountPage,
  head: () => ({
    meta: [
      { title: 'My Account | LUXE' },
      { name: 'description', content: 'Manage your LUXE account' },
    ],
  }),
})

function AccountPage() {
  const navigate = useNavigate()
  const { user, isLoading, isAuthenticated, logout, isLoggingOut } = useAuth()

  const { data: ordersData } = useQuery({
    queryKey: ['my-orders', { limit: 3 }],
    queryFn: () => getMyOrders({ data: { limit: 3 } }),
    enabled: isAuthenticated,
  })

  if (isLoading) {
    return (
      <Section>
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="h-10 w-1/3 skeleton rounded mb-8" />
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 skeleton rounded-xl" />
              ))}
            </div>
          </div>
        </Container>
      </Section>
    )
  }

  if (!isAuthenticated || !user) {
    navigate({ to: '/account/login' })
    return null
  }

  const quickLinks = [
    { icon: Package, label: 'My Orders', href: '/account/orders', description: 'View order history' },
    { icon: MapPin, label: 'Addresses', href: '/account/addresses', description: 'Manage addresses' },
    { icon: Heart, label: 'Wishlist', href: '/wishlist', description: 'Saved items' },
  ]

  return (
    <Section className="py-8 md:py-12">
      <Container>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="mb-2">My Account</h1>
              <p className="text-[var(--color-slate)]">
                Welcome back, {user.firstName || user.email.split('@')[0]}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => logout()}
              isLoading={isLoggingOut}
              leftIcon={<LogOut className="w-4 h-4" />}
            >
              Sign Out
            </Button>
          </div>

          {/* Profile card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[var(--color-coral)] text-white flex items-center justify-center text-2xl font-display font-bold">
                {(user.firstName?.[0] || user.email[0]).toUpperCase()}
              </div>
              <div>
                <h2 className="font-display font-semibold text-xl">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.email}
                </h2>
                <p className="text-[var(--color-slate)]">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="w-12 h-12 rounded-full bg-[var(--color-cream)] flex items-center justify-center mb-4 group-hover:bg-[var(--color-coral)] group-hover:text-white transition-colors">
                  <link.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-semibold mb-1">{link.label}</h3>
                <p className="text-sm text-[var(--color-slate)]">{link.description}</p>
              </Link>
            ))}
          </div>

          {/* Recent orders */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-semibold text-xl">Recent Orders</h3>
              <Link
                to="/account/orders"
                className="text-sm font-medium text-[var(--color-coral)] hover:underline"
              >
                View All
              </Link>
            </div>

            {ordersData?.orders && ordersData.orders.length > 0 ? (
              <div className="space-y-4">
                {ordersData.orders.map((order) => (
                  <Link
                    key={order.id}
                    to="/account/orders"
                    search={{ orderId: order.id }}
                    className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-cream)] hover:bg-[var(--color-cream-dark)] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center">
                        <Package className="w-6 h-6 text-[var(--color-slate)]" />
                      </div>
                      <div>
                        <p className="font-medium">
                          Order #{order.orderNumber || order.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-[var(--color-slate)]">
                          {new Date(order.createdAt).toLocaleDateString()} •{' '}
                          {order.lineItems.length} item{order.lineItems.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">
                          {formatPrice(order.totalPrice.value, order.totalPrice.currencyCode)}
                        </p>
                        <p className="text-sm text-[var(--color-slate)] capitalize">
                          {order.orderState.toLowerCase().replace('_', ' ')}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[var(--color-slate)]" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-[var(--color-cream)] mx-auto mb-4 flex items-center justify-center">
                  <Package className="w-8 h-8 text-[var(--color-slate)]" />
                </div>
                <p className="text-[var(--color-slate)] mb-4">No orders yet</p>
                <Link to="/products" className="btn btn-primary btn-sm">
                  Start Shopping
                </Link>
              </div>
            )}
          </div>
        </div>
      </Container>
    </Section>
  )
}
