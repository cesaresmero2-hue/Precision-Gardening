import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { Resend } from "resend";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import {
    getBookings,
    saveBooking,
    saveBookings,
    deleteBooking,
    getQuotes,
    saveQuote,
    saveQuotes,
    deleteQuote
} from "./db";

dotenv.config();

const app = express();
const PORT = 3000;

// Configure Express app
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
        await saveQuote(newQuote);

        const resend = getResendClient();
        const adminEmail = process.env.ADMIN_EMAIL || "cesaresmero2@gmail.com";
        const sadminEmail = process.env.SADMIN_EMAIL;

        if (resend) {
            const isGardening = !serviceType.toLowerCase().includes("wash") && !serviceType.toLowerCase().includes("driveway") && !serviceType.toLowerCase().includes("patio") && !serviceType.toLowerCase().includes("deck") && !serviceType.toLowerCase().includes("siding");
            const brandColor = isGardening ? "#1b3a2d" : "#1e6fa8";
            const accentText = isGardening ? "Gardening & Lawn Care" : "Pressure Washing & Exterior Care";

            const adminEmailHtml = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid ${brandColor}; border-radius: 12px; overflow: hidden; background-color: #fafbf9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="background-color: ${brandColor}; color: #f5f0e8; padding: 25px 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 22px; font-weight: bold; letter-spacing: 0.5px; color: #ffffff;">New Digital Quote Request</h2>
          <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.85; font-family: monospace; color: #ffffff;">Ref ID: ${referenceId}</p>
        </div>
        <div style="padding: 25px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background-color: #f3f5f3;"><td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 13px; color: #64748b; text-transform: uppercase; width: 140px;">Lead Full Name:</td><td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 14.5px; font-weight: bold; color: #1e293b;">${fullName}</td></tr>
            <tr><td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 13px; color: #64748b; text-transform: uppercase;">Phone Number:</td><td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 14.5px;"><a href="tel:${phone}" style="color: #16a34a; font-weight: bold; text-decoration: none;">${phone}</a></td></tr>
            <tr style="background-color: #f3f5f3;"><td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 13px; color: #64748b; text-transform: uppercase;">Email Address:</td><td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 14.5px;"><a href="mailto:${email}" style="color: #1e6fa8; font-weight: bold; text-decoration: none;">${email}</a></td></tr>
            <tr><td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 13px; color: #64748b; text-transform: uppercase;">Service Target:</td><td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 14.5px; font-weight: bold; color: ${brandColor};">${serviceType} (${accentText})</td></tr>
          </table>
          <div style="margin-top: 25px; padding: 20px; background-color: #ffffff; border-left: 4px solid ${brandColor}; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
            <h3 style="margin-top: 0; color: ${brandColor}; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; font-weight: bold;">Property Scope & Specifications</h3>
            <p style="white-space: pre-wrap; margin-bottom: 0; font-size: 14px; line-height: 1.6; color: #334155;">${message || "No custom specifications provided."}</p>
          </div>
        </div>
      </div>
    `;

            const userEmailHtml = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="background-color: ${brandColor}; color: #ffffff; padding: 30px 20px; text-align: center;">
          <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; opacity: 0.8; display: block; margin-bottom: 6px;">Precision Exterior Care</span>
          <h1 style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: -0.5px;">Quote Request Received</h1>
          <div style="margin-top: 15px; display: inline-block; background-color: rgba(255,255,255,0.15); padding: 6px 15px; border-radius: 20px; font-family: monospace; font-size: 13px;">
            Ticket ID: ${referenceId}
          </div>
        </div>
        <div style="padding: 30px 25px; color: #334155; line-height: 1.6;">
          <p style="font-size: 16px; margin-top: 0;">Dear <strong>${fullName}</strong>,</p>
          <p style="font-size: 15px;">Thank you for reaching out to Precision Exterior Care. We have successfully registered your estimate inquiry for <strong>${serviceType}</strong>.</p>
          
          <div style="margin: 25px 0; padding: 20px; background-color: #f8fafc; border-left: 4px solid ${brandColor}; border-radius: 6px;">
            <h3 style="margin-top: 0; margin-bottom: 10px; color: ${brandColor}; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: bold;">Summary of Request</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 5px 0; color: #64748b; width: 130px; font-weight: bold;">Requested Service:</td>
                <td style="padding: 5px 0; color: #1e293b; font-weight: 500;">${serviceType}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #64748b; font-weight: bold;">Date Submitted:</td>
                <td style="padding: 5px 0; color: #1e293b;">${new Date().toLocaleDateString()}</td>
              </tr>
            </table>
            ${message ? `
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed #e2e8f0; font-style: italic; color: #475569; font-size: 13.5px;">
              "${message}"
            </div>` : ''}
          </div>

          <h3 style="color: #1e293b; font-size: 16px; font-weight: bold; margin-top: 30px; margin-bottom: 10px;">What Happens Next?</h3>
          <ol style="margin: 0; padding-left: 20px; font-size: 14.5px; color: #475569; line-height: 1.7;">
            <li style="margin-bottom: 8px;"><strong>Horticultural/Technical Review</strong>: Our project specialists will review your property specifications.</li>
            <li style="margin-bottom: 8px;"><strong>Pragmatic Proposal Delivery</strong>: We will generate and email a detailed price proposal within 24 business hours.</li>
            <li><strong>Scheduling</strong>: Once you approve the quote, we will immediately reserve a crew slot that suits your schedule.</li>
          </ol>

          <p style="font-size: 15px; margin-top: 30px;">If you have any urgent details or photos of the property to share, please reply directly to this email.</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
            <p style="margin: 0 0 5px 0;">Precision Exterior Care &bull; Meticulous Cultivation & Cleaning</p>
            <p style="margin: 0;">This is an automated confirmation of receipt.</p>
          </div>
        </div>
      </div>
    `;

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
        await saveBooking(newBooking);

        const resend = getResendClient();
        const adminEmail = process.env.ADMIN_EMAIL || "cesaresmero2@gmail.com";
        const sadminEmail = process.env.SADMIN_EMAIL;

        if (resend) {
            const isGardening = !serviceType.toLowerCase().includes("wash") && !serviceType.toLowerCase().includes("driveway") && !serviceType.toLowerCase().includes("patio") && !serviceType.toLowerCase().includes("deck") && !serviceType.toLowerCase().includes("siding");
            const brandColor = isGardening ? "#1b3a2d" : "#1e6fa8";
            const accentText = isGardening ? "Gardening & Lawn Care" : "Pressure Washing & Restorative Washing";

            const adminEmailHtml = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid ${brandColor}; border-radius: 12px; overflow: hidden; background-color: #fafbf9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="background-color: ${brandColor}; color: #f5f0e8; padding: 25px 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 22px; font-weight: bold; letter-spacing: 0.5px; color: #ffffff;">New Service Booking Request</h2>
          <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.85; font-family: monospace; color: #ffffff;">Ref ID: ${referenceId}</p>
        </div>
        <div style="padding: 25px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background-color: #f3f5f3;"><td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 13px; color: #64748b; text-transform: uppercase; width: 140px;">Customer Name:</td><td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 14.5px; font-weight: bold; color: #1e293b;">${fullName}</td></tr>
            <tr><td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 13px; color: #64748b; text-transform: uppercase;">Phone Number:</td><td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 14.5px;"><a href="tel:${phone}" style="color: #16a34a; font-weight: bold; text-decoration: none;">${phone}</a></td></tr>
            <tr style="background-color: #f3f5f3;"><td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 13px; color: #64748b; text-transform: uppercase;">Email Address:</td><td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 14.5px;"><a href="mailto:${email}" style="color: #1e6fa8; font-weight: bold; text-decoration: none;">${email}</a></td></tr>
            <tr><td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 13px; color: #64748b; text-transform: uppercase;">Service Type:</td><td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 14.5px; font-weight: bold; color: ${brandColor};">${serviceType} (${accentText})</td></tr>
            <tr style="background-color: #f3f5f3;"><td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 13px; color: #64748b; text-transform: uppercase;">Scheduled Date:</td><td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 14.5px; font-weight: bold; color: #1e293b;">${date}</td></tr>
            <tr><td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 13px; color: #64748b; text-transform: uppercase;">Time Slot:</td><td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 14.5px; font-weight: bold; color: #1e293b;">${timeSlot}</td></tr>
          </table>
          ${message ? `
          <div style="margin-top: 25px; padding: 20px; background-color: #ffffff; border-left: 4px solid ${brandColor}; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
            <h3 style="margin-top: 0; color: ${brandColor}; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; font-weight: bold;">Additional Notes</h3>
            <p style="white-space: pre-wrap; margin-bottom: 0; font-size: 14px; line-height: 1.6; color: #334155;">${message}</p>
          </div>` : ''}
        </div>
      </div>
    `;

            const userEmailHtml = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="background-color: ${brandColor}; color: #ffffff; padding: 30px 20px; text-align: center;">
          <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; opacity: 0.8; display: block; margin-bottom: 6px;">Precision Exterior Care</span>
          <h1 style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: -0.5px;">Crew Booking Requested</h1>
          <div style="margin-top: 15px; display: inline-block; background-color: rgba(255,255,255,0.15); padding: 6px 15px; border-radius: 20px; font-family: monospace; font-size: 13px;">
            Booking Ticket: ${referenceId}
          </div>
        </div>
        <div style="padding: 30px 25px; color: #334155; line-height: 1.6;">
          <p style="font-size: 16px; margin-top: 0;">Dear <strong>${fullName}</strong>,</p>
          <p style="font-size: 15px;">Your service crew booking slot has been received! Our scheduling department is currently reviewing dispatch availability. Below are your request details:</p>
          
          <div style="margin: 25px 0; padding: 25px; background-color: #fafbfb; border: 1px solid #e2e8f0; border-radius: 8px; position: relative;">
            <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background-color: ${brandColor}; border-top-left-radius: 8px; border-top-right-radius: 8px;"></div>
            <h3 style="margin-top: 0; margin-bottom: 15px; color: ${brandColor}; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: bold;">Appointment Specifications</h3>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px 0; color: #64748b; font-weight: bold; width: 140px;">Service Discipline:</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: bold;">${serviceType}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Target Date:</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${date}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Preferred Time Slot:</td>
                <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${timeSlot}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Status:</td>
                <td style="padding: 8px 0; color: #eab308; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px;">Pending Approval</td>
              </tr>
            </table>
          </div>

          <h3 style="color: #1e293b; font-size: 16px; font-weight: bold; margin-top: 30px; margin-bottom: 10px;">What Happens Next?</h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 14.5px; color: #475569; line-height: 1.7;">
            <li style="margin-bottom: 8px;"><strong>Crew Schedule Matching</strong>: We verify that our dispatch team is fully equipped and available for your selected slot.</li>
            <li style="margin-bottom: 8px;"><strong>Confirmation & Arrival Window</strong>: We will send you a final confirmation email containing your precise arrival window.</li>
            <li><strong>Preparations</strong>: For power washing, please ensure outdoor water spigots are accessible. For garden care, please clear any toys or pet items from lawn areas.</li>
          </ul>

          <p style="font-size: 15px; margin-top: 30px;">Need to reschedule or add instructions? Simply reply to this email, and our coordinator will update your booking file instantly.</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
            <p style="margin: 0 0 5px 0;">Precision Exterior Care &bull; Meticulous Cultivation & Cleaning</p>
            <p style="margin: 0;">This is an automated request receipt.</p>
          </div>
        </div>
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

        if (action === "delete") {
            await deleteBooking(bookingId);
            const { bookings, isFallback } = await getBookings();
            return res.status(200).json({ message: "Booking deleted successfully", bookings, isFallback });
        }

        const { bookings, isFallback } = await getBookings();
        const index = bookings.findIndex(b => b.id === bookingId);
        if (index === -1) return res.status(404).json({ error: "Booking not found." });

        if (action === "update-status") {
            bookings[index].status = updatedData.status;
            await saveBooking(bookings[index]);
        } else if (action === "reschedule") {
            bookings[index].date = updatedData.date;
            bookings[index].timeSlot = updatedData.timeSlot;
            await saveBooking(bookings[index]);
        } else {
            return res.status(400).json({ error: "Invalid action" });
        }

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

        if (action === "delete") {
            await deleteQuote(quoteId);
            const { quotes, isFallback } = await getQuotes();
            return res.status(200).json({ message: "Quote deleted successfully", quotes, isFallback });
        }

        const { quotes, isFallback } = await getQuotes();
        const index = quotes.findIndex(q => q.id === quoteId);
        if (index === -1) return res.status(404).json({ error: "Quote not found." });

        if (action === "update-status") {
            quotes[index].status = updatedData.status;
            await saveQuote(quotes[index]);
        } else {
            return res.status(400).json({ error: "Invalid action" });
        }

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
    // In production/Vercel, serve static files from dist directory
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath, { index: false }));
    
    // SPA fallback - serve index.html for all non-API routes
    app.get("*", (req, res, next) => {
        // Don't intercept API routes
        if (req.path.startsWith("/api")) {
            return next();
        }
        res.sendFile(path.join(distPath, "index.html"));
    });
}

// Export for Vercel serverless function
export default app;
