const appointments = [
  {
    "id": 7,
    "customer": "STEFANI",
    "phone": "44991278838",
    "service": "Corte de Cabelo",
    "barberId": 1,
    "date": "2026-04-10",
    "time": "09:00",
    "status": "Agendado",
    "price": 50,
    "payments": null
  }
];

const selectedDate = "2026-04-10";
const todayStr = "2026-04-10";

function test() {
  const curr = new Date(selectedDate);
  // Simulating the Project's TZ logic (assuming -3 offset)
  curr.setMinutes(curr.getMinutes() + 180); 
  
  const day = curr.getDay() || 7; // Friday = 5
  const startOfWeek = new Date(curr);
  startOfWeek.setDate(curr.getDate() - (day - 1));
  
  const startStr = startOfWeek.toISOString().split('T')[0];
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  const endStr = endOfWeek.toISOString().split('T')[0];
  
  console.log("Range:", startStr, "to", endStr);
  
  const selectedBarberId = 'all';
  
  const filtered = appointments.filter(app => {
    const inRange = app.date >= startStr && app.date <= endStr;
    const matchesBarber = selectedBarberId === 'all' || String(app.barberId) === String(selectedBarberId);
    return inRange && matchesBarber;
  });
  
  console.log("Filtered length:", filtered.length);
  
  const dateString = "2026-04-10";
  const timeString = "09:00";
  const cellApps = filtered.filter(app => app.date === dateString && app.time === timeString);
  console.log("Cell Apps:", cellApps.length);
}

test();
