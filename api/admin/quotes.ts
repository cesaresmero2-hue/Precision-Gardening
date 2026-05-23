import type { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";
import { getQuotes, saveQuotes } from "../db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Unauthorized" });
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

        const { quotes, isFallback } = await getQuotes();

        if (req.method === "GET") {
            return res.status(200).json({ quotes, isFallback });
        }

        if (req.method === "POST") {
            const { action, quoteId, updatedData } = req.body;
            let targetQuote = quotes.find(q => q.id === quoteId);

            if (!targetQuote) {
                return res.status(404).json({ error: "Quote not found" });
            }

            if (action === "update-status") {
                const { status } = updatedData;
                if (!status) return res.status(400).json({ error: "Status value required" });
                targetQuote.status = status;
                await saveQuotes(quotes);
                return res.status(200).json({ status: "success", quotes, isFallback });
            }

            if (action === "delete") {
                const remainingQuotes = quotes.filter(q => q.id !== quoteId);
                await saveQuotes(remainingQuotes);
                return res.status(200).json({ status: "success", quotes: remainingQuotes, isFallback });
            }

            return res.status(400).json({ error: "Invalid action" });
        }

        return res.status(405).json({ error: "Method not allowed" });
    } catch (error: any) {
        console.error("Quotes API error:", error);
        return res.status(500).json({ error: "Failed to process request." });
    }
}
