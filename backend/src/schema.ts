import { pgTable, serial, text, numeric, boolean, timestamp, integer, index } from 'drizzle-orm/pg-core';

// Users table (Better Auth schema extended with custom app properties & marketplace roles)
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  role: text('is_admin').default('USER'), // CUSTOMER (USER), VENDOR, ADMIN, SUPER_ADMIN
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

// Vendors table (Multi-vendor platform seller profiles)
export const vendors = pgTable('vendors', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  storeName: text('store_name').notNull(),
  slug: text('slug').notNull().unique(),
  ownerName: text('owner_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  description: text('description'),
  address: text('address'),
  logo: text('logo'),
  banner: text('banner'),
  taxId: text('tax_id'),
  bankDetails: text('bank_details'),
  status: text('status').notNull().default('PENDING'), // PENDING, APPROVED, REJECTED, SUSPENDED
  rating: numeric('rating', { precision: 3, scale: 2 }).default('0'),
  reviewCount: integer('review_count').default(0),
  commissionRate: numeric('commission_rate', { precision: 5, scale: 2 }), // optional custom commission % override
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    userIdIdx: index('vendors_user_id_idx').on(table.userId),
    slugIdx: index('vendors_slug_idx').on(table.slug),
    statusIdx: index('vendors_status_idx').on(table.status),
  };
});

// Categories table
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug'),
  description: text('description'),
  image: text('image'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// SubCategories table
export const subCategories = pgTable('sub_categories', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  image: text('image'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    categoryIdIdx: index('sub_categories_category_id_idx').on(table.categoryId),
  };
});

// Brands table
export const brands = pgTable('brands', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  logo: text('logo'),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Products table (Generic multi-category marketplace product model)
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  vendorId: integer('vendor_id').references(() => vendors.id),
  categoryId: integer('category_id').references(() => categories.id),
  subCategoryId: integer('sub_category_id').references(() => subCategories.id),
  brandId: integer('brand_id').references(() => brands.id),
  name: text('name').notNull(),
  slug: text('slug'),
  brand: text('brand').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  originalPrice: numeric('original_price', { precision: 10, scale: 2 }),
  compareAtPrice: numeric('compare_at_price', { precision: 10, scale: 2 }),
  costPrice: numeric('cost_price', { precision: 10, scale: 2 }),
  rating: numeric('rating', { precision: 3, scale: 2 }).notNull().default('0'),
  reviews: integer('reviews').notNull().default(0),
  image: text('image').notNull(),
  images: text('images'), // JSON array string
  description: text('description'),
  shortDescription: text('short_description'),
  sku: text('sku'),
  isNew: boolean('is_new').default(false),
  isSale: boolean('is_sale').default(false),
  isFeatured: boolean('is_featured').default(false),
  category: text('category').notNull().default('fragrance'),
  stock: integer('stock').notNull().default(0),
  status: text('status').notNull().default('ACTIVE'), // DRAFT, ACTIVE, ARCHIVED, PENDING_APPROVAL
  specifications: text('specifications'), // JSON string for category-specific properties
  attributes: text('attributes'), // JSON string for key-value tags
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    vendorIdIdx: index('products_vendor_id_idx').on(table.vendorId),
    categoryIdIdx: index('products_category_id_idx').on(table.categoryId),
    slugIdx: index('products_slug_idx').on(table.slug),
    statusIdx: index('products_status_idx').on(table.status),
  };
});

// Product variants table
export const productVariants = pgTable('product_variants', {
  id: serial('id').primaryKey(),
  productId: integer('productId').notNull().references(() => products.id, { onDelete: 'cascade' }),
  name: text('name'), // e.g. "Red / XL" or "100ml / EDP"
  size: text('size'),
  volume: text('volume'),
  color: text('color'),
  attributeName: text('attribute_name'),
  attributeValue: text('attribute_value'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  stock: integer('stock').notNull().default(0),
  sku: text('sku'),
  image: text('image'),
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
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  vendorId: integer('vendor_id').references(() => vendors.id),
  userId: text('user_id').references(() => user.id),
  orderId: integer('order_id'),
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
    vendorIdIdx: index('reviews_vendor_id_idx').on(table.vendorId),
    userIdIdx: index('reviews_user_id_idx').on(table.userId),
  };
});

