const http = require('http');

const data = JSON.stringify({
  name: "Test Person 100",
  email: "test100@test.com",
  password: "123",
  role: "Barbeiro",
  status: "Ativo",
  permissions: ["scheduler", "clients"],
  shifts: []
});

const req = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/api/barbers',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
    // omitting auth as it might need token, let's see if we get 401
  }
}, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('Status Code:', res.statusCode, '\nResponse:', body));
});

req.on('error', console.error);
req.write(data);
req.end();
