import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Sparkles, User, Filter, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Finance = () => {
  const { barbers, appointments, getFinancialStats } = useApp();

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

  const [comparisonParams, setComparisonParams] = useState({
    revenue: true,
    ticket: true,
    retention: true,
    productivity: false
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const stats = getFinancialStats(startDate, endDate);

  const handleAIAnalysis = () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);

    setTimeout(() => {
      const topBarberName = barbers.length > 0 ? barbers[0].name : 'A Equipe';
      const formattedStart = startDate.split('-').reverse().join('/');
      const formattedEnd = endDate.split('-').reverse().join('/');

      const analyses = [
        `Neste período selecionado (de **${formattedStart} a ${formattedEnd}**), **${topBarberName}** gerou maior movimentação total, representando aproximadamente R$ ${(stats.revenue * 0.4).toFixed(2)} do faturamento da barbearia.`,
        `O ticket médio geral medido foi de **R$ ${stats.averageTicket.toFixed(2)}**. ` + (stats.averageTicket > 40 ? 'Sua estratégia de upsell e ofertas casadas está funcionando muito bem!' : 'Isso indica uma oportunidade para recomendar serviços adicionais (ex: Sobrancelha ou Barboterapia) durante os cortes simples.')
      ];

      setAiAnalysis({
        summary: "Análise processada e consolidada para as datas específicas do filtro.",
        insights: analyses,
        recommendation: `No intervalo selecionado identificamos a criação de ${stats.count} registros finalizados. Recomendamos agendar disparos informativos por WhatsApp para reativar essa mesma base de clientes dentro das próximas semanas.`
      });
      setIsAnalyzing(false);
    }, 1500);
  };

  const data = {
    revenue: stats.revenue,
    expenses: stats.expenses,
    profit: stats.profit,
    growth: 12.5 // Hardcoded growth for now
  };

  return (
    <div className="fade-in">
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Gestão Financeira</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Relatórios detalhados e análise inteligente de performance.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', padding: '6px 16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>De:</span>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, color: 'var(--text-primary)' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '10px' }}>Até:</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, color: 'var(--text-primary)' }} />
          </div>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowUpRight size={18} /> Exportar PDF
          </button>
        </div>
      </header>

      {/* Financial Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="glass-card" style={{ borderLeft: '4px solid #000' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>FATURAMENTO BRUTO</span>
            <div style={{ background: 'rgba(0,0,0,0.02)', padding: '8px', borderRadius: '8px' }}><DollarSign size={18} /></div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '8px' }}>R$ {data.revenue.toLocaleString('pt-BR')}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#10b981' }}>
            <ArrowUpRight size={14} /> +{data.growth}% vs mês anterior
          </div>
        </div>

        <div className="glass-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>DESPESAS TOTAIS</span>
            <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '8px', borderRadius: '8px', color: '#ef4444' }}><PieChart size={18} /></div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '8px' }}>R$ {data.expenses.toLocaleString('pt-BR')}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Operacional, materiais e aluguel</div>
        </div>

        <div className="glass-card" style={{ borderLeft: '4px solid #10b981', background: 'rgba(16, 185, 129, 0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>LUCRO LÍQUIDO</span>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '8px', borderRadius: '8px', color: '#10b981' }}><DollarSign size={18} /></div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '8px' }}>R$ {data.profit.toLocaleString('pt-BR')}</div>
          <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>Margem de {((data.profit / data.revenue) * 100).toFixed(1)}%</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Comparison Parameters */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
            <Filter size={20} />
            <h3 style={{ fontSize: '1.2rem' }}>Parâmetros da IA</h3>
          </div>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {Object.keys(comparisonParams).map(param => (
              <div key={param} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                    {param === 'retention' ? 'Taxa de Retenção' : param === 'productivity' ? 'Produtividade' : param === 'revenue' ? 'Faturamento Total' : 'Ticket Médio'}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {param === 'retention' ? 'Análise de quantos clientes retornam' : param === 'productivity' ? 'Tempo médio de cadeira vs ociosidade' : 'Comparativo bruto e crescimento'}
                  </p>
                </div>
                <div
                  onClick={() => setComparisonParams({ ...comparisonParams, [param]: !comparisonParams[param] })}
                  style={{
                    width: '40px',
                    height: '24px',
                    background: comparisonParams[param] ? '#000' : '#e5e7eb',
                    borderRadius: '12px',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{
                    width: '18px',
                    height: '18px',
                    background: '#fff',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '3px',
                    left: comparisonParams[param] ? '20px' : '3px',
                    transition: 'all 0.2s'
                  }}></div>
                </div>
              </div>
            ))}
          </div>

          <button
            className="btn-primary"
            style={{ width: '100%', marginTop: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '16px' }}
            onClick={handleAIAnalysis}
            disabled={isAnalyzing}
          >
            <Sparkles size={18} /> {isAnalyzing ? 'Analisando dados...' : 'Gerar Análise por IA'}
          </button>
        </div>

        {/* AI Analysis Result */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {aiAnalysis ? (
            <div className="glass-card" style={{ background: '#000', color: '#fff', border: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                <Sparkles size={24} style={{ color: '#fff' }} />
                <h3 style={{ fontSize: '1.2rem', fontFamily: 'Outfit' }}>Relatório Especializado</h3>
              </div>

              <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                {aiAnalysis.insights.map((insight, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', fontSize: '0.9rem', lineHeight: '1.5', opacity: 0.9 }}>
                    <div style={{ marginTop: '4px', minWidth: '6px', height: '6px', background: '#fff', borderRadius: '50%' }}></div>
                    <p style={{ color: '#fff' }}>{insight.replace(/\*\*(.*?)\*\*/g, '$1')}</p>
                  </div>
                ))}
              </div>

              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Info size={16} />
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>DICA ESTRATÉGICA</span>
                </div>
                <p style={{ fontSize: '0.85rem', opacity: 0.9 }}>{aiAnalysis.recommendation}</p>
              </div>
            </div>
          ) : (
            <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '3rem' }}>
              <div style={{ width: '80px', height: '80px', background: 'rgba(0,0,0,0.02)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
                <Sparkles size={40} style={{ opacity: 0.1 }} />
              </div>
              <h3 style={{ marginBottom: '12px' }}>Aguardando Análise</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '300px' }}>
                Selecione os parâmetros ao lado e clique em gerar para que a inteligência artificial processe os dados.
              </p>
            </div>
          )}

          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Evolução Mensal (Lucro)</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '120px' }}>
              {[30, 45, 65, 85, 75, 95].map((h, i) => (
                <div key={i} style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '100%', height: `${h}%`, background: '#000', borderRadius: '6px', opacity: i === 5 ? 1 : 0.1 }}></div>
                  <span style={{ fontSize: '0.65rem', marginTop: '8px', color: 'var(--text-secondary)' }}>M{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Finance;
