// Trigger build with fixed TypeScript annotations
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './trpc';
import { createServer } from 'http';
import { Server } from 'socket.io';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { db } from './db';
import fs from 'fs';
import { reviews } from './schema';
import { eq } from 'drizzle-orm';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth';

import os from 'os';

const getLocalIp = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
};

const localIp = getLocalIp();
const app: Express = express();
const PORT = process.env.PORT || 3001;
const serverIp = process.env.SERVER_IP || localIp;

const isDomain = serverIp.includes('.') && !/^[0-9.]+$/.test(serverIp);
const backendUrl = isDomain ? `https://${serverIp}` : `http://${serverIp}:3001`;

// Define allowed CORS origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  `http://${localIp}:3000`,
  isDomain ? `https://${serverIp}` : undefined,
  process.env.FRONTEND_URL
].filter(Boolean) as string[];

// Create HTTP server
const httpServer = createServer(app);

// Setup Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-product', (productId: string) => {
    socket.join(`product-${productId}`);
    console.log(`Socket ${socket.id} joined product-${productId}`);
  });

  socket.on('leave-product', (productId: string) => {
    socket.leave(`product-${productId}`);
    console.log(`Socket ${socket.id} left product-${productId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Export io for use in other modules
export { io };



// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadPath = path.join(__dirname, '../public/reviews');
    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  },
});

// CORS must be before all route handlers so preflight requests get proper headers
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Better Auth handler must be mounted before body parsing middleware
app.all("/api/auth/*", toNodeHandler(auth));

// express.json() for non-tRPC routes (must be after better-auth to avoid body parsing conflicts)
app.use(express.json({ limit: '10mb' }));

// tRPC middleware (tRPC handles its own body parsing)
app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext: () => ({}),
  })
);

// Serve static files from public directory
app.use('/reviews', express.static(path.join(__dirname, '../public/reviews')));

// Ensure product uploads directory exists
const productUploadPath = path.join(__dirname, '../public/product');
if (!fs.existsSync(productUploadPath)) {
  fs.mkdirSync(productUploadPath, { recursive: true });
}

// Serve product static files
app.use('/product', express.static(productUploadPath));

// Configure multer for product images
const productStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, productUploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const uploadProductImage = multer({
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  },
});

app.post('/api/upload-product-image', uploadProductImage.single('image'), (req: Request & { file?: Express.Multer.File }, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }
  const fileUrl = `/product/${req.file.filename}`;
  res.json({ success: true, url: fileUrl });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get reviews for a product
app.get('/api/reviews/:productId', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const productReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, parseInt(productId as string)))
      .orderBy(reviews.createdAt);

    // Format reviews with full image URLs
    const formattedReviews = productReviews.map(review => ({
      ...review,
      image: review.image ? `${backendUrl}${review.image}` : null,
      createdAt: review.createdAt?.toISOString() || new Date().toISOString(),
    }));

    res.json(formattedReviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch reviews' });
  }
});

// Review submission endpoint with image upload
app.post('/api/reviews', upload.single('image'), async (req: Request & { file?: Express.Multer.File }, res: Response) => {
  try {
    console.log('Review submission request body:', req.body);
    console.log('Review file:', req.file);

    const { productId, userId, rating, title, comment, userName } = req.body;

    const reviewData = {
      productId: parseInt(productId),
      userId: userId,
      rating: parseInt(rating),
      title: title || '',
      comment: comment || '',
      userName: userName || 'Anonymous',
      image: req.file ? `/reviews/${req.file.filename}` : null,
    };

    console.log('Review data to insert:', reviewData);

    // Insert review into database
    const [newReview] = await db.insert(reviews).values(reviewData).returning();

    console.log('Review inserted successfully:', newReview);

    // Format review with full image URL for Socket.io
    const formattedReview = {
      ...newReview,
      image: newReview.image ? `${backendUrl}${newReview.image}` : null,
      createdAt: newReview.createdAt?.toISOString() || new Date().toISOString(),
    };

    // Emit review to all clients viewing this product
    io.to(`product-${productId}`).emit('new-review', formattedReview);

    res.json({ success: true, review: formattedReview });
  } catch (error) {
    console.error('Error submitting review:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    res.status(500).json({ success: false, error: 'Failed to submit review', details: error instanceof Error ? error.message : String(error) });
  }
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`tRPC endpoint available at ${backendUrl}/trpc`);
  console.log(`Health check at ${backendUrl}/health`);
  console.log(`Socket.io server running`);
});

export default app;
