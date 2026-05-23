import { Resend } from "resend";
import { getQuotes, saveQuotes, QuoteRequest } from "./db.js";

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
    const { fullName, phone, email, serviceType, message } = req.body || {};

    if (!fullName || !phone || !email || !serviceType) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const adminEmail = process.env.ADMIN_EMAIL || "cesaresmero2@gmail.com";
    const resendApiKey = process.env.RESEND_API_KEY;

    const referenceId = "PRC-Q" + Math.floor(100000 + Math.random() * 900000);

    const newQuote: QuoteRequest = {
      id: referenceId,
      name: fullName,
      phone,
      email,
      service: serviceType,
      message: message || "",
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    const { quotes } = await getQuotes();
    quotes.unshift(newQuote);
    const dbSaved = await saveQuotes(quotes);

    let emailSentSuccessfully = false;

    if (!resendApiKey) {
      console.warn("Missing RESEND_API_KEY. Skipping email.");
    } else {
      try {
        const resend = new Resend(resendApiKey);

        // DEMO MODE: Resend free tier only allows sending to your own verified email.
        // Both admin alert AND customer confirmation go to adminEmail.
        // When you verify a domain, swap the customer confirmation `to` back to `email`.

        // 1. Admin notification
        await resend.emails.send({
          from: "Precision Exterior <onboarding@resend.dev>",
          to: adminEmail,
          subject: `[Quote Request] ${serviceType} — ${fullName}`,
          html: `
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

              <div style="margin-top: 20px; padding: 15px; background-color: #ffffff; border-left: 4px solid #1b3a2d; border-radius: 4px;">
                <h3 style="margin-top: 0; color: #1b3a2d; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Property Scope & Specifications</h3>
                <p style="white-space: pre-wrap; margin-bottom: 0; font-size: 13.5px; line-height: 1.5; color: #334155;">${message || "No custom specifications provided."}</p>
              </div>

              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;">
              <p style="font-size: 10px; color: #94a3b8; text-align: center; margin-bottom: 0;">Precision Exterior Care Ltd • Galway Base Operations Portal</p>
              <p style="font-size: 10px; color: #f59e0b; text-align: center; margin-top: 4px;">⚠️ DEMO MODE — Customer confirmation redirected to admin inbox (Resend free tier)</p>
            </div>
          `,
          replyTo: email
        });

        // 2. Customer confirmation — DEMO: sending to adminEmail instead of `email`
        // TODO: swap `to: adminEmail` → `to: email` once you verify your domain in Resend
        await resend.emails.send({
          from: "Precision Exterior <onboarding@resend.dev>",
          to: adminEmail, // <-- change to `email` after domain verification
          subject: `[DEMO - Customer Copy] Precision Quote Query — ${referenceId}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
              <div style="background-color: #f59e0b; color: #1c1917; padding: 10px; border-radius: 6px; text-align: center; margin-bottom: 12px;">
                <p style="margin: 0; font-size: 11px; font-weight: bold;">⚠️ DEMO MODE — This email would normally go to: ${email}</p>
              </div>

              <div style="background-color: #1b3a2d; color: #f5f0e8; padding: 20px; border-radius: 6px; text-align: center; margin-bottom: 20px;">
                <h1 style="margin: 0; font-size: 22px; font-weight: bold;">We've Received Your Quote Request</h1>
                <p style="margin: 5px 0 0 0; font-size: 12px; font-family: monospace; opacity: 0.9;">Ticket ID: ${referenceId}</p>
              </div>

              <p style="font-size: 15px; color: #334155;">Hello ${fullName},</p>
              <p style="font-size: 15px; color: #334155; line-height: 1.6;">Thank you for requesting an estimate from <strong>Precision Exterior Care</strong>. Our team is reviewing your property specifications to get back to you with an honest, flat-rate digital proposal.</p>

              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin: 20px 0;">
                <h3 style="color: #1b3a2d; margin-top: 0; font-size: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Summary of Your Inquiry</h3>
                <ul style="padding-left: 20px; line-height: 1.6; font-size: 13.5px; color: #475569; margin-bottom: 0;">
                  <li><strong>Service Needed:</strong> ${serviceType}</li>
                  <li><strong>Assigned Reference:</strong> <span style="font-family: monospace; font-weight: bold; background: #f1f5f9; padding: 1px 5px; border-radius: 3px; color: #0f172a;">${referenceId}</span></li>
                  <li><strong>Contact Phone:</strong> ${phone}</li>
                </ul>
              </div>

              <p style="font-size: 14px; color: #475569; line-height: 1.6;">A final quote proposal will land in your inbox within 24 working hours. If we need more info, we'll give you a call.</p>
              <p style="font-size: 14px; color: #475569; line-height: 1.6;">To correct this request, call us at <a href="tel:+353915550190" style="color: #16a34a; text-decoration: none; font-weight: bold;">+353 (91) 555 0190</a> citing your Ticket ID.</p>

              <p style="margin-top: 30px; font-size: 14px; font-weight: bold; color: #1b3a2d;">Best regards,<br><span style="font-weight: normal; color: #475569;">The Precision Crew</span></p>

              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;">
              <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-bottom: 0;">Precision Exterior Care • Galway, Ireland</p>
            </div>
          `
        });

        emailSentSuccessfully = true;
      } catch (err: any) {
        console.error("Resend error in quote endpoint handler:", err);
      }
    }

    console.log(`\n--- [DEV QUOTE EVENT] ---`);
    console.log(`Customer: ${fullName} (${email})`);
    console.log(`Service: ${serviceType}`);
    console.log(`Phone: ${phone}`);
    console.log(`Details: ${message}`);
    console.log(`Reference ID: ${referenceId}`);
    console.log(`Emails Dispatched: ${emailSentSuccessfully ? "Yes" : "No (missing API key)"}`);
    console.log(`-------------------------\n`);

    return res.status(200).json({
      success: true,
      message: "Quote request successfully submitted",
      emailSent: emailSentSuccessfully,
      referenceId
    });

  } catch (error: any) {
    console.error("Quote endpoint error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message || "Failed to process quote request"
    });
  }
}