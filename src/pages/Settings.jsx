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
  
  const defaultShifts = [1,2,3,4,5].map(d => ({ dia_semana: d, hora_inicio: '09:00', hora_fim: '18:00', ativo: true }));
  const [newBarber, setNewBarber] = useState({ name: '', role: 'Barbeiro', email: '', password: '', foto_perfil: '', shifts: defaultShifts });
  const [editingBarberId, setEditingBarberId] = useState(null);
  const [editingServiceId, setEditingServiceId] = useState(null);
  
  const [newService, setNewService] = useState({ name: '', duration: '30 min', price: '' });
  const [newProduct, setNewProduct] = useState({ name: '', category: 'Cabelo', price: '', cost: '', stock: '' });
  const [bInfo, setBInfo] = useState(businessInfo);
  const [saving, setSaving] = useState(false);

  // Sync state when businessInfo loads or changes in context
  React.useEffect(() => {
    if (businessInfo && Object.keys(businessInfo).length > 0) {
      setBInfo(businessInfo);
    }
  }, [businessInfo]);

  const handleAddBarber = async () => {
    if (!newBarber.name) {
      alert("O nome é obrigatório.");
      return;
    }
    
    if (!newBarber.email) {
      alert("O e-mail é obrigatório para o login.");
      return;
    }
    
    if (editingBarberId) {
      updateBarber(editingBarberId, newBarber);
      setEditingBarberId(null);
      setNewBarber({ name: '', role: 'Barbeiro', email: '', password: '', foto_perfil: '', shifts: defaultShifts });
    } else {
      if (!newBarber.password) {
        alert("A senha é obrigatória para novos cadastros.");
        return;
      }
      const success = await addBarber(newBarber);
      if (success) {
        setNewBarber({ name: '', role: 'Barbeiro', email: '', password: '', foto_perfil: '', shifts: defaultShifts });
      }
    }
  };

  const startEditBarber = (barber) => {
    setEditingBarberId(barber.id);
    setNewBarber({
      name: barber.name,
      role: barber.role,
      email: barber.email || '',
      password: '', // Manter vazio por segurança, só altera se preencher
      foto_perfil: barber.foto_perfil || '',
      shifts: barber.shifts || []
    });
  };

  const cancelEditBarber = () => {
    setEditingBarberId(null);
    setNewBarber({ name: '', role: 'Barbeiro', email: '', password: '', foto_perfil: '', shifts: defaultShifts });
  };

  const handleAddService = () => {
    if (!newService.name || !newService.price) return;
    
    const serviceData = { ...newService, price: parseFloat(newService.price) };
    
    if (editingServiceId) {
      updateService(editingServiceId, serviceData);
      setEditingServiceId(null);
    } else {
      addService(serviceData);
    }
    setNewService({ name: '', duration: '30 min', price: '' });
  };

  const startEditService = (service) => {
    setEditingServiceId(service.id);
    setNewService({ 
      name: service.name, 
      duration: service.duration, 
      price: service.price.toString() 
    });
  };

  const cancelEditService = () => {
    setEditingServiceId(null);
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

  const handleSaveBusinessInfo = async () => {
    try {
      setSaving(true);
      await updateBusinessInfo(bInfo);
      alert('Informações salvas com sucesso!');
    } catch (error) {
      alert('Erro ao salvar informações: ' + error.message);
    } finally {
      setSaving(false);
    }
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
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px', borderRadius: '10px', border: 'none', background: activeTab === 'barbers' ? 'var(--accent-color)' : 'transparent', color: activeTab === 'barbers' ? 'var(--accent-text)' : 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', fontWeight: activeTab === 'barbers' ? 600 : 400, transition: 'all 0.2s' }}
          >
            <User size={18} /> Profissionais da Equipe
          </button>
          <button 
            onClick={() => setActiveTab('services')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px', borderRadius: '10px', border: 'none', background: activeTab === 'services' ? 'var(--accent-color)' : 'transparent', color: activeTab === 'services' ? 'var(--accent-text)' : 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', fontWeight: activeTab === 'services' ? 600 : 400, transition: 'all 0.2s' }}
          >
            <Scissors size={18} /> Catálogo de Serviços
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px', borderRadius: '10px', border: 'none', background: activeTab === 'products' ? 'var(--accent-color)' : 'transparent', color: activeTab === 'products' ? 'var(--accent-text)' : 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', fontWeight: activeTab === 'products' ? 600 : 400, transition: 'all 0.2s' }}
          >
            <Plus size={18} /> Estoque de Produtos
          </button>
          <button 
            onClick={() => setActiveTab('business')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px', borderRadius: '10px', border: 'none', background: activeTab === 'business' ? 'var(--accent-color)' : 'transparent', color: activeTab === 'business' ? 'var(--accent-text)' : 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', fontWeight: activeTab === 'business' ? 600 : 400, transition: 'all 0.2s' }}
          >
            <SettingsIcon size={18} /> Perfil do Negócio
          </button>
        </div>

        {/* Content Area */}
        <div className="glass-card" style={{ padding: '2.5rem', minHeight: '500px' }}>
          
          {activeTab === 'barbers' && (
            <div className="fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px' }}><User size={20} /> Membros da Equipe</h2>
                <button className="btn-primary" onClick={cancelEditBarber} style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                  <Plus size={16} /> Novo Cadastro
                </button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 300px) 1fr', gap: '2rem' }}>
                <div style={{ background: 'var(--panel-bg)', padding: '1.5rem', borderRadius: '16px', border: editingBarberId ? '2px solid var(--accent-color)' : '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: editingBarberId ? 'var(--accent-color)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {editingBarberId ? <><Edit2 size={18} /> Editando: {newBarber.name}</> : <><Plus size={18} /> Cadastrar Profissional</>}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem', gap: '10px' }}>
                    <div 
                      onClick={() => document.getElementById('fileInput').click()}
                      style={{ 
                        width: '80px', height: '80px', borderRadius: '50%', background: 'var(--panel-bg)', 
                        border: '2px dashed var(--brand-400)', display: 'flex', alignItems: 'center', 
                        justifyContent: 'center', overflow: 'hidden', position: 'relative', cursor: 'pointer',
                        transition: 'all 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                      }}
                    >
                      {newBarber.foto_perfil ? (
                        <img src={newBarber.foto_perfil} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ textAlign: 'center', color: 'var(--brand-700)' }}>
                          <Plus size={24} style={{ margin: '0 auto' }} />
                          <p style={{ fontSize: '0.6rem', fontWeight: 700, marginTop: '2px' }}>UPLOAD</p>
                        </div>
                      )}
                    </div>
                    <input 
                      id="fileInput"
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setNewBarber({...newBarber, foto_perfil: reader.result});
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ display: 'none' }} 
                    />
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Clique no círculo para enviar do seu computador</p>
                  </div>

                  <input type="text" placeholder="Nome Completo" value={newBarber.name} onChange={e => setNewBarber({...newBarber, name: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: editingBarberId ? '1px solid var(--brand-200)' : '1px solid var(--border-color)', outline: 'none' }} />
                  <input type="email" placeholder="E-mail de Acesso" value={newBarber.email} onChange={e => setNewBarber({...newBarber, email: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: editingBarberId ? '1px solid var(--brand-200)' : '1px solid var(--border-color)', outline: 'none' }} />
                  <input type="password" placeholder={editingBarberId ? "Nova Senha (deixe vazio p/ manter)" : "Senha de Acesso"} value={newBarber.password} onChange={e => setNewBarber({...newBarber, password: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: editingBarberId ? '1px solid var(--brand-200)' : '1px solid var(--border-color)', outline: 'none' }} />
                  <select value={newBarber.role} onChange={e => setNewBarber({...newBarber, role: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '1rem', borderRadius: '8px', border: editingBarberId ? '1px solid var(--brand-200)' : '1px solid var(--border-color)', outline: 'none' }}>
                    <option value="Barbeiro">Barbeiro</option>
                    <option value="Gerente">Gerente</option>
                  </select>

                  <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '12px' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)' }}>Expediente e Turnos</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[1, 2, 3, 4, 5, 6, 0].map(dia => {
                        const labels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                        const dayShifts = (newBarber.shifts || []).filter(s => s.dia_semana === dia);
                        
                        return (
                          <div key={dia} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, width: '40px' }}>{labels[dia]}</span>
                              <button 
                                onClick={() => {
                                  const current = newBarber.shifts || [];
                                  setNewBarber({ ...newBarber, shifts: [...current, { dia_semana: dia, hora_inicio: '09:00', hora_fim: '12:00', ativo: true }] });
                                }}
                                style={{ background: 'none', color: 'var(--brand-700)', fontSize: '0.65rem', padding: '2px 6px', fontWeight: 700 }}
                              >
                                + Turno
                              </button>
                            </div>
                            {dayShifts.map((shift, sIdx) => {
                              const globalIdx = (newBarber.shifts || []).indexOf(shift);
                              return (
                                <div key={sIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                  <input 
                                    type="time" 
                                    value={shift.hora_inicio} 
                                    onChange={e => {
                                      const ns = [...newBarber.shifts];
                                      ns[globalIdx].hora_inicio = e.target.value;
                                      setNewBarber({ ...newBarber, shifts: ns });
                                    }}
                                    style={{ fontSize: '0.7rem', padding: '4px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                  />
                                  <span style={{ fontSize: '0.7rem' }}>às</span>
                                  <input 
                                    type="time" 
                                    value={shift.hora_fim} 
                                    onChange={e => {
                                      const ns = [...newBarber.shifts];
                                      ns[globalIdx].hora_fim = e.target.value;
                                      setNewBarber({ ...newBarber, shifts: ns });
                                    }}
                                    style={{ fontSize: '0.7rem', padding: '4px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                  />
                                  <button 
                                    onClick={() => {
                                      setNewBarber({ ...newBarber, shifts: newBarber.shifts.filter((_, i) => i !== globalIdx) });
                                    }}
                                    style={{ background: 'none', color: '#ef4444', padding: '2px' }}
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              );
                            })}
                            {dayShifts.length === 0 && <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Folga</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-primary" onClick={handleAddBarber} style={{ flex: 1, padding: '12px', display: 'flex', justifyContent: 'center', gap: '8px', background: editingBarberId ? 'var(--brand-600)' : 'var(--accent-color)' }}>
                      {editingBarberId ? <Save size={18} /> : <Plus size={18} />} 
                      {editingBarberId ? 'Atualizar Dados' : 'Salvar Profissional'}
                    </button>
                    {editingBarberId && (
                      <button onClick={cancelEditBarber} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff', cursor: 'pointer' }}>
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Cadastrados ({barbers.length})</h3>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {barbers.map(b => (
                      <div 
                        key={b.id} 
                        className="hover-trigger"
                        onClick={() => startEditBarber(b)}
                        style={{ 
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', 
                          background: editingBarberId === b.id ? 'var(--brand-50)' : 'rgba(0,0,0,0.02)', 
                          borderRadius: '8px', border: editingBarberId === b.id ? '1px solid var(--brand-200)' : '1px solid var(--border-color)',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                           <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-color)', color: 'var(--accent-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden' }}>
                              {b.foto_perfil ? (
                                <img src={b.foto_perfil} alt={b.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                b.name.charAt(0)
                              )}
                           </div>
                           <div>
                            <p style={{ fontWeight: 600 }}>{b.name} {editingBarberId === b.id && <span style={{ fontSize: '0.65rem', background: 'var(--brand-200)', color: '#1e40af', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>Editando</span>}</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{b.role}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="hover-visible"
                            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '8px' }}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px' }} 
                            onClick={(e) => {
                              e.stopPropagation();
                              if(window.confirm(`Excluir ${b.name}?`)) removeBarber(b.id);
                            }}
                          >
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
          
          {activeTab === 'services' && (
            <div className="fade-in">
              <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}><Scissors size={20} /> Catálogo de Serviços</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 300px) 1fr', gap: '2rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: editingServiceId ? 'var(--accent-color)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {editingServiceId ? <><Edit2 size={18} /> Editando: {newService.name}</> : <><Plus size={18} /> Novo Serviço</>}
                  </h3>
                  <input type="text" placeholder="Nome do Serviço" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: editingServiceId ? '1px solid var(--brand-200)' : '1px solid var(--border-color)', outline: 'none' }} />
                  <select 
                    value={newService.duration} 
                    onChange={e => setNewService({...newService, duration: e.target.value})} 
                    style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: editingServiceId ? '1px solid var(--brand-200)' : '1px solid var(--border-color)', outline: 'none', background: '#fff' }}
                  >
                    <option value="30 min">30 min</option>
                    <option value="60 min">60 min (1h)</option>
                    <option value="90 min">90 min (1h 30)</option>
                    <option value="120 min">120 min (2h)</option>
                    <option value="150 min">150 min (2h 30)</option>
                    <option value="180 min">180 min (3h)</option>
                    <option value="210 min">210 min (3h 30)</option>
                    <option value="240 min">240 min (4h)</option>
                  </select>
                  <input type="number" placeholder="Preço (R$)" value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '1rem', borderRadius: '8px', border: editingServiceId ? '1px solid var(--brand-200)' : '1px solid var(--border-color)', outline: 'none' }} />
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-primary" onClick={handleAddService} style={{ flex: 1, padding: '12px', display: 'flex', justifyContent: 'center', gap: '8px', background: editingServiceId ? 'var(--brand-600)' : 'var(--accent-color)' }}>
                      {editingServiceId ? <Save size={18} /> : <Plus size={18} />} 
                      {editingServiceId ? 'Atualizar Dados' : 'Cadastrar Serviço'}
                    </button>
                    {editingServiceId && (
                      <button onClick={cancelEditService} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff', cursor: 'pointer' }}>
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Serviços Ativos ({services.length})</h3>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {services.map(s => (
                      <div 
                        key={s.id} 
                        onClick={() => startEditService(s)}
                        style={{ 
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', 
                          background: editingServiceId === s.id ? 'var(--brand-50)' : 'rgba(0,0,0,0.02)', 
                          borderRadius: '8px', border: editingServiceId === s.id ? '1px solid var(--brand-200)' : '1px solid var(--border-color)',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div>
                          <p style={{ fontWeight: 600 }}>{s.name} {editingServiceId === s.id && <span style={{ fontSize: '0.65rem', background: 'var(--brand-200)', color: '#1e40af', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>Editando</span>}</p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Duração: {s.duration}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <span style={{ fontWeight: 700, color: 'var(--brand-600)' }}>R$ {s.price}</span>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}>
                              <Edit2 size={16} />
                            </button>
                            <button style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }} onClick={(e) => { e.stopPropagation(); removeService(s.id); }}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
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
                            <p style={{ fontWeight: 700, color: 'var(--brand-600)', fontSize: '0.9rem' }}>R$ {p.price}</p>
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

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem', gap: '12px', border: '1px dashed var(--border-color)', padding: '20px', borderRadius: '12px', background: 'rgba(0,0,0,0.01)' }}>
                  <div 
                    onClick={() => document.getElementById('logoInput').click()}
                    style={{ 
                      width: '120px', height: '120px', borderRadius: '12px', background: 'var(--panel-bg)', 
                      border: '2px dashed var(--brand-400)', display: 'flex', alignItems: 'center', 
                      justifyContent: 'center', overflow: 'hidden', position: 'relative', cursor: 'pointer',
                      transition: 'all 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                    }}
                  >
                    {bInfo.logo_url ? (
                      <img src={bInfo.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <div style={{ textAlign: 'center', color: 'var(--brand-700)' }}>
                        <Plus size={32} style={{ margin: '0 auto' }} />
                        <p style={{ fontSize: '0.7rem', fontWeight: 700, marginTop: '4px' }}>UPLOAD LOGO</p>
                      </div>
                    )}
                  </div>
                  <input 
                    id="logoInput"
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setBInfo({...bInfo, logo_url: reader.result});
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{ display: 'none' }} 
                  />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', fontWeight: 500 }}>
                    Logo da Barbearia (Login/Agenda)
                  </p>
                </div>

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
