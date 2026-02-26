import { Outlet, HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { Header } from '#/components/layout/Header'
import { Footer } from '#/components/layout/Footer'

import appCss from '../styles.css?url'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
    },
  },
})

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'LUXE | Modern E-Commerce' },
      { name: 'description', content: 'Curating exceptional products for the modern lifestyle. Quality meets design.' },
      { name: 'theme-color', content: '#1A1A1A' },
      { property: 'og:title', content: 'LUXE | Modern E-Commerce' },
      { property: 'og:description', content: 'Curating exceptional products for the modern lifestyle.' },
      { property: 'og:type', content: 'website' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'preconnect', href: 'https://api.fontshare.com' },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundPage,
})

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootDocument>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
        </div>
      </RootDocument>
    </QueryClientProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        {process.env.NODE_ENV === 'development' && (
          <TanStackDevtools
            config={{ position: 'bottom-right' }}
            plugins={[
              {
                name: 'TanStack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        )}
        <Scripts />
      </body>
    </html>
  )
}

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl md:text-8xl font-display font-bold text-[var(--color-charcoal)] mb-4">
        404
      </h1>
      <p className="text-xl md:text-2xl text-[var(--color-slate)] mb-8">
        Page not found
      </p>
      <p className="text-[var(--color-slate)] mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <a href="/" className="btn btn-primary">
        Back to Home
      </a>
    </div>
  )
}
