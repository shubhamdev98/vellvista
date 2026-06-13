import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://172.29.214.47:3001",
  basePath: "/api/auth",
});
