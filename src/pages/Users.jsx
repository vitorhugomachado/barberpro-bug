import React, { useState } from 'react';
import { UserPlus, Shield, Mail, Check, X, ShieldCheck, LayoutDashboard, Calendar, Users as UsersIcon, DollarSign, MoreVertical } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Users = () => {
  const { barbers, updateBarberPermissions, toggleBarberStatus } = useApp();
  const [selectedUser, setSelectedUser] = useState(null);

  const modules = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'scheduler', label: 'Agenda', icon: <Calendar size={18} /> },
    { id: 'clients', label: 'CRM / Clientes', icon: <UsersIcon size={18} /> },
    { id: 'finance', label: 'Financeiro / IA', icon: <DollarSign size={18} /> },
    { id: 'users', label: 'Gestão de Usuários', icon: <Shield size={18} /> },
  ];

  const togglePermission = (userId, moduleId) => {
    const user = barbers.find(u => u.id === userId);
    if (!user) return;
    const hasPerm = user.permissions.includes(moduleId);
    const newPerms = hasPerm 
      ? user.permissions.filter(p => p !== moduleId) 
      : [...user.permissions, moduleId];
    
    updateBarberPermissions(userId, newPerms);
    if (selectedUser?.id === userId) {
      setSelectedUser({ ...user, permissions: newPerms });
    }
  };

  return (
    <div className="fade-in">
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Controle de Acesso</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Gerencie sua equipe e defina o que cada um pode visualizar.</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
        {/* User List */}
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'rgba(0,0,0,0.01)' }}>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '16px 1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>USUÁRIO</th>
                <th style={{ padding: '16px 0', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CARGO</th>
                <th style={{ padding: '16px 0', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>STATUS</th>
                <th style={{ padding: '16px 1.5rem', textAlign: 'right' }}>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {barbers.map((user) => (
                <tr 
                  key={user.id} 
                  style={{ 
                    borderBottom: '1px solid var(--border-color)', 
                    cursor: 'pointer',
                    background: selectedUser?.id === user.id ? 'rgba(0,0,0,0.01)' : 'transparent'
                  }}
                  onClick={() => setSelectedUser(user)}
                >
                  <td style={{ padding: '16px 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', background: 'var(--icon-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {user.foto_perfil ? (
                          <img src={user.foto_perfil} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>{user.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 0' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{user.role}</span>
                  </td>
                  <td style={{ padding: '16px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '6px', height: '6px', background: 'var(--brand-500)', borderRadius: '50%' }}></div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--brand-600)', fontWeight: 600 }}>{user.status}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 1.5rem', textAlign: 'right' }}>
                    <MoreVertical size={18} style={{ color: 'var(--text-secondary)' }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Permissions Panel */}
        <div>
          {selectedUser ? (
            <div className="glass-card" style={{ position: 'sticky', top: '2rem' }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                  <ShieldCheck size={24} />
                  <h3 style={{ fontSize: '1.1rem' }}>Permissões de Acesso</h3>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Configurações para <strong>{selectedUser.name}</strong>. As alterações são aplicadas instantaneamente.
                </p>
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                {modules.map((module) => {
                  const isEnabled = selectedUser.permissions.includes(module.id);
                  return (
                    <div 
                      key={module.id}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        padding: '12px', 
                        borderRadius: '12px',
                        background: isEnabled ? 'rgba(0,0,0,0.02)' : 'transparent',
                        border: '1px solid',
                        borderColor: isEnabled ? 'rgba(0,0,0,0.05)' : 'transparent',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ opacity: isEnabled ? 1 : 0.4 }}>{module.icon}</div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 500, opacity: isEnabled ? 1 : 0.5 }}>{module.label}</span>
                      </div>
                      <div 
                        onClick={() => togglePermission(selectedUser.id, module.id)}
                        style={{ 
                          width: '40px', 
                          height: '22px', 
                          background: isEnabled ? 'var(--accent-color)' : 'var(--border-color)', 
                          borderRadius: '11px', 
                          position: 'relative', 
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ 
                          width: '16px', 
                          height: '16px', 
                          background: 'var(--bg-color)', 
                          borderRadius: '50%', 
                          position: 'absolute', 
                          top: '3px', 
                          left: isEnabled ? '21px' : '3px',
                          transition: 'all 0.2s'
                        }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
                <button 
                  className="btn-secondary" 
                  style={{ width: '100%', color: selectedUser.status === 'Ativo' ? '#ef4444' : '#10b981', borderColor: selectedUser.status === 'Ativo' ? 'rgba(239, 68, 68, 0.2)' : 'var(--brand-200)' }}
                  onClick={() => {
                    toggleBarberStatus(selectedUser.id);
                    setSelectedUser({ ...selectedUser, status: selectedUser.status === 'Ativo' ? 'Suspenso' : 'Ativo' });
                  }}
                >
                  {selectedUser.status === 'Ativo' ? 'Suspender Usuário' : 'Reativar Usuário'}
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', opacity: 0.6 }}>
              <Shield size={40} style={{ marginBottom: '1.5rem', margin: '0 auto' }} />
              <p style={{ fontSize: '0.9rem' }}>Selecione um usuário para gerenciar suas permissões.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;
