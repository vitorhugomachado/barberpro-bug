import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const parseLocalString = (key, defaultVal) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultVal;
    } catch {
      return defaultVal;
    }
  };

  const [barbers, setBarbers] = useState(() => {
    const defaultVal = [
      { id: 1, name: 'Carlos Santos', email: 'carlos@barberpro.com', password: '123', role: 'Barbeiro', status: 'Ativo', permissions: ['dashboard', 'scheduler', 'clients'] },
      { id: 2, name: 'André Lima', email: 'andre@barberpro.com', password: '123', role: 'Barbeiro', status: 'Ativo', permissions: ['scheduler', 'clients'] },
      { id: 3, name: 'Rafael Costa', email: 'rafael@barberpro.com', password: '123', role: 'Barbeiro', status: 'Ativo', permissions: ['scheduler', 'clients'] },
      { id: 4, name: 'Super Admin', email: 'admin@admin.com.br', password: 'admin', role: 'Gerente', status: 'Ativo', permissions: ['dashboard', 'scheduler', 'clients', 'finance', 'users', 'settings'] },
    ];
    const fromStorage = parseLocalString('bp_barbers', null);
    if (!fromStorage) return defaultVal;

    // Migração para senhas antigas sem esse campo
    return fromStorage.map(b => ({
      ...b,
      password: b.password || (b.role === 'Gerente' ? 'admin' : '123')
    }));
  });

  const [appointments, setAppointments] = useState(() => parseLocalString('bp_appointments', [
    { id: 1, customer: 'Vitor Machado', phone: '11999999999', service: 'Corte + Barba', barberId: 1, date: '2024-04-02', time: '09:00', status: 'Em progresso', price: 75 },
    { id: 2, customer: 'João Silva', phone: '11888888888', service: 'Degradê', barberId: 2, date: '2024-04-02', time: '10:00', status: 'Agendado', price: 50 },
    { id: 3, customer: 'Lucas Lima', phone: '11777777777', service: 'Corte Clássico', barberId: 3, date: '2024-04-02', time: '09:00', status: 'Finalizado', price: 50 },
    { id: 4, customer: 'Marcos Braz', phone: '11666666666', service: 'Barboterapia', barberId: 1, date: '2024-04-02', time: '11:00', status: 'Agendado', price: 35 },
  ]));

  const [services, setServices] = useState(() => parseLocalString('bp_services', [
    { id: 1, name: 'Corte de Cabelo', price: 50, duration: '45 min' },
    { id: 2, name: 'Barba Completa', price: 35, duration: '30 min' },
    { id: 3, name: 'Corte + Barba', price: 75, duration: '1h 15 min' },
    { id: 4, name: 'Limpeza de Pele', price: 40, duration: '30 min' },
  ]));

  const [businessInfo, setBusinessInfo] = useState(() => parseLocalString('bp_business', {
    name: 'BarberPro',
    phone: '(11) 99999-9999',
    email: 'contato@barberpro.com.br',
    address: 'Av. Paulista, 1000 - Bela Vista, São Paulo'
  }));
  
  const [products, setProducts] = useState(() => parseLocalString('bp_products', [
    { id: 1, name: 'Pomada Modeladora', price: 45, cost: 20, stock: 15, category: 'Cabelo' },
    { id: 2, name: 'Óleo para Barba', price: 35, cost: 15, stock: 8, category: 'Barba' },
    { id: 3, name: 'Shampoo Mentolado', price: 55, cost: 25, stock: 12, category: 'Cabelo' },
    { id: 4, name: 'Cerveja Artesanal', price: 15, cost: 8, stock: 24, category: 'Bebidas' },
  ]));

  const [productSales, setProductSales] = useState(() => parseLocalString('bp_product_sales', []));

  useEffect(() => { localStorage.setItem('bp_barbers', JSON.stringify(barbers)); }, [barbers]);
  useEffect(() => { localStorage.setItem('bp_appointments', JSON.stringify(appointments)); }, [appointments]);
  useEffect(() => { localStorage.setItem('bp_services', JSON.stringify(services)); }, [services]);
  useEffect(() => { localStorage.setItem('bp_business', JSON.stringify(businessInfo)); }, [businessInfo]);
  useEffect(() => { localStorage.setItem('bp_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('bp_product_sales', JSON.stringify(productSales)); }, [productSales]);

  const updateBusinessInfo = (newData) => setBusinessInfo({ ...businessInfo, ...newData });

  const addAppointment = (newApp) => {
    setAppointments([...appointments, { ...newApp, id: Date.now() }]);
  };

  const updateAppointmentStatus = (id, status) => {
    setAppointments(appointments.map(app => app.id === id ? { ...app, status } : app));
  };

  const addBarber = (newBarber) => {
    setBarbers([...barbers, { ...newBarber, id: Date.now(), status: 'Ativo', permissions: ['scheduler', 'clients'] }]);
  };

  const updateBarberPermissions = (id, permissions) => {
    setBarbers(barbers.map(b => b.id === id ? { ...b, permissions } : b));
  };

  const removeBarber = (id) => setBarbers(barbers.filter(b => b.id !== id));
  const updateBarber = (id, data) => setBarbers(barbers.map(b => b.id === id ? { ...b, ...data } : b));
  
  const toggleBarberStatus = (id) => {
    setBarbers(barbers.map(b => b.id === id ? { ...b, status: b.status === 'Ativo' ? 'Suspenso' : 'Ativo' } : b));
  };

  const addService = (newService) => setServices([...services, { ...newService, id: Date.now() }]);
  const removeService = (id) => setServices(services.filter(s => s.id !== id));
  const updateService = (id, data) => setServices(services.map(s => s.id === id ? { ...s, ...data } : s));

  const addProduct = (newProduct) => setProducts([...products, { ...newProduct, id: Date.now() }]);
  const removeProduct = (id) => setProducts(products.filter(p => p.id !== id));
  const updateProduct = (id, data) => setProducts(products.map(p => p.id === id ? { ...p, ...data } : p));
  
  const sellProduct = (productId, quantity = 1) => {
    const product = products.find(p => p.id === productId);
    if (!product || product.stock < quantity) return false;
    
    // Decrement Stock
    setProducts(products.map(p => p.id === productId ? { ...p, stock: p.stock - quantity } : p));
    
    // Record Sale
    setProductSales([...productSales, {
      id: Date.now(),
      productId,
      productName: product.name,
      price: product.price,
      cost: product.cost,
      quantity,
      date: new Date().toISOString().split('T')[0]
    }]);
    return true;
  };

  const getFinancialStats = (startDate, endDate) => {
    let finished = appointments.filter(app => app.status === 'Finalizado');
    let soldProducts = productSales;

    if (startDate && endDate) {
      finished = finished.filter(app => app.date >= startDate && app.date <= endDate);
      soldProducts = soldProducts.filter(sale => sale.date >= startDate && sale.date <= endDate);
    }
    
    const serviceRevenue = finished.reduce((sum, app) => sum + app.price, 0);
    const productRevenue = soldProducts.reduce((sum, sale) => sum + (sale.price * sale.quantity), 0);
    const productCost = soldProducts.reduce((sum, sale) => sum + (sale.cost * sale.quantity), 0);
    
    const revenue = serviceRevenue + productRevenue;
    const itemsCount = finished.length + soldProducts.length;
    
    const expenses = 4200; // Mock fixed expenses
    return {
      revenue,
      serviceRevenue,
      productRevenue,
      productCost,
      expenses,
      profit: revenue - expenses - productCost,
      count: itemsCount,
      averageTicket: itemsCount > 0 ? revenue / itemsCount : 0
    };
  };

  return (
    <AppContext.Provider value={{
      barbers,
      appointments,
      services,
      businessInfo,
      addAppointment,
      updateAppointmentStatus,
      addBarber,
      updateBarberPermissions,
      removeBarber,
      updateBarber,
      toggleBarberStatus,
      addService,
      removeService,
      updateService,
      products,
      addProduct,
      removeProduct,
      updateProduct,
      sellProduct,
      productSales,
      updateBusinessInfo,
      getFinancialStats
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
