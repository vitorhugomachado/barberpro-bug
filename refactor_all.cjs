const fs = require('fs');
const path = require('path');

// ── index.css: fix self-referencing variables and remaining hardcoded values ──
let css = fs.readFileSync('src/index.css', 'utf-8');

// Fix self-referencing vars in :root (caused by previous script)
css = css.replace(/--panel-bg: var\(--panel-bg\);/, '--panel-bg: #f5f3ef;');
css = css.replace(/--hover-bg: var\(--hover-bg\);/, '--hover-bg: rgba(0,0,0,0.03);');
css = css.replace(/--icon-bg: var\(--icon-bg\);/, '--icon-bg: rgba(0,0,0,0.04);');
css = css.replace(/--icon-hover: var\(--icon-hover\);/, '--icon-hover: rgba(0,0,0,0.08);');
css = css.replace(/--line-color: var\(--icon-hover\);/, '--line-color: rgba(0,0,0,0.08);');
css = css.replace(/--shadow-md: 0 4px 6px var\(--icon-bg\);/, '--shadow-md: 0 4px 6px rgba(0,0,0,0.04);');
css = css.replace(/--shadow-lg: 0 10px 15px var\(--border-color\);/, '--shadow-lg: 0 10px 15px rgba(0,0,0,0.06);');

