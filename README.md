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

- **Google sign-in:** Set `GOOGLE_CLIENT_ID` in `backend/config/.env` and the same client ID as `VITE_GOOGLE_CLIENT_ID` in the frontend environment. Configure the Google OAuth client with the frontend origin (for local development, `http://localhost:5173`). Google sign-in is hidden until the frontend variable is set.
- **Order emails:** Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_EMAIL`, `SMTP_PASSWORD`, and `SMTP_FROM_EMAIL` in the backend environment. `SMTP_FROM_NAME` is optional. A status update sends the customer an itemized email with a PDF receipt; if delivery fails, the status remains saved and an admin can retry the email from the order page.
- **Payment:** Checkout currently creates Cash on Delivery orders; it does not process card payments. The server recalculates prices from current product records. Inventory is deducted when an order is marked Completed.

## Included workflows

- Admin product create/read/update/delete with multiple images and bulk deletion.
- Storefront price, category, rating, and review filters with pagination.
- Reviews restricted to customers with a completed purchase, editable by their author, and profanity-masked.
- Admin order status transitions, email notifications with PDF receipts, and date-filtered sales charts.
- Yup validation for login, profile, and product forms; Bootstrap and Material UI components.
