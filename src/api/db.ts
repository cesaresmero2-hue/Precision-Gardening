import fs from "fs/promises";
import path from "path";

// In-memory fallback if file system is read-only
let memoryQuotes: QuoteRequest[] = [];
let memoryBookings: Booking[] = [];

// Interfaces
export interface QuoteRequest {
    id: string;
    name: string;
    phone: string;
    email: string;
    service: string;
    message: string;
    status?: "Pending" | "Reviewed" | "Archived";
    createdAt: string;
}

export interface Booking {
    id: string;
    name: string;
    phone: string;
    email: string;
    service: string;
    date: string;
    timeSlot: string;
    message?: string;
    status: "Pending" | "Approved" | "Completed" | "Cancelled";
    createdAt: string;
}

const DB_DIR = path.join(process.cwd(), "data");
const QUOTES_FILE = path.join(DB_DIR, "quotes.json");
const BOOKINGS_FILE = path.join(DB_DIR, "bookings.json");

// Ensure data directory exists
async function ensureDb() {
    try {
        await fs.mkdir(DB_DIR, { recursive: true });
        try {
            await fs.access(QUOTES_FILE);
        } catch {
            await fs.writeFile(QUOTES_FILE, JSON.stringify([]));
        }
        try {
            await fs.access(BOOKINGS_FILE);
        } catch {
            await fs.writeFile(BOOKINGS_FILE, JSON.stringify([]));
        }
    } catch (err) {
        console.warn("Could not ensure DB directory/files. Using in-memory fallback.");
    }
}

export async function getQuotes(): Promise<{ quotes: QuoteRequest[]; isFallback: boolean }> {
    try {
        await ensureDb();
        const data = await fs.readFile(QUOTES_FILE, "utf-8");
        return { quotes: JSON.parse(data), isFallback: false };
    } catch (err) {
        return { quotes: memoryQuotes, isFallback: true };
    }
}

export async function saveQuotes(quotes: QuoteRequest[]): Promise<boolean> {
    try {
        memoryQuotes = quotes;
        await ensureDb();
        await fs.writeFile(QUOTES_FILE, JSON.stringify(quotes, null, 2));
        return true;
    } catch (err) {
        return false;
    }
}

export async function getBookings(): Promise<{ bookings: Booking[]; isFallback: boolean }> {
    try {
        await ensureDb();
        const data = await fs.readFile(BOOKINGS_FILE, "utf-8");
        return { bookings: JSON.parse(data), isFallback: false };
    } catch (err) {
        return { bookings: memoryBookings, isFallback: true };
    }
}

export async function saveBookings(bookings: Booking[]): Promise<boolean> {
    try {
        memoryBookings = bookings;
        await ensureDb();
        await fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
        return true;
    } catch (err) {
        return false;
    }
}