// Fix .dash-action-btn.primary:hover
css = css.replace(
  /\.dash-action-btn\.primary:hover \{\s*\n\s*background: #222;/,
  '.dash-action-btn.primary:hover {\n  background: var(--accent-hover);'
);

// Fix .dash-action-btn.secondary:hover
css = css.replace(
  /\.dash-action-btn\.secondary:hover \{\s*\n\s*background: #f8f7f5;/,
  '.dash-action-btn.secondary:hover {\n  background: var(--hover-bg);'
);

// Fix scrollbar for dark mode
css = css.replace(
  /::-webkit-scrollbar-track \{\s*\n\s*background: #f1f1f1;/,
  '::-webkit-scrollbar-track {\n  background: var(--panel-bg);'
);
css = css.replace(
  /::-webkit-scrollbar-thumb \{\s*\n\s*background: #ccc;/,
  '::-webkit-scrollbar-thumb {\n  background: var(--text-secondary);'
);
css = css.replace(
  /::-webkit-scrollbar-thumb:hover \{\s*\n\s*background: #999;/,
  '::-webkit-scrollbar-thumb:hover {\n  background: var(--accent-color);'
);

// Add smooth transition for theme change
css = css.replace(
  /body \{/,
  'body {\n  transition: background-color 0.3s ease, color 0.3s ease;'
);

// Fix gradient text to use brand
css = css.replace(
  /background: linear-gradient\(135deg, var\(--success-color\), #059669\);/,
  'background: linear-gradient(135deg, var(--brand-400), var(--brand-700));'
);

fs.writeFileSync('src/index.css', css, 'utf-8');
console.log('✅ index.css patched');

// ── Sidebar.jsx ── 
let sidebar = fs.readFileSync('src/components/Sidebar.jsx', 'utf-8');
sidebar = sidebar.replace(
  "background: '#000', color: '#fff'",
  "background: 'var(--accent-color)', color: 'var(--accent-text)'"
);
fs.writeFileSync('src/components/Sidebar.jsx', sidebar, 'utf-8');
console.log('✅ Sidebar.jsx patched');

// ── LoginPage.jsx ──
let login = fs.readFileSync('src/pages/LoginPage.jsx', 'utf-8');
login = login.replace("background: '#fcfcfc'", "background: 'var(--bg-color)'");
login = login.replace(
  "background: '#000', color: '#fff'",
  "background: 'var(--accent-color)', color: 'var(--accent-text)'"
);
login = login.replace(
  "color: '#000', fontWeight: 600",
  "color: 'var(--accent-color)', fontWeight: 600"
);
fs.writeFileSync('src/pages/LoginPage.jsx', login, 'utf-8');
console.log('✅ LoginPage.jsx patched');

// ── PublicBooking.jsx ──
let pb = fs.readFileSync('src/pages/PublicBooking.jsx', 'utf-8');
pb = pb.replace("background: '#fcfcfc'", "background: 'var(--bg-color)'");
// Progress bar
pb = pb.replace("background: step >= s ? '#000' : 'rgba(0,0,0,0.05)'", "background: step >= s ? 'var(--accent-color)' : 'var(--border-color)'");
// Service selected border
pb = pb.replaceAll("border: selectedService?.id === s.id ? '2px solid #000' : '1px solid var(--border-color)'", "border: selectedService?.id === s.id ? '2px solid var(--accent-color)' : '1px solid var(--border-color)'");
pb = pb.replaceAll("background: 'white'", "background: 'var(--surface-color)'");
// Barber selected border
pb = pb.replace("border: selectedBarber?.id === b.id ? '2px solid #000' : '1px solid var(--border-color)'", "border: selectedBarber?.id === b.id ? '2px solid var(--accent-color)' : '1px solid var(--border-color)'");
// Avatar bg
pb = pb.replace("background: 'rgba(0,0,0,0.04)'", "background: 'var(--icon-bg)'");
// Header scissors icon
pb = pb.replace(/background: '#000', color: '#fff'/, "background: 'var(--accent-color)', color: 'var(--accent-text)'");
// Calendar link color #2563eb -> var(--accent-color)
pb = pb.replaceAll("#2563eb", "var(--accent-color)");
// Success colors (waitlist + confirmation)
pb = pb.replaceAll("background: '#ecfdf5', color: '#10b981'", "background: 'var(--brand-50)', color: 'var(--brand-600)'");
// Glass card modal
pb = pb.replaceAll("background: '#fff'", "background: 'var(--surface-color)'");
// Color #111
pb = pb.replace("color: '#111'", "color: 'var(--text-primary)'");
// Color #333
pb = pb.replace("color: '#333'", "color: 'var(--text-primary)'");
// Color #555
pb = pb.replaceAll("color: '#555'", "color: 'var(--text-secondary)'");
// Various grays
pb = pb.replaceAll("#9ca3af", "var(--text-secondary)");
pb = pb.replaceAll("#1f2937", "var(--text-primary)");
pb = pb.replaceAll("#e5e7eb", "var(--border-color)");
pb = pb.replaceAll("#f3f4f6", "var(--panel-bg)");
pb = pb.replaceAll("#f9fafb", "var(--panel-bg)");
fs.writeFileSync('src/pages/PublicBooking.jsx', pb, 'utf-8');
console.log('✅ PublicBooking.jsx patched');

// ── Dashboard.jsx ──
let dash = fs.readFileSync('src/pages/Dashboard.jsx', 'utf-8');
// barberColors array
dash = dash.replace(
  "const barberColors = ['#000', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0'];",
  "const barberColors = ['var(--brand-700)', 'var(--brand-600)', 'var(--brand-500)', 'var(--brand-400)', 'var(--brand-300)'];"
);
// Modal backgrounds
dash = dash.replaceAll("background: '#fff'", "background: 'var(--surface-color)'");
// #f8f9fa
dash = dash.replaceAll("#f8f9fa", "var(--panel-bg)");
// #10b981
dash = dash.replaceAll("color: '#10b981'", "color: 'var(--brand-600)'");
dash = dash.replaceAll("border: '1px solid rgba(16,185,129,0.15)', color: '#10b981'", "border: '1px solid var(--brand-200)', color: 'var(--brand-600)'");
dash = dash.replace("background: 'rgba(16,185,129,0.06)'", "background: 'var(--brand-50)'");
// #2563eb -> var(--accent-color)
dash = dash.replaceAll("#2563eb", "var(--accent-color)");
dash = dash.replace("background: 'rgba(37,99,235,0.06)'", "background: 'var(--brand-50)'");
dash = dash.replace("border: '1px solid rgba(37,99,235,0.15)'", "border: '1px solid var(--brand-200)'");
// rgba(0,0,0,0.05) in modal
dash = dash.replaceAll("background: 'rgba(0,0,0,0.05)'", "background: 'var(--icon-bg)'");
fs.writeFileSync('src/pages/Dashboard.jsx', dash, 'utf-8');
console.log('✅ Dashboard.jsx patched');

// ── Finance.jsx ──
let fin = fs.readFileSync('src/pages/Finance.jsx', 'utf-8');
// Tab buttons  #000 and #fff
fin = fin.replaceAll("background: selectedView === 'geral' ? '#000' : '#fff'", "background: selectedView === 'geral' ? 'var(--accent-color)' : 'var(--surface-color)'");
fin = fin.replaceAll("color: selectedView === 'geral' ? '#fff' : 'var(--text-primary)'", "color: selectedView === 'geral' ? 'var(--accent-text)' : 'var(--text-primary)'");
fin = fin.replaceAll("background: selectedView === 'barbershop' ? '#000' : '#fff'", "background: selectedView === 'barbershop' ? 'var(--accent-color)' : 'var(--surface-color)'");
fin = fin.replaceAll("color: selectedView === 'barbershop' ? '#fff' : 'var(--text-primary)'", "color: selectedView === 'barbershop' ? 'var(--accent-text)' : 'var(--text-primary)'");
fin = fin.replaceAll("background: selectedView === String(barber.id) ? '#000' : '#fff'", "background: selectedView === String(barber.id) ? 'var(--accent-color)' : 'var(--surface-color)'");
fin = fin.replaceAll("color: selectedView === String(barber.id) ? '#fff' : 'var(--text-primary)'", "color: selectedView === String(barber.id) ? 'var(--accent-text)' : 'var(--text-primary)'");
// KPI border-left colors
fin = fin.replace("borderLeft: '4px solid #000'", "borderLeft: '4px solid var(--accent-color)'");
fin = fin.replace("background: 'rgba(0,0,0,0.04)'", "background: 'var(--icon-bg)'");
// Blue → brand
fin = fin.replaceAll("'4px solid #2563eb'", "'4px solid var(--brand-600)'");
fin = fin.replaceAll("rgba(37,99,235,0.06)", "var(--brand-50)");
fin = fin.replaceAll("rgba(37,99,235,0.08)", "var(--brand-100)");
fin = fin.replaceAll("color: '#2563eb'", "color: 'var(--brand-600)'");
// Purple → brand-800
fin = fin.replaceAll("'4px solid #7c3aed'", "'4px solid var(--brand-800)'");
fin = fin.replaceAll("rgba(124,58,237,0.06)", "var(--brand-50)");
fin = fin.replaceAll("rgba(124,58,237,0.08)", "var(--brand-100)");
fin = fin.replaceAll("rgba(124,58,237,0.04)", "var(--brand-50)");
fin = fin.replaceAll("rgba(124,58,237,0.15)", "var(--brand-200)");
fin = fin.replaceAll("color: '#7c3aed'", "color: 'var(--brand-800)'");
// Green → brand-600
fin = fin.replaceAll("'4px solid #10b981'", "'4px solid var(--brand-500)'");
fin = fin.replaceAll("rgba(16, 185, 129, 0.02)", "var(--brand-50)");
fin = fin.replaceAll("rgba(16,185,129,0.1)", "var(--brand-100)");
fin = fin.replaceAll("color: '#10b981'", "color: 'var(--brand-600)'");
// Bar chart backgrounds
fin = fin.replaceAll("#f3f4f6", "var(--panel-bg)");
fin = fin.replaceAll("#f8f9fa", "var(--panel-bg)");
// Ranking bar
fin = fin.replace("background: idx === 0 ? '#000' : '#e5e7eb'", "background: idx === 0 ? 'var(--accent-color)' : 'var(--border-color)'");
// Service bar
fin = fin.replace("background: idx === 0 ? '#2563eb' : '#93c5fd'", "background: idx === 0 ? 'var(--brand-600)' : 'var(--brand-300)'");
// Date input bg
fin = fin.replace("background: '#fff'", "background: 'var(--surface-color)'");
// rgba(0,0,0,0.04) for badge
fin = fin.replaceAll("background: 'rgba(0,0,0,0.04)'", "background: 'var(--icon-bg)'");
// Payment method colors map
fin = fin.replace("'Pix': '#10b981'", "'Pix': 'var(--brand-500)'");
fin = fin.replace("'Cartão de Crédito': '#8b5cf6'", "'Cartão de Crédito': 'var(--brand-800)'");
fin = fin.replace("'Cartão de Débito': '#3b82f6'", "'Cartão de Débito': 'var(--brand-600)'");
fin = fin.replace("'Dinheiro': '#f59e0b'", "'Dinheiro': 'var(--brand-400)'");
fin = fin.replace("'Caixa Bar.]': '#ef4444'", "'Caixa Bar.]': 'var(--brand-900)'");
fin = fin.replace("'Outros': '#6b7280'", "'Outros': 'var(--text-secondary)'");
fin = fin.replace("methodColors[methodObj.method] || '#cbd5e1'", "methodColors[methodObj.method] || 'var(--brand-300)'");
fs.writeFileSync('src/pages/Finance.jsx', fin, 'utf-8');
console.log('✅ Finance.jsx patched');

// ── Scheduler.jsx ──
let sched = fs.readFileSync('src/pages/Scheduler.jsx', 'utf-8');
// Status colors map
sched = sched.replace("case 'Finalizado': return { bg: '#f0fdf4', border: '#bbf7d0', badge: '#10b981', label: 'Pago' };", "case 'Finalizado': return { bg: 'var(--brand-50)', border: 'var(--brand-200)', badge: 'var(--brand-600)', label: 'Pago' };");
sched = sched.replace("case 'Em progresso': return { bg: '#eff6ff', border: '#bfdbfe', badge: '#2563eb', label: 'Atd.' };", "case 'Em progresso': return { bg: 'var(--brand-100)', border: 'var(--brand-300)', badge: 'var(--brand-700)', label: 'Atd.' };");
sched = sched.replace("case 'Cancelado': return { bg: '#fef2f2', border: '#fecaca', badge: '#ef4444', label: 'Canc.' };", "case 'Cancelado': return { bg: '#fef2f2', border: '#fecaca', badge: '#ef4444', label: 'Canc.' };"); // keep red
sched = sched.replace("default: return { bg: '#fff', border: 'var(--border-color)', badge: '#e2e8f0', label: 'Ag' };", "default: return { bg: 'var(--panel-bg)', border: 'var(--border-color)', badge: 'var(--brand-200)', label: 'Ag' };");
// Barber filter ALL button
sched = sched.replace("background: selectedBarberId === 'all' ? '#000' : 'rgba(0,0,0,0.03)'", "background: selectedBarberId === 'all' ? 'var(--accent-color)' : 'var(--hover-bg)'");
sched = sched.replace("color: selectedBarberId === 'all' ? '#fff' : 'var(--text-secondary)'", "color: selectedBarberId === 'all' ? 'var(--accent-text)' : 'var(--text-secondary)'");
sched = sched.replace("border: selectedBarberId === 'all' ? '1px solid #000' : '1px solid var(--border-color)'", "border: selectedBarberId === 'all' ? '1px solid var(--accent-color)' : '1px solid var(--border-color)'");
// Barber filter individual buttons
sched = sched.replace("background: selectedBarberId === String(barber.id) ? '#fff' : 'rgba(0,0,0,0.02)'", "background: selectedBarberId === String(barber.id) ? 'var(--surface-color)' : 'var(--hover-bg)'");
sched = sched.replace("color: selectedBarberId === String(barber.id) ? '#2563eb' : 'var(--text-primary)'", "color: selectedBarberId === String(barber.id) ? 'var(--accent-color)' : 'var(--text-primary)'");
sched = sched.replace("border: selectedBarberId === String(barber.id) ? '1px solid #bfdbfe' : '1px solid var(--border-color)'", "border: selectedBarberId === String(barber.id) ? '1px solid var(--brand-300)' : '1px solid var(--border-color)'");
sched = sched.replace("boxShadow: selectedBarberId === String(barber.id) ? '0 4px 6px rgba(37, 99, 235, 0.05)' : 'none'", "boxShadow: selectedBarberId === String(barber.id) ? '0 4px 6px rgba(102, 153, 0, 0.1)' : 'none'");
sched = sched.replace("background: selectedBarberId === String(barber.id) ? '#2563eb' : '#e2e8f0', color: selectedBarberId === String(barber.id) ? '#fff' : '#64748b'", "background: selectedBarberId === String(barber.id) ? 'var(--accent-color)' : 'var(--icon-bg)', color: selectedBarberId === String(barber.id) ? 'var(--accent-text)' : 'var(--text-secondary)'");
// Day header today highlight
sched = sched.replaceAll("rgba(37, 99, 235, 0.03)", "var(--brand-50)");
sched = sched.replace("color: isToday ? '#2563eb' : 'var(--text-secondary)'", "color: isToday ? 'var(--accent-color)' : 'var(--text-secondary)'");
sched = sched.replace("color: isToday ? '#2563eb' : 'inherit'", "color: isToday ? 'var(--accent-color)' : 'inherit'");
// Grid cell #fff backgrounds
sched = sched.replaceAll("background: '#fff'", "background: 'var(--surface-color)'");
sched = sched.replace("background: '#fff', zIndex: 30", "background: 'var(--surface-color)', zIndex: 30");
// Hover visible dashed border
sched = sched.replace("#cbd5e1", "var(--border-color)");
sched = sched.replace("#94a3b8", "var(--text-secondary)");
// Card color: '#000'
sched = sched.replace("color: '#000'", "color: 'var(--text-primary)'");
// Border #fff for circles
sched = sched.replace("border: '2px solid #fff'", "border: '2px solid var(--surface-color)'");
// Modal backgrounds
sched = sched.replace("{ padding: '1rem', background: '#f8f9fa'", "{ padding: '1rem', background: 'var(--panel-bg)'");
sched = sched.replaceAll("color: '#10b981'", "color: 'var(--brand-600)'");
// Action modal blue buttons
sched = sched.replaceAll("rgba(37,99,235,0.06)", "var(--brand-50)");
sched = sched.replaceAll("rgba(37,99,235,0.15)", "var(--brand-200)");
sched = sched.replaceAll("rgba(37,99,235,0.1)", "var(--brand-100)");
sched = sched.replaceAll("color: '#2563eb'", "color: 'var(--brand-700)'");
// Green action
sched = sched.replaceAll("rgba(16,185,129,0.06)", "var(--brand-50)");
sched = sched.replaceAll("rgba(16,185,129,0.15)", "var(--brand-200)");
sched = sched.replaceAll("color: '#10b981'", "color: 'var(--brand-600)'");
// Modal bg #f8f9fa
sched = sched.replaceAll("background: '#f8f9fa'", "background: 'var(--panel-bg)'");
// rgba(0,0,0,0.08) border
sched = sched.replace("border: '1px solid rgba(0,0,0,0.08)'", "border: '1px solid var(--border-color)'");
fs.writeFileSync('src/pages/Scheduler.jsx', sched, 'utf-8');
console.log('✅ Scheduler.jsx patched');

// ── Users.jsx ──
let users = fs.readFileSync('src/pages/Users.jsx', 'utf-8');
users = users.replaceAll("background: '#10b981'", "background: 'var(--brand-500)'");
users = users.replaceAll("color: '#10b981'", "color: 'var(--brand-600)'");
users = users.replaceAll("rgba(16, 185, 129, 0.2)", "var(--brand-200)");
// Toggle switch
users = users.replace("background: isEnabled ? '#000' : '#e5e7eb'", "background: isEnabled ? 'var(--accent-color)' : 'var(--border-color)'");
users = users.replace("background: '#fff'", "background: 'var(--bg-color)'");
fs.writeFileSync('src/pages/Users.jsx', users, 'utf-8');
console.log('✅ Users.jsx patched');

// ── Settings.jsx ──
let settings = fs.readFileSync('src/pages/Settings.jsx', 'utf-8');
// Sidebar tab buttons
settings = settings.replaceAll("background: activeTab === 'barbers' ? '#000' : 'transparent', color: activeTab === 'barbers' ? '#fff'", "background: activeTab === 'barbers' ? 'var(--accent-color)' : 'transparent', color: activeTab === 'barbers' ? 'var(--accent-text)'");
settings = settings.replaceAll("background: activeTab === 'services' ? '#000' : 'transparent', color: activeTab === 'services' ? '#fff'", "background: activeTab === 'services' ? 'var(--accent-color)' : 'transparent', color: activeTab === 'services' ? 'var(--accent-text)'");
settings = settings.replaceAll("background: activeTab === 'products' ? '#000' : 'transparent', color: activeTab === 'products' ? '#fff'", "background: activeTab === 'products' ? 'var(--accent-color)' : 'transparent', color: activeTab === 'products' ? 'var(--accent-text)'");
settings = settings.replaceAll("background: activeTab === 'business' ? '#000' : 'transparent', color: activeTab === 'business' ? '#fff'", "background: activeTab === 'business' ? 'var(--accent-color)' : 'transparent', color: activeTab === 'business' ? 'var(--accent-text)'");
// Barber avatar in list
settings = settings.replace("background: '#000', color: '#fff'", "background: 'var(--accent-color)', color: 'var(--accent-text)'");
// Editing state blue -> brand
settings = settings.replaceAll("#bfdbfe", "var(--brand-200)");
settings = settings.replaceAll("rgba(37, 99, 235, 0.05)", "var(--brand-50)");
settings = settings.replace("background: editingBarberId ? '#2563eb' : '#000'", "background: editingBarberId ? 'var(--brand-600)' : 'var(--accent-color)'");
settings = settings.replace("background: '#bfdbfe', color: '#1e40af'", "background: 'var(--brand-200)', color: 'var(--brand-900)'");
// Product price color
settings = settings.replace("color: '#10b981'", "color: 'var(--brand-600)'");
fs.writeFileSync('src/pages/Settings.jsx', settings, 'utf-8');
console.log('✅ Settings.jsx patched');

// ── Clients.jsx ──  
let clients = fs.readFileSync('src/pages/Clients.jsx', 'utf-8');
// Status badge colors
clients = clients.replace("background: client.status === 'Ativo' ? '#ecfdf5' : client.status === 'Inativo' ? '#fef2f2' : '#f9fafb'", "background: client.status === 'Ativo' ? 'var(--brand-50)' : client.status === 'Inativo' ? '#fef2f2' : 'var(--panel-bg)'");
clients = clients.replace("color: client.status === 'Ativo' ? '#059669' : client.status === 'Inativo' ? '#dc2626' : '#6b7280'", "color: client.status === 'Ativo' ? 'var(--brand-700)' : client.status === 'Inativo' ? '#dc2626' : 'var(--text-secondary)'");
fs.writeFileSync('src/pages/Clients.jsx', clients, 'utf-8');
console.log('✅ Clients.jsx patched');

console.log('\n🎉 All files refactored to green brand palette!');
