import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Truck, Shield, RefreshCw, Headphones } from 'lucide-react'
import { Container, Section, LinkButton, ProductGridSkeleton } from '#/components/ui'
import { ProductCard } from '#/components/product/ProductCard'
import { getProducts, getFeaturedProducts } from '#/lib/server-functions/products'
import { getAllCategories } from '#/lib/server-functions/categories'

export const Route = createFileRoute('/')({
  component: HomePage,
  head: () => ({
    meta: [
      { title: 'LUXE | Modern E-Commerce - Home' },
      { name: 'description', content: 'Discover exceptional products curated for the modern lifestyle. Shop new arrivals, bestsellers, and exclusive collections.' },
    ],
  }),
})

function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesBar />
      <FeaturedProducts />
      <CategoryShowcase />
      <NewArrivals />
      <PromoSection />
    </>
  )
}

function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden grain">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-cream)] via-[var(--color-cream-dark)] to-[#E8E4DD]" />

      {/* Decorative elements */}
      <div className="absolute top-20 right-[10%] w-72 h-72 rounded-full bg-[var(--color-coral)]/10 blur-3xl" />
      <div className="absolute bottom-20 left-[5%] w-96 h-96 rounded-full bg-[var(--color-charcoal)]/5 blur-3xl" />

      {/* Geometric shapes */}
      <div className="absolute top-1/4 right-[15%] w-24 h-24 border-4 border-[var(--color-charcoal)]/10 rotate-45 hidden lg:block" />
      <div className="absolute bottom-1/3 left-[8%] w-16 h-16 bg-[var(--color-coral)]/20 rounded-full hidden lg:block" />

      <Container className="relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="stagger-children">
            <span className="inline-block text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-coral)] mb-4">
              New Collection 2026
            </span>
            <h1 className="mb-6">
              Elevate Your
              <br />
              <span className="text-[var(--color-coral)]">Everyday</span> Style
            </h1>
            <p className="text-lg md:text-xl text-[var(--color-slate)] max-w-lg mb-8 leading-relaxed">
              Discover curated collections that blend timeless elegance with
              modern design. Quality craftsmanship for the discerning individual.
            </p>
            <div className="flex flex-wrap gap-4">
              <LinkButton href="/products" size="lg">
                Shop Now
                <ArrowRight className="w-5 h-5" />
              </LinkButton>
              <LinkButton href="/categories/new-arrivals" variant="outline" size="lg">
                View Collection
              </LinkButton>
            </div>
          </div>

          {/* Hero image grid */}
          <div className="relative hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-[var(--color-charcoal-light)] animate-fade-in-up shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop"
                    alt="Fashion collection"
                    className="img-cover"
                  />
                </div>
                <div className="aspect-square rounded-2xl overflow-hidden bg-[var(--color-coral)]/20 animate-fade-in-up shadow-lg" style={{ animationDelay: '200ms' }}>
                  <img
                    src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&h=300&fit=crop"
                    alt="Accessories"
                    className="img-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-12">
                <div className="aspect-square rounded-2xl overflow-hidden bg-[var(--color-cream-dark)] animate-fade-in-up shadow-lg" style={{ animationDelay: '100ms' }}>
                  <img
                    src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=300&fit=crop"
                    alt="Home decor"
                    className="img-cover"
                  />
                </div>
                <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-[var(--color-charcoal)] animate-fade-in-up shadow-xl" style={{ animationDelay: '300ms' }}>
                  <img
                    src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=500&fit=crop"
                    alt="Shopping experience"
                    className="img-cover"
                  />
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 bg-white rounded-2xl p-4 shadow-xl animate-fade-in" style={{ animationDelay: '500ms' }}>
              <div className="text-3xl font-display font-bold text-[var(--color-coral)]">50%</div>
              <div className="text-sm text-[var(--color-slate)]">Off Season Sale</div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

function FeaturesBar() {
  const features = [
    { icon: Truck, title: 'Free Shipping', desc: 'On orders over $100' },
    { icon: Shield, title: 'Secure Payment', desc: '100% protected' },
    { icon: RefreshCw, title: 'Easy Returns', desc: '30-day returns' },
    { icon: Headphones, title: '24/7 Support', desc: 'Dedicated support' },
  ]

  return (
    <div className="bg-[var(--color-charcoal)] text-white py-6">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <feature.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-sm">{feature.title}</p>
                <p className="text-xs text-white/60">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
}

function FeaturedProducts() {
  const { data, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => getFeaturedProducts({ data: { limit: 8 } }),
    staleTime: 1000 * 60 * 5,
  })

  return (
    <Section>
      <Container>
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-sm font-medium uppercase tracking-[0.15em] text-[var(--color-coral)] mb-2 block">
              Curated Selection
            </span>
            <h2>Featured Products</h2>
          </div>
          <Link
            to="/products"
            className="hidden md:flex items-center gap-2 text-sm font-medium hover:text-[var(--color-coral)] transition-colors group"
          >
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {isLoading ? (
          <ProductGridSkeleton count={8} />
        ) : data && data.length > 0 ? (
          <div className="product-grid stagger-children">
            {data.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index < 4} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-[var(--color-slate)]">No products found</p>
          </div>
        )}

        <div className="mt-10 text-center md:hidden">
          <LinkButton href="/products" variant="outline">
            View All Products
          </LinkButton>
        </div>
      </Container>
    </Section>
  )
}

