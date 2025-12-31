// Add this to your backend server file
const cors = require('cors');

// Update your CORS middleware to:
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5174', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
