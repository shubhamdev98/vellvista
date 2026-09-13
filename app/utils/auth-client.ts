import { createAuthClient } from "better-auth/client";

const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_BACKEND_URL) return process.env.NEXT_PUBLIC_BACKEND_URL;
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.INTERNAL_BACKEND_URL || "http://localhost:3001";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  basePath: "/api/auth",
});
