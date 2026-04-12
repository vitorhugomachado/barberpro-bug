const http = require('http');

const loginPayload = JSON.stringify({ email: 'admin@admin.com', password: '123' });

const loginReq = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginPayload)
  }
}, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    const token = JSON.parse(body).token;
    
    // Teste com aspas faltantes na base64, payload identico
    const payload = JSON.stringify({
      name: "Teste Direto",
      email: "teste_direto@test.com",
      password: "123",
      role: "Barbeiro",
      status: "Ativo",
      foto_perfil: "",
      permissions: ["scheduler", "clients"],
      shifts: [
        { dia_semana: 1, hora_inicio: '09:00', hora_fim: '18:00', ativo: true }
      ]
    });

    const createReq = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/barbers',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(payload)
      }
    }, res2 => {
      let b2 = '';
      res2.on('data', d => b2 += d);
      res2.on('end', () => console.log('Create HTTP:', res2.statusCode, '\nResponse:', b2));
    });
    createReq.write(payload);
    createReq.end();
  });
});

loginReq.write(loginPayload);
loginReq.end();
