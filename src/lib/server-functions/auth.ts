import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getCookie, setCookie } from '@tanstack/react-start/server'
import {
  createCustomer,
  authenticateCustomer,
  getCustomerById,
  getCustomerOrders,
  getOrderById,
  createOrderFromCart,
} from '#/lib/commercetools/customer.server'
import { getCartById } from '#/lib/commercetools/cart.server'

const CUSTOMER_COOKIE_NAME = 'customer_id'
const SESSION_COOKIE_NAME = 'session_token'

function generateSessionToken(): string {
  return crypto.randomUUID() + '-' + Date.now().toString(36)
}

async function setAuthCookies(customerId: string) {
  const sessionToken = generateSessionToken()

  await setCookie(CUSTOMER_COOKIE_NAME, customerId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })

  await setCookie(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
}

async function clearAuthCookies() {
  await setCookie(CUSTOMER_COOKIE_NAME, '', { maxAge: 0, path: '/' })
  await setCookie(SESSION_COOKIE_NAME, '', { maxAge: 0, path: '/' })
}

export const register = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      email: z.string().email(),
      password: z.string().min(8),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const result = await createCustomer(data)
    await setAuthCookies(result.customer.id)
    return { customer: result.customer }
  })

export const login = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      email: z.string().email(),
      password: z.string(),
    })
  )
  .handler(async ({ data }) => {
    const result = await authenticateCustomer(data.email, data.password)

    if (!result) {
      throw new Error('Invalid email or password')
    }

    await setAuthCookies(result.customer.id)
    return { customer: result.customer }
  })

export const logout = createServerFn({ method: 'POST' }).handler(async () => {
  await clearAuthCookies()
  return { success: true }
})

export const getCurrentUser = createServerFn({ method: 'GET' }).handler(
  async () => {
    const customerId = await getCookie(CUSTOMER_COOKIE_NAME)
    const sessionToken = await getCookie(SESSION_COOKIE_NAME)

    if (!customerId || !sessionToken) {
      return null
    }

    const customer = await getCustomerById(customerId)
    return customer
  }
)

export const getMyOrders = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      limit: z.number().min(1).max(50).optional(),
      offset: z.number().min(0).optional(),
    })
  )
  .handler(async ({ data }) => {
    const customerId = await getCookie(CUSTOMER_COOKIE_NAME)

    if (!customerId) {
      throw new Error('Not authenticated')
    }

    return getCustomerOrders(customerId, data.limit, data.offset)
  })

export const getOrder = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ orderId: z.string() }))
  .handler(async ({ data }) => {
    const customerId = await getCookie(CUSTOMER_COOKIE_NAME)

    if (!customerId) {
      throw new Error('Not authenticated')
    }

    const order = await getOrderById(data.orderId)

    if (!order) {
      throw new Error('Order not found')
    }

    return order
  })

export const placeOrder = createServerFn({ method: 'POST' }).handler(async () => {
  const cartId = await getCookie('cart_id')

  if (!cartId) {
    throw new Error('No cart found')
  }

  const cart = await getCartById(cartId)

  if (!cart) {
    throw new Error('Cart not found')
  }

  if (cart.lineItems.length === 0) {
    throw new Error('Cart is empty')
  }

  const order = await createOrderFromCart(cart.id, cart.version)

  await setCookie('cart_id', '', { maxAge: 0, path: '/' })
  await setCookie('cart_version', '', { maxAge: 0, path: '/' })

  return order
})
