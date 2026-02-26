import { Link } from '@tanstack/react-router'
import { Instagram, Twitter, Facebook, Youtube, Mail, MapPin, Phone } from 'lucide-react'
import { Container } from '#/components/ui'

const footerLinks = {
  shop: [
    { label: 'New Arrivals', href: '/categories/new-arrivals' },
    { label: 'Bestsellers', href: '/categories/bestsellers' },
    { label: 'Sale', href: '/categories/sale' },
    { label: 'All Products', href: '/products' },
  ],
  support: [
    { label: 'Contact Us', href: '/contact' },
    { label: 'FAQs', href: '/faq' },
    { label: 'Shipping & Returns', href: '/shipping' },
    { label: 'Size Guide', href: '/size-guide' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
    { label: 'Sustainability', href: '/sustainability' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
}

const socialLinks = [
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
]

export function Footer() {
  return (
    <footer className="bg-[var(--color-charcoal)] text-white">
      {/* Newsletter section */}
      <div className="border-b border-white/10">
        <Container>
          <div className="py-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="font-display text-2xl md:text-3xl font-bold mb-2">
                Stay in the loop
              </h3>
              <p className="text-white/70">
                Subscribe for exclusive offers and early access to new arrivals
              </p>
            </div>
            <form className="flex gap-3 w-full max-w-md">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-[var(--color-coral)] transition-colors"
              />
              <button
                type="submit"
                className="btn bg-[var(--color-coral)] hover:bg-[var(--color-coral-dark)] text-white"
              >
                Subscribe
              </button>
            </form>
          </div>
        </Container>
      </div>

      {/* Main footer content */}
      <Container>
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-1">
              <Link
                to="/"
                className="font-display font-bold text-2xl tracking-tight inline-block mb-4"
              >
                LUXE<span className="text-[var(--color-coral)]">.</span>
              </Link>
              <p className="text-white/70 text-sm mb-6 max-w-xs">
                Curating exceptional products for the modern lifestyle. Quality
                meets design.
              </p>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--color-coral)] transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Shop links */}
            <div>
              <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-4">
                Shop
              </h4>
              <ul className="space-y-3">
                {footerLinks.shop.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-white/70 hover:text-[var(--color-coral)] transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support links */}
            <div>
              <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-4">
                Support
              </h4>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-white/70 hover:text-[var(--color-coral)] transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company links */}
            <div>
              <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-4">
                Company
              </h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-white/70 hover:text-[var(--color-coral)] transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact info */}
            <div>
              <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-4">
                Contact
              </h4>
              <ul className="space-y-3 text-sm text-white/70">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>123 Design Street, New York, NY 10001</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 shrink-0" />
                  <a
                    href="tel:+1234567890"
                    className="hover:text-[var(--color-coral)] transition-colors"
                  >
                    +1 (234) 567-890
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 shrink-0" />
                  <a
                    href="mailto:hello@luxe.com"
                    className="hover:text-[var(--color-coral)] transition-colors"
                  >
                    hello@luxe.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Container>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <Container>
          <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/50">
            <p>&copy; {new Date().getFullYear()} LUXE. All rights reserved.</p>
            <div className="flex items-center gap-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </div>
    </footer>
  )
}
