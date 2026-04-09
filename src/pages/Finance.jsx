import React, { useState, useMemo } from 'react';
import {
  TrendingUp, DollarSign, PieChart, Sparkles, User, Filter,
  ArrowUpRight, ArrowDownRight, Info, ShoppingBag, Scissors, Trophy, Store, LayoutList, CreditCard
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const Finance = () => {
  const { barbers, appointments, productSales, getFinancialStats, getBarberRanking, currentUser } = useApp();

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', padding: '6px 16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
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
            background: selectedView === 'geral' ? '#000' : '#fff',
            color: selectedView === 'geral' ? '#fff' : 'var(--text-primary)',
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
            background: selectedView === 'barbershop' ? '#000' : '#fff',
            color: selectedView === 'barbershop' ? '#fff' : 'var(--text-primary)',
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
              background: selectedView === String(barber.id) ? '#000' : '#fff',
              color: selectedView === String(barber.id) ? '#fff' : 'var(--text-primary)',
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
        <div className="glass-card" style={{ borderLeft: '4px solid #000' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>FATURAMENTO BRUTO</span>
            <div style={{ background: 'rgba(0,0,0,0.04)', padding: '8px', borderRadius: '8px' }}><DollarSign size={16} /></div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>{formatCurrency(stats.revenue)}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Serviços + Produtos</div>
        </div>

        <div className="glass-card" style={{ borderLeft: '4px solid #2563eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>SERVIÇOS</span>
            <div style={{ background: 'rgba(37,99,235,0.06)', padding: '8px', borderRadius: '8px', color: '#2563eb' }}><Scissors size={16} /></div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563eb', marginBottom: '4px' }}>{formatCurrency(stats.serviceRevenue)}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{stats.appointments?.length || 0} atendimentos</div>
        </div>

        <div className="glass-card" style={{ borderLeft: '4px solid #7c3aed' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>PRODUTOS (BARBEARIA)</span>
            <div style={{ background: 'rgba(124,58,237,0.06)', padding: '8px', borderRadius: '8px', color: '#7c3aed' }}><ShoppingBag size={16} /></div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#7c3aed', marginBottom: '4px' }}>{formatCurrency(stats.productRevenue)}</div>
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

        <div className="glass-card" style={{ borderLeft: '4px solid #10b981', background: 'rgba(16, 185, 129, 0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {selectedView === 'geral' ? 'LUCRO LÍQUIDO' : 'RECEITA LÍQUIDA'}
            </span>
            <div style={{ background: 'rgba(16,185,129,0.1)', padding: '8px', borderRadius: '8px', color: '#10b981' }}><TrendingUp size={16} /></div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981', marginBottom: '4px' }}>
            {formatCurrency(selectedView === 'geral' ? stats.profit : stats.revenue)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
            Ticket médio: {formatCurrency(stats.averageTicket)}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedView === 'geral' ? '1fr 1fr' : '1fr', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* Ranking de barbeiros — apenas na visão geral */}
        {selectedView === 'geral' && (
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
              <Trophy size={20} />
              <h3 style={{ fontSize: '1.1rem' }}>Ranking de Barbeiros</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {ranking.length === 0 && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
                  Nenhum dado no período selecionado.
                </p>
              )}
              {ranking.map((barber, idx) => {
                const maxRevenue = ranking[0]?.revenue || 1;
                const pct = maxRevenue > 0 ? (barber.revenue / maxRevenue) * 100 : 0;
                const medals = ['🥇', '🥈', '🥉'];
                return (
                  <div key={barber.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.1rem' }}>{medals[idx] || `#${idx + 1}`}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{barber.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {barber.count} atend. · Ticket: {formatCurrency(barber.averageTicket)}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{formatCurrency(barber.revenue)}</div>
                        <div style={{ fontSize: '0.7rem', color: '#7c3aed' }}>+{formatCurrency(barber.productRevenue)} prod.</div>
                      </div>
                    </div>
                    <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: idx === 0 ? '#000' : '#e5e7eb', borderRadius: '3px', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Receita de Produtos da Barbearia (sem barbeiro) */}
            {barberShopProductStats.productRevenue > 0 && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(124,58,237,0.04)', borderRadius: '10px', border: '1px solid rgba(124,58,237,0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Store size={16} style={{ color: '#7c3aed' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Barbearia (Balcão)</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Vendas sem barbeiro vinculado</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#7c3aed' }}>
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
                      <div style={{ height: '6px', background: '#f8f9fa', borderRadius: '3px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: idx === 0 ? '#2563eb' : '#93c5fd', borderRadius: '3px', transition: 'width 0.5s ease' }} />
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
                    'Pix': '#10b981', // green
                    'Cartão de Crédito': '#8b5cf6', // purple
                    'Cartão de Débito': '#3b82f6', // blue
                    'Dinheiro': '#f59e0b', // orange
                    'Caixa Bar.]': '#ef4444', // red
                    'Outros': '#6b7280'
                  };
                  const color = methodColors[methodObj.method] || '#cbd5e1';
                  
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
                      <div style={{ height: '6px', background: '#f8f9fa', borderRadius: '3px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)' }}>
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
              marginLeft: 'auto', background: 'rgba(124,58,237,0.08)', color: '#7c3aed',
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
                    <td style={{ padding: '12px', fontSize: '0.9rem', fontWeight: 700, color: '#7c3aed' }}>{formatCurrency(sale.price * sale.quantity)}</td>
                    <td style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {sale.date?.split('-').reverse().join('/')}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {sale.barber ? (
                        <span style={{ background: 'rgba(0,0,0,0.04)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                          {sale.barber.name}
                        </span>
                      ) : (
                        <span style={{ background: 'rgba(124,58,237,0.08)', color: '#7c3aed', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
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
              marginLeft: 'auto', background: 'rgba(37,99,235,0.08)', color: '#2563eb',
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
                    <td style={{ padding: '12px', fontWeight: 700, color: '#2563eb' }}>{formatCurrency(app.price)}</td>
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
  );
};

export default Finance;
