import { useState, useEffect } from 'react';
import { trpc } from '../utils/trpc';

export interface Product {
  id: number;
  name: string;
  brand: string;
  price: number | string;
  originalPrice?: number | string | null;
  rating: number | string;
  reviews: number;
  image: string;
  description?: string | null;
  isNew?: boolean;
  isSale?: boolean;
  stock?: number;
  category?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string | null;
}

function useQueryWrapper<T, I>(
  queryFn: (input: I) => Promise<T>,
  input: I,
  enabled = true
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);

    queryFn(input)
      .then((res) => {
        if (active) {
          setData(res);
          setError(null);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [JSON.stringify(input), enabled]);

  return { data, isLoading, error };
}

function useMutationWrapper<T, I>(
  mutationFn: (input: I) => Promise<T>
) {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (input: I) => {
    setIsPending(true);
    setIsSuccess(false);
    setError(null);
    try {
      const res = await mutationFn(input);
      setIsSuccess(true);
      return res;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending, isSuccess, error };
}

// Product queries
export function useProducts(limit = 20, offset = 0) {
  return useQueryWrapper<Product[], { limit: number; offset: number }>(
    (input) => trpc.getProducts(input),
    { limit, offset }
  );
}

export function useProductById(id: number) {
  return useQueryWrapper<Product | null, { id: number }>(
    (input) => trpc.getProductById(input),
    { id }
  );
}

export function useSearchProducts(
  query?: string,
  category?: string,
  minPrice?: string,
  maxPrice?: string,
  limit = 20,
  offset = 0
) {
  const enabled = !!(query || category || minPrice || maxPrice);
  return useQueryWrapper<Product[], { query?: string; category?: string; minPrice?: string; maxPrice?: string; limit: number; offset: number }>(
    (input) => trpc.searchProducts(input).then((res: { products: Product[]; total: number }) => res.products),
    { query, category, minPrice, maxPrice, limit, offset },
    enabled
  );
}

export function useFeaturedProducts(limit = 8) {
  return useQueryWrapper<Product[], { limit: number }>(
    (input) => trpc.getFeaturedProducts(input),
    { limit }
  );
}

export function useProductsByCategory(
  category: string,
  limit = 20,
  offset = 0
) {
  return useQueryWrapper<Product[], { category: string; limit: number; offset: number }>(
    (input) => trpc.getProductsByCategory(input),
    { category, limit, offset },
    !!category
  );
}

export function useCategories() {
  return useQueryWrapper<Category[], undefined>(
    () => trpc.getCategories(),
    undefined
  );
}

export function useHealthCheck() {
  return useQueryWrapper<{ status: string; timestamp: string }, undefined>(
    () => trpc.healthCheck(),
    undefined
  );
}

// Product mutations
export function useCreateProduct() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useMutationWrapper<any, any>((input) => trpc.createProduct(input));
}

export function useUpdateProduct() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useMutationWrapper<any, { id: number; data: any }>((input) => trpc.updateProduct(input));
}

export function useDeleteProduct() {
  return useMutationWrapper<{ success: boolean }, { id: number }>((input) => trpc.deleteProduct(input));
}

// Newsletter
export function useSubscribeToNewsletter() {
  return useMutationWrapper<{ success: boolean; message: string }, { email: string }>((input) =>
    trpc.subscribeToNewsletter(input)
  );
}

export interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  totalAmount: string;
  status: string;
  shippingAddress: string;
  createdAt?: string;
  updatedAt?: string;
}

export function useUserOrders(email?: string) {
  return useQueryWrapper<Order[], { email?: string }>(
    (input) => trpc.getUserOrders(input as { email: string }),
    { email },
    !!email
  );
}

// Admin dashboard queries & mutations
export function useAdminOrders() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useQueryWrapper<any[], undefined>(
    () => trpc.getAllOrders(),
    undefined
  );
}

export function useUpdateOrderStatus() {
  return useMutationWrapper<{ success: boolean }, { id: number; status: string }>((input) =>
    trpc.updateOrderStatus(input)
  );
}

export function useAdminReviews() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useQueryWrapper<any[], undefined>(
    () => trpc.getAllReviews(),
    undefined
  );
}

export function useApproveReview() {
  return useMutationWrapper<{ success: boolean }, { id: number }>((input) =>
    trpc.approveReview(input)
  );
}

export function useDeleteReview() {
  return useMutationWrapper<{ success: boolean }, { id: number }>((input) =>
    trpc.deleteReview(input)
  );
}

export function useAdminSubscribers() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useQueryWrapper<any[], undefined>(
    () => trpc.getSubscribers(),
    undefined
  );
}

export function useAdminUsers(adminId?: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useQueryWrapper<any[], { adminId?: string }>(
    (input) => trpc.getAllUsers(input),
    { adminId },
    !!adminId
  );
}

export function useUpdateUserRole() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useMutationWrapper<{ success: boolean; user: any }, { adminId: string; targetUserId: string; role: string }>((input) =>
    trpc.updateUserRole(input)
  );
}

export function useUpdateUserStatus() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useMutationWrapper<{ success: boolean; user: any }, { adminId: string; targetUserId: string; isActive: boolean }>((input) =>
    trpc.updateUserStatus(input)
  );
}

