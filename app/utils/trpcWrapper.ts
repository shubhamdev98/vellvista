import { createTRPCProxyClient, httpBatchLink, loggerLink } from '@trpc/client';

const getBaseUrl = () => {
  const trpcUrl = process.env.NEXT_PUBLIC_TRPC_URL;
  if (trpcUrl) return trpcUrl;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (backendUrl) return `${backendUrl}/trpc`;
  return 'http://172.29.214.47:3001/trpc';
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const client = createTRPCProxyClient<any>({
  links: [
    loggerLink({
      enabled: (opts) =>
        process.env.NODE_ENV === 'development' &&
        typeof window === 'undefined' &&
        opts.direction === 'down',
    }),
    httpBatchLink({
      url: getBaseUrl(),
    }),
  ],
});

// Wrapper that calls tRPC procedures correctly:
// - Mutations use .mutate()
// - Queries use .query()
// We cast to any inline to bypass TypeScript's complex type resolution
// while maintaining correct runtime behavior.
export const trpc = {
  // Auth mutations
  register: async (input: { email: string; fullName: string; password: string }) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://172.29.214.47:3001'}/trpc/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }
    return data.result.data;
  },
  verifyRegistrationOtp: async (input: { email: string; otp: string }) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://172.29.214.47:3001'}/trpc/verifyRegistrationOtp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }
    return data.result.data;
  },
  login: async (input: { email: string; password: string }) => {
    console.log('Direct fetch login called with:', input);
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://172.29.214.47:3001'}/trpc/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    const data = await response.json();
    console.log('Direct fetch login result:', data);
    if (data.error) {
      throw new Error(data.error.message);
    }
    return data.result.data;
  },
  manualLogin: (input: { email: string; password: string }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).manualLogin.mutate(input),

  // Product queries
  getProducts: (input: { limit?: number; offset?: number }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).getProducts.query(input),
  getProductById: (input: { id: number }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).getProductById.query(input),
  searchProducts: (input: { query?: string; category?: string; limit?: number; offset?: number }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).searchProducts.query(input),
  getFeaturedProducts: (input: { limit?: number }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).getFeaturedProducts.query(input),
  getProductsByCategory: (input: { category: string; limit?: number; offset?: number }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).getProductsByCategory.query(input),

  // Category query
  getCategories: () =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).getCategories.query(),

  // Product mutations
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createProduct: (input: any) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).createProduct.mutate(input),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateProduct: (input: { id: number; data: any }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).updateProduct.mutate(input),
  deleteProduct: (input: { id: number }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).deleteProduct.mutate(input),

  // Health check query
  healthCheck: () =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).healthCheck.query(),

  // Newsletter mutation
  subscribeToNewsletter: (input: { email: string }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).subscribeToNewsletter.mutate(input),

  // Avatar mutation
  updateAvatar: (input: { id: string; avatar: string }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).updateAvatar.mutate(input),

  // Wishlist operations
  getWishlist: (input: { userId: string }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).getWishlist.query(input),
  addToWishlist: (input: { userId: string; productId: number }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).addToWishlist.mutate(input),
  removeFromWishlist: (input: { userId: string; productId: number }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).removeFromWishlist.mutate(input),

  // Reviews operations
  getProductReviews: (input: { productId: number }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).getProductReviews.query(input),
  addReview: (input: { productId: number; userId: string; rating: number; title?: string; comment?: string }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).addReview.mutate(input),

  // Address operations
  getAddresses: (input: { userId: string }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).getAddresses.query(input),
  addAddress: (input: { userId: string; fullName: string; addressLine1: string; addressLine2?: string; city: string; state: string; postalCode: string; country: string; phone?: string; addressType?: string; isDefault?: boolean }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).addAddress.mutate(input),
  updateAddress: (input: { id: number; userId: string; fullName?: string; addressLine1?: string; addressLine2?: string; city?: string; state?: string; postalCode?: string; country?: string; phone?: string; addressType?: string; isDefault?: boolean }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).updateAddress.mutate(input),
  deleteAddress: (input: { id: number; userId: string }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).deleteAddress.mutate(input),

  // Shopping cart operations
  getCart: (input: { userId?: string; sessionId?: string }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).getCart.query(input),
  addToCart: (input: { userId?: string; sessionId?: string; productId: number; variantId?: number; quantity?: number }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).addToCart.mutate(input),
  updateCartItem: (input: { id: number; quantity: number }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).updateCartItem.mutate(input),
  removeFromCart: (input: { id: number }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).removeFromCart.mutate(input),
  clearCart: (input: { userId?: string; sessionId?: string }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).clearCart.mutate(input),

  // Shipping methods operations
  getShippingMethods: () =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).getShippingMethods.query(),

  // Payment operations
  createPayment: (input: { orderId: number; paymentMethod: string; amount: string; transactionId?: string }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).createPayment.mutate(input),
  updatePaymentStatus: (input: { id: number; status: string; transactionId?: string }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).updatePaymentStatus.mutate(input),

  // Order shipping details operations
  createOrderShipping: (input: { orderId: number; shippingMethodId: number; shippingAddress: string; trackingNumber?: string; carrier?: string }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).createOrderShipping.mutate(input),

  // Coupon operations
  validateCoupon: (input: { code: string; orderAmount: string }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).validateCoupon.query(input),
  applyCoupon: (input: { orderId: number; couponCode: string; discountAmount: string }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).applyCoupon.mutate(input),

  // Notification operations
  getNotifications: (input: { userId: string }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).getNotifications.query(input),
  createNotification: (input: { userId: string; type: string; title: string; message: string; actionUrl?: string }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).createNotification.mutate(input),
  markNotificationAsRead: (input: { id: number }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).markNotificationAsRead.mutate(input),
  markAllNotificationsAsRead: (input: { userId: string }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).markAllNotificationsAsRead.mutate(input),

  // Product variants operations
  getProductVariants: (input: { productId: number }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).getProductVariants.query(input),

  // Admin operations
  getAllOrders: () =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).getAllOrders.query(),
  updateOrderStatus: (input: { id: number; status: string }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).updateOrderStatus.mutate(input),
  getAllReviews: () =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).getAllReviews.query(),
  approveReview: (input: { id: number }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).approveReview.mutate(input),
  deleteReview: (input: { id: number }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).deleteReview.mutate(input),
  getSubscribers: () =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).getSubscribers.query(),
  getAllUsers: (input?: { adminId?: string }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).getAllUsers.query(input || {}),
  getUserProfile: (input: { id: string }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).getUserProfile.query(input),
  updateUserRole: (input: { adminId: string; targetUserId: string; role: string }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).updateUserRole.mutate(input),
  updateUserStatus: (input: { adminId: string; targetUserId: string; isActive: boolean }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).updateUserStatus.mutate(input),
  deleteUser: (input: { adminId: string; targetUserId: string }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).deleteUser.mutate(input),

  // Country operations
  getCountries: (input?: { onlyActive?: boolean }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).getCountries.query(input || {}),
  getStatesOfCountry: (input: { countryCode: string }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).getStatesOfCountry.query(input),
  getCitiesOfState: (input: { countryCode: string; stateCode: string }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).getCitiesOfState.query(input),
  addCountry: (input: { adminId: string; name: string; code: string }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).addCountry.mutate(input),
  updateCountry: (input: { adminId: string; countryId: number; name: string; code: string }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).updateCountry.mutate(input),
  toggleCountryStatus: (input: { adminId: string; countryId: number; isActive: boolean }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).toggleCountryStatus.mutate(input),
  deleteCountry: (input: { adminId: string; countryId: number }) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any).deleteCountry.mutate(input),
};

