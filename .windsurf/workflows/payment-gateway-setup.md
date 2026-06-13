---
description: How to set up multiple payment gateway integrations (Stripe, Razorpay, Google Pay, PhonePe, Paytm)
---

# Multi-Payment Gateway Setup Workflow

This workflow guides you through setting up multiple payment gateways for your e-commerce application: Stripe, Razorpay, Google Pay, PhonePe, and Paytm.

## Prerequisites
- Node.js installed
- Backend and frontend directories set up
- Database configured
- Accounts created for all payment providers:
  - Stripe (stripe.com)
  - Razorpay (razorpay.com)
  - Google Pay (via Stripe or direct)
  - PhonePe (phonepe.com)
  - Paytm (paytm.com)

## Steps

### 1. Install Payment Gateway Dependencies

**Backend:**
```bash
cd backend
npm install stripe razorpay crypto-js
```

**Frontend:**
```bash
cd frontend
pnpm install @stripe/stripe-js @stripe/react-stripe-js razorpay
```

### 2. Set Up Environment Variables

Add the following to your backend `.env` file:
```
# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Razorpay
RAZORPAY_KEY_ID=rzp_test_your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# PhonePe
PHONEPE_MERCHANT_ID=your_phonepe_merchant_id
PHONEPE_SALT_KEY=your_phonepe_salt_key
PHONEPE_SALT_INDEX=your_phonepe_salt_index
PHONEPE_ENV=TEST/UAT

# Paytm
PAYTM_MERCHANT_ID=your_paytm_merchant_id
PAYTM_MERCHANT_KEY=your_paytm_merchant_key
PAYTM_WEBSITE=your_paytm_website
PAYTM_INDUSTRY_TYPE=Retail
PAYTM_ENV=TEST
```

