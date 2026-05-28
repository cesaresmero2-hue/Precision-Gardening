import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { Resend } from "resend";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { getBookings, saveBookings, getQuotes, saveQuotes } from "./src/api/db.js";

dotenv.config();

const app = express();
const PORT = 3000;

async function startServer() {

    app.use(express.json());

    // Safe lazy initializer for Resend Client
    const getResendClient = () => {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            console.warn("WARNING: RESEND_API_KEY environment variable is not defined. Email dispatch is disabled.");
            return null;
        }
        return new Resend(apiKey);
    };

    /**
     * Quote Requests API Endpoint
     */
    app.post("/api/quote", async (req, res) => {
        try {
            const { fullName, phone, email, serviceType, message } = req.body || {};

            if (!fullName || !phone || !email) {
                return res.status(400).json({ error: "Missing required contact details (name, phone, or email)" });
            }

            console.log(`[Quote Request] Received from ${fullName} (${email}) for service "${serviceType}"`);

            const referenceId = "PRC-Q" + Math.floor(100000 + Math.random() * 900000);

            const { quotes } = await getQuotes();
            const newQuote = {
                id: referenceId,
                name: fullName,
                phone,
                email,
                service: serviceType,
                message: message || "",
                status: "Pending",
                createdAt: new Date().toISOString()
            };
            quotes.unshift(newQuote);
            await saveQuotes(quotes);

            const resend = getResendClient();
            const adminEmail = process.env.ADMIN_EMAIL || "cesaresmero2@gmail.com";
            const sadminEmail = process.env.SADMIN_EMAIL;

            if (resend) {
                const adminEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #1b3a2d; border-radius: 8px; background-color: #fafbf9;">
            <div style="background-color: #1b3a2d; color: #f5f0e8; padding: 15px; border-radius: 6px; text-align: center;">
              <h2 style="margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 0.5px;">New Digital Quote Request</h2>
              <p style="margin: 5px 0 0 0; font-size: 11px; opacity: 0.85; font-family: monospace;">Ref ID: ${referenceId}</p>
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <tr style="background-color: #f3f5f3;"><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 13px; color: #64748b; text-transform: uppercase;">Lead Full Name:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: bold; color: #1e293b;">${fullName}</td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 13px; color: #64748b; text-transform: uppercase;">Phone Number:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px;"><a href="tel:${phone}" style="color: #16a34a; font-weight: bold; text-decoration: none;">${phone}</a></td></tr>
              <tr style="background-color: #f3f5f3;"><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 13px; color: #64748b; text-transform: uppercase;">Email Address:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px;"><a href="mailto:${email}" style="color: #1e6fa8; font-weight: bold; text-decoration: none;">${email}</a></td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 13px; color: #64748b; text-transform: uppercase;">Service Target:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: bold; color: #1e6fa8;">${serviceType}</td></tr>
            </table>
            <div style="margin-top: 20px; padding: 15px; background-color: #ffffff; border-left: 4px solid #1b3a2d; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <h3 style="margin-top: 0; color: #1b3a2d; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Property Scope & Specifications</h3>
              <p style="white-space: pre-wrap; margin-bottom: 0; font-size: 13.5px; line-height: 1.5; color: #334155;">${message || "No custom specifications provided."}</p>
            </div>
          </div>
        `;

                const userEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
            <div style="background-color: #1b3a2d; color: #f5f0e8; padding: 20px; border-radius: 6px; text-align: center; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 22px; font-weight: bold;">We've Received Your Quote Request</h1>
              <p style="margin: 5px 0 0 0; font-size: 12px; font-family: monospace; opacity: 0.9;">Ticket ID: ${referenceId}</p>
            </div>
            <p style="font-size: 15px; color: #334155;">Hello ${fullName},</p>
            <p style="font-size: 15px; color: #334155; line-height: 1.6;">Thank you for requesting an estimate from <strong>Precision Exterior Care</strong>.</p>
          </div>
        `;

                const adminRecipients = sadminEmail ? [adminEmail, sadminEmail] : [adminEmail];

                try {
                    // Send to primary admin
                    await resend.emails.send({
                        from: "Precision Exterior <onboarding@resend.dev>",
                        to: adminEmail,
                        subject: `[Quote Form] ${serviceType} - ${fullName}`,
                        html: adminEmailHtml,
                        replyTo: email
                    });
                    
                    // Send to secondary admin if configured
                    if (sadminEmail && sadminEmail !== adminEmail) {
                        try {
                            await resend.emails.send({
                                from: "Precision Exterior <onboarding@resend.dev>",
                                to: sadminEmail,
                                subject: `[Quote Form] ${serviceType} - ${fullName}`,
                                html: adminEmailHtml,
                                replyTo: email
                            });
                        } catch (sadminError) {
                            console.error("Failed to send quote notification to SADMIN_EMAIL:", sadminError);
                        }
                    }
                    
                    try {
                        await resend.emails.send({
                            from: "Precision Exterior <onboarding@resend.dev>",
                            to: email,
                            subject: `Precision Quote Query - ${referenceId}`,
                            html: userEmailHtml
                        });
                    } catch (error) {
                        console.error("User confirmation email could not be sent (Resend sandbox constraints):", error);
                    }
                } catch (mailError: any) {
                    console.error("Failed to execute email triggers:", mailError?.message || mailError);
                }
            }

            return res.status(200).json({ status: "success", referenceId });
        } catch (err: any) {
            console.error("Quote endpoint failure:", err);
            return res.status(500).json({ error: err.message || "Failure registering quote query." });
        }
    });

    /**
     * Booking Crew Slot API Endpoint
     */
    app.post("/api/book", async (req, res) => {
        try {
            const { fullName, phone, email, serviceType, date, timeSlot, message } = req.body || {};

            if (!fullName || !phone || !email || !date) {
                return res.status(400).json({ error: "Missing required booking details." });
            }

            console.log(`[Booking Request] Received from ${fullName} on ${date} (${timeSlot})`);

            const referenceId = "PRC-B" + Math.floor(100000 + Math.random() * 900000);

            const newBooking = {
                id: referenceId,
                name: fullName,
                phone,
                email,
                service: serviceType,
                date,
                timeSlot,
                message: message || "",
                status: "Pending",
                createdAt: new Date().toISOString(),
            };

            const { bookings } = await getBookings();
            bookings.unshift(newBooking);
            await saveBookings(bookings);

            const resend = getResendClient();
            const adminEmail = process.env.ADMIN_EMAIL || "cesaresmero2@gmail.com";
            const sadminEmail = process.env.SADMIN_EMAIL;

            if (resend) {
                const adminEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #1b3a2d; border-radius: 8px; background-color: #fafbf9;">
            <div style="background-color: #1b3a2d; color: #f5f0e8; padding: 15px; border-radius: 6px; text-align: center;">
              <h2 style="margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 0.5px;">New Service Booking Request</h2>
              <p style="margin: 5px 0 0 0; font-size: 11px; opacity: 0.85; font-family: monospace;">Ref ID: ${referenceId}</p>
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <tr style="background-color: #f3f5f3;"><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 13px; color: #64748b; text-transform: uppercase;">Customer Name:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: bold; color: #1e293b;">${fullName}</td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 13px; color: #64748b; text-transform: uppercase;">Phone Number:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px;"><a href="tel:${phone}" style="color: #16a34a; font-weight: bold; text-decoration: none;">${phone}</a></td></tr>
              <tr style="background-color: #f3f5f3;"><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 13px; color: #64748b; text-transform: uppercase;">Email Address:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px;"><a href="mailto:${email}" style="color: #1e6fa8; font-weight: bold; text-decoration: none;">${email}</a></td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 13px; color: #64748b; text-transform: uppercase;">Service Type:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: bold; color: #1e6fa8;">${serviceType}</td></tr>
              <tr style="background-color: #f3f5f3;"><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 13px; color: #64748b; text-transform: uppercase;">Scheduled Date:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: bold; color: #1e293b;">${date}</td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 13px; color: #64748b; text-transform: uppercase;">Time Slot:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: bold; color: #1e293b;">${timeSlot}</td></tr>
            </table>
            ${message ? `<div style="margin-top: 20px; padding: 15px; background-color: #ffffff; border-left: 4px solid #1b3a2d; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <h3 style="margin-top: 0; color: #1b3a2d; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Additional Notes</h3>
              <p style="white-space: pre-wrap; margin-bottom: 0; font-size: 13.5px; line-height: 1.5; color: #334155;">${message}</p>
            </div>` : ''}
          </div>
        `;

                const userEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
            <div style="background-color: #1b3a2d; color: #f5f0e8; padding: 20px; border-radius: 6px; text-align: center; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 22px; font-weight: bold;">Booking Request Received</h1>
              <p style="margin: 5px 0 0 0; font-size: 12px; font-family: monospace; opacity: 0.9;">Ticket ID: ${referenceId}</p>
            </div>
            <p style="font-size: 15px; color: #334155;">Hello ${fullName},</p>
            <p style="font-size: 15px; color: #334155; line-height: 1.6;">Your booking request for <strong>${serviceType}</strong> on <strong>${date}</strong> at <strong>${timeSlot}</strong> has been received and is pending approval.</p>
            <p style="font-size: 15px; color: #334155; line-height: 1.6;">We will contact you shortly to confirm your appointment.</p>
          </div>
        `;

                try {
                    // Send to primary admin
                    await resend.emails.send({
                        from: "Precision Bookings <onboarding@resend.dev>",
                        to: adminEmail,
                        subject: `[Booking Form] ${serviceType} on ${date} - ${fullName}`,
                        html: adminEmailHtml,
                        replyTo: email
                    });
                    
                    // Send to secondary admin if configured
                    if (sadminEmail && sadminEmail !== adminEmail) {
                        try {
                            await resend.emails.send({
                                from: "Precision Bookings <onboarding@resend.dev>",
                                to: sadminEmail,
                                subject: `[Booking Form] ${serviceType} on ${date} - ${fullName}`,
                                html: adminEmailHtml,
                                replyTo: email
                            });
                        } catch (sadminError) {
                            console.error("Failed to send booking notification to SADMIN_EMAIL:", sadminError);
                        }
                    }
                    
                    try {
                        await resend.emails.send({
                            from: "Precision Bookings <onboarding@resend.dev>",
                            to: email,
                            subject: `Precision Scheduling - ${referenceId}`,
                            html: userEmailHtml
                        });
                    } catch (error) {
                        console.error("User confirmation email could not be sent (Resend sandbox constraints):", error);
                    }
                } catch (err) {
                    console.error("Failed to execute email triggers:", err);
                }
            }

            return res.status(200).json({ status: "success", referenceId });
        } catch (err: any) {
            console.error("Booking endpoint failure:", err);
            return res.status(500).json({ error: "Failure registering crew booking." });
        }
    });

    /**
     * Admin Passcode OTP Request API Endpoint
     */
    app.post("/api/auth/send-otp", async (req, res) => {
        try {
            const { email } = req.body || {};
            if (!email) return res.status(400).json({ error: "Email is required" });

            const adminEmail = process.env.ADMIN_EMAIL || "cesaresmero2@gmail.com";

            if (email.toLowerCase().trim() !== adminEmail.toLowerCase().trim()) {
                return res.status(401).json({ error: "Access denied: Unauthorized email address" });
            }

            const otpValue = Math.floor(100000 + Math.random() * 900000).toString();
            const expirySlot = Date.now() + 5 * 60 * 1000;
            const secret = process.env.JWT_SECRET || "precision-fallback-secret-key-2026";
            const signature = crypto.createHmac("sha256", secret).update(`${otpValue}:${expirySlot}`).digest("hex");

            const resend = getResendClient();

            if (resend) {
                try {
                    await resend.emails.send({
                        from: "Precision Security <onboarding@resend.dev>",
                        to: adminEmail,
                        subject: "Your Precision Admin Portal OTP",
                        html: `<p>Your passcode is: <b>${otpValue}</b></p>`
                    });
                } catch (err: any) {
                    console.error("Failed to send OTP email via Resend:", err);
                }
            }

            console.log(`[DEV OTP] Passcode: ${otpValue}`);

            return res.status(200).json({
                message: "OTP sent successfully",
                signature,
                expiry: expirySlot
            });
        } catch (err: any) {
            return res.status(500).json({ error: "Failed to dispatch login passcode." });
        }
    });

    /**
     * Admin OTP Verification Endpoint
     */
    app.post("/api/auth/verify-otp", async (req, res) => {
        try {
            const { code, signature, expiry } = req.body || {};
            if (!code || !signature || !expiry) {
                return res.status(400).json({ error: "Missing verification parameters" });
            }

            if (Date.now() > Number(expiry)) {
                return res.status(401).json({ error: "Passcode has expired." });
            }

            const secret = process.env.JWT_SECRET || "precision-fallback-secret-key-2026";
            const expectedSignature = crypto.createHmac("sha256", secret).update(`${code.trim()}:${expiry}`).digest("hex");

            if (signature !== expectedSignature) {
                return res.status(401).json({ error: "Invalid passcode." });
            }

            const token = jwt.sign(
                { role: "admin", email: process.env.ADMIN_EMAIL || "cesaresmero2@gmail.com" },
                secret,
                { expiresIn: "7d" }
            );

            return res.status(200).json({ message: "Passcode verified", token });
        } catch (err: any) {
            return res.status(500).json({ error: "Error verifying passcode." });
        }
    });

    /**
     * Authenticated Admin Portal Middleware
     */
    const authenticateAdmin = (req: any, res: any, next: any) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Missing or invalid authorization header" });
        }

        const token = authHeader.split(" ")[1];
        const secret = process.env.JWT_SECRET || "precision-fallback-secret-key-2026";

        try {
            const decoded = jwt.verify(token, secret) as any;
            if (decoded.role !== "admin") {
                return res.status(403).json({ error: "Access denied." });
            }
            req.admin = decoded;
            next();
        } catch (err) {
            return res.status(401).json({ error: "Session expired or invalid." });
        }
    };

    /** Admin Booking List */
    app.get("/api/admin/bookings", authenticateAdmin, async (req, res) => {
        try {
            const { bookings, isFallback } = await getBookings();
            return res.status(200).json({ bookings, isFallback });
        } catch (err: any) {
            return res.status(500).json({ error: err.message || "Failed to retrieve bookings list." });
        }
    });

    /** Admin Booking Actions */
    app.post("/api/admin/bookings", authenticateAdmin, async (req, res) => {
        try {
            const { action, bookingId, updatedData } = req.body || {};
            if (!action || !bookingId) return res.status(400).json({ error: "Missing parameters" });

            const { bookings, isFallback } = await getBookings();
            const index = bookings.findIndex(b => b.id === bookingId);
            if (index === -1) return res.status(404).json({ error: "Booking not found." });

            if (action === "update-status") {
                bookings[index].status = updatedData.status;
            } else if (action === "reschedule") {
                bookings[index].date = updatedData.date;
                bookings[index].timeSlot = updatedData.timeSlot;
            } else if (action === "delete") {
                bookings.splice(index, 1);
            } else {
                return res.status(400).json({ error: "Invalid action" });
            }

            await saveBookings(bookings);
            return res.status(200).json({ message: "Action successfully applied", bookings, isFallback });
        } catch (err: any) {
            return res.status(500).json({ error: err.message || "Failed to handle admin action." });
        }
    });

    /** Admin Quotes List */
    app.get("/api/admin/quotes", authenticateAdmin, async (req, res) => {
        try {
            const { quotes, isFallback } = await getQuotes();
            return res.status(200).json({ quotes, isFallback });
        } catch (err: any) {
            return res.status(500).json({ error: "Failed to retrieve quotes list." });
        }
    });

    /** Admin Quote Actions */
    app.post("/api/admin/quotes", authenticateAdmin, async (req, res) => {
        try {
            const { action, quoteId, updatedData } = req.body || {};
            if (!action || !quoteId) return res.status(400).json({ error: "Missing parameters" });

            const { quotes, isFallback } = await getQuotes();
            const index = quotes.findIndex(q => q.id === quoteId);
            if (index === -1) return res.status(404).json({ error: "Quote not found." });

            if (action === "update-status") {
                quotes[index].status = updatedData.status;
            } else if (action === "delete") {
                quotes.splice(index, 1);
            } else {
                return res.status(400).json({ error: "Invalid action" });
            }

            await saveQuotes(quotes);
            return res.status(200).json({ message: "Action successfully applied", quotes, isFallback });
        } catch (err: any) {
            return res.status(500).json({ error: "Failed to handle admin action." });
        }
    });

    /**
     * Serve Front-end SPA static assets or hook hot Vite development layer
     */
    if (process.env.NODE_ENV !== "production") {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: "spa",
        });
        app.use(vite.middlewares);

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`[Precision Server] Listening for queries on port ${PORT}`);
        });
    } else {
        const distPath = path.join(process.cwd(), "dist");
        app.use(express.static(distPath));
        app.get("*", (req, res) => {
            res.sendFile(path.join(distPath, "index.html"));
        });
    }
}

// Export for Vercel serverless function
export default app;

startServer();
