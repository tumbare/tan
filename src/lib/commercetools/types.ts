import type {
  Product,
  ProductProjection,
  Category,
  Cart,
  LineItem,
  Customer,
  Order,
  Address,
  Money,
  Price,
  Image,
  ProductVariant,
  ShippingMethod,
  DiscountCode,
} from '@commercetools/platform-sdk'

export type {
  Product,
  ProductProjection,
  Category,
  Cart,
  LineItem,
  Customer,
  Order,
  Address,
  Money,
  Price,
  Image,
  ProductVariant,
  ShippingMethod,
  DiscountCode,
}

export interface LocalizedString {
  [locale: string]: string
}

export interface ProductData {
  id: string
  key?: string
  slug: string
  name: string
  description?: string
  images: Image[]
  price?: {
    value: number
    currencyCode: string
    discounted?: {
      value: number
      discount: string
    }
  }
  variants: ProductVariantData[]
  categories: CategoryReference[]
  attributes: Record<string, unknown>
}

export interface ProductVariantData {
  id: number
  sku?: string
  images: Image[]
  price?: {
    value: number
    currencyCode: string
  }
  attributes: Record<string, unknown>
  availability?: {
    isOnStock: boolean
    availableQuantity?: number
  }
}

export interface CategoryReference {
  id: string
  name: string
  slug: string
}

export interface CategoryData {
  id: string
  key?: string
  name: string
  slug: string
  description?: string
  parent?: CategoryReference
  ancestors: CategoryReference[]
  children?: CategoryData[]
}

export interface CartData {
  id: string
  version: number
  lineItems: CartLineItem[]
  totalPrice: {
    value: number
    currencyCode: string
  }
  totalLineItemQuantity: number
  discountCodes: AppliedDiscountCode[]
  shippingAddress?: Address
  billingAddress?: Address
  shippingInfo?: {
    shippingMethodName: string
    price: {
      value: number
      currencyCode: string
    }
  }
}

export interface CartLineItem {
  id: string
  productId: string
  name: string
  slug: string
  quantity: number
  price: {
    value: number
    currencyCode: string
  }
  totalPrice: {
    value: number
    currencyCode: string
  }
  variant: {
    id: number
    sku?: string
    images: Image[]
    attributes: Record<string, unknown>
  }
}

export interface AppliedDiscountCode {
  discountCode: {
    id: string
    code: string
  }
  state: string
}

export interface CustomerData {
  id: string
  email: string
  firstName?: string
  lastName?: string
  addresses: Address[]
  defaultShippingAddressId?: string
  defaultBillingAddressId?: string
}

export interface OrderData {
  id: string
  orderNumber?: string
  createdAt: string
  lineItems: CartLineItem[]
  totalPrice: {
    value: number
    currencyCode: string
  }
  orderState: string
  paymentState?: string
  shipmentState?: string
  shippingAddress?: Address
  billingAddress?: Address
}

export interface PaginatedResult<T> {
  results: T[]
  total: number
  offset: number
  limit: number
}

export interface ProductQueryParams {
  categoryId?: string
  categorySlug?: string
  search?: string
  sort?: string
  limit?: number
  offset?: number
  priceMin?: number
  priceMax?: number
}

export interface CategoryQueryParams {
  parentId?: string
  limit?: number
  offset?: number
}
