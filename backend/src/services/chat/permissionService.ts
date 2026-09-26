import { ChatIntent } from "./intentService";

export interface PermissionCheckResult {
  authorized: boolean;
  requiresAuth: boolean;
  denialReason?: string;
}

const PRIVATE_INTENTS: ChatIntent[] = ["MY_ORDERS", "MY_WISHLIST", "MY_CART", "MY_PROFILE"];

export function checkPermissions(
  intent: ChatIntent,
  userId: string | null | undefined
): PermissionCheckResult {
  const requiresAuth = PRIVATE_INTENTS.includes(intent);

  if (requiresAuth && !userId) {
    return {
      authorized: false,
      requiresAuth: true,
      denialReason: "Please log in to your account to view your private information.",
    };
  }

  return {
    authorized: true,
    requiresAuth,
  };
}
