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
        <div style={{ background: 'var(--accent-color)', color: 'var(--accent-text)', padding: '8px', borderRadius: '12px' }}>
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

      <div className="sidebar-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', background: 'var(--icon-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {user?.foto_perfil ? (
              <img src={user.foto_perfil} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontWeight: 700, fontSize: '0.75rem' }}>{user?.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: 0 }}>{user?.role}</p>
          </div>
        </div>
        <a href="#logout" className="nav-item" style={{ marginBottom: 0 }}>
          <LogOut />
          <span style={{ fontWeight: 500 }}>Sair</span>
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
