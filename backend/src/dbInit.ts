import { client } from './db';

export async function ensureDatabaseSchema() {
  try {
    console.log('🔄 Checking and auto-migrating database schema...');

    await client.unsafe(`
      -- Ensure vendors table exists
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

      -- Ensure categories and sub_categories tables exist
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        slug TEXT,
        description TEXT,
        image TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );

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

      -- Ensure brands table exists
      CREATE TABLE IF NOT EXISTS brands (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL UNIQUE,
        logo TEXT,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Ensure products table columns exist
      ALTER TABLE products ADD COLUMN IF NOT EXISTS vendor_id INTEGER REFERENCES vendors(id);
      ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id);
      ALTER TABLE products ADD COLUMN IF NOT EXISTS sub_category_id INTEGER REFERENCES sub_categories(id);
      ALTER TABLE products ADD COLUMN IF NOT EXISTS brand_id INTEGER REFERENCES brands(id);
      ALTER TABLE products ADD COLUMN IF NOT EXISTS short_description TEXT;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE';
      ALTER TABLE products ADD COLUMN IF NOT EXISTS specifications TEXT;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS attributes TEXT;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS compare_at_price NUMERIC(10, 2);
      ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price NUMERIC(10, 2);

      -- Ensure shopping_cart table columns exist
      ALTER TABLE shopping_cart ADD COLUMN IF NOT EXISTS vendor_id INTEGER REFERENCES vendors(id);
      ALTER TABLE shopping_cart ADD COLUMN IF NOT EXISTS variant_id INTEGER;

      -- Ensure reviews table columns exist
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS vendor_id INTEGER REFERENCES vendors(id);
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS order_id INTEGER;

      -- Ensure vendor_orders table exists
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

      -- Ensure order_items table columns exist
      ALTER TABLE order_items ADD COLUMN IF NOT EXISTS vendor_order_id INTEGER REFERENCES vendor_orders(id) ON DELETE CASCADE;
      ALTER TABLE order_items ADD COLUMN IF NOT EXISTS vendor_id INTEGER REFERENCES vendors(id);
      ALTER TABLE order_items ADD COLUMN IF NOT EXISTS variant_id INTEGER;

      -- Ensure vendor_payouts table exists
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

      -- Ensure commissions table exists
      CREATE TABLE IF NOT EXISTS commissions (
        id SERIAL PRIMARY KEY,
        default_rate NUMERIC(5, 2) NOT NULL DEFAULT '10.00',
        description TEXT DEFAULT 'Global platform commission percentage',
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ Database schema auto-migration check complete!');
  } catch (err) {
    console.error('⚠️ Database auto-migration warning:', err);
  }
}
