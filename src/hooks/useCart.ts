import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  applyPromoCode,
  clearCart,
} from '#/lib/server-functions/cart'
import type { CartData, CartLineItem } from '#/lib/commercetools/types'
import { formatPrice } from '#/lib/commercetools/client'

export function useCart() {
  const queryClient = useQueryClient()

  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: () => getCart(),
    staleTime: 1000 * 60 * 5,
  })

  const addMutation = useMutation({
    mutationFn: (data: { productId: string; variantId: number; quantity?: number }) =>
      addToCart({ data }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['cart'] })
      const previousCart = queryClient.getQueryData<CartData | null>(['cart'])
      return { previousCart }
    },
    onError: (_err, _newItem, context) => {
      if (context?.previousCart !== undefined) {
        queryClient.setQueryData(['cart'], context.previousCart)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: { lineItemId: string; quantity: number }) =>
      updateCartItem({ data }),
    onMutate: async ({ lineItemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] })
      const previousCart = queryClient.getQueryData<CartData | null>(['cart'])

      if (previousCart) {
        const updatedItems =
          quantity === 0
            ? previousCart.lineItems.filter((item: CartLineItem) => item.id !== lineItemId)
            : previousCart.lineItems.map((item: CartLineItem) =>
                item.id === lineItemId ? { ...item, quantity } : item
              )

        queryClient.setQueryData<CartData>(['cart'], {
          ...previousCart,
          lineItems: updatedItems,
        })
      }

      return { previousCart }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousCart !== undefined) {
        queryClient.setQueryData(['cart'], context.previousCart)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  const removeMutation = useMutation({
    mutationFn: (lineItemId: string) => removeFromCart({ data: { lineItemId } }),
    onMutate: async (lineItemId) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] })
      const previousCart = queryClient.getQueryData<CartData | null>(['cart'])

      if (previousCart) {
        queryClient.setQueryData<CartData>(['cart'], {
          ...previousCart,
          lineItems: previousCart.lineItems.filter((item: CartLineItem) => item.id !== lineItemId),
        })
      }

      return { previousCart }
    },
    onError: (_err, _lineItemId, context) => {
      if (context?.previousCart !== undefined) {
        queryClient.setQueryData(['cart'], context.previousCart)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  const applyCodeMutation = useMutation({
    mutationFn: (code: string) => applyPromoCode({ data: { code } }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  const clearMutation = useMutation({
    mutationFn: () => clearCart(),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  const cart = cartQuery.data
  const itemCount = cart?.totalLineItemQuantity ?? 0
  const subtotal = cart?.totalPrice
    ? formatPrice(cart.totalPrice.value, cart.totalPrice.currencyCode)
    : '$0.00'

  return {
    cart,
    isLoading: cartQuery.isLoading,
    isError: cartQuery.isError,
    itemCount,
    subtotal,
    addItem: addMutation.mutate,
    updateItem: updateMutation.mutate,
    removeItem: removeMutation.mutate,
    applyCode: applyCodeMutation.mutate,
    clear: clearMutation.mutate,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
  }
}
