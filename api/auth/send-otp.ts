import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";
import crypto from "crypto";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  // Retrieve admin recipient email, defaulting to cesar's or placeholder
  const adminEmail = process.env.ADMIN_EMAIL || "admin@precisionexterior.com";

  if (email.toLowerCase().trim() !== adminEmail.toLowerCase().trim()) {
    return res.status(401).json({ error: "Access denied: Unauthorized email address" });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // 5 minute expiry window
  const expiry = Date.now() + 5 * 60 * 1000;

  // Create signature using server-only JWT secret
  const secret = process.env.JWT_SECRET || "precision-fallback-secret-key-2026";
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${otp}:${expiry}`)
    .digest("hex");

  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      // On Vercel / Resend, you can send to any verified email or sandbox
      await resend.emails.send({
        from: "Precision Security <onboarding@resend.dev>",
        to: adminEmail,
        subject: "Your Precision Admin Portal OTP",
        html: `
          <div style="font-family: sans-serif; padding: 24px; max-width: 480px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px;">
            <h2 style="font-size: 20px; font-weight: bold; color: #1b3a2d; margin-bottom: 12px;">Precision Gardening & Power Washing</h2>
            <p style="font-size: 14px; color: #4b5563; line-height: 1.5; margin-bottom: 20px;">Use the following passcode to access the Admin Management Dashboard. This passcode expires in 5 minutes.</p>
            <div style="background-color: #f3f4f6; text-align: center; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #111827;">${otp}</span>
            </div>
            <p style="font-size: 11px; color: #9ca3af; margin-top: 24px;">If you did not request this login code, you can safely ignore this email.</p>
          </div>
        `
      });
    } catch (err) {
      console.error("Failed to send OTP email via Resend:", err);
    }
  }

  // Always log to console in dev mode so the user can see it in terminal logs
  console.log(`\n-------------------------------------`);
  console.log(`[DEV OTP LOG] Email: ${adminEmail}`);
  console.log(`Passcode: ${otp}`);
  console.log(`-------------------------------------\n`);

  return res.status(200).json({
    message: "OTP sent successfully",
    signature,
    expiry
  });
}
