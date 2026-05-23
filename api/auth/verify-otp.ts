import type { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";
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

  const { code, signature, expiry } = req.body || {};
  if (!code || !signature || !expiry) {
    return res.status(400).json({ error: "Missing verification parameters" });
  }

  // Check if expired
  if (Date.now() > Number(expiry)) {
    return res.status(401).json({ error: "Passcode has expired. Please request a new code." });
  }

  // Verify the signature
  const secret = process.env.JWT_SECRET || "precision-fallback-secret-key-2026";
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${code.trim()}:${expiry}`)
    .digest("hex");

  if (signature !== expectedSignature) {
    return res.status(401).json({ error: "Invalid passcode. Please try again." });
  }

  // Generate Admin Session JWT
  const token = jwt.sign(
    {
      role: "admin",
      email: process.env.ADMIN_EMAIL || "cesaresmero2@gmail.com"
    },
    secret,
    { expiresIn: "7d" }
  );

  return res.status(200).json({
    message: "Passcode verified",
    token
  });
}
