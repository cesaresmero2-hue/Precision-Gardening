import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables from .env.local or fallback to .env
dotenv.config({ path: ".env.local" });
dotenv.config();

// Import local typescript serverless functions
import quoteHandler from "./api/quote";
import bookHandler from "./api/book";
import sendOtpHandler from "./api/auth/send-otp";
import verifyOtpHandler from "./api/auth/verify-otp";
import bookingsHandler from "./api/admin/bookings";

const app = express();
app.use(cors());
app.use(express.json());

// Adapter to bridge standard Express Request/Response to Vercel Node handler interface
const adapt = (handlerFn: any) => {
  return async (req: any, res: any) => {
    try {
      if (!req.cookies) {
        req.cookies = {};
      }
      
      // Bind response helpers
      res.status = res.status.bind(res);
      res.json = res.json.bind(res);
      res.send = res.send.bind(res);
      
      await handlerFn(req, res);
    } catch (err: any) {
      console.error("Local Dev API Error:", err);
      res.status(500).json({ error: "Internal Server Error", details: err.message || String(err) });
    }
  };
};

app.post("/api/quote", adapt(quoteHandler));
app.post("/api/book", adapt(bookHandler));
app.post("/api/auth/send-otp", adapt(sendOtpHandler));
app.post("/api/auth/verify-otp", adapt(verifyOtpHandler));

// Admin bookings endpoint supports GET (list), POST (crud action)
app.get("/api/admin/bookings", adapt(bookingsHandler));
app.post("/api/admin/bookings", adapt(bookingsHandler));
app.options("/api/admin/bookings", adapt(bookingsHandler));

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`\n🚀 Local Dev API Server running at http://localhost:${PORT}`);
  console.log(`📡 Requests to /api/* from Vite will be proxied here.\n`);
});
