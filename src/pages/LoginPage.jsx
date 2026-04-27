import React, { useState } from 'react';
import { Scissors, Mail, Lock, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

const LoginPage = ({ onLogin }) => {
  const { businessInfo } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'var(--bg-color)',
      padding: '2rem'
    }}>
      <div className="glass-card fade-in" style={{ width: '100%', maxWidth: '400px', padding: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          {businessInfo && businessInfo.logo_url ? (
            <img src={businessInfo.logo_url} alt="Logo" style={{ maxHeight: '80px', maxWidth: '100%', marginBottom: '1.5rem', borderRadius: '12px' }} />
          ) : (
            <div style={{ marginBottom: '1.5rem' }}>
              <span className="sloot-logo-text" style={{ fontSize: '3.5rem' }}>SLOOT</span>
            </div>
          )}
          <h1 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '8px' }}>{(businessInfo && businessInfo.name) || 'Acesso Administrativo'}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Acesse sua conta para gerenciar seu negócio.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>E-mail</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="email" 
                required
                placeholder="seu@contato.com"
                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.9rem' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Senha</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="password" 
                required
                placeholder="••••••••"
                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.9rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            Entrar <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Esqueceu sua senha? <span style={{ color: 'var(--accent-color)', fontWeight: 600, cursor: 'pointer' }}>Recuperar</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
