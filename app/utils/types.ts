// Type definitions for tRPC backend (separate project)
export interface Product {
  id: number;
  name: string;
  brand: string;
  price: string;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  isNew: boolean;
  isSale: boolean;
  category: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface NewsletterSubscription {
  email: string;
  subscribedAt: string;
}

// Define React Query result type
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface QueryResult<T> {
  data: T;
  isLoading: boolean;
  error: null;
  refetch: () => void;
  isFetching: boolean;
  isSuccess: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface MutationResult<T, TInput = unknown> {
  mutate: (data: TInput) => Promise<T>;
  isLoading: boolean;
  error: null;
  reset: () => void;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
}

// Input schemas based on backend
export interface RegisterInput {
  email: string;
  name: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface GoogleLoginInput {
  email: string;
  name: string;
  avatar?: string;
  googleId: string;
}

export interface ProductQueryInput {
  limit?: number;
  offset?: number;
}

export interface ProductByIdInput {
  id: number;
}

export interface SearchProductsInput {
  query?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export interface FeaturedProductsInput {
  limit?: number;
}

export interface ProductsByCategoryInput {
  category: string;
  limit?: number;
  offset?: number;
}

export interface NewsletterInput {
  email: string;
}

// Output types
export interface AuthOutput {
  success: boolean;
  message: string;
  user: {
    id: number;
    email: string;
    name: string;
    avatar?: string;
  };
}

export interface Product {
  id: number;
  name: string;
  brand: string;
  price: string;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  isNew: boolean;
  isSale: boolean;
  category: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface HealthCheckOutput {
  status: string;
  timestamp: string;
}

export interface NewsletterOutput {
  success: boolean;
  message: string;
}
