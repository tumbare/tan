type BadgeVariant = 'default' | 'sale' | 'new' | 'stock' | 'outline'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-[var(--color-charcoal)] text-white',
  sale: 'badge-sale',
  new: 'badge-new',
  stock: 'badge-stock',
  outline: 'bg-transparent border border-[var(--color-charcoal)] text-[var(--color-charcoal)]',
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span className={`badge ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}
