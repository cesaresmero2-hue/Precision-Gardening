import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";

// In-memory fallback database
let inMemoryBookings: any[] = [];
let inMemoryQuotes: any[] = [];

// Reusable Firestore instance cache
let firestoreDb: any = null;
let hasInitializedFirebase = false;

function getFirestoreDB() {
  if (hasInitializedFirebase) {
    return firestoreDb;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const apiKey = process.env.FIREBASE_API_KEY;

  if (!projectId || !apiKey) {
    console.log("[Database] FIREBASE_PROJECT_ID or FIREBASE_API_KEY is missing. Using in-memory fallback database.");
    hasInitializedFirebase = true;
    return null;
  }

  try {
    const firebaseConfig = {
      projectId,
      apiKey,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    };

    if (getApps().length === 0) {
      initializeApp(firebaseConfig);
    }
    
    firestoreDb = getFirestore();
    console.log(`[Database] Connected to Firebase Firestore (Project: ${projectId})`);
    hasInitializedFirebase = true;
    return firestoreDb;
  } catch (error: any) {
    console.warn("[Database] Firestore initialization failed, falling back to in-memory:", error.message);
    hasInitializedFirebase = true;
    return null;
  }
}

/**
 * Get bookings from storage
 */
export async function getBookings() {
  const db = getFirestoreDB();
  if (db) {
    try {
      const bookingsRef = collection(db, "bookings");
      const snapshot = await getDocs(bookingsRef);
      const bookings: any[] = [];
      snapshot.forEach((doc) => {
        bookings.push({ id: doc.id, ...doc.data() });
      });
      // Sort by createdAt descending (newest first)
      bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      // Keep in-memory in sync for dev debugging
      inMemoryBookings = bookings;
      return { bookings, isFallback: false };
    } catch (error: any) {
      console.warn("[Database] Firestore read failed, using in-memory fallback:", error.message);
    }
  }

  // Sort in-memory fallback by date descending
  const sorted = [...inMemoryBookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return { bookings: sorted, isFallback: true };
}

/**
 * Save single booking to storage
 */
export async function saveBooking(booking: any) {
  const db = getFirestoreDB();
  if (db) {
    try {
      const bookingRef = doc(db, "bookings", booking.id);
      await setDoc(bookingRef, booking);
      
      // Sync local in-memory
      const index = inMemoryBookings.findIndex(b => b.id === booking.id);
      if (index >= 0) inMemoryBookings[index] = booking;
      else inMemoryBookings.unshift(booking);
      return;
    } catch (error: any) {
      console.warn("[Database] Firestore write failed, using in-memory fallback:", error.message);
    }
  }

  const index = inMemoryBookings.findIndex(b => b.id === booking.id);
  if (index >= 0) {
    inMemoryBookings[index] = booking;
  } else {
    inMemoryBookings.unshift(booking);
  }
}

/**
 * Save multiple bookings
 */
export async function saveBookings(bookings: any[]) {
  const db = getFirestoreDB();
  if (db) {
    try {
      for (const booking of bookings) {
        const bookingRef = doc(db, "bookings", booking.id);
        await setDoc(bookingRef, booking);
      }
      inMemoryBookings = bookings;
      return;
    } catch (error: any) {
      console.warn("[Database] Firestore batch write failed, using in-memory fallback:", error.message);
    }
  }
  inMemoryBookings = bookings;
}

/**
 * Delete booking from storage
 */
export async function deleteBooking(id: string) {
  const db = getFirestoreDB();
  if (db) {
    try {
      const bookingRef = doc(db, "bookings", id);
      await deleteDoc(bookingRef);
    } catch (error: any) {
      console.warn("[Database] Firestore delete booking failed:", error.message);
    }
  }
  inMemoryBookings = inMemoryBookings.filter(b => b.id !== id);
}

/**
 * Get quote requests from storage
 */
export async function getQuotes() {
  const db = getFirestoreDB();
  if (db) {
    try {
      const quotesRef = collection(db, "quotes");
      const snapshot = await getDocs(quotesRef);
      const quotes: any[] = [];
      snapshot.forEach((doc) => {
        quotes.push({ id: doc.id, ...doc.data() });
      });
      // Sort by createdAt descending
      quotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      inMemoryQuotes = quotes;
      return { quotes, isFallback: false };
    } catch (error: any) {
      console.warn("[Database] Firestore read failed, using in-memory fallback:", error.message);
    }
  }

  const sorted = [...inMemoryQuotes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return { quotes: sorted, isFallback: true };
}

/**
 * Save single quote to storage
 */
export async function saveQuote(quote: any) {
  const db = getFirestoreDB();
  if (db) {
    try {
      const quoteRef = doc(db, "quotes", quote.id);
      await setDoc(quoteRef, quote);
      
      const index = inMemoryQuotes.findIndex(q => q.id === quote.id);
      if (index >= 0) inMemoryQuotes[index] = quote;
      else inMemoryQuotes.unshift(quote);
      return;
    } catch (error: any) {
      console.warn("[Database] Firestore write failed, using in-memory fallback:", error.message);
    }
  }

  const index = inMemoryQuotes.findIndex(q => q.id === quote.id);
  if (index >= 0) {
    inMemoryQuotes[index] = quote;
  } else {
    inMemoryQuotes.unshift(quote);
  }
}

/**
 * Save multiple quotes
 */
export async function saveQuotes(quotes: any[]) {
  const db = getFirestoreDB();
  if (db) {
    try {
      for (const quote of quotes) {
        const quoteRef = doc(db, "quotes", quote.id);
        await setDoc(quoteRef, quote);
      }
      inMemoryQuotes = quotes;
      return;
    } catch (error: any) {
      console.warn("[Database] Firestore batch write failed, using in-memory fallback:", error.message);
    }
  }
  inMemoryQuotes = quotes;
}

/**
 * Delete quote from storage
 */
export async function deleteQuote(id: string) {
  const db = getFirestoreDB();
  if (db) {
    try {
      const quoteRef = doc(db, "quotes", id);
      await deleteDoc(quoteRef);
    } catch (error: any) {
      console.warn("[Database] Firestore delete quote failed:", error.message);
    }
  }
  inMemoryQuotes = inMemoryQuotes.filter(q => q.id !== id);
}
