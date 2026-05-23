import type { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";
import { getBookings, saveBookings, Booking } from "../db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.status(200).end();
  }

  // Authenticate token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET || "precision-fallback-secret-key-2026";

  try {
    const decoded = jwt.verify(token, secret) as any;
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin role required." });
    }
  } catch (err) {
    return res.status(401).json({ error: "Session expired or invalid. Please log in again." });
  }

  // Retrieve current bookings
  const { bookings, isFallback } = await getBookings();

  if (req.method === "GET") {
    return res.status(200).json({ bookings, isFallback });
  }

  if (req.method === "POST") {
    const { action, bookingId, updatedData } = req.body;
    if (!action || !bookingId) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    const index = bookings.findIndex(b => b.id === bookingId);
    if (index === -1) {
      return res.status(404).json({ error: "Booking reference not found" });
    }

    if (action === "update-status") {
      const { status } = updatedData;
      if (!status) return res.status(400).json({ error: "Status value required" });
      bookings[index].status = status;
    } else if (action === "reschedule") {
      const { date, timeSlot } = updatedData;
      if (!date || !timeSlot) return res.status(400).json({ error: "Date and Time Slot required" });
      bookings[index].date = date;
      bookings[index].timeSlot = timeSlot;
    } else if (action === "delete") {
      bookings.splice(index, 1);
    } else {
      return res.status(400).json({ error: "Invalid action" });
    }

    // Save bookings state
    await saveBookings(bookings);
    return res.status(200).json({
      message: "Action successfully applied",
      bookings,
      isFallback
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
