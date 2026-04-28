import React, { useState } from 'react';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { useApp } from '../context/AppContext';

const LoginPage = ({ onLogin }) => {
  const { businessInfo } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onLogin(email, password);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="staff-login-page">
      <section className="staff-login-side-art" aria-hidden="true">
        <div className="staff-login-stripes"></div>
      </section>

      <section className="staff-login-panel">
        <div className="staff-login-card fade-in">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            {businessInfo?.logo_url ? (
              <img src={businessInfo.logo_url} alt="Logo" style={{ maxHeight: '72px', maxWidth: '100%', marginBottom: '1rem', borderRadius: '10px' }} />
            ) : null}
            <div style={{ marginBottom: '0.4rem' }}>
              <span className="sloot-logo-text staff-login-brand" aria-label="SLOOT">
                <span className="staff-login-letter">S</span>
                <span className="staff-login-letter">L</span>
                <span className="staff-login-letter">O</span>
                <span className="staff-login-letter">O</span>
                <span className="staff-login-letter">T</span>
              </span>
            </div>
            <h1 className="staff-login-title" aria-label="Bem vindo!">
              <span className="staff-login-title-letter">B</span>
              <span className="staff-login-title-letter">e</span>
              <span className="staff-login-title-letter">m</span>
              <span className="staff-login-title-letter">&nbsp;</span>
              <span className="staff-login-title-letter">v</span>
              <span className="staff-login-title-letter">i</span>
              <span className="staff-login-title-letter">n</span>
              <span className="staff-login-title-letter">d</span>
              <span className="staff-login-title-letter">o</span>
              <span className="staff-login-title-letter">!</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>Acesso para barbeiros e profissionais da barbearia.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <Mail size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="email"
                required
                placeholder="name@email.com"
                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.92rem' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="password"
                required
                placeholder="Password"
                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.92rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '13px',
                marginTop: '0.4rem',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: isSubmitting ? 0.8 : 1
              }}
            >
              {isSubmitting ? 'Entrando...' : 'Sign in'} <ArrowRight size={16} />
            </button>
          </form>

        </div>
      </section>
    </div>
  );
};

export default LoginPage;
