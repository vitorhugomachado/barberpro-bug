import React, { useState, useRef } from 'react';
import { Scissors, Calendar, Clock, Check, ChevronRight, User, Phone, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const PublicBooking = () => {
  const { barbers, services, appointments, addAppointment, businessInfo } = useApp();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [clientInfo, setClientInfo] = useState({ name: '', phone: '' });

  const [showMoreSlots, setShowMoreSlots] = useState(false);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [waitlistInfo, setWaitlistInfo] = useState({ name: '', phone: '' });
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
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
    addAppointment({
      customer: clientInfo.name,
      phone: clientInfo.phone,
      service: selectedService.name,
      barberId: selectedBarber.id,
      date: selectedDate,
      time: selectedTime,
      status: 'Agendado',
      price: selectedService.price
    });
    setStep(5);
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
        const baseTimeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
        const extendedTimeSlots = ['07:00', '08:00', '18:00', '19:00', '20:00', '21:00'];
        const allTimeSlots = showMoreSlots ? [...baseTimeSlots, ...extendedTimeSlots] : baseTimeSlots;
        
        // --- Shift Filtering Logic ---
        const dayOfWeek = new Date(selectedDate + 'T12:00:00').getDay();
        const barberShifts = (selectedBarber?.shifts || []).filter(s => s.dia_semana === dayOfWeek && s.ativo);
        
        const isWithinAnyShift = (time) => {
          if (barberShifts.length === 0) return false;
          return barberShifts.some(s => time >= s.hora_inicio && time < s.hora_fim);
        };

        const filteredTimeSlots = allTimeSlots.filter(t => isWithinAnyShift(t));
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
                <button 
                  style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => setIsWaitlistOpen(true)}
                >
                  + Fila de espera
                </button>
              </div>

              <div style={{ marginBottom: '2.5rem' }}>
                <div 
                  style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 14px', position: 'relative', cursor: 'pointer' }}
                  onClick={() => dateInputRef.current && dateInputRef.current.showPicker()}
                >
                  <span style={{ position: 'absolute', top: '6px', left: '14px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Data</span>
                  <input 
                    ref={dateInputRef}
                    type="date" 
                    value={selectedDate} 
                    onChange={e => setSelectedDate(e.target.value)} 
                    onClick={e => e.stopPropagation()}
                    style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', paddingTop: '16px', fontSize: '0.95rem', color: 'var(--accent-color)', cursor: 'pointer', fontFamily: 'inherit' }}
                  />
                  <Calendar size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
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
              
              <div style={{ textAlign: 'center', marginTop: '1.5rem', borderBottom: '1px dashed var(--border-color)', paddingBottom: '2rem', marginBottom: '1rem' }}>
                <button 
                  style={{ background: 'none', border: 'none', color: 'var(--accent-color)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                  onClick={() => setShowMoreSlots(!showMoreSlots)}
                >
                  {showMoreSlots ? 'Ver Menos' : 'Ver Mais'}
                </button>
              </div>

            </div>
          </div>
        );
      }
      case 4:
        return (
          <div className="fade-in">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Só mais um detalhe...</h2>
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Seu Nome</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="text" 
                    placeholder="Como podemos te chamar?"
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 40px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      outline: 'none',
                      fontSize: '0.9rem'
                    }}
                    value={clientInfo.name}
                    onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>WhatsApp</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="tel" 
                    placeholder="(00) 00000-0000"
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 40px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      outline: 'none',
                      fontSize: '0.9rem'
                    }}
                    value={clientInfo.phone}
                    onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                  />
                </div>
              </div>
              <button 
                className="btn-primary" 
                style={{ width: '100%', padding: '14px' }}
                disabled={!clientInfo.name || !clientInfo.phone}
                onClick={handleFinishBooking}
              >
                Finalizar Agendamento
              </button>
            </div>
            <button className="btn-secondary" style={{ marginTop: '2rem' }} onClick={() => setStep(3)}>Voltar</button>
          </div>
        );
      case 5:
        return (
          <div className="fade-in" style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ background: 'var(--brand-50)', color: 'var(--brand-600)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
              <Check size={40} />
            </div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Pronto, {clientInfo.name.split(' ')[0]}!</h2>
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
      padding: '4rem 2rem'
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ background: 'var(--accent-color)', color: 'var(--accent-text)', padding: '12px', borderRadius: '14px', width: 'fit-content', margin: '0 auto 1.5rem' }}>
            <Scissors size={24} />
          </div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{businessInfo?.name || 'BarberPro'}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Reserva de horários online - Simples e rápido.</p>
        </header>

        {step < 5 && renderProgressBar()}

        {renderStep()}
        
        {isWaitlistOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="glass-card fade-in" style={{ width: '90%', maxWidth: '400px', background: 'var(--surface-color)', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: 0 }}>Fila de Espera</h2>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }} onClick={() => {setIsWaitlistOpen(false); setWaitlistSuccess(false);}}><X size={20} /></button>
              </div>
              
              {waitlistSuccess ? (
                 <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                   <div style={{ background: 'var(--brand-50)', color: 'var(--brand-600)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                     <Check size={30} />
                   </div>
                   <h3 style={{ marginBottom: '1rem' }}>Sua vaga está garantida!</h3>
                   <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Avisaremos imediatamente por WhatsApp caso um horário libere neste dia para você.</p>
                   <button className="btn-secondary" style={{ width: '100%', padding: '12px' }} onClick={() => {setIsWaitlistOpen(false); setWaitlistSuccess(false);}}>Concluir e Fechar</button>
                 </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Deseja ser notificado se houver desistências para {selectedBarber?.name} nesta data?</p>
                  <input type="text" placeholder="Seu Nome Completo" value={waitlistInfo.name} onChange={e => setWaitlistInfo({...waitlistInfo, name: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
                  <input type="tel" placeholder="WhatsApp (DDD) 00000-0000" value={waitlistInfo.phone} onChange={e => setWaitlistInfo({...waitlistInfo, phone: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
                  <button className="btn-primary" style={{ marginTop: '1rem', padding: '12px' }} onClick={() => setWaitlistSuccess(true)} disabled={!waitlistInfo.name || !waitlistInfo.phone}>
                    Entrar na Fila
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PublicBooking;
