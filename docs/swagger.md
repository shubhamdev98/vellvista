# 📜 VellVista API Swagger & OpenAPI 3.0 Documentation

This document provides a comprehensive guide on the **VellVista OpenAPI 3.0 / Swagger** API documentation portal, setup, routes, and developer tools.

---

## 🚀 Interactive Swagger UI Portals

VellVista provides two interactive API documentation interfaces:

1. **Backend Swagger UI Portal** (Served directly by Express):
   - **URL**: [http://localhost:3001/docs](http://localhost:3001/docs) or [http://localhost:3001/api-docs](http://localhost:3001/api-docs)
   - **Raw JSON Schema**: [http://localhost:3001/api-docs/json](http://localhost:3001/api-docs/json)
   - **Features**: Interactive "Try It Out" live HTTP testing, parameter auto-completion, response schema validation.

2. **Frontend Interactive API Explorer**:
   - **URL**: [http://localhost:3000/docs/api](http://localhost:3000/docs/api)
   - **Features**: Filterable method badges, real-time live fetch response testing, request payload templates, instant endpoint search.

---

## 📁 OpenAPI File Locations

- **JSON Spec**: [`docs/swagger.json`](file:///e:/program/Next.js/my-app/docs/swagger.json) & [`backend/public/swagger.json`](file:///e:/program/Next.js/my-app/backend/public/swagger.json)
- **YAML Spec**: [`docs/openapi.yaml`](file:///e:/program/Next.js/my-app/docs/openapi.yaml)
- **Frontend App Page**: [`app/docs/api/page.tsx`](file:///e:/program/Next.js/my-app/app/docs/api/page.tsx)

---

## 🏷️ Endpoint Categories & Coverage

### 1. System & Health
- `GET /health`: Express server status check
- `GET /trpc/healthCheck`: tRPC procedure heartbeat

### 2. Authentication
- `POST /api/auth/sign-in/email`: Better Auth email & password authentication
- `POST /api/auth/sign-up/email`: Account registration
- `GET /api/auth/get-session`: Retrieve current user session details
- `POST /trpc/login`: tRPC login procedure
- `POST /trpc/register`: tRPC user registration with OTP

### 3. Products & Catalog
- `GET /trpc/getProducts`: Paginated fragrance catalog items
- `GET /trpc/getProductById`: Detailed product specification and inventory
- `POST /trpc/createProduct`: Admin operation for creating fragrance products

### 4. Reviews & Ratings
- `GET /api/reviews/:productId`: Customer reviews with image URL resolving
- `POST /api/reviews`: Review submission with Multer image upload

### 5. File Uploads (Cloudinary Integration)
- `POST /api/upload-product-image`: Upload product assets
- `POST /api/upload-image`: Upload general media assets
- `POST /api/upload-video`: Upload hero section promo videos

### 6. Shopping Cart & Wishlist
- `GET /trpc/getCart`: Fetch active cart items
- `POST /trpc/addToCart`: Add variant item to basket
- `GET /trpc/getWishlist`: Fetch saved favorites

### 7. Payments & Billing
- `POST /trpc/createPayment`: Initialize Razorpay payment gateway order
- `POST /trpc/verifyPaymentSignature`: HMAC-SHA256 signature verification

---

## 🧪 Testing with Postman & Swagger CLI

You can import the OpenAPI spec into Postman or Insomnia:

```bash
# Export or test the raw JSON endpoint
curl http://localhost:3001/api-docs/json -o vellvista-api.json
```

Or open Postman -> **Import** -> Select `docs/openapi.yaml` or `docs/swagger.json` to generate an automated Postman API collection.
