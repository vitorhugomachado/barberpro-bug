import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Scheduler from './pages/Scheduler';
import LoginPage from './pages/LoginPage';
import PublicBooking from './pages/PublicBooking';
import Finance from './pages/Finance';
import Users from './pages/Users';
import Settings from './pages/Settings';

import { useApp } from './context/AppContext';

function App() {
  const { barbers, loading, login, logout, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState('public');

  const handleLogin = async (emailToLogin, pwd) => {
    try {
      await login(emailToLogin, pwd);
      console.log('Login successful');
      setViewMode('admin');
    } catch (error) {
      alert(error.message || "Erro ao realizar login.");
    }
  };

  const handleLogout = () => {
    logout();
    setViewMode('public');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '20px' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(0,0,0,0.1)', borderTop: '4px solid #000', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ fontWeight: 500 }}>Carregando BarberPro...</p>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (viewMode === 'public') {
    return (
      <>
        <PublicBooking />
        <button 
          onClick={() => setViewMode('login')} 
          style={{ 
            position: 'fixed', 
            bottom: '20px', 
            right: '20px', 
            background: '#000', 
            color: '#fff', 
            padding: '10px 20px', 
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          Área do Profissional
        </button>
      </>
    );
  }

  if (viewMode === 'login') {
    return <LoginPage onLogin={handleLogin} />;
  }

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

  if (!currentUser) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '20px' }}>
        <p>Carregando perfil do usuário...</p>
        <button className="btn-secondary" onClick={handleLogout}>Voltar ao Início</button>
      </div>
    );
  }

  return (
    <div className="layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={currentUser} />
      <main className="main-content">
        <header style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '20px', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', background: '#000', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600 }}>
              {currentUser?.name?.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, textTransform: 'capitalize' }}>{currentUser?.name} ({currentUser?.role})</span>
          </div>
          <button className="btn-secondary" onClick={handleLogout} style={{ fontSize: '0.8rem' }}>Sair</button>
        </header>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
