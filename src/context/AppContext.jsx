import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();
const API_URL = 'http://localhost:3001/api';

export const AppProvider = ({ children }) => {
  const [barbers, setBarbers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [businessInfo, setBusinessInfo] = useState({});
  const [products, setProducts] = useState([]);
  const [productSales, setProductSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('barberpro_token'));
  const [currentUser, setCurrentUser] = useState(null);

  const apiFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      logout();
    }
    return res;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [barbersRes, servicesRes, businessRes] = await Promise.all([
          apiFetch(`${API_URL}/barbers`),
          fetch(`${API_URL}/services`),
          fetch(`${API_URL}/business`)
        ]);

        if (barbersRes.ok) setBarbers(await barbersRes.json());
        if (servicesRes.ok) setServices(await servicesRes.json());
        if (businessRes.ok) setBusinessInfo(await businessRes.json());

        
        if (token) {
           try {
             const userRes = await apiFetch(`${API_URL}/auth/me`);
             if (userRes.ok) {
               const user = await userRes.json();
               setCurrentUser(user);
               
               // Fetch protected data only after auth success
               const [apptsRes, prodsRes, salesRes] = await Promise.all([
                 apiFetch(`${API_URL}/appointments`),
                 apiFetch(`${API_URL}/products`),
                 apiFetch(`${API_URL}/sales`)
               ]);

               if (apptsRes.ok) setAppointments(await apptsRes.json());
               if (prodsRes.ok) setProducts(await prodsRes.json());
               if (salesRes.ok) setProductSales(await salesRes.json());
             } else {
               logout();
             }
           } catch(e) {
             console.error("Auth error on reload:", e);
           }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Falha no login');
    }

    const { token: newToken, user } = await res.json();
    setToken(newToken);
    setCurrentUser(user);
    localStorage.setItem('barberpro_token', newToken);
    return user;
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('barberpro_token');
  };

  const updateBusinessInfo = async (newData) => {
    const res = await apiFetch(`${API_URL}/business`, {
      method: 'PUT',
      body: JSON.stringify(newData)
    });
    if (res.ok) setBusinessInfo(await res.json());
  };

  const addAppointment = async (newApp) => {
    const res = await fetch(`${API_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newApp)
    });
    if (res.ok) {
        const savedApp = await res.json();
        setAppointments([...appointments, savedApp]);
    }
  };

  const updateAppointmentStatus = async (id, status, extraData = {}) => {
    const res = await apiFetch(`${API_URL}/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, ...extraData })
    });
    if (res.ok) {
        const updatedApp = await res.json();
        setAppointments(appointments.map(app => app.id === id ? updatedApp : app));
    }
  };

  const cancelAppointment = async (id) => {
    return updateAppointmentStatus(id, 'Cancelado');
  };

  const addBarber = async (newBarber) => {
    const res = await apiFetch(`${API_URL}/barbers`, {
      method: 'POST',
      body: JSON.stringify({ ...newBarber, status: 'Ativo', permissions: ['scheduler', 'clients'] })
    });
    if (res.ok) {
        const savedBarber = await res.json();
        setBarbers([...barbers, savedBarber]);
    }
  };

  const updateBarberPermissions = async (id, permissions) => {
    const res = await apiFetch(`${API_URL}/barbers/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ permissions })
    });
    if (res.ok) {
        const updatedBarber = await res.json();
        setBarbers(barbers.map(b => b.id === id ? updatedBarber : b));
    }
  };

  const removeBarber = async (id) => {
    const res = await apiFetch(`${API_URL}/barbers/${id}`, { method: 'DELETE' });
    if (res.ok) setBarbers(barbers.filter(b => b.id !== id));
  };

  const updateBarber = async (id, data) => {
    const res = await apiFetch(`${API_URL}/barbers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    if (res.ok) {
        const updatedBarber = await res.json();
        setBarbers(barbers.map(b => b.id === id ? updatedBarber : b));
    }
  };
  
  const toggleBarberStatus = async (id) => {
    const barber = barbers.find(b => b.id === id);
    const newStatus = barber.status === 'Ativo' ? 'Suspenso' : 'Ativo';
    const res = await apiFetch(`${API_URL}/barbers/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
        const updatedBarber = await res.json();
        setBarbers(barbers.map(b => b.id === id ? updatedBarber : b));
    }
  };

  const addService = async (newService) => {
    const res = await apiFetch(`${API_URL}/services`, {
      method: 'POST',
      body: JSON.stringify(newService)
    });
    if (res.ok) setServices([...services, await res.json()]);
  };

  const removeService = async (id) => {
    const res = await apiFetch(`${API_URL}/services/${id}`, { method: 'DELETE' });
    if (res.ok) setServices(services.filter(s => s.id !== id));
  };

  const updateService = async (id, data) => {
    const res = await apiFetch(`${API_URL}/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    if (res.ok) {
        const updated = await res.json();
        setServices(services.map(s => s.id === id ? updated : s));
    }
  };

  const addProduct = async (newProduct) => {
    const res = await apiFetch(`${API_URL}/products`, {
      method: 'POST',
      body: JSON.stringify(newProduct)
    });
    if (res.ok) setProducts([...products, await res.json()]);
  };

  const removeProduct = async (id) => {
    const res = await apiFetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
    if (res.ok) setProducts(products.filter(p => p.id !== id));
  };

  const updateProduct = async (id, data) => {
    const res = await apiFetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    if (res.ok) {
        const updated = await res.json();
        setProducts(products.map(p => p.id === id ? updated : p));
    }
  };
  
  const sellProduct = async (productId, quantity = 1, barberId = null) => {
    const product = products.find(p => p.id === productId);
    if (!product || product.stock < quantity) return false;
    
    await apiFetch(`${API_URL}/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ stock: product.stock - quantity })
    });
    
    const saleRes = await apiFetch(`${API_URL}/sales`, {
      method: 'POST',
      body: JSON.stringify({
        productId,
        productName: product.name,
        price: product.price,
        cost: product.cost,
        quantity,
        date: new Date().toISOString().split('T')[0],
        barberId: barberId || null
      })
    });
    
    if (saleRes.ok) {
        const savedSale = await saleRes.json();
        setProducts(products.map(p => p.id === productId ? { ...p, stock: p.stock - quantity } : p));
        setProductSales(prev => [...prev, savedSale]);
        return true;
    }
    return false;
  };

  // barberId: null = geral, 'barbershop' = só produtos sem barbeiro, number = barbeiro específico
  const getFinancialStats = (startDate, endDate, barberId = null) => {
    // Role-based isolation: Barbers always see only their own data
    let effectiveBarberId = barberId;
    if (currentUser && currentUser.role === 'Barbeiro' && !barberId) {
      effectiveBarberId = currentUser.id;
    }

    let finished = appointments.filter(app => app.status === 'Finalizado');
    let soldProducts = [...productSales];

    if (startDate && endDate) {
      finished = finished.filter(app => app.date >= startDate && app.date <= endDate);
      soldProducts = soldProducts.filter(sale => sale.date >= startDate && sale.date <= endDate);
    }

    // Filtro por barbeiro
    if (effectiveBarberId === 'barbershop') {
      finished = [];
      soldProducts = soldProducts.filter(sale => !sale.barberId);
    } else if (effectiveBarberId) {
      const id = Number(effectiveBarberId);
      finished = finished.filter(app => Number(app.barberId) === id);
      soldProducts = soldProducts.filter(sale => Number(sale.barberId) === id);
    }
    
    const serviceRevenue = finished.reduce((sum, app) => sum + app.price, 0);
    const productRevenue = soldProducts.reduce((sum, sale) => sum + (sale.price * sale.quantity), 0);
    const productCost = soldProducts.reduce((sum, sale) => sum + (sale.cost * sale.quantity), 0);
    
    const revenue = serviceRevenue + productRevenue;
    const itemsCount = finished.length + soldProducts.length;
    return {
      revenue, serviceRevenue, productRevenue, productCost, expenses: 4200,
      profit: revenue - 4200 - productCost, count: itemsCount,
      averageTicket: itemsCount > 0 ? revenue / itemsCount : 0,
      appointments: finished,
      sales: soldProducts
    };
  };

  // Retorna ranking de barbeiros com stats individuais para o período
  // Barbers only see their own stats in the ranking
  const getBarberRanking = (startDate, endDate) => {
    let targetBarbers = barbers.filter(b => b.role === 'Barbeiro');
    
    // Role-based isolation: Barbers only see themselves
    if (currentUser && currentUser.role === 'Barbeiro') {
      targetBarbers = targetBarbers.filter(b => b.id === currentUser.id);
    }

    return targetBarbers
      .map(barber => {
        const stats = getFinancialStats(startDate, endDate, barber.id);
        return {
          ...barber,
          serviceRevenue: stats.serviceRevenue,
          productRevenue: stats.productRevenue,
          revenue: stats.revenue,
          count: stats.count,
          averageTicket: stats.averageTicket
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
  };

  return (
    <AppContext.Provider value={{
      barbers, appointments, services, businessInfo, addAppointment, updateAppointmentStatus,
      cancelAppointment, addBarber, updateBarberPermissions, removeBarber, updateBarber, toggleBarberStatus,
      addService, removeService, updateService, products, addProduct, removeProduct,
      updateProduct, sellProduct, productSales, updateBusinessInfo, getFinancialStats,
      getBarberRanking, login, logout, currentUser, token, loading
    }}>
      {children}
    </AppContext.Provider>
  );

};

export const useApp = () => useContext(AppContext);
