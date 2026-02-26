import { getApiRoot, getLocalizedValue, DEFAULT_LOCALE } from './client'
import type { CategoryData, CategoryReference, PaginatedResult, CategoryQueryParams } from './types'
import type { Category } from '@commercetools/platform-sdk'

function transformCategory(category: Category, locale: string = DEFAULT_LOCALE): CategoryData {
  return {
    id: category.id,
    key: category.key,
    name: getLocalizedValue(category.name, locale),
    slug: getLocalizedValue(category.slug, locale),
    description: category.description ? getLocalizedValue(category.description, locale) : undefined,
    parent: category.parent ? {
      id: category.parent.id,
      name: '',
      slug: '',
    } : undefined,
    ancestors: (category.ancestors || []).map(ancestor => ({
      id: ancestor.id,
      name: '',
      slug: '',
    })),
  }
}

export async function fetchCategories(params: CategoryQueryParams = {}): Promise<PaginatedResult<CategoryData>> {
  const { parentId, limit = 100, offset = 0 } = params

  const apiRoot = getApiRoot()

  const where: string[] = []

  if (parentId) {
    where.push(`parent(id="${parentId}")`)
  } else if (parentId === undefined) {
    where.push('parent is not defined')
  }

  const response = await apiRoot
    .categories()
    .get({
      queryArgs: {
        where: where.length > 0 ? where : undefined,
        limit,
        offset,
        sort: ['orderHint asc', 'name.en asc'],
        expand: ['parent', 'ancestors[*]'],
      },
    })
    .execute()

  return {
    results: response.body.results.map(c => transformCategory(c)),
    total: response.body.total ?? 0,
    offset: response.body.offset,
    limit: response.body.limit,
  }
}

export async function fetchCategoryBySlug(slug: string): Promise<CategoryData | null> {
  const apiRoot = getApiRoot()

  const response = await apiRoot
    .categories()
    .get({
      queryArgs: {
        where: [`slug(${DEFAULT_LOCALE}="${slug}")`],
        limit: 1,
        expand: ['parent', 'ancestors[*]'],
      },
    })
    .execute()

  if (response.body.results.length === 0) {
    return null
  }

  return transformCategory(response.body.results[0])
}

export async function fetchCategoryById(id: string): Promise<CategoryData | null> {
  const apiRoot = getApiRoot()

  try {
    const response = await apiRoot
      .categories()
      .withId({ ID: id })
      .get({
        queryArgs: {
          expand: ['parent', 'ancestors[*]'],
        },
      })
      .execute()

    return transformCategory(response.body)
  } catch {
    return null
  }
}

export async function fetchAllCategories(): Promise<CategoryData[]> {
  const apiRoot = getApiRoot()

  const response = await apiRoot
    .categories()
    .get({
      queryArgs: {
        limit: 500,
        sort: ['orderHint asc', 'name.en asc'],
        expand: ['parent'],
      },
    })
    .execute()

  return response.body.results.map(c => transformCategory(c))
}

export async function fetchCategoryTree(): Promise<CategoryData[]> {
  const allCategories = await fetchAllCategories()

  const rootCategories = allCategories.filter(c => !c.parent)

  function attachChildren(category: CategoryData): CategoryData {
    const children = allCategories.filter(c => c.parent?.id === category.id)
    return {
      ...category,
      children: children.map(attachChildren),
    }
  }

  return rootCategories.map(attachChildren)
}
