import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const BusinessContext = createContext();

export const BusinessProvider = ({ children }) => {
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [businessInfo, setBusinessInfo] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [barbersRes, servicesRes, businessRes] = await Promise.all([
        api.get('/barbers'),
        api.get('/services'),
        api.get('/business')
      ]);

      if (barbersRes.ok) setBarbers(await barbersRes.json());
      if (servicesRes.ok) setServices(await servicesRes.json());
      if (businessRes.ok) setBusinessInfo(await businessRes.json());
    } catch (error) {
      console.error("Error fetching business data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateBusinessInfo = async (newData) => {
    const res = await api.put('/business', newData);
    if (res.ok) {
      const updated = await res.json();
      setBusinessInfo(updated);
      return updated;
    }
    const err = await res.json();
    throw new Error(err.message || 'Falha ao atualizar informações do negócio');
  };

  const addBarber = async (newBarber) => {
    const res = await api.post('/barbers', { ...newBarber, status: 'Ativo', permissions: ['scheduler', 'clients'] });
    if (res.ok) {
      const savedBarber = await res.json();
      setBarbers(prev => [...prev, savedBarber]);
      return true;
    }
    const errorData = await res.json();
    throw new Error(errorData.message || 'Erro ao cadastrar profissional');
  };

  const updateBarber = async (id, data) => {
    const res = await api.put(`/barbers/${id}`, data);
    if (res.ok) {
      const updatedBarber = await res.json();
      setBarbers(prev => prev.map(b => b.id === id ? updatedBarber : b));
      return updatedBarber;
    }
  };

  const removeBarber = async (id) => {
    const res = await api.delete(`/barbers/${id}`);
    if (res.ok) setBarbers(prev => prev.filter(b => b.id !== id));
  };

  const toggleBarberStatus = async (id) => {
    const barber = barbers.find(b => b.id === id);
    const newStatus = barber.status === 'Ativo' ? 'Suspenso' : 'Ativo';
    return updateBarber(id, { status: newStatus });
  };

  const addService = async (newService) => {
    const res = await api.post('/services', newService);
    if (res.ok) {
      const saved = await res.json();
      setServices(prev => [...prev, saved]);
    }
  };

  const removeService = async (id) => {
    const res = await api.delete(`/services/${id}`);
    if (res.ok) setServices(prev => prev.filter(s => s.id !== id));
  };

  const updateService = async (id, data) => {
    const res = await api.put(`/services/${id}`, data);
    if (res.ok) {
      const updated = await res.json();
      setServices(prev => prev.map(s => s.id === id ? updated : s));
    }
  };

  return (
    <BusinessContext.Provider value={{
      barbers, services, businessInfo, loading,
      updateBusinessInfo, addBarber, updateBarber, removeBarber, toggleBarberStatus,
      addService, removeService, updateService,
      refreshBusinessData: fetchData
    }}>
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => useContext(BusinessContext);