// Parent Orders table
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => user.id),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerPhone: text('customer_phone'),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  shippingAmount: numeric('shipping_amount', { precision: 10, scale: 2 }).default('0'),
  discountAmount: numeric('discount_amount', { precision: 10, scale: 2 }).default('0'),
  status: text('status').notNull().default('pending'), // pending, processing, shipped, delivered, cancelled
  paymentStatus: text('payment_status').default('pending'), // pending, paid, failed, refunded
  shippingAddress: text('shipping_address').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    userIdIdx: index('orders_user_id_idx').on(table.userId),
    statusIdx: index('orders_status_idx').on(table.status),
  };
});

// Vendor Sub-Orders table (Partitioned orders per vendor in a single checkout)
export const vendorOrders = pgTable('vendor_orders', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  vendorId: integer('vendor_id').notNull().references(() => vendors.id),
  status: text('status').notNull().default('PENDING'), // PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, RETURNED, REFUNDED
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
  shippingCost: numeric('shipping_cost', { precision: 10, scale: 2 }).default('0'),
  commissionAmount: numeric('commission_amount', { precision: 10, scale: 2 }).default('0'),
  vendorEarnings: numeric('vendor_earnings', { precision: 10, scale: 2 }).default('0'),
  trackingNumber: text('tracking_number'),
  carrier: text('carrier'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    orderIdIdx: index('vendor_orders_order_id_idx').on(table.orderId),
    vendorIdIdx: index('vendor_orders_vendor_id_idx').on(table.vendorId),
    statusIdx: index('vendor_orders_status_idx').on(table.status),
  };
});

// Order Items table
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  vendorOrderId: integer('vendor_order_id').references(() => vendorOrders.id, { onDelete: 'cascade' }),
  vendorId: integer('vendor_id').references(() => vendors.id),
  productId: integer('product_id').notNull().references(() => products.id),
  variantId: integer('variant_id').references(() => productVariants.id),
  productName: text('product_name').notNull(),
  productImage: text('product_image'),
  variantInfo: text('variant_info'),
  quantity: integer('quantity').notNull().default(1),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  totalPrice: numeric('total_price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    orderIdIdx: index('order_items_order_id_idx').on(table.orderId),
    vendorOrderIdIdx: index('order_items_vendor_order_id_idx').on(table.vendorOrderId),
    vendorIdIdx: index('order_items_vendor_id_idx').on(table.vendorId),
    productIdIdx: index('order_items_product_id_idx').on(table.productId),
  };
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
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    userIdIdx: index('wishlist_user_id_idx').on(table.userId),
    productIdIdx: index('wishlist_product_id_idx').on(table.productId),
    userProductIdx: index('wishlist_user_product_idx').on(table.userId, table.productId),
  };
});

// Shopping cart table (Supports multi-vendor cart items)
export const shoppingCart = pgTable('shopping_cart', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
  sessionId: text('session_id'),
  vendorId: integer('vendor_id').references(() => vendors.id),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  variantId: integer('variant_id').references(() => productVariants.id),
  quantity: integer('quantity').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    userIdIdx: index('shopping_cart_user_id_idx').on(table.userId),
    sessionIdIdx: index('shopping_cart_session_id_idx').on(table.sessionId),
    vendorIdIdx: index('shopping_cart_vendor_id_idx').on(table.vendorId),
    productIdIdx: index('shopping_cart_product_id_idx').on(table.productId),
    userProductIdx: index('shopping_cart_user_product_idx').on(table.userId, table.productId),
    sessionProductIdx: index('shopping_cart_session_product_idx').on(table.sessionId, table.productId),
  };
});

