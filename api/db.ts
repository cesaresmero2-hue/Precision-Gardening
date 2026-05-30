/**
 * api/db.ts
 * Firestore persistence layer using firebase-admin with in-memory fallback.
 *
 * Uses dynamic imports so firebase-admin is never loaded at module scope —
 * this prevents cold-start crashes in Vercel serverless if the gRPC chain
 * has any bundling or native-binary issues.
 */

// In-memory fallback store (survives within a single warm function invocation)
let inMemoryBookings: any[] = [];
let inMemoryQuotes: any[] = [];

// Cached DB instance across hot invocations within the same container
let _db: any = null;
let _initialized = false;

async function getDB(): Promise<any | null> {
  if (_initialized) return _db;
  _initialized = true;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    console.log("[DB] FIREBASE_PROJECT_ID not set — using in-memory fallback.");
    return null;
  }

  try {
    // Dynamic import: never pulled into the module graph at parse time.
    // If firebase-admin fails to load for any reason, we catch it and fall back.
    const { initializeApp, getApps } = await import("firebase-admin/app");
    const { getFirestore } = await import("firebase-admin/firestore");

    if (getApps().length === 0) {
      initializeApp({ projectId });
    }
    _db = getFirestore();
    console.log(`[DB] Firebase Admin connected — project: ${projectId}`);
    return _db;
  } catch (err: any) {
    console.error("[DB] firebase-admin failed to load, using in-memory fallback:", err.message);
    return null;
  }
}

// ─── Bookings ────────────────────────────────────────────────────────────────

export async function getBookings() {
  const db = await getDB();
  if (db) {
    try {
      const snap = await db.collection("bookings").get();
      const bookings = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      bookings.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      inMemoryBookings = bookings;
      return { bookings, isFallback: false };
    } catch (err: any) {
      console.warn("[DB] Firestore getBookings failed:", err.message);
    }
  }
  const sorted = [...inMemoryBookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return { bookings: sorted, isFallback: true };
}

export async function saveBooking(booking: any) {
  const db = await getDB();
  if (db) {
    try {
      await db.collection("bookings").doc(booking.id).set(booking);
    } catch (err: any) {
      console.warn("[DB] Firestore saveBooking failed:", err.message);
    }
  }
  const idx = inMemoryBookings.findIndex(b => b.id === booking.id);
  if (idx >= 0) inMemoryBookings[idx] = booking;
  else inMemoryBookings.unshift(booking);
}

export async function saveBookings(bookings: any[]) {
  const db = await getDB();
  if (db) {
    try {
      const batch = db.batch();
      for (const b of bookings) batch.set(db.collection("bookings").doc(b.id), b);
      await batch.commit();
    } catch (err: any) {
      console.warn("[DB] Firestore saveBookings batch failed:", err.message);
    }
  }
  inMemoryBookings = bookings;
}

export async function deleteBooking(id: string) {
  const db = await getDB();
  if (db) {
    try {
      await db.collection("bookings").doc(id).delete();
    } catch (err: any) {
      console.warn("[DB] Firestore deleteBooking failed:", err.message);
    }
  }
  inMemoryBookings = inMemoryBookings.filter(b => b.id !== id);
}

// ─── Quotes ──────────────────────────────────────────────────────────────────

export async function getQuotes() {
  const db = await getDB();
  if (db) {
    try {
      const snap = await db.collection("quotes").get();
      const quotes = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      quotes.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      inMemoryQuotes = quotes;
      return { quotes, isFallback: false };
    } catch (err: any) {
      console.warn("[DB] Firestore getQuotes failed:", err.message);
    }
  }
  const sorted = [...inMemoryQuotes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return { quotes: sorted, isFallback: true };
}

export async function saveQuote(quote: any) {
  const db = await getDB();
  if (db) {
    try {
      await db.collection("quotes").doc(quote.id).set(quote);
    } catch (err: any) {
      console.warn("[DB] Firestore saveQuote failed:", err.message);
    }
  }
  const idx = inMemoryQuotes.findIndex(q => q.id === quote.id);
  if (idx >= 0) inMemoryQuotes[idx] = quote;
  else inMemoryQuotes.unshift(quote);
}

export async function saveQuotes(quotes: any[]) {
  const db = await getDB();
  if (db) {
    try {
      const batch = db.batch();
      for (const q of quotes) batch.set(db.collection("quotes").doc(q.id), q);
      await batch.commit();
    } catch (err: any) {
      console.warn("[DB] Firestore saveQuotes batch failed:", err.message);
    }
  }
  inMemoryQuotes = quotes;
}

export async function deleteQuote(id: string) {
  const db = await getDB();
  if (db) {
    try {
      await db.collection("quotes").doc(id).delete();
    } catch (err: any) {
      console.warn("[DB] Firestore deleteQuote failed:", err.message);
    }
  }
  inMemoryQuotes = inMemoryQuotes.filter(q => q.id !== id);
}
