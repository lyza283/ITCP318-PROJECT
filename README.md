# GuhitSpace

GuhitSpace is a React/Vite storefront with an Express/MongoDB API. It includes admin product and order management, customer reviews, checkout using Cash on Delivery, and sales reporting.

## Setup

1. Install backend dependencies with `cd backend; npm install`.
2. Copy `backend/config/.env.example` to `backend/config/.env` and fill in the required database, JWT, and Cloudinary values.
3. Install frontend dependencies with `cd frontend; npm install`.
4. Copy `frontend/.env.example` to `frontend/.env`. Set `VITE_API` to the API base URL and add a Google OAuth client ID if using Google sign-in.
5. Start the API from `backend` with `npm start` and the frontend from `frontend` with `npm run dev`.

The API defaults to port `4001` and the Vite development server to `5173`. Do not commit `.env` files or put credentials in frontend source.

## Optional integrations

- **Legacy Google sign-in:** If Firebase Auth is not configured, set `GOOGLE_CLIENT_ID` in `backend/config/.env` and the same client ID as `VITE_GOOGLE_CLIENT_ID` in the frontend environment. Configure the Google OAuth client with the frontend origin (for local development, `http://localhost:5173`). When Firebase Auth is configured, the login page uses Firebase's Google provider instead.
- **Firebase Authentication (optional):** In Firebase Console, enable Email/Password and Google under Authentication → Sign-in method, and add `localhost` (plus your deployed frontend domain) under Authentication → Settings → Authorized domains. Put the Web app's API key, Auth domain, Project ID, and App ID in the `VITE_FIREBASE_*` variables in `frontend/.env.local`; set `FIREBASE_PROJECT_ID` in `backend/config/.env` to the same project ID. Firebase Admin service-account credentials (`FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY`) are additionally required only if admins need to delete linked Firebase accounts. Keep the service-account key private and out of source control. Restart both servers after setting environment variables. Firebase sign-in is optional; the existing MongoDB login remains available. Firebase email/password users must verify their email before their Firebase identity can be linked to a MongoDB user. Firestore and Firebase Storage are not used.
- **Order emails:** Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_EMAIL`, `SMTP_PASSWORD`, and `SMTP_FROM_EMAIL` in the backend environment. `SMTP_FROM_NAME` is optional. A status update sends the customer an itemized email with a PDF receipt; if delivery fails, the status remains saved and an admin can retry the email from the order page.
- **Payment:** Checkout currently creates Cash on Delivery orders; it does not process card payments. The server recalculates prices from current product records. Inventory is deducted when an order is marked Completed.

## Included workflows

- Admin product create/read/update/delete with multiple images and bulk deletion.
- Storefront price, category, rating, and review filters with both page controls and infinite scrolling backed by paginated API requests.
- Page controls and infinite scrolling for admin product, order, user, and review lists, customer order history, and product reviews.
- Reviews restricted to customers with a completed purchase, editable by their author, and profanity-masked.
- Admin order status transitions, email notifications with PDF receipts, and date-filtered sales charts.
- Yup validation for login, profile, and product forms; Bootstrap and Material UI components.
