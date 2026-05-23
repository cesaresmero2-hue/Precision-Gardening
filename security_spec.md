# security_spec.md

## 1. Data Invariants
- **Bookings**:
  - Anyone can create a Booking, but they must provide a valid `id`, `name`, `phone`, `email`, `service`, `date`, `timeSlot`, and a starting state of `status == "Pending"`.
  - Only administrators (identified by Admin documents/roles) may read (list/get), update (reschedule/approve/cancel), or delete Booking documents.
  - Once a Booking status reaches a terminal state (such as `"Completed"` or `"Cancelled"`), it cannot be modified by standard users or unauthorized actions.
- **Quotes**:
  - Anyone can create a Quote request.
  - Only administrators may read (list/get) or delete Quote documents.
  - Quote documents are immutable after creation.

---

## 2. The "Dirty Dozen" Payloads (Rogue Scenarios)

1. **Self-Approve Status**: A client tries to create a Booking directly with `status = "Confirmed"` or `"Completed"` to shortcut dispatch approval.
2. **Missing Contact Info**: A client tries to submit a Booking missing their `phone` or `email` fields.
3. **Ghost Fields Injection**: A write request containing extra unregistered variables trying to bloat document storage (Shadow Fields).
4. **Malicious ID injection**: A client attempts to create or write to a Booking where the document ID or path variable contains invalid trailing characters (ID Poisoning).
5. **Unauthorized Status Escalation**: An unauthenticated user tries to update an existing Booking's status to `"Completed"`.
6. **Malicious Sizing Attack (Denial of Wallet)**: A client tries to write a string containing 10MB of garbage into the `message` field to exhaust database transaction limits.
7. **Privilege Escalation via Role Modification**: A malicious client writes to a profile or attempts to self-assign their own `admin` privileges.
8. **Unauthorized Rescheduling**: A malicious outsider attempts to change another client's booking `date` or `timeSlot`.
9. **Rogue Profile Creation**: An outsider writes dummy user roles into an `admins` reference collection.
10. **Immutable Field Altering**: An operator tries to overwrite the `createdAt` timestamp of an existing Booking.
11. **Client-Side Query Hijacking**: An attacker sends a query to list all Bookings in the system without proving admin credentials (expecting rules to let the client self-filter).
12. **Orphaned Record Creation**: Submitting reference records with dummy relational ties.

---

## 3. The Test Runner (`firestore.rules.test.ts`)
Below is our comprehensive unit test strategy to ensure each of these payloads returns `PERMISSION_DENIED`:

```typescript
// firestore.rules.test.ts
// Unit tests confirming security rules return PERMISSION_DENIED for rogue scenarios.
```
