import { getApiRoot } from './client'
import type { CustomerData, OrderData, CartLineItem } from './types'
import type { Customer, Order, LineItem } from '@commercetools/platform-sdk'

function transformCustomer(customer: Customer): CustomerData {
  return {
    id: customer.id,
    email: customer.email,
    firstName: customer.firstName,
    lastName: customer.lastName,
    addresses: customer.addresses || [],
    defaultShippingAddressId: customer.defaultShippingAddressId,
    defaultBillingAddressId: customer.defaultBillingAddressId,
  }
}

function transformOrderLineItem(lineItem: LineItem): CartLineItem {
  return {
    id: lineItem.id,
    productId: lineItem.productId,
    name: Object.values(lineItem.name)[0] || '',
    slug: Object.values(lineItem.productSlug || {})[0] || '',
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
      attributes: {},
    },
  }
}

function transformOrder(order: Order): OrderData {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    lineItems: order.lineItems.map(transformOrderLineItem),
    totalPrice: {
      value: order.totalPrice.centAmount,
      currencyCode: order.totalPrice.currencyCode,
    },
    orderState: order.orderState,
    paymentState: order.paymentState,
    shipmentState: order.shipmentState,
    shippingAddress: order.shippingAddress,
    billingAddress: order.billingAddress,
  }
}

export async function createCustomer(data: {
  email: string
  password: string
  firstName?: string
  lastName?: string
}): Promise<{ customer: CustomerData; cartId?: string }> {
  const apiRoot = getApiRoot()

  const response = await apiRoot
    .customers()
    .post({
      body: {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      },
    })
    .execute()

  return {
    customer: transformCustomer(response.body.customer),
    cartId: response.body.cart?.id,
  }
}

export async function authenticateCustomer(
  email: string,
  password: string
): Promise<{ customer: CustomerData; cartId?: string } | null> {
  const apiRoot = getApiRoot()

  try {
    const response = await apiRoot
      .login()
      .post({
        body: {
          email,
          password,
        },
      })
      .execute()

    return {
      customer: transformCustomer(response.body.customer),
      cartId: response.body.cart?.id,
    }
  } catch {
    return null
  }
}

export async function getCustomerById(customerId: string): Promise<CustomerData | null> {
  const apiRoot = getApiRoot()

  try {
    const response = await apiRoot
      .customers()
      .withId({ ID: customerId })
      .get()
      .execute()

    return transformCustomer(response.body)
  } catch {
    return null
  }
}

export async function updateCustomer(
  customerId: string,
  version: number,
  actions: Array<{
    action: string
    [key: string]: unknown
  }>
): Promise<CustomerData> {
  const apiRoot = getApiRoot()

  const response = await apiRoot
    .customers()
    .withId({ ID: customerId })
    .post({
      body: {
        version,
        actions: actions as never,
      },
    })
    .execute()

  return transformCustomer(response.body)
}

export async function changePassword(
  customerId: string,
  version: number,
  currentPassword: string,
  newPassword: string
): Promise<CustomerData> {
  const apiRoot = getApiRoot()

  const response = await apiRoot
    .customers()
    .password()
    .post({
      body: {
        id: customerId,
        version,
        currentPassword,
        newPassword,
      },
    })
    .execute()

  return transformCustomer(response.body)
}

export async function getCustomerOrders(
  customerId: string,
  limit: number = 10,
  offset: number = 0
): Promise<{ orders: OrderData[]; total: number }> {
  const apiRoot = getApiRoot()

  const response = await apiRoot
    .orders()
    .get({
      queryArgs: {
        where: [`customerId="${customerId}"`],
        sort: ['createdAt desc'],
        limit,
        offset,
      },
    })
    .execute()

  return {
    orders: response.body.results.map(transformOrder),
    total: response.body.total ?? 0,
  }
}

export async function getOrderById(orderId: string): Promise<OrderData | null> {
  const apiRoot = getApiRoot()

  try {
    const response = await apiRoot
      .orders()
      .withId({ ID: orderId })
      .get()
      .execute()

    return transformOrder(response.body)
  } catch {
    return null
  }
}

export async function createOrderFromCart(
  cartId: string,
  cartVersion: number
): Promise<OrderData> {
  const apiRoot = getApiRoot()

  const response = await apiRoot
    .orders()
    .post({
      body: {
        cart: {
          id: cartId,
          typeId: 'cart',
        },
        version: cartVersion,
      },
    })
    .execute()

  return transformOrder(response.body)
}

export async function addCustomerAddress(
  customerId: string,
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
): Promise<CustomerData> {
  return updateCustomer(customerId, version, [
    {
      action: 'addAddress',
      address,
    },
  ])
}

export async function setDefaultShippingAddress(
  customerId: string,
  version: number,
  addressId: string
): Promise<CustomerData> {
  return updateCustomer(customerId, version, [
    {
      action: 'setDefaultShippingAddress',
      addressId,
    },
  ])
}

export async function setDefaultBillingAddress(
  customerId: string,
  version: number,
  addressId: string
): Promise<CustomerData> {
  return updateCustomer(customerId, version, [
    {
      action: 'setDefaultBillingAddress',
      addressId,
    },
  ])
}
