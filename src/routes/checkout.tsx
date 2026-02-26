import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Check, ChevronLeft, CreditCard, Truck, ShoppingBag, Lock } from 'lucide-react'
import { Container, Section, Button, Input, Select } from '#/components/ui'
import { useCart } from '#/hooks/useCart'
import { useAuth } from '#/hooks/useAuth'
import { formatPrice } from '#/lib/commercetools/client'
import { setCartShippingAddress, setCartBillingAddress } from '#/lib/server-functions/cart'
import { placeOrder } from '#/lib/server-functions/auth'
import { useMutation, useQueryClient } from '@tanstack/react-query'

type CheckoutStep = 'information' | 'shipping' | 'payment'

export const Route = createFileRoute('/checkout')({
  component: CheckoutPage,
  head: () => ({
    meta: [
      { title: 'Checkout | LUXE' },
      { name: 'description', content: 'Complete your purchase' },
    ],
  }),
})

const countries = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'AU', label: 'Australia' },
]

function CheckoutPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { cart, isLoading: cartLoading, subtotal } = useCart()
  const { user, isAuthenticated } = useAuth()
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('information')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [shippingAddress, setShippingAddress] = useState({
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    streetName: '',
    streetNumber: '',
    city: '',
    region: '',
    postalCode: '',
    country: 'US',
    phone: '',
  })

  const [sameAsBilling, setSameAsBilling] = useState(true)
  const [billingAddress, setBillingAddress] = useState({ ...shippingAddress })

  const saveAddressMutation = useMutation({
    mutationFn: async () => {
      await setCartShippingAddress({ data: shippingAddress })
      if (!sameAsBilling) {
        await setCartBillingAddress({ data: billingAddress })
      } else {
        await setCartBillingAddress({ data: shippingAddress })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  const placeOrderMutation = useMutation({
    mutationFn: () => placeOrder(),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      navigate({ to: '/account/orders', search: { success: order.id } })
    },
  })

  const updateShippingField = (field: string, value: string) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const validateInformation = () => {
    const newErrors: Record<string, string> = {}

    if (!shippingAddress.email) newErrors.email = 'Email is required'
    if (!shippingAddress.firstName) newErrors.firstName = 'First name is required'
    if (!shippingAddress.lastName) newErrors.lastName = 'Last name is required'
    if (!shippingAddress.streetName) newErrors.streetName = 'Address is required'
    if (!shippingAddress.city) newErrors.city = 'City is required'
    if (!shippingAddress.postalCode) newErrors.postalCode = 'Postal code is required'
    if (!shippingAddress.country) newErrors.country = 'Country is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleContinueToShipping = async () => {
    if (!validateInformation()) return

    try {
      await saveAddressMutation.mutateAsync()
      setCurrentStep('shipping')
    } catch (err) {
      console.error('Failed to save address:', err)
    }
  }

  const handleContinueToPayment = () => {
    setCurrentStep('payment')
  }

  const handlePlaceOrder = async () => {
    try {
      await placeOrderMutation.mutateAsync()
    } catch (err) {
      console.error('Failed to place order:', err)
    }
  }

  const steps: { id: CheckoutStep; label: string; icon: typeof Truck }[] = [
    { id: 'information', label: 'Information', icon: ShoppingBag },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'payment', label: 'Payment', icon: CreditCard },
  ]

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep)

  if (cartLoading) {
    return (
      <Section>
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="h-10 w-1/3 skeleton rounded mb-8" />
            <div className="grid lg:grid-cols-5 gap-12">
              <div className="lg:col-span-3 space-y-6">
                <div className="h-12 skeleton rounded" />
                <div className="h-12 skeleton rounded" />
                <div className="h-12 skeleton rounded" />
              </div>
              <div className="lg:col-span-2">
                <div className="h-64 skeleton rounded" />
              </div>
            </div>
          </div>
        </Container>
      </Section>
    )
  }

  if (!cart || cart.lineItems.length === 0) {
    return (
      <Section>
        <Container>
          <div className="max-w-md mx-auto text-center py-20">
            <div className="w-20 h-20 rounded-full bg-[var(--color-cream-dark)] mx-auto mb-6 flex items-center justify-center">
              <ShoppingBag className="w-10 h-10 text-[var(--color-slate)]" />
            </div>
            <h2 className="text-2xl font-display font-semibold mb-4">
              Your cart is empty
            </h2>
            <p className="text-[var(--color-slate)] mb-8">
              Add some items to your cart before checkout
            </p>
            <Link to="/products" className="btn btn-primary">
              Start Shopping
            </Link>
          </div>
        </Container>
      </Section>
    )
  }

  return (
    <Section className="py-8 md:py-12">
      <Container>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/"
              className="font-display font-bold text-2xl tracking-tight"
            >
              LUXE<span className="text-[var(--color-coral)]">.</span>
            </Link>
            <div className="flex items-center gap-2 text-sm text-[var(--color-slate)]">
              <Lock className="w-4 h-4" />
              Secure Checkout
            </div>
          </div>

          {/* Progress steps */}
          <div className="flex items-center justify-center gap-4 mb-12">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => index < currentStepIndex && setCurrentStep(step.id)}
                  disabled={index > currentStepIndex}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    index === currentStepIndex
                      ? 'bg-[var(--color-charcoal)] text-white'
                      : index < currentStepIndex
                      ? 'bg-[var(--color-success)] text-white'
                      : 'bg-[var(--color-cream-dark)] text-[var(--color-slate)]'
                  }`}
                >
                  {index < currentStepIndex ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                  )}
                  <span className="hidden sm:inline font-medium">{step.label}</span>
                </button>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 md:w-16 h-0.5 mx-2 ${
                      index < currentStepIndex
                        ? 'bg-[var(--color-success)]'
                        : 'bg-[var(--color-cream-dark)]'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Main content */}
            <div className="lg:col-span-3">
              {/* Information step */}
              {currentStep === 'information' && (
                <div className="space-y-8">
                  {/* Contact info */}
                  <div>
                    <h2 className="text-xl font-display font-semibold mb-4">
                      Contact Information
                    </h2>
                    {!isAuthenticated && (
                      <p className="text-sm text-[var(--color-slate)] mb-4">
                        Already have an account?{' '}
                        <Link
                          to="/account/login"
                          search={{ redirect: '/checkout' }}
                          className="text-[var(--color-coral)] hover:underline"
                        >
                          Sign in
                        </Link>
                      </p>
                    )}
                    <Input
                      type="email"
                      label="Email"
                      value={shippingAddress.email}
                      onChange={(e) => updateShippingField('email', e.target.value)}
                      error={errors.email}
                      autoComplete="email"
                    />
                  </div>

                  {/* Shipping address */}
                  <div>
                    <h2 className="text-xl font-display font-semibold mb-4">
                      Shipping Address
                    </h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="First Name"
                          value={shippingAddress.firstName}
                          onChange={(e) => updateShippingField('firstName', e.target.value)}
                          error={errors.firstName}
                          autoComplete="given-name"
                        />
                        <Input
                          label="Last Name"
                          value={shippingAddress.lastName}
                          onChange={(e) => updateShippingField('lastName', e.target.value)}
                          error={errors.lastName}
                          autoComplete="family-name"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                          <Input
                            label="Street Address"
                            value={shippingAddress.streetName}
                            onChange={(e) => updateShippingField('streetName', e.target.value)}
                            error={errors.streetName}
                            autoComplete="street-address"
                          />
                        </div>
                        <Input
                          label="Apt/Suite"
                          value={shippingAddress.streetNumber}
                          onChange={(e) => updateShippingField('streetNumber', e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="City"
                          value={shippingAddress.city}
                          onChange={(e) => updateShippingField('city', e.target.value)}
                          error={errors.city}
                          autoComplete="address-level2"
                        />
                        <Input
                          label="State/Province"
                          value={shippingAddress.region}
                          onChange={(e) => updateShippingField('region', e.target.value)}
                          autoComplete="address-level1"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Postal Code"
                          value={shippingAddress.postalCode}
                          onChange={(e) => updateShippingField('postalCode', e.target.value)}
                          error={errors.postalCode}
                          autoComplete="postal-code"
                        />
                        <Select
                          label="Country"
                          value={shippingAddress.country}
                          onChange={(e) => updateShippingField('country', e.target.value)}
                          options={countries}
                          error={errors.country}
                        />
                      </div>
                      <Input
                        label="Phone"
                        type="tel"
                        value={shippingAddress.phone}
                        onChange={(e) => updateShippingField('phone', e.target.value)}
                        autoComplete="tel"
                        hint="For delivery updates"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-6 border-t border-[var(--color-cream-dark)]">
                    <Link
                      to="/cart"
                      className="flex items-center gap-2 text-sm font-medium hover:text-[var(--color-coral)] transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Return to Cart
                    </Link>
                    <Button
                      onClick={handleContinueToShipping}
                      isLoading={saveAddressMutation.isPending}
                    >
                      Continue to Shipping
                    </Button>
                  </div>
                </div>
              )}

              {/* Shipping step */}
              {currentStep === 'shipping' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-display font-semibold mb-4">
                      Shipping Method
                    </h2>
                    <div className="space-y-3">
                      {[
                        { id: 'standard', label: 'Standard Shipping', price: 'Free', time: '5-7 business days' },
                        { id: 'express', label: 'Express Shipping', price: '$12.99', time: '2-3 business days' },
                        { id: 'overnight', label: 'Overnight Shipping', price: '$24.99', time: 'Next business day' },
                      ].map((method) => (
                        <label
                          key={method.id}
                          className="flex items-center justify-between p-4 border-2 border-[var(--color-cream-dark)] rounded-xl cursor-pointer hover:border-[var(--color-charcoal)] transition-colors has-[:checked]:border-[var(--color-charcoal)] has-[:checked]:bg-[var(--color-cream)]"
                        >
                          <div className="flex items-center gap-4">
                            <input
                              type="radio"
                              name="shipping"
                              value={method.id}
                              defaultChecked={method.id === 'standard'}
                              className="w-5 h-5 text-[var(--color-charcoal)]"
                            />
                            <div>
                              <p className="font-medium">{method.label}</p>
                              <p className="text-sm text-[var(--color-slate)]">{method.time}</p>
                            </div>
                          </div>
                          <span className="font-medium">{method.price}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-6 border-t border-[var(--color-cream-dark)]">
                    <button
                      onClick={() => setCurrentStep('information')}
                      className="flex items-center gap-2 text-sm font-medium hover:text-[var(--color-coral)] transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Return to Information
                    </button>
                    <Button onClick={handleContinueToPayment}>
                      Continue to Payment
                    </Button>
                  </div>
                </div>
              )}

              {/* Payment step */}
              {currentStep === 'payment' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-display font-semibold mb-4">
                      Payment Method
                    </h2>
                    <div className="p-6 border-2 border-[var(--color-cream-dark)] rounded-xl">
                      <p className="text-center text-[var(--color-slate)] mb-4">
                        Payment integration would go here
                      </p>
                      <p className="text-center text-sm text-[var(--color-slate)]">
                        (Stripe, PayPal, etc.)
                      </p>
                    </div>
                  </div>

                  {/* Billing address */}
                  <div>
                    <label className="flex items-center gap-3 mb-4">
                      <input
                        type="checkbox"
                        checked={sameAsBilling}
                        onChange={(e) => setSameAsBilling(e.target.checked)}
                        className="w-5 h-5 rounded text-[var(--color-charcoal)]"
                      />
                      <span>Billing address same as shipping</span>
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-6 border-t border-[var(--color-cream-dark)]">
                    <button
                      onClick={() => setCurrentStep('shipping')}
                      className="flex items-center gap-2 text-sm font-medium hover:text-[var(--color-coral)] transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Return to Shipping
                    </button>
                    <Button
                      variant="accent"
                      onClick={handlePlaceOrder}
                      isLoading={placeOrderMutation.isPending}
                    >
                      Place Order
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Order summary */}
            <div className="lg:col-span-2">
              <div className="bg-[var(--color-cream-dark)] rounded-2xl p-6 sticky top-24">
                <h3 className="font-display font-semibold text-lg mb-4">
                  Order Summary
                </h3>

                {/* Items */}
                <div className="space-y-4 mb-6">
                  {cart.lineItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white shrink-0">
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
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--color-charcoal)] text-white text-xs rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-2">{item.name}</p>
                        {item.variant.sku && (
                          <p className="text-xs text-[var(--color-slate)]">
                            {item.variant.sku}
                          </p>
                        )}
                      </div>
                      <span className="text-sm font-medium">
                        {formatPrice(item.totalPrice.value, item.totalPrice.currencyCode)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-2 py-4 border-t border-[var(--color-cream)]">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-slate)]">Subtotal</span>
                    <span>{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-slate)]">Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-slate)]">Tax</span>
                    <span>$0.00</span>
                  </div>
                </div>

                <div className="flex justify-between py-4 border-t border-[var(--color-cream)]">
                  <span className="font-display font-semibold text-lg">Total</span>
                  <span className="font-display font-bold text-xl">{subtotal}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
