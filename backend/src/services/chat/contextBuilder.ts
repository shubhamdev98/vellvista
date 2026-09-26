import { ChatIntent } from "./intentService";
import { searchWebsiteKnowledge, KnowledgeChunk } from "./ragService";
import {
  executeSearchProducts,
  executeGetMyOrders,
  executeGetMyWishlist,
  executeGetMyCart,
  executeGetMyProfile,
} from "./toolService";

export interface AssembledContext {
  intent: ChatIntent;
  knowledge: KnowledgeChunk[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataPayload?: any;
}

export async function buildContext(
  intent: ChatIntent,
  query: string,
  userId?: string | null
): Promise<AssembledContext> {
  const knowledge = await searchWebsiteKnowledge(query);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let dataPayload: any = null;

  switch (intent) {
    case "PRODUCT_SEARCH":
    case "PRODUCT_DETAILS":
      dataPayload = {
        products: await executeSearchProducts(query),
      };
      break;

    case "EVENT_SEARCH":
      dataPayload = {
        featuredEvents: [
          {
            title: "Royal Navratri Garba Night 2026",
            date: "Oct 12, 2026",
            time: "07:00 PM - 11:30 PM",
            location: "Grand Palace Arena, Sector 5",
            price: "$10.00",
            category: "Garba & Navratri Special",
          },
          {
            title: "Navratri VIP All-Access Season Pass",
            date: "Oct 12 - Oct 20, 2026",
            time: "07:00 PM - Midnight Daily",
            location: "Royal Heritage Pavilion",
            price: "$35.00",
            category: "Garba & Navratri VIP",
          },
          {
            title: "Symphony of Scents - Acoustic Evening",
            date: "Nov 05, 2026",
            time: "06:30 PM - 09:30 PM",
            location: "Vellvista Grand Concert Hall",
            price: "$20.00",
            category: "Concerts & Live Music",
          },
        ],
      };
      break;

    case "MY_ORDERS":
      if (userId) {
        dataPayload = {
          userOrders: await executeGetMyOrders(userId),
        };
      }
      break;

    case "MY_WISHLIST":
      if (userId) {
        dataPayload = {
          userWishlist: await executeGetMyWishlist(userId),
        };
      }
      break;

    case "MY_CART":
      if (userId) {
        dataPayload = {
          userCart: await executeGetMyCart(userId),
        };
      }
      break;

    case "MY_PROFILE":
      if (userId) {
        dataPayload = {
          userProfile: await executeGetMyProfile(userId),
        };
      }
      break;

    case "WEBSITE_FAQ":
    case "GENERAL":
    default:
      break;
  }

  return {
    intent,
    knowledge,
    dataPayload,
  };
}
