import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  getCurrentUser,
  login as loginFn,
  logout as logoutFn,
  register as registerFn,
} from '#/lib/server-functions/auth'

export function useAuth() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const userQuery = useQuery({
    queryKey: ['user'],
    queryFn: () => getCurrentUser(),
    staleTime: 1000 * 60 * 5,
    retry: false,
  })

  const loginMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) => loginFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  const registerMutation = useMutation({
    mutationFn: (data: {
      email: string
      password: string
      firstName?: string
      lastName?: string
    }) => registerFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  const logoutMutation = useMutation({
    mutationFn: () => logoutFn(),
    onSuccess: () => {
      queryClient.setQueryData(['user'], null)
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      navigate({ to: '/' })
    },
  })

  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    isAuthenticated: !!userQuery.data,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  }
}
