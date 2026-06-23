import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import type { NewProduct, NewUser } from './schema';
import { ProductService } from './services/productService';
import { UserService } from './services/userService';
import { db } from './db';
import { wishlist, products, reviews, addresses, shoppingCart, payments, shippingMethods, orderShippingDetails, coupons, appliedCoupons, notifications, productVariants, orders, subscribers, countries, paymentMethods } from './schema';

// In-memory OTP store: email -> { otp, expiresAt }
const otpStore = new Map<string, { otp: string; expiresAt: Date }>();
import { eq, and, desc, asc } from 'drizzle-orm';
import { transporter } from './auth';
import { RazorpayService } from './services/razorpayService';

// Razorpay integration is handled via RazorpayService

// Create tRPC instance with proper types
const t = initTRPC.create();

// Create router
export const router = t.router;
export const publicProcedure = t.procedure;

// Zod schemas for validation
const ProductSchema = z.object({
  name: z.string().min(1),
  brand: z.string().min(1),
  price: z.string().min(1),
  originalPrice: z.string().optional(),
  rating: z.string().optional(),
  reviews: z.number().min(0).optional(),
  image: z.string().min(1),
  description: z.string().optional(),
  isNew: z.boolean().optional(),
  isSale: z.boolean().optional(),
  category: z.string().optional(),
  stock: z.number().min(0).optional(),
});

const ProductUpdateSchema = ProductSchema.partial();

// User schemas
const UserSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1),
  avatar: z.string().url().optional(),
  googleId: z.string().optional(),
});

const UserUpdateSchema = UserSchema.partial();

// Auth schemas
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const RegisterSchema = UserSchema.extend({
  password: z.string().min(6),
});

const GoogleAuthSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1),
  avatar: z.string().url().optional(),
  googleId: z.string(),
});

