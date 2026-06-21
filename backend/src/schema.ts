import { pgTable, serial, text, numeric, boolean, timestamp, integer, index } from 'drizzle-orm/pg-core';

// Users table (Better Auth schema extended with custom app properties)
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  role: text('is_admin').default('USER'),
  password: text('password'),
  googleId: text('google_id').unique(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Better Auth session table
export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
});

// Better Auth account table
export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Better Auth verification table
export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Product variants table
export const productVariants = pgTable('product_variants', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').notNull().references(() => products.id),
  size: text('size'),
  volume: text('volume'), // e.g., 50ml, 100ml
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  stock: integer('stock').notNull().default(0),
  sku: text('sku').unique(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    productIdIdx: index('product_variants_product_id_idx').on(table.productId),
  };
});

// Reviews table
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').notNull().references(() => products.id),
  userId: text('user_id').references(() => user.id),
  rating: integer('rating').notNull(), // 1-5
  title: text('title'),
  comment: text('comment'),
  userName: text('user_name'),
  image: text('image'),
  isVerified: boolean('is_verified').default(false),
  isApproved: boolean('is_approved').default(false),
  helpfulCount: integer('helpful_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    productIdIdx: index('reviews_product_id_idx').on(table.productId),
    userIdIdx: index('reviews_user_id_idx').on(table.userId),
  };
});

// Products table
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  brand: text('brand').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  originalPrice: numeric('original_price', { precision: 10, scale: 2 }),
  rating: numeric('rating', { precision: 3, scale: 2 }).notNull().default('0'),
  reviews: integer('reviews').notNull().default(0),
  image: text('image').notNull(),
  description: text('description'),
  isNew: boolean('is_new').default(false),
  isSale: boolean('is_sale').default(false),
  category: text('category').notNull().default('fragrance'),
  stock: integer('stock').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Categories table
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Orders table
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull().default('pending'),
  shippingAddress: text('shipping_address').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Newsletter subscribers
export const subscribers = pgTable('subscribers', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Wishlist table
export const wishlist = pgTable('wishlist', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id),
  productId: integer('product_id').notNull().references(() => products.id),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    userIdIdx: index('wishlist_user_id_idx').on(table.userId),
    productIdIdx: index('wishlist_product_id_idx').on(table.productId),
    userProductIdx: index('wishlist_user_product_idx').on(table.userId, table.productId),
  };
});

// Shopping cart table
export const shoppingCart = pgTable('shopping_cart', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => user.id),
  sessionId: text('session_id'),
  productId: integer('product_id').notNull().references(() => products.id),
  variantId: integer('variant_id').references(() => productVariants.id),
  quantity: integer('quantity').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    userIdIdx: index('shopping_cart_user_id_idx').on(table.userId),
    sessionIdIdx: index('shopping_cart_session_id_idx').on(table.sessionId),
    productIdIdx: index('shopping_cart_product_id_idx').on(table.productId),
    userProductIdx: index('shopping_cart_user_product_idx').on(table.userId, table.productId),
    sessionProductIdx: index('shopping_cart_session_product_idx').on(table.sessionId, table.productId),
  };
});

// Addresses table
export const addresses = pgTable('addresses', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id),
  fullName: text('full_name').notNull(),
  addressLine1: text('address_line_1').notNull(),
  addressLine2: text('address_line_2'),
  city: text('city').notNull(),
  state: text('state').notNull(),
  postalCode: text('postal_code').notNull(),
  country: text('country').notNull(),
  phone: text('phone'),
  isDefault: boolean('is_default').default(false),
  addressType: text('address_type'), // billing, shipping, both
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Notifications table
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id),
  type: text('type').notNull(), // order, promotion, account, etc.
  title: text('title').notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false),
  actionUrl: text('action_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Coupons table
export const coupons = pgTable('coupons', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  description: text('description'),
  discountType: text('discount_type').notNull(), // percentage, fixed_amount
  discountValue: numeric('discount_value', { precision: 10, scale: 2 }).notNull(),
  minOrderAmount: numeric('min_order_amount', { precision: 10, scale: 2 }),
  maxDiscountAmount: numeric('max_discount_amount', { precision: 10, scale: 2 }),
  usageLimit: integer('usage_limit'),
  usedCount: integer('used_count').default(0),
  validFrom: timestamp('valid_from').notNull(),
  validTo: timestamp('valid_to').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Applied coupons table
export const appliedCoupons = pgTable('applied_coupons', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id),
  couponId: integer('coupon_id').notNull().references(() => coupons.id),
  discountAmount: numeric('discount_amount', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Shipping methods table
export const shippingMethods = pgTable('shipping_methods', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  cost: numeric('cost', { precision: 10, scale: 2 }).notNull(),
  estimatedDays: integer('estimated_days'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Payment methods table
export const paymentMethods = pgTable('payment_methods', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(), // e.g. "Google Pay", "Debit Card", "Credit Card", "UPI"
  code: text('code').notNull().unique(), // e.g. "gpay", "debit_card", "credit_card", "upi"
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});


// Order shipping details table
export const orderShippingDetails = pgTable('order_shipping_details', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id),
  shippingMethodId: integer('shipping_method_id').references(() => shippingMethods.id),
  trackingNumber: text('tracking_number'),
  carrier: text('carrier'),
  estimatedDelivery: timestamp('estimated_delivery'),
  actualDelivery: timestamp('actual_delivery'),
  shippingAddress: text('shipping_address').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Payments table
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id),
  paymentMethod: text('payment_method').notNull(), // credit_card, paypal, etc.
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('USD'),
  status: text('status').notNull(), // pending, completed, failed, refunded
  transactionId: text('transaction_id').unique(),
  paymentDate: timestamp('payment_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Countries table
export const countries = pgTable('countries', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  code: text('code').notNull().unique(), // ISO 2-letter code, e.g. 'US'
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Types for TypeScript
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type Subscriber = typeof subscribers.$inferSelect;
export type NewSubscriber = typeof subscribers.$inferInsert;
export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type WishlistItem = typeof wishlist.$inferSelect;
export type NewWishlistItem = typeof wishlist.$inferInsert;
export type ShoppingCartItem = typeof shoppingCart.$inferSelect;
export type NewShoppingCartItem = typeof shoppingCart.$inferInsert;
export type Address = typeof addresses.$inferSelect;
export type NewAddress = typeof addresses.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type Coupon = typeof coupons.$inferSelect;
export type NewCoupon = typeof coupons.$inferInsert;
export type AppliedCoupon = typeof appliedCoupons.$inferSelect;
export type NewAppliedCoupon = typeof appliedCoupons.$inferInsert;
export type ShippingMethod = typeof shippingMethods.$inferSelect;
export type NewShippingMethod = typeof shippingMethods.$inferInsert;
export type OrderShippingDetail = typeof orderShippingDetails.$inferSelect;
export type NewOrderShippingDetail = typeof orderShippingDetails.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type Country = typeof countries.$inferSelect;
export type NewCountry = typeof countries.$inferInsert;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type NewPaymentMethod = typeof paymentMethods.$inferInsert;


