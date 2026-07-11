import { createAuthClient } from "better-auth/client";

const getBaseURL = () => {
  if (typeof window === "undefined") {
    return process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://172.29.214.47:3001";
  }
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://172.29.214.47:3001";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  basePath: "/api/auth",
});
