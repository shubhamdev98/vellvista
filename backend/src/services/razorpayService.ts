import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import Razorpay from 'razorpay';
import crypto from 'crypto';
// Removed invalid env import; using process.env directly

/**
 * Wrapper around Razorpay SDK for order creation and signature verification.
 */
export class RazorpayService {
  // Lazily create Razorpay instance only when credentials are present
  private static getInstance(): Razorpay {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials are not set. Provide RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.');
    }
    return new Razorpay({ key_id: keyId, key_secret: keySecret });
  }

  /**
   * Create a Razorpay order.
   * @param amount Amount in the smallest currency unit (e.g., paise for INR).
   * @param currency Currency code, default INR.
   */
  static async createOrder(amount: number, currency: string = 'INR') {
    const options = {
      amount,
      currency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1 // auto capture
    };
    return await RazorpayService.getInstance().orders.create(options);
  }

  /**
   * Verify Razorpay payment signature.
   * @param payload Object containing razorpay_order_id, razorpay_payment_id, razorpay_signature
   */
  static verifySignature(payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = payload;
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '');
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');
    if (generatedSignature !== razorpay_signature) {
      throw new Error('Invalid Razorpay signature');
    }
    // Razorpay SDK throws if invalid, so just return true if no error
    return true;
  }
}
