export type ChatIntent =
  | "PRODUCT_SEARCH"
  | "PRODUCT_DETAILS"
  | "EVENT_SEARCH"
  | "MY_ORDERS"
  | "MY_WISHLIST"
  | "MY_CART"
  | "MY_PROFILE"
  | "WEBSITE_FAQ"
  | "GENERAL";

export function detectIntent(message: string): ChatIntent {
  const query = message.toLowerCase().trim();

  // Orders / Shipping / Track
  if (
    query.includes("my order") ||
    query.includes("order status") ||
    query.includes("track my order") ||
    query.includes("my purchase") ||
    query.includes("where is my package") ||
    query.includes("recent orders")
  ) {
    return "MY_ORDERS";
  }

  // Wishlist
  if (
    query.includes("my wishlist") ||
    query.includes("saved items") ||
    query.includes("favorite products") ||
    query.includes("my favorites")
  ) {
    return "MY_WISHLIST";
  }

  // Cart
  if (
    query.includes("my cart") ||
    query.includes("items in cart") ||
    query.includes("shopping bag") ||
    query.includes("cart total")
  ) {
    return "MY_CART";
  }

  // Profile / Account
  if (
    query.includes("my profile") ||
    query.includes("my account") ||
    query.includes("my email") ||
    query.includes("my details")
  ) {
    return "MY_PROFILE";
  }

  // Events / Garba / Passes / Tickets
  if (
    query.includes("event") ||
    query.includes("garba") ||
    query.includes("navratri") ||
    query.includes("concert") ||
    query.includes("masterclass") ||
    query.includes("pass") ||
    query.includes("ticket")
  ) {
    return "EVENT_SEARCH";
  }

  // Product Search / Recommend / Price / Fragrance / Perfume
  if (
    query.includes("product") ||
    query.includes("perfume") ||
    query.includes("fragrance") ||
    query.includes("scent") ||
    query.includes("recommend") ||
    query.includes("under ₹") ||
    query.includes("under $") ||
    query.includes("cheap") ||
    query.includes("best seller") ||
    query.includes("bestseller") ||
    query.includes("buy") ||
    query.includes("shop")
  ) {
    return "PRODUCT_SEARCH";
  }

  // FAQ / Policy / Shipping / Return
  if (
    query.includes("return") ||
    query.includes("refund") ||
    query.includes("delivery time") ||
    query.includes("shipping policy") ||
    query.includes("contact") ||
    query.includes("support") ||
    query.includes("faq")
  ) {
    return "WEBSITE_FAQ";
  }

  return "GENERAL";
}
