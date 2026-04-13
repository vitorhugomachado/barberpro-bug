const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// API Routes
app.use('/api', apiRoutes);

// Health Check for diagnostics
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 Handler - MUST be after routes
app.use((req, res) => {
  res.status(404).json({ 
    message: `Rota não encontrada: ${req.originalUrl}`,
    suggestion: "Verifique se o backend está rodando e se a URL no AppContext está correta." 
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erro interno no servidor' });
});

module.exports = app;
