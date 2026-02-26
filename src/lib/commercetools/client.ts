import {
  ClientBuilder,
  type AuthMiddlewareOptions,
  type HttpMiddlewareOptions,
} from '@commercetools/ts-client'
import { createApiBuilderFromCtpClient, type ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk'

function getConfig() {
  const projectKey = process.env.CTP_PROJECT_KEY
  const clientId = process.env.CTP_CLIENT_ID
  const clientSecret = process.env.CTP_CLIENT_SECRET
  const authUrl = process.env.CTP_AUTH_URL
  const apiUrl = process.env.CTP_API_URL
  const scopes = process.env.CTP_SCOPES

  if (!projectKey || !clientId || !clientSecret || !authUrl || !apiUrl) {
    throw new Error(
      'Missing commercetools configuration. Please check your environment variables.'
    )
  }

  return {
    projectKey,
    clientId,
    clientSecret,
    authUrl,
    apiUrl,
    scopes: scopes ? scopes.split(' ') : [`manage_project:${projectKey}`],
  }
}

let apiRootInstance: ByProjectKeyRequestBuilder | null = null

export function getApiRoot(): ByProjectKeyRequestBuilder {
  if (apiRootInstance) {
    return apiRootInstance
  }

  const config = getConfig()

  const authMiddlewareOptions: AuthMiddlewareOptions = {
    host: config.authUrl,
    projectKey: config.projectKey,
    credentials: {
      clientId: config.clientId,
      clientSecret: config.clientSecret,
    },
    scopes: config.scopes,
    httpClient: fetch,
  }

  const httpMiddlewareOptions: HttpMiddlewareOptions = {
    host: config.apiUrl,
    httpClient: fetch,
  }

  const ctpClient = new ClientBuilder()
    .withProjectKey(config.projectKey)
    .withClientCredentialsFlow(authMiddlewareOptions)
    .withHttpMiddleware(httpMiddlewareOptions)
    .build()

  apiRootInstance = createApiBuilderFromCtpClient(ctpClient).withProjectKey({
    projectKey: config.projectKey,
  })

  return apiRootInstance
}

export function getProjectKey() {
  return process.env.CTP_PROJECT_KEY || ''
}

export const DEFAULT_LOCALE = 'en-US'
export const DEFAULT_CURRENCY = 'USD'

export function getLocalizedValue(
  localizedString: Record<string, string> | undefined,
  locale: string = DEFAULT_LOCALE
): string {
  if (!localizedString) return ''
  return localizedString[locale] || localizedString['en'] || Object.values(localizedString)[0] || ''
}

export function formatPrice(centAmount: number, currencyCode: string = DEFAULT_CURRENCY): string {
  const amount = centAmount / 100
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount)
}

export function moneyToNumber(money: { centAmount: number; fractionDigits?: number }): number {
  const fractionDigits = money.fractionDigits ?? 2
  return money.centAmount / Math.pow(10, fractionDigits)
}
