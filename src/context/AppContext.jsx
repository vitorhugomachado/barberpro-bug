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
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('barberpro_token'));
  const [currentUser, setCurrentUser] = useState(null);
  
  const [customerToken, setCustomerToken] = useState(localStorage.getItem('barberpro_customer_token'));
  const [currentCustomer, setCurrentCustomer] = useState(null);

  const apiFetch = async (url, options = {}) => {
    const headers = { 
      'Content-Type': 'application/json',
      ...options.headers 
    };

    const authScope = options.authScope || 'auto';
    let activeToken = null;

    if (authScope === 'staff') activeToken = token;
    else if (authScope === 'customer') activeToken = customerToken;
    else if (authScope === 'auto') activeToken = token || customerToken;

    if (activeToken) {
      headers['Authorization'] = `Bearer ${activeToken}`;
    }

    const { authScope: _authScope, ...fetchOptions } = options;
    const res = await fetch(url, { ...fetchOptions, headers });
    
    if (res.status === 401 && !options.skipLogout) {
      if (authScope === 'customer' && customerToken) customerLogout();
      if (authScope === 'staff' && token) logout();
    }
    return res;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [barbersRes, servicesRes, businessRes] = await Promise.all([
          apiFetch(`${API_URL}/barbers`, { authScope: 'staff' }),
          fetch(`${API_URL}/services`),
          fetch(`${API_URL}/business`)
        ]);

        if (barbersRes.ok) setBarbers(await barbersRes.json());
        if (servicesRes.ok) setServices(await servicesRes.json());
        if (businessRes.ok) setBusinessInfo(await businessRes.json());

        
        if (token) {
           try {
             // Explicitly skip logout on this fetch if it's the first attempt
             const userRes = await apiFetch(`${API_URL}/auth/me`, { skipLogout: true, authScope: 'staff' });
             if (userRes.ok) {
               const user = await userRes.json();
               setCurrentUser(user);
               
               // Fetch protected data only after auth success
               const [apptsRes, prodsRes, salesRes, expensesRes] = await Promise.all([
                 apiFetch(`${API_URL}/appointments`, { authScope: 'staff' }),
                 apiFetch(`${API_URL}/products`, { authScope: 'staff' }),
                 apiFetch(`${API_URL}/sales`, { authScope: 'staff' }),
                 apiFetch(`${API_URL}/expenses`, { authScope: 'staff' })
               ]);

               if (apptsRes.ok) {
                 const data = await apptsRes.json();
                 console.log('Fetched Appointments:', data);
                 setAppointments(data);
               }
               if (prodsRes.ok) setProducts(await prodsRes.json());
               if (salesRes.ok) setProductSales(await salesRes.json());
               if (expensesRes.ok) setExpenses(await expensesRes.json());
             } else {
               logout();
             }
           } catch(e) {
             console.error("Auth error on reload:", e);
           }
         }

        if (customerToken) {
          try {
            const custRes = await apiFetch(`${API_URL}/customer-auth/me`, { authScope: 'customer' });
            if (custRes.ok) {
              setCurrentCustomer(await custRes.json());
            } else {
              customerLogout();
            }
          } catch(e) {
            console.error("Customer auth error:", e);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, customerToken]);

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

  const customerLogin = async (email, password) => {
    const res = await fetch(`${API_URL}/customer-auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Falha no login');
    }

    const { token: newToken, user } = await res.json();
    localStorage.setItem('barberpro_customer_token', newToken);
    setCustomerToken(newToken);
    setCurrentCustomer(user);
    return user;
  };

  const customerGoogleLogin = async (credential) => {
    const res = await fetch(`${API_URL}/customer-auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential })
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Falha no login com Google');
    }

    const { token: newToken, user } = await res.json();
    localStorage.setItem('barberpro_customer_token', newToken);
    setCustomerToken(newToken);
    setCurrentCustomer(user);
    return user;
  };

  const customerRegister = async (data) => {
    const res = await fetch(`${API_URL}/customer-auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Erro ao cadastrar');
    }

    const { token: newToken, user } = await res.json();
    localStorage.setItem('barberpro_customer_token', newToken);
    setCustomerToken(newToken);
    setCurrentCustomer(user);
    return user;
  };

  const getCustomerAppointments = async () => {
    const res = await apiFetch(`${API_URL}/customer-auth/appointments`, { authScope: 'customer' });
    if (res.ok) return res.json();
    throw new Error('Falha ao buscar histórico');
  };

  const updateCustomerProfile = async (data) => {
    const res = await apiFetch(`${API_URL}/customer-auth/profile`, {
      method: 'PATCH',
      authScope: 'customer',
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const updated = await res.json();
      setCurrentCustomer(updated);
      return updated;
    }
    const err = await res.json();
    throw new Error(err.message || 'Falha ao atualizar perfil');
  };

  const customerLogout = () => {
    localStorage.removeItem('barberpro_customer_token');
    setCustomerToken(null);
    setCurrentCustomer(null);
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('barberpro_token');
  };

  const updateBusinessInfo = async (newData) => {
    try {
      const res = await apiFetch(`${API_URL}/business`, {
        method: 'PUT',
        authScope: 'staff',
        body: JSON.stringify(newData)
      });
      if (res.ok) {
        const updated = await res.json();
        setBusinessInfo(updated);
        return updated;
      }
      const err = await res.json();
      throw new Error(err.message || 'Falha ao atualizar informações do negócio');
    } catch (error) {
      console.error("Error updating business info:", error);
      throw error;
    }
  };

  const addAppointment = async (newApp) => {
    try {
      // Usamos fetch direto para o POST pois a rota é pública no backend
      // No entanto, apiFetch também funcionaria (apenas adiciona o token se houver)
      const res = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApp)
      });

      if (res.ok) {
        const savedApp = await res.json();
        
        // 1. Atualização Funcional Imediata: garante que o agendamento apareça no grid NA HORA
        // sem depender do tempo de resposta de um novo GET. Isso resolve o problema de
        // agendamentos sumindo em sequência.
        setAppointments(prev => [...prev, savedApp]);
        
        // 2. Sincronização em Background: busca a lista completa do servidor para garantir
        // que relacionamentos (como o nome do barbeiro) estejam 100% corretos.
        if (token) {
          apiFetch(`${API_URL}/appointments`, { authScope: 'staff' })
            .then(async r => {
              if (r.ok) {
                const data = await r.json();
                if (Array.isArray(data)) setAppointments(data);
              }
            })
            .catch(err => console.error("Erro ao sincronizar agendamentos:", err));
        }

        return true;
      } else {
        const err = await res.json();
        alert(`Erro ao salvar agendamento: ${err.message || 'Erro desconhecido'}`);
        return false;
      }
    } catch (error) {
      console.error("Add appointment error:", error);
      alert("Falha de conexão ao tentar salvar o agendamento.");
      return false;
    }
  };

  const updateAppointmentStatus = async (id, status, extraData = {}, authScope = 'staff') => {
    try {
      const res = await apiFetch(`${API_URL}/appointments/${id}`, {
        method: 'PATCH',
        authScope,
        body: JSON.stringify({ status, ...extraData })
      });
      if (res.ok) {
          const updatedApp = await res.json();
          setAppointments(prev => prev.map(app => app.id === id ? updatedApp : app));
          return true;
      } else {
          const err = await res.json();
          alert(`Erro ao atualizar agendamento: ${err.message}`);
          return false;
      }
    } catch (error) {
      alert("Erro de conexão ao atualizar agendamento.");
      return false;
    }
  };

  const cancelAppointment = async (id) => {
    return updateAppointmentStatus(id, 'Cancelado');
  };

  const customerUpdateAppointmentStatus = async (id, status, extraData = {}) => {
    return updateAppointmentStatus(id, status, extraData, 'customer');
  };

  const customerCancelAppointment = async (id) => {
    return customerUpdateAppointmentStatus(id, 'Cancelado');
  };

  const addBarber = async (newBarber) => {
    try {
      const res = await apiFetch(`${API_URL}/barbers`, {
        method: 'POST',
        body: JSON.stringify({ ...newBarber, status: 'Ativo', permissions: ['scheduler', 'clients'] })
      });
      if (res.ok) {
          const savedBarber = await res.json();
          setBarbers(prev => [...prev, savedBarber]);
          alert("Profissional cadastrado com sucesso!");
          return true;
      } else {
          const errorData = await res.json();
          alert(`Erro ao cadastrar profissional: ${errorData.message}`);
          return false;
      }
    } catch (e) {
      alert("Erro na conexão com o servidor ao cadastrar profissional.");
      return false;
    }
  };

  const updateBarberPermissions = async (id, permissions) => {
    const res = await apiFetch(`${API_URL}/barbers/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ permissions })
    });
    if (res.ok) {
        const updatedBarber = await res.json();
        setBarbers(prev => prev.map(b => b.id === id ? updatedBarber : b));
    }
  };

  const removeBarber = async (id) => {
    const res = await apiFetch(`${API_URL}/barbers/${id}`, { method: 'DELETE' });
    if (res.ok) setBarbers(prev => prev.filter(b => b.id !== id));
  };

  const updateBarber = async (id, data) => {
    const res = await apiFetch(`${API_URL}/barbers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    if (res.ok) {
        const updatedBarber = await res.json();
        setBarbers(prev => prev.map(b => b.id === id ? updatedBarber : b));
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
        setBarbers(prev => prev.map(b => b.id === id ? updatedBarber : b));
    }
  };

  const addService = async (newService) => {
    const res = await apiFetch(`${API_URL}/services`, {
      method: 'POST',
      body: JSON.stringify(newService)
    });
    if (res.ok) {
        const savedService = await res.json();
        setServices(prev => [...prev, savedService]);
    }
  };

  const removeService = async (id) => {
    const res = await apiFetch(`${API_URL}/services/${id}`, { method: 'DELETE' });
    if (res.ok) setServices(prev => prev.filter(s => s.id !== id));
  };

  const updateService = async (id, data) => {
    const res = await apiFetch(`${API_URL}/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    if (res.ok) {
        const updated = await res.json();
        setServices(prev => prev.map(s => s.id === id ? updated : s));
    }
  };

  const addProduct = async (newProduct) => {
    const res = await apiFetch(`${API_URL}/products`, {
      method: 'POST',
      body: JSON.stringify(newProduct)
    });
    if (res.ok) {
        const savedProduct = await res.json();
        setProducts(prev => [...prev, savedProduct]);
    }
  };

  const removeProduct = async (id) => {
    const res = await apiFetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
    if (res.ok) setProducts(prev => prev.filter(p => p.id !== id));
  };

  const updateProduct = async (id, data) => {
    const res = await apiFetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    if (res.ok) {
        const updated = await res.json();
        setProducts(prev => prev.map(p => p.id === id ? updated : p));
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
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: p.stock - quantity } : p));
        setProductSales(prev => [...prev, savedSale]);
        return true;
    }
    return false;
  };

  const addExpense = async (newExpense) => {
    const res = await apiFetch(`${API_URL}/expenses`, {
      method: 'POST',
      body: JSON.stringify(newExpense)
    });
    if (res.ok) {
        const savedExpense = await res.json();
        setExpenses(prev => [...prev, savedExpense]);
    }
  };

  const removeExpense = async (id) => {
    const res = await apiFetch(`${API_URL}/expenses/${id}`, { method: 'DELETE' });
    if (res.ok) setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const updateExpense = async (id, data) => {
    const res = await apiFetch(`${API_URL}/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    if (res.ok) {
        const updated = await res.json();
        setExpenses(prev => prev.map(e => e.id === id ? updated : e));
    }
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
    let periodExpenses = [...expenses];

    if (startDate && endDate) {
      finished = finished.filter(app => app.date >= startDate && app.date <= endDate);
      soldProducts = soldProducts.filter(sale => sale.date >= startDate && sale.date <= endDate);
      periodExpenses = periodExpenses.filter(e => e.date >= startDate && e.date <= endDate);
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
    const expensesTotal = periodExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    const revenue = serviceRevenue + productRevenue;
    const itemsCount = finished.length + soldProducts.length;
    return {
      revenue, serviceRevenue, productRevenue, productCost, expenses: expensesTotal,
      profit: revenue - expensesTotal - productCost, count: itemsCount,
      averageTicket: itemsCount > 0 ? revenue / itemsCount : 0,
      appointments: finished,
      sales: soldProducts,
      expensesList: periodExpenses
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
      barbers, appointments, services, businessInfo, products, productSales, expenses,
      addAppointment, updateAppointmentStatus, cancelAppointment, 
      addBarber, updateBarberPermissions, removeBarber, updateBarber, toggleBarberStatus,
      addService, removeService, updateService, 
      addProduct, removeProduct, updateProduct, 
      sellProduct, updateBusinessInfo, 
      getFinancialStats, getBarberRanking, 
      addExpense, removeExpense, updateExpense,
      login, logout, currentUser, token, loading,
      currentCustomer, isCustomerAuthenticated: !!currentCustomer, customerLogin, customerGoogleLogin, customerRegister, customerLogout,
      getCustomerAppointments, updateCustomerProfile,
      customerUpdateAppointmentStatus, customerCancelAppointment
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
