import React, { useState, useMemo } from 'react';
import {
  TrendingUp, DollarSign, PieChart, Sparkles, User, Filter,
  ArrowUpRight, ArrowDownRight, Info, ShoppingBag, Scissors, Trophy, Store, LayoutList, CreditCard, Plus, Edit2, Trash2, X, Wallet
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const Finance = () => {
  const { barbers, appointments, productSales, getFinancialStats, getBarberRanking, currentUser, expenses, addExpense, removeExpense, updateExpense } = useApp();

  const getLocalDateStr = (d) => {
    let dt = new Date(d);
    dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
    return dt.toISOString().split('T')[0];
  };

  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [startDate, setStartDate] = useState(getLocalDateStr(firstDay));
  const [endDate, setEndDate] = useState(getLocalDateStr(lastDay));
  
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [expenseForm, setExpenseForm] = useState({ description: '', amount: '', date: getLocalDateStr(new Date()), category: 'Operacional' });

  const handleOpenExpenseModal = (expense = null) => {
    if (expense) {
      setEditingExpenseId(expense.id);
      setExpenseForm({ description: expense.description, amount: expense.amount, date: expense.date, category: expense.category || 'Operacional' });
    } else {
      setEditingExpenseId(null);
      setExpenseForm({ description: '', amount: '', date: startDate, category: 'Operacional' });
    }
    setIsExpenseModalOpen(true);
  };

  const handleSaveExpense = () => {
    if (!expenseForm.description || !expenseForm.amount) return;
    if (editingExpenseId) {
      updateExpense(editingExpenseId, expenseForm);
    } else {
      addExpense(expenseForm);
    }
    setIsExpenseModalOpen(false);
  };

  
  // Barbers must only see their own data
  const [selectedView, setSelectedView] = useState(() => {
    return currentUser?.role === 'Barbeiro' ? String(currentUser.id) : 'geral';
  });

  const stats = useMemo(() => getFinancialStats(startDate, endDate, selectedView === 'geral' ? null : selectedView), [startDate, endDate, selectedView, getFinancialStats, appointments, productSales]);
  
  const ranking = useMemo(() => getBarberRanking(startDate, endDate), [startDate, endDate, getBarberRanking, appointments, productSales, barbers]);
  
  const barberShopProductStats = useMemo(() => getFinancialStats(startDate, endDate, 'barbershop'), [startDate, endDate, getFinancialStats, productSales]);
  
  const selectedBarber = useMemo(() => barbers.find(b => String(b.id) === selectedView), [barbers, selectedView]);

  // Meticulous Financial Calculations
  const revenueByService = useMemo(() => {
    const acc = {};
    const count = {};
    if (!stats.appointments) return [];
    stats.appointments.forEach(app => {
      const srv = app.service || 'Outros';
      acc[srv] = (acc[srv] || 0) + app.price;
      count[srv] = (count[srv] || 0) + 1;
    });
    return Object.entries(acc)
      .map(([name, total]) => ({ name, total, count: count[name] }))
      .sort((a, b) => b.total - a.total);
  }, [stats.appointments]);

  const revenueByMethod = useMemo(() => {
    const acc = {};
    let totalComputed = 0;
    if (!stats.appointments) return [];
    stats.appointments.forEach(app => {
      // Compatibility with split payments
      if (app.payments && Array.isArray(app.payments)) {
        app.payments.forEach(p => {
          acc[p.method] = (acc[p.method] || 0) + Number(p.amount || 0);
          totalComputed += Number(p.amount || 0);
        });
      } else {
        // Fallback for older entries without payments structured array
        acc['Outros'] = (acc['Outros'] || 0) + app.price;
        totalComputed += app.price;
      }
    });
    // Add product sales to the payment methods (Assuming they are mostly Dinheiro/Pix, we will bundle them as 'Caixa Balcão' for precise UI)
    if (stats.sales && stats.sales.length > 0) {
      stats.sales.forEach(sale => {
        acc['Caixa Bar.]'] = (acc['Caixa Bar.]'] || 0) + (sale.price * sale.quantity);
        totalComputed += (sale.price * sale.quantity);
      });
    }
    
    return {
      methods: Object.entries(acc)
        .map(([method, total]) => ({ method, total, pct: totalComputed > 0 ? (total / totalComputed) * 100 : 0 }))
        .sort((a, b) => b.total - a.total),
      total: totalComputed
    };
  }, [stats.appointments, stats.sales]);

  const formatCurrency = (val) => `R$ ${(val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const viewLabel = selectedView === 'geral'
    ? 'Visão Geral'
    : selectedView === 'barbershop'
    ? '🏪 Barbearia (Produtos)'
    : selectedBarber?.name || 'Barbeiro';

  return (
    <>
      {isExpenseModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card fade-in" style={{ width: '400px', background: 'var(--surface-color)', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{editingExpenseId ? 'Editar Despesa' : 'Nova Despesa'}</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => setIsExpenseModalOpen(false)}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" placeholder="Descrição (Ex: Conta de Luz)" value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }}>R$</span>
                <input type="number" placeholder="0.00" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} style={{ width: '100%', padding: '12px 12px 12px 35px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="date" value={expenseForm.date} onChange={e => setExpenseForm({...expenseForm, date: e.target.value})} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
                <select value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}>
                  <option value="Operacional">Operacional</option>
                  <option value="Insumos">Insumos</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Salários">Salários</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
              <button className="btn-primary" style={{ marginTop: '1rem', padding: '14px' }} onClick={handleSaveExpense} disabled={!expenseForm.description || !expenseForm.amount}>
                {editingExpenseId ? 'Salvar Alterações' : 'Registrar Despesa'}
              </button>
            </div>
          </div>
        </div>
      )}

    <div className="fade-in">
      {/* Header */}
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Gestão Financeira</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Relatórios detalhados e análise. Visualizando: <strong>{viewLabel}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Date Range */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface-color)', padding: '6px 16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>De:</span>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, color: 'var(--text-primary)' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '10px' }}>Até:</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, color: 'var(--text-primary)' }} />
          </div>
        </div>
      </header>

      {/* View Selector Tabs - Habilitado apenas para Administradores/Gerentes */}
      {currentUser?.role !== 'Barbeiro' && (
      <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setSelectedView('geral')}
          style={{
            padding: '8px 20px', borderRadius: '20px', border: '1px solid var(--border-color)',
            background: selectedView === 'geral' ? 'var(--accent-color)' : 'var(--surface-color)',
            color: selectedView === 'geral' ? 'var(--accent-text)' : 'var(--text-primary)',
            fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}
        >
          <TrendingUp size={14} /> Geral
        </button>

        <button
          onClick={() => setSelectedView('barbershop')}
          style={{
            padding: '8px 20px', borderRadius: '20px', border: '1px solid var(--border-color)',
            background: selectedView === 'barbershop' ? 'var(--accent-color)' : 'var(--surface-color)',
            color: selectedView === 'barbershop' ? 'var(--accent-text)' : 'var(--text-primary)',
            fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}
        >
          <Store size={14} /> Barbearia (Produtos)
        </button>

        {barbers.filter(b => b.role === 'Barbeiro').map(barber => (
          <button
            key={barber.id}
            onClick={() => setSelectedView(String(barber.id))}
            style={{
              padding: '8px 20px', borderRadius: '20px', border: '1px solid var(--border-color)',
              background: selectedView === String(barber.id) ? 'var(--accent-color)' : 'var(--surface-color)',
              color: selectedView === String(barber.id) ? 'var(--accent-text)' : 'var(--text-primary)',
              fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <User size={14} /> {barber.name}
          </button>
        ))}
      </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>FATURAMENTO BRUTO</span>
            <div style={{ background: 'var(--icon-bg)', padding: '8px', borderRadius: '8px' }}><DollarSign size={16} /></div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>{formatCurrency(stats.revenue)}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Serviços + Produtos</div>
        </div>

        <div className="glass-card" style={{ borderLeft: '4px solid var(--brand-600)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>SERVIÇOS</span>
            <div style={{ background: 'var(--brand-50)', padding: '8px', borderRadius: '8px', color: 'var(--brand-600)' }}><Scissors size={16} /></div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--brand-600)', marginBottom: '4px' }}>{formatCurrency(stats.serviceRevenue)}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{stats.appointments?.length || 0} atendimentos</div>
        </div>

        <div className="glass-card" style={{ borderLeft: '4px solid var(--brand-800)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>PRODUTOS (BARBEARIA)</span>
            <div style={{ background: 'var(--brand-50)', padding: '8px', borderRadius: '8px', color: 'var(--brand-800)' }}><ShoppingBag size={16} /></div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--brand-800)', marginBottom: '4px' }}>{formatCurrency(stats.productRevenue)}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{stats.sales?.length || 0} vendas</div>
        </div>

        {selectedView === 'geral' && (
          <div className="glass-card" style={{ borderLeft: '4px solid #ef4444' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>DESPESAS</span>
              <div style={{ background: 'rgba(239,68,68,0.05)', padding: '8px', borderRadius: '8px', color: '#ef4444' }}><PieChart size={16} /></div>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>{formatCurrency(stats.expenses)}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Operacional fixo</div>
          </div>
        )}

        <div className="glass-card" style={{ borderLeft: '4px solid var(--brand-500)', background: 'var(--brand-50)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {selectedView === 'geral' ? 'LUCRO LÍQUIDO' : 'RECEITA LÍQUIDA'}
            </span>
            <div style={{ background: 'var(--brand-100)', padding: '8px', borderRadius: '8px', color: 'var(--brand-600)' }}><TrendingUp size={16} /></div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--brand-600)', marginBottom: '4px' }}>
            {formatCurrency(selectedView === 'geral' ? stats.profit : stats.revenue)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--brand-600)', fontWeight: 600 }}>
            Ticket médio: {formatCurrency(stats.averageTicket)}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedView === 'geral' ? '1fr 1fr' : '1fr', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* Receitas x Despesas - Apenas Visão Geral */}
        {selectedView === 'geral' && (
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Wallet size={20} />
                <h3 style={{ fontSize: '1.1rem' }}>Receitas x Despesas</h3>
              </div>
              <button className="btn-primary" onClick={() => handleOpenExpenseModal()} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.8rem' }}>
                <Plus size={14} /> Nova Despesa
              </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ flex: 1, background: 'var(--brand-50)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--brand-200)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--brand-800)', fontWeight: 600, marginBottom: '4px' }}>RECEITAS TOTAIS</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--brand-600)' }}>{formatCurrency(stats.revenue)}</div>
              </div>
              <div style={{ flex: 1, background: 'rgba(239,68,68,0.05)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.15)' }}>
                <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600, marginBottom: '4px' }}>DESPESAS TOTAIS</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ef4444' }}>{formatCurrency(stats.expenses)}</div>
              </div>
            </div>

            {/* Lista de Despesas */}
            <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Despesas do Período</h4>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }} className="hide-scrollbar">
              {stats.expensesList && stats.expensesList.length === 0 ? (
                 <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>Nenhuma despesa registrada no período.</p>
              ) : (
                stats.expensesList?.map(exp => (
                  <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--panel-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{exp.description}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{exp.category} · {exp.date?.split('-').reverse().join('/')}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ fontWeight: 700, color: '#ef4444' }}>- {formatCurrency(exp.amount)}</div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => handleOpenExpenseModal(exp)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><Edit2 size={16} /></button>
                        <button onClick={() => { if(window.confirm('Excluir despesa?')) removeExpense(exp.id); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Receita de Produtos da Barbearia (sem barbeiro) */}
            {barberShopProductStats.productRevenue > 0 && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--brand-50)', borderRadius: '10px', border: '1px solid var(--brand-200)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Store size={16} style={{ color: 'var(--brand-800)' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Barbearia (Balcão)</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Vendas sem barbeiro vinculado</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--brand-800)' }}>
                    {formatCurrency(barberShopProductStats.productRevenue)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Advanced BI Dashboards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Dashboard 1: Desempenho por Mix de Serviços */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
              <LayoutList size={20} />
              <h3 style={{ fontSize: '1.1rem' }}>Desempenho por Mix de Serviços</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {revenueByService.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>Sem serviços no período.</p>
              ) : (
                revenueByService.map((srv, idx) => {
                  const maxTotal = revenueByService[0].total || 1;
                  const pct = (srv.total / maxTotal) * 100;
                  return (
                    <div key={srv.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{srv.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                            {srv.count} execuções
                          </div>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{formatCurrency(srv.total)}</div>
                      </div>
                      <div style={{ height: '6px', background: 'var(--panel-bg)', borderRadius: '3px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: idx === 0 ? 'var(--brand-600)' : 'var(--brand-300)', borderRadius: '3px', transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Dashboard 2: Mapa de Pagamentos (Conciliação de Dinheiro vs Digital) */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
              <CreditCard size={20} />
              <h3 style={{ fontSize: '1.1rem' }}>Conciliação de Pagamentos</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {revenueByMethod.methods.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>Sem receita apurada.</p>
              ) : (
                revenueByMethod.methods.map((methodObj, idx) => {
                  const methodColors = {
                    'Pix': 'var(--brand-500)', // green
                    'Cartão de Crédito': 'var(--brand-800)', // purple
                    'Cartão de Débito': 'var(--brand-600)', // blue
                    'Dinheiro': 'var(--brand-400)', // orange
                    'Caixa Bar.]': 'var(--brand-900)', // red
                    'Outros': 'var(--text-secondary)'
                  };
                  const color = methodColors[methodObj.method] || 'var(--brand-300)';
                  
                  return (
                    <div key={methodObj.method}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }}></div>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{methodObj.method === 'Caixa Bar.]' ? 'Produtos (Não-classificado)' : methodObj.method}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{methodObj.pct.toFixed(1)}%</span>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{formatCurrency(methodObj.total)}</span>
                        </div>
                      </div>
                      <div style={{ height: '6px', background: 'var(--panel-bg)', borderRadius: '3px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <div style={{ height: '100%', width: `${methodObj.pct}%`, background: color, borderRadius: '3px', transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Tabela de Vendas de Produtos */}
      {(selectedView === 'geral' || selectedView === 'barbershop' || selectedView !== 'geral') && stats.sales?.length > 0 && (
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <ShoppingBag size={20} />
            <h3 style={{ fontSize: '1.1rem' }}>
              Vendas de Produtos
              {selectedView === 'barbershop' ? ' — Barbearia (sem barbeiro)' : selectedView === 'geral' ? ' — Todas as fontes' : ` — ${selectedBarber?.name}`}
            </h3>
            <span style={{
              marginLeft: 'auto', background: 'var(--brand-100)', color: 'var(--brand-800)',
              padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600
            }}>
              {formatCurrency(stats.productRevenue)}
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  {['Produto', 'Qtd', 'Preço Unit.', 'Total', 'Data', 'Responsável'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.sales.map(sale => (
                  <tr key={sale.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px', fontWeight: 600, fontSize: '0.9rem' }}>{sale.productName}</td>
                    <td style={{ padding: '12px', fontSize: '0.9rem' }}>{sale.quantity}</td>
                    <td style={{ padding: '12px', fontSize: '0.9rem' }}>{formatCurrency(sale.price)}</td>
                    <td style={{ padding: '12px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--brand-800)' }}>{formatCurrency(sale.price * sale.quantity)}</td>
                    <td style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {sale.date?.split('-').reverse().join('/')}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {sale.barber ? (
                        <span style={{ background: 'var(--icon-bg)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                          {sale.barber.name}
                        </span>
                      ) : (
                        <span style={{ background: 'var(--brand-100)', color: 'var(--brand-800)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                          🏪 Barbearia
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tabela de Atendimentos — quando visualizando barbeiro individual */}
      {selectedView !== 'geral' && selectedView !== 'barbershop' && stats.appointments?.length > 0 && (
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <Scissors size={20} />
            <h3 style={{ fontSize: '1.1rem' }}>Atendimentos — {selectedBarber?.name}</h3>
            <span style={{
              marginLeft: 'auto', background: 'var(--brand-100)', color: 'var(--brand-600)',
              padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600
            }}>
              {formatCurrency(stats.serviceRevenue)}
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  {['Cliente', 'Serviço', 'Data', 'Horário', 'Valor'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.appointments.map(app => (
                  <tr key={app.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px', fontWeight: 600, fontSize: '0.9rem' }}>{app.customer}</td>
                    <td style={{ padding: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{app.service}</td>
                    <td style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{app.date?.split('-').reverse().join('/')}</td>
                    <td style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{app.time}</td>
                    <td style={{ padding: '12px', fontWeight: 700, color: 'var(--brand-600)' }}>{formatCurrency(app.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {stats.count === 0 && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <DollarSign size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '8px' }}>Sem dados no período</h3>
          <p style={{ fontSize: '0.9rem' }}>
            Nenhum atendimento ou venda encontrado para <strong>{viewLabel}</strong> no período selecionado.
          </p>
        </div>
      )}
    </div>
    </>
  );
};

export default Finance;