function CategoryShowcase() {
  const { data: categories } = useQuery({
    queryKey: ['root-categories'],
    queryFn: () => getAllCategories(),
    staleTime: 1000 * 60 * 30,
  })

  const showcaseCategories = categories?.slice(0, 4) ?? []

  const placeholderImages = [
    'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop',
  ]

  return (
    <Section className="bg-[var(--color-cream-dark)]">
      <Container>
        <div className="text-center mb-12">
          <span className="text-sm font-medium uppercase tracking-[0.15em] text-[var(--color-coral)] mb-2 block">
            Browse by
          </span>
          <h2>Shop Categories</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {showcaseCategories.length > 0
            ? showcaseCategories.map((category, index) => (
                <Link
                  key={category.id}
                  to="/categories/$slug"
                  params={{ slug: category.slug }}
                  className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-[var(--color-charcoal)]"
                >
                  <img
                    src={placeholderImages[index % placeholderImages.length]}
                    alt={category.name}
                    className="img-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="text-white text-xl md:text-2xl font-display font-semibold mb-2">
                      {category.name}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-white/80 text-sm group-hover:text-[var(--color-coral)] transition-colors">
                      Shop Now
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              ))
            : placeholderImages.map((img, index) => (
                <Link
                  key={index}
                  to="/products"
                  className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-[var(--color-charcoal)]"
                >
                  <img
                    src={img}
                    alt={`Category ${index + 1}`}
                    className="img-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="text-white text-xl md:text-2xl font-display font-semibold mb-2">
                      {['Fashion', 'Accessories', 'Home', 'Electronics'][index]}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-white/80 text-sm group-hover:text-[var(--color-coral)] transition-colors">
                      Shop Now
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              ))}
        </div>
      </Container>
    </Section>
  )
}

function NewArrivals() {
  const { data, isLoading } = useQuery({
    queryKey: ['new-arrivals'],
    queryFn: () => getProducts({ data: { sort: 'createdAt desc', limit: 4 } }),
    staleTime: 1000 * 60 * 5,
  })

  return (
    <Section>
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <span className="text-sm font-medium uppercase tracking-[0.15em] text-[var(--color-coral)] mb-2 block">
              Just Dropped
            </span>
            <h2 className="mb-6">New Arrivals</h2>
            <p className="text-[var(--color-slate)] text-lg mb-8 leading-relaxed">
              Be the first to discover our latest additions. Fresh designs,
              premium materials, and cutting-edge style—straight from our
              curators to your wardrobe.
            </p>
            <LinkButton href="/categories/new-arrivals">
              Explore New Arrivals
              <ArrowRight className="w-5 h-5" />
            </LinkButton>
          </div>

          {/* Products grid */}
          <div>
            {isLoading ? (
              <ProductGridSkeleton count={4} />
            ) : data?.results && data.results.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {data.results.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="aspect-square rounded-2xl bg-[var(--color-cream-dark)] flex items-center justify-center">
                <p className="text-[var(--color-slate)]">Coming soon</p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </Section>
  )
}

function PromoSection() {
  return (
    <Section dark className="relative overflow-hidden grain">
      {/* Background pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[var(--color-coral)]/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
      </div>

      <Container className="relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block text-sm font-medium uppercase tracking-[0.2em] text-[var(--color-coral)] mb-4">
            Limited Time Offer
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl mb-6">
            Get 20% Off Your First Order
          </h2>
          <p className="text-xl text-white/70 mb-10 max-w-xl mx-auto">
            Join our community and enjoy exclusive member benefits, early access
            to sales, and personalized recommendations.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:border-[var(--color-coral)] transition-colors"
            />
            <button className="btn bg-[var(--color-coral)] hover:bg-[var(--color-coral-dark)] text-white px-8">
              Subscribe
            </button>
          </form>
          <p className="mt-4 text-sm text-white/50">
            By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
          </p>
        </div>
      </Container>
    </Section>
  )
}
