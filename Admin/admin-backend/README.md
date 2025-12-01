Admin Backend

This repository already has admin routes implemented in the main backend at:

  backend/src/routes/adminRoutes.js
  backend/src/controllers/adminController.js

If you'd like to run the admin API as a separate service, you can either:

- Extract the `adminController.js` and `adminRoutes.js` files into this folder and create a new Express app wired to your MongoDB instance.
- Or keep using the existing backend and point your admin frontend to `http://localhost:5001/api/admin`.

Notes:
- The admin endpoints are protected with the existing `protect` and `admin` middleware from `backend/src/middleware/authMiddleware.js`.
- For a standalone admin backend, copy the relevant models (User, Resume, Template) or import them from the main backend and set up environment variables for the DB and JWT.
