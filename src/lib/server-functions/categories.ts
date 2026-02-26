import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import {
  fetchCategories,
  fetchCategoryBySlug,
  fetchCategoryById,
  fetchAllCategories,
  fetchCategoryTree,
} from '#/lib/commercetools/categories.server'

export const getCategories = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      parentId: z.string().optional(),
      limit: z.number().min(1).max(500).optional(),
      offset: z.number().min(0).optional(),
    })
  )
  .handler(async ({ data }) => {
    return fetchCategories(data)
  })

export const getCategoryBySlug = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    const category = await fetchCategoryBySlug(data.slug)
    if (!category) {
      throw new Error('Category not found')
    }
    return category
  })

export const getCategoryById = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const category = await fetchCategoryById(data.id)
    if (!category) {
      throw new Error('Category not found')
    }
    return category
  })

export const getAllCategories = createServerFn({ method: 'GET' }).handler(
  async () => {
    return fetchAllCategories()
  }
)

export const getCategoryTree = createServerFn({ method: 'GET' }).handler(
  async () => {
    return fetchCategoryTree()
  }
)
