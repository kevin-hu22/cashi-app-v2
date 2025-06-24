// src/utils/analytics.js

import { getEndOfMonth, getStartOfMonth } from './helpers';

// ==================== CÁLCULOS DE VENTAS ====================

/**
 * Calcula el total de ventas
 * @param {Array} sales - Array de ventas
 * @returns {number} Total de ventas
 */
export const calculateTotalSales = (sales) => {
  if (!sales || sales.length === 0) return 0;
  return sales.reduce((total, sale) => total + (sale.saleValue || 0), 0);
};

/**
 * Calcula el promedio de ventas
 * @param {Array} sales - Array de ventas
 * @returns {number} Promedio de ventas
 */
export const calculateAverageSale = (sales) => {
  if (!sales || sales.length === 0) return 0;
  const total = calculateTotalSales(sales);
  return total / sales.length;
};

/**
 * Calcula ventas por tipo de pago
 * @param {Array} sales - Array de ventas
 * @returns {object} Ventas agrupadas por tipo de pago
 */
export const calculateSalesByPaymentType = (sales) => {
  const result = {
    cash: { count: 0, total: 0 },
    transfer: { count: 0, total: 0 },
  };

  if (!sales || sales.length === 0) return result;

  sales.forEach(sale => {
    const type = sale.paymentType || 'cash';
    if (result[type]) {
      result[type].count++;
      result[type].total += sale.saleValue || 0;
    }
  });

  return result;
};

/**
 * Calcula las ventas por producto
 * @param {Array} sales - Array de ventas
 * @returns {Array} Productos con estadísticas
 */
export const calculateSalesByProduct = (sales) => {
  if (!sales || sales.length === 0) return [];

  const productMap = {};

  sales.forEach(sale => {
    const productName = sale.productName || 'Sin nombre';
    
    if (!productMap[productName]) {
      productMap[productName] = {
        name: productName,
        quantity: 0,
        salesCount: 0,
        totalValue: 0,
      };
    }

    productMap[productName].quantity += sale.quantity || 0;
    productMap[productName].salesCount++;
    productMap[productName].totalValue += sale.saleValue || 0;
  });

  return Object.values(productMap).sort((a, b) => b.totalValue - a.totalValue);
};

// ==================== ANÁLISIS TEMPORAL ====================

/**
 * Agrupa ventas por hora del día
 * @param {Array} sales - Array de ventas
 * @returns {object} Ventas agrupadas por hora
 */
export const groupSalesByHour = (sales) => {
  const hourly = {};
  
  // Inicializar todas las horas
  for (let i = 0; i < 24; i++) {
    hourly[i] = { count: 0, total: 0 };
  }

  if (!sales || sales.length === 0) return hourly;

  sales.forEach(sale => {
    const date = sale.createdAt instanceof Date ? sale.createdAt : new Date(sale.createdAt);
    const hour = date.getHours();
    
    hourly[hour].count++;
    hourly[hour].total += sale.saleValue || 0;
  });

  return hourly;
};

/**
 * Agrupa ventas por día de la semana
 * @param {Array} sales - Array de ventas
 * @returns {object} Ventas agrupadas por día
 */
export const groupSalesByDayOfWeek = (sales) => {
  const days = {
    0: { name: 'Domingo', count: 0, total: 0 },
    1: { name: 'Lunes', count: 0, total: 0 },
    2: { name: 'Martes', count: 0, total: 0 },
    3: { name: 'Miércoles', count: 0, total: 0 },
    4: { name: 'Jueves', count: 0, total: 0 },
    5: { name: 'Viernes', count: 0, total: 0 },
    6: { name: 'Sábado', count: 0, total: 0 },
  };

  if (!sales || sales.length === 0) return days;

  sales.forEach(sale => {
    const date = sale.createdAt instanceof Date ? sale.createdAt : new Date(sale.createdAt);
    const dayOfWeek = date.getDay();
    
    days[dayOfWeek].count++;
    days[dayOfWeek].total += sale.saleValue || 0;
  });

  return days;
};

/**
 * Agrupa ventas por día del mes
 * @param {Array} sales - Array de ventas
 * @param {Date} month - Mes a analizar
 * @returns {Array} Array con ventas por día
 */
export const groupSalesByDay = (sales, month = new Date()) => {
  const startOfMonth = getStartOfMonth(month);
  const endOfMonth = getEndOfMonth(month);
  const daysInMonth = endOfMonth.getDate();
  
  // Inicializar array con todos los días del mes
  const dailySales = [];
  for (let day = 1; day <= daysInMonth; day++) {
    dailySales.push({
      day,
      date: new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), day),
      count: 0,
      total: 0,
    });
  }

  if (!sales || sales.length === 0) return dailySales;

  sales.forEach(sale => {
    const date = sale.createdAt instanceof Date ? sale.createdAt : new Date(sale.createdAt);
    
    // Verificar que la venta está dentro del mes
    if (date >= startOfMonth && date <= endOfMonth) {
      const dayIndex = date.getDate() - 1;
      dailySales[dayIndex].count++;
      dailySales[dayIndex].total += sale.saleValue || 0;
    }
  });

  return dailySales;
};

// ==================== MÉTRICAS Y KPIs ====================

/**
 * Calcula métricas clave de ventas
 * @param {Array} sales - Array de ventas
 * @returns {object} Métricas calculadas
 */
