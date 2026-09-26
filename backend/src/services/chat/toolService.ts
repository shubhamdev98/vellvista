import { db } from "../../db";
import { products, orders, orderItems, wishlist, shoppingCart, user as userTable } from "../../schema";
import { eq, ilike, or, desc } from "drizzle-orm";

export async function executeSearchProducts(query: string, limit = 4) {
  try {
    const qClean = query.toLowerCase().trim();
    const results = await db
      .select({
        id: products.id,
        name: products.name,
        brand: products.brand,
        price: products.price,
        originalPrice: products.originalPrice,
        rating: products.rating,
        image: products.image,
        category: products.category,
      })
      .from(products)
      .where(
        or(
          ilike(products.name, `%${qClean}%`),
          ilike(products.brand, `%${qClean}%`),
          ilike(products.category, `%${qClean}%`),
          ilike(products.description, `%${qClean}%`)
        )
      )
      .limit(limit);

    if (results.length === 0) {
      // Fallback top products
      return await db
        .select({
          id: products.id,
          name: products.name,
          brand: products.brand,
          price: products.price,
          originalPrice: products.originalPrice,
          rating: products.rating,
          image: products.image,
          category: products.category,
        })
        .from(products)
        .limit(limit);
    }
    return results;
  } catch (err) {
    console.error("Tool executeSearchProducts error:", err);
    return [];
  }
}

export async function executeGetMyOrders(userId: string, limit = 5) {
  if (!userId) return [];
  try {
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt))
      .limit(limit);

    const detailedOrders = [];
    for (const o of userOrders) {
      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, o.id));

      detailedOrders.push({
        id: o.id,
        totalAmount: o.totalAmount,
        status: o.status,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt,
        itemsCount: items.length,
        items: items.map((i) => ({
          name: i.productName,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      });
    }
    return detailedOrders;
  } catch (err) {
    console.error("Tool executeGetMyOrders error:", err);
    return [];
  }
}

export async function executeGetMyWishlist(userId: string) {
  if (!userId) return [];
  try {
    const items = await db
      .select({
        id: wishlist.id,
        productId: products.id,
        name: products.name,
        brand: products.brand,
        price: products.price,
        image: products.image,
      })
      .from(wishlist)
      .innerJoin(products, eq(wishlist.productId, products.id))
      .where(eq(wishlist.userId, userId));

    return items;
  } catch (err) {
    console.error("Tool executeGetMyWishlist error:", err);
    return [];
  }
}

export async function executeGetMyCart(userId: string) {
  if (!userId) return [];
  try {
    const items = await db
      .select({
        id: shoppingCart.id,
        productId: products.id,
        name: products.name,
        price: products.price,
        quantity: shoppingCart.quantity,
        image: products.image,
      })
      .from(shoppingCart)
      .innerJoin(products, eq(shoppingCart.productId, products.id))
      .where(eq(shoppingCart.userId, userId));

    return items;
  } catch (err) {
    console.error("Tool executeGetMyCart error:", err);
    return [];
  }
}

export async function executeGetMyProfile(userId: string) {
  if (!userId) return null;
  try {
    const result = await db
      .select({
        id: userTable.id,
        name: userTable.name,
        email: userTable.email,
        role: userTable.role,
        createdAt: userTable.createdAt,
      })
      .from(userTable)
      .where(eq(userTable.id, userId))
      .limit(1);

    return result[0] || null;
  } catch (err) {
    console.error("Tool executeGetMyProfile error:", err);
    return null;
  }
}
