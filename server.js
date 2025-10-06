require('dotenv').config();
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const connectDB = require('./config/db');
const transactionsRouter = require('./routes/transactions');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// connect to DB
connectDB();

// middleware
app.use(helmet());
app.use(express.json());
app.use(cors({
  origin: '*' // for prod: set specific origin(s)
}));

// API routes
app.use('/api/transactions', transactionsRouter);

// Serve frontend (static files)
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// For single page fallback (so direct refresh also works)
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// error handler (last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} — env: ${process.env.NODE_ENV || 'unknown'}`);
});
