import { getApiRoot, getLocalizedValue, DEFAULT_LOCALE, DEFAULT_CURRENCY } from './client'
import type { CartData, CartLineItem } from './types'
import type { Cart, LineItem } from '@commercetools/platform-sdk'

function transformLineItem(lineItem: LineItem, locale: string = DEFAULT_LOCALE): CartLineItem {
  return {
    id: lineItem.id,
    productId: lineItem.productId,
    name: getLocalizedValue(lineItem.name, locale),
    slug: getLocalizedValue(lineItem.productSlug || {}, locale),
    quantity: lineItem.quantity,
    price: {
      value: lineItem.price.value.centAmount,
      currencyCode: lineItem.price.value.currencyCode,
    },
    totalPrice: {
      value: lineItem.totalPrice.centAmount,
      currencyCode: lineItem.totalPrice.currencyCode,
    },
    variant: {
      id: lineItem.variant.id,
      sku: lineItem.variant.sku,
      images: lineItem.variant.images || [],
      attributes: (lineItem.variant.attributes || []).reduce((acc, attr) => {
        acc[attr.name] = attr.value
        return acc
      }, {} as Record<string, unknown>),
    },
  }
}

function transformCart(cart: Cart, locale: string = DEFAULT_LOCALE): CartData {
  return {
    id: cart.id,
    version: cart.version,
    lineItems: cart.lineItems.map(li => transformLineItem(li, locale)),
    totalPrice: {
      value: cart.totalPrice.centAmount,
      currencyCode: cart.totalPrice.currencyCode,
    },
    totalLineItemQuantity: cart.totalLineItemQuantity || 0,
    discountCodes: (cart.discountCodes || []).map(dc => ({
      discountCode: {
        id: dc.discountCode.id,
        code: '',
      },
      state: dc.state,
    })),
    shippingAddress: cart.shippingAddress,
    billingAddress: cart.billingAddress,
    shippingInfo: cart.shippingInfo ? {
      shippingMethodName: cart.shippingInfo.shippingMethodName,
      price: {
        value: cart.shippingInfo.price.centAmount,
        currencyCode: cart.shippingInfo.price.currencyCode,
      },
    } : undefined,
  }
}

export async function createCart(customerId?: string): Promise<CartData> {
  const apiRoot = getApiRoot()

  const cartDraft: { currency: string; customerId?: string } = {
    currency: DEFAULT_CURRENCY,
  }

  if (customerId) {
    cartDraft.customerId = customerId
  }

  const response = await apiRoot
    .carts()
    .post({ body: cartDraft })
    .execute()

  return transformCart(response.body)
}

export async function getCartById(cartId: string): Promise<CartData | null> {
  const apiRoot = getApiRoot()

  try {
    const response = await apiRoot
      .carts()
      .withId({ ID: cartId })
      .get()
      .execute()

    return transformCart(response.body)
  } catch {
    return null
  }
}

export async function getCartByCustomerId(customerId: string): Promise<CartData | null> {
  const apiRoot = getApiRoot()

  try {
    const response = await apiRoot
      .carts()
      .withCustomerId({ customerId })
      .get()
      .execute()

    return transformCart(response.body)
  } catch {
    return null
  }
}

export async function addLineItem(
  cartId: string,
  version: number,
  productId: string,
  variantId: number,
  quantity: number = 1
): Promise<CartData> {
  const apiRoot = getApiRoot()

  const response = await apiRoot
    .carts()
    .withId({ ID: cartId })
    .post({
      body: {
        version,
        actions: [
          {
            action: 'addLineItem',
            productId,
            variantId,
            quantity,
          },
        ],
      },
    })
    .execute()

  return transformCart(response.body)
}

export async function updateLineItemQuantity(
  cartId: string,
  version: number,
  lineItemId: string,
  quantity: number
): Promise<CartData> {
  const apiRoot = getApiRoot()

  const response = await apiRoot
    .carts()
    .withId({ ID: cartId })
    .post({
      body: {
        version,
        actions: [
          {
            action: 'changeLineItemQuantity',
            lineItemId,
            quantity,
          },
        ],
      },
    })
    .execute()

  return transformCart(response.body)
}

export async function removeLineItem(
  cartId: string,
  version: number,
  lineItemId: string
): Promise<CartData> {
  const apiRoot = getApiRoot()

  const response = await apiRoot
    .carts()
    .withId({ ID: cartId })
    .post({
      body: {
        version,
        actions: [
          {
            action: 'removeLineItem',
            lineItemId,
          },
        ],
      },
    })
    .execute()

  return transformCart(response.body)
}

export async function applyDiscountCode(
  cartId: string,
  version: number,
  code: string
): Promise<CartData> {
  const apiRoot = getApiRoot()

  const response = await apiRoot
    .carts()
    .withId({ ID: cartId })
    .post({
      body: {
        version,
        actions: [
          {
            action: 'addDiscountCode',
            code,
          },
        ],
      },
    })
    .execute()

  return transformCart(response.body)
}

export async function setShippingAddress(
  cartId: string,
  version: number,
  address: {
    firstName?: string
    lastName?: string
    streetName?: string
    streetNumber?: string
    postalCode?: string
    city?: string
    region?: string
    country: string
    phone?: string
    email?: string
  }
): Promise<CartData> {
  const apiRoot = getApiRoot()

  const response = await apiRoot
    .carts()
    .withId({ ID: cartId })
    .post({
      body: {
        version,
        actions: [
          {
            action: 'setShippingAddress',
            address,
          },
        ],
      },
    })
    .execute()

  return transformCart(response.body)
}

export async function setBillingAddress(
  cartId: string,
  version: number,
  address: {
    firstName?: string
    lastName?: string
    streetName?: string
    streetNumber?: string
    postalCode?: string
    city?: string
    region?: string
    country: string
    phone?: string
    email?: string
  }
): Promise<CartData> {
  const apiRoot = getApiRoot()

  const response = await apiRoot
    .carts()
    .withId({ ID: cartId })
    .post({
      body: {
        version,
        actions: [
          {
            action: 'setBillingAddress',
            address,
          },
        ],
      },
    })
    .execute()

  return transformCart(response.body)
}

export async function deleteCart(cartId: string, version: number): Promise<void> {
  const apiRoot = getApiRoot()

  await apiRoot
    .carts()
    .withId({ ID: cartId })
    .delete({
      queryArgs: { version },
    })
    .execute()
}
