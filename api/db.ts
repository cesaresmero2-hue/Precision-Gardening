import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

// In-memory fallback database
let inMemoryBookings: any[] = [];
let inMemoryQuotes: any[] = [];

// Cached Firestore instance
let firestoreDb: Firestore | null = null;
let hasInitialized = false;

function getFirestoreDB(): Firestore | null {
  if (hasInitialized) return firestoreDb;

  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (!projectId) {
    console.log("[Database] FIREBASE_PROJECT_ID is missing. Using in-memory fallback.");
    hasInitialized = true;
    return null;
  }

  try {
    // firebase-admin can use Application Default Credentials (ADC) or a service account.
    // On Vercel we pass the project id and rely on ADC / the env vars for auth.
    // For client-key-less auth we just need the projectId; the Admin SDK will
    // use GOOGLE_APPLICATION_CREDENTIALS if set, otherwise it will use the
    // FIREBASE_* env vars for the REST-based Firestore access via the Web SDK.
    //
    // Since we don't have a service account JSON we fall back to initialising
    // with just the projectId which works when Firestore security rules allow
    // server-side reads (i.e. "test mode" or rules that allow authenticated writes).
    //
    // If you later add a Service Account, set GOOGLE_APPLICATION_CREDENTIALS
    // to its JSON path and remove the credential field here.
    if (getApps().length === 0) {
      initializeApp({ projectId });
    }

    firestoreDb = getFirestore();
    console.log(`[Database] Firebase Admin connected to Firestore (Project: ${projectId})`);
    hasInitialized = true;
    return firestoreDb;
  } catch (error: any) {
    console.warn("[Database] Firestore Admin init failed, using in-memory fallback:", error.message);
    hasInitialized = true;
    return null;
  }
}

// ─── Bookings ────────────────────────────────────────────────────────────────

export async function getBookings() {
  const db = getFirestoreDB();
  if (db) {
    try {
      const snapshot = await db.collection("bookings").get();
      const bookings = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      bookings.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      inMemoryBookings = bookings;
      return { bookings, isFallback: false };
    } catch (error: any) {
      console.warn("[Database] Firestore read failed, using in-memory fallback:", error.message);
    }
  }
  const sorted = [...inMemoryBookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return { bookings: sorted, isFallback: true };
}

export async function saveBooking(booking: any) {
  const db = getFirestoreDB();
  if (db) {
    try {
      await db.collection("bookings").doc(booking.id).set(booking);
      const index = inMemoryBookings.findIndex(b => b.id === booking.id);
      if (index >= 0) inMemoryBookings[index] = booking;
      else inMemoryBookings.unshift(booking);
      return;
    } catch (error: any) {
      console.warn("[Database] Firestore write failed, using in-memory fallback:", error.message);
    }
  }
  const index = inMemoryBookings.findIndex(b => b.id === booking.id);
  if (index >= 0) inMemoryBookings[index] = booking;
  else inMemoryBookings.unshift(booking);
}

export async function saveBookings(bookings: any[]) {
  const db = getFirestoreDB();
  if (db) {
    try {
      const batch = db.batch();
      for (const booking of bookings) {
        batch.set(db.collection("bookings").doc(booking.id), booking);
      }
      await batch.commit();
      inMemoryBookings = bookings;
      return;
    } catch (error: any) {
      console.warn("[Database] Firestore batch write failed:", error.message);
    }
  }
  inMemoryBookings = bookings;
}

export async function deleteBooking(id: string) {
  const db = getFirestoreDB();
  if (db) {
    try {
      await db.collection("bookings").doc(id).delete();
    } catch (error: any) {
      console.warn("[Database] Firestore delete booking failed:", error.message);
    }
  }
  inMemoryBookings = inMemoryBookings.filter(b => b.id !== id);
}

// ─── Quotes ──────────────────────────────────────────────────────────────────

export async function getQuotes() {
  const db = getFirestoreDB();
  if (db) {
    try {
      const snapshot = await db.collection("quotes").get();
      const quotes = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      quotes.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      inMemoryQuotes = quotes;
      return { quotes, isFallback: false };
    } catch (error: any) {
      console.warn("[Database] Firestore read failed, using in-memory fallback:", error.message);
    }
  }
  const sorted = [...inMemoryQuotes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return { quotes: sorted, isFallback: true };
}

export async function saveQuote(quote: any) {
  const db = getFirestoreDB();
  if (db) {
    try {
      await db.collection("quotes").doc(quote.id).set(quote);
      const index = inMemoryQuotes.findIndex(q => q.id === quote.id);
      if (index >= 0) inMemoryQuotes[index] = quote;
      else inMemoryQuotes.unshift(quote);
      return;
    } catch (error: any) {
      console.warn("[Database] Firestore write failed, using in-memory fallback:", error.message);
    }
  }
  const index = inMemoryQuotes.findIndex(q => q.id === quote.id);
  if (index >= 0) inMemoryQuotes[index] = quote;
  else inMemoryQuotes.unshift(quote);
}

export async function saveQuotes(quotes: any[]) {
  const db = getFirestoreDB();
  if (db) {
    try {
      const batch = db.batch();
      for (const quote of quotes) {
        batch.set(db.collection("quotes").doc(quote.id), quote);
      }
      await batch.commit();
      inMemoryQuotes = quotes;
      return;
    } catch (error: any) {
      console.warn("[Database] Firestore batch write failed:", error.message);
    }
  }
  inMemoryQuotes = quotes;
}

export async function deleteQuote(id: string) {
  const db = getFirestoreDB();
  if (db) {
    try {
      await db.collection("quotes").doc(id).delete();
    } catch (error: any) {
      console.warn("[Database] Firestore delete quote failed:", error.message);
    }
  }
  inMemoryQuotes = inMemoryQuotes.filter(q => q.id !== id);
}
