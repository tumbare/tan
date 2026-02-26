import type { ElementType, ReactNode } from 'react'

interface ContainerProps {
  children: ReactNode
  className?: string
  as?: ElementType
}

export function Container({
  children,
  className = '',
  as: Component = 'div',
}: ContainerProps) {
  return <Component className={`container ${className}`}>{children}</Component>
}

interface SectionProps {
  children: ReactNode
  className?: string
  id?: string
  dark?: boolean
}

export function Section({ children, className = '', id, dark = false }: SectionProps) {
  return (
    <section
      id={id}
      className={`section ${dark ? 'bg-[var(--color-charcoal)] text-white' : ''} ${className}`}
    >
      {children}
    </section>
  )
}
