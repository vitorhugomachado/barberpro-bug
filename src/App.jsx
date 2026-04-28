import React, { useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Scheduler from './pages/Scheduler';
import LoginPage from './pages/LoginPage';
import PublicBooking from './pages/PublicBooking';
import Finance from './pages/Finance';
import Users from './pages/Users';
import Settings from './pages/Settings';
import CustomerPortal from './pages/CustomerPortal';

import { useApp } from './context/AppContext';
import { Menu } from 'lucide-react';

const VALID_TABS = ['dashboard', 'clients', 'scheduler', 'finance', 'users', 'settings'];

const StaffRoute = ({ children }) => {
  const { currentUser, loading } = useApp();

  if (loading) return null;
  if (!currentUser) return <Navigate to="/barbeiros/login" replace />;
  return children;
};

const CustomerRoute = ({ children }) => {
  const { currentCustomer, loading } = useApp();

  if (loading) return null;
  if (!currentCustomer) return <Navigate to="/cliente" replace />;
  return children;
};

const StaffLoginPage = () => {
  const { login, currentUser } = useApp();
  const navigate = useNavigate();

  if (currentUser) {
    return <Navigate to="/barbeiros" replace />;
  }

  const handleLogin = async (emailToLogin, pwd) => {
    try {
      const userData = await login(emailToLogin, pwd);
      if (userData?.role === 'Barbeiro') navigate('/barbeiros/scheduler', { replace: true });
      else navigate('/barbeiros', { replace: true });
    } catch (error) {
      alert(error.message || 'Erro ao realizar login.');
    }
  };

  return <LoginPage onLogin={handleLogin} />;
};

const CustomerArea = () => {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={<PublicBooking onOpenPortal={() => navigate('/cliente/portal')} />} />
      <Route
        path="/portal"
        element={(
          <CustomerRoute>
            <CustomerPortal onBack={() => navigate('/cliente')} />
          </CustomerRoute>
        )}
      />
      <Route path="*" element={<Navigate to="/cliente" replace />} />
    </Routes>
  );
};

const StaffArea = () => {
  const { loading, logout, currentUser } = useApp();
  const { tab } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const activeTab = tab && VALID_TABS.includes(tab) ? tab : 'dashboard';

  const handleLogout = () => {
    logout();
    navigate('/barbeiros/login', { replace: true });
  };

  const setActiveTab = (nextTab) => {
    if (nextTab === 'dashboard') navigate('/barbeiros');
    else navigate(`/barbeiros/${nextTab}`);
  };

  React.useEffect(() => {
    if (location.pathname === '/barbeiros' && currentUser?.role === 'Barbeiro') {
      navigate('/barbeiros/scheduler', { replace: true });
    }
  }, [location.pathname, currentUser, navigate]);

  React.useEffect(() => {
    if (tab && !VALID_TABS.includes(tab)) {
      navigate('/barbeiros', { replace: true });
    }
  }, [tab, navigate]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'clients':
        return <Clients />;
      case 'scheduler':
        return <Scheduler />;
      case 'finance':
        return <Finance />;
      case 'users':
        return <Users />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <StaffRoute>
      <div className="layout">
        {/* Mobile Header */}
        <div className="mobile-header">
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} style={{ background: 'none', padding: 0 }}>
            <Menu size={24} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="sloot-logo-text" style={{ fontSize: '1.2rem', paddingTop: '2px' }}>SLOOT</span>
          </div>
          <div style={{ width: '24px' }}></div> {/* Spacer */}
        </div>

        {/* Sidebar Overlay */}
        <div
          className={`sidebar-overlay ${isSidebarCollapsed ? 'active' : ''}`}
          onClick={() => setIsSidebarCollapsed(false)}
        ></div>

        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={currentUser}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
        <main className={`main-content ${isSidebarCollapsed ? 'expanded' : ''}`}>
          <header className="desktop-only" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '20px', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', background: 'var(--accent-color)', color: 'var(--accent-text, #fff)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600 }}>
                {currentUser?.name?.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, textTransform: 'capitalize' }}>{currentUser?.name} ({currentUser?.role})</span>
            </div>
            <button onClick={toggleTheme} className="dash-icon-btn" style={{ fontSize: '1.2rem' }} title="Alternar Tema">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button className="btn-secondary" onClick={handleLogout} style={{ fontSize: '0.8rem' }}>Sair</button>
          </header>
          {renderContent()}
        </main>
      </div>
    </StaffRoute>
  );
};

function App() {
  const { loading } = useApp();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '20px' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(0,0,0,0.1)', borderTop: '4px solid var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ fontWeight: 500 }}>Carregando Sloot...</p>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/cliente" replace />} />
      <Route path="/cliente/*" element={<CustomerArea />} />
      <Route path="/barbeiros/login" element={<StaffLoginPage />} />
      <Route path="/barbeiros/:tab?" element={<StaffArea />} />
      <Route path="*" element={<Navigate to="/cliente" replace />} />
    </Routes>
  );
}

export default App;
