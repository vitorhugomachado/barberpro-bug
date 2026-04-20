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
    <div className={`sidebar ${isCollapsed ? 'collapsed active' : ''}`}>
      <div className="brand" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'var(--accent-color)', color: 'var(--accent-text)', padding: '8px', borderRadius: '12px', flexShrink: 0 }}>
            <Scissors size={24} />
          </div>
          <h2 className="brand-font brand-name" style={{ fontSize: '1.25rem', letterSpacing: '-0.5px' }}>BARBERPRO</h2>
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

      <div className="sidebar-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', background: 'var(--icon-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {user?.foto_perfil ? (
              <img src={user.foto_perfil} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontWeight: 700, fontSize: '0.75rem' }}>{user?.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="sidebar-footer-detail" style={{ minWidth: 0 }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: 0 }}>{user?.role}</p>
          </div>
        </div>
        <a href="#logout" className="nav-item" style={{ marginBottom: 0 }}>
          <LogOut />
          <span className="nav-item-label" style={{ fontWeight: 500 }}>Sair</span>
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
