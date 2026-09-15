-- Custom SQL migration to ensure vendor_id and multi-vendor tables exist
CREATE TABLE IF NOT EXISTS "vendors" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"store_name" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"owner_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"description" text,
	"address" text,
	"logo" text,
	"banner" text,
	"tax_id" text,
	"bank_details" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"rating" numeric(3, 2) DEFAULT '0',
	"review_count" integer DEFAULT 0,
	"commission_rate" numeric(5, 2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "vendor_id" integer;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "category_id" integer;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "sub_category_id" integer;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "brand_id" integer;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "short_description" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "sku" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'ACTIVE' NOT NULL;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "specifications" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "attributes" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "compare_at_price" numeric(10, 2);
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "cost_price" numeric(10, 2);

ALTER TABLE "shopping_cart" ADD COLUMN IF NOT EXISTS "vendor_id" integer;
ALTER TABLE "shopping_cart" ADD COLUMN IF NOT EXISTS "variant_id" integer;

ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "vendor_id" integer;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "order_id" integer;

CREATE TABLE IF NOT EXISTS "vendor_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"vendor_id" integer NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"shipping_cost" numeric(10, 2) DEFAULT '0',
	"commission_amount" numeric(10, 2) DEFAULT '0',
	"vendor_earnings" numeric(10, 2) DEFAULT '0',
	"tracking_number" text,
	"carrier" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "vendor_order_id" integer;
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "vendor_id" integer;
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "variant_id" integer;

CREATE TABLE IF NOT EXISTS "vendor_payouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendor_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"reference_number" text,
	"notes" text,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "commissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"default_rate" numeric(5, 2) DEFAULT '10.00' NOT NULL,
	"description" text DEFAULT 'Global platform commission percentage',
	"updated_at" timestamp DEFAULT now()
);

ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "vendor_id" integer;