// Addresses table
export const addresses = pgTable('addresses', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  fullName: text('full_name').notNull(),
  addressLine1: text('address_line_1').notNull(),
  addressLine2: text('address_line_2'),
  city: text('city').notNull(),
  state: text('state').notNull(),
  postalCode: text('postal_code').notNull(),
  country: text('country').notNull(),
  phone: text('phone'),
  isDefault: boolean('is_default').default(false),
  addressType: text('address_type'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Notifications table
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false),
  actionUrl: text('action_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Platform Commission Settings
export const commissions = pgTable('commissions', {
  id: serial('id').primaryKey(),
  defaultRate: numeric('default_rate', { precision: 5, scale: 2 }).notNull().default('10.00'), // 10.00%
  description: text('description').default('Global platform commission percentage'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Vendor Payouts table
export const vendorPayouts = pgTable('vendor_payouts', {
  id: serial('id').primaryKey(),
  vendorId: integer('vendor_id').notNull().references(() => vendors.id),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull().default('PENDING'), // PENDING, PROCESSING, COMPLETED, FAILED
  referenceNumber: text('reference_number'),
  notes: text('notes'),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    vendorIdIdx: index('vendor_payouts_vendor_id_idx').on(table.vendorId),
  };
});

// Coupons table
export const coupons = pgTable('coupons', {
  id: serial('id').primaryKey(),
  vendorId: integer('vendor_id').references(() => vendors.id), // Null for platform coupons, vendor ID for vendor-specific promotions
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
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
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
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  description: text('description'),
  image: text('image'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Social links table
export const socialLinks = pgTable('social_links', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  url: text('url').notNull(),
  image: text('image').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Order shipping details table
export const orderShippingDetails = pgTable('order_shipping_details', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
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
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  paymentMethod: text('payment_method').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('USD'),
  status: text('status').notNull(),
  transactionId: text('transaction_id').unique(),
  paymentDate: timestamp('payment_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Countries table
export const countries = pgTable('countries', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  code: text('code').notNull().unique(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Promo banner table
export const promoBanner = pgTable('promo_banner', {
  id: serial('id').primaryKey(),
  title: text('title').notNull().default('Elegance'),
  description: text('description'),
  image: text('image').notNull().default('https://res.cloudinary.com/dujjidn0e/image/upload/v1781626156/vellvista/product/hzbpvaobukfgznudrw7x.jpg'),
  isActive: boolean('is_active').default(true).notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Hero settings table
export const heroSettings = pgTable('hero_settings', {
  id: serial('id').primaryKey(),
  title: text('title').notNull().default('The Art of Fragrance'),
  subtitle: text('subtitle').default('summer collection 26'),
  mobileVideo: text('mobile_video').notNull().default('/mobile.mp4'),
  desktopVideo: text('desktop_video').notNull().default('/desk.mp4'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// FAQs table
export const faqs = pgTable('faqs', {
  id: serial('id').primaryKey(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Homepage Categories table
export const homepageCategories = pgTable('homepage_categories', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  categorySlug: text('category_slug').notNull(),
  image: text('image').notNull(),
  gridSpan: text('grid_span').notNull().default('col-span-1'),
  height: text('height').notNull().default('h-[192px]'),
  sortOrder: integer('sort_order').default(0).notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Marquee Messages table
export const marqueeMessages = pgTable('marquee_messages', {
  id: serial('id').primaryKey(),
  text: text('text').notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Brand settings table
export const brandSettings = pgTable('brand_settings', {
  id: serial('id').primaryKey(),
  brandName: text('brand_name').notNull().default('VellVista'),
  brandLogo: text('brand_logo').notNull().default('https://res.cloudinary.com/dujjidn0e/image/upload/v1781626147/vellvista/logo/w5kkgq9suiw7sk4poxsz.png'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Types for TypeScript
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type Vendor = typeof vendors.$inferSelect;
export type NewVendor = typeof vendors.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type SubCategory = typeof subCategories.$inferSelect;
export type NewSubCategory = typeof subCategories.$inferInsert;
export type Brand = typeof brands.$inferSelect;
export type NewBrand = typeof brands.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type VendorOrder = typeof vendorOrders.$inferSelect;
export type NewVendorOrder = typeof vendorOrders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type Commission = typeof commissions.$inferSelect;
export type NewCommission = typeof commissions.$inferInsert;
export type VendorPayout = typeof vendorPayouts.$inferSelect;
export type NewVendorPayout = typeof vendorPayouts.$inferInsert;
export type Subscriber = typeof subscribers.$inferSelect;
export type NewSubscriber = typeof subscribers.$inferInsert;
export type Faq = typeof faqs.$inferSelect;
export type NewFaq = typeof faqs.$inferInsert;
export type HomepageCategory = typeof homepageCategories.$inferSelect;
export type NewHomepageCategory = typeof homepageCategories.$inferInsert;
export type MarqueeMessage = typeof marqueeMessages.$inferSelect;
export type NewMarqueeMessage = typeof marqueeMessages.$inferInsert;
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
export type SocialLink = typeof socialLinks.$inferSelect;
export type NewSocialLink = typeof socialLinks.$inferInsert;
export type PromoBanner = typeof promoBanner.$inferSelect;
export type NewPromoBanner = typeof promoBanner.$inferInsert;
export type HeroSettings = typeof heroSettings.$inferSelect;
export type NewHeroSettings = typeof heroSettings.$inferInsert;
export type BrandSettings = typeof brandSettings.$inferSelect;
export type NewBrandSettings = typeof brandSettings.$inferInsert;
