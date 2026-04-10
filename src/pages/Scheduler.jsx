import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, User, Scissors, X, Calendar as CalendarIcon, Users, CheckCircle, XCircle, Play, Banknote } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Scheduler = () => {
  const { appointments, barbers, services, addAppointment, updateAppointmentStatus, cancelAppointment, currentUser } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const isBarber = currentUser?.role === 'Barbeiro';
  
  // Pre-select current user's agenda if they are a barber (locked)
  const [selectedBarberId, setSelectedBarberId] = useState(() => {
    if (isBarber) return String(currentUser.id);
    return 'all';
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer: '', phone: '', serviceId: '', barberId: '', time: '09:00', date: ''
  });

  // ─── Action Modal State ───
  const [actionModal, setActionModal] = useState({ open: false, app: null, step: 'choose' });
  const [paymentSplits, setPaymentSplits] = useState([{ method: 'Pix', amount: 0 }]);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const curr = new Date(selectedDate);
  curr.setMinutes(curr.getMinutes() + curr.getTimezoneOffset());
  
  const day = curr.getDay() || 7; 
  const startOfWeek = new Date(curr);
  startOfWeek.setDate(curr.getDate() - (day - 1));
  
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
  ];

  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  const activeBarbers = barbers.filter(b => b.status === 'Ativo');

  const handleOpenModal = (date, time) => {
    setFormData({
      customer: '',
      phone: '',
      serviceId: '',
      barberId: isBarber ? String(currentUser.id) : (selectedBarberId !== 'all' ? selectedBarberId : ''),
      time: time || '09:00',
      date: date || selectedDate
    });
    setIsModalOpen(true);
  };

  const handleSaveAppointment = () => {
    if(!formData.customer || !formData.serviceId || !formData.barberId) return;
    const selectedService = services.find(s => String(s.id) === String(formData.serviceId));
    
    addAppointment({
      customer: formData.customer,
      phone: formData.phone,
      service: selectedService?.name || 'Serviço',
      barberId: parseInt(formData.barberId),
      date: formData.date,
      time: formData.time,
      status: 'Agendado',
      price: selectedService?.price || 0
    });
    
    setIsModalOpen(false);
  };

  // ─── Action Modal handlers ───
  const openActionModal = (app, e) => {
    e?.stopPropagation();
    if (!app || app.status === 'Finalizado' || app.status === 'Cancelado') return;
    setActionModal({ open: true, app, step: 'choose' });
    setPaymentSplits([{ method: 'Pix', amount: app.price }]);
  };

  const closeActionModal = () => setActionModal({ open: false, app: null, step: 'choose' });

  const handleMarkInProgress = async () => {
    await updateAppointmentStatus(actionModal.app.id, 'Em progresso');
    closeActionModal();
  };

  const handleCancelAppointment = async () => {
    await cancelAppointment(actionModal.app.id);
    closeActionModal();
  };

  const handleFinalizePayment = async () => {
    const totalPaid = paymentSplits.reduce((acc, curr) => acc + Number(curr.amount), 0);
    if (Math.abs(totalPaid - actionModal.app.price) > 0.01) {
      alert(`O valor total pago (R$ ${totalPaid.toFixed(2)}) deve ser igual ao valor do serviço (R$ ${actionModal.app.price.toFixed(2)})`);
      return;
    }
    await updateAppointmentStatus(actionModal.app.id, 'Finalizado', { payments: paymentSplits });
    closeActionModal();
  };

  const handleAddSplit = () => setPaymentSplits([...paymentSplits, { method: 'Pix', amount: 0 }]);
  const handleSplitChange = (index, field, value) => {
    const newSplits = [...paymentSplits];
    newSplits[index][field] = value;
    setPaymentSplits(newSplits);
  };

  const getDayDate = (colIndex) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + colIndex);
    return d.toISOString().split('T')[0];
  };

  const startStr = startOfWeek.toISOString().split('T')[0];
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  const endStr = endOfWeek.toISOString().split('T')[0];

  const filteredAppointments = appointments.filter(app => {
    const inRange = app.date >= startStr && app.date <= endStr;
    const matchesBarber = selectedBarberId === 'all' || String(app.barberId) === String(selectedBarberId);
    return inRange && matchesBarber;
  });

  const shiftDate = (daysCount) => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + daysCount);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const getAppointmentsForCell = (dateString, timeString) => {
    return filteredAppointments.filter(app => app.date === dateString && app.time === timeString);
  };

  // Status color helper
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Finalizado': return { bg: '#f0fdf4', border: '#bbf7d0', badge: '#10b981', label: 'Pago' };
      case 'Em progresso': return { bg: '#eff6ff', border: '#bfdbfe', badge: '#2563eb', label: 'Atd.' };
      case 'Cancelado': return { bg: '#fef2f2', border: '#fecaca', badge: '#ef4444', label: 'Canc.' };
      default: return { bg: '#fff', border: 'var(--border-color)', badge: '#e2e8f0', label: 'Ag' };
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 4rem)' }}>
      {/* Header Container */}
      <header style={{ flexShrink: 0, marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '4px', letterSpacing: '-0.5px' }}>
              {isBarber ? 'Minha Agenda' : 'Agenda Semanal'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {isBarber ? 'Gerencie seus horários e atendimentos.' : 'Controle avançado de capacidade profissional.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="glass-card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '12px' }}>
              <button onClick={() => shiftDate(-7)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0 4px', display: 'flex' }}><ChevronLeft size={16} /></button>
              <CalendarIcon size={18} className="text-secondary" />
              <input 
                type="date" 
                value={selectedDate} 
                onChange={e => setSelectedDate(e.target.value)} 
                style={{ border: 'none', background: 'transparent', fontFamily: 'inherit', fontWeight: 600, color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }} 
              />
              <button onClick={() => shiftDate(7)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0 4px', display: 'flex' }}><ChevronRight size={16} /></button>
            </div>
            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }} onClick={() => handleOpenModal()}>
              <Plus size={18} /> Agendar
            </button>
          </div>
        </div>

        {/* Barber Filters — only visible for managers */}
        {!isBarber && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', overflowX: 'auto', paddingBottom: '5px' }} className="hide-scrollbar">
             <button 
               onClick={() => setSelectedBarberId('all')}
               style={{ 
                 display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '20px',
                 fontWeight: 600, fontSize: '0.85rem', flexShrink: 0,
                 transition: 'all 0.2s ease',
                 background: selectedBarberId === 'all' ? '#000' : 'rgba(0,0,0,0.03)',
                 color: selectedBarberId === 'all' ? '#fff' : 'var(--text-secondary)',
                 border: selectedBarberId === 'all' ? '1px solid #000' : '1px solid var(--border-color)'
               }}>
               <Users size={14} /> Todos (Macro)
             </button>
             <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 5px' }}></div>
             
             {activeBarbers.map(barber => (
               <button 
                 key={barber.id}
                 onClick={() => setSelectedBarberId(String(barber.id))}
                 style={{ 
                   display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px 6px 6px', borderRadius: '20px',
                   fontWeight: 600, fontSize: '0.85rem', flexShrink: 0,
                   transition: 'all 0.2s ease',
                   background: selectedBarberId === String(barber.id) ? '#fff' : 'rgba(0,0,0,0.02)',
                   color: selectedBarberId === String(barber.id) ? '#2563eb' : 'var(--text-primary)',
                   border: selectedBarberId === String(barber.id) ? '1px solid #bfdbfe' : '1px solid var(--border-color)',
                   boxShadow: selectedBarberId === String(barber.id) ? '0 4px 6px rgba(37, 99, 235, 0.05)' : 'none'
                 }}>
                 <div style={{ width: '24px', height: '24px', borderRadius: '12px', background: selectedBarberId === String(barber.id) ? '#2563eb' : '#e2e8f0', color: selectedBarberId === String(barber.id) ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                   {barber.name.charAt(0)}
                 </div>
                 {barber.name.split(' ')[0]}
               </button>
             ))}
          </div>
        )}
      </header>

      {/* Grid Container */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '80px 1fr', gap: '1rem', minHeight: 0 }}>
        
        {/* Time Column */}
        <div className="hide-scrollbar glass-card" style={{ padding: '0', display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingTop: '64px', background: 'rgba(255,255,255,0.4)', borderRight: '1px solid var(--border-color)' }}>
          {timeSlots.map(time => (
            <div key={time} style={{ height: selectedBarberId === 'all' ? '60px' : '90px', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px', transition: 'height 0.3s ease' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{time}</span>
            </div>
          ))}
        </div>

        {/* Calendar Main Grid */}
        <div className="glass-card hide-scrollbar" style={{ padding: '0', position: 'relative', overflow: 'auto', display: 'flex', flexDirection: 'column', border: '1px solid rgba(0,0,0,0.08)' }}>
          
          {/* Days Header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(140px, 1fr))', gap: '0', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, background: '#fff', zIndex: 30 }}>
            {days.map((day, i) => {
              const date = getDayDate(i);
              const isToday = date === todayStr;
              return (
                <div key={day} style={{ textAlign: 'center', padding: '12px', background: isToday ? 'rgba(37, 99, 235, 0.03)' : 'transparent', borderRight: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.7rem', color: isToday ? '#2563eb' : 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{day}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: isToday ? '#2563eb' : 'inherit' }}>{date.split('-').reverse()[0]}</div>
                </div>
              );
            })}
          </div>

          {/* Grid Body */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(140px, 1fr))', gridTemplateRows: `repeat(12, ${selectedBarberId === 'all' ? '60px' : '90px'})`, gap: '0', position: 'relative', transition: 'grid-template-rows 0.3s ease' }}>
            
            {Array.from({ length: 12 * 7 }).map((_, i) => {
              const col = i % 7;
              const rowIdx = Math.floor(i / 7);
              const time = timeSlots[rowIdx];
              const date = getDayDate(col);
              const cellApps = getAppointmentsForCell(date, time);
              const gridRow = rowIdx + 1;
              const gridCol = col + 1;
              
              return (
                <div 
                  key={i} 
                  className="hover-trigger"
                  onClick={() => handleOpenModal(date, time)}
                  style={{ 
                    borderRight: '1px solid var(--border-color)', 
                    borderBottom: '1px solid var(--border-color)',
                    position: 'relative',
                    cursor: 'pointer',
                    background: 'transparent',
                    gridColumn: gridCol,
                    gridRow: gridRow,
                    padding: '4px'
                  }}
                >
                  <div className="hover-visible" style={{ position: 'absolute', inset: '4px', border: '1px dashed #cbd5e1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.01)', zIndex: 1 }}>
                    <Plus size={14} style={{ color: '#94a3b8' }} />
                  </div>

                  <div style={{ position: 'absolute', inset: '4px', zIndex: 2, display: 'flex', flexDirection: selectedBarberId === 'all' ? 'row' : 'column', gap: '4px', overflow: 'hidden' }}>
                    
                    {/* ALL BARBERS view */}
                    {selectedBarberId === 'all' && cellApps.map(app => {
                       const b = barbers.find(b => b.id === app.barberId);
                       const ss = getStatusStyle(app.status);
                       return (
                         <div key={app.id} 
                           title={`${b?.name} - ${app.customer} (${ss.label})`}
                           onClick={(e) => openActionModal(app, e)}
                           style={{ 
                             pointerEvents: 'auto',
                             width: '28px', height: '28px', flexShrink: 0,
                             borderRadius: '50%', 
                             background: ss.badge,
                             color: app.status === 'Agendado' ? 'var(--text-secondary)' : '#fff',
                             display: 'flex', alignItems: 'center', justifyContent: 'center',
                             fontSize: '0.65rem', fontWeight: 700,
                             boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                             border: '2px solid #fff',
                             cursor: (app.status !== 'Finalizado' && app.status !== 'Cancelado') ? 'pointer' : 'default'
                         }}>
                           {b?.name?.charAt(0)}
                         </div>
                       )
                    })}

                    {/* SINGLE BARBER view */}
                    {selectedBarberId !== 'all' && cellApps.map(app => {
                        const ss = getStatusStyle(app.status);
                        const isActionable = app.status !== 'Finalizado' && app.status !== 'Cancelado';
                        return (
                          <div 
                            key={app.id}
                            className="fade-in"
                            onClick={(e) => isActionable && openActionModal(app, e)}
                            style={{
                              flex: 1,
                              pointerEvents: 'auto',
                              background: ss.bg,
                              color: '#000',
                              borderRadius: '8px',
                              padding: '8px',
                              fontSize: '0.7rem',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              border: `1px solid ${ss.border}`,
                              cursor: isActionable ? 'pointer' : 'default',
                              opacity: app.status === 'Cancelado' ? 0.5 : 1,
                            }}
                          >
                            <div style={{ overflow: 'hidden' }}>
                              <div style={{ fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', textDecoration: app.status === 'Cancelado' ? 'line-through' : 'none' }}>{app.customer}</div>
                              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{app.service}</div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                               <span style={{ fontWeight: 600, fontSize: '0.75rem', color: 'var(--accent-color)' }}>R$ {app.price}</span>
                               <div style={{ background: ss.badge, color: app.status === 'Agendado' ? 'var(--text-secondary)' : '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase' }}>
                                 {ss.label}
                               </div>
                            </div>
                          </div>
                      )
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══════ ACTION MODAL ═══════ */}
      {actionModal.open && actionModal.app && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card fade-in" style={{ width: '480px', background: '#fff', padding: '2rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', margin: 0 }}>
                {actionModal.step === 'choose' ? 'Ação do Agendamento' : actionModal.step === 'payment' ? 'Check-out — Pagamento' : 'Confirmar Cancelamento'}
              </h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={closeActionModal}><X size={20} /></button>
            </div>

            {/* Appointment Info */}
            <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '12px', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600 }}>{actionModal.app.customer}</span>
                <span style={{ fontWeight: 700, color: '#10b981', fontSize: '1.1rem' }}>R$ {actionModal.app.price.toFixed(2)}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {actionModal.app.service} — {actionModal.app.time} — {actionModal.app.date}
              </div>
              <div style={{ marginTop: '6px' }}>
                <span style={{
                  display: 'inline-block', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                  background: actionModal.app.status === 'Em progresso' ? 'rgba(37,99,235,0.1)' : 'rgba(0,0,0,0.05)',
                  color: actionModal.app.status === 'Em progresso' ? '#2563eb' : 'var(--text-secondary)'
                }}>
                  {actionModal.app.status}
                </span>
              </div>
            </div>

            {/* Step: Choose */}
            {actionModal.step === 'choose' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {actionModal.app.status === 'Agendado' && (
                  <button onClick={handleMarkInProgress} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderRadius: '12px',
                    background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)', color: '#2563eb',
                    fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer'
                  }}>
                    <Play size={18} /> Iniciar Atendimento
                  </button>
                )}
                <button onClick={() => setActionModal({ ...actionModal, step: 'payment' })} style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderRadius: '12px',
                  background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', color: '#10b981',
                  fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer'
                }}>
                  <CheckCircle size={18} /> Marcar como Pago
                </button>
                <button onClick={() => setActionModal({ ...actionModal, step: 'confirm-cancel' })} style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderRadius: '12px',
                  background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', color: '#ef4444',
                  fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer'
                }}>
                  <XCircle size={18} /> Cancelar Agendamento
                </button>
              </div>
            )}

            {/* Step: Payment */}
            {actionModal.step === 'payment' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Composição de Pagamento</label>
                  <button onClick={handleAddSplit} style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 10px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', gap: '4px' }}>
                    <Plus size={14}/> Dividir
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
                  {paymentSplits.map((split, index) => (
                    <div key={index} className="fade-in" style={{ display: 'flex', gap: '8px' }}>
                      <select value={split.method} onChange={e => handleSplitChange(index, 'method', e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}>
                        <option value="Pix">Pix</option>
                        <option value="Cartão de Crédito">Cartão de Crédito</option>
                        <option value="Cartão de Débito">Cartão de Débito</option>
                        <option value="Dinheiro">Dinheiro</option>
                      </select>
                      <div style={{ position: 'relative', width: '120px' }}>
                        <span style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>R$</span>
                        <input type="number" min="0" step="0.01" value={split.amount} onChange={e => handleSplitChange(index, 'amount', e.target.value)} style={{ width: '100%', padding: '10px 10px 10px 32px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
                      </div>
                      {paymentSplits.length > 1 && (
                        <button onClick={() => setPaymentSplits(paymentSplits.filter((_, i) => i !== index))} style={{ background: 'none', color: '#ef4444', padding: '0 8px', border: 'none', cursor: 'pointer' }}>
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setActionModal({ ...actionModal, step: 'choose' })} className="btn-secondary" style={{ flex: 1, padding: '14px' }}>
                    ← Voltar
                  </button>
                  <button className="btn-primary" style={{ flex: 2, padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }} onClick={handleFinalizePayment}>
                    <Banknote size={18} /> Finalizar Recebimento
                  </button>
                </div>
              </div>
            )}

            {/* Step: Confirm Cancel */}
            {actionModal.step === 'confirm-cancel' && (
              <div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                  Tem certeza que deseja cancelar o agendamento de <strong>{actionModal.app.customer}</strong>?
                  Esta ação não pode ser desfeita.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setActionModal({ ...actionModal, step: 'choose' })} className="btn-secondary" style={{ flex: 1, padding: '14px' }}>
                    ← Voltar
                  </button>
                  <button onClick={handleCancelAppointment} style={{ flex: 2, padding: '14px', background: '#ef4444', color: '#fff', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', border: 'none', cursor: 'pointer' }}>
                    <XCircle size={18} /> Confirmar Cancelamento
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════ AGENDAMENTO MODAL ═══════ */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card fade-in" style={{ width: '420px', background: '#fff', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Reservar Horário</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" placeholder="Nome do Cliente" value={formData.customer} onChange={e => setFormData({...formData, customer: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
              <select value={formData.serviceId} onChange={e => setFormData({...formData, serviceId: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}>
                <option value="">Serviço</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.name} - R$ {s.price}</option>)}
              </select>
              {/* Barbers can only book for themselves */}
              {isBarber ? (
                <div style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#f8f9fa', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Profissional: <strong style={{ color: 'var(--text-primary)' }}>{currentUser.name}</strong>
                </div>
              ) : (
                <select value={formData.barberId} onChange={e => setFormData({...formData, barberId: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}>
                  <option value="">Profissional</option>
                  {activeBarbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              )}
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
                <select value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}>
                  {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <button className="btn-primary" style={{ marginTop: '1rem', padding: '14px' }} onClick={handleSaveAppointment} disabled={!formData.customer || !formData.serviceId || !formData.barberId}>
                Confirmar Reserva
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scheduler;
