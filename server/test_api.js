const http = require('http');

// Simulating what AppContext.jsx sends
const payload = JSON.stringify({
  name: "Teste Botão",
  email: "teste_botao@test.com",
  password: "123",
  role: "Barbeiro",
  status: "Ativo",
  permissions: ["scheduler", "clients"],
  shifts: [
    { dia_semana: 1, hora_inicio: '09:00', hora_fim: '18:00', ativo: true },
    { dia_semana: 2, hora_inicio: '09:00', hora_fim: '18:00', ativo: true }
  ]
});

const req = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/api/barbers',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
    // No token to see if it responds 401. If it responds 401, I need to login first.
  }
}, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('HTTP:', res.statusCode, '\nResponse:', body));
});

req.on('error', console.error);
req.write(payload);
req.end();
