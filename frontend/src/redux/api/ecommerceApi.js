import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const ecommerceApi = createApi({
  reducerPath: 'ecommerceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Product', 'Cart', 'Order', 'Wishlist', 'Address'],
  endpoints: (builder) => ({
    // Auth
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: [],
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    getProfile: builder.query({
      query: () => '/auth/profile',
      providesTags: ['User'],
    }),

    // Products
    getProducts: builder.query({
      query: (params) => ({ url: '/products', params }),
      providesTags: ['Product'],
    }),
    getProduct: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    createProduct: builder.mutation({
      query: (product) => ({ url: '/products', method: 'POST', body: product }),
      invalidatesTags: ['Product'],
    }),

    // Cart
    getCart: builder.query({
      query: () => '/cart',
      providesTags: ['Cart'],
    }),
    addToCart: builder.mutation({
      query: (item) => ({ url: '/cart/add', method: 'POST', body: item }),
      invalidatesTags: ['Cart'],
    }),
    updateCartItem: builder.mutation({
      query: ({ id, quantity }) => ({ url: `/cart/update/${id}`, method: 'PATCH', body: { quantity } }),
      invalidatesTags: ['Cart'],
    }),
    removeFromCart: builder.mutation({
      query: (id) => ({ url: `/cart/remove/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Cart'],
    }),
    clearCart: builder.mutation({
      query: () => ({ url: '/cart/clear', method: 'DELETE' }),
      invalidatesTags: ['Cart'],
    }),

    // Orders
    getMyOrders: builder.query({
      query: () => '/orders/my',
      providesTags: ['Order'],
    }),
    createOrder: builder.mutation({
      query: (orderData) => ({ url: '/orders', method: 'POST', body: orderData }),
      invalidatesTags: ['Order', 'Cart'],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, orderStatus }) => ({ url: `/orders/${id}/status`, method: 'PATCH', body: { orderStatus } }),
      invalidatesTags: ['Order'],
    }),

    // Wishlist
    getWishlist: builder.query({
      query: () => '/wishlist',
      providesTags: ['Wishlist'],
    }),
    addToWishlist: builder.mutation({
      query: (productId) => ({ url: `/wishlist/add/${productId}`, method: 'POST' }),
      invalidatesTags: ['Wishlist'],
    }),
    removeFromWishlist: builder.mutation({
      query: (productId) => ({ url: `/wishlist/remove/${productId}`, method: 'DELETE' }),
      invalidatesTags: ['Wishlist'],
    }),

    // Address
    getAddresses: builder.query({
      query: () => '/address/my',
      providesTags: ['Address'],
    }),
    createAddress: builder.mutation({
      query: (address) => ({ url: '/address', method: 'POST', body: address }),
      invalidatesTags: ['Address'],
    }),
    updateAddress: builder.mutation({
      query: ({ id, ...address }) => ({ url: `/address/${id}`, method: 'PATCH', body: address }),
      invalidatesTags: ['Address'],
    }),
    deleteAddress: builder.mutation({
      query: (id) => ({ url: `/address/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Address'],
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
  useGetMyOrdersQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} = ecommerceApi