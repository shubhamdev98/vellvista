import { db } from '../db';
import { products, categories, subCategories, reviews, vendors } from '../schema';
import { eq, like, and, or, gte, lte, desc, count, sql } from 'drizzle-orm';
import type { Product, NewProduct } from '../schema';

export class ProductService {
  // Helper to generate the reviews stats subquery
  private static getReviewsSubquery() {
    return db
      .select({
        productId: reviews.productId,
        avgRating: sql<string>`coalesce(round(avg(${reviews.rating})::numeric, 1)::text, '0')`.as('avg_rating'),
        reviewsCount: sql<number>`count(${reviews.id})::integer`.as('reviews_count'),
      })
      .from(reviews)
      .groupBy(reviews.productId)
      .as('rev_stats');
  }

  // Helper to execute select query with left join on review stats & vendor details
  private static getProductsWithStatsQuery(reviewsSub: ReturnType<typeof ProductService.getReviewsSubquery>) {
    return db
      .select({
        id: products.id,
        vendorId: products.vendorId,
        vendorStoreName: vendors.storeName,
        vendorSlug: vendors.slug,
        vendorLogo: vendors.logo,
        categoryId: products.categoryId,
        subCategoryId: products.subCategoryId,
        name: products.name,
        slug: products.slug,
        brand: products.brand,
        price: products.price,
        originalPrice: products.originalPrice,
        compareAtPrice: products.compareAtPrice,
        costPrice: products.costPrice,
        image: products.image,
        images: products.images,
        description: products.description,
        shortDescription: products.shortDescription,
        sku: products.sku,
        isNew: products.isNew,
        isSale: products.isSale,
        isFeatured: products.isFeatured,
        category: products.category,
        stock: products.stock,
        status: products.status,
        specifications: products.specifications,
        attributes: products.attributes,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        rating: sql<string>`coalesce(${reviewsSub.avgRating}, '0')`,
        reviews: sql<number>`coalesce(${reviewsSub.reviewsCount}, 0)`,
      })
      .from(products)
      .leftJoin(vendors, eq(products.vendorId, vendors.id))
      .leftJoin(reviewsSub, eq(products.id, reviewsSub.productId));
  }

  // Get all products
  static async getAllProducts(limit = 20, offset = 0) {
    const reviewsSub = ProductService.getReviewsSubquery();
    const result = await ProductService.getProductsWithStatsQuery(reviewsSub)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(products.createdAt));
    
    return result;
  }

  // Get product by ID
  static async getProductById(id: number) {
    const reviewsSub = ProductService.getReviewsSubquery();
    const result = await ProductService.getProductsWithStatsQuery(reviewsSub)
      .where(eq(products.id, id))
      .limit(1);
    
    return result[0] || null;
  }

  // Create new product
  static async createProduct(productData: NewProduct) {
    const result = await db
      .insert(products)
      .values(productData)
      .returning();
    
    return result[0];
  }

  // Update product
  static async updateProduct(id: number, productData: Partial<NewProduct>) {
    const result = await db
      .update(products)
      .set({ ...productData, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    
    return result[0];
  }

  // Delete product
  static async deleteProduct(id: number) {
    const result = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning();
    
    return result.length > 0;
  }

  // Search & Filter products across categories and vendors
  static async searchProducts(filters: {
    query?: string;
    category?: string;
    categoryId?: number;
    subCategoryId?: number;
    vendorId?: number;
    minPrice?: string;
    maxPrice?: string;
    limit?: number;
    offset?: number;
  }) {
    const {
      query,
      category,
      categoryId,
      subCategoryId,
      vendorId,
      minPrice,
      maxPrice,
      limit = 20,
      offset = 0
    } = filters;

    const whereConditions = [];

    if (query) {
      whereConditions.push(
        or(
          like(products.name, `%${query}%`),
          like(products.brand, `%${query}%`),
          like(products.description, `%${query}%`),
          like(vendors.storeName, `%${query}%`)
        )
      );
    }

    if (category && category !== 'All') {
      whereConditions.push(eq(products.category, category));
    }

    if (categoryId) {
      whereConditions.push(eq(products.categoryId, categoryId));
    }

    if (subCategoryId) {
      whereConditions.push(eq(products.subCategoryId, subCategoryId));
    }

    if (vendorId) {
      whereConditions.push(eq(products.vendorId, vendorId));
    }

    if (minPrice !== undefined) {
      whereConditions.push(gte(products.price, minPrice));
    }

    if (maxPrice !== undefined) {
      whereConditions.push(lte(products.price, maxPrice));
    }

    const whereClause = whereConditions.length > 0 
      ? and(...whereConditions) 
      : undefined;

    const reviewsSub = ProductService.getReviewsSubquery();
    const result = await ProductService.getProductsWithStatsQuery(reviewsSub)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(products.createdAt));

    // Get total count for pagination
    const totalCount = await db
      .select({ count: count() })
      .from(products)
      .leftJoin(vendors, eq(products.vendorId, vendors.id))
      .where(whereClause);

    return {
      products: result,
      total: totalCount[0]?.count || 0,
    };
  }

  // Get featured products
  static async getFeaturedProducts(limit = 8) {
    const reviewsSub = ProductService.getReviewsSubquery();
    const result = await ProductService.getProductsWithStatsQuery(reviewsSub)
      .where(or(
        eq(products.isNew, true),
        eq(products.isSale, true),
        eq(products.isFeatured, true)
      ))
      .limit(limit)
      .orderBy(desc(products.createdAt));

    return result;
  }

  // Get products by category
  static async getProductsByCategory(category: string, limit = 20, offset = 0) {
    const reviewsSub = ProductService.getReviewsSubquery();
    const result = await ProductService.getProductsWithStatsQuery(reviewsSub)
      .where(eq(products.category, category))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(products.createdAt));

    return result;
  }

  // Get all categories
  static async getAllCategories() {
    const result = await db
      .select()
      .from(categories)
      .orderBy(categories.name);

    return result;
  }

  // Update stock
  static async updateStock(id: number, quantity: number) {
    const result = await db
      .update(products)
      .set({ 
        stock: quantity,
        updatedAt: new Date() 
      })
      .where(eq(products.id, id))
      .returning();

    return result[0];
  }
}
