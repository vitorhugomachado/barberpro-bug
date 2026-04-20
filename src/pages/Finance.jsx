import React, { useState, useMemo } from 'react';
import {
  TrendingUp, DollarSign, PieChart, Sparkles, User, Filter,
  ArrowUpRight, ArrowDownRight, Info, ShoppingBag, Scissors, Trophy, Store, LayoutList, CreditCard, Plus, Edit2, Trash2, X, Wallet,
  Calendar, Landmark, Percent, Receipt, Target, Search, ChevronRight, Download
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend 
} from 'recharts';
import { useApp } from '../context/AppContext';

// --- SHARED COMPONENTS ---

const KPICard = ({ title, value, icon: Icon, color, subtext }) => (
  <div className="glass-card" style={{ padding: '1.5rem', borderLeft: `6px solid ${color}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{title}</span>
      <div style={{ background: `${color}15`, color: color, padding: '8px', borderRadius: '10px' }}><Icon size={18} /></div>
    </div>
    <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{value}</div>
    {subtext && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{subtext}</div>}
  </div>
);

const SectionHeader = ({ title, subTitle, badge }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
     <div>
       <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{title}</h2>
       <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>{subTitle}</p>
     </div>
     {badge && <div style={{ background: '#10B98120', color: '#10B981', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>{badge}</div>}
  </div>
);

const getLocalDateStr = (d) => {
  let dt = new Date(d);
  dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
  return dt.toISOString().split('T')[0];
};

const formatCurrency = (val) => `R$ ${(val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// --- TAB COMPONENTS ---

const VisaoGeralTab = ({ stats, startDate, endDate, netProfit, commissionValue, netMargin }) => {
  const chartData = useMemo(() => {
    const dataMap = {};
    const curr = new Date(startDate);
    const end = new Date(endDate);
    while (curr <= end) {
      const s = getLocalDateStr(curr);
      dataMap[s] = { date: s.split('-').reverse().slice(0, 2).join('/'), total: 0 };
      curr.setDate(curr.getDate() + 1);
    }
    stats.appointments.forEach(app => { if (dataMap[app.date]) dataMap[app.date].total += app.price; });
    stats.sales.forEach(sale => { if (dataMap[sale.date]) dataMap[sale.date].total += (sale.price * sale.quantity); });
    return Object.values(dataMap);
  }, [stats, startDate, endDate]);

  return (
    <div className="fade-in">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <KPICard title="Receita Bruta" value={formatCurrency(stats.revenue)} icon={DollarSign} color="var(--kpi-revenue)" subtext="vs faturamento anterior" />
        <KPICard title="Lucro Líquido" value={formatCurrency(netProfit)} icon={TrendingUp} color="var(--kpi-profit)" />
        <KPICard title="Comissões" value={formatCurrency(commissionValue)} icon={Receipt} color="var(--kpi-commission)" />
        <KPICard title="Ticket Médio" value={formatCurrency(stats.averageTicket)} icon={Target} color="var(--kpi-ticket)" />
        <KPICard title="Venda Produtos" value={formatCurrency(stats.productRevenue)} icon={ShoppingBag} color="var(--kpi-sales)" />
        <KPICard title="Margem Líquida" value={`${netMargin.toFixed(1)}%`} icon={Percent} color="var(--kpi-margin)" />
      </div>

      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2.5rem', height: '400px' }}>
        <SectionHeader title="Evolução da Receita" subTitle="Performance diária da barbearia" />
        <ResponsiveContainer width="100%" height="80%">
          <AreaChart data={chartData}>
            <defs><linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--accent-color)" stopOpacity={0.1}/><stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} />
            <YAxis axisLine={false} tickLine={false} hide />
            <Tooltip contentStyle={{ background: 'var(--surface-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }} />
            <Area type="monotone" dataKey="total" stroke="var(--accent-color)" strokeWidth={3} fill="url(#colorTotal)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '2rem' }}>
        <div className="glass-card" style={{ padding: '2rem' }}>
          <SectionHeader title="Mix de Receita" subTitle="Detalhamento por categorias" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             {[
               { label: 'Serviços', val: stats.serviceRevenue },
               { label: 'Produtos', val: stats.productRevenue },
               { label: 'Lucro da Casa (Livre)', val: netProfit, isBold: true },
               { label: 'Comissões Pagas', val: commissionValue }
             ].map(item => (
               <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                 <span style={{ fontSize: '0.9rem', color: item.isBold ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: item.isBold ? 700 : 500 }}>{item.label}</span>
                 <span style={{ fontWeight: 700 }}>{formatCurrency(item.val)} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-secondary)' }}>({(stats.revenue > 0 ? (item.val/stats.revenue)*100 : 0).toFixed(0)}%)</span></span>
               </div>
             ))}
          </div>
        </div>
        <div className="glass-card" style={{ padding: '2rem' }}>
          <SectionHeader title="Resumo Financeiro" subTitle="Indicadores chave de desempenho" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
             {[
               { label: 'Receita Bruta Total', val: formatCurrency(stats.revenue) },
               { label: '↳ Serviços', val: formatCurrency(stats.serviceRevenue), isSub: true },
               { label: '↳ Produtos', val: formatCurrency(stats.productRevenue), isSub: true },
               { label: '(-) Comissões Pagas', val: formatCurrency(commissionValue), color: '#ef4444' },
               { label: '(=) Lucro Líquido da Casa', val: formatCurrency(netProfit), isHighlight: true },
               { label: 'Clientes Atendidos', val: stats.appointments.length },
               { label: 'Total de Transações', val: stats.appointments.length + stats.sales.length }
             ].map(row => (
               <div key={row.label} style={{ 
                 display: 'flex', justifyContent: 'space-between', padding: row.isHighlight ? '10px 15px' : '4px 0', 
                 background: row.isHighlight ? '#000' : 'transparent', color: row.isHighlight ? '#FFF' : 'inherit',
                 borderRadius: '8px', marginLeft: row.isSub ? '1.5rem' : '0'
               }}>
                 <span style={{ fontSize: '0.85rem' }}>{row.label}</span>
                 <span style={{ fontWeight: 700, color: row.color }}>{row.val}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const DRETab = ({ stats, startDate, endDate, netProfit, commissionValue, netMargin }) => {
  const lines = [
    { label: '(+) RECEITA BRUTA', val: stats.revenue, isGroup: true },
    { label: '↳ Serviços prestados', val: stats.serviceRevenue, isSub: true },
    { label: '↳ Venda de produtos', val: stats.productRevenue, isSub: true },
    { label: '(-) DEDUÇÕES', val: commissionValue + stats.productCost, isGroup: true, color: '#ef4444' },
    { label: '↳ Comissões de barbeiros', val: commissionValue, isSub: true },
    { label: '↳ Custo dos produtos (CPV)', val: stats.productCost, isSub: true },
    { label: '(=) LUCRO BRUTO', val: stats.revenue - (commissionValue + stats.productCost) },
    { label: '(-) DESPESAS OPERACIONAIS', val: stats.expenses, isGroup: true, color: '#ef4444' },
    { label: '↳ Despesas fixas / Marketing', val: stats.expenses, isSub: true },
    { label: '(=) EBITDA / RESULTADO LÍQUIDO', val: netProfit, isHighlight: true, color: 'var(--kpi-revenue)' }
  ];

  return (
    <div className="fade-in glass-card" style={{ padding: '2rem' }}>
      <SectionHeader title="DRE — Demonstração do Resultado" subTitle={`Período: ${startDate.split('-').reverse().join('/')} a ${endDate.split('-').reverse().join('/')}`} badge={`Margem: ${netMargin.toFixed(1)}%`} />
      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px 100px', padding: '0 15px 10px', borderBottom: '2px solid var(--border-color)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          <span>DESCRIÇÃO</span>
          <span style={{ textAlign: 'right' }}>VALOR (R$)</span>
          <span style={{ textAlign: 'right' }}>% RECEITA</span>
        </div>
        {lines.map((line, idx) => (
          <div key={idx} style={{ 
            display: 'grid', gridTemplateColumns: '1fr 180px 100px', padding: '16px 15px', 
            borderBottom: '1px solid var(--border-color)',
            background: line.isHighlight ? 'rgba(0,0,0,0.03)' : 'transparent',
            fontWeight: line.isGroup || line.isHighlight ? 700 : 400,
            fontSize: line.isGroup ? '0.95rem' : '0.85rem'
          }}>
            <span style={{ paddingLeft: line.isSub ? '1.5rem' : '0', color: line.color }}>{line.label}</span>
            <span style={{ textAlign: 'right', color: line.color }}>{formatCurrency(line.val)}</span>
            <span style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{stats.revenue > 0 ? ((line.val / stats.revenue) * 100).toFixed(1) : '0'}%</span>
          </div>
        ))}
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', color: '#10B981', fontSize: '0.8rem', fontWeight: 700 }}>
           <TrendingUp size={16} style={{ marginRight: '6px' }} /> Resultado Positivo
        </div>
      </div>
    </div>
  );
};

const ComparativoTab = ({ appointments, productSales, expenses, getFinancialStats }) => {
  const today = new Date();
  const [compMonthA, setCompMonthA] = useState(`${today.getFullYear()}-${String(today.getMonth()).padStart(2, '0')}`);
  const [compMonthB, setCompMonthB] = useState(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`);

  const getMonthStats = (monthStr) => {
    const parts = monthStr.split('-');
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const start = getLocalDateStr(new Date(year, month - 1, 1));
    const end = getLocalDateStr(new Date(year, month, 0));
    const s = getFinancialStats(start, end);
    const comm = s.serviceRevenue * 0.5;
    return { ...s, commissionValue: comm, netProfit: s.revenue - comm - s.expenses - s.productCost };
  };

  const statsA = useMemo(() => getMonthStats(compMonthA), [compMonthA, appointments, productSales, expenses]);
  const statsB = useMemo(() => getMonthStats(compMonthB), [compMonthB, appointments, productSales, expenses]);

  const diffPct = statsA.revenue > 0 ? ((statsB.revenue - statsA.revenue) / statsA.revenue) * 100 : 0;

  const data = [
    { name: 'Receita Bruta', mesA: statsA.revenue, mesB: statsB.revenue },
    { name: 'Lucro Líquido', mesA: statsA.netProfit, mesB: statsB.netProfit },
    { name: 'Comissões', mesA: statsA.commissionValue, mesB: statsB.commissionValue },
    { name: 'Venda Prod.', mesA: statsA.productRevenue, mesB: statsB.productRevenue }
  ];

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2.5rem' }}>
        <div className="glass-card" style={{ flex: 1, padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Mês A</div>
            <input type="month" value={compMonthA} onChange={e => setCompMonthA(e.target.value)} style={{ border: 'none', background: 'none', fontSize: '1.2rem', fontWeight: 700, outline: 'none', color: 'var(--text-primary)' }} />
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatCurrency(statsA.revenue)}</div>
          </div>
        </div>
        <div className="glass-card" style={{ flex: 1, padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '2px solid var(--kpi-revenue)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Mês B</div>
            <input type="month" value={compMonthB} onChange={e => setCompMonthB(e.target.value)} style={{ border: 'none', background: 'none', fontSize: '1.2rem', fontWeight: 700, outline: 'none', color: 'var(--text-primary)' }} />
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--kpi-revenue)' }}>{formatCurrency(statsB.revenue)}</div>
            <div style={{ fontSize: '0.8rem', color: diffPct >= 0 ? '#10B981' : '#ef4444', fontWeight: 700 }}>
              {diffPct >= 0 ? '+' : ''}{diffPct.toFixed(1)}% vs Mês A
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '2.5rem', height: '450px', marginBottom: '2.5rem' }}>
         <SectionHeader title="Comparativo Mês a Mês" subTitle="Análise visual do crescimento" />
         <ResponsiveContainer width="100%" height="85%">
           <BarChart data={data}>
             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
             <XAxis dataKey="name" axisLine={false} tickLine={false} />
             <YAxis axisLine={false} tickLine={false} hide />
             <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '12px', background: 'var(--surface-color)', border: '1px solid var(--border-color)' }} />
             <Bar dataKey="mesA" fill="var(--brand-300)" radius={[4, 4, 0, 0]} name="Mês Anterior" />
             <Bar dataKey="mesB" fill="var(--kpi-revenue)" radius={[4, 4, 0, 0]} name="Mês Atual" />
           </BarChart>
         </ResponsiveContainer>
      </div>
    </div>
  );
};

const RankingTab = ({ startDate, endDate, barbers, appointments, productSales, getBarberRanking }) => {
  const rankingData = useMemo(() => getBarberRanking(startDate, endDate), [startDate, endDate, barbers, appointments, productSales]);
  
  const radarData = useMemo(() => rankingData.slice(0, 3).map(b => ({
    subject: b.name,
    A: b.revenue,
    B: b.count * 50, // Scalling Qtd to match Revenue space
    fullMark: Math.max(...rankingData.map(x => x.revenue), 1)
  })), [rankingData]);

  return (
    <div className="fade-in">
      <SectionHeader title="Ranking de Barbeiros" subTitle="Performance individual dos profissionais" />
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '2rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             {rankingData.map((b, idx) => (
               <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', background: 'var(--panel-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ 
                    width: '40px', height: '40px', borderRadius: '50%', background: idx === 0 ? 'var(--kpi-revenue)' : (idx === 1 ? '#94a3b8' : '#cd7f32'), 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' 
                  }}>
                    <Trophy size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                     <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{b.name}</div>
                     <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                       {b.count} atendimentos  •  Ticket: {formatCurrency(b.averageTicket)}
                     </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                     <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{formatCurrency(b.revenue)}</div>
                     <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>Top Performance</div>
                  </div>
               </div>
             ))}
           </div>
        </div>

        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '2rem' }}>Análise Multidimensional (Top 3)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="var(--border-color)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <Radar name="Performance" dataKey="A" stroke="var(--kpi-revenue)" fill="var(--kpi-revenue)" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Equilíbrio entre Faturamento e Volume</div>
        </div>
      </div>
    </div>
  );
};

const DespesasTab = ({ stats, netProfit, commissionValue, netMargin, onAdd, onEdit, onDelete }) => {
  return (
    <div className="fade-in">
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <SectionHeader title="Despesas Fixas" subTitle="Registro mensal de custos operacionais" />
            <button 
              className="btn-primary" 
              onClick={onAdd}
              style={{ height: 'fit-content', padding: '10px 20px', fontSize: '0.8rem' }}
            >
              + Adicionar
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
             {stats.expensesList.length === 0 ? (
               <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Nenhuma despesa cadastrada no período</div>
             ) : (
               stats.expensesList.map(e => (
                  <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1.25rem', background: 'var(--panel-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                     <div>
                       <div style={{ fontWeight: 700 }}>{e.description}</div>
                       <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{e.category} • {e.date.split('-').reverse().join('/')}</div>
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                       <span style={{ fontWeight: 700, color: '#ef4444' }}>- {formatCurrency(e.amount)}</span>
                       <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => onEdit(e)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><Edit2 size={16}/></button>
                          <button onClick={() => onDelete(e.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16}/></button>
                       </div>
                     </div>
                  </div>
               ))
             )}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '2rem' }}>
          <SectionHeader title="Impacto no Resultado" subTitle="Como as despesas afetam o lucro" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             {[
               { label: 'Receita Bruta', val: stats.revenue, color: 'var(--text-primary)' },
               { label: '(-) Comissões', val: commissionValue, color: '#ef4444' },
               { label: '= Lucro Bruto', val: stats.revenue - commissionValue, color: '#2563EB', isBold: true },
               { label: '(-) Despesas Fixas', val: stats.expenses, color: '#ef4444' },
               { label: '= EBITDA', val: netProfit, color: 'var(--kpi-revenue)', isBold: true }
             ].map(row => (
               <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                 <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: row.isBold ? 700 : 400 }}>{row.label}</span>
                 <span style={{ fontWeight: 700, color: row.color }}>{formatCurrency(row.val)}</span>
               </div>
             ))}
             <div style={{ marginTop: '1rem', padding: '1.5rem', background: 'var(--panel-bg)', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Margem Líquida Atrapalhada?</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--kpi-revenue)' }}>{netMargin.toFixed(1)}%</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExtratoTab = ({ stats }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const allTransactions = useMemo(() => {
    const trans = [
      ...stats.appointments.map(a => ({ ...a, type: 'Serviço', desc: a.service, total: a.price, commission: a.price * 0.5 })),
      ...stats.sales.map(s => ({ ...s, type: 'Produto', desc: s.productName, total: s.price * s.quantity, commission: 0 }))
    ];
    return trans.filter(t => 
      t.desc.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (t.customer && t.customer.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a,b) => b.date.localeCompare(a.date));
  }, [stats, searchTerm]);

  return (
    <div className="fade-in glass-card" style={{ padding: '2rem' }}>
      <SectionHeader title="Extrato de Vendas" subTitle="Lista detalhada de todas as entradas" />
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
         <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '15px', top: '12px', color: 'var(--text-secondary)' }} />
            <input 
              type="text" placeholder="Buscar cliente ou serviço..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px 12px 12px 45px', borderRadius: '10px', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--surface-color)', color: 'var(--text-primary)' }}
            />
         </div>
         <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', cursor: 'pointer', color: 'var(--text-primary)' }}>
           <Download size={16} /> Exportar
         </button>
      </div>

      <div className="table-responsive">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              {['DATA', 'TIPO', 'DESCRIÇÃO', 'CLIENTE', 'BARBEIRO', 'TOTAL', 'COMISSÃO', 'CASA'].map(h => (
                <th key={h} style={{ padding: '15px', textAlign: 'left', fontWeight: 700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allTransactions.map((t, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                <td style={{ padding: '15px', color: 'var(--text-secondary)' }}>{t.date.split('-').reverse().join('/')}</td>
                <td style={{ padding: '15px' }}>
                  <span style={{ background: t.type === 'Serviço' ? '#10B98120' : '#8B5CF620', color: t.type === 'Serviço' ? '#10B981' : '#8B5CF6', padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700 }}>{t.type}</span>
                </td>
                <td style={{ padding: '15px', fontWeight: 600 }}>{t.desc}</td>
                <td style={{ padding: '15px' }}>{t.customer || 'Venda Avulsa'}</td>
                <td style={{ padding: '15px' }}>{t.barber?.name || 'Caixa Central'}</td>
                <td style={{ padding: '15px', fontWeight: 700 }}>{formatCurrency(t.total)}</td>
                <td style={{ padding: '15px', color: '#ef4444' }}>{formatCurrency(t.commission)}</td>
                <td style={{ padding: '15px', fontWeight: 700, color: 'var(--kpi-revenue)' }}>{formatCurrency(t.total - t.commission)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {allTransactions.length === 0 && <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Nenhum registro encontrado</div>}
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

const Finance = () => {
  const { 
    barbers, appointments, productSales, getFinancialStats, getBarberRanking, 
    currentUser, expenses, addExpense, removeExpense, updateExpense 
  } = useApp();

  const [timeRange, setTimeRange] = useState('Semana');
  const [activeTab, setActiveTab] = useState('Visão Geral');

  // Modal State for Expenses
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [expenseForm, setExpenseForm] = useState({ description: '', amount: '', date: new Date().toISOString().split('T')[0], category: 'Operacional' });

  // Global Date Logic
  const { startDate, endDate } = useMemo(() => {
    const today = new Date();
    let start = new Date();
    let end = new Date(today);

    if (timeRange === 'Semana') {
      const day = today.getDay() || 7;
      start.setDate(today.getDate() - (day - 1));
      end.setDate(start.getDate() + 6);
    } else if (timeRange === 'Mês') {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (timeRange === 'Trimestre') {
      const quarter = Math.floor(today.getMonth() / 3);
      start = new Date(today.getFullYear(), quarter * 3, 1);
      end = new Date(today.getFullYear(), (quarter + 1) * 3, 0);
    } else if (timeRange === 'Ano') {
      start = new Date(today.getFullYear(), 0, 1);
      end = new Date(today.getFullYear(), 11, 31);
    } else {
      start = new Date(2020, 0, 1);
    }

    return { startDate: getLocalDateStr(start), endDate: getLocalDateStr(end) };
  }, [timeRange]);

  const stats = useMemo(() => getFinancialStats(startDate, endDate), [startDate, endDate, appointments, productSales, expenses]);
  
  const commissionValue = stats.serviceRevenue * 0.5;
  const netProfit = stats.revenue - commissionValue - stats.expenses - stats.productCost;
  const netMargin = stats.revenue > 0 ? (netProfit / stats.revenue) * 100 : 0;

  const handleEditExpense = (e) => {
    setEditingExpenseId(e.id);
    setExpenseForm(e);
    setIsExpenseModalOpen(true);
  };

  const handleAddExpense = () => {
    setEditingExpenseId(null);
    setExpenseForm({ description: '', amount: '', date: new Date().toISOString().split('T')[0], category: 'Operacional' });
    setIsExpenseModalOpen(true);
  };

  const currentTab = () => {
    switch (activeTab) {
      case 'Visão Geral':
        return <VisaoGeralTab stats={stats} startDate={startDate} endDate={endDate} netProfit={netProfit} commissionValue={commissionValue} netMargin={netMargin} />;
      case 'DRE':
        return <DRETab stats={stats} startDate={startDate} endDate={endDate} netProfit={netProfit} commissionValue={commissionValue} netMargin={netMargin} />;
      case 'Comparativo':
        return <ComparativoTab appointments={appointments} productSales={productSales} expenses={expenses} getFinancialStats={getFinancialStats} />;
      case 'Ranking':
        return <RankingTab startDate={startDate} endDate={endDate} barbers={barbers} appointments={appointments} productSales={productSales} getBarberRanking={getBarberRanking} />;
      case 'Despesas':
        return <DespesasTab stats={stats} netProfit={netProfit} commissionValue={commissionValue} netMargin={netMargin} onAdd={handleAddExpense} onEdit={handleEditExpense} onDelete={removeExpense} />;
      case 'Extrato':
        return <ExtratoTab stats={stats} />;
      default:
        return null;
    }
  };

  return (
    <div className="fade-in" style={{ padding: '1rem 0' }}>
      
      {/* EXPENSE MODAL */}
      {isExpenseModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-card fade-in" style={{ width: '95%', maxWidth: '400px', background: 'var(--surface-color)', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{editingExpenseId ? 'Editar Despesa' : 'Nova Despesa'}</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => setIsExpenseModalOpen(false)}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" placeholder="Descrição" value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--surface-color)', color: 'var(--text-primary)' }} />
              <input type="number" placeholder="Valor" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--surface-color)', color: 'var(--text-primary)' }} />
              <input type="date" value={expenseForm.date} onChange={e => setExpenseForm({...expenseForm, date: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--surface-color)', color: 'var(--text-primary)' }} />
              <button className="btn-primary" style={{ padding: '14px' }} onClick={() => { if(editingExpenseId) updateExpense(editingExpenseId, expenseForm); else addExpense(expenseForm); setIsExpenseModalOpen(false); }}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '6px' }}>Financeiro</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Central de inteligência financeira da barbearia</p>
      </header>

      {/* FILTERS SECTION */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {['Semana', 'Mês', 'Trimestre', 'Ano', 'Total'].map(r => (
          <button 
            key={r} onClick={() => setTimeRange(r)}
            style={{ 
              padding: '8px 20px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600,
              background: timeRange === r ? 'var(--accent-color)' : 'var(--panel-bg)',
              color: timeRange === r ? 'var(--accent-text)' : 'var(--text-secondary)',
              border: 'none', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            {r}
          </button>
        ))}
      </div>

      {/* NAVIGATION TABS */}
      <div style={{ display: 'flex', gap: '2px', borderBottom: '1px solid var(--border-color)', marginBottom: '2.5rem', paddingBottom: '2px', overflowX: 'auto', whiteSpace: 'nowrap' }} className="hide-scrollbar">
        {['Visão Geral', 'DRE', 'Comparativo', 'Ranking', 'Despesas', 'Extrato'].map(tab => (
          <button 
            key={tab} onClick={() => setActiveTab(tab)}
            style={{ 
              padding: '12px 24px', position: 'relative', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: activeTab === tab ? 700 : 500, color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)', flexShrink: 0
            }}
          >
            {tab}
            {activeTab === tab && <div style={{ position: 'absolute', bottom: '-2px', left: 0, right: 0, height: '3px', background: 'var(--accent-color)', borderRadius: '3px' }} />}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      {currentTab()}

    </div>
  );
};

export default Finance;
