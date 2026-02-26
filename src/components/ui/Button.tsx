import { forwardRef } from 'react'
import { Link } from '@tanstack/react-router'

type ButtonVariant = 'primary' | 'accent' | 'outline' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

interface LinkButtonProps extends Omit<ButtonProps, 'onClick'> {
  href: string
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  accent: 'btn-accent',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
  icon: 'btn-icon',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const classes = [
      'btn',
      variantClasses[variant],
      sizeClasses[size],
      isLoading && 'opacity-70 cursor-not-allowed',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full" />
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      leftIcon,
      rightIcon,
      className = '',
      children,
      href,
      ...props
    },
    ref
  ) => {
    const classes = [
      'btn',
      variantClasses[variant],
      sizeClasses[size],
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <Link ref={ref} to={href} className={classes} {...props}>
        {leftIcon}
        {children}
        {rightIcon}
      </Link>
    )
  }
)

LinkButton.displayName = 'LinkButton'