export function useDeleteUser() {
  return useMutationWrapper<{ success: boolean }, { adminId: string; targetUserId: string }>((input) =>
    trpc.deleteUser(input)
  );
}

// Country operations
export interface Country {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function useCountries(onlyActive = false) {
  return useQueryWrapper<Country[], { onlyActive?: boolean }>(
    (input) => trpc.getCountries(input),
    { onlyActive }
  );
}

export function useAddCountry() {
  return useMutationWrapper<{ success: boolean }, { adminId: string; name: string; code: string }>((input) =>
    trpc.addCountry(input)
  );
}

export function useUpdateCountry() {
  return useMutationWrapper<{ success: boolean }, { adminId: string; countryId: number; name: string; code: string }>((input) =>
    trpc.updateCountry(input)
  );
}

export function useToggleCountryStatus() {
  return useMutationWrapper<{ success: boolean }, { adminId: string; countryId: number; isActive: boolean }>((input) =>
    trpc.toggleCountryStatus(input)
  );
}

export function useDeleteCountry() {
  return useMutationWrapper<{ success: boolean }, { adminId: string; countryId: number }>((input) =>
    trpc.deleteCountry(input)
  );
}

// Shipping method operations
export interface ShippingMethod {
  id: number;
  name: string;
  description?: string | null;
  cost: string;
  estimatedDays?: number | null;
  isActive: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export function useAdminShippingMethods(adminId?: string) {
  return useQueryWrapper<ShippingMethod[], { adminId?: string }>(
    (input) => trpc.adminGetShippingMethods(input as { adminId: string }),
    { adminId },
    !!adminId
  );
}

export function useAdminCreateShippingMethod() {
  return useMutationWrapper<{ success: boolean; method: ShippingMethod }, {
    adminId: string;
    name: string;
    description?: string;
    cost: string;
    estimatedDays?: number;
  }>((input) => trpc.adminCreateShippingMethod(input));
}

export function useAdminUpdateShippingMethod() {
  return useMutationWrapper<{ success: boolean; method: ShippingMethod }, {
    adminId: string;
    id: number;
    name: string;
    description?: string;
    cost: string;
    estimatedDays?: number;
    isActive: boolean;
  }>((input) => trpc.adminUpdateShippingMethod(input));
}

export function useAdminDeleteShippingMethod() {
  return useMutationWrapper<{ success: boolean }, { adminId: string; id: number }>((input) =>
    trpc.adminDeleteShippingMethod(input)
  );
}

// Payment method operations
export interface PaymentMethod {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export function usePaymentMethods() {
  return useQueryWrapper<PaymentMethod[], undefined>(
    () => trpc.getPaymentMethods(),
    undefined
  );
}

export function useAdminPaymentMethods(adminId?: string) {
  return useQueryWrapper<PaymentMethod[], { adminId?: string }>(
    (input) => trpc.adminGetPaymentMethods(input as { adminId: string }),
    { adminId },
    !!adminId
  );
}

export function useAdminCreatePaymentMethod() {
  return useMutationWrapper<{ success: boolean; method: PaymentMethod }, {
    adminId: string;
    name: string;
    code: string;
    description?: string;
  }>((input) => trpc.adminCreatePaymentMethod(input));
}

export function useAdminUpdatePaymentMethod() {
  return useMutationWrapper<{ success: boolean; method: PaymentMethod }, {
    adminId: string;
    id: number;
    name: string;
    code: string;
    description?: string;
    isActive: boolean;
  }>((input) => trpc.adminUpdatePaymentMethod(input));
}

export function useAdminDeletePaymentMethod() {
  return useMutationWrapper<{ success: boolean }, { adminId: string; id: number }>((input) =>
    trpc.adminDeletePaymentMethod(input)
  );
}

// Admin coupon/offer hooks
export interface Coupon {
  id: number;
  code: string;
  description?: string | null;
  discountType: string;
  discountValue: string;
  minOrderAmount?: string | null;
  maxDiscountAmount?: string | null;
  usageLimit?: number | null;
  usedCount?: number | null;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function useAdminCoupons(adminId?: string) {
  return useQueryWrapper<Coupon[], { adminId?: string }>(
    (input) => trpc.adminGetAllCoupons(input as { adminId: string }),
    { adminId },
    !!adminId
  );
}

export function useAdminCreateCoupon() {
  return useMutationWrapper<{ success: boolean }, {
    adminId: string;
    code: string;
    description?: string;
    discountType: string;
    discountValue: string;
    minOrderAmount?: string;
    maxDiscountAmount?: string;
    usageLimit?: number;
    validFrom: string;
    validTo: string;
  }>((input) => trpc.adminCreateCoupon(input));
}

export function useAdminToggleCouponStatus() {
  return useMutationWrapper<{ success: boolean }, {
    adminId: string;
    couponId: number;
    isActive: boolean;
  }>((input) => trpc.adminToggleCouponStatus(input));
}

export function useAdminDeleteCoupon() {
  return useMutationWrapper<{ success: boolean }, { adminId: string; couponId: number }>((input) =>
    trpc.adminDeleteCoupon(input)
  );
}



