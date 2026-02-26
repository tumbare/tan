import { getApiRoot, getLocalizedValue, DEFAULT_LOCALE, DEFAULT_CURRENCY } from './client'
import type {
  ProductData,
  ProductVariantData,
  CategoryReference,
  PaginatedResult,
  ProductQueryParams,
} from './types'
import type { ProductProjection, Image } from '@commercetools/platform-sdk'

function transformProductProjection(product: ProductProjection, locale: string = DEFAULT_LOCALE): ProductData {
  const masterVariant = product.masterVariant
  const price = masterVariant.prices?.find(p => p.value.currencyCode === DEFAULT_CURRENCY) || masterVariant.prices?.[0]

  return {
    id: product.id,
    key: product.key,
    slug: getLocalizedValue(product.slug, locale),
    name: getLocalizedValue(product.name, locale),
    description: product.description ? getLocalizedValue(product.description, locale) : undefined,
    images: masterVariant.images || [],
    price: price ? {
      value: price.value.centAmount,
      currencyCode: price.value.currencyCode,
      discounted: price.discounted ? {
        value: price.discounted.value.centAmount,
        discount: price.discounted.discount.id,
      } : undefined,
    } : undefined,
    variants: [
      transformVariant(masterVariant),
      ...(product.variants || []).map(v => transformVariant(v)),
    ],
    categories: (product.categories || []).map(cat => ({
      id: cat.id,
      name: '',
      slug: '',
    })),
    attributes: extractAttributes(masterVariant.attributes || []),
  }
}

function transformVariant(variant: ProductProjection['masterVariant']): ProductVariantData {
  const price = variant.prices?.find(p => p.value.currencyCode === DEFAULT_CURRENCY) || variant.prices?.[0]

  return {
    id: variant.id,
    sku: variant.sku,
    images: variant.images || [],
    price: price ? {
      value: price.value.centAmount,
      currencyCode: price.value.currencyCode,
    } : undefined,
    attributes: extractAttributes(variant.attributes || []),
    availability: variant.availability ? {
      isOnStock: variant.availability.isOnStock ?? false,
      availableQuantity: variant.availability.availableQuantity,
    } : undefined,
  }
}

function extractAttributes(attributes: Array<{ name: string; value: unknown }>): Record<string, unknown> {
  return attributes.reduce((acc, attr) => {
    acc[attr.name] = attr.value
    return acc
  }, {} as Record<string, unknown>)
}

export async function fetchProducts(params: ProductQueryParams = {}): Promise<PaginatedResult<ProductData>> {
  const {
    categoryId,
    categorySlug,
    search,
    sort = 'createdAt desc',
    limit = 20,
    offset = 0,
    priceMin,
    priceMax,
  } = params

  const apiRoot = getApiRoot()

  const queryArgs: Record<string, unknown> = {
    limit,
    offset,
    sort: [sort],
    expand: ['categories[*]'],
  }

  const filters: string[] = []

  if (categoryId) {
    filters.push(`categories.id:"${categoryId}"`)
  }

  if (categorySlug) {
    filters.push(`categories.slug.${DEFAULT_LOCALE}:"${categorySlug}"`)
  }

  if (priceMin !== undefined) {
    filters.push(`variants.price.centAmount:range (${priceMin * 100} to *)`)
  }

  if (priceMax !== undefined) {
    filters.push(`variants.price.centAmount:range (* to ${priceMax * 100})`)
  }

  if (filters.length > 0) {
    queryArgs['filter'] = filters
  }

  if (search) {
    queryArgs[`text.${DEFAULT_LOCALE}`] = search
  }

  const response = await apiRoot
    .productProjections()
    .search()
    .get({ queryArgs })
    .execute()

  return {
    results: response.body.results.map(p => transformProductProjection(p)),
    total: response.body.total ?? 0,
    offset: response.body.offset,
    limit: response.body.limit,
  }
}

export async function fetchProductBySlug(slug: string): Promise<ProductData | null> {
  const apiRoot = getApiRoot()

  const response = await apiRoot
    .productProjections()
    .search()
    .get({
      queryArgs: {
        filter: [`slug.${DEFAULT_LOCALE}:"${slug}"`],
        limit: 1,
      },
    })
    .execute()

  if (response.body.results.length === 0) {
    return null
  }

  return transformProductProjection(response.body.results[0])
}

export async function fetchProductById(id: string): Promise<ProductData | null> {
  const apiRoot = getApiRoot()

  try {
    const response = await apiRoot
      .productProjections()
      .withId({ ID: id })
      .get()
      .execute()

    return transformProductProjection(response.body)
  } catch {
    return null
  }
}

export async function fetchFeaturedProducts(limit: number = 8): Promise<ProductData[]> {
  const result = await fetchProducts({ limit, sort: 'createdAt desc' })
  return result.results
}

export async function fetchRelatedProducts(productId: string, categoryId?: string, limit: number = 4): Promise<ProductData[]> {
  const params: ProductQueryParams = {
    limit: limit + 1,
    categoryId,
  }

  const result = await fetchProducts(params)
  return result.results.filter(p => p.id !== productId).slice(0, limit)
}