Add the following to your frontend `.env` file:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_razorpay_key_id
NEXT_PUBLIC_PHONEPE_MERCHANT_ID=your_phonepe_merchant_id
```

### 3. Create Unified Payment Service in Backend

Create `backend/src/services/payment.service.ts` with support for all providers:

**Stripe Integration:**
- Initialize Stripe client with secret key
- Functions: createPaymentIntent, confirmPayment, handleWebhook, refundPayment

**Razorpay Integration:**
- Initialize Razorpay with key_id and key_secret
- Functions: createOrder, verifyPayment, handleWebhook, refundPayment

**PhonePe Integration:**
- Initialize PhonePe with merchant credentials
- Functions: initiateTransaction, checkStatus, handleCallback, refundPayment

**Paytm Integration:**
- Initialize Paytm with merchant credentials
- Functions: initiateTransaction, checkStatus, handleCallback, refundPayment

**Google Pay Integration:**
- Use Stripe's Google Pay integration
- Functions: createPaymentIntent (via Stripe), processGooglePay

### 4. Create Payment API Routes

Add the following routes to `backend/src/index.ts`:

**Stripe Routes:**
- `POST /api/payment/stripe/create-intent` - Create Stripe payment intent
- `POST /api/payment/stripe/confirm` - Confirm Stripe payment
- `POST /api/payment/stripe/webhook` - Handle Stripe webhooks

**Razorpay Routes:**
- `POST /api/payment/razorpay/create-order` - Create Razorpay order
- `POST /api/payment/razorpay/verify` - Verify Razorpay payment
- `POST /api/payment/razorpay/webhook` - Handle Razorpay webhooks

**PhonePe Routes:**
- `POST /api/payment/phonepe/initiate` - Initiate PhonePe transaction
- `GET /api/payment/phonepe/status/:transactionId` - Check PhonePe status
- `POST /api/payment/phonepe/callback` - Handle PhonePe callback

**Paytm Routes:**
- `POST /api/payment/paytm/initiate` - Initiate Paytm transaction
- `GET /api/payment/paytm/status/:orderId` - Check Paytm status
- `POST /api/payment/paytm/callback` - Handle Paytm callback

**Google Pay Routes:**
- `POST /api/payment/googlepay/create-intent` - Create Google Pay intent (via Stripe)
- `POST /api/payment/googlepay/process` - Process Google Pay payment

**Common Routes:**
- `POST /api/payment/refund` - Process refunds for any provider
- `GET /api/payment/methods` - Get available payment methods

### 5. Set Up Webhook Handlers

Create webhook handlers for each provider:

**Stripe Webhook Events:**
- `payment_intent.succeeded` - Update order status to paid
- `payment_intent.failed` - Update order status to failed
- `charge.refunded` - Handle refunds

**Razorpay Webhook Events:**
- `payment.captured` - Update order status to paid
- `payment.failed` - Update order status to failed
- `refund.processed` - Handle refunds

**PhonePe Webhook/Callback:**
- Success response - Update order status to paid
- Failure response - Update order status to failed

**Paytm Webhook/Callback:**
- TXN_SUCCESS - Update order status to paid
- TXN_FAILURE - Update order status to failed

### 6. Create Frontend Payment Components

Create `frontend/components/PaymentMethodSelector.tsx`:
- Display all available payment methods (Stripe, Razorpay, Google Pay, PhonePe, Paytm)
- Allow user to select payment method
- Show icons/logos for each provider

Create `frontend/components/StripePaymentForm.tsx`:
- Load Stripe.js and React Stripe.js
- Create card element
- Handle submission and call backend API
- Display success/error messages

Create `frontend/components/RazorpayPaymentForm.tsx`:
- Load Razorpay SDK
- Open Razorpay checkout
- Handle success/failure callbacks
- Verify payment with backend

Create `frontend/components/PhonePePaymentForm.tsx`:
- Generate PhonePe payment link
- Redirect to PhonePe app/web
- Handle callback verification

Create `frontend/components/PaytmPaymentForm.tsx`:
- Generate Paytm payment link
- Redirect to Paytm page
- Handle callback verification

Create `frontend/components/GooglePayButton.tsx`:
- Use Stripe PaymentRequestButton for Google Pay
- Handle Google Pay token
- Process payment via Stripe

### 7. Integrate Payment into Checkout Flow

Update your checkout page to:
- Display order summary
- Show payment method selector
- Render appropriate payment form based on selection
- Handle payment completion
- Redirect to success/failure pages
- Support payment method switching

### 8. Create Database Schema Updates

Add payment-related tables to your database schema:

```sql
-- Payments table
CREATE TABLE payments (
  id VARCHAR(255) PRIMARY KEY,
  order_id VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  status VARCHAR(50) NOT NULL,
  provider VARCHAR(50) NOT NULL, -- 'stripe', 'razorpay', 'phonepe', 'paytm', 'googlepay'
  provider_payment_id VARCHAR(255),
  provider_order_id VARCHAR(255),
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Update orders table
ALTER TABLE orders ADD COLUMN payment_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN payment_status VARCHAR(50);
```

Run migration:
```bash
cd backend
npm run db:push
```

### 9. Test Each Integration

**Stripe Testing:**
- Use test card: 4242 4242 4242 4242
- Test successful and failed payments
- Test webhook handling with Stripe CLI:
```bash
stripe listen --forward-to localhost:3001/api/payment/stripe/webhook
```

**Razorpay Testing:**
- Use test mode in Razorpay dashboard
- Test with test card: 4111 1111 1111 1111
- Test successful and failed payments
- Verify webhook signatures

**PhonePe Testing:**
- Use UAT environment
- Test with test phone number
- Verify callback handling

**Paytm Testing:**
- Use staging environment
- Test with test credentials
- Verify callback handling

**Google Pay Testing:**
- Use Stripe test mode
- Test with Google Pay sandbox
- Verify payment processing

### 10. Go Live

When ready for production:

**Stripe:**
- Replace test keys with live keys
- Update webhook endpoint URL
- Enable Google Pay in Stripe dashboard

**Razorpay:**
- Switch to live mode
- Update webhook endpoint
- Enable required payment methods

**PhonePe:**
- Switch to production environment
- Update production credentials
- Configure production callbacks

**Paytm:**
- Switch to production environment
- Update production credentials
- Configure production callbacks

**Final Steps:**
- Test all providers with real payments (small amounts)
- Monitor webhook deliveries
- Set up proper error handling and logging
- Configure payment method display logic based on user location/device

## Common Issues

**Stripe:**
- CORS errors: Ensure backend allows frontend origin
- Webhook failures: Verify webhook secret matches
- Payment intent creation fails: Check Stripe account status

**Razorpay:**
- Webhook signature verification fails: Check secret key
- Order creation fails: Verify API key and permissions
- Payment verification fails: Ensure webhook is configured

**PhonePe:**
- Transaction initiation fails: Check merchant ID and salt key
- Callback not received: Verify callback URL is accessible
- Status check fails: Ensure transaction ID is correct

**Paytm:**
- Checksum verification fails: Verify merchant key
- Callback not received: Check callback URL configuration
- Transaction status mismatch: Implement proper status polling

**Google Pay:**
- Google Pay button not showing: Ensure HTTPS and supported browser
- Payment fails: Check Stripe Google Pay configuration
- Token verification fails: Verify Stripe integration

**General:**
- Multiple payment method conflicts: Implement proper state management
- Payment method availability: Show only supported methods per region
- Webhook idempotency: Handle duplicate webhook events

## Additional Features (Optional)

- Save payment methods for future use (Stripe/Razorpay)
- Set up subscriptions/recurring payments
- Add support for Apple Pay (via Stripe)
- Implement payment method management in user account
- Add UPI payment support (PhonePe/Paytm)
- Support EMI options (Razorpay/Stripe)
- Add international payment methods
- Implement payment analytics dashboard
- Set up automatic refund processing
- Add payment method routing based on amount/region
