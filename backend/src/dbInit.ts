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

  // 1. Ensure core base tables exist
  await execSql(`
    CREATE TABLE IF NOT EXISTS "user" (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      email_verified BOOLEAN DEFAULT false,
      image TEXT,
      is_admin TEXT DEFAULT 'USER',
      password TEXT,
      google_id TEXT UNIQUE,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `, 'create_table_user');

  await execSql(`
    CREATE TABLE IF NOT EXISTS vendors (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      store_name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      owner_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      description TEXT,
      address TEXT,
      logo TEXT,
      banner TEXT,
      tax_id TEXT,
      bank_details TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING',
      rating NUMERIC(3, 2) DEFAULT '0',
      review_count INTEGER DEFAULT 0,
      commission_rate NUMERIC(5, 2),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `, 'create_table_vendors');

  await execSql(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      slug TEXT,
      description TEXT,
      image TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `, 'create_table_categories');

  await execSql(`
    CREATE TABLE IF NOT EXISTS sub_categories (
      id SERIAL PRIMARY KEY,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      image TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `, 'create_table_sub_categories');

  await execSql(`
    CREATE TABLE IF NOT EXISTS brands (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      logo TEXT,
      description TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `, 'create_table_brands');

  await execSql(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      price NUMERIC(10, 2) NOT NULL,
      image TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'fragrance',
      stock INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `, 'create_table_products');

  await execSql(`
    CREATE TABLE IF NOT EXISTS shopping_cart (
      id SERIAL PRIMARY KEY,
      user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE,
      session_id TEXT,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `, 'create_table_shopping_cart');

  await execSql(`
    CREATE TABLE IF NOT EXISTS wishlist (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `, 'create_table_wishlist');

  await execSql(`
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      user_id TEXT REFERENCES "user"(id),
      rating INTEGER NOT NULL,
      title TEXT,
      comment TEXT,
      user_name TEXT,
      image TEXT,
      is_verified BOOLEAN DEFAULT false,
      is_approved BOOLEAN DEFAULT false,
      helpful_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `, 'create_table_reviews');

  await execSql(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id TEXT REFERENCES "user"(id),
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT,
      total_amount NUMERIC(10, 2) NOT NULL,
      shipping_amount NUMERIC(10, 2) DEFAULT '0',
      discount_amount NUMERIC(10, 2) DEFAULT '0',
      status TEXT NOT NULL DEFAULT 'pending',
      payment_status TEXT DEFAULT 'pending',
      shipping_address TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `, 'create_table_orders');

  await execSql(`
    CREATE TABLE IF NOT EXISTS vendor_orders (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      vendor_id INTEGER NOT NULL REFERENCES vendors(id),
      status TEXT NOT NULL DEFAULT 'PENDING',
      subtotal NUMERIC(10, 2) NOT NULL,
      shipping_cost NUMERIC(10, 2) DEFAULT '0',
      commission_amount NUMERIC(10, 2) DEFAULT '0',
      vendor_earnings NUMERIC(10, 2) DEFAULT '0',
      tracking_number TEXT,
      carrier TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `, 'create_table_vendor_orders');

  await execSql(`
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id),
      product_name TEXT NOT NULL,
      product_image TEXT,
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price NUMERIC(10, 2) NOT NULL,
      total_price NUMERIC(10, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `, 'create_table_order_items');

  // 2. Ensure columns exist on products, shopping_cart, reviews, and order_items
  await execSql(`ALTER TABLE products ADD COLUMN IF NOT EXISTS slug TEXT;`, 'add_products_slug');
  await execSql(`ALTER TABLE products ADD COLUMN IF NOT EXISTS vendor_id INTEGER REFERENCES vendors(id);`, 'add_products_vendor_id');
  await execSql(`ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id);`, 'add_products_category_id');
  await execSql(`ALTER TABLE products ADD COLUMN IF NOT EXISTS sub_category_id INTEGER REFERENCES sub_categories(id);`, 'add_products_sub_category_id');
  await execSql(`ALTER TABLE products ADD COLUMN IF NOT EXISTS brand_id INTEGER REFERENCES brands(id);`, 'add_products_brand_id');
  await execSql(`ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price NUMERIC(10, 2);`, 'add_products_original_price');
  await execSql(`ALTER TABLE products ADD COLUMN IF NOT EXISTS compare_at_price NUMERIC(10, 2);`, 'add_products_compare_at_price');
  await execSql(`ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price NUMERIC(10, 2);`, 'add_products_cost_price');
  await execSql(`ALTER TABLE products ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 2) DEFAULT '0';`, 'add_products_rating');
  await execSql(`ALTER TABLE products ADD COLUMN IF NOT EXISTS reviews INTEGER DEFAULT 0;`, 'add_products_reviews');
  await execSql(`ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT;`, 'add_products_images');
  await execSql(`ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;`, 'add_products_description');
  await execSql(`ALTER TABLE products ADD COLUMN IF NOT EXISTS short_description TEXT;`, 'add_products_short_description');
  await execSql(`ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT;`, 'add_products_sku');
  await execSql(`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT false;`, 'add_products_is_new');
  await execSql(`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_sale BOOLEAN DEFAULT false;`, 'add_products_is_sale');
  await execSql(`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;`, 'add_products_is_featured');
  await execSql(`ALTER TABLE products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE';`, 'add_products_status');
  await execSql(`ALTER TABLE products ADD COLUMN IF NOT EXISTS specifications TEXT;`, 'add_products_specifications');
  await execSql(`ALTER TABLE products ADD COLUMN IF NOT EXISTS attributes TEXT;`, 'add_products_attributes');

  await execSql(`
    CREATE TABLE IF NOT EXISTS product_variants (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      name TEXT,
      size TEXT,
      volume TEXT,
      color TEXT,
      attribute_name TEXT,
      attribute_value TEXT,
      price NUMERIC(10, 2) NOT NULL,
      stock INTEGER DEFAULT 0 NOT NULL,
      sku TEXT,
      image TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `, 'create_table_product_variants');

  await execSql(`ALTER TABLE shopping_cart ADD COLUMN IF NOT EXISTS vendor_id INTEGER REFERENCES vendors(id);`, 'add_shopping_cart_vendor_id');
  await execSql(`ALTER TABLE shopping_cart ADD COLUMN IF NOT EXISTS variant_id INTEGER;`, 'add_shopping_cart_variant_id');

  await execSql(`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS vendor_id INTEGER REFERENCES vendors(id);`, 'add_reviews_vendor_id');
  await execSql(`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS order_id INTEGER;`, 'add_reviews_order_id');

  await execSql(`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS vendor_order_id INTEGER REFERENCES vendor_orders(id) ON DELETE CASCADE;`, 'add_order_items_vendor_order_id');
  await execSql(`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS vendor_id INTEGER REFERENCES vendors(id);`, 'add_order_items_vendor_id');
  await execSql(`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS variant_id INTEGER;`, 'add_order_items_variant_id');

  await execSql(`
    CREATE TABLE IF NOT EXISTS vendor_payouts (
      id SERIAL PRIMARY KEY,
      vendor_id INTEGER NOT NULL REFERENCES vendors(id),
      amount NUMERIC(10, 2) NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      reference_number TEXT,
      notes TEXT,
      paid_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `, 'create_table_vendor_payouts');

  await execSql(`
    CREATE TABLE IF NOT EXISTS commissions (
      id SERIAL PRIMARY KEY,
      default_rate NUMERIC(5, 2) NOT NULL DEFAULT '10.00',
      description TEXT DEFAULT 'Global platform commission percentage',
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `, 'create_table_commissions');

  console.log('✅ Database schema auto-migration check complete!');
}
