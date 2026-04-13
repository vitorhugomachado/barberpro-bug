import React, { useState, useEffect } from 'react';
import { User, Calendar, History, Settings, LogOut, ChevronRight, Clock, MapPin, Phone, Mail } from 'lucide-react';
import { useApp } from '../context/AppContext';

const CustomerPortal = ({ onBack }) => {
  const { currentCustomer, customerLogout, getCustomerAppointments, updateCustomerProfile, cancelAppointment } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState({ name: '', email: '', phone: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (activeTab === 'history' || activeTab === 'overview') {
      loadAppointments();
    }
  }, [activeTab]);

  useEffect(() => {
    if (currentCustomer) {
      setEditData({
        name: currentCustomer.name || '',
        email: currentCustomer.email || '',
        phone: currentCustomer.phone || ''
      });
    }
  }, [currentCustomer]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await getCustomerAppointments();
      setAppointments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
      try {
        await cancelAppointment(id);
        loadAppointments(); // Refresh list
      } catch (error) {
        alert('Erro ao cancelar agendamento: ' + error.message);
      }
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    try {
      await updateCustomerProfile(editData);
      setMsg({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    } catch (error) {
      setMsg({ type: 'error', text: error.message });
    }
  };

  const handleLogout = () => {
    customerLogout();
    onBack();
  };

  const upcoming = appointments.filter(a => a.status === 'Agendado')[0];
  const history = appointments.filter(a => a.status !== 'Agendado');

  const renderOverview = () => (
    <div className="fade-in">
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ background: 'var(--brand-500)', color: 'white', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700 }}>
          {currentCustomer?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Olá, {currentCustomer?.name?.split(' ')[0]}!</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0' }}>Bem-vindo à sua área exclusiva.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} style={{ color: 'var(--brand-500)' }} /> Próximo Agendamento
          </h3>
          {upcoming ? (
            <div style={{ background: 'var(--brand-50)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--brand-100)' }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>{upcoming.service}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {upcoming.date.split('-').reverse().join('/')}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {upcoming.time}</span>
              </div>
              <div style={{ marginTop: '8px', fontSize: '0.9rem' }}>
                Profissional: <span style={{ fontWeight: 600 }}>{upcoming.barber?.name}</span>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Você não possui agendamentos futuros.
            </div>
          )}
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={18} style={{ color: 'var(--brand-500)' }} /> Resumo
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--surface-color)', borderRadius: '12px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--brand-600)' }}>{appointments.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--surface-color)', borderRadius: '12px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--brand-600)' }}>{history.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Finalizados</div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '2rem', marginTop: '2rem', textAlign: 'center' }}>
        <h3 style={{ marginBottom: '1rem' }}>Precisa de um novo serviço?</h3>
        <button 
          className="btn-primary" 
          onClick={onBack}
          style={{ width: 'auto', padding: '12px 30px' }}
        >
          Agendar Novo Serviço
        </button>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="fade-in">
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Histórico de Serviços</h2>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Carregando dados...</div>
      ) : appointments.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Nenhum agendamento encontrado no seu histórico.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {appointments.map(a => (
            <div key={a.id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '4px' }}>{a.service}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                   <span>{a.date?.split('-').reverse().join('/') || a.date} às {a.time}</span>
                   <span>•</span>
                   <span>Profissional: {a.barber?.name || 'Não informado'}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>R$ {a.price.toFixed(2)}</div>
                <div style={{ 
                  fontSize: '0.7rem', 
                  fontWeight: 700, 
                  textTransform: 'uppercase',
                  marginTop: '4px',
                  color: a.status === 'Agendado' ? 'var(--brand-600)' : (a.status === 'Finalizado' ? 'var(--success-color, #10b981)' : 'var(--error-color, #ef4444)')
                }}>
                  {a.status}
                </div>
                {a.status === 'Agendado' && (
                  <button 
                    onClick={() => handleCancel(a.id)}
                    style={{ 
                      marginTop: '8px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--error-color, #ef4444)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: '4px 0',
                      textDecoration: 'underline'
                    }}
                  >
                    Desistir / Cancelar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="fade-in">
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Meus Dados</h2>
      <div className="glass-card" style={{ padding: '2rem', maxWidth: '600px' }}>
        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {msg.text && (
            <div style={{ 
              padding: '12px', 
              borderRadius: '8px', 
              background: msg.type === 'success' ? '#d1fae5' : '#fee2e2',
              color: msg.type === 'success' ? '#065f46' : '#991b1b',
              fontSize: '0.9rem',
              fontWeight: 600
            }}>
              {msg.text}
            </div>
          )}
          
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Nome Completo</label>
            <input 
              type="text" 
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}
              value={editData.name}
              onChange={e => setEditData({...editData, name: e.target.value})}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>E-mail</label>
              <input 
                type="email" 
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', background: 'rgba(0,0,0,0.02)' }}
                value={editData.email}
                disabled
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Telefone</label>
              <input 
                type="text" 
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}
                value={editData.phone}
                onChange={e => setEditData({...editData, phone: e.target.value})}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Salvar Alterações</button>
        </form>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', padding: '2rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <button 
              onClick={onBack}
              style={{ background: 'none', border: 'none', color: 'var(--brand-600)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              ← Voltar para Agendamento
            </button>
          </div>
          <button 
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--error-color, #ef4444)', fontWeight: 600, cursor: 'pointer' }}
          >
            <LogOut size={18} /> Sair
          </button>
        </div>

        <div style={{ display: 'flex', gap: '2rem' }}>
          {/* Sidebar */}
          <div style={{ width: '250px', flexShrink: 0 }}>
            <div className="glass-card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button 
                onClick={() => setActiveTab('overview')}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '10px', 
                  width: '100%', padding: '12px 15px', borderRadius: '10px', 
                  border: 'none', textAlign: 'left', cursor: 'pointer',
                  background: activeTab === 'overview' ? 'var(--brand-50)' : 'transparent',
                  color: activeTab === 'overview' ? 'var(--brand-700)' : 'var(--text-secondary)',
                  fontWeight: activeTab === 'overview' ? 700 : 500,
                  transition: 'all 0.2s'
                }}
              >
                <User size={18} /> Início
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '10px', 
                  width: '100%', padding: '12px 15px', borderRadius: '10px', 
                  border: 'none', textAlign: 'left', cursor: 'pointer',
                  background: activeTab === 'history' ? 'var(--brand-50)' : 'transparent',
                  color: activeTab === 'history' ? 'var(--brand-700)' : 'var(--text-secondary)',
                  fontWeight: activeTab === 'history' ? 700 : 500,
                  transition: 'all 0.2s'
                }}
              >
                <Calendar size={18} /> Agendamentos
              </button>
              <button 
                onClick={() => setActiveTab('profile')}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '10px', 
                  width: '100%', padding: '12px 15px', borderRadius: '10px', 
                  border: 'none', textAlign: 'left', cursor: 'pointer',
                  background: activeTab === 'profile' ? 'var(--brand-50)' : 'transparent',
                  color: activeTab === 'profile' ? 'var(--brand-700)' : 'var(--text-secondary)',
                  fontWeight: activeTab === 'profile' ? 700 : 500,
                  transition: 'all 0.2s'
                }}
              >
                <Settings size={18} /> Meus Dados
              </button>
            </div>
          </div>

          {/* Content */}
          <div style={{ flexGrow: 1 }}>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'history' && renderHistory()}
            {activeTab === 'profile' && renderProfile()}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CustomerPortal;
