import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { Container, Section, Button, Input } from '#/components/ui'
import { useAuth } from '#/hooks/useAuth'
import { z } from 'zod'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/account/login')({
  validateSearch: searchSchema,
  component: LoginPage,
  head: () => ({
    meta: [
      { title: 'Sign In | LUXE' },
      { name: 'description', content: 'Sign in to your LUXE account' },
    ],
  }),
})

function LoginPage() {
  const navigate = useNavigate()
  const search = Route.useSearch()
  const { loginAsync, isLoggingIn, loginError } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {}

    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    try {
      await loginAsync({ email, password })
      navigate({ to: search.redirect || '/account' })
    } catch {
      // Error is handled by mutation
    }
  }

  return (
    <Section className="py-12 md:py-20">
      <Container>
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl mb-4">Welcome Back</h1>
            <p className="text-[var(--color-slate)]">
              Sign in to your account to continue shopping
            </p>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Global error */}
            {loginError && (
              <div className="p-4 bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 rounded-lg text-[var(--color-error)] text-sm">
                {loginError.message || 'Invalid email or password. Please try again.'}
              </div>
            )}

            {/* Email */}
            <div className="relative">
              <Input
                type="email"
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                error={errors.email}
                autoComplete="email"
              />
              <Mail className="absolute right-4 top-[38px] w-5 h-5 text-[var(--color-slate)]" />
            </div>

            {/* Password */}
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                error={errors.password}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[38px] text-[var(--color-slate)] hover:text-[var(--color-charcoal)] transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Forgot password link */}
            <div className="flex justify-end">
              <Link
                to="/account/forgot-password"
                className="text-sm text-[var(--color-coral)] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              isLoading={isLoggingIn}
            >
              Sign In
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--color-cream-dark)]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[var(--color-cream)] text-[var(--color-slate)]">
                or
              </span>
            </div>
          </div>

          {/* Register link */}
          <div className="text-center">
            <p className="text-[var(--color-slate)]">
              Don't have an account?{' '}
              <Link
                to="/account/register"
                search={{ redirect: search.redirect }}
                className="font-medium text-[var(--color-charcoal)] hover:text-[var(--color-coral)] transition-colors"
              >
                Create one
              </Link>
            </p>
          </div>

          {/* Guest checkout */}
          {search.redirect === '/checkout' && (
            <div className="mt-8 p-6 bg-[var(--color-cream-dark)] rounded-xl text-center">
              <p className="text-[var(--color-slate)] mb-4">
                Just want to complete your purchase?
              </p>
              <Link
                to="/checkout"
                search={{ guest: true }}
                className="font-medium text-[var(--color-charcoal)] hover:text-[var(--color-coral)] transition-colors"
              >
                Continue as Guest →
              </Link>
            </div>
          )}
        </div>
      </Container>
    </Section>
  )
}
