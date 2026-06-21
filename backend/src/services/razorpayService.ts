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
  private static instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || ''
  });

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
    return await RazorpayService.instance.orders.create(options);
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
