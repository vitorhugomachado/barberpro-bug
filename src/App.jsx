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
  const { barbers } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userId, setUserId] = useState(null);
  const [viewMode, setViewMode] = useState('public');
  
  const currentUser = barbers.find(b => b.id === userId);

  const handleLogin = (emailToLogin, pwd) => {
    const foundUser = barbers.find(b => b.email === emailToLogin);
    if (!foundUser) {
      alert("Erro: Este e-mail não pertence a nenhum usuário cadastrado no sistema.");
      return;
    }
    if (foundUser.password !== pwd) {
      alert("Acesso Negado: Senha incorreta.");
      return;
    }
    if (foundUser.status === 'Suspenso') {
      alert("ACESSO NEGADO: Sua conta está atualmente suspensa pelo Administrador.");
      return;
    }
    setUserId(foundUser.id);
    setViewMode('admin');
  };

  const handleLogout = () => {
    setUserId(null);
    setViewMode('public');
  };

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
