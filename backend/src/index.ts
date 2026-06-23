// Trigger build with fixed TypeScript annotations
import dotenv from 'dotenv';
dotenv.config();
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './trpc';
import { createServer } from 'http';
import { Server } from 'socket.io';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';

import { db } from './db';
import fs from 'fs';
import { reviews, user, notifications } from './schema';
import { eq, or } from 'drizzle-orm';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth';
import { v2 as cloudinary } from 'cloudinary';

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
app.set('trust proxy', true);
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

// Ensure reviews uploads directory exists
const reviewsUploadPath = path.join(__dirname, '../public/reviews');
if (!fs.existsSync(reviewsUploadPath)) {
  fs.mkdirSync(reviewsUploadPath, { recursive: true });
}

// Serve static files from public directory
app.use('/reviews', express.static(reviewsUploadPath));

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



// Ensure uploads directory exists
const uploadsDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const uploadProductImage = multer({
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  },
});

// Configure Cloudinary
// Validate Cloudinary configuration
// Simple warning if Cloudinary env vars are missing; upload will handle errors
const requiredEnv = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`⚠️ Cloudinary env var ${key} is not set. Uploads may fail.`);
  }
});
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

// Helper to upload a file to Cloudinary and delete the local temporary file
async function uploadToCloudinary(file: Express.Multer.File, folder: string): Promise<string> {
  // Validate required Cloudinary configuration at upload time
  const missing = [];
  if (!process.env.CLOUDINARY_CLOUD_NAME) missing.push('CLOUDINARY_CLOUD_NAME');
  if (!process.env.CLOUDINARY_API_KEY) missing.push('CLOUDINARY_API_KEY');
  if (!process.env.CLOUDINARY_API_SECRET) missing.push('CLOUDINARY_API_SECRET');
  if (missing.length > 0) {
    const errMsg = `Cloudinary configuration missing: ${missing.join(', ')}`;
    console.error(errMsg);
    throw new Error(errMsg);
  }

  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: `vellvista/${folder}`,
      resource_type: 'image',
    });
    // Delete local temp file after upload
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    return result.secure_url;
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    throw err;
  }
}




app.post('/api/upload-product-image', uploadProductImage.single('image'), async (req: Request & { file?: Express.Multer.File }, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }
  try {
    const fileUrl = await uploadToCloudinary(req.file, 'product');
    res.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error('Failed to upload product image to Cloudinary:', error);
    res.status(500).json({ success: false, error: 'Failed to upload image to Cloudinary' });
  }
});

app.post('/api/upload-image', uploadProductImage.single('image'), async (req: Request & { file?: Express.Multer.File }, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }
  const folder = (req.query.folder as string) || 'general';
  try {
    const fileUrl = await uploadToCloudinary(req.file, folder);
    res.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error('Failed to upload image to Cloudinary:', error);
    res.status(500).json({ success: false, error: 'Failed to upload image to Cloudinary' });
  }
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

    const host = req.get('host');
    const protocol = req.protocol;
    const dynamicBackendUrl = `${protocol}://${host}`;

    // Format reviews with full image URLs
    const formattedReviews = productReviews.map(review => ({
      ...review,
      image: review.image ? (review.image.startsWith('http') ? review.image : `${dynamicBackendUrl}${review.image}`) : null,
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

    const imageUrl = req.file ? await uploadToCloudinary(req.file, 'reviews') : null;

    const reviewData = {
      productId: parseInt(productId),
      userId: userId,
      rating: parseInt(rating),
      title: title || '',
      comment: comment || '',
      userName: userName || 'Anonymous',
      image: imageUrl,
    };

    console.log('Review data to insert:', reviewData);

    // Insert review into database
    const [newReview] = await db.insert(reviews).values(reviewData).returning();

    console.log('Review inserted successfully:', newReview);

    const host = req.get('host');
    const protocol = req.protocol;
    const dynamicBackendUrl = `${protocol}://${host}`;

    // Format review with full image URL for Socket.io
    const formattedReview = {
      ...newReview,
      image: newReview.image ? (newReview.image.startsWith('http') ? newReview.image : `${dynamicBackendUrl}${newReview.image}`) : null,
      createdAt: newReview.createdAt?.toISOString() || new Date().toISOString(),
    };

    // Emit review to all clients viewing this product
    io.to(`product-${productId}`).emit('new-review', formattedReview);

    // Create DB notifications for all admins
    try {
      const admins = await db.select()
        .from(user)
        .where(or(eq(user.role, 'ADMIN'), eq(user.role, 'SUPER_ADMIN')));

      for (const adminUser of admins) {
        await db.insert(notifications).values({
          userId: adminUser.id,
          type: 'review',
          title: 'New Review Submitted',
          message: `A new ${rating}-star review was submitted for product ID #${productId} by ${newReview.userName || 'Anonymous'}.`,
          actionUrl: `/admin/reviews`,
          isRead: false
        });
      }

      // Emit real-time notification to all connected admins
      io.emit('admin-notification', {
        type: 'review',
        title: 'New Review Submitted',
        message: `A new ${rating}-star review was submitted for product ID #${productId} by ${newReview.userName || 'Anonymous'}.`,
        actionUrl: `/admin/reviews`,
        createdAt: new Date().toISOString()
      });
    } catch (notifError) {
      console.error('Failed to create admin notification for review:', notifError);
    }

    res.json({ success: true, review: formattedReview });
  } catch (error) {
    console.error('Error submitting review:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    res.status(500).json({ success: false, error: 'Failed to submit review', details: error instanceof Error ? error.message : String(error) });
  }
});

// Global error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`tRPC endpoint available at ${backendUrl}/trpc`);
  console.log(`Health check at ${backendUrl}/health`);
  console.log(`Socket.io server running`);
});

export default app;
