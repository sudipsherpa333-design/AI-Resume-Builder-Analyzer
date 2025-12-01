# Admin Login Setup Guide

The admin login system has been configured as requested.

## Admin Credentials

- **Username:** `airesume100`
- **Password:** `airesumepro9813`

## How it Works

1. Go to the main login page: `http://localhost:5173/login`
2. Enter `airesume100` in the "Email Address or Admin Username" field.
3. Enter `airesumepro9813` in the password field.
4. Click "Sign in".
5. You will be automatically redirected to the Admin Dashboard at `http://localhost:5174`.

## Important: Running the Admin Dashboard

For the redirection to work, you must have the Admin Frontend running.
By default, the main frontend runs on port **5173**, and the admin frontend should run on port **5174**.

### How to start the Admin Frontend

1. Open a new terminal.
2. Navigate to the admin frontend directory:
   ```bash
   cd Admin/admin-frontend
   ```
3. Install dependencies (first time only):
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm run dev
   ```
   Ensure it says it is running on `localhost:5174`.

## Troubleshooting

- **Redirect fails (Connection Refused):** Ensure the Admin Frontend is running.
- **Invalid Credentials:** Double check you are using exactly `airesume100` and `airesumepro9813`.
