# Precision Gardening & Power Washing

A full-stack web application for managing exterior care services including lawn maintenance, power washing, and garden services. Features quote requests, service booking, and an admin dashboard for managing appointments.

## Features

- **Quote Request System**: Customers can request digital estimates for services
- **Service Booking**: Real-time booking system with date/time slot selection
- **Admin Dashboard**: Secure OTP-protected admin portal for managing bookings and quotes
- **Email Notifications**: Resend-powered email notifications for both customers and admins
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Data Persistence**: Firebase Firestore with in-memory fallback

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, Motion
- **Backend**: Express.js, Node.js
- **Database**: Firebase Firestore with in-memory fallback
- **Email**: Resend API
- **Authentication**: JWT with OTP-based login
- **Hosting**: Vercel

## Prerequisites

- Node.js 18+ 
- Resend API key (get from https://resend.com/api-keys)
- Firebase project with Firestore enabled (get from https://console.firebase.google.com)
- Vercel account (for deployment)

## Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your values:
   ```env
   RESEND_API_KEY=re_your_api_key_here
   ADMIN_EMAIL=your-admin-email@example.com
   SADMIN_EMAIL=secondary-admin@example.com  # Optional
   JWT_SECRET=your-super-secret-key-here-change-this-in-production
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_API_KEY=your-firebase-api-key
   FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   FIREBASE_APP_ID=your-firebase-app-id
   FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   - Main site: http://localhost:3000
   - Admin portal: http://localhost:3000#admin

## Vercel Deployment

### 1. Set up Firebase Firestore (Pre-configured)

The application comes pre-configured with Firebase Firestore for persistent data storage. The Firebase project is already set up with the following configuration:

- **Project ID**: precision-gardening-f0ced
- **Database**: Firestore (enabled and ready to use)

If you want to use the pre-configured Firebase project, you can skip this step. If you want to use your own Firebase project:

1. Go to https://console.firebase.google.com
2. Create a new project or select an existing one
3. Navigate to **Build** → **Firestore Database** → **Create Database**
4. Choose a location (e.g., europe-west1 for Ireland)
5. Start in **Test Mode** or **Production Mode** based on your needs
6. Navigate to **Project Settings** → **General**
7. Scroll down to "Your apps" and copy the Firebase configuration values
8. Update the environment variables in Vercel with your custom Firebase config

### 2. Deploy to Vercel

1. **Push your code to GitHub** (if not already done)

2. **Import project in Vercel**:
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel will detect the project configuration automatically

3. **Configure Environment Variables**:
   In your Vercel project settings, add these environment variables:
   
   ```
   RESEND_API_KEY=re_your_api_key_here
   ADMIN_EMAIL=your-admin-email@example.com
   SADMIN_EMAIL=secondary-admin@example.com  # Optional
   JWT_SECRET=your-super-secret-key-here-change-this-in-production
   ```
   
   Note: Firebase configuration is pre-configured in the codebase. You only need to add Firebase environment variables if you want to use a different Firebase project.

4. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete
   - Your site will be live at `https://your-project.vercel.app`

### 3. Access Admin Portal

After deployment:
- Visit `https://your-project.vercel.app#admin`
- Enter your `ADMIN_EMAIL` to receive an OTP code
- Enter the OTP to access the admin dashboard

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `RESEND_API_KEY` | Yes | Your Resend API key for sending emails |
| `ADMIN_EMAIL` | Yes | Primary admin email for notifications and OTP login |
| `SADMIN_EMAIL` | No | Secondary admin email for notifications |
| `JWT_SECRET` | Yes | Secret key for JWT token signing |
| `FIREBASE_PROJECT_ID` | No | Firebase project ID (pre-configured, override to use custom project) |
| `FIREBASE_API_KEY` | No | Firebase API key (pre-configured, override to use custom project) |
| `FIREBASE_AUTH_DOMAIN` | No | Firebase auth domain (pre-configured, override to use custom project) |
| `FIREBASE_STORAGE_BUCKET` | No | Firebase storage bucket (pre-configured, override to use custom project) |
| `FIREBASE_MESSAGING_SENDER_ID` | No | Firebase messaging sender ID (pre-configured, override to use custom project) |
| `FIREBASE_APP_ID` | No | Firebase app ID (pre-configured, override to use custom project) |
| `FIREBASE_MEASUREMENT_ID` | No | Firebase measurement ID (pre-configured, override to use custom project) |

## Project Structure

```
precision-gardening/
├── src/
│   ├── components/       # React components
│   │   ├── AdminDashboard.tsx
│   │   ├── ContactForm.tsx
│   │   └── ...
│   ├── api/
│   │   └── db.js         # Database layer (Firestore + in-memory fallback)
│   ├── App.tsx
│   └── main.tsx
├── public/               # Static assets
├── server.ts            # Express server with API endpoints
├── vercel.json          # Vercel deployment configuration
├── package.json
└── .env.example         # Environment variables template
```

## API Endpoints

### Public Endpoints

- `POST /api/quote` - Submit a quote request
- `POST /api/book` - Book a service slot

### Admin Endpoints (Requires JWT Token)

- `POST /api/auth/send-otp` - Request OTP login code
- `POST /api/auth/verify-otp` - Verify OTP and get JWT token
- `GET /api/admin/bookings` - Get all bookings
- `POST /api/admin/bookings` - Update/delete bookings
- `GET /api/admin/quotes` - Get all quote requests
- `POST /api/admin/quotes` - Update/delete quote requests

## Email Notifications

The application sends emails via Resend for:

- **Quote Requests**: Sent to both ADMIN_EMAIL and SADMIN_EMAIL (if configured)
- **Booking Requests**: Sent to both ADMIN_EMAIL and SADMIN_EMAIL (if configured)
- **Customer Confirmations**: Sent to the customer's email
- **OTP Login Codes**: Sent to ADMIN_EMAIL for admin authentication

## Admin Dashboard Features

- View all bookings and quote requests
- Approve, reschedule, or cancel bookings
- Update quote request statuses
- Export bookings to CSV
- Search and filter by status
- View customer contact information and notes

## Troubleshooting

### Emails not sending
- Verify your `RESEND_API_KEY` is correct
- Check that your sender domain is verified in Resend
- Check server logs for error messages

### Data not persisting
- Ensure all Firebase credentials are set correctly
- Verify your Firestore database is enabled in Firebase Console
- Check Firestore rules allow read/write access
- Verify FIREBASE_PROJECT_ID matches your Firebase project

### Admin portal not accessible
- Verify `ADMIN_EMAIL` is set correctly
- Check that you're using the exact email address configured
- Ensure JWT_SECRET is set and consistent

## License

Proprietary - All rights reserved
