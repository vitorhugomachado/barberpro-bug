import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Scissors, Settings as SettingsIcon, Save, Trash2, Plus, Edit2, ShieldAlert } from 'lucide-react';

const Settings = () => {
  const { 
    barbers, addBarber, updateBarber, removeBarber, 
    services, addService, updateService, removeService, 
    products, addProduct, updateProduct, removeProduct,
    businessInfo, updateBusinessInfo 
  } = useApp();
  
  const [activeTab, setActiveTab] = useState('barbers');
  
  const [newBarber, setNewBarber] = useState({ name: '', role: 'Barbeiro', email: '', password: '' });
  const [newService, setNewService] = useState({ name: '', duration: '30 min', price: '' });
  const [newProduct, setNewProduct] = useState({ name: '', category: 'Cabelo', price: '', cost: '', stock: '' });
  const [bInfo, setBInfo] = useState(businessInfo);

  const handleAddBarber = () => {
    if (!newBarber.name || !newBarber.password) {
      alert("Nome e Senha são obrigatórios.");
      return;
    }
    addBarber(newBarber);
    setNewBarber({ name: '', role: 'Barbeiro', email: '', password: '' });
  };

  const handleAddService = () => {
    if (!newService.name || !newService.price) return;
    addService({ ...newService, price: parseFloat(newService.price) });
    setNewService({ name: '', duration: '30 min', price: '' });
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) return;
    addProduct({ 
      ...newProduct, 
      price: parseFloat(newProduct.price), 
      cost: parseFloat(newProduct.cost) || 0,
      stock: parseInt(newProduct.stock)
    });
    setNewProduct({ name: '', category: 'Cabelo', price: '', cost: '', stock: '' });
  };

  const handleSaveBusinessInfo = () => {
    updateBusinessInfo(bInfo);
    alert('Informações salvas com sucesso!');
  };

  return (
    <div className="fade-in">
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Configurações do Sistema</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Gerencie os dados sensíveis e o catálogo do seu negócio.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
        
        {/* Sidebar Menu Interno */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button 
            onClick={() => setActiveTab('barbers')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px', borderRadius: '10px', border: 'none', background: activeTab === 'barbers' ? '#000' : 'transparent', color: activeTab === 'barbers' ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', fontWeight: activeTab === 'barbers' ? 600 : 400, transition: 'all 0.2s' }}
          >
            <User size={18} /> Profissionais da Equipe
          </button>
          <button 
            onClick={() => setActiveTab('services')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px', borderRadius: '10px', border: 'none', background: activeTab === 'services' ? '#000' : 'transparent', color: activeTab === 'services' ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', fontWeight: activeTab === 'services' ? 600 : 400, transition: 'all 0.2s' }}
          >
            <Scissors size={18} /> Catálogo de Serviços
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px', borderRadius: '10px', border: 'none', background: activeTab === 'products' ? '#000' : 'transparent', color: activeTab === 'products' ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', fontWeight: activeTab === 'products' ? 600 : 400, transition: 'all 0.2s' }}
          >
            <Plus size={18} /> Estoque de Produtos
          </button>
          <button 
            onClick={() => setActiveTab('business')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px', borderRadius: '10px', border: 'none', background: activeTab === 'business' ? '#000' : 'transparent', color: activeTab === 'business' ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', fontWeight: activeTab === 'business' ? 600 : 400, transition: 'all 0.2s' }}
          >
            <SettingsIcon size={18} /> Perfil do Negócio
          </button>
        </div>

        {/* Content Area */}
        <div className="glass-card" style={{ padding: '2.5rem', minHeight: '500px' }}>
          
          {activeTab === 'barbers' && (
            <div className="fade-in">
              <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}><User size={20} /> Membros da Equipe</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 300px) 1fr', gap: '2rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Adicionar Novo</h3>
                  <input type="text" placeholder="Nome Completo" value={newBarber.name} onChange={e => setNewBarber({...newBarber, name: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
                  <input type="email" placeholder="E-mail de Acesso" value={newBarber.email} onChange={e => setNewBarber({...newBarber, email: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
                  <input type="password" placeholder="Senha de Acesso" value={newBarber.password} onChange={e => setNewBarber({...newBarber, password: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
                  <select value={newBarber.role} onChange={e => setNewBarber({...newBarber, role: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}>
                    <option value="Barbeiro">Barbeiro</option>
                    <option value="Gerente">Gerente</option>
                  </select>
                  <button className="btn-primary" onClick={handleAddBarber} style={{ width: '100%', padding: '12px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <Plus size={18} /> Salvar Profissional
                  </button>
                </div>

                <div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Cadastrados ({barbers.length})</h3>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {barbers.map(b => (
                      <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <div>
                          <p style={{ fontWeight: 600 }}>{b.name}</p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{b.role}</p>
                        </div>
                        <button style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px' }} onClick={() => removeBarber(b.id)}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="fade-in">
              <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}><Plus size={20} /> Gestão de Estoque</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 300px) 1fr', gap: '2rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Novo Produto</h3>
                  <input type="text" placeholder="Nome do Produto" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
                  <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}>
                    <option value="Cabelo">Cabelo</option>
                    <option value="Barba">Barba</option>
                    <option value="Bebidas">Bebidas</option>
                    <option value="Outros">Outros</option>
                  </select>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input type="number" placeholder="Venda (R$)" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
                    <input type="number" placeholder="Custo (R$)" value={newProduct.cost} onChange={e => setNewProduct({...newProduct, cost: e.target.value})} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
                  </div>
                  <input type="number" placeholder="Qtd. em Estoque" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
                  <button className="btn-primary" onClick={handleAddProduct} style={{ width: '100%', padding: '12px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <Plus size={18} /> Cadastrar no Estoque
                  </button>
                </div>

                <div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Produtos em Prateleira ({products.length})</h3>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {products.map(p => (
                      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <div>
                          <p style={{ fontWeight: 600 }}>{p.name}</p>
                          <p style={{ fontSize: '0.8rem', color: p.stock < 5 ? '#ef4444' : 'var(--text-secondary)', fontWeight: p.stock < 5 ? 600 : 400 }}>
                            {p.stock < 5 ? <ShieldAlert size={14} style={{ display: 'inline', marginRight: '4px' }} /> : ''}
                            Estoque: {p.stock} un.
                          </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontWeight: 700, color: '#10b981', fontSize: '0.9rem' }}>R$ {p.price}</p>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Custo: R$ {p.cost}</p>
                          </div>
                          <button style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }} onClick={() => removeProduct(p.id)}>
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'business' && (
            <div className="fade-in">
              <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}><SettingsIcon size={20} /> Informações Públicas</h2>
              <div style={{ maxWidth: '500px' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                  Essas informações aparecerão tela pública de finalização para os seus clientes. Mantenha os dados atualizados.
                </p>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Nome da Barbearia</label>
                  <input type="text" value={bInfo.name} onChange={e => setBInfo({...bInfo, name: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>WhatsApp Principal</label>
                  <input type="text" value={bInfo.phone} onChange={e => setBInfo({...bInfo, phone: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Endereço Completo</label>
                  <input type="text" value={bInfo.address} onChange={e => setBInfo({...bInfo, address: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} />
                </div>

                <button className="btn-primary" onClick={handleSaveBusinessInfo} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '14px' }}>
                  <Save size={18} /> Salvar Informações
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;
