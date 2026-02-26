import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ShoppingBag, User, Search, Menu, X } from 'lucide-react'
import { Container } from '#/components/ui'
import { useCart } from '#/hooks/useCart'
import { useAuth } from '#/hooks/useAuth'
import { MobileNav } from './MobileNav'

const navLinks = [
  { href: '/products', label: 'Shop' },
  { href: '/categories/new-arrivals', label: 'New Arrivals' },
  { href: '/categories/bestsellers', label: 'Bestsellers' },
  { href: '/categories/sale', label: 'Sale' },
]

export function Header() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { itemCount } = useCart()
  const { isAuthenticated } = useAuth()

  return (
    <>
      <header className="sticky top-0 z-[var(--z-sticky)] bg-[var(--color-cream)]/95 backdrop-blur-md border-b border-[var(--color-cream-dark)]">
        <Container>
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileNavOpen(true)}
              className="btn-ghost p-2 -ml-2 md:hidden"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link
              to="/"
              className="font-display font-bold text-xl md:text-2xl tracking-tight hover:text-[var(--color-coral)] transition-colors"
            >
              LUXE<span className="text-[var(--color-coral)]">.</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm font-medium uppercase tracking-wider hover:text-[var(--color-coral)] transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--color-coral)] transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="btn-ghost p-2 hover:bg-[var(--color-cream-dark)] rounded-full transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Account */}
              <Link
                to={isAuthenticated ? '/account' : '/account/login'}
                className="btn-ghost p-2 hover:bg-[var(--color-cream-dark)] rounded-full transition-colors"
                aria-label="Account"
              >
                <User className="w-5 h-5" />
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="btn-ghost p-2 hover:bg-[var(--color-cream-dark)] rounded-full transition-colors relative"
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[var(--color-coral)] text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Search bar */}
          {searchOpen && (
            <div className="py-4 border-t border-[var(--color-cream-dark)] animate-fade-in">
              <form
                action="/products"
                method="get"
                className="flex items-center gap-3"
              >
                <input
                  type="search"
                  name="search"
                  placeholder="Search products..."
                  className="input flex-1"
                  autoFocus
                />
                <button type="submit" className="btn btn-primary">
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="btn-ghost p-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </form>
            </div>
          )}
        </Container>
      </header>

      {/* Mobile Navigation */}
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        links={navLinks}
      />
    </>
  )
}
