import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import nodemailer from "nodemailer";
import { db } from "./db";
import { user, session, account, verification } from "./schema";

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
const serverIp = process.env.SERVER_IP || localIp;
const isDomain = serverIp.includes('.') && !/^[0-9.]+$/.test(serverIp);
const backendUrl = isDomain ? `https://${serverIp}` : `http://${serverIp}:3001`;
const frontendUrl = isDomain ? `https://${serverIp}` : `http://${localIp}:3000`;

const socialProviders: Record<string, { clientId: string; clientSecret: string }> = {};
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const hasGoogleCredentials =
  googleClientId &&
  googleClientSecret &&
  !googleClientId.includes("your-google-client-id") &&
  !googleClientSecret.includes("your-google-client-secret");

if (hasGoogleCredentials) {
  socialProviders.google = {
    clientId: googleClientId,
    clientSecret: googleClientSecret,
  };
} else {
  console.warn("Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env.");
}

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 5000, // 5 seconds
  greetingTimeout: 5000,   // 5 seconds
  socketTimeout: 5000,     // 5 seconds
});

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || backendUrl,
  basePath: "/api/auth",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  socialProviders,
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
  },
  trustedOrigins: [
    process.env.FRONTEND_URL || frontendUrl,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    `http://${localIp}:3000`
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }: { user: { email: string }; url: string }) => {
      console.log("Password reset URL generated:", url);
      const resetFrontendUrl = process.env.FRONTEND_URL || frontendUrl;
      
      const mailOptions = {
        from: `"Vellvista" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: "Reset Your Password - Vellvista",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://res.cloudinary.com/dujjidn0e/image/upload/v1781626147/vellvista/logo/w5kkgq9suiw7sk4poxsz.png" alt="Vellvista Logo" style="height: 40px; object-fit: contain;" />
            </div>
            <h2 style="color: #111827; text-align: center;">Reset Your Password</h2>
            <p style="color: #4b5563; font-size: 16px;">Hello,</p>
            <p style="color: #4b5563; font-size: 16px;">We received a request to reset your password for your Vellvista account. Click the button below to choose a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${url}" style="background-color: #111827; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">If you did not request a password reset, please ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">This is an automated email, please do not reply.</p>
          </div>
        `,
      };

      transporter.sendMail(mailOptions)
        .then(() => {
          console.log(`Password reset email sent successfully to ${user.email}`);
        })
        .catch((error) => {
          console.error("Failed to send password reset email:", error);
        });
    },
  },
});
