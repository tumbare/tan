import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import {
  fetchProducts,
  fetchProductBySlug,
  fetchProductById,
  fetchFeaturedProducts,
  fetchRelatedProducts,
} from '#/lib/commercetools/products.server'

const productQuerySchema = z.object({
  categoryId: z.string().optional(),
  categorySlug: z.string().optional(),
  search: z.string().optional(),
  sort: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
})

export const getProducts = createServerFn({ method: 'GET' })
  .inputValidator(productQuerySchema)
  .handler(async ({ data }) => {
    return fetchProducts(data)
  })

export const getProductBySlug = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    const product = await fetchProductBySlug(data.slug)
    if (!product) {
      throw new Error('Product not found')
    }
    return product
  })

export const getProductById = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const product = await fetchProductById(data.id)
    if (!product) {
      throw new Error('Product not found')
    }
    return product
  })

export const getFeaturedProducts = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ limit: z.number().min(1).max(20).optional() }))
  .handler(async ({ data }) => {
    return fetchFeaturedProducts(data.limit)
  })

export const getRelatedProducts = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      productId: z.string(),
      categoryId: z.string().optional(),
      limit: z.number().min(1).max(10).optional(),
    })
  )
  .handler(async ({ data }) => {
    return fetchRelatedProducts(data.productId, data.categoryId, data.limit)
  })
