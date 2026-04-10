import React, { useState, useMemo } from 'react';
import { TrendingUp, Users, Calendar, Banknote, Clock, Scissors, X, ShoppingBag, Plus, ChevronLeft, ChevronRight, ChevronDown, LayoutGrid, ArrowUpRight, BarChart3, Sparkles, Star, CheckCircle, XCircle, Play } from 'lucide-react';
import { useApp } from '../context/AppContext';

/* ─────────── KPI Card ─────────── */
const KpiCard = ({ label, value, trend, trendLabel, iconEl, iconClass, stagger }) => (
  <div className={`dash-kpi-card stagger-${stagger}`}>
    <div className="dash-kpi-top">
      <span className="dash-kpi-label">{label}</span>
      <div className="dash-kpi-arrow"><ChevronRight size={14} /></div>
    </div>
    <div className="dash-kpi-bottom">
      <div>
        <div className="dash-kpi-value">{value}</div>
        {trend !== undefined && (
          <span className={`dash-kpi-trend ${trend >= 0 ? 'up' : 'down'}`}>
            {trend > 0 ? '+' : ''}{trend}% {trendLabel || 'vs último período'}
          </span>
        )}
      </div>
      <div className={`dash-kpi-icon ${iconClass}`}>
        {iconEl}
      </div>
    </div>
  </div>
);

