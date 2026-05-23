import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { Resend } from "resend";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { getBookings, saveBookings, getFirestoreDb, Booking } from "./api/db";

dotenv.config();

async function startServer() {
    const app = express();
    const PORT = 3000;

    // Middleware for parsing JSON requests
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
            const { fullName, phone, email, serviceType, message } = req.body;

            if (!fullName || !phone || !email) {
                return res.status(400).json({ error: "Missing required contact details (name, phone, or email)" });
            }

            console.log(`[Quote Request] Received from ${fullName} (${email}) for service "${serviceType}"`);

            // Generate a formal reference ID for tracking
            const referenceId = "PRC-Q" + Math.floor(100000 + Math.random() * 900000);

            // Persist quote to Firestore in the background if database is configured
            const db = await getFirestoreDb();
            if (db) {
                try {
                    const { doc, setDoc } = await import("firebase/firestore");
                    await setDoc(doc(db, "quotes", referenceId), {
                        id: referenceId,
                        name: fullName,
                        phone,
                        email,
                        service: serviceType,
                        message: message || "",
                        createdAt: new Date().toISOString()
                    });
                    console.log(`[Firestore] Saved quote request ${referenceId}`);
                } catch (dbErr) {
                    console.error("Failed to write Quote record to Firestore:", dbErr);
                }
            }

            const resend = getResendClient();
            const adminEmail = process.env.ADMIN_EMAIL || "quotes@precisionexterior.com";

            if (resend) {
                // Rich HTML email template for the dispatch manager/admin
                const adminEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #1b3a2d; border-radius: 8px; background-color: #fafbf9;">
            <div style="background-color: #1b3a2d; color: #f5f0e8; padding: 15px; border-radius: 6px; text-align: center;">
              <h2 style="margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 0.5px;">New Digital Quote Request</h2>
              <p style="margin: 5px 0 0 0; font-size: 11px; opacity: 0.85; font-family: monospace;">Ref ID: ${referenceId}</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <tr style="background-color: #f3f5f3;">
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 13px; color: #64748b; text-transform: uppercase;">Lead Full Name:</td>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: bold; color: #1e293b;">${fullName}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 13px; color: #64748b; text-transform: uppercase;">Phone Number:</td>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px;"><a href="tel:${phone}" style="color: #16a34a; font-weight: bold; text-decoration: none;">${phone}</a></td>
              </tr>
              <tr style="background-color: #f3f5f3;">
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 13px; color: #64748b; text-transform: uppercase;">Email Address:</td>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px;"><a href="mailto:${email}" style="color: #1e6fa8; font-weight: bold; text-decoration: none;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 13px; color: #64748b; text-transform: uppercase;">Service Target:</td>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: bold; color: #1e6fa8;">${serviceType}</td>
              </tr>
            </table>
            
            <div style="margin-top: 20px; padding: 15px; background-color: #ffffff; border-left: 4px solid #1b3a2d; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <h3 style="margin-top: 0; color: #1b3a2d; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Property Scope & Specifications</h3>
              <p style="white-space: pre-wrap; margin-bottom: 0; font-size: 13.5px; line-height: 1.5; color: #334155;">${message || "No custom specifications provided."}</p>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;">
            <p style="font-size: 10px; color: #94a3b8; text-align: center; margin-bottom: 0;">Precision Exterior Care Ltd • Galway Base Operations Portal</p>
          </div>
        `;

                // Confirmation email to the Customer
                const userEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
            <div style="background-color: #1b3a2d; color: #f5f0e8; padding: 20px; border-radius: 6px; text-align: center; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 22px; font-weight: bold;">We've Received Your Quote Request</h1>
              <p style="margin: 5px 0 0 0; font-size: 12px; font-family: monospace; opacity: 0.9;">Ticket ID: ${referenceId}</p>
            </div>
            
            <p style="font-size: 15px; color: #334155;">Hello ${fullName},</p>
            <p style="font-size: 15px; color: #334155; line-height: 1.6;">Thank you for requesting an estimate from <strong>Precision Exterior Care</strong>. We're on it! Our team is reviewing the property specifications you shared to get back to you with an honest, flat-rate digital proposal.</p>
            
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin: 20px 0;">
              <h3 style="color: #1b3a2d; margin-top: 0; font-size: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Summary of Your Inquiry</h3>
              <ul style="padding-left: 20px; line-height: 1.6; font-size: 13.5px; color: #475569; margin-bottom: 0;">
                <li><strong>Service Needed:</strong> ${serviceType}</li>
                <li><strong>Assigned Reference:</strong> <span style="font-family: monospace; font-weight: bold; background: #f1f5f9; padding: 1px 5px; border-radius: 3px; color: #0f172a;">${referenceId}</span></li>
                <li><strong>Contact Phone:</strong> ${phone}</li>
              </ul>
            </div>

            <p style="font-size: 14px; color: #475569; line-height: 1.6;"><strong>What's the process?</strong><br>
            We consult local zoning maps, historical data of your area, and visual coordinates. If we have everything we need, a final quote proposal will land in your inbox within 24 working hours. If we need a quick look, we'll give you a call.</p>

            <p style="font-size: 14px; color: #475569; line-height: 1.6;">If you need to make corrections to this request, call us at <a href="tel:+353915550190" style="color: #16a34a; text-decoration: none; font-weight: bold;">+353 (91) 555 0190</a> citing your Ticket ID.</p>

            <p style="margin-top: 30px; font-size: 14px; font-weight: bold; color: #1b3a2d;">Best regards,<br><span style="font-weight: normal; color: #475569;">The Precision Crew</span></p>
            
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;">
            <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-bottom: 0;">Precision Exterior Care • Galway, Ireland • quotes@precisionexterior.com</p>
          </div>
        `;

                try {
                    // Send to Dispatch Admin Email (Vercel ADMIN_EMAIL)
                    await resend.emails.send({
                        from: "Precision Exterior <onboarding@resend.dev>",
                        to: adminEmail,
                        subject: `[Quote Form] ${serviceType} - ${fullName}`,
                        html: adminEmailHtml,
                        replyTo: email
                    });

                    // Confirm back to the Customer
                    try {
                        await resend.emails.send({
                            from: "Precision Exterior <onboarding@resend.dev>",
                            to: email,
                            subject: `Precision Quote Query - ${referenceId}`,
                            html: userEmailHtml
                        });
                    } catch (error) {
                        console.error("User confirmation email could not be sent (Resend sandbox constraint):", error);
                    }
                } catch (mailError: any) {
                    console.error("Failed to execute email triggers. Backend proceeded with response fallback. Details:", mailError?.message || mailError);
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
            const { fullName, phone, email, serviceType, date, timeSlot, message } = req.body;

            if (!fullName || !phone || !email || !date) {
                return res.status(400).json({ error: "Missing required booking details (name, phone, email, or date)" });
            }

            console.log(`[Booking Request] Received from ${fullName} (${email}) for service "${serviceType}" on ${date} (${timeSlot})`);

            // Generate a formal booking reference ID
            const referenceId = "PRC-B" + Math.floor(100000 + Math.random() * 900000);

            const newBooking: Booking = {
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

            // Save the booking into the list persistence (Firestore if configured, or Fallback options)
            const { bookings } = await getBookings();
            bookings.unshift(newBooking);
            const dbSaved = await saveBookings(bookings);

            const resend = getResendClient();
            const adminEmail = process.env.ADMIN_EMAIL || "bookings@precisionexterior.com";

            if (resend) {
                // Rich HTML email template for the dispatch manager/admin
                const adminEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #1e6fa8; border-radius: 8px; background-color: #fafbfc;">
            <div style="background-color: #1e6fa8; color: #ffffff; padding: 15px; border-radius: 6px; text-align: center;">
              <h2 style="margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 0.5px;">New Booking Request Form</h2>
              <p style="margin: 5px 0 0 0; font-size: 11px; opacity: 0.9; font-family: monospace;">Booking Ref: ${referenceId}</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <tr style="background-color: #f1f7fa;">
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 13px; color: #64748b; text-transform: uppercase; width: 170px;">Client Full Name:</td>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: bold; color: #0f172a;">${fullName}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 13px; color: #64748b; text-transform: uppercase;">Direct Line:</td>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px;"><a href="tel:${phone}" style="color: #16a34a; font-weight: bold; text-decoration: none;">${phone}</a></td>
              </tr>
              <tr style="background-color: #f1f7fa;">
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 13px; color: #64748b; text-transform: uppercase;">User Email:</td>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px;"><a href="mailto:${email}" style="color: #1e6fa8; font-weight: bold; text-decoration: none;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 13px; color: #64748b; text-transform: uppercase;">Service Target:</td>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: bold; color: #1b3a2d;">${serviceType}</td>
              </tr>
              <tr style="background-color: #f0fdf4;">
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 13px; color: #16a34a; text-transform: uppercase;">Booking Date:</td>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: bold; color: #16a34a;">${date}</td>
              </tr>
              <tr style="background-color: #f0fdf4;">
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 13px; color: #16a34a; text-transform: uppercase;">Crew Slot Time:</td>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: bold; color: #16a34a;">${timeSlot}</td>
              </tr>
            </table>
            
            <div style="margin-top: 20px; padding: 15px; background-color: #ffffff; border-left: 4px solid #1e6fa8; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <h3 style="margin-top: 0; color: #1e6fa8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Crew Instructions & Notes</h3>
              <p style="white-space: pre-wrap; margin-bottom: 0; font-size: 13.5px; line-height: 1.5; color: #334155;">${message || "No specific client instructions provided."}</p>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;">
            <p style="font-size: 10px; color: #94a3b8; text-align: center; margin-bottom: 0;">Precision Exterior Care Ltd • Galway Crew Dispatch Admin Support Panel</p>
          </div>
        `;

                // Booking confirmation to the Customer
                const userEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
            <div style="background-color: #1e6fa8; color: #ffffff; padding: 20px; border-radius: 6px; text-align: center; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 22px; font-weight: bold;">Crew Booking Request Received!</h1>
              <p style="margin: 5px 0 0 0; font-size: 12px; font-family: monospace; opacity: 0.9;">Reference Code: ${referenceId}</p>
            </div>
            
            <p style="font-size: 15px; color: #334155;">Hi ${fullName},</p>
            <p style="font-size: 15px; color: #334155; line-height: 1.6;">Thank you for scheduling with <strong>Precision Exterior Care</strong>. We've received your crew booking request and have held a pending slot for you or your property.</p>
            
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin: 20px 0;">
              <h3 style="color: #1e6fa8; margin-top: 0; font-size: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Pending Appointment Details</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 13.5px; color: #475569;">
                <tr>
                  <td style="padding: 5px 0; font-weight: bold; width: 130px;">Service Target:</td>
                  <td style="padding: 5px 0; color: #0f172a;">${serviceType}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; font-weight: bold;">Requested Date:</td>
                  <td style="padding: 5px 0; color: #1e6fa8; font-weight: bold;">${date}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; font-weight: bold;">Target Window:</td>
                  <td style="padding: 5px 0; color: #1e6fa8; font-weight: bold;">${timeSlot}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; font-weight: bold;">Booking Code:</td>
                  <td style="padding: 5px 0; font-family: monospace; font-weight: bold; color: #0f172a;">${referenceId}</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 14px; color: #475569; line-height: 1.6;"><strong>Next Steps:</strong><br>
            Our Galway dispatch coordinator is adjusting current route densities. We will approve your slot and send a official confirmation email with your team's estimated arrival window within 12 working hours.</p>

            <p style="font-size: 14px; color: #475569; line-height: 1.6;">If you have any active changes, gates to open, or pets to secure, please call us at <a href="tel:+353915550190" style="color: #1e6fa8; text-decoration: none; font-weight: bold;">+353 (91) 555 0190</a> invoking Booking Code <strong>${referenceId}</strong>.</p>

            <p style="margin-top: 30px; font-size: 14px; font-weight: bold; color: #1e6fa8;">Warm regards,<br><span style="font-weight: normal; color: #475569;">The Precision Editorial Coordinator</span></p>
            
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;">
            <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-bottom: 0;">Precision Exterior Care • Galway, Ireland • bookings@precisionexterior.com</p>
          </div>
        `;

                try {
                    // Send to Dispatch Admin Email (Vercel ADMIN_EMAIL)
                    await resend.emails.send({
                        from: "Precision Bookings <onboarding@resend.dev>",
                        to: adminEmail,
                        subject: `[Booking Form] ${serviceType} on ${date} - ${fullName}`,
                        html: adminEmailHtml,
                        replyTo: email
                    });

                    // Confirm back to the Customer
                    try {
                        await resend.emails.send({
                            from: "Precision Bookings <onboarding@resend.dev>",
                            to: email,
                            subject: `Precision Scheduling - ${referenceId}`,
                            html: userEmailHtml
                        });
                    } catch (error) {
                        console.error("User booking confirmation email could not be sent (Resend sandbox constraint):", error);
                    }
                } catch (mailError: any) {
                    console.error("Failed to execute booking email triggers. Backend proceeded with response fallback. Details:", mailError?.message || mailError);
                }
            }

            return res.status(200).json({ status: "success", referenceId });
        } catch (err: any) {
            console.error("Booking endpoint failure:", err);
            return res.status(500).json({ error: err.message || "Failure registering crew booking." });
        }
    });

    /**
     * Admin Passcode OTP Request API Endpoint
     */
    app.post("/api/auth/send-otp", async (req, res) => {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ error: "Email is required" });
            }

            const adminEmail = process.env.ADMIN_EMAIL || "cesaresmero2@gmail.com";

            if (email.toLowerCase().trim() !== adminEmail.toLowerCase().trim()) {
                return res.status(401).json({ error: "Access denied: Unauthorized email address" });
            }

            // Generate 6-digit OTP passcode
            const otpValue = Math.floor(100000 + Math.random() * 900000).toString();

            // 5 minute expiry slot
            const expirySlot = Date.now() + 5 * 60 * 1000;

            const secret = process.env.JWT_SECRET || "precision-fallback-secret-key-2026";
            const signature = crypto
                .createHmac("sha256", secret)
                .update(`${otpValue}:${expirySlot}`)
                .digest("hex");

            const resend = getResendClient();

            if (resend) {
                try {
                    await resend.emails.send({
                        from: "Precision Security <onboarding@resend.dev>",
                        to: adminEmail,
                        subject: "Your Precision Admin Portal OTP",
                        html: `
              <div style="font-family: sans-serif; padding: 24px; max-width: 480px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px;">
                <h2 style="font-size: 20px; font-weight: bold; color: #1b3a2d; margin-bottom: 12px;">Precision Gardening & Power Washing</h2>
                <p style="font-size: 14px; color: #4b5563; line-height: 1.5; margin-bottom: 20px;">Use the following passcode to access the Admin Management Dashboard. This passcode expires in 5 minutes.</p>
                <div style="background-color: #f3f4f6; text-align: center; padding: 16px; border-radius: 8px; margin: 20px 0;">
                  <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #111827;">${otpValue}</span>
                </div>
                <p style="font-size: 11px; color: #9ca3af; margin-top: 24px;">If you did not request this login code, you can safely ignore this email.</p>
              </div>
            `
                    });
                } catch (err: any) {
                    console.error("Failed to send OTP email via Resend:", err);
                }
            }

            console.log(`\n-------------------------------------`);
            console.log(`[DEV OTP LOG] Email: ${adminEmail}`);
            console.log(`Passcode: ${otpValue}`);
            console.log(`-------------------------------------\n`);

            return res.status(200).json({
                message: "OTP sent successfully",
                signature,
                expiry: expirySlot
            });
        } catch (err: any) {
            console.error("Failed to send OTP:", err);
            return res.status(500).json({ error: "Failed to dispatch login passcode." });
        }
    });

    /**
     * Admin OTP Verification Endpoint
     */
    app.post("/api/auth/verify-otp", async (req, res) => {
        try {
            const { code, signature, expiry } = req.body;
            if (!code || !signature || !expiry) {
                return res.status(400).json({ error: "Missing verification parameters" });
            }

            if (Date.now() > Number(expiry)) {
                return res.status(401).json({ error: "Passcode has expired. Please request a new code." });
            }

            const secret = process.env.JWT_SECRET || "precision-fallback-secret-key-2026";
            const expectedSignature = crypto
                .createHmac("sha256", secret)
                .update(`${code.trim()}:${expiry}`)
                .digest("hex");

            if (signature !== expectedSignature) {
                return res.status(401).json({ error: "Invalid passcode. Please try again." });
            }

            // Generate authorization JWT
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
        } catch (err: any) {
            console.error("Verify OTP error:", err);
            return res.status(500).json({ error: "Error verifying passcode." });
        }
    });

    /**
     * Authenticated Admin Bookings Portal Endpoints
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
                return res.status(403).json({ error: "Access denied. Admin privileges required." });
            }
            req.admin = decoded;
            next();
        } catch (err) {
            return res.status(401).json({ error: "Session expired or invalid. Please log in again." });
        }
    };

    // GET matches list of bookings
    app.get("/api/admin/bookings", authenticateAdmin, async (req, res) => {
        try {
            const { bookings, isFallback } = await getBookings();
            return res.status(200).json({ bookings, isFallback });
        } catch (err: any) {
            return res.status(500).json({ error: err.message || "Failed to retrieve bookings list." });
        }
    });

    // POST edits / takes actions on individual bookings
    app.post("/api/admin/bookings", authenticateAdmin, async (req, res) => {
        try {
            const { action, bookingId, updatedData } = req.body;
            if (!action || !bookingId) {
                return res.status(400).json({ error: "Missing required booking update parameters" });
            }

            const { bookings, isFallback } = await getBookings();
            const index = bookings.findIndex(b => b.id === bookingId);
            if (index === -1) {
                return res.status(404).json({ error: "Booking reference code not found." });
            }

            if (action === "update-status") {
                const { status } = updatedData;
                if (!status) return res.status(400).json({ error: "Status value required" });
                bookings[index].status = status;
            } else if (action === "reschedule") {
                const { date, timeSlot } = updatedData;
                if (!date || !timeSlot) return res.status(400).json({ error: "Date and time window required" });
                bookings[index].date = date;
                bookings[index].timeSlot = timeSlot;
            } else if (action === "delete") {
                bookings.splice(index, 1);
            } else {
                return res.status(400).json({ error: "Invalid administrative action" });
            }

            await saveBookings(bookings);

            return res.status(200).json({
                message: "Action successfully applied",
                bookings,
                isFallback
            });
        } catch (err: any) {
            console.error("Admin action failed:", err);
            return res.status(500).json({ error: err.message || "Failed to handle admin update action." });
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
    } else {
        // Serving compiled static files in production container
        const distPath = path.join(process.cwd(), "dist");
        app.use(express.static(distPath));
        app.get("*", (req, res) => {
            res.sendFile(path.join(distPath, "index.html"));
        });
    }

    // Bind to 0.0.0.0 for Cloud Run ingress parsing
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`[Precision Server] Listening for queries on port ${PORT}`);
    });
}

startServer();
