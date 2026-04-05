import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, User, Scissors } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Scheduler = () => {
  const { appointments, barbers } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const curr = new Date(selectedDate);
  // Compensating for timezone to avoid off-by-one day bugs
  curr.setMinutes(curr.getMinutes() + curr.getTimezoneOffset());
  
  const day = curr.getDay() || 7; 
  const startOfWeek = new Date(curr);
  startOfWeek.setDate(curr.getDate() - (day - 1));
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const startStr = startOfWeek.toISOString().split('T')[0];
  const endStr = endOfWeek.toISOString().split('T')[0];

  const filteredAppointments = appointments.filter(app => app.date >= startStr && app.date <= endStr);

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
  ];

  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  // Helper to find grid coordinates for an appointment
  const getGridPos = (time) => {
    const hour = parseInt(time.split(':')[0]);
    return hour - 7; // Starts at 08:00
  };

  return (
    <div className="fade-in">
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Agenda Principal</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Gerencie todos os horários centralizados em um só lugar.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="glass-card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Semana de:</span>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={e => setSelectedDate(e.target.value)} 
              style={{ border: 'none', background: 'transparent', fontFamily: 'inherit', fontWeight: 600, color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }} 
            />
          </div>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> Novo Horário
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '1.5rem' }}>
        {/* Time Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', paddingTop: '60px' }}>
          {timeSlots.map(time => (
            <span key={time} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{time}</span>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="glass-card" style={{ padding: '1.5rem', position: 'relative', overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(120px, 1fr))', gap: '10px', marginBottom: '1.5rem', minWidth: '800px' }}>
            {days.map(day => (
              <div key={day} style={{ textAlign: 'center', padding: '10px', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{day}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(120px, 1fr))', gridTemplateRows: 'repeat(12, 60px)', gap: '10px', position: 'relative', minWidth: '800px' }}>
            {/* Grid Lines */}
            {Array.from({ length: 12 * 7 }).map((_, i) => (
              <div key={i} style={{ border: '1px solid rgba(0,0,0,0.02)', borderRadius: '6px' }}></div>
            ))}

            {/* Dynamic Appointments from Global State */}
            {filteredAppointments.map((app) => {
              const row = getGridPos(app.time);
              const barber = barbers.find(b => b.id === app.barberId);
              
              let appDateObj = new Date(app.date);
              appDateObj.setMinutes(appDateObj.getMinutes() + appDateObj.getTimezoneOffset());
              const dayOfWeek = appDateObj.getDay();
              const column = dayOfWeek === 0 ? 8 : dayOfWeek + 1;
              
              return (
                <div 
                  key={app.id}
                  style={{
                    gridColumn: `${column}`, // Posicionado no dia correto
                    gridRow: `${row} / span 1`,
                    background: app.status === 'Em progresso' ? '#000' : 'rgba(0,0,0,0.05)',
                    color: app.status === 'Em progresso' ? '#fff' : 'var(--text-primary)',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '0.75rem',
                    boxShadow: app.status === 'Em progresso' ? '0 4px 6px rgba(0,0,0,0.1)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    zIndex: 10,
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    <strong style={{ display: 'block', marginBottom: '2px' }}>{app.customer}</strong>
                    <span style={{ opacity: 0.8 }}>{app.service} ({barber?.name?.split(' ')[0]})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.8 }}>
                    <Clock size={12} /> {app.time}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scheduler;
