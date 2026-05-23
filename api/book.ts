import { Resend } from "resend";
import { getBookings, saveBookings, Booking } from "./db";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { fullName, phone, email, serviceType, date, timeSlot, message } = req.body;

    if (!fullName || !phone || !email || !serviceType || !date || !timeSlot) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const referenceId = "PRC-" + Math.floor(100000 + Math.random() * 900000);

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

    const { bookings } = await getBookings();
    bookings.unshift(newBooking);
    const dbSaved = await saveBookings(bookings);

    const adminEmail = process.env.ADMIN_EMAIL || "cesaresmero2@gmail.com";
    const resendApiKey = process.env.RESEND_API_KEY;
    const siteUrl = process.env.SITE_URL || "https://precisionexterior.com";

    let emailSentSuccessfully = false;

    if (!resendApiKey) {
      console.warn("Skipping email: RESEND_API_KEY missing.");
    } else {
      try {
        const resend = new Resend(resendApiKey);

        // DEMO MODE: Resend free tier only allows sending to your own verified email.
        // Both admin alert AND customer confirmation go to adminEmail.
        // TODO: swap customer confirmation `to: adminEmail` → `to: email` after domain verification.

        // 1. Admin booking alert
        await resend.emails.send({
          from: "Precision Bookings <onboarding@resend.dev>",
          to: adminEmail,
          subject: `📅 New Booking: ${referenceId} — ${fullName}`,
          html: `
          <div style="font-family: sans-serif; padding: 24px; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
            <div style="background-color: #1b3a2d; padding: 16px 24px; border-radius: 8px 8px 0 0; margin: -24px -24px 24px -24px;">
              <h2 style="font-size: 18px; font-weight: bold; color: #ffffff; margin: 0;">📅 New Booking Request</h2>
              <p style="font-size: 13px; color: #86efac; margin: 4px 0 0 0;">A customer has scheduled a slot — review and approve below.</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 10px 0; font-weight: bold; color: #6b7280; width: 150px;">Booking ID:</td>
                <td style="padding: 10px 0; color: #111827; font-family: monospace; font-weight: bold; font-size: 15px;">${referenceId}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 10px 0; font-weight: bold; color: #6b7280;">Customer:</td>
                <td style="padding: 10px 0; color: #111827;">${fullName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 10px 0; font-weight: bold; color: #6b7280;">Phone:</td>
                <td style="padding: 10px 0; color: #111827;">${phone}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 10px 0; font-weight: bold; color: #6b7280;">Email:</td>
                <td style="padding: 10px 0; color: #111827;"><a href="mailto:${email}" style="color: #1e6fa8;">${email}</a></td>
              </tr>
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 10px 0; font-weight: bold; color: #6b7280;">Service:</td>
                <td style="padding: 10px 0; color: #1b3a2d; font-weight: bold;">${serviceType}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 10px 0; font-weight: bold; color: #6b7280;">Date:</td>
                <td style="padding: 10px 0; color: #111827; font-weight: bold;">${date}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 10px 0; font-weight: bold; color: #6b7280;">Time Slot:</td>
                <td style="padding: 10px 0; color: #111827; font-weight: bold;">${timeSlot}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #6b7280; vertical-align: top;">Notes:</td>
                <td style="padding: 10px 0; color: #374151; line-height: 1.6; white-space: pre-wrap;">${message || "No additional notes."}</td>
              </tr>
            </table>

            <div style="text-align: center; margin-top: 8px;">
              <a href="${siteUrl}/#admin"
                style="display: inline-block; background-color: #1b3a2d; color: #ffffff; font-size: 14px; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 8px; letter-spacing: 0.5px;">
                🔐 Open Admin Dashboard
              </a>
            </div>
          </div>
        `,
        });

        // 2. Customer confirmation — DEMO: sending to adminEmail instead of `email`
        // TODO: swap `to: adminEmail` → `to: email` once you verify your domain in Resend
        await resend.emails.send({
          from: "Precision Bookings <onboarding@resend.dev>",
          to: adminEmail, // <-- change to `email` after domain verification
          subject: `[DEMO - Customer Copy] 📅 Booking Request: ${referenceId}`,
          html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
            <div style="background-color: #f59e0b; color: #1c1917; padding: 10px; border-radius: 6px; text-align: center; margin-bottom: 12px;">
              <p style="margin: 0; font-size: 11px; font-weight: bold;">⚠️ DEMO MODE — This email would normally go to: ${email}</p>
            </div>

            <div style="background-color: #1e6fa8; color: #ffffff; padding: 20px; border-radius: 6px; text-align: center; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 22px; font-weight: bold;">Crew Booking Request Received!</h1>
              <p style="margin: 5px 0 0 0; font-size: 12px; font-family: monospace; opacity: 0.9;">Reference Code: ${referenceId}</p>
            </div>

            <p style="font-size: 15px; color: #334155;">Hi ${fullName},</p>
            <p style="font-size: 15px; color: #334155; line-height: 1.6;">Thank you for scheduling with <strong>Precision Exterior Care</strong>. We have received your booking request and have held a pending slot for you.</p>

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
              </table>
            </div>

            <p style="font-size: 14px; color: #475569; line-height: 1.6;">We will approve your slot and send an official confirmation within 12 working hours.</p>
            <p style="font-size: 14px; color: #475569; line-height: 1.6;">For changes, call <a href="tel:+353915550190" style="color: #1e6fa8; text-decoration: none; font-weight: bold;">+353 (91) 555 0190</a> with Booking Code <strong>${referenceId}</strong>.</p>

            <p style="margin-top: 30px; font-size: 14px; font-weight: bold; color: #1c1917;">Warm regards,<br><span style="font-weight: normal; color: #475569;">The Precision Care Dispatcher</span></p>
          </div>
        `
        });

        emailSentSuccessfully = true;

      } catch (err) {
        console.error("Resend error in book handler:", err);
        // Don't return 500 — booking was already saved to DB. Email failure ≠ booking failure.
      }
    }

    console.log(`\n--- [BOOKING SUBMITTED] ---`);
    console.log(`Reference: ${referenceId}`);
    console.log(`Customer:  ${fullName} (${email})`);
    console.log(`Schedule:  ${date} @ ${timeSlot}`);
    console.log(`DB Saved:  ${dbSaved ? "Yes (KV)" : "Yes (In-memory fallback)"}`);
    console.log(`Emails Dispatched: ${emailSentSuccessfully ? "Yes" : "No"}`);
    console.log(`---------------------------\n`);

    return res.status(200).json({
      success: true,
      referenceId,
      dbSaved,
      emailSent: emailSentSuccessfully
    });
  } catch (err: any) {
    console.error("Booking handler error:", err);
    return res.status(500).json({ error: "Failed to process booking" });
  }
}