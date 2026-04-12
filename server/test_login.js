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
    console.log("Login HTTP:", res.statusCode, '\nResponse:', body);
  });
});

loginReq.write(loginPayload);
loginReq.end();
