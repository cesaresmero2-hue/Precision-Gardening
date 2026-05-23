import fs from "fs";
import path from "path";

export interface Booking {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  date: string;
  timeSlot: string;
  message: string;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
  createdAt: string;
}

export interface QuoteRequest {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  message: string;
  status: "Pending" | "Reviewed" | "Responded";
  createdAt: string;
}

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {},
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Fallback in-memory state
let inMemoryBookings: Booking[] = [
  {
    id: "PRC-B498210",
    name: "Marcus Vance",
    phone: "(425) 555-0144",
    email: "marcus@vancecorp.com",
    service: "Lawn Mowing & Edging",
    date: "2026-05-28",
    timeSlot: "Morning (8AM - 12PM)",
    message: "Corner lot, needs clean mechanical edging on the sidewalk.",
    status: "Confirmed",
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: "PRC-B719324",
    name: "Sarah Lindqvist",
    phone: "(425) 555-9876",
    email: "sarah.lindqvist@outlook.com",
    service: "Driveway & Patio Jet Wash",
    date: "2026-05-29",
    timeSlot: "Afternoon (1PM - 5PM)",
    message: "Heavy moss on the brick patio path. Needs pre-treatment.",
    status: "Pending",
    createdAt: new Date().toISOString()
  }
];

let dbPromise: Promise<any> | null = null;

export async function getFirestoreDb() {
  if (dbPromise) return dbPromise;

  dbPromise = (async () => {
    const configPath = path.resolve(process.cwd(), "firebase-applet-config.json");
    if (!fs.existsSync(configPath)) {
      console.warn("WARNING: firebase-applet-config.json does not exist. Using fallback storage.");
      return null;
    }
    try {
      const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
      const { initializeApp } = await import("firebase/app");
      const { getFirestore } = await import("firebase/firestore");

      const app = initializeApp(firebaseConfig);
      const databaseId = firebaseConfig.firestoreDatabaseId;
      if (databaseId && databaseId !== "(default)") {
        return getFirestore(app, databaseId);
      }
      return getFirestore(app);
    } catch (e) {
      console.error("Failed to initialize Firebase Firestore:", e);
      return null;
    }
  })();

  return dbPromise;
}

let inMemoryQuotes: QuoteRequest[] = [];

export async function getQuotes(): Promise<{ quotes: QuoteRequest[]; isFallback: boolean }> {
  const db = await getFirestoreDb();
  if (db) {
    try {
      const { collection, getDocs } = await import("firebase/firestore");
      const querySnapshot = await getDocs(collection(db, "quotes"));
      const quotes: QuoteRequest[] = [];
      querySnapshot.forEach((docSnap) => {
        quotes.push(docSnap.data() as QuoteRequest);
      });
      quotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return { quotes, isFallback: false };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "quotes");
    }
  }

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (url && token) {
    try {
      const res = await fetch(`${url}/get/quotes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.result) {
          const parsed = JSON.parse(data.result);
          if (Array.isArray(parsed)) {
            return { quotes: parsed, isFallback: false };
          }
        }
      }
    } catch (e) {
      console.error("KV fetch error for quotes:", e);
    }
  }

  return { quotes: inMemoryQuotes, isFallback: true };
}

export async function saveQuotes(quotes: QuoteRequest[]): Promise<boolean> {
  const db = await getFirestoreDb();
  if (db) {
    try {
      const { doc, getDocs, collection, writeBatch } = await import("firebase/firestore");
      const querySnapshot = await getDocs(collection(db, "quotes"));
      const existingIds = querySnapshot.docs.map(d => d.id);
      const newIds = new Set(quotes.map(q => q.id));

      const batch = writeBatch(db);

      for (const quote of quotes) {
        const quoteRef = doc(db, "quotes", quote.id);
        batch.set(quoteRef, quote);
      }

      for (const existingId of existingIds) {
        if (!newIds.has(existingId)) {
          const quoteRef = doc(db, "quotes", existingId);
          batch.delete(quoteRef);
        }
      }

      await batch.commit();
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "quotes");
      return false;
    }
  }

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (url && token) {
    try {
      const res = await fetch(`${url}/set/quotes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(JSON.stringify(quotes))
      });
      if (res.ok) {
        return true;
      }
    } catch (e) {
      console.error("KV save error for quotes:", e);
    }
  }

  inMemoryQuotes = quotes;
  return true;
}

export async function getBookings(): Promise<{ bookings: Booking[]; isFallback: boolean }> {
  const db = await getFirestoreDb();
  if (db) {
    try {
      const { collection, getDocs } = await import("firebase/firestore");
      const querySnapshot = await getDocs(collection(db, "bookings"));
      const bookings: Booking[] = [];
      querySnapshot.forEach((docSnap) => {
        bookings.push(docSnap.data() as Booking);
      });
      // Sort descending by creation date
      bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return { bookings, isFallback: false };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "bookings");
    }
  }

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (url && token) {
    try {
      const res = await fetch(`${url}/get/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.result) {
          const parsed = JSON.parse(data.result);
          if (Array.isArray(parsed)) {
            return { bookings: parsed, isFallback: false };
          }
        }
      }
    } catch (e) {
      console.error("KV fetch error, using fallback:", e);
    }
  }

  return { bookings: inMemoryBookings, isFallback: true };
}

export async function saveBookings(bookings: Booking[]): Promise<boolean> {
  const db = await getFirestoreDb();
  if (db) {
    try {
      const { doc, getDocs, collection, writeBatch } = await import("firebase/firestore");
      const querySnapshot = await getDocs(collection(db, "bookings"));
      const existingIds = querySnapshot.docs.map(d => d.id);
      const newIds = new Set(bookings.map(b => b.id));

      const batch = writeBatch(db);

      // Save new & update existing
      for (const booking of bookings) {
        const bookingRef = doc(db, "bookings", booking.id);
        batch.set(bookingRef, booking);
      }

      // Clean deleted documents
      for (const existingId of existingIds) {
        if (!newIds.has(existingId)) {
          const bookingRef = doc(db, "bookings", existingId);
          batch.delete(bookingRef);
        }
      }

      await batch.commit();
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "bookings");
      return false;
    }
  }

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (url && token) {
    try {
      const res = await fetch(`${url}/set/bookings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(JSON.stringify(bookings))
      });
      if (res.ok) {
        return true;
      }
    } catch (e) {
      console.error("KV save error:", e);
    }
  }

  inMemoryBookings = bookings;
  return true;
}
