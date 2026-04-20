import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useBusiness } from './BusinessContext';
import { useAppointments } from './AppointmentContext';

const FinanceContext = createContext();

export const FinanceProvider = ({ children }) => {
  const { currentUser, token } = useAuth();
  const { barbers } = useBusiness();
  const { appointments } = useAppointments();

  const [products, setProducts] = useState([]);
  const [productSales, setProductSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFinanceData = async () => {
      if (!token || !currentUser) return;
      
      setLoading(true);
      try {
        const [prodsRes, salesRes, expensesRes] = await Promise.all([
          api.get('/products'),
          api.get('/sales'),
          api.get('/expenses')
        ]);

        if (prodsRes.ok) setProducts(await prodsRes.json());
        if (salesRes.ok) setProductSales(await salesRes.json());
        if (expensesRes.ok) setExpenses(await expensesRes.json());
      } catch (error) {
        console.error("Error fetching finance data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFinanceData();
  }, [token, currentUser]);

  const addProduct = async (newProduct) => {
    const res = await api.post('/products', newProduct);
    if (res.ok) {
      const saved = await res.json();
      setProducts(prev => [...prev, saved]);
    }
  };

  const removeProduct = async (id) => {
    const res = await api.delete(`/products/${id}`);
    if (res.ok) setProducts(prev => prev.filter(p => p.id !== id));
  };

  const updateProduct = async (id, data) => {
    const res = await api.put(`/products/${id}`, data);
    if (res.ok) {
      const updated = await res.json();
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
    }
  };

  const sellProduct = async (productId, quantity = 1, barberId = null) => {
    const product = products.find(p => p.id === productId);
    if (!product || product.stock < quantity) return false;
    
    // Update stock
    const updateRes = await api.put(`/products/${productId}`, { stock: product.stock - quantity });
    if (!updateRes.ok) return false;
    
    const saleRes = await api.post('/sales', {
      productId,
      productName: product.name,
      price: product.price,
      cost: product.cost,
      quantity,
      date: new Date().toISOString().split('T')[0],
      barberId: barberId || null
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
    const res = await api.post('/expenses', newExpense);
    if (res.ok) {
      const saved = await res.json();
      setExpenses(prev => [...prev, saved]);
    }
  };

  const removeExpense = async (id) => {
    const res = await api.delete(`/expenses/${id}`);
    if (res.ok) setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const updateExpense = async (id, data) => {
    const res = await api.put(`/expenses/${id}`, data);
    if (res.ok) {
      const updated = await res.json();
      setExpenses(prev => prev.map(e => e.id === id ? updated : e));
    }
  };

  const getFinancialStats = (startDate, endDate, barberId = null) => {
    let effectiveBarberId = barberId;
    // Isolation for regular barbers
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

  const getBarberRanking = (startDate, endDate) => {
    let targetBarbers = barbers.filter(b => b.role === 'Barbeiro');
    
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
    <FinanceContext.Provider value={{
      products, productSales, expenses, loading,
      addProduct, removeProduct, updateProduct,
      sellProduct, addExpense, removeExpense, updateExpense,
      getFinancialStats, getBarberRanking
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => useContext(FinanceContext);
