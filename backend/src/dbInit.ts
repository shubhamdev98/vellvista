import { client } from './db';

async function execSql(sql: string, stepName: string) {
  try {
    await client.unsafe(sql);
  } catch (err: any) {
    console.warn(`⚠️ DB Auto-migration step [${stepName}] note:`, err.message || err);
  }
}

export async function ensureDatabaseSchema() {
  console.log('🔄 Checking and auto-migrating database schema...');

  const statements: [string, string][] = [
    [`CREATE TABLE IF NOT EXISTS "user" (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, email_verified BOOLEAN DEFAULT false, image TEXT, is_admin TEXT DEFAULT 'USER', password TEXT, google_id TEXT UNIQUE, is_active BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW());`, 'user'],
    [`CREATE TABLE IF NOT EXISTS vendors (id SERIAL PRIMARY KEY, user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE, store_name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, owner_name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT, description TEXT, address TEXT, logo TEXT, banner TEXT, tax_id TEXT, bank_details TEXT, status TEXT NOT NULL DEFAULT 'PENDING', rating NUMERIC(3, 2) DEFAULT '0', review_count INTEGER DEFAULT 0, commission_rate NUMERIC(5, 2), created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW());`, 'vendors'],
    [`CREATE TABLE IF NOT EXISTS categories (id SERIAL PRIMARY KEY, name TEXT NOT NULL UNIQUE, slug TEXT, description TEXT, image TEXT, is_active BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT NOW());`, 'categories'],
    [`CREATE TABLE IF NOT EXISTS sub_categories (id SERIAL PRIMARY KEY, category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, description TEXT, image TEXT, is_active BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT NOW());`, 'sub_categories'],
    [`CREATE TABLE IF NOT EXISTS brands (id SERIAL PRIMARY KEY, name TEXT NOT NULL UNIQUE, slug TEXT NOT NULL UNIQUE, logo TEXT, description TEXT, is_active BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT NOW());`, 'brands'],
    [`CREATE TABLE IF NOT EXISTS products (id SERIAL PRIMARY KEY, name TEXT NOT NULL, brand TEXT NOT NULL, price NUMERIC(10, 2) NOT NULL, image TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'fragrance', stock INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW());`, 'products'],
    [`CREATE TABLE IF NOT EXISTS shopping_cart (id SERIAL PRIMARY KEY, user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE, session_id TEXT, product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE, quantity INTEGER NOT NULL DEFAULT 1, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW());`, 'shopping_cart'],
    [`CREATE TABLE IF NOT EXISTS wishlist (id SERIAL PRIMARY KEY, user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE, product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE, created_at TIMESTAMP DEFAULT NOW());`, 'wishlist'],
    [`CREATE TABLE IF NOT EXISTS reviews (id SERIAL PRIMARY KEY, product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE, user_id TEXT REFERENCES "user"(id), rating INTEGER NOT NULL, title TEXT, comment TEXT, user_name TEXT, image TEXT, is_verified BOOLEAN DEFAULT false, is_approved BOOLEAN DEFAULT false, helpful_count INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW());`, 'reviews'],
    [`CREATE TABLE IF NOT EXISTS orders (id SERIAL PRIMARY KEY, user_id TEXT REFERENCES "user"(id), customer_name TEXT NOT NULL, customer_email TEXT NOT NULL, customer_phone TEXT, total_amount NUMERIC(10, 2) NOT NULL, shipping_amount NUMERIC(10, 2) DEFAULT '0', discount_amount NUMERIC(10, 2) DEFAULT '0', status TEXT NOT NULL DEFAULT 'pending', payment_status TEXT DEFAULT 'pending', shipping_address TEXT NOT NULL, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW());`, 'orders'],
    [`CREATE TABLE IF NOT EXISTS vendor_orders (id SERIAL PRIMARY KEY, order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE, vendor_id INTEGER NOT NULL REFERENCES vendors(id), status TEXT NOT NULL DEFAULT 'PENDING', subtotal NUMERIC(10, 2) NOT NULL, shipping_cost NUMERIC(10, 2) DEFAULT '0', commission_amount NUMERIC(10, 2) DEFAULT '0', vendor_earnings NUMERIC(10, 2) DEFAULT '0', tracking_number TEXT, carrier TEXT, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW());`, 'vendor_orders'],
    [`CREATE TABLE IF NOT EXISTS order_items (id SERIAL PRIMARY KEY, order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE, product_id INTEGER NOT NULL REFERENCES products(id), product_name TEXT NOT NULL, product_image TEXT, quantity INTEGER NOT NULL DEFAULT 1, unit_price NUMERIC(10, 2) NOT NULL, total_price NUMERIC(10, 2) NOT NULL, created_at TIMESTAMP DEFAULT NOW());`, 'order_items'],
    [`CREATE TABLE IF NOT EXISTS product_variants (id SERIAL PRIMARY KEY, product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE, name TEXT, size TEXT, volume TEXT, color TEXT, attribute_name TEXT, attribute_value TEXT, price NUMERIC(10, 2) NOT NULL, stock INTEGER DEFAULT 0 NOT NULL, sku TEXT, image TEXT, is_active BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW());`, 'product_variants'],
    [`CREATE TABLE IF NOT EXISTS vendor_payouts (id SERIAL PRIMARY KEY, vendor_id INTEGER NOT NULL REFERENCES vendors(id), amount NUMERIC(10, 2) NOT NULL, status TEXT NOT NULL DEFAULT 'PENDING', reference_number TEXT, notes TEXT, paid_at TIMESTAMP, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW());`, 'vendor_payouts'],
    [`CREATE TABLE IF NOT EXISTS coupons (id SERIAL PRIMARY KEY, vendor_id INTEGER REFERENCES vendors(id), code TEXT NOT NULL UNIQUE, description TEXT, discount_type TEXT NOT NULL, discount_value NUMERIC(10, 2) NOT NULL, min_order_amount NUMERIC(10, 2), max_discount_amount NUMERIC(10, 2), usage_limit INTEGER, used_count INTEGER DEFAULT 0, valid_from TIMESTAMP NOT NULL, valid_to TIMESTAMP NOT NULL, is_active BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW());`, 'coupons'],
    [`CREATE TABLE IF NOT EXISTS applied_coupons (id SERIAL PRIMARY KEY, order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE, coupon_id INTEGER NOT NULL REFERENCES coupons(id), discount_amount NUMERIC(10, 2) NOT NULL, created_at TIMESTAMP DEFAULT NOW());`, 'applied_coupons'],
    [`CREATE TABLE IF NOT EXISTS shipping_methods (id SERIAL PRIMARY KEY, name TEXT NOT NULL, description TEXT, cost NUMERIC(10, 2) NOT NULL, estimated_days INTEGER, is_active BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW());`, 'shipping_methods'],
    [`CREATE TABLE IF NOT EXISTS payment_methods (id SERIAL PRIMARY KEY, name TEXT NOT NULL, code TEXT NOT NULL UNIQUE, description TEXT, image TEXT, is_active BOOLEAN DEFAULT true NOT NULL, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW());`, 'payment_methods'],
    [`CREATE TABLE IF NOT EXISTS social_links (id SERIAL PRIMARY KEY, name TEXT NOT NULL, url TEXT NOT NULL, image TEXT NOT NULL, is_active BOOLEAN DEFAULT true NOT NULL, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW());`, 'social_links'],
    [`CREATE TABLE IF NOT EXISTS order_shipping_details (id SERIAL PRIMARY KEY, order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE, shipping_method_id INTEGER REFERENCES shipping_methods(id), tracking_number TEXT, carrier TEXT, estimated_delivery TIMESTAMP, actual_delivery TIMESTAMP, shipping_address TEXT NOT NULL, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW());`, 'order_shipping_details'],
    [`CREATE TABLE IF NOT EXISTS payments (id SERIAL PRIMARY KEY, order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE, payment_method TEXT NOT NULL, amount NUMERIC(10, 2) NOT NULL, currency TEXT DEFAULT 'USD', status TEXT NOT NULL, transaction_id TEXT UNIQUE, payment_date TIMESTAMP, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW());`, 'payments'],
    [`CREATE TABLE IF NOT EXISTS countries (id SERIAL PRIMARY KEY, name TEXT NOT NULL UNIQUE, code TEXT NOT NULL UNIQUE, is_active BOOLEAN DEFAULT true NOT NULL, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW());`, 'countries'],
    [`CREATE TABLE IF NOT EXISTS promo_banner (id SERIAL PRIMARY KEY, title TEXT NOT NULL DEFAULT 'Elegance', description TEXT, image TEXT NOT NULL DEFAULT 'https://res.cloudinary.com/dujjidn0e/image/upload/v1781626156/vellvista/product/hzbpvaobukfgznudrw7x.jpg', is_active BOOLEAN DEFAULT true NOT NULL, updated_at TIMESTAMP DEFAULT NOW());`, 'promo_banner'],
    [`CREATE TABLE IF NOT EXISTS hero_settings (id SERIAL PRIMARY KEY, title TEXT NOT NULL DEFAULT 'The Art of Fragrance', subtitle TEXT DEFAULT 'summer collection 26', mobile_video TEXT NOT NULL DEFAULT '/mobile.mp4', desktop_video TEXT NOT NULL DEFAULT '/desk.mp4', updated_at TIMESTAMP DEFAULT NOW());`, 'hero_settings'],
    [`CREATE TABLE IF NOT EXISTS faqs (id SERIAL PRIMARY KEY, question TEXT NOT NULL, answer TEXT NOT NULL, sort_order INTEGER DEFAULT 0 NOT NULL, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW());`, 'faqs'],
    [`CREATE TABLE IF NOT EXISTS homepage_categories (id SERIAL PRIMARY KEY, title TEXT NOT NULL, subtitle TEXT, category_slug TEXT NOT NULL, image TEXT NOT NULL, grid_span TEXT NOT NULL DEFAULT 'col-span-1', height TEXT NOT NULL DEFAULT 'h-[192px]', sort_order INTEGER DEFAULT 0 NOT NULL, updated_at TIMESTAMP DEFAULT NOW());`, 'homepage_categories'],
    [`CREATE TABLE IF NOT EXISTS marquee_messages (id SERIAL PRIMARY KEY, text TEXT NOT NULL, sort_order INTEGER DEFAULT 0 NOT NULL, updated_at TIMESTAMP DEFAULT NOW());`, 'marquee_messages'],
    [`CREATE TABLE IF NOT EXISTS brand_settings (id SERIAL PRIMARY KEY, brand_name TEXT NOT NULL DEFAULT 'VellVista', brand_logo TEXT NOT NULL DEFAULT 'https://res.cloudinary.com/dujjidn0e/image/upload/v1781626147/vellvista/logo/w5kkgq9suiw7sk4poxsz.png', updated_at TIMESTAMP DEFAULT NOW());`, 'brand_settings'],

    // Column additions (ensures all tables have required columns even if table existed before)
    [`ALTER TABLE coupons ADD COLUMN IF NOT EXISTS vendor_id INTEGER REFERENCES vendors(id);`, 'coupons_vendor_id'],
    [`ALTER TABLE coupons ADD COLUMN IF NOT EXISTS min_order_amount NUMERIC(10, 2);`, 'coupons_min_order_amount'],
    [`ALTER TABLE coupons ADD COLUMN IF NOT EXISTS max_discount_amount NUMERIC(10, 2);`, 'coupons_max_discount_amount'],
    [`ALTER TABLE coupons ADD COLUMN IF NOT EXISTS usage_limit INTEGER;`, 'coupons_usage_limit'],
    [`ALTER TABLE coupons ADD COLUMN IF NOT EXISTS used_count INTEGER DEFAULT 0;`, 'coupons_used_count'],
    [`ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES "user"(id);`, 'orders_user_id'],
    [`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;`, 'orders_phone'],
    [`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_amount NUMERIC(10, 2) DEFAULT '0';`, 'orders_shipping'],
    [`ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10, 2) DEFAULT '0';`, 'orders_discount'],
    [`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';`, 'orders_payment_status'],

    [`ALTER TABLE products ADD COLUMN IF NOT EXISTS slug TEXT;`, 'products_slug'],
    [`ALTER TABLE products ADD COLUMN IF NOT EXISTS vendor_id INTEGER REFERENCES vendors(id);`, 'products_vendor_id'],
    [`ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id);`, 'products_category_id'],
    [`ALTER TABLE products ADD COLUMN IF NOT EXISTS sub_category_id INTEGER REFERENCES sub_categories(id);`, 'products_sub_category_id'],
    [`ALTER TABLE products ADD COLUMN IF NOT EXISTS brand_id INTEGER REFERENCES brands(id);`, 'products_brand_id'],
    [`ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price NUMERIC(10, 2);`, 'products_original_price'],
    [`ALTER TABLE products ADD COLUMN IF NOT EXISTS compare_at_price NUMERIC(10, 2);`, 'products_compare_at_price'],
    [`ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price NUMERIC(10, 2);`, 'products_cost_price'],
    [`ALTER TABLE products ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 2) DEFAULT '0';`, 'products_rating'],
    [`ALTER TABLE products ADD COLUMN IF NOT EXISTS reviews INTEGER DEFAULT 0;`, 'products_reviews'],
    [`ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT;`, 'products_images'],
    [`ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;`, 'products_description'],
    [`ALTER TABLE products ADD COLUMN IF NOT EXISTS short_description TEXT;`, 'products_short_description'],
    [`ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT;`, 'products_sku'],
    [`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT false;`, 'products_is_new'],
    [`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_sale BOOLEAN DEFAULT false;`, 'products_is_sale'],
    [`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;`, 'products_is_featured'],
    [`ALTER TABLE products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE';`, 'products_status'],
    [`ALTER TABLE products ADD COLUMN IF NOT EXISTS specifications TEXT;`, 'products_specifications'],
    [`ALTER TABLE products ADD COLUMN IF NOT EXISTS attributes TEXT;`, 'products_attributes'],

    [`ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS name TEXT;`, 'product_variants_name'],
    [`ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS color TEXT;`, 'product_variants_color'],
    [`ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS attribute_name TEXT;`, 'product_variants_attribute_name'],
    [`ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS attribute_value TEXT;`, 'product_variants_attribute_value'],
    [`ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS image TEXT;`, 'product_variants_image'],

    [`ALTER TABLE shopping_cart ADD COLUMN IF NOT EXISTS vendor_id INTEGER REFERENCES vendors(id);`, 'shopping_cart_vendor_id'],
    [`ALTER TABLE shopping_cart ADD COLUMN IF NOT EXISTS variant_id INTEGER;`, 'shopping_cart_variant_id'],

    [`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS vendor_id INTEGER REFERENCES vendors(id);`, 'reviews_vendor_id'],
    [`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS order_id INTEGER;`, 'reviews_order_id'],
    [`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS title TEXT;`, 'reviews_title'],
    [`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_name TEXT;`, 'reviews_user_name'],
    [`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS image TEXT;`, 'reviews_image'],
    [`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;`, 'reviews_is_verified'],
    [`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;`, 'reviews_is_approved'],
    [`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0;`, 'reviews_helpful_count'],

    [`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS vendor_order_id INTEGER REFERENCES vendor_orders(id) ON DELETE CASCADE;`, 'order_items_vendor_order_id'],
    [`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS vendor_id INTEGER REFERENCES vendors(id);`, 'order_items_vendor_id'],
    [`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS variant_id INTEGER;`, 'order_items_variant_id'],
    [`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS variant_info TEXT;`, 'order_items_variant_info'],
  ];

  for (const [sql, stepName] of statements) {
    await execSql(sql, stepName);
  }

  console.log('✅ Database schema auto-migration check complete!');
}
