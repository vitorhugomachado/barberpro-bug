import { LayoutDashboard, Calendar, Users, Settings, LogOut, Scissors, DollarSign, Shield } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, user }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard /> },
    { id: 'scheduler', label: 'Agendamentos', icon: <Calendar /> },
    { id: 'clients', label: 'Clientes', icon: <Users /> },
    { id: 'finance', label: 'Financeiro', icon: <DollarSign /> },
    { id: 'users', label: 'Usuários', icon: <Shield /> },
    { id: 'settings', label: 'Configurações', icon: <Settings /> },
  ];

  return (
    <div className="sidebar">
      <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3rem' }}>
        <div style={{ background: '#000', color: '#fff', padding: '8px', borderRadius: '12px' }}>
          <Scissors size={24} />
        </div>
        <h2 className="brand-font" style={{ fontSize: '1.25rem', letterSpacing: '-0.5px' }}>BARBERPRO</h2>
      </div>

      <nav style={{ flex: 1 }}>
        {menuItems
          .filter(item => user?.permissions?.includes(item.id) || (item.id === 'settings' && user?.role === 'Gerente'))
          .map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab(item.id);
            }}
          >
            {item.icon}
            <span style={{ fontWeight: 500 }}>{item.label}</span>
          </a>
        ))}
      </nav>

      <div className="sidebar-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
        <a href="#logout" className="nav-item">
          <LogOut />
          <span style={{ fontWeight: 500 }}>Sair</span>
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
