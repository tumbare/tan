import { useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { X, ChevronRight, User, ShoppingBag, Heart } from 'lucide-react'
import { useAuth } from '#/hooks/useAuth'
import { useCart } from '#/hooks/useCart'

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
  links: Array<{ href: string; label: string }>
}

export function MobileNav({ isOpen, onClose, links }: MobileNavProps) {
  const { isAuthenticated, user } = useAuth()
  const { itemCount } = useCart()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className="overlay animate-fade-in" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-white z-[var(--z-modal)] animate-slide-in-right shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--color-cream-dark)]">
            <span className="font-display font-bold text-xl">Menu</span>
            <button
              onClick={onClose}
              className="btn-ghost p-2 -mr-2 hover:bg-[var(--color-cream)] rounded-full"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* User greeting */}
          {isAuthenticated && user && (
            <div className="px-4 py-3 bg-[var(--color-cream)]">
              <p className="text-sm text-[var(--color-slate)]">Welcome back,</p>
              <p className="font-medium">
                {user.firstName || user.email.split('@')[0]}
              </p>
            </div>
          )}

          {/* Navigation links */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    onClick={onClose}
                    className="flex items-center justify-between px-4 py-3 text-lg font-medium hover:bg-[var(--color-cream)] transition-colors"
                  >
                    {link.label}
                    <ChevronRight className="w-5 h-5 text-[var(--color-slate)]" />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="h-px bg-[var(--color-cream-dark)] my-4 mx-4" />

            <ul className="space-y-1">
              <li>
                <Link
                  to={isAuthenticated ? '/account' : '/account/login'}
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-cream)] transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">
                    {isAuthenticated ? 'My Account' : 'Sign In'}
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-cream)] transition-colors"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span className="font-medium">Cart</span>
                  {itemCount > 0 && (
                    <span className="ml-auto bg-[var(--color-coral)] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {itemCount}
                    </span>
                  )}
                </Link>
              </li>
              <li>
                <Link
                  to="/wishlist"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-cream)] transition-colors"
                >
                  <Heart className="w-5 h-5" />
                  <span className="font-medium">Wishlist</span>
                </Link>
              </li>
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-[var(--color-cream-dark)] bg-[var(--color-cream)]">
            <p className="text-sm text-[var(--color-slate)] text-center">
              Free shipping on orders over $100
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
