import React, { useState } from 'react';
import { TrendingUp, Users, Calendar, Banknote, Clock, User, Scissors, X, ShoppingBag } from 'lucide-react';
import { useApp } from '../context/AppContext';

const StatCard = ({ title, value, icon, trend }) => (
  <div className="glass-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
    <div style={{ background: 'rgba(0,0,0,0.02)', padding: '12px', borderRadius: '12px', color: '#000' }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{title}</span>
        <span style={{ fontSize: '0.75rem', color: trend >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      </div>
      <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'Outfit', lineHeight: '1.2', marginTop: '2px' }}>{value}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const { barbers, appointments, services, products, addAppointment, sellProduct, getFinancialStats } = useApp();
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer: '', phone: '', serviceId: '', barberId: '', time: '09:00', date: startDate
  });
  const [saleData, setSaleData] = useState({ productId: '', quantity: 1 });

  React.useEffect(() => {
    setFormData(prev => ({ ...prev, date: startDate }));
  }, [startDate]);

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
    setFormData({ customer: '', phone: '', serviceId: '', barberId: '', time: '09:00', date: startDate });
  };

  const handleSaleProduct = () => {
    if (!saleData.productId) return;
    const success = sellProduct(parseInt(saleData.productId), parseInt(saleData.quantity));
    if (success) {
      setIsSaleModalOpen(false);
      setSaleData({ productId: '', quantity: 1 });
    } else {
      alert("Estoque insuficiente!");
    }
  };

  const stats = getFinancialStats(startDate, endDate);
  const filteredAppointments = appointments.filter(app => app.date >= startDate && app.date <= endDate);

  const getDatesInRange = (startStr, endStr) => {
    const dates = [];
    let current = new Date(startStr + "T12:00:00");
    const end = new Date(endStr + "T12:00:00");
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };
  const selectedDates = getDatesInRange(startDate, endDate);

  const filteredAppointments = appointments.filter(app => app.date >= startDate && app.date <= endDate);

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const getAppointment = (barberId, date, time) => {
    return filteredAppointments.find(app => String(app.barberId) === String(barberId) && app.date === date && app.time === time);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 4rem)' }}>
      <header style={{ flexShrink: 0, marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Painel Geral</h1>
          <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Visão de: <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ border: 'none', background: 'transparent', fontFamily: 'inherit', fontWeight: 600, color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }} />
            até <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ border: 'none', background: 'transparent', fontFamily: 'inherit', fontWeight: 600, color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }} />
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setIsSaleModalOpen(true)}>
            <ShoppingBag size={18} /> Nova Venda
          </button>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setIsModalOpen(true)}>
            <Calendar size={18} /> Novo Agendamento
          </button>
        </div>
      </header>

      <div style={{ flexShrink: 0, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <StatCard title="Total (Serv. + Prod.)" value={stats.count} icon={<Users size={20} />} trend={12} />
        <StatCard title="Ocupação Geral" value={`${Math.min(100, Math.round((filteredAppointments.length / (barbers.filter(b => b.role === 'Barbeiro' && b.status === 'Ativo').length * 9 || 1)) * 100))}%`} icon={<Calendar size={20} />} trend={8} />
        <StatCard title="Receita (Intervalo)" value={`R$ ${stats.revenue.toLocaleString('pt-BR')}`} icon={<Banknote size={20} />} trend={15} />
        <StatCard title="Ticket Médio" value={`R$ ${stats.averageTicket.toFixed(2)}`} icon={<TrendingUp size={20} />} trend={-2} />
      </div>

      {/* Multi-Date / Multi-Barber Agenda Grid */}
      <div className="glass-card" style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1, minHeight: 0 }}>
        <div style={{ overflow: 'auto', width: '100%', flex: 1 }}>
          
          {/* HEADER ROW - Sticky Top */}
          <div style={{ display: 'flex', width: 'max-content', position: 'sticky', top: 0, zIndex: 20, background: '#fcfcfc', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ width: '100px', flexShrink: 0, padding: '1.5rem', borderRight: '1px solid var(--border-color)', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', position: 'sticky', left: 0, top: 0, zIndex: 30, background: '#f8f9fa' }}>
              HORÁRIO
            </div>
            {selectedDates.map(date => (
              barbers.filter(b => b.role === 'Barbeiro' && b.status === 'Ativo').map(barber => (
                <div key={`${date}-${barber.id}`} style={{ width: '250px', flexShrink: 0, padding: '1.5rem', textAlign: 'center', borderRight: '1px solid var(--border-color)', background: '#fcfcfc' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-color)', marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>{date.split('-').reverse().join('/')}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', background: 'rgba(0,0,0,0.04)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                      {barber.name.charAt(0)}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{barber.name}</span>
                  </div>
                </div>
              ))
            ))}
          </div>

          {/* CONTENT ROWS */}
          <div style={{ width: 'max-content' }}>
            {timeSlots.map(time => (
              <div key={time} style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ width: '100px', flexShrink: 0, padding: '1.5rem', borderRight: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem', position: 'sticky', left: 0, zIndex: 10, background: '#fcfcfc' }}>
                  {time}
                </div>
              
              {selectedDates.map(date => (
                barbers.filter(b => b.role === 'Barbeiro' && b.status === 'Ativo').map(barber => {
                  const app = getAppointment(barber.id, date, time);
                  return (
                    <div 
                      key={`${date}-${barber.id}-${time}`}
                      style={{ 
                        width: '250px', 
                        flexShrink: 0,
                        padding: '10px', 
                        minHeight: '100px', 
                        position: 'relative', 
                        borderRight: '1px solid var(--border-color)',
                        background: app ? (app.status === 'Em progresso' ? 'rgba(37, 99, 235, 0.02)' : 'transparent') : 'transparent'
                      }}
                    >
                      {app ? (
                        <div className="fade-in" style={{ 
                          height: '100%', 
                          padding: '12px', 
                          borderRadius: '12px', 
                          background: app.status === 'Finalizado' ? '#f9fafb' : '#fff',
                          border: app.status === 'Em progresso' ? '1px solid rgba(37, 99, 235, 0.2)' : '1px solid var(--border-color)',
                          boxShadow: app.status === 'Em progresso' ? '0 4px 12px rgba(37, 99, 235, 0.08)' : '0 2px 4px rgba(0,0,0,0.02)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{app.customer}</span>
                              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: app.status === 'Em progresso' ? '#2563eb' : app.status === 'Finalizado' ? '#10b981' : '#e5e7eb' }}></div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              <Scissors size={10} /> {app.service}
                            </div>
                          </div>
                          {app.status === 'Em progresso' && (
                            <div style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <div className="pulse" /> Em atendimento
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="hover-visible" style={{ position: 'absolute', inset: '10px', border: '1px dashed var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: 0 }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>+ Disponível</span>
                        </div>
                      )}
                    </div>
                  );
                })
              ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div style={{ flexShrink: 0, marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#2563eb' }}></div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Em atendimento</span>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#10b981' }}></div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Finalizado</span>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#e5e7eb' }}></div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Agendado</span>
        </div>
      </div>

      {isSaleModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card fade-in" style={{ width: '400px', background: '#fff', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: 0 }}>Venda de Balcão (PDV)</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }} onClick={() => setIsSaleModalOpen(false)}><X size={20} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Venda rápida de produtos sem necessidade de agendamento.</p>
              
              <select value={saleData.productId} onChange={e => setSaleData({...saleData, productId: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}>
                <option value="">Selecione o Produto</option>
                {products.map(p => (
                  <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                    {p.name} - R$ {p.price} ({p.stock} em estoque)
                  </option>
                ))}
              </select>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Qtd:</label>
                <input 
                  type="number" 
                  min="1" 
                  value={saleData.quantity} 
                  onChange={e => setSaleData({...saleData, quantity: e.target.value})} 
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} 
                />
              </div>

              <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '10px', marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 700 }}>
                  <span>Total:</span>
                  <span>R$ {(products.find(p => String(p.id) === String(saleData.productId))?.price * saleData.quantity || 0).toLocaleString('pt-BR')}</span>
                </div>
              </div>

              <button className="btn-primary" style={{ marginTop: '1rem', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }} onClick={handleSaleProduct} disabled={!saleData.productId || saleData.quantity <= 0}>
                <ShoppingBag size={18} /> Finalizar Venda
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card fade-in" style={{ width: '400px', background: '#fff', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: 0 }}>Novo Agendamento</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }} onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" placeholder="Nome do Cliente" value={formData.customer} onChange={e => setFormData({...formData, customer: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
              <input type="tel" placeholder="Telefone (Opcional)" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
              
              <select value={formData.serviceId} onChange={e => setFormData({...formData, serviceId: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}>
                <option value="">Selecione o Serviço</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.name} - R$ {s.price}</option>)}
              </select>
              
              <select value={formData.barberId} onChange={e => setFormData({...formData, barberId: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}>
                <option value="">Selecione o Barbeiro</option>
                {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>

              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
                <select value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}>
                  {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <button className="btn-primary" style={{ marginTop: '1rem', padding: '12px' }} onClick={handleSaveAppointment} disabled={!formData.customer || !formData.serviceId || !formData.barberId}>
                Salvar Agendamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
