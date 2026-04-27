import React, { useState, useRef, useEffect } from 'react';
import { Scissors, Calendar, Clock, Check, ChevronRight, User, Phone, Bell, LogIn } from 'lucide-react';
import { useApp } from '../context/AppContext';

const PublicBooking = ({ onOpenPortal }) => {
  const { barbers, services, appointments, addAppointment, businessInfo, 
    currentCustomer, customerLogin, customerRegister, customerLogout } = useApp();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [clientInfo, setClientInfo] = useState({ name: '', phone: '' });
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState(false);

  useEffect(() => {
    console.log("PublicBooking Rendered. Step:", step, "Customer:", !!currentCustomer);
  }, [step, currentCustomer]);

  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authData, setAuthData] = useState({ email: '', password: '', name: '', phone: '' });
  const [authError, setAuthError] = useState('');

  const dateInputRef = useRef(null);

  const renderProgressBar = () => (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '3rem' }}>
      {[1, 2, 3, 4, 5].map(s => (
        <div key={s} style={{ 
          height: '4px', 
          width: '40px', 
          borderRadius: '2px', 
          background: step >= s ? 'var(--accent-color)' : 'var(--border-color)',
          transition: 'all 0.3s ease'
        }}></div>
      ))}
    </div>
  );

  const handleFinishBooking = () => {
    const finalName = currentCustomer ? currentCustomer.name : clientInfo.name;
    const finalPhone = currentCustomer ? currentCustomer.phone : clientInfo.phone;
    
    const payload = {
      customer: finalName,
      phone: finalPhone,
      service: selectedService.name,
      barberId: selectedBarber.id,
      date: selectedDate,
      time: selectedTime,
      status: 'Agendado',
      price: selectedService.price,
      customerId: currentCustomer ? Number(currentCustomer.id) : null
    };

    console.log('PAYLOAD SENDING TO SERVER:', payload);
    console.log('CURRENT CUSTOMER STATE:', currentCustomer);

    addAppointment(payload);
    setStep(5);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (authMode === 'login') {
        const user = await customerLogin(authData.email, authData.password);
        if (redirectAfterLogin) {
          setRedirectAfterLogin(false);
          onOpenPortal();
        }
      } else {
        await customerRegister({
          email: authData.email,
          password: authData.password,
          name: authData.name,
          phone: authData.phone
        });
        if (redirectAfterLogin) {
          setRedirectAfterLogin(false);
          onOpenPortal();
        }
      }
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="fade-in">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>O que vamos fazer hoje?</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {services.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(0,0,0,0.02)', borderRadius: '12px' }}>
                  Nenhum serviço disponível no momento.
                </div>
              ) : (
                services.map(s => (
                  <button 
                    key={s.id} 
                    className="glass-card" 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      cursor: 'pointer',
                      width: '100%',
                      textAlign: 'left',
                      background: 'var(--surface-color)',
                      border: selectedService?.id === s.id ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                      padding: '1.25rem'
                    }}
                    onClick={() => { 
                      console.log('Selected service:', s.name);
                      setSelectedService(s); 
                      setStep(2); 
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '4px', color: 'var(--text-primary)' }}>{s.name}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{s.duration}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>R$ {s.price}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="fade-in">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Escolha seu barbeiro</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {barbers.filter(b => b.role === 'Barbeiro' && b.status === 'Ativo').length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(0,0,0,0.02)', borderRadius: '12px' }}>
                  Não há barbeiros disponíveis para agendamento online hoje.
                </div>
              ) : (
                barbers.filter(b => b.role === 'Barbeiro' && b.status === 'Ativo').map(b => (
                  <div 
                    key={b.id} 
                    className="glass-card" 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '1.5rem',
                      cursor: 'pointer',
                      background: 'var(--surface-color)',
                      border: selectedBarber?.id === b.id ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                      padding: '1.25rem'
                    }}
                    onClick={() => { 
                      console.log('Selected barber:', b.name);
                      setSelectedBarber(b); 
                      setStep(3); 
                    }}
                  >
                    <div style={{ width: '60px', height: '60px', background: 'var(--icon-bg)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                      {b.foto_perfil ? (
                        <img src={b.foto_perfil} alt={b.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        b.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{b.name}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{b.role}</p>
                    </div>
                    <ChevronRight size={20} style={{ marginLeft: 'auto', color: 'var(--text-secondary)' }} />
                  </div>
                ))
              )}
            </div>
            <button className="btn-secondary" style={{ marginTop: '2rem' }} onClick={() => setStep(1)}>Voltar</button>
          </div>
        );
      case 3: {
        const allTimeSlots = [
          '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', 
          '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', 
          '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', 
          '19:00', '19:30', '20:00', '20:30', '21:00'
        ];
        
        // --- Shift Filtering Logic ---
        const dayOfWeek = new Date(selectedDate + 'T12:00:00').getDay();
        const barberShifts = (selectedBarber?.shifts || []).filter(s => s.dia_semana === dayOfWeek && s.ativo);
        
        const isWithinAnyShift = (time) => {
          if (barberShifts.length === 0) return false;
          return barberShifts.some(s => time >= s.hora_inicio && time < s.hora_fim);
        };

        const durationMinutes = parseInt(selectedService?.duration) || 0;
        const baseFilteredSlots = durationMinutes > 30 
          ? allTimeSlots.filter(t => t.endsWith(':00'))
          : allTimeSlots;

        const filteredTimeSlots = baseFilteredSlots.filter(t => isWithinAnyShift(t));
        // -----------------------------
        
        const bookedTimes = appointments
          .filter(app => String(app.barberId) === String(selectedBarber?.id) && app.date === selectedDate && app.status !== 'Finalizado')
          .map(app => app.time);

        let dateObj = new Date(selectedDate);
        dateObj.setMinutes(dateObj.getMinutes() + dateObj.getTimezoneOffset());
        const formattedHeaderDate = dateObj.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        const cleanHeaderDate = formattedHeaderDate.charAt(0).toUpperCase() + formattedHeaderDate.slice(1);

        return (
          <div className="fade-in">
            <div className="glass-card" style={{ padding: '2rem', background: 'var(--surface-color)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'var(--icon-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    {selectedBarber?.foto_perfil ? (
                      <img src={selectedBarber.foto_perfil} alt={selectedBarber.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{fontWeight: 'bold', fontSize: '14px', color: 'var(--text-secondary)'}}>{selectedBarber?.name?.charAt(0)}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{selectedBarber?.name}</span>
                    <button style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => setStep(2)}>
                       ⇄ Alterar
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <div 
                  style={{ 
                    background: 'var(--panel-bg)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '12px', 
                    padding: '12px 18px', 
                    position: 'relative', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}
                  onClick={() => dateInputRef.current && dateInputRef.current.showPicker()}
                >
                  <div style={{ flex: 1 }}>
                    <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Data do Atendimento</span>
                    <input 
                      ref={dateInputRef}
                      type="date" 
                      value={selectedDate} 
                      onChange={e => setSelectedDate(e.target.value)} 
                      onClick={e => e.stopPropagation()}
                      className="clean-date-input"
                      style={{ 
                        width: '100%', 
                        border: 'none', 
                        background: 'transparent', 
                        outline: 'none', 
                        fontSize: '1.1rem', 
                        fontWeight: 700, 
                        color: 'var(--accent-color)', 
                        cursor: 'pointer', 
                        fontFamily: 'inherit',
                        padding: 0
                      }}
                    />
                  </div>
                  <div style={{ 
                    width: '44px', 
                    height: '44px', 
                    borderRadius: '10px', 
                    background: 'var(--icon-bg)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'var(--accent-color)',
                    border: '1px solid var(--border-color)'
                  }}>
                    <Calendar size={22} strokeWidth={2.5} />
                  </div>
                </div>
              </div>
              
              <h4 style={{ textAlign: 'center', marginBottom: '2rem', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>Datas sugeridas</h4>
              
              <h5 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {cleanHeaderDate}
              </h5>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '8px' }}>
                {filteredTimeSlots.map(t => {
                  const isBooked = bookedTimes.includes(t);
                  return (
                    <button 
                      key={t}
                      style={{ 
                        padding: '10px 0', 
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        opacity: isBooked ? 0.3 : 1,
                        cursor: isBooked ? 'not-allowed' : 'pointer',
                        background: isBooked ? 'var(--panel-bg)' : 'var(--panel-bg)',
                        border: '1px solid',
                        borderColor: isBooked ? 'transparent' : 'var(--panel-bg)',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        color: isBooked ? 'var(--text-secondary)' : 'var(--text-primary)',
                        transition: 'all 0.2s',
                        boxShadow: isBooked ? 'none' : '0 1px 2px rgba(0,0,0,0.02)'
                      }}
                      disabled={isBooked}
                      onClick={() => { setSelectedTime(t); setStep(4); }}
                    >
                      <Clock size={14} style={{ color: 'var(--text-secondary)' }} /> {t}
                    </button>
                  );
                })}
              </div>
              


            </div>
          </div>
        );
      }
      case 4:
        return (
          <div className="fade-in">
            {!currentCustomer ? (
              <div className="glass-card" style={{ padding: '2.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', textAlign: 'center' }}>
                  {authMode === 'login' ? 'Acesse sua conta' : 'Crie sua conta'}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', marginBottom: '2rem' }}>
                  Para confirmar seu agendamento, precisamos te identificar.
                </p>

                <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {authMode === 'register' && (
                    <>
                      <input 
                        type="text" placeholder="Nome Completo" required
                        value={authData.name} onChange={e => setAuthData({...authData, name: e.target.value})}
                        style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', outline: 'none' }} 
                      />
                      <input 
                        type="tel" placeholder="WhatsApp (DDD) 00000-0000" required
                        value={authData.phone} onChange={e => setAuthData({...authData, phone: e.target.value})}
                        style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', outline: 'none' }} 
                      />
                    </>
                  )}
                  <input 
                    type="email" placeholder="Seu E-mail" required
                    value={authData.email} onChange={e => setAuthData({...authData, email: e.target.value})}
                    style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', outline: 'none' }} 
                  />
                  <input 
                    type="password" placeholder="Sua Senha" required
                    value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})}
                    style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', outline: 'none' }} 
                  />
                  
                  {authError && <p style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center' }}>{authError}</p>}
                  
                  <button type="submit" className="btn-primary" style={{ padding: '14px', marginTop: '0.5rem' }}>
                    {authMode === 'login' ? 'Entrar e Continuar' : 'Cadastrar e Continuar'}
                  </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                  <button 
                    onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-color)', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 600 }}
                  >
                    {authMode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-card" style={{ padding: '2.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Confirmar Agendamento</h2>
                
                <div style={{ background: 'rgba(0,0,0,0.02)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Logado como:</p>
                  <p style={{ fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={18} /> {currentCustomer?.name || 'Cliente'}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{currentCustomer?.email || ''}</p>
                  
                  <button 
                    onClick={customerLogout}
                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer', marginTop: '12px', padding: 0 }}
                  >
                    (Sair da conta)
                  </button>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Resumo da Reserva</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Serviço:</span>
                      <span style={{ fontWeight: 600 }}>{selectedService?.name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Barbeiro:</span>
                      <span style={{ fontWeight: 600 }}>{selectedBarber?.name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Data/Hora:</span>
                      <span style={{ fontWeight: 600 }}>{selectedDate?.split('-')?.reverse()?.join('/')} às {selectedTime}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-color)' }}>
                      <span style={{ fontWeight: 700 }}>Total:</span>
                      <span style={{ fontWeight: 700, color: 'var(--accent-color)' }}>R$ {selectedService?.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button 
                  className="btn-primary" 
                  style={{ width: '100%', padding: '16px', fontSize: '1rem', fontWeight: 700 }}
                  onClick={handleFinishBooking}
                >
                  Finalizar e Agendar
                </button>
              </div>
            )}
            <button className="btn-secondary" style={{ marginTop: '2rem' }} onClick={() => setStep(3)}>Voltar</button>
          </div>
        );
      case 5:
        return (
          <div className="fade-in" style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ background: 'var(--brand-50)', color: 'var(--brand-600)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
              <Check size={40} />
            </div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Pronto, {(currentCustomer?.name || clientInfo?.name || '').split(' ')[0]}!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>Seu agendamento foi realizado com sucesso.</p>
            
            <div className="glass-card" style={{ display: 'inline-block', textAlign: 'left', minWidth: '320px', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Serviço</span>
                <span style={{ fontWeight: 600 }}>{selectedService?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Barbeiro</span>
                <span style={{ fontWeight: 600 }}>{selectedBarber?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Data</span>
                <span style={{ fontWeight: 600 }}>{selectedDate?.split('-').reverse().join('/')}, às {selectedTime}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Valor</span>
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{selectedService?.price}</span>
              </div>
            </div>
            
            <div>
              <button className="btn-primary" onClick={() => {
                setStep(1);
                setClientInfo({ name: '', phone: '' });
                setSelectedService(null);
                setSelectedBarber(null);
                setSelectedTime(null);
              }}>
                Fazer outro agendamento
              </button>
            </div>
          </div>
        );
      default: return null;
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--bg-color)',
      paddingBottom: '4rem'
    }}>
      {/* Top Navbar */}
      <nav style={{ 
        background: '#000000', 
        padding: '0.75rem 2rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#FFFDF2', fontWeight: 700, fontSize: '1.1rem' }}>
          {businessInfo && businessInfo.logo_url ? (
            <img src={businessInfo.logo_url} alt="Logo" style={{ height: '32px', width: '32px', borderRadius: '6px', objectFit: 'contain', background: 'white' }} />
          ) : null}
          <span className="sloot-logo-text" style={{ fontSize: '1.2rem', color: '#FFFDF2', paddingTop: '2px' }}>{(businessInfo && businessInfo.name) || 'SLOOT'}</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: '#FFFDF2' }}>
          
          <button 
            onClick={() => {
              if (currentCustomer) {
                onOpenPortal();
              } else {
                setRedirectAfterLogin(true);
                setStep(4);
              }
            }}
            style={{ 
              background: 'rgba(255,255,255,0.1)', 
              color: '#FFFDF2', 
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <Calendar size={14} /> Minha Agenda
          </button>

          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <Bell size={24} />
          </div>
          <div 
            style={{ position: 'relative', cursor: 'pointer' }}
            onClick={() => setShowAccountMenu(!showAccountMenu)}
          >
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '50%', 
              background: 'rgba(255,255,255,0.2)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <User size={22} />
            </div>

            {/* Account Dropdown Card */}
            {showAccountMenu && (
              <div 
                className="glass-card fade-in"
                style={{ 
                  position: 'absolute', 
                  top: '45px', 
                  right: 0, 
                  width: '200px', 
                  padding: '1rem',
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                  color: 'var(--text-primary)',
                  zIndex: 200
                }}
              >
                {!currentCustomer ? (
                  <button 
                    onClick={() => { setStep(4); setShowAccountMenu(false); }}
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      background: 'var(--accent-color)', 
                      color: 'var(--accent-text)', 
                      border: 'none', 
                      borderRadius: '8px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <LogIn size={18} /> ENTRAR
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                      Olá, {currentCustomer?.name?.split(' ')[0] || 'Cliente'}
                    </div>
                    <button 
                      onClick={() => { onOpenPortal(); setShowAccountMenu(false); }}
                      style={{ 
                        width: '100%', padding: '8px', background: 'var(--brand-50)', color: 'var(--brand-700)', 
                        border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600
                      }}
                    >
                      Minha Agenda
                    </button>
                    <button 
                      onClick={() => { customerLogout(); setShowAccountMenu(false); }}
                      style={{ 
                        width: '100%', padding: '8px', background: 'none', color: 'var(--error-color, #ef4444)', 
                        border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600
                      }}
                    >
                      Sair
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '600px', margin: '4rem auto 0', padding: '0 1rem' }}>
        <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
          {businessInfo && businessInfo.logo_url ? (
            <img src={businessInfo.logo_url} alt="Logo" style={{ maxHeight: '100px', maxWidth: '200px', marginBottom: '1.5rem', borderRadius: '12px' }} />
          ) : (
            <div style={{ marginBottom: '1.5rem' }}>
              <span className="sloot-logo-text" style={{ fontSize: '4rem' }}>SLOOT</span>
            </div>
          )}
          {businessInfo && businessInfo.name && businessInfo.name !== 'Sloot' && (
             <h1 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{businessInfo.name}</h1>
          )}
          <p style={{ color: 'var(--text-secondary)' }}>Reserva de horários online - Simples e rápido.</p>
        </header>

        {step < 5 && renderProgressBar()}

        {renderStep()}
      </div>
    </div>
  );
};

export default PublicBooking;
