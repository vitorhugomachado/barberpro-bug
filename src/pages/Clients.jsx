import React, { useState } from 'react';
import { Search, Plus, Filter, User, Phone, Calendar } from 'lucide-react';

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const clientsData = [
    { id: 1, name: 'Carlos Santos', phone: '(11) 98765-4321', lastVisit: '2024-03-25', status: 'Ativo', totalSpent: 'R$ 850,00' },
    { id: 2, name: 'André Lima', phone: '(11) 91234-5678', lastVisit: '2024-03-10', status: 'Inativo', totalSpent: 'R$ 420,00' },
    { id: 3, name: 'Rafael Costa', phone: '(11) 99887-7665', lastVisit: '2024-03-31', status: 'Ativo', totalSpent: 'R$ 1.100,00' },
    { id: 4, name: 'Vitor Machado', phone: '(11) 97766-5544', lastVisit: '2024-04-01', status: 'Ativo', totalSpent: 'R$ 250,00' },
    { id: 5, name: 'Marcelo Oliveira', phone: '(11) 96655-4433', lastVisit: '2024-02-15', status: 'Pendente', totalSpent: 'R$ 150,00' },
  ];

  return (
    <div>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>CRM - Gestão de Clientes</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Acompanhe o histórico, frequência e gastos dos seus clientes.</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Novo Cliente
        </button>
      </header>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou telefone..." 
              style={{
                width: '100%',
                padding: '10px 10px 10px 40px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem',
                outline: 'none',
                background: 'rgba(0,0,0,0.01)'
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={18} /> Filtrar
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'rgba(0,0,0,0.01)' }}>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '16px 1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CLIENTE</th>
              <th style={{ padding: '16px 0', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CONTATO</th>
              <th style={{ padding: '16px 0', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ÚLTIMA VISITA</th>
              <th style={{ padding: '16px 0', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TOTAL GASTO</th>
              <th style={{ padding: '16px 0', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>STATUS</th>
              <th style={{ padding: '16px 1.5rem', textAlign: 'right' }}>AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {clientsData.map((client) => (
              <tr key={client.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                <td style={{ padding: '16px 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'rgba(0,0,0,0.04)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={20} color="var(--text-secondary)" />
                    </div>
                    <span style={{ fontWeight: 600 }}>{client.name}</span>
                  </div>
                </td>
                <td style={{ padding: '16px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <Phone size={14} /> {client.phone}
                  </div>
                </td>
                <td style={{ padding: '16px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <Calendar size={14} /> {new Date(client.lastVisit).toLocaleDateString('pt-BR')}
                  </div>
                </td>
                <td style={{ padding: '16px 0', fontWeight: 500 }}>{client.totalSpent}</td>
                <td style={{ padding: '16px 0' }}>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '20px', 
                    fontSize: '0.75rem', 
                    fontWeight: 600,
                    background: client.status === 'Ativo' ? 'var(--brand-950)' : client.status === 'Inativo' ? 'var(--brand-300)' : 'var(--panel-bg)',
                    color: client.status === 'Ativo' ? 'var(--accent-text)' : 'var(--text-primary)'
                  }}>
                    {client.status}
                  </span>
                </td>
                <td style={{ padding: '16px 1.5rem', textAlign: 'right' }}>
                  <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Ver Perfil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          <span>Mostrando 5 de 1,284 clientes</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-secondary" style={{ padding: '4px 10px' }} disabled>Anterior</button>
            <button className="btn-secondary" style={{ padding: '4px 10px' }}>Próxima</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clients;