/* ─────────── Mini Calendar ─────────── */
const MiniCalendar = ({ focusDate }) => {
  const today = new Date();
  const d = new Date(focusDate + 'T12:00:00');
  const dayOfWeek = d.getDay();
  const startOfWeek = new Date(d);
  startOfWeek.setDate(d.getDate() - dayOfWeek);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const dd = new Date(startOfWeek);
    dd.setDate(startOfWeek.getDate() + i);
    days.push(dd);
  }
  const dayLabels = ['Do', 'Se', 'Te', 'Qu', 'Qu', 'Se', 'Sá'];

  return (
    <div className="dash-mini-cal">
      <div className="dash-mini-cal-grid">
        {dayLabels.map((l, i) => (
          <div key={i} className="dash-mini-cal-day-label">{l}</div>
        ))}
        {days.map((dd, i) => {
          const isToday = dd.getDate() === today.getDate() && dd.getMonth() === today.getMonth() && dd.getFullYear() === today.getFullYear();
          return (
            <div key={i} className={`dash-mini-cal-day ${isToday ? 'today' : ''}`}>
              {dd.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─────────── Main Dashboard ─────────── */
const Dashboard = () => {
  const {
    barbers, appointments, services, products,
    addAppointment, sellProduct, getFinancialStats, getBarberRanking,
    updateAppointmentStatus, cancelAppointment, currentUser
  } = useApp();
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [focusDate, setFocusDate] = useState(todayStr);
  const [statPeriod, setStatPeriod] = useState('semana');
  const isBarber = currentUser?.role === 'Barbeiro';

  const periodDates = useMemo(() => {
    const end = new Date(focusDate);
    const start = new Date(focusDate);
    if (statPeriod === 'semana') start.setDate(start.getDate() - 7);
    else if (statPeriod === 'mes') start.setMonth(start.getMonth() - 1);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  }, [focusDate, statPeriod]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);

  // ─── Action Modal State (replaces the old payment-only modal) ───
  const [actionModal, setActionModal] = useState({ open: false, app: null, step: 'choose' }); // step: 'choose' | 'payment' | 'confirm-cancel'
  const [paymentSplits, setPaymentSplits] = useState([{ method: 'Pix', amount: 0 }]);
  
  const [formData, setFormData] = useState({
    customer: '', phone: '', serviceId: '', barberId: '', time: '09:00', date: focusDate
  });
  const [saleData, setSaleData] = useState({ productId: '', quantity: 1, barberId: '' });

  const activeBarbers = barbers.filter(b => b.role === 'Barbeiro' && b.status === 'Ativo');
  const stats = getFinancialStats(periodDates.start, periodDates.end);
  const ranking = getBarberRanking(periodDates.start, periodDates.end);

  // Recent activity — already filtered by backend for barbers
  const recentActivity = useMemo(() => {
    return [...appointments]
      .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`))
      .slice(0, 6);
  }, [appointments]);

  // Upcoming — already filtered by backend for barbers
  const upcoming = useMemo(() => {
    return appointments
      .filter(a => a.status === 'Agendado' && a.date >= todayStr)
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
      .slice(0, 5);
  }, [appointments, todayStr]);

  // Stats
  const totalFinished = stats.appointments.length;
  const totalAppointments = appointments.filter(a => a.date >= periodDates.start && a.date <= periodDates.end).length;
  const finishRate = totalAppointments > 0 ? Math.round((totalFinished / totalAppointments) * 100) : 0;
  const barberCount = isBarber ? 1 : activeBarbers.length;
  const capacity = barberCount * 9 * (statPeriod === 'hoje' ? 1 : statPeriod === 'semana' ? 7 : 30) || 1;
  const occupancyRate = Math.min(100, Math.round((totalAppointments / capacity) * 100));

  /* ─── Handlers ─── */
  const handleSaveAppointment = () => {
    if (!formData.customer || !formData.serviceId || !formData.barberId) return;
    const selectedService = services.find(s => String(s.id) === String(formData.serviceId));
    addAppointment({
      customer: formData.customer, phone: formData.phone,
      service: selectedService?.name || 'Serviço',
      barberId: parseInt(formData.barberId),
      date: formData.date, time: formData.time,
      status: 'Agendado', price: selectedService?.price || 0
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
    } else { alert("Estoque insuficiente!"); }
  };

  // ─── Action Modal handlers ───
  const openActionModal = (app) => {
    if (!app || app.status === 'Finalizado' || app.status === 'Cancelado') return;
    setActionModal({ open: true, app, step: 'choose' });
    setPaymentSplits([{ method: 'Pix', amount: app.price }]);
  };

  const closeActionModal = () => {
    setActionModal({ open: false, app: null, step: 'choose' });
  };

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

  const openNewAppModal = (barberId = '', time = '09:00') => {
    const defaultBarberId = isBarber ? String(currentUser.id) : String(barberId);
    setFormData({ customer: '', phone: '', serviceId: '', barberId: defaultBarberId, time, date: focusDate });
    setIsModalOpen(true);
  };

  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  const periodLabel = statPeriod === 'hoje' ? 'Hoje' : statPeriod === 'semana' ? 'Últimos 7 dias' : 'Últimos 30 dias';
  const barberColors = ['#000', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0'];
  const maxRevenue = ranking.length > 0 ? Math.max(...ranking.map(b => b.revenue), 1) : 1;

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Finalizado': return { dot: 'green', label: 'Pago' };
      case 'Em progresso': return { dot: 'blue', label: 'Em atendimento' };
      case 'Agendado': return { dot: 'amber', label: 'Agendado' };
      case 'Cancelado': return { dot: 'red', label: 'Cancelado' };
      default: return { dot: '', label: status };
    }
  };

  const upcomingIcons = [
    { cls: 'scissors', icon: <Scissors size={18} /> },
    { cls: 'chart', icon: <BarChart3 size={18} /> },
    { cls: 'star', icon: <Star size={18} /> },
    { cls: 'sparkle', icon: <Sparkles size={18} /> },
  ];

  return (
    <div className="dash-page">

      {/* ═══════ HEADER ═══════ */}
      <div className="dash-header">
        <h1>{isBarber ? `Meu Dashboard` : 'Dashboard'}</h1>
        <div className="dash-header-actions">
          <button className="dash-period-selector" onClick={() => {
            const next = statPeriod === 'hoje' ? 'semana' : statPeriod === 'semana' ? 'mes' : 'hoje';
            setStatPeriod(next);
          }}>
            <Calendar size={16} />
            {periodLabel}
            <ChevronDown size={14} />
          </button>
          {!isBarber && (
            <button className="dash-action-btn secondary" onClick={() => setIsSaleModalOpen(true)}>
              <ShoppingBag size={16} /> Venda Rápida
            </button>
          )}
          <button className="dash-action-btn primary" onClick={() => openNewAppModal()}>
            <Plus size={16} /> Agendamento
          </button>
        </div>
      </div>

      {/* ═══════ KPI ROW ═══════ */}
      <div className="dash-kpi-row">
        <KpiCard label="Receita Total" value={`R$${stats.revenue.toLocaleString('pt-BR')}`} trend={8} trendLabel="vs último período" iconEl={<Banknote size={22} />} iconClass="green" stagger={1} />
        <KpiCard label="Ocupação" value={`${occupancyRate}%`} trend={-3} trendLabel="vs último período" iconEl={<TrendingUp size={22} />} iconClass="purple" stagger={2} />
        <KpiCard label="Taxa de Finalização" value={`${finishRate}%`} trend={5} trendLabel="vs último período" iconEl={<Clock size={22} />} iconClass="amber" stagger={3} />
        <KpiCard label="Ticket Médio" value={`R$${stats.averageTicket.toFixed(0)}`} trend={2} trendLabel="vs último período" iconEl={<BarChart3 size={22} />} iconClass="slate" stagger={4} />
      </div>

      {/* ═══════ BOTTOM 3-COLUMN GRID ═══════ */}
      <div className="dash-bottom-grid">

        {/* ─── Col 1: Performance ─── */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <h3>{isBarber ? 'Minha Performance' : 'Performance por Barbeiro'}</h3>
            <div className="dash-toggle-group">
              {[{ k: 'hoje', l: 'Dia' }, { k: 'semana', l: 'Semana' }, { k: 'mes', l: 'Mês' }].map(p => (
                <button key={p.k} className={`dash-toggle-btn ${statPeriod === p.k ? 'active' : ''}`} onClick={() => setStatPeriod(p.k)}>
                  {p.l}
                </button>
              ))}
            </div>
          </div>
          <div className="dash-panel-body">
            {ranking.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
                Nenhum dado encontrado para este período.
              </p>
            ) : (
              ranking.map((barber, idx) => (
                <div key={barber.id} className="dash-bar-item">
                  <div className="dash-bar-label">
                    <div className="dash-bar-name">
                      <div className="dash-bar-avatar" style={{ background: barberColors[idx] || '#94a3b8' }}>
                        {barber.name.charAt(0)}
                      </div>
                      {barber.name}
                    </div>
                    <span className="dash-bar-value">R$ {barber.revenue.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="dash-bar-track">
                    <div className="dash-bar-fill" style={{ width: `${(barber.revenue / maxRevenue) * 100}%`, background: barberColors[idx] || '#94a3b8' }} />
                  </div>
                  {/* Extra stats for barbers viewing their own data */}
                  {isBarber && (
                    <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <span>🎯 {barber.count} atendimentos</span>
                      <span>💈 R$ {barber.serviceRevenue.toLocaleString('pt-BR')} serviços</span>
                      <span>🛒 R$ {barber.productRevenue.toLocaleString('pt-BR')} produtos</span>
                    </div>
                  )}
                </div>
              ))
            )}
            {!isBarber && ranking.length > 0 && (
              <div style={{ display: 'flex', gap: '20px', marginTop: '8px', flexWrap: 'wrap' }}>
                {ranking.slice(0, 3).map((b, idx) => (
                  <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: barberColors[idx] }} />
                    {b.name.split(' ')[0]}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── Col 2: Atividade Recente ─── */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <h3>Atividade Recente</h3>
            <button className="dash-icon-btn"><LayoutGrid size={16} /></button>
          </div>
          <div className="dash-panel-body">
            {recentActivity.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
                Nenhuma atividade recente.
              </p>
            ) : (
              <div className="dash-timeline">
                {recentActivity.map((app, idx) => {
                  const cfg = getStatusConfig(app.status);
                  const dateParts = app.date.split('-');
                  const dateStr = `${dateParts[2]}.${dateParts[1]}.${dateParts[0].slice(2)}`;
                  const barberName = barbers.find(b => b.id === app.barberId)?.name || '';
                  const isActionable = app.status !== 'Finalizado' && app.status !== 'Cancelado';
                  return (
                    <div key={app.id} className="dash-timeline-item" onClick={() => isActionable && openActionModal(app)} style={{ cursor: isActionable ? 'pointer' : 'default' }}>
                      <div className="dash-timeline-time">{dateStr}</div>
                      <div className="dash-timeline-dot-col">
                        <div className={`dash-timeline-dot ${cfg.dot}`} />
                        {idx < recentActivity.length - 1 && <div className="dash-timeline-line" />}
                      </div>
                      <div className="dash-timeline-content">
                        <h4>{cfg.label}</h4>
                        <p>{app.customer} — {app.service}{!isBarber ? ` (${barberName})` : ''}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ─── Col 3: Próximos Agendamentos ─── */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <h3>Próximos Agendamentos</h3>
            <button className="dash-icon-btn"><Calendar size={16} /></button>
          </div>
          <div className="dash-panel-body">
            <MiniCalendar focusDate={focusDate} />
            {upcoming.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
                Nenhum agendamento próximo.
              </p>
            ) : (
              upcoming.map((app, idx) => {
                const ic = upcomingIcons[idx % upcomingIcons.length];
                const barberName = barbers.find(b => b.id === app.barberId)?.name?.split(' ')[0] || '';
                return (
                  <div key={app.id} className="dash-upcoming-item" onClick={() => openActionModal(app)} style={{ cursor: 'pointer' }}>
                    <div className={`dash-upcoming-icon ${ic.cls}`}>{ic.icon}</div>
                    <div className="dash-upcoming-info">
                      <h4>{app.customer}</h4>
                      <p>{app.time}{!isBarber ? ` — ${barberName}` : ''}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ═══════ ACTION MODAL (Pago / Cancelar / Em Progresso) ═══════ */}
      {actionModal.open && actionModal.app && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card fade-in" style={{ width: '480px', background: '#fff', padding: '2rem' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', margin: 0 }}>
                {actionModal.step === 'choose' ? 'Ação do Agendamento' : actionModal.step === 'payment' ? 'Check-out — Pagamento' : 'Confirmar Cancelamento'}
              </h2>
              <button style={{ background: 'none' }} onClick={closeActionModal}><X size={20} /></button>
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

            {/* Step: Choose Action */}
            {actionModal.step === 'choose' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {actionModal.app.status === 'Agendado' && (
                  <button onClick={handleMarkInProgress} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderRadius: '12px',
                    background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)', color: '#2563eb',
                    fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s'
                  }}>
                    <Play size={18} /> Iniciar Atendimento
                  </button>
                )}
                <button onClick={() => setActionModal({ ...actionModal, step: 'payment' })} style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderRadius: '12px',
                  background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', color: '#10b981',
                  fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s'
                }}>
                  <CheckCircle size={18} /> Marcar como Pago
                </button>
                <button onClick={() => setActionModal({ ...actionModal, step: 'confirm-cancel' })} style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderRadius: '12px',
                  background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', color: '#ef4444',
                  fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s'
                }}>
                  <XCircle size={18} /> Cancelar Agendamento
                </button>
              </div>
            )}

            {/* Step: Payment Details */}
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
                        <button onClick={() => setPaymentSplits(paymentSplits.filter((_, i) => i !== index))} style={{ background: 'none', color: '#ef4444', padding: '0 8px' }}>
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
                  <button onClick={handleCancelAppointment} style={{ flex: 2, padding: '14px', background: '#ef4444', color: '#fff', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <XCircle size={18} /> Confirmar Cancelamento
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════ VENDA MODAL ═══════ */}
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
                {products.map(p => (<option key={p.id} value={p.id} disabled={p.stock <= 0}>{p.name} - R$ {p.price} ({p.stock} un.)</option>))}
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

      {/* ═══════ AGENDAMENTO MODAL ═══════ */}
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
              {/* Barbers can only book for themselves */}
              {isBarber ? (
                <div style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#f8f9fa', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Profissional: <strong style={{ color: 'var(--text-primary)' }}>{currentUser.name}</strong>
                </div>
              ) : (
                <select value={formData.barberId} onChange={e => setFormData({...formData, barberId: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <option value="">Profissional</option>
                  {activeBarbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              )}
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
    </div>
  );
};

export default Dashboard;
