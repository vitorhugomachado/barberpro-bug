import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, User, Scissors, X, Calendar as CalendarIcon, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Scheduler = () => {
  const { appointments, barbers, services, addAppointment, currentUser } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Pre-select current user's agenda if they are a barber
  const [selectedBarberId, setSelectedBarberId] = useState(() => {
    if (currentUser && currentUser.role === 'Barbeiro') {
      return String(currentUser.id);
    }
    return 'all';
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer: '', phone: '', serviceId: '', barberId: '', time: '09:00', date: ''
  });
  
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

  const getGridPos = (time) => {
    const hour = parseInt(time.split(':')[0]);
    return (hour - 8) + 1;
  };

  const activeBarbers = barbers.filter(b => b.status === 'Ativo');

  const handleOpenModal = (date, time) => {
    setFormData({
      customer: '',
      phone: '',
      serviceId: '',
      barberId: selectedBarberId !== 'all' ? selectedBarberId : '',
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

  // Helper to visually group overlapping appointments when viewing "All"
  const getAppointmentsForCell = (dateString, timeString) => {
    return filteredAppointments.filter(app => app.date === dateString && app.time === timeString);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 4rem)' }}>
      {/* Header Container */}
      <header style={{ flexShrink: 0, marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Top Row: Title and Global Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '4px', letterSpacing: '-0.5px' }}>Agenda Semanal</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Controle avançado de capacidade profissional.</p>
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

        {/* Bottom Row: Barber Filters */}
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
            
            {/* Interactive Grid Cells */}
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

                  {/* Render content depending on filter state */}
                  <div style={{ position: 'absolute', inset: '4px', zIndex: 2, display: 'flex', flexDirection: selectedBarberId === 'all' ? 'row' : 'column', gap: '4px', overflow: 'hidden', pointerEvents: 'none' }}>
                    
                    {/* View: "ALL BARBERS" - Mini Avatar Chips */}
                    {selectedBarberId === 'all' && cellApps.map(app => {
                       const b = barbers.find(b => b.id === app.barberId);
                       return (
                         <div key={app.id} 
                           title={`${b?.name} - ${app.customer}`}
                           style={{ 
                           width: '28px', height: '28px', flexShrink: 0,
                           borderRadius: '50%', 
                           background: app.status === 'Finalizado' ? '#10b981' : app.status === 'Em progresso' ? '#2563eb' : '#0f172a',
                           color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                           fontSize: '0.65rem', fontWeight: 700,
                           boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                           border: '2px solid #fff'
                         }}>
                           {b?.name?.charAt(0)}
                         </div>
                       )
                    })}

                    {/* View: "SINGLE BARBER" - Expanded Details Card */}
                    {selectedBarberId !== 'all' && cellApps.map(app => (
                        <div 
                          key={app.id}
                          className="fade-in"
                          style={{
                            flex: 1,
                            background: app.status === 'Finalizado' ? '#f0fdf4' : app.status === 'Em progresso' ? '#eff6ff' : '#fff',
                            color: '#000',
                            borderRadius: '8px',
                            padding: '8px',
                            fontSize: '0.7rem',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            border: app.status === 'Finalizado' ? '1px solid #bbf7d0' : app.status === 'Em progresso' ? '1px solid #bfdbfe' : '1px solid var(--border-color)',
                          }}
                        >
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{app.customer}</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{app.service}</div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.75rem', color: 'var(--accent-color)' }}>R$ {app.price}</span>
                            <div style={{ background: app.status === 'Em progresso' ? '#2563eb' : app.status === 'Finalizado' ? '#10b981' : '#e2e8f0', color: app.status === 'Agendado' ? 'var(--text-secondary)' : '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase' }}>
                              {app.status === 'Em progresso' ? 'Atd.' : app.status === 'Finalizado' ? 'Pago' : 'Ag'}
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Agendamento Modal */}
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
              <select value={formData.barberId} onChange={e => setFormData({...formData, barberId: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}>
                <option value="">Profissional</option>
                {activeBarbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
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