// Create tRPC router with procedures
export const appRouter = router({
  // Product procedures
  getProducts: publicProcedure
    .input(z.object({ 
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0)
    }))
    .query(async ({ input }: { input: { limit: number; offset: number } }) => {
      return await ProductService.getAllProducts(input.limit, input.offset);
    }),

  getProductById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }: { input: { id: number } }) => {
      return await ProductService.getProductById(input.id);
    }),

  createProduct: publicProcedure
    .input(ProductSchema)
    .mutation(async ({ input }: { input: NewProduct }) => {
      return await ProductService.createProduct(input);
    }),

  updateProduct: publicProcedure
    .input(z.object({ id: z.number(), data: ProductUpdateSchema }))
    .mutation(async ({ input }: { input: { id: number; data: Partial<NewProduct> } }) => {
      return await ProductService.updateProduct(input.id, input.data);
    }),

  deleteProduct: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }: { input: { id: number } }) => {
      const success = await ProductService.deleteProduct(input.id);
      return { success };
    }),

  // Search products
  searchProducts: publicProcedure
    .input(z.object({ 
      query: z.string().optional(),
      category: z.string().optional(),
      minPrice: z.string().optional(),
      maxPrice: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0)
    }))
    .query(async ({ input }: { input: { 
      query?: string; 
      category?: string; 
      minPrice?: string; 
      maxPrice?: string; 
      limit: number; 
      offset: number 
    } }) => {
      const result = await ProductService.searchProducts(input);
      return result;
    }),

  // Get featured products
  getFeaturedProducts: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(8) }))
    .query(async ({ input }: { input: { limit: number } }) => {
      return await ProductService.getFeaturedProducts(input.limit);
    }),

  // Get products by category
  getProductsByCategory: publicProcedure
    .input(z.object({ 
      category: z.string(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0)
    }))
    .query(async ({ input }: { input: { category: string; limit: number; offset: number } }) => {
      return await ProductService.getProductsByCategory(input.category, input.limit, input.offset);
    }),

  // Get all categories
  getCategories: publicProcedure.query(async () => {
    return await ProductService.getAllCategories();
  }),

  // Newsletter subscription (placeholder implementation)
  subscribeToNewsletter: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }: { input: { email: string } }) => {
      console.log('Newsletter subscription:', input.email);
      return { success: true, message: 'Successfully subscribed to newsletter' };
    }),

  // User authentication procedures
  register: publicProcedure
    .input(RegisterSchema)
    .mutation(async ({ input }) => {
      try {
        const { email, fullName, password } = input;

        // Check if user already exists
        const existingUser = await UserService.getUserByEmail(email);
        if (existingUser) {
          if (existingUser.isActive === false) {
            // Stale unverified account — delete it and allow re-registration
            await UserService.deleteUser(existingUser.id);
            otpStore.delete(email);
          } else {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'An account with this email already exists. Please log in.',
            });
          }
        }

        // Hash password before storing
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user with hashed password (inactive until OTP verification)
        const userData = {
          id: crypto.randomUUID(),
          email,
          name: fullName,
          password: hashedPassword,
          isActive: false
        };
        const user = await UserService.createUser(userData);
        
        // Generate a 6-digit OTP and store in memory (10 min TTL)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`\n=========================================\nOTP FOR ${email}: ${otp}\n=========================================\n`);
        otpStore.set(email, { otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) });

        // Send OTP email asynchronously in the background so it does not block the registration request
        const frontendUrl = process.env.FRONTEND_URL || "http://172.29.214.47:3000";
        const mailOptions = {
          from: `"Vellvista" <${process.env.SMTP_USER}>`,
          to: email,
          subject: "Verify Your Email - Vellvista",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://res.cloudinary.com/dujjidn0e/image/upload/v1781626147/vellvista/logo/w5kkgq9suiw7sk4poxsz.png" alt="Vellvista Logo" style="height: 40px; object-fit: contain;" />
            </div>
              <h2 style="color: #111827; text-align: center;">Verify Your Email</h2>
              <p style="color: #4b5563; font-size: 16px;">Hello ${fullName},</p>
              <p style="color: #4b5563; font-size: 16px;">Thank you for registering with Vellvista. Please use the following One-Time Password (OTP) to verify your email address. This OTP is valid for 10 minutes:</p>
              <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827; background-color: #f3f4f6; padding: 10px 20px; border-radius: 4px; border: 1px solid #e5e7eb;">${otp}</span>
              </div>
              <p style="color: #6b7280; font-size: 14px;">If you did not request this verification code, please ignore this email.</p>
              <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
              <p style="color: #9ca3af; font-size: 12px; text-align: center;">This is an automated email, please do not reply.</p>
            </div>
          `,
        };
        transporter.sendMail(mailOptions)
          .then(() => {
            console.log(`OTP email sent successfully to ${email}`);
          })
          .catch((mailErr) => {
            console.error("Failed to send OTP email:", mailErr);
          });
        
        return { 
          success: true, 
          requireOtp: true,
          message: 'User registered successfully. Please verify OTP.',
          user: { id: user.id, email: user.email, fullName: user.name }
        };
      } catch (err) {
        console.error('BACKEND ERROR - register failed:', err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: err instanceof Error ? err.message : 'Registration failed',
        });
      }
    }),

  resendOtp: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const user = await UserService.getUserByEmail(input.email);
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }

      if (user.isActive === true) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Account is already verified' });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`\n=========================================\nNEW OTP FOR ${input.email}: ${otp}\n=========================================\n`);
      otpStore.set(input.email, { otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) });

      // Send OTP email asynchronously in the background so it does not block the request
      const frontendUrl = process.env.FRONTEND_URL || "http://172.29.214.47:3000";
      const mailOptions = {
        from: `"Vellvista" <${process.env.SMTP_USER}>`,
        to: input.email,
        subject: "Verify Your Email - Vellvista",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://res.cloudinary.com/dujjidn0e/image/upload/v1781626147/vellvista/logo/w5kkgq9suiw7sk4poxsz.png" alt="Vellvista Logo" style="height: 40px; object-fit: contain;" />
            </div>
            <h2 style="color: #111827; text-align: center;">Verify Your Email</h2>
            <p style="color: #4b5563; font-size: 16px;">Hello,</p>
            <p style="color: #4b5563; font-size: 16px;">We received a request to resend the verification code for your Vellvista account. Please use the following One-Time Password (OTP) to verify your email address. This OTP is valid for 10 minutes:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827; background-color: #f3f4f6; padding: 10px 20px; border-radius: 4px; border: 1px solid #e5e7eb;">${otp}</span>
            </div>
            <p style="color: #6b7280; font-size: 14px;">If you did not request this verification code, please ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">This is an automated email, please do not reply.</p>
          </div>
        `,
      };
      transporter.sendMail(mailOptions)
        .then(() => {
          console.log(`Resent OTP email sent successfully to ${input.email}`);
        })
        .catch((mailErr) => {
          console.error("Failed to send resent OTP email:", mailErr);
        });

      return { success: true, message: 'OTP resent successfully' };
    }),

  login: publicProcedure
    .input(LoginSchema)
    .mutation(async ({ input }: { input: { email: string; password: string } }) => {
      const user = await UserService.getUserByEmail(input.email);
      if (!user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
      }

      if (user.isActive === false) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Please verify your account. Use the OTP sent to your email.' });
      }

      if (!user.password) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'This account uses Google sign-in. Please continue with Google.' });
      }

      const isValidPassword = await bcrypt.compare(input.password, user.password);
      if (!isValidPassword) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
      }

      return { 
        success: true, 
        message: 'Login successful',
        user: { id: user.id, email: user.email, fullName: user.name, avatar: user.image || undefined, role: user.role }
      };
    }),

  verifyRegistrationOtp: publicProcedure
    .input(z.object({ email: z.string().email(), otp: z.string() }))
    .mutation(async ({ input }) => {
      const record = otpStore.get(input.email);

      if (!record) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid OTP' });
      }

      if (new Date() > record.expiresAt) {
        otpStore.delete(input.email);
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'OTP has expired. Please register again.' });
      }

      if (record.otp !== input.otp) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid OTP' });
      }

      const user = await UserService.getUserByEmail(input.email);
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }

      await UserService.updateUser(user.id, { isActive: true });
      otpStore.delete(input.email);

      return {
        success: true,
        message: 'OTP verified successfully',
        user: { id: user.id, email: user.email, fullName: user.name, avatar: user.image || undefined, role: user.role }
      };
    }),

  manualLogin: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(6),
    }))
    .mutation(async ({ input }: { input: { email: string; password: string } }) => {
      const user = await UserService.getUserByEmail(input.email);
      if (!user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
      }

      if (user.isActive === false) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Please verify your account. Use the OTP sent to your email.' });
      }

      if (!user.password) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'This account uses Google sign-in. Please continue with Google.' });
      }

      const isValidPassword = await bcrypt.compare(input.password, user.password);
      if (!isValidPassword) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
      }

      return { 
        success: true, 
        message: 'Manual login successful',
        user: { id: user.id, email: user.email, fullName: user.name, avatar: user.image || undefined, role: user.role }
      };
    }),

  loginWithGoogle: publicProcedure
    .input(GoogleAuthSchema)
    .mutation(async ({ input }) => {
      try {
        let user = await UserService.getUserByGoogleId(input.googleId);
        if (!user) {
          user = await UserService.getUserByEmail(input.email);
          if (user) {
            await UserService.updateUserGoogleId(user.id, input.googleId);
          } else {
            user = await UserService.createUser({
              id: crypto.randomUUID(),
              email: input.email,
              name: input.fullName,
              password: '',
              image: input.avatar || 'https://lh3.googleusercontent.com/a/default-user',
              googleId: input.googleId,
              isActive: true,
            });
          }
        }

        return { 
          success: true, 
          message: 'Google login successful',
          user: user ? { id: user.id, email: user.email, fullName: user.name, avatar: user.image || undefined, role: user.role } : null
        };
      } catch (err) {
        console.error('BACKEND ERROR - Google login failed:', err);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Google login failed',
        });
      }
    }),

  getUserProfile: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }: { input: { id: string } }) => {
      const user = await UserService.getUserById(input.id);
      if (!user) {
        throw new Error('User not found');
      }
      
      return { 
        id: user.id, 
        email: user.email, 
        fullName: user.name, 
        avatar: user.image || undefined,
        role: user.role
      };
    }),

  updateUserProfile: publicProcedure
    .input(z.object({ id: z.string(), data: UserUpdateSchema }))
    .mutation(async ({ input }: { input: { id: string; data: z.infer<typeof UserUpdateSchema> } }) => {
      const updateData: Partial<NewUser> = {};
      if (input.data.email) updateData.email = input.data.email;
      if (input.data.fullName) updateData.name = input.data.fullName;
      if (input.data.avatar) updateData.image = input.data.avatar;
      if (input.data.googleId) updateData.googleId = input.data.googleId;
      
      const user = await UserService.updateUser(input.id, updateData);
      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        message: 'Profile updated successfully',
        user: { id: user.id, email: user.email, fullName: user.name, avatar: user.image || undefined, role: user.role }
      };
    }),

  updateAvatar: publicProcedure
    .input(z.object({ id: z.string(), avatar: z.string() }))
    .mutation(async ({ input }: { input: { id: string; avatar: string } }) => {
      const user = await UserService.updateUser(input.id, { image: input.avatar });
      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        message: 'Avatar updated successfully',
        user: { id: user.id, email: user.email, fullName: user.name, avatar: user.image || undefined, role: user.role }
      };
    }),

  // Wishlist operations
  getWishlist: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const wishlistItems = await db.select()
        .from(wishlist)
        .leftJoin(products, eq(wishlist.productId, products.id))
        .where(eq(wishlist.userId, input.userId));

      return wishlistItems.map(item => ({
        id: item.wishlist.id,
        product: item.products
      }));
    }),

  addToWishlist: publicProcedure
    .input(z.object({ userId: z.string(), productId: z.number() }))
    .mutation(async ({ input }) => {
      const existingItem = await db.select()
        .from(wishlist)
        .where(and(
          eq(wishlist.userId, input.userId),
          eq(wishlist.productId, input.productId)
        ))
        .limit(1);

      if (existingItem.length > 0) {
        return { success: false, message: 'Item already in wishlist' };
      }

      await db.insert(wishlist).values({
        userId: input.userId,
        productId: input.productId
      });

      return { success: true, message: 'Added to wishlist' };
    }),

  removeFromWishlist: publicProcedure
    .input(z.object({ userId: z.string(), productId: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(wishlist)
        .where(and(
          eq(wishlist.userId, input.userId),
          eq(wishlist.productId, input.productId)
        ));

      return { success: true, message: 'Removed from wishlist' };
    }),

  // Reviews operations
  getProductReviews: publicProcedure
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => {
      const productReviews = await db.select()
        .from(reviews)
        .where(eq(reviews.productId, input.productId));

      return productReviews;
    }),

  addReview: publicProcedure
    .input(z.object({
      productId: z.number(),
      userId: z.string(),
      rating: z.number().min(1).max(5),
      title: z.string().optional(),
      comment: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      await db.insert(reviews).values({
        productId: input.productId,
        userId: input.userId,
        rating: input.rating,
        title: input.title,
        comment: input.comment,
        isVerified: false,
        isApproved: false
      });

      return { success: true, message: 'Review submitted for approval' };
    }),

  // Address operations
  getAddresses: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const userAddresses = await db.select()
        .from(addresses)
        .where(eq(addresses.userId, input.userId));

      return userAddresses;
    }),

  addAddress: publicProcedure
    .input(z.object({
      userId: z.string(),
      fullName: z.string(),
      addressLine1: z.string(),
      addressLine2: z.string().optional(),
      city: z.string(),
      state: z.string(),
      postalCode: z.string(),
      country: z.string(),
      phone: z.string().optional(),
      addressType: z.string().optional(),
      isDefault: z.boolean().optional()
    }))
    .mutation(async ({ input }) => {
      await db.insert(addresses).values({
        userId: input.userId,
        fullName: input.fullName,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2,
        city: input.city,
        state: input.state,
        postalCode: input.postalCode,
        country: input.country,
        phone: input.phone,
        addressType: input.addressType,
        isDefault: input.isDefault
      });

      return { success: true, message: 'Address added successfully' };
    }),

  updateAddress: publicProcedure
    .input(z.object({
      id: z.number(),
      userId: z.string(),
      fullName: z.string().optional(),
      addressLine1: z.string().optional(),
      addressLine2: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
      phone: z.string().optional(),
      addressType: z.string().optional(),
      isDefault: z.boolean().optional()
    }))
    .mutation(async ({ input }) => {
      const { id, userId, ...updateData } = input;
      await db.update(addresses)
        .set(updateData)
        .where(and(eq(addresses.id, id), eq(addresses.userId, userId)));

      return { success: true, message: 'Address updated successfully' };
    }),

  deleteAddress: publicProcedure
    .input(z.object({ id: z.number(), userId: z.string() }))
    .mutation(async ({ input }) => {
      await db.delete(addresses)
        .where(and(eq(addresses.id, input.id), eq(addresses.userId, input.userId)));

      return { success: true, message: 'Address deleted successfully' };
    }),

  // Shopping cart operations
  getCart: publicProcedure
    .input(z.object({ userId: z.string().optional(), sessionId: z.string().optional() }))
    .query(async ({ input }) => {
      if (!input.userId && !input.sessionId) {
        return [];
      }

      let cartItems;
      // FIX: Add ORDER BY to guarantee deterministic item order.
      // Without this, PostgreSQL returns rows in arbitrary physical order
      // which changes after UPDATEs (MVCC relocates updated rows).
      if (input.userId) {
        cartItems = await db.select()
          .from(shoppingCart)
          .leftJoin(products, eq(shoppingCart.productId, products.id))
          .where(eq(shoppingCart.userId, input.userId))
          .orderBy(asc(shoppingCart.createdAt), asc(shoppingCart.id));
      } else {
        cartItems = await db.select()
          .from(shoppingCart)
          .leftJoin(products, eq(shoppingCart.productId, products.id))
          .where(eq(shoppingCart.sessionId, input.sessionId || ""))
          .orderBy(asc(shoppingCart.createdAt), asc(shoppingCart.id));
      }

      return cartItems.map(item => ({
        id: item.shopping_cart.id,
        productId: item.shopping_cart.productId,
        variantId: item.shopping_cart.variantId,
        quantity: item.shopping_cart.quantity,
        product: item.products
      }));
    }),

  addToCart: publicProcedure
    .input(z.object({
      userId: z.string().optional(),
      sessionId: z.string().optional(),
      productId: z.number(),
      variantId: z.number().optional(),
      quantity: z.number().default(1)
    }))
    .mutation(async ({ input }) => {
      const existingItem = await db.select()
        .from(shoppingCart)
        .where(and(
          input.userId ? eq(shoppingCart.userId, input.userId) : eq(shoppingCart.sessionId, input.sessionId || ""),
          eq(shoppingCart.productId, input.productId),
          input.variantId ? eq(shoppingCart.variantId, input.variantId) : undefined
        ))
        .limit(1);

      let cartItemId: number;
      if (existingItem.length > 0) {
        const result = await db.update(shoppingCart)
          .set({ quantity: existingItem[0].quantity + input.quantity })
          .where(eq(shoppingCart.id, existingItem[0].id))
          .returning({ id: shoppingCart.id });
        cartItemId = result[0].id;
      } else {
        const result = await db.insert(shoppingCart).values({
          userId: input.userId,
          sessionId: input.sessionId,
          productId: input.productId,
          variantId: input.variantId,
          quantity: input.quantity
        }).returning({ id: shoppingCart.id });
        cartItemId = result[0].id;
      }

      return { success: true, message: 'Added to cart', cartItemId };
    }),

  updateCartItem: publicProcedure
    .input(z.object({
      id: z.number(),
      quantity: z.number()
    }))
    .mutation(async ({ input }) => {
      if (input.quantity <= 0) {
        await db.delete(shoppingCart).where(eq(shoppingCart.id, input.id));
      } else {
        await db.update(shoppingCart)
          .set({ quantity: input.quantity })
          .where(eq(shoppingCart.id, input.id));
      }

      return { success: true, message: 'Cart updated' };
    }),

  removeFromCart: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(shoppingCart).where(eq(shoppingCart.id, input.id));
      return { success: true, message: 'Removed from cart' };
    }),

  clearCart: publicProcedure
    .input(z.object({ userId: z.string().optional(), sessionId: z.string().optional() }))
    .mutation(async ({ input }) => {
      if (input.userId) {
        await db.delete(shoppingCart).where(eq(shoppingCart.userId, input.userId));
      } else if (input.sessionId) {
        await db.delete(shoppingCart).where(eq(shoppingCart.sessionId, input.sessionId));
      }

      return { success: true, message: 'Cart cleared' };
    }),

  // Shipping methods operations
  getShippingMethods: publicProcedure
    .query(async () => {
      const methods = await db.select()
        .from(shippingMethods)
        .where(eq(shippingMethods.isActive, true));

      return methods;
    }),

  // Payment methods operations
  getPaymentMethods: publicProcedure
    .query(async () => {
      return await db.select()
        .from(paymentMethods)
        .where(eq(paymentMethods.isActive, true))
        .orderBy(asc(paymentMethods.id));
    }),

  // Razorpay payment creation
  createPayment: publicProcedure
    .input(z.object({
      orderId: z.number(),
      paymentMethod: z.string(),
      amount: z.string()
    }))
    .mutation(async ({ input }) => {
      // Convert amount (assumed in INR) to paise
      const amountInPaise = Math.round(parseFloat(input.amount) * 100);
      // Create Razorpay order
      const razorpayOrder = await RazorpayService.createOrder(amountInPaise, 'INR');
      // Store payment record with Razorpay order ID
      const payment = await db.insert(payments).values({
        orderId: input.orderId,
        paymentMethod: input.paymentMethod,
        amount: input.amount,
        currency: 'INR',
        status: 'created',
        transactionId: razorpayOrder.id
      }).returning();
      return { success: true, paymentId: payment[0].id, razorpayOrderId: razorpayOrder.id };
    }),

  // Update existing payment status
  updatePaymentStatus: publicProcedure
    .input(z.object({
      id: z.number(),
      status: z.string(),
      transactionId: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      await db.update(payments)
        .set({
          status: input.status,
          transactionId: input.transactionId,
          paymentDate: input.status === 'completed' ? new Date() : null
        })
        .where(eq(payments.id, input.id));

      return { success: true, message: 'Payment status updated' };
    }),

  // Verify Razorpay payment signature
  verifyPaymentSignature: publicProcedure
    .input(z.object({
      razorpay_order_id: z.string(),
      razorpay_payment_id: z.string(),
      razorpay_signature: z.string()
    }))
    .mutation(async ({ input }) => {
      try {
        RazorpayService.verifySignature(input);
        // Mark payment as completed based on Razorpay order ID
        await db.update(payments)
          .set({ status: 'completed', paymentDate: new Date() })
          .where(eq(payments.transactionId, input.razorpay_order_id));
        return { success: true };
      } catch (err) {
        return { success: false, error: (err as Error).message };
      }
    }),
  // Order shipping details operations
  createOrderShipping: publicProcedure
    .input(z.object({
      orderId: z.number(),
      shippingMethodId: z.number(),
      shippingAddress: z.string(),
      trackingNumber: z.string().optional(),
      carrier: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      // Validate that the order exists
      const order = await db.select().from(orders).where(eq(orders.id, input.orderId)).limit(1);
      if (order.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' });
      }

      // Validate that the shipping method exists
      const method = await db.select().from(shippingMethods).where(eq(shippingMethods.id, input.shippingMethodId)).limit(1);
      if (method.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Shipping method not found' });
      }

      await db.insert(orderShippingDetails).values({
        orderId: input.orderId,
        shippingMethodId: input.shippingMethodId,
        shippingAddress: input.shippingAddress,
        trackingNumber: input.trackingNumber,
        carrier: input.carrier
      });

      return { success: true, message: 'Shipping details saved' };
    }),

  // Coupon operations
  validateCoupon: publicProcedure
    .input(z.object({ code: z.string(), orderAmount: z.string() }))
    .query(async ({ input }) => {
      const coupon = await db.select()
        .from(coupons)
        .where(and(
          eq(coupons.code, input.code),
          eq(coupons.isActive, true)
        ))
        .limit(1);

      if (coupon.length === 0) {
        return { valid: false, message: 'Invalid coupon code' };
      }

      const couponData = coupon[0];
      const now = new Date();
      const validFrom = new Date(couponData.validFrom);
      const validTo = new Date(couponData.validTo);

      if (now < validFrom || now > validTo) {
        return { valid: false, message: 'Coupon has expired' };
      }

      if (couponData.usageLimit && couponData.usedCount !== null && couponData.usedCount >= couponData.usageLimit) {
        return { valid: false, message: 'Coupon usage limit reached' };
      }

      if (couponData.minOrderAmount && parseFloat(input.orderAmount) < parseFloat(couponData.minOrderAmount.toString())) {
        return { valid: false, message: `Minimum order amount is $${couponData.minOrderAmount}` };
      }

      let discountAmount = 0;
      if (couponData.discountType === 'percentage') {
        discountAmount = parseFloat(input.orderAmount) * (parseFloat(couponData.discountValue.toString()) / 100);
      } else {
        discountAmount = parseFloat(couponData.discountValue.toString());
      }

      if (couponData.maxDiscountAmount && discountAmount > parseFloat(couponData.maxDiscountAmount.toString())) {
        discountAmount = parseFloat(couponData.maxDiscountAmount.toString());
      }

      return {
        valid: true,
        discountAmount: discountAmount.toString(),
        discountType: couponData.discountType,
        discountValue: couponData.discountValue.toString()
      };
    }),

  applyCoupon: publicProcedure
    .input(z.object({
      orderId: z.number(),
      couponCode: z.string(),
      discountAmount: z.string()
    }))
    .mutation(async ({ input }) => {
      const coupon = await db.select()
        .from(coupons)
        .where(eq(coupons.code, input.couponCode))
        .limit(1);

      if (coupon.length === 0) {
        throw new Error('Invalid coupon code');
      }

      await db.insert(appliedCoupons).values({
        orderId: input.orderId,
        couponId: coupon[0].id,
        discountAmount: input.discountAmount
      });

      await db.update(coupons)
        .set({ usedCount: (coupon[0].usedCount || 0) + 1 })
        .where(eq(coupons.id, coupon[0].id));

      return { success: true, message: 'Coupon applied successfully' };
    }),

  // Notification operations
  getNotifications: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const userNotifications = await db.select()
        .from(notifications)
        .where(eq(notifications.userId, input.userId))
        .orderBy(notifications.createdAt);

      return userNotifications;
    }),

  createNotification: publicProcedure
    .input(z.object({
      userId: z.string(),
      type: z.string(),
      title: z.string(),
      message: z.string(),
      actionUrl: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      await db.insert(notifications).values({
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        actionUrl: input.actionUrl,
        isRead: false
      });

      return { success: true, message: 'Notification created' };
    }),

  markNotificationAsRead: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, input.id));

      return { success: true, message: 'Notification marked as read' };
    }),

  markAllNotificationsAsRead: publicProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input }) => {
      await db.update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.userId, input.userId));

      return { success: true, message: 'All notifications marked as read' };
    }),

  // Product variants operations
  getProductVariants: publicProcedure
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => {
      const variants = await db.select()
        .from(productVariants)
        .where(and(
          eq(productVariants.productId, input.productId),
          eq(productVariants.isActive, true)
        ));
      return variants;
    }),

  // Admin dashboard operations
  getAllOrders: publicProcedure.query(async () => {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }),

  updateOrderStatus: publicProcedure
    .input(z.object({ id: z.number(), status: z.string() }))
    .mutation(async ({ input }) => {
      await db.update(orders)
        .set({ status: input.status })
        .where(eq(orders.id, input.id));
      return { success: true };
    }),

  getAllReviews: publicProcedure.query(async () => {
    return await db.select().from(reviews).orderBy(desc(reviews.createdAt));
  }),

  approveReview: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.update(reviews)
        .set({ isApproved: true })
        .where(eq(reviews.id, input.id));
      return { success: true };
    }),

  deleteReview: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(reviews).where(eq(reviews.id, input.id));
      return { success: true };
    }),

  getSubscribers: publicProcedure.query(async () => {
    return await db.select().from(subscribers).orderBy(desc(subscribers.createdAt));
  }),

  getAllUsers: publicProcedure
    .input(z.object({ adminId: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const allUsers = await UserService.getAllUsers();
      if (input?.adminId) {
        const admin = await UserService.getUserById(input.adminId);
        if (admin && admin.role === 'ADMIN') {
          return allUsers.filter(u => u.role === 'USER');
        }
      }
      return allUsers;
    }),

  updateUserRole: publicProcedure
    .input(z.object({ adminId: z.string(), targetUserId: z.string(), role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']) }))
    .mutation(async ({ input }) => {
      const admin = await UserService.getUserById(input.adminId);
      if (!admin || admin.role !== 'SUPER_ADMIN') {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Only the Super Admin is authorized to modify user roles.' });
      }
      if (input.targetUserId === input.adminId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'You cannot change your own administrator role.' });
      }
      const user = await UserService.updateUser(input.targetUserId, { role: input.role });
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }
      return { success: true, user };
    }),

  updateUserStatus: publicProcedure
    .input(z.object({ adminId: z.string(), targetUserId: z.string(), isActive: z.boolean() }))
    .mutation(async ({ input }) => {
      const admin = await UserService.getUserById(input.adminId);
      if (!admin || (admin.role !== 'SUPER_ADMIN' && admin.role !== 'ADMIN')) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You are not authorized to suspend or activate accounts.' });
      }
      
      const targetUser = await UserService.getUserById(input.targetUserId);
      if (!targetUser) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }

      if (admin.role === 'ADMIN' && targetUser.role !== 'USER') {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Standard administrators are only authorized to suspend or activate customer accounts.' });
      }

      if (input.targetUserId === input.adminId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'You cannot suspend your own account.' });
      }
      
      const user = await UserService.updateUser(input.targetUserId, { isActive: input.isActive });
      return { success: true, user };
    }),

  deleteUser: publicProcedure
    .input(z.object({ adminId: z.string(), targetUserId: z.string() }))
    .mutation(async ({ input }) => {
      const admin = await UserService.getUserById(input.adminId);
      if (!admin || admin.role !== 'SUPER_ADMIN') {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Only the Super Admin is authorized to delete user accounts.' });
      }
      if (input.targetUserId === input.adminId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'You cannot delete your own account.' });
      }
      const success = await UserService.deleteUser(input.targetUserId);
      if (!success) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }
      return { success: true };
    }),

  // Country operations
  getCountries: publicProcedure
    .input(z.object({ onlyActive: z.boolean().optional() }).optional())
    .query(async ({ input }) => {
      const query = db.select().from(countries);
      if (input?.onlyActive) {
        return await query.where(eq(countries.isActive, true)).orderBy(countries.name);
      }
      return await query.orderBy(countries.name);
    }),

  getStatesOfCountry: publicProcedure
    .input(z.object({ countryCode: z.string().min(2).max(2) }))
    .query(async ({ input }) => {
      const { countryCode } = input;
      const apiKey = process.env.CCS_API;
      if (!apiKey) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'CCS_API key is not configured on the server.',
        });
      }
      try {
        const response = await fetch(`https://api.countrystatecity.in/v1/countries/${countryCode.toUpperCase()}/states`, {
          headers: {
            'X-CSCAPI-KEY': apiKey
          }
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch states: ${response.statusText}`);
        }
        const data = await response.json();
        return data as { id: number; name: string; iso2: string }[];
      } catch (err: any) {
        console.error('Error fetching states:', err);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: err.message || 'Failed to fetch states from external API.',
        });
      }
    }),

  getCitiesOfState: publicProcedure
    .input(z.object({ countryCode: z.string().min(2).max(2), stateCode: z.string() }))
    .query(async ({ input }) => {
      const { countryCode, stateCode } = input;
      const apiKey = process.env.CCS_API;
      if (!apiKey) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'CCS_API key is not configured on the server.',
        });
      }
      try {
        const response = await fetch(`https://api.countrystatecity.in/v1/countries/${countryCode.toUpperCase()}/states/${stateCode.toUpperCase()}/cities`, {
          headers: {
            'X-CSCAPI-KEY': apiKey
          }
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch cities: ${response.statusText}`);
        }
        const data = await response.json();
        return data as { id: number; name: string }[];
      } catch (err: any) {
        console.error('Error fetching cities:', err);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: err.message || 'Failed to fetch cities from external API.',
        });
      }
    }),


  addCountry: publicProcedure
    .input(z.object({
      adminId: z.string(),
      name: z.string().min(1),
      code: z.string().min(2).max(2),
    }))
    .mutation(async ({ input }) => {
      const admin = await UserService.getUserById(input.adminId);
      if (!admin || (admin.role !== 'SUPER_ADMIN' && admin.role !== 'ADMIN')) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You are not authorized to add countries.' });
      }

      try {
        await db.insert(countries).values({
          name: input.name,
          code: input.code.toUpperCase(),
          isActive: true
        });
        return { success: true };
      } catch (err: any) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Country name or code already exists.'
        });
      }
    }),

  updateCountry: publicProcedure
    .input(z.object({
      adminId: z.string(),
      countryId: z.number(),
      name: z.string().min(1),
      code: z.string().min(2).max(2),
    }))
    .mutation(async ({ input }) => {
      const admin = await UserService.getUserById(input.adminId);
      if (!admin || (admin.role !== 'SUPER_ADMIN' && admin.role !== 'ADMIN')) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You are not authorized to update countries.' });
      }

      try {
        await db.update(countries)
          .set({ name: input.name, code: input.code.toUpperCase(), updatedAt: new Date() })
          .where(eq(countries.id, input.countryId));
        return { success: true };
      } catch (err: any) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Country name or code already exists.'
        });
      }
    }),

  toggleCountryStatus: publicProcedure
    .input(z.object({
      adminId: z.string(),
      countryId: z.number(),
      isActive: z.boolean()
    }))
    .mutation(async ({ input }) => {
      const admin = await UserService.getUserById(input.adminId);
      if (!admin || (admin.role !== 'SUPER_ADMIN' && admin.role !== 'ADMIN')) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You are not authorized to toggle country status.' });
      }

      await db.update(countries)
        .set({ isActive: input.isActive, updatedAt: new Date() })
        .where(eq(countries.id, input.countryId));
      return { success: true };
    }),

  deleteCountry: publicProcedure
    .input(z.object({
      adminId: z.string(),
      countryId: z.number()
    }))
    .mutation(async ({ input }) => {
      const admin = await UserService.getUserById(input.adminId);
      if (!admin || (admin.role !== 'SUPER_ADMIN' && admin.role !== 'ADMIN')) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You are not authorized to delete countries.' });
      }

      await db.delete(countries)
        .where(eq(countries.id, input.countryId));
      return { success: true };
    }),

  // Admin shipping methods management
  adminGetShippingMethods: publicProcedure
    .input(z.object({ adminId: z.string() }))
    .query(async ({ input }) => {
      const admin = await UserService.getUserById(input.adminId);
      if (!admin || (admin.role !== 'SUPER_ADMIN' && admin.role !== 'ADMIN')) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You are not authorized to view shipping methods.' });
      }

      return await db.select().from(shippingMethods).orderBy(asc(shippingMethods.id));
    }),

  adminCreateShippingMethod: publicProcedure
    .input(z.object({
      adminId: z.string(),
      name: z.string(),
      description: z.string().optional(),
      cost: z.string(),
      estimatedDays: z.number().optional()
    }))
    .mutation(async ({ input }) => {
      const admin = await UserService.getUserById(input.adminId);
      if (!admin || (admin.role !== 'SUPER_ADMIN' && admin.role !== 'ADMIN')) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You are not authorized to create shipping methods.' });
      }

      const newMethod = await db.insert(shippingMethods).values({
        name: input.name,
        description: input.description,
        cost: input.cost,
        estimatedDays: input.estimatedDays,
        isActive: true
      }).returning();

      return { success: true, method: newMethod[0] };
    }),

  adminUpdateShippingMethod: publicProcedure
    .input(z.object({
      adminId: z.string(),
      id: z.number(),
      name: z.string(),
      description: z.string().optional(),
      cost: z.string(),
      estimatedDays: z.number().optional(),
      isActive: z.boolean()
    }))
    .mutation(async ({ input }) => {
      const admin = await UserService.getUserById(input.adminId);
      if (!admin || (admin.role !== 'SUPER_ADMIN' && admin.role !== 'ADMIN')) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You are not authorized to update shipping methods.' });
      }

      const updated = await db.update(shippingMethods)
        .set({
          name: input.name,
          description: input.description,
          cost: input.cost,
          estimatedDays: input.estimatedDays,
          isActive: input.isActive,
          updatedAt: new Date()
        })
        .where(eq(shippingMethods.id, input.id))
        .returning();

      return { success: true, method: updated[0] };
    }),

  adminDeleteShippingMethod: publicProcedure
    .input(z.object({
      adminId: z.string(),
      id: z.number()
    }))
    .mutation(async ({ input }) => {
      const admin = await UserService.getUserById(input.adminId);
      if (!admin || (admin.role !== 'SUPER_ADMIN' && admin.role !== 'ADMIN')) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You are not authorized to delete shipping methods.' });
      }

      await db.delete(shippingMethods).where(eq(shippingMethods.id, input.id));
      return { success: true };
    }),

  // Admin payment methods management
  adminGetPaymentMethods: publicProcedure
    .input(z.object({ adminId: z.string() }))
    .query(async ({ input }) => {
      const admin = await UserService.getUserById(input.adminId);
      if (!admin || (admin.role !== 'SUPER_ADMIN' && admin.role !== 'ADMIN')) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You are not authorized to view payment methods.' });
      }

      return await db.select().from(paymentMethods).orderBy(asc(paymentMethods.id));
    }),

  adminCreatePaymentMethod: publicProcedure
    .input(z.object({
      adminId: z.string(),
      name: z.string(),
      code: z.string(),
      description: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      const admin = await UserService.getUserById(input.adminId);
      if (!admin || (admin.role !== 'SUPER_ADMIN' && admin.role !== 'ADMIN')) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You are not authorized to create payment methods.' });
      }

      const newMethod = await db.insert(paymentMethods).values({
        name: input.name,
        code: input.code,
        description: input.description,
        isActive: true
      }).returning();

      return { success: true, method: newMethod[0] };
    }),

  adminUpdatePaymentMethod: publicProcedure
    .input(z.object({
      adminId: z.string(),
      id: z.number(),
      name: z.string(),
      code: z.string(),
      description: z.string().optional(),
      isActive: z.boolean()
    }))
    .mutation(async ({ input }) => {
      const admin = await UserService.getUserById(input.adminId);
      if (!admin || (admin.role !== 'SUPER_ADMIN' && admin.role !== 'ADMIN')) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You are not authorized to update payment methods.' });
      }

      const updated = await db.update(paymentMethods)
        .set({
          name: input.name,
          code: input.code,
          description: input.description,
          isActive: input.isActive,
          updatedAt: new Date()
        })
        .where(eq(paymentMethods.id, input.id))
        .returning();

      return { success: true, method: updated[0] };
    }),

  adminDeletePaymentMethod: publicProcedure
    .input(z.object({
      adminId: z.string(),
      id: z.number()
    }))
    .mutation(async ({ input }) => {
      const admin = await UserService.getUserById(input.adminId);
      if (!admin || (admin.role !== 'SUPER_ADMIN' && admin.role !== 'ADMIN')) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You are not authorized to delete payment methods.' });
      }

      await db.delete(paymentMethods).where(eq(paymentMethods.id, input.id));
      return { success: true };
    }),



  createOrder: publicProcedure
    .input(z.object({
      customerName: z.string(),
      customerEmail: z.string(),
      totalAmount: z.string(),
      shippingAddress: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        const [newOrder] = await db.insert(orders).values({
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          totalAmount: input.totalAmount,
          shippingAddress: input.shippingAddress,
          status: 'pending',
        }).returning();
        return { success: true, orderId: newOrder.id };
      } catch (err: any) {
        console.error('Error creating order:', err);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: err.message || 'Failed to create order',
        });
      }
    }),

  createRazorpayOrder: publicProcedure
    .input(z.object({
      orderId: z.number(),
      amount: z.number(),
      currency: z.string().default('INR'),
      paymentMethod: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const rzOrder = await RazorpayService.createOrder(Math.round(input.amount * 100), input.currency);


        // Create a pending payment entry
        await db.insert(payments).values({
          orderId: input.orderId,
          paymentMethod: input.paymentMethod || 'Razorpay',
          amount: input.amount.toFixed(2),
          currency: input.currency,
          status: 'pending',
          transactionId: rzOrder.id,
        });

        return {
          success: true,
          razorpayOrderId: rzOrder.id,
          amount: rzOrder.amount,
          currency: rzOrder.currency,
          keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        };
      } catch (err: any) {
        console.error('Razorpay order creation error:', err);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: err.message || 'Failed to initialize Razorpay payment',
        });
      }
    }),

  verifyRazorpayPayment: publicProcedure
    .input(z.object({
      orderId: z.number(),
      razorpayPaymentId: z.string(),
      razorpayOrderId: z.string(),
      razorpaySignature: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        const text = input.razorpayOrderId + "|" + input.razorpayPaymentId;
        const secret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';
        const generated_signature = crypto
          .createHmac('sha256', secret)
          .update(text)
          .digest('hex');

        if (generated_signature === input.razorpaySignature) {
          // Update payment record to completed
          await db.update(payments)
            .set({
              status: 'completed',
              transactionId: input.razorpayPaymentId,
              paymentDate: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(payments.transactionId, input.razorpayOrderId));

          // Update order status to paid (processing)
          await db.update(orders)
            .set({
              status: 'processing',
              updatedAt: new Date(),
            })
            .where(eq(orders.id, input.orderId));

          return { success: true };
        } else {
          // Update payment record to failed
          await db.update(payments)
            .set({
              status: 'failed',
              updatedAt: new Date(),
            })
            .where(eq(payments.transactionId, input.razorpayOrderId));

          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Signature verification failed',
          });
        }
      } catch (err: any) {
        console.error('Razorpay payment verification error:', err);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: err.message || 'Payment verification failed',
        });
      }
    }),

  getUserOrders: publicProcedure
    .input(z.object({
      email: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        return await db
          .select()
          .from(orders)
          .where(eq(orders.customerEmail, input.email))
          .orderBy(desc(orders.createdAt));
      } catch (err: any) {
        console.error('Error fetching user orders:', err);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: err.message || 'Failed to fetch user orders',
        });
      }
    }),

  adminGetAllCoupons: publicProcedure
    .input(z.object({ adminId: z.string() }))
    .query(async ({ input }) => {
      const admin = await UserService.getUserById(input.adminId);
      if (!admin || (admin.role !== 'SUPER_ADMIN' && admin.role !== 'ADMIN')) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You are not authorized to view coupons.' });
      }
      return await db.select().from(coupons).orderBy(desc(coupons.createdAt));
    }),

  adminCreateCoupon: publicProcedure
    .input(z.object({
      adminId: z.string(),
      code: z.string().min(1),
      description: z.string().optional(),
      discountType: z.string(),
      discountValue: z.string(),
      minOrderAmount: z.string().optional(),
      maxDiscountAmount: z.string().optional(),
      usageLimit: z.number().optional(),
      validFrom: z.string(),
      validTo: z.string(),
    }))
    .mutation(async ({ input }) => {
      const admin = await UserService.getUserById(input.adminId);
      if (!admin || (admin.role !== 'SUPER_ADMIN' && admin.role !== 'ADMIN')) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You are not authorized to create coupons.' });
      }
      try {
        await db.insert(coupons).values({
          code: input.code.toUpperCase(),
          description: input.description || null,
          discountType: input.discountType,
          discountValue: input.discountValue,
          minOrderAmount: input.minOrderAmount || null,
          maxDiscountAmount: input.maxDiscountAmount || null,
          usageLimit: input.usageLimit || null,
          validFrom: new Date(input.validFrom),
          validTo: new Date(input.validTo),
          isActive: true,
        });
        return { success: true };
      } catch (err: any) {
        console.error('Error creating coupon:', err);
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Coupon code already exists.'
        });
      }
    }),

  adminToggleCouponStatus: publicProcedure
    .input(z.object({
      adminId: z.string(),
      couponId: z.number(),
      isActive: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      const admin = await UserService.getUserById(input.adminId);
      if (!admin || (admin.role !== 'SUPER_ADMIN' && admin.role !== 'ADMIN')) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You are not authorized to update coupons.' });
      }
      await db.update(coupons)
        .set({ isActive: input.isActive, updatedAt: new Date() })
        .where(eq(coupons.id, input.couponId));
      return { success: true };
    }),

  adminDeleteCoupon: publicProcedure
    .input(z.object({
      adminId: z.string(),
      couponId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const admin = await UserService.getUserById(input.adminId);
      if (!admin || (admin.role !== 'SUPER_ADMIN' && admin.role !== 'ADMIN')) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You are not authorized to delete coupons.' });
      }
      await db.delete(coupons).where(eq(coupons.id, input.couponId));
      return { success: true };
    }),

  // Health check
  healthCheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
});

// Export type for client
export type AppRouter = typeof appRouter;
