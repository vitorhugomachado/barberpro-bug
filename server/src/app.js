const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// API Routes
app.use('/api', apiRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erro interno no servidor' });
});

module.exports = app;
