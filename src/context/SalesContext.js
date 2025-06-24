// context/SalesContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import firebaseService from '../services/firebase/firebaseService';
import { useAuth } from './AuthContext';

const SalesContext = createContext({});

export const useSales = () => {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error('useSales debe ser usado dentro de SalesProvider');
  }
  return context;
};

export const SalesProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [todaySales, setTodaySales] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unsubscribe, setUnsubscribe] = useState(null);

  // Cargar ventas del día cuando el usuario se autentique
  useEffect(() => {
    if (isAuthenticated && user) {
      loadTodaySales();
      
      // Suscribirse a cambios en tiempo real
      const unsub = firebaseService.subscribeTodaySales((sales) => {
        setTodaySales(sales);
      });
      
      setUnsubscribe(() => unsub);
      
      return () => {
        if (unsub) unsub();
      };
    } else {
      setTodaySales([]);
    }
  }, [isAuthenticated, user]);

  const loadTodaySales = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const sales = await firebaseService.getTodaySales();
      setTodaySales(sales);
    } catch (error) {
      console.error('Error cargando ventas:', error);
      setError('No se pudieron cargar las ventas');
    } finally {
      setIsLoading(false);
    }
  };

  const addSale = async (saleData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await firebaseService.addSale(saleData);
      
      if (result.success) {
        // Si estamos offline, actualizar la lista local
        if (result.offline) {
          const newSale = {
            ...saleData,
            id: result.tempId,
            syncStatus: 'pending',
            createdAt: new Date(),
          };
          setTodaySales(prev => [newSale, ...prev]);
        }
        // Si estamos online, el listener actualizará automáticamente
      }
      
      return result;
    } catch (error) {
      console.error('Error agregando venta:', error);
      setError('No se pudo agregar la venta');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSale = async (saleId, updates) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await firebaseService.updateSale(saleId, updates);
      
      if (result.success && result.offline) {
        // Actualizar localmente si estamos offline
        setTodaySales(prev => 
          prev.map(sale => 
            sale.id === saleId 
              ? { ...sale, ...updates, syncStatus: 'pending' }
              : sale
          )
        );
      }
      
      return result;
    } catch (error) {
      console.error('Error actualizando venta:', error);
      setError('No se pudo actualizar la venta');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSale = async (saleId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await firebaseService.deleteSale(saleId);
      
      if (result.success && result.offline) {
        // Eliminar localmente si estamos offline
        setTodaySales(prev => prev.filter(sale => sale.id !== saleId));
      }
      
      return result;
    } catch (error) {
      console.error('Error eliminando venta:', error);
      setError('No se pudo eliminar la venta');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getSaleById = (saleId) => {
    return todaySales.find(sale => sale.id === saleId);
  };

  const getSalesSummary = () => {
    const cashSales = todaySales.filter(sale => sale.paymentType === 'cash');
    const transferSales = todaySales.filter(sale => sale.paymentType === 'transfer');
    
    const cashTotal = cashSales.reduce((sum, sale) => sum + sale.saleValue, 0);
    const transferTotal = transferSales.reduce((sum, sale) => sum + sale.saleValue, 0);
    
    return {
      totalSales: todaySales.length,
      totalAmount: cashTotal + transferTotal,
      cashCount: cashSales.length,
      cashTotal,
      transferCount: transferSales.length,
      transferTotal,
    };
  };

  const getProductsSummary = () => {
    const products = {};
    
    todaySales.forEach(sale => {
      if (!products[sale.productName]) {
        products[sale.productName] = {
          name: sale.productName,
          quantity: 0,
          total: 0,
          count: 0,
        };
      }
      
      products[sale.productName].quantity += sale.quantity;
      products[sale.productName].total += sale.saleValue;
      products[sale.productName].count += 1;
    });
    
    return Object.values(products).sort((a, b) => b.total - a.total);
  };

  const syncOfflineSales = async () => {
    try {
      setIsLoading(true);
      await firebaseService.syncOffline();
      await loadTodaySales();
    } catch (error) {
      console.error('Error sincronizando ventas:', error);
      setError('No se pudieron sincronizar las ventas');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    todaySales,
    isLoading,
    error,
    addSale,
    updateSale,
    deleteSale,
    getSaleById,
    getSalesSummary,
    getProductsSummary,
    syncOfflineSales,
    refreshSales: loadTodaySales,
  };

  return <SalesContext.Provider value={value}>{children}</SalesContext.Provider>;
};