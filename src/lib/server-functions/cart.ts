import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getCookie, setCookie } from '@tanstack/react-start/server'
import {
  createCart,
  getCartById,
  addLineItem,
  updateLineItemQuantity,
  removeLineItem,
  applyDiscountCode,
  setShippingAddress,
  setBillingAddress,
  deleteCart,
} from '#/lib/commercetools/cart.server'
import type { CartData } from '#/lib/commercetools/types'

const CART_COOKIE_NAME = 'cart_id'
const CART_VERSION_COOKIE_NAME = 'cart_version'

async function getOrCreateCart(): Promise<CartData> {
  const cartId = await getCookie(CART_COOKIE_NAME)

  if (cartId) {
    const cart = await getCartById(cartId)
    if (cart) {
      return cart
    }
  }

  const newCart = await createCart()
  await setCookie(CART_COOKIE_NAME, newCart.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
  await setCookie(CART_VERSION_COOKIE_NAME, String(newCart.version), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })

  return newCart
}

async function updateCartVersion(version: number) {
  await setCookie(CART_VERSION_COOKIE_NAME, String(version), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
}

export const getCart = createServerFn({ method: 'GET' }).handler(async () => {
  const cartId = await getCookie(CART_COOKIE_NAME)

  if (!cartId) {
    return null
  }

  return getCartById(cartId)
})

export const addToCart = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      productId: z.string(),
      variantId: z.number(),
      quantity: z.number().min(1).default(1),
    })
  )
  .handler(async ({ data }) => {
    const cart = await getOrCreateCart()
    const updatedCart = await addLineItem(
      cart.id,
      cart.version,
      data.productId,
      data.variantId,
      data.quantity
    )
    await updateCartVersion(updatedCart.version)
    return updatedCart
  })

export const updateCartItem = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      lineItemId: z.string(),
      quantity: z.number().min(0),
    })
  )
  .handler(async ({ data }) => {
    const cart = await getOrCreateCart()

    if (data.quantity === 0) {
      const updatedCart = await removeLineItem(cart.id, cart.version, data.lineItemId)
      await updateCartVersion(updatedCart.version)
      return updatedCart
    }

    const updatedCart = await updateLineItemQuantity(
      cart.id,
      cart.version,
      data.lineItemId,
      data.quantity
    )
    await updateCartVersion(updatedCart.version)
    return updatedCart
  })

export const removeFromCart = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ lineItemId: z.string() }))
  .handler(async ({ data }) => {
    const cart = await getOrCreateCart()
    const updatedCart = await removeLineItem(cart.id, cart.version, data.lineItemId)
    await updateCartVersion(updatedCart.version)
    return updatedCart
  })

export const applyPromoCode = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ code: z.string() }))
  .handler(async ({ data }) => {
    const cart = await getOrCreateCart()
    const updatedCart = await applyDiscountCode(cart.id, cart.version, data.code)
    await updateCartVersion(updatedCart.version)
    return updatedCart
  })

const addressSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  streetName: z.string().optional(),
  streetNumber: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  country: z.string(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
})

export const setCartShippingAddress = createServerFn({ method: 'POST' })
  .inputValidator(addressSchema)
  .handler(async ({ data }) => {
    const cart = await getOrCreateCart()
    const updatedCart = await setShippingAddress(cart.id, cart.version, data)
    await updateCartVersion(updatedCart.version)
    return updatedCart
  })

export const setCartBillingAddress = createServerFn({ method: 'POST' })
  .inputValidator(addressSchema)
  .handler(async ({ data }) => {
    const cart = await getOrCreateCart()
    const updatedCart = await setBillingAddress(cart.id, cart.version, data)
    await updateCartVersion(updatedCart.version)
    return updatedCart
  })

export const clearCart = createServerFn({ method: 'POST' }).handler(async () => {
  const cartId = await getCookie(CART_COOKIE_NAME)
  const cartVersion = await getCookie(CART_VERSION_COOKIE_NAME)

  if (cartId && cartVersion) {
    try {
      await deleteCart(cartId, parseInt(cartVersion, 10))
    } catch {
      // Cart may already be deleted
    }
  }

  await setCookie(CART_COOKIE_NAME, '', { maxAge: 0, path: '/' })
  await setCookie(CART_VERSION_COOKIE_NAME, '', { maxAge: 0, path: '/' })

  return null
})
