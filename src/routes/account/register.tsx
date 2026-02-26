import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, User, ArrowRight } from 'lucide-react'
import { Container, Section, Button, Input } from '#/components/ui'
import { useAuth } from '#/hooks/useAuth'
import { z } from 'zod'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/account/register')({
  validateSearch: searchSchema,
  component: RegisterPage,
  head: () => ({
    meta: [
      { title: 'Create Account | LUXE' },
      { name: 'description', content: 'Create your LUXE account to start shopping' },
    ],
  }),
})

function RegisterPage() {
  const navigate = useNavigate()
  const search = Route.useSearch()
  const { registerAsync, isRegistering, registerError } = useAuth()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    try {
      await registerAsync({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      })
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
            <h1 className="text-3xl md:text-4xl mb-4">Create Account</h1>
            <p className="text-[var(--color-slate)]">
              Join us and start shopping today
            </p>
          </div>

          {/* Register form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Global error */}
            {registerError && (
              <div className="p-4 bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 rounded-lg text-[var(--color-error)] text-sm">
                {registerError.message || 'Registration failed. Please try again.'}
              </div>
            )}

            {/* Name fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Input
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  placeholder="John"
                  error={errors.firstName}
                  autoComplete="given-name"
                />
              </div>
              <div className="relative">
                <Input
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  placeholder="Doe"
                  error={errors.lastName}
                  autoComplete="family-name"
                />
              </div>
            </div>

            {/* Email */}
            <div className="relative">
              <Input
                type="email"
                label="Email Address"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
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
                value={formData.password}
                onChange={(e) => updateField('password', e.target.value)}
                placeholder="At least 8 characters"
                error={errors.password}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[38px] text-[var(--color-slate)] hover:text-[var(--color-charcoal)] transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                placeholder="Repeat your password"
                error={errors.confirmPassword}
                autoComplete="new-password"
              />
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-[var(--color-cream-dark)] text-[var(--color-coral)] focus:ring-[var(--color-coral)]"
              />
              <label htmlFor="terms" className="text-sm text-[var(--color-slate)]">
                I agree to the{' '}
                <Link to="/terms" className="text-[var(--color-charcoal)] hover:text-[var(--color-coral)]">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-[var(--color-charcoal)] hover:text-[var(--color-coral)]">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.terms && (
              <p className="text-sm text-[var(--color-error)] -mt-4">{errors.terms}</p>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              isLoading={isRegistering}
            >
              Create Account
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

          {/* Login link */}
          <div className="text-center">
            <p className="text-[var(--color-slate)]">
              Already have an account?{' '}
              <Link
                to="/account/login"
                search={{ redirect: search.redirect }}
                className="font-medium text-[var(--color-charcoal)] hover:text-[var(--color-coral)] transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </Section>
  )
}
