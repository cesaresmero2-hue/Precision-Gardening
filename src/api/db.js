// Database module for bookings and quotes persistence
// Uses in-memory storage for Vercel serverless compatibility

// In-memory storage
let inMemoryBookings = [];
let inMemoryQuotes = [];

// Type definitions (for reference, not enforced in JS)
// Booking: { id, name, phone, email, service, date, timeSlot, message, status, createdAt }
// QuoteRequest: { id, name, phone, email, service, message, status, createdAt }

/**
 * Get bookings from storage
 * Returns { bookings: array, isFallback: boolean }
 */
export async function getBookings() {
  // Sort by createdAt descending (newest first)
  const sortedBookings = [...inMemoryBookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return { bookings: sortedBookings, isFallback: true };
}

/**
 * Save booking to storage
 */
export async function saveBooking(booking) {
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
  inMemoryBookings = bookings;
}

/**
 * Get quotes from storage
 * Returns { quotes: array, isFallback: boolean }
 */
export async function getQuotes() {
  // Sort by createdAt descending (newest first)
  const sortedQuotes = [...inMemoryQuotes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return { quotes: sortedQuotes, isFallback: true };
}

/**
 * Save quote to storage
 */
export async function saveQuote(quote) {
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
  inMemoryQuotes = quotes;
}
