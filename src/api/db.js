// Database module for bookings and quotes persistence
// Uses Firestore for production, falls back to in-memory storage

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, orderBy, addDoc } from 'firebase/firestore';

// In-memory fallback storage
let inMemoryBookings = [];
let inMemoryQuotes = [];

// Type definitions (for reference, not enforced in JS)
// Booking: { id, name, phone, email, service, date, timeSlot, message, status, createdAt }
// QuoteRequest: { id, name, phone, email, service, message, status, createdAt }

/**
 * Initialize Firebase Firestore
 */
function getFirestoreDB() {
  try {
    // Default Firebase configuration (can be overridden by environment variables)
    const firebaseConfig = {
      projectId: process.env.FIREBASE_PROJECT_ID || "precision-gardening-f0ced",
      apiKey: process.env.FIREBASE_API_KEY || "AIzaSyCsmW2-NDmQVLjOZLfDdu2BzTh2VZHYDbM",
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || "precision-gardening-f0ced.firebaseapp.com",
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "precision-gardening-f0ced.firebasestorage.app",
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "1007619827713",
      appId: process.env.FIREBASE_APP_ID || "1:1007619827713:web:263abde984297f6288f800",
      measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-DSWHCV547T",
    };

    // Initialize Firebase if not already initialized
    if (!getApps().length) {
      initializeApp(firebaseConfig);
    }

    return getFirestore();
  } catch (error) {
    console.warn('Firestore initialization failed, using in-memory fallback:', error.message);
    return null;
  }
}

/**
 * Get bookings from storage
 * Returns { bookings: array, isFallback: boolean }
 */
export async function getBookings() {
  const db = getFirestoreDB();
  
  if (db) {
    try {
      const bookingsRef = collection(db, 'bookings');
      const snapshot = await getDocs(bookingsRef);
      const bookings = [];
      snapshot.forEach((doc) => {
        bookings.push({ id: doc.id, ...doc.data() });
      });
      // Sort by createdAt descending (newest first)
      bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return { bookings, isFallback: false };
    } catch (error) {
      console.warn('Firestore read failed, using in-memory fallback:', error.message);
    }
  }
  
  // Fallback to in-memory
  return { bookings: inMemoryBookings, isFallback: true };
}

/**
 * Save booking to storage
 */
export async function saveBooking(booking) {
  const db = getFirestoreDB();
  
  if (db) {
    try {
      const bookingRef = doc(db, 'bookings', booking.id);
      await setDoc(bookingRef, booking);
      return;
    } catch (error) {
      console.warn('Firestore write failed, using in-memory fallback:', error.message);
    }
  }
  
  // Fallback to in-memory
  const index = inMemoryBookings.findIndex(b => b.id === booking.id);
  if (index >= 0) {
    inMemoryBookings[index] = booking;
  } else {
    inMemoryBookings.unshift(booking);
  }
}

/**
 * Save all bookings (for backward compatibility with array-based operations)
 */
export async function saveBookings(bookings) {
  const db = getFirestoreDB();
  
  if (db) {
    try {
      // For Firestore, we update each document individually
      // This is called when updating the entire array from admin operations
      for (const booking of bookings) {
        const bookingRef = doc(db, 'bookings', booking.id);
        await setDoc(bookingRef, booking);
      }
      return;
    } catch (error) {
      console.warn('Firestore batch write failed, using in-memory fallback:', error.message);
    }
  }
  
  // Fallback to in-memory
  inMemoryBookings = bookings;
}

/**
 * Get quotes from storage
 * Returns { quotes: array, isFallback: boolean }
 */
export async function getQuotes() {
  const db = getFirestoreDB();
  
  if (db) {
    try {
      const quotesRef = collection(db, 'quotes');
      const snapshot = await getDocs(quotesRef);
      const quotes = [];
      snapshot.forEach((doc) => {
        quotes.push({ id: doc.id, ...doc.data() });
      });
      // Sort by createdAt descending (newest first)
      quotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return { quotes, isFallback: false };
    } catch (error) {
      console.warn('Firestore read failed, using in-memory fallback:', error.message);
    }
  }
  
  // Fallback to in-memory
  return { quotes: inMemoryQuotes, isFallback: true };
}

/**
 * Save quote to storage
 */
export async function saveQuote(quote) {
  const db = getFirestoreDB();
  
  if (db) {
    try {
      const quoteRef = doc(db, 'quotes', quote.id);
      await setDoc(quoteRef, quote);
      return;
    } catch (error) {
      console.warn('Firestore write failed, using in-memory fallback:', error.message);
    }
  }
  
  // Fallback to in-memory
  const index = inMemoryQuotes.findIndex(q => q.id === quote.id);
  if (index >= 0) {
    inMemoryQuotes[index] = quote;
  } else {
    inMemoryQuotes.unshift(quote);
  }
}

/**
 * Save all quotes (for backward compatibility with array-based operations)
 */
export async function saveQuotes(quotes) {
  const db = getFirestoreDB();
  
  if (db) {
    try {
      // For Firestore, we update each document individually
      // This is called when updating the entire array from admin operations
      for (const quote of quotes) {
        const quoteRef = doc(db, 'quotes', quote.id);
        await setDoc(quoteRef, quote);
      }
      return;
    } catch (error) {
      console.warn('Firestore batch write failed, using in-memory fallback:', error.message);
    }
  }
  
  // Fallback to in-memory
  inMemoryQuotes = quotes;
}
