# LuxeScents Backend

Backend API for LuxeScents fragrance store built with Express.js, tRPC, PostgreSQL, and Drizzle ORM.

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **tRPC** - Type-safe API
- **PostgreSQL** - Database
- **Drizzle ORM** - Database ORM
- **TypeScript** - Type safety
- **Zod** - Schema validation

## Features

- Type-safe API with tRPC
- PostgreSQL database with Drizzle ORM
- Product management (CRUD operations)
- Search and filtering
- Category management
- Newsletter subscription
- Health check endpoint

## Setup

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository and navigate to the backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
```

Edit the `.env` file with your database connection:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/luxescents"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE luxescents;
```

2. Generate database migrations:
```bash
npm run db:generate
```

3. Run migrations:
```bash
npm run db:migrate
```

4. Seed the database with sample data:
```bash
npm run seed
```

### Running the Server

Development mode with hot reload:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

## API Endpoints

### tRPC Endpoints

The API uses tRPC for type-safe communication. All endpoints are available at `/trpc`.

#### Product Operations

- `getProducts` - Get all products with pagination
- `getProductById` - Get a single product by ID
- `createProduct` - Create a new product
- `updateProduct` - Update an existing product
- `deleteProduct` - Delete a product
- `searchProducts` - Search products with filters
- `getFeaturedProducts` - Get featured products
- `getProductsByCategory` - Get products by category
- `getCategories` - Get all categories

#### Other Operations

- `subscribeToNewsletter` - Subscribe to newsletter
- `healthCheck` - Health check endpoint

### REST Endpoints

- `GET /health` - Basic health check

## Database Schema

### Products Table
- `id` - Primary key
- `name` - Product name
- `brand` - Product brand
- `price` - Current price
- `originalPrice` - Original price (for sale items)
- `rating` - Product rating (0-5)
- `reviews` - Number of reviews
- `image` - Product image URL
- `description` - Product description
- `isNew` - New product flag
- `isSale` - Sale flag
- `category` - Product category
- `stock` - Stock quantity
- `createdAt` - Creation timestamp
- `updatedAt` - Update timestamp

### Categories Table
- `id` - Primary key
- `name` - Category name
- `description` - Category description
- `createdAt` - Creation timestamp

### Orders Table
- `id` - Primary key
- `customerName` - Customer name
- `customerEmail` - Customer email
- `totalAmount` - Order total
- `status` - Order status
- `shippingAddress` - Shipping address
- `createdAt` - Creation timestamp
- `updatedAt` - Update timestamp

### Order Items Table
- `id` - Primary key
- `orderId` - Reference to order
- `productId` - Reference to product
- `quantity` - Item quantity
- `price` - Item price

### Subscribers Table
- `id` - Primary key
- `email` - Subscriber email
- `isActive` - Active status
- `createdAt` - Creation timestamp

## Development

### Database Management

- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio (database GUI)

### Project Structure

```
src/
  db.ts              # Database connection
  schema.ts           # Database schema definitions
  trpc.ts             # tRPC router and procedures
  index.ts            # Express server setup
  seed.ts             # Database seeding script
  services/
    productService.ts # Product service layer
```

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License
