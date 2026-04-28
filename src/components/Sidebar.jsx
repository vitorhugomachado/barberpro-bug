import { LayoutDashboard, Calendar, Users, Settings, LogOut, Scissors, DollarSign, Shield, Menu, X } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, user, isCollapsed, setIsCollapsed }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard /> },
    { id: 'scheduler', label: 'Agendamentos', icon: <Calendar /> },
    { id: 'clients', label: 'Clientes', icon: <Users /> },
    { id: 'finance', label: 'Financeiro', icon: <DollarSign /> },
    { id: 'users', label: 'Usuários', icon: <Shield /> },
    { id: 'settings', label: 'Configurações', icon: <Settings /> },
  ];

  return (
    <div 
      className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}
      onMouseEnter={() => window.innerWidth > 768 && setIsCollapsed(false)}
      onMouseLeave={() => window.innerWidth > 768 && setIsCollapsed(true)}
    >
      <div className="brand" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="sloot-logo-text" style={{ fontSize: '1.8rem', paddingTop: '4px' }}>
            {isCollapsed ? 'S' : 'SLOOT'}
          </span>
        </div>
        
        {/* Toggle Controls */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button className="hamburger-btn desktop-only" onClick={() => setIsCollapsed(!isCollapsed)} title={isCollapsed ? "Expandir" : "Recolher"}>
            <Menu size={20} />
          </button>
          <button className="hamburger-btn mobile-only" onClick={() => setIsCollapsed(false)} style={{ display: 'none' }}>
            <X size={20} />
          </button>
        </div>
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
              if (window.innerWidth <= 768) setIsCollapsed(false);
            }}
          >
            {item.icon}
            <span className="nav-item-label" style={{ fontWeight: 500 }}>{item.label}</span>
          </a>
        ))}
      </nav>

    </div>
  );
};

export default Sidebar;
