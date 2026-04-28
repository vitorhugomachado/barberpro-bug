require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`Professional Server running on http://localhost:${PORT}`);
});

// Prevent server from crashing on errors (like port already in use)
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please check other processes.`);
  } else {
    console.error('Server error:', err);
  }
});

// Process-level error handling to prevent "clean exists" or silent failures
process.on('uncaughtException', (err) => {
  console.error('CRITICAL: Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
});

