# LUXE - Modern E-Commerce Storefront

A high-performance e-commerce storefront built with TanStack Start and commercetools, featuring a bold modern design aesthetic.

## Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (React full-stack framework)
- **Routing**: TanStack Router with file-based routing
- **State Management**: TanStack Query for server state
- **Backend**: [commercetools](https://commercetools.com) headless commerce platform
- **Styling**: Tailwind CSS 4
- **Animation**: Motion library
- **Icons**: Lucide React

## Features

- Server-side rendering (SSR) with streaming
- Automatic code splitting per route
- Intent-based route prefetching
- Full shopping cart with optimistic updates
- Customer authentication
- Multi-step checkout flow
- Responsive design with mobile navigation
- Modern bold design aesthetic

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- commercetools account with API credentials

### Installation

1. Clone the repository:

```bash
cd tan
npm install
```

2. Configure environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your commercetools credentials:

```env
CTP_PROJECT_KEY=your-project-key
CTP_CLIENT_ID=your-client-id
CTP_CLIENT_SECRET=your-client-secret
CTP_AUTH_URL=https://auth.us-central1.gcp.commercetools.com
CTP_API_URL=https://api.us-central1.gcp.commercetools.com
CTP_SCOPES=manage_project:your-project-key
SESSION_SECRET=your-session-secret
```

3. Start the development server:

```bash
npm run dev
```

The app will be available at http://localhost:3000

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── cart/          # Cart components
│   ├── layout/        # Header, Footer, Navigation
│   ├── product/       # Product cards, gallery
│   └── ui/            # Reusable UI components
├── hooks/             # React hooks (useCart, useAuth)
├── lib/
│   ├── commercetools/ # SDK client and server queries
│   └── server-functions/ # TanStack server functions
├── routes/            # File-based routing
│   ├── account/       # Account pages
│   ├── categories/    # Category pages
│   └── products/      # Product pages
├── router.tsx         # Router configuration
└── styles.css         # Global styles and design tokens
```

## Performance Optimizations

- **Route Prefetching**: Links are prefetched on hover (`defaultPreload: 'intent'`)
- **Code Splitting**: Each route is automatically code-split
- **Image Optimization**: Lazy loading with intersection observer
- **Query Caching**: TanStack Query with appropriate stale times
- **Vendor Chunking**: Separate chunks for vendor libraries

## Design System

The storefront uses a bold modern aesthetic with:

- **Colors**: Deep charcoal (#1A1A1A), vibrant coral (#FF6B4A), cream backgrounds
- **Typography**: Clash Display for headings, Satoshi for body text
- **Motion**: Staggered animations, hover effects, smooth transitions
- **Layout**: Asymmetric grids, generous whitespace

## License

MIT