export const calculateSalesMetrics = (sales) => {
  if (!sales || sales.length === 0) {
    return {
      totalSales: 0,
      salesCount: 0,
      averageTicket: 0,
      maxSale: 0,
      minSale: 0,
      totalQuantity: 0,
      uniqueProducts: 0,
    };
  }

  const totalSales = calculateTotalSales(sales);
  const salesCount = sales.length;
  const averageTicket = totalSales / salesCount;
  const saleValues = sales.map(s => s.saleValue || 0);
  const maxSale = Math.max(...saleValues);
  const minSale = Math.min(...saleValues);
  const totalQuantity = sales.reduce((sum, sale) => sum + (sale.quantity || 0), 0);
  const uniqueProducts = new Set(sales.map(s => s.productName)).size;

  return {
    totalSales,
    salesCount,
    averageTicket,
    maxSale,
    minSale,
    totalQuantity,
    uniqueProducts,
  };
};

/**
 * Calcula el crecimiento comparando dos períodos
 * @param {number} current - Valor actual
 * @param {number} previous - Valor anterior
 * @returns {object} Crecimiento absoluto y porcentual
 */
export const calculateGrowth = (current, previous) => {
  const absolute = current - previous;
  const percentage = previous === 0 ? 100 : ((absolute / previous) * 100);
  
  return {
    absolute,
    percentage,
    isPositive: absolute >= 0,
  };
};

/**
 * Encuentra los productos más vendidos
 * @param {Array} sales - Array de ventas
 * @param {number} limit - Cantidad de productos a retornar
 * @returns {Array} Top productos
 */
export const getTopProducts = (sales, limit = 5) => {
  const products = calculateSalesByProduct(sales);
  return products.slice(0, limit);
};

/**
 * Encuentra las horas pico de ventas
 * @param {Array} sales - Array de ventas
 * @param {number} limit - Cantidad de horas a retornar
 * @returns {Array} Horas con más ventas
 */
export const getPeakHours = (sales, limit = 3) => {
  const hourly = groupSalesByHour(sales);
  
  const hoursArray = Object.entries(hourly).map(([hour, data]) => ({
    hour: parseInt(hour),
    ...data,
  }));

  return hoursArray
    .sort((a, b) => b.total - a.total)
    .slice(0, limit)
    .map(h => ({
      ...h,
      hourRange: `${h.hour}:00 - ${h.hour}:59`,
    }));
};

// ==================== PROYECCIONES ====================

/**
 * Proyecta ventas futuras basándose en datos históricos
 * @param {Array} sales - Array de ventas históricas
 * @param {number} daysToProject - Días a proyectar
 * @returns {object} Proyección
 */
export const projectSales = (sales, daysToProject = 30) => {
  if (!sales || sales.length === 0) {
    return {
      projectedTotal: 0,
      projectedDaily: 0,
      confidence: 'low',
    };
  }

  // Calcular promedio diario de los últimos 30 días
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentSales = sales.filter(sale => {
    const saleDate = sale.createdAt instanceof Date ? sale.createdAt : new Date(sale.createdAt);
    return saleDate >= thirtyDaysAgo;
  });

  const daysWithSales = new Set(
    recentSales.map(sale => {
      const date = sale.createdAt instanceof Date ? sale.createdAt : new Date(sale.createdAt);
      return date.toDateString();
    })
  ).size;

  const dailyAverage = daysWithSales > 0 
    ? calculateTotalSales(recentSales) / daysWithSales 
    : 0;

  const projectedTotal = dailyAverage * daysToProject;
  
  // Determinar confianza basada en cantidad de datos
  let confidence = 'low';
  if (daysWithSales >= 20) confidence = 'high';
  else if (daysWithSales >= 10) confidence = 'medium';

  return {
    projectedTotal,
    projectedDaily: dailyAverage,
    confidence,
    basedOnDays: daysWithSales,
  };
};

// ==================== COMPARACIONES ====================

/**
 * Compara ventas entre dos períodos
 * @param {Array} currentSales - Ventas del período actual
 * @param {Array} previousSales - Ventas del período anterior
 * @returns {object} Comparación detallada
 */
export const comparePeriods = (currentSales, previousSales) => {
  const currentMetrics = calculateSalesMetrics(currentSales);
  const previousMetrics = calculateSalesMetrics(previousSales);
  
  return {
    current: currentMetrics,
    previous: previousMetrics,
    growth: {
      sales: calculateGrowth(currentMetrics.totalSales, previousMetrics.totalSales),
      count: calculateGrowth(currentMetrics.salesCount, previousMetrics.salesCount),
      average: calculateGrowth(currentMetrics.averageTicket, previousMetrics.averageTicket),
    },
  };
};

/**
 * Calcula el rendimiento por categoría
 * @param {Array} sales - Array de ventas
 * @param {function} categoryGetter - Función para obtener la categoría
 * @returns {object} Rendimiento por categoría
 */
export const calculatePerformanceByCategory = (sales, categoryGetter) => {
  const categories = {};
  
  sales.forEach(sale => {
    const category = categoryGetter(sale) || 'Sin categoría';
    
    if (!categories[category]) {
      categories[category] = {
        name: category,
        sales: [],
        metrics: null,
      };
    }
    
    categories[category].sales.push(sale);
  });
  
  // Calcular métricas para cada categoría
  Object.keys(categories).forEach(key => {
    categories[key].metrics = calculateSalesMetrics(categories[key].sales);
    delete categories[key].sales; // Eliminar array de ventas para ahorrar memoria
  });
  
  return categories;
};