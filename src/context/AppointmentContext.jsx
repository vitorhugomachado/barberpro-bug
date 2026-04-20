import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const AppointmentContext = createContext();

export const AppointmentProvider = ({ children }) => {
  const { currentUser, token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!token || !currentUser) return;
      
      setLoading(true);
      try {
        const res = await api.get('/appointments');
        if (res.ok) {
          const data = await res.json();
          setAppointments(data);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [token, currentUser]);

  const addAppointment = async (newApp) => {
    const res = await api.post('/appointments', newApp);
    if (res.ok) {
      const savedApp = await res.json();
      setAppointments(prev => [...prev, savedApp]);
      return savedApp;
    }
  };

  const updateAppointmentStatus = async (id, status, extraData = {}) => {
    const res = await api.patch(`/appointments/${id}`, { status, ...extraData });
    if (res.ok) {
      const updatedApp = await res.json();
      setAppointments(prev => prev.map(app => app.id === id ? updatedApp : app));
      return updatedApp;
    }
  };

  const cancelAppointment = async (id) => {
    return updateAppointmentStatus(id, 'Cancelado');
  };

  return (
    <AppointmentContext.Provider value={{
      appointments, loading,
      addAppointment, updateAppointmentStatus, cancelAppointment
    }}>
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointments = () => useContext(AppointmentContext);
