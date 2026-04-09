import React, { useState, useMemo } from 'react';
import { TrendingUp, Users, Calendar, Banknote, Clock, Scissors, X, ShoppingBag, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

const StatCard = ({ title, value, icon, trend, staggerClass, isGradient }) => (
  <div className={`glass-card ${staggerClass}`} style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '15px', position: 'relative', overflow: 'hidden' }}>
    {isGradient && <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}></div>}
    
    <div style={{ background: isGradient ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0,0,0,0.03)', padding: '12px', borderRadius: '12px', color: isGradient ? '#10b981' : '#000' }}>
      {icon}
    </div>
    <div style={{ flex: 1, zIndex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{title}</span>
        {trend !== undefined && (
          <span style={{ fontSize: '0.75rem', color: trend >= 0 ? '#10b981' : '#ef4444', fontWeight: 700, padding: '2px 6px', background: trend >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderRadius: '4px' }}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'Outfit', lineHeight: '1.2', marginTop: '4px' }} className={isGradient ? 'gradient-text' : ''}>
        {value}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { barbers, appointments, services, products, addAppointment, sellProduct, getFinancialStats, updateAppointmentStatus } = useApp();
  
  // UX logic: Focus strictly on ONE day for the agenda, but keep global stats based on a period.
  const todayStr = new Date().toISOString().split('T')[0];
  const [focusDate, setFocusDate] = useState(todayStr);
  const [statPeriod, setStatPeriod] = useState('hoje'); // hoje, semana, mes

  // Calculate period dates
  const periodDates = useMemo(() => {
    const end = new Date(focusDate); // End is always the focus date
    const start = new Date(focusDate);
    if (statPeriod === 'semana') start.setDate(start.getDate() - 7);
    if (statPeriod === 'mes') start.setMonth(start.getMonth() - 1);
    
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    }
  }, [focusDate, statPeriod]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedAppToPay, setSelectedAppToPay] = useState(null);
  const [paymentSplits, setPaymentSplits] = useState([{ method: 'Pix', amount: 0 }]);
  
  const [formData, setFormData] = useState({
    customer: '', phone: '', serviceId: '', barberId: '', time: '09:00', date: focusDate
  });
  const [saleData, setSaleData] = useState({ productId: '', quantity: 1, barberId: '' });

  const activeBarbers = barbers.filter(b => b.role === 'Barbeiro' && b.status === 'Ativo');

  // Load stats
  const stats = getFinancialStats(periodDates.start, periodDates.end);
  const agendaAppointments = appointments.filter(app => app.date === focusDate);

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
    setFormData({ customer: '', phone: '', serviceId: '', barberId: '', time: '09:00', date: focusDate });
  };

  const handleSaleProduct = async () => {
    if (!saleData.productId) return;
    const barberId = saleData.barberId ? parseInt(saleData.barberId) : null;
    const success = await sellProduct(parseInt(saleData.productId), parseInt(saleData.quantity), barberId);
    if (success) {
      setIsSaleModalOpen(false);
      setSaleData({ productId: '', quantity: 1, barberId: '' });
    } else {
      alert("Estoque insuficiente!");
    }
  };

  const handleAppClick = (app) => {
    if (app && app.status !== 'Finalizado') {
      setSelectedAppToPay(app);
      setPaymentSplits([{ method: 'Pix', amount: app.price }]);
      setIsPaymentModalOpen(true);
    }
  };

  const handleAddSplit = () => setPaymentSplits([...paymentSplits, { method: 'Pix', amount: 0 }]);
  
  const handleSplitChange = (index, field, value) => {
    const newSplits = [...paymentSplits];
    newSplits[index][field] = value;
    setPaymentSplits(newSplits);
  };

  const handleFinalizePayment = async () => {
    const totalPaid = paymentSplits.reduce((acc, curr) => acc + Number(curr.amount), 0);
    if (Math.abs(totalPaid - selectedAppToPay.price) > 0.01) {
      alert(`O valor total pago (R$ ${totalPaid}) deve ser igual ao valor do serviço (R$ ${selectedAppToPay.price})`);
      return;
    }
    await updateAppointmentStatus(selectedAppToPay.id, 'Finalizado', { payments: paymentSplits });
    setIsPaymentModalOpen(false);
    setSelectedAppToPay(null);
  };

  const openNewAppModal = (barberId = '', time = '09:00') => {
    setFormData({ customer: '', phone: '', serviceId: '', barberId: String(barberId), time, date: focusDate });
    setIsModalOpen(true);
  };

  const shiftDate = (days) => {
    const d = new Date(focusDate + "T12:00:00");
    d.setDate(d.getDate() + days);
    setFocusDate(d.toISOString().split('T')[0]);
  };

  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 4rem)', gap: '1.5rem' }}>
      
      {/* HEADER: Focus on quick navigation and primary actions */}
      <header style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '4px', letterSpacing: '-0.5px' }}>Workspace</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', background: 'var(--border-color)', borderRadius: '8px', padding: '4px' }}>
              <button 
                onClick={() => setStatPeriod('hoje')} 
                style={{ background: statPeriod === 'hoje' ? '#fff' : 'transparent', color: statPeriod === 'hoje' ? '#000' : 'var(--text-secondary)', padding: '4px 12px', fontSize: '0.8rem', borderRadius: '6px', boxShadow: statPeriod === 'hoje' ? 'var(--shadow-sm)' : 'none' }}>Hoje</button>
              <button 
                onClick={() => setStatPeriod('semana')} 
                style={{ background: statPeriod === 'semana' ? '#fff' : 'transparent', color: statPeriod === 'semana' ? '#000' : 'var(--text-secondary)', padding: '4px 12px', fontSize: '0.8rem', borderRadius: '6px', boxShadow: statPeriod === 'semana' ? 'var(--shadow-sm)' : 'none' }}>7 Dias</button>
              <button 
                onClick={() => setStatPeriod('mes')} 
                style={{ background: statPeriod === 'mes' ? '#fff' : 'transparent', color: statPeriod === 'mes' ? '#000' : 'var(--text-secondary)', padding: '4px 12px', fontSize: '0.8rem', borderRadius: '6px', boxShadow: statPeriod === 'mes' ? 'var(--shadow-sm)' : 'none' }}>30 Dias</button>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Visão de KPI ativa.</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px' }} onClick={() => setIsSaleModalOpen(true)}>
            <ShoppingBag size={18} /> Venda Rápida
          </button>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px', boxShadow: 'var(--shadow-md)' }} onClick={() => openNewAppModal()}>
            <Plus size={18} /> Agendamento
          </button>
        </div>
      </header>

      {/* STATS ROW */}
      <div style={{ flexShrink: 0, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
        <StatCard title="Total de Clientes" value={stats.count} icon={<Users size={20} />} trend={12} staggerClass="stagger-1" />
        <StatCard title="Ocupação" value={`${Math.min(100, Math.round((stats.appointments.length / (activeBarbers.length * 9 * (statPeriod==='hoje'?1:statPeriod==='semana'?7:30) || 1)) * 100))}%`} icon={<Calendar size={20} />} trend={8} staggerClass="stagger-2" />
        <StatCard title="Ticket Médio" value={`R$ ${stats.averageTicket.toFixed(2)}`} icon={<TrendingUp size={20} />} trend={-2} staggerClass="stagger-3" />
        <StatCard title="Receita (Período)" value={`R$ ${stats.revenue.toLocaleString('pt-BR')}`} icon={<Banknote size={20} />} isGradient={true} staggerClass="stagger-4" />
      </div>

      {/* DAILY SWIMLANES (Agenda) */}
      <div className="glass-card" style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1, minHeight: 0, border: '1px solid rgba(0,0,0,0.08)' }}>
        
        {/* Agenda Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', background: '#fcfcfc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 600 }}>Agenda Diária</h3>
            <div style={{ padding: '4px 10px', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
              {agendaAppointments.filter(a => a.status === 'Em progresso').length} Em atendimento
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => shiftDate(-1)} style={{ background: 'transparent', border: '1px solid var(--border-color)', padding: '6px', borderRadius: '8px', display: 'flex', color: 'var(--text-secondary)' }}><ChevronLeft size={18} /></button>
            <input type="date" value={focusDate} onChange={e => setFocusDate(e.target.value)} style={{ border: '1px solid var(--border-color)', background: '#fff', padding: '6px 12px', borderRadius: '8px', fontFamily: 'inherit', fontWeight: 600, color: 'var(--text-primary)', outline: 'none' }} />
            <button onClick={() => shiftDate(1)} style={{ background: 'transparent', border: '1px solid var(--border-color)', padding: '6px', borderRadius: '8px', display: 'flex', color: 'var(--text-secondary)' }}><ChevronRight size={18} /></button>
          </div>
        </div>

        {/* The Grid */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Time Column */}
          <div className="hide-scrollbar" style={{ width: '80px', flexShrink: 0, borderRight: '1px solid var(--border-color)', overflowY: 'auto', background: '#f8f9fa' }}>
            <div style={{ height: '60px', borderBottom: '1px solid transparent' }}></div> {/* Spacer for header */}
            {timeSlots.map(time => (
              <div key={time} style={{ height: '110px', display: 'flex', padding: '12px', justifyContent: 'center', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.8rem', position: 'relative' }}>
                <span style={{ position: 'relative', top: '-10px' }}>{time}</span>
              </div>
            ))}
          </div>

          {/* Barber Columns (Swimlanes) */}
          <div className="hide-scrollbar" style={{ flex: 1, display: 'flex', overflowX: 'auto', overflowY: 'auto' }}>
            {activeBarbers.map((barber) => (
              <div key={barber.id} style={{ minWidth: '300px', flex: 1, borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                
                {/* Barber Header */}
                <div style={{ height: '60px', position: 'sticky', top: 0, zIndex: 10, background: '#fcfcfc', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', padding: '0 15px', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', background: '#000', color: '#fff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700 }}>
                    {barber.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: '1.2' }}>{barber.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Profissional</div>
                  </div>
                </div>

                {/* Slots */}
                <div style={{ position: 'relative' }}>
                  {timeSlots.map((time, idx) => {
                    const app = agendaAppointments.find(a => String(a.barberId) === String(barber.id) && a.time === time);
                    return (
                      <div key={`${barber.id}-${time}`} className="hover-trigger" style={{ height: '110px', borderBottom: '1px dashed var(--border-color)', padding: '8px', position: 'relative' }}>
                        {app ? (
                          <div onClick={() => handleAppClick(app)} style={{
                            height: '100%', 
                            padding: '12px', 
                            borderRadius: '10px', 
                            cursor: app.status !== 'Finalizado' ? 'pointer' : 'default',
                            background: app.status === 'Finalizado' ? '#f0fdf4' : app.status === 'Em progresso' ? '#eff6ff' : '#fff',
                            border: app.status === 'Finalizado' ? '1px solid #bbf7d0' : app.status === 'Em progresso' ? '1px solid #bfdbfe' : '1px solid var(--border-color)',
                            boxShadow: app.status === 'Em progresso' ? '0 4px 12px rgba(37, 99, 235, 0.08)' : '0 2px 4px rgba(0,0,0,0.02)',
                            transition: 'all 0.2s',
                            display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                          }}>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#000' }}>{app.customer}</span>
                                <div style={{ background: app.status === 'Em progresso' ? '#2563eb' : app.status === 'Finalizado' ? '#10b981' : '#6b7280', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                  {app.status === 'Em progresso' ? 'Atendendo' : app.status === 'Finalizado' ? 'Pago' : 'Agendado'}
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                <Scissors size={12} /> {app.service}
                              </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                               <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-color)' }}>R$ {app.price.toFixed(2)}</span>
                            </div>
                          </div>
                        ) : (
                          // Empty slot hover active action
                          <div className="hover-visible" style={{ position: 'absolute', inset: '8px', border: '1px dashed #cbd5e1', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.01)' }}>
                            <button onClick={() => openNewAppModal(barber.id, time)} style={{ background: '#fff', color: '#000', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                              <Plus size={14} /> Reservar
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODALS */}
      {/* Venda Modal */}
      {isSaleModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card fade-in" style={{ width: '420px', background: '#fff', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: 0 }}>Venda Direta (PDV)</h2>
              <button style={{ background: 'none' }} onClick={() => setIsSaleModalOpen(false)}><X size={20} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <select value={saleData.productId} onChange={e => setSaleData({...saleData, productId: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}>
                <option value="">Selecione o Produto</option>
                {products.map(p => (
                  <option key={p.id} value={p.id} disabled={p.stock <= 0}>{p.name} - R$ {p.price} ({p.stock} un.)</option>
                ))}
              </select>
              <select value={saleData.barberId} onChange={e => setSaleData({...saleData, barberId: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}>
                <option value="">Profissional Destino (Opcional)</option>
                {activeBarbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Qtd:</label>
                <input type="number" min="1" value={saleData.quantity} onChange={e => setSaleData({...saleData, quantity: e.target.value})} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
              </div>
              <button className="btn-primary" style={{ marginTop: '0.5rem', padding: '14px', display: 'flex', gap: '10px', justifyContent: 'center' }} onClick={handleSaleProduct} disabled={!saleData.productId || saleData.quantity <= 0}>
                <ShoppingBag size={18} /> Confirmar Venda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Agendamento Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card fade-in" style={{ width: '420px', background: '#fff', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Reservar Horário</h2>
              <button style={{ background: 'none' }} onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" placeholder="Nome do Cliente" value={formData.customer} onChange={e => setFormData({...formData, customer: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
              <select value={formData.serviceId} onChange={e => setFormData({...formData, serviceId: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <option value="">Serviço</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.name} - R$ {s.price}</option>)}
              </select>
              <select value={formData.barberId} onChange={e => setFormData({...formData, barberId: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <option value="">Profissional</option>
                {activeBarbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                <select value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
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

      {/* Pagamento Modal */}
      {isPaymentModalOpen && selectedAppToPay && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card fade-in" style={{ width: '450px', background: '#fff', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Check-out de Cliente</h2>
              <button style={{ background: 'none' }} onClick={() => setIsPaymentModalOpen(false)}><X size={20} /></button>
            </div>
            
            <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '10px', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600 }}>{selectedAppToPay.customer}</span>
                <span style={{ fontWeight: 700, color: '#10b981', fontSize: '1.1rem' }}>R$ {selectedAppToPay.price.toFixed(2)}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {selectedAppToPay.service}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Composição de Pagamento</label>
                <button onClick={handleAddSplit} style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 10px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', gap: '4px' }}>
                  <Plus size={14}/> Dividir
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                      <button onClick={() => setPaymentSplits(paymentSplits.filter((_, i) => i !== index))} style={{ background: 'none', color: '#ef4444', padding: '0 8px' }}>
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button className="btn-primary" style={{ width: '100%', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }} onClick={handleFinalizePayment}>
              <Banknote size={18} /> Finalizar Recebimento
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
