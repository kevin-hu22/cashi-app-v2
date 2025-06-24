// src/screens/main/DailySummaryScreen.js
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Container from '../../components/layout/Container';
import Header from '../../components/layout/Header';
import { useSales } from '../../context/SalesContext';

const DailySummaryScreen = () => {
  const { todaySales, isLoading, refreshSales } = useSales();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshSales();
    setRefreshing(false);
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Calcular resúmenes
  const summary = useMemo(() => {
    const cashSales = todaySales.filter(sale => sale.paymentType === 'cash');
    const transferSales = todaySales.filter(sale => sale.paymentType === 'transfer');
    
    const cashTotal = cashSales.reduce((sum, sale) => sum + sale.saleValue, 0);
    const transferTotal = transferSales.reduce((sum, sale) => sum + sale.saleValue, 0);
    const totalAmount = cashTotal + transferTotal;
    
    // Agrupar por producto
    const productSummary = todaySales.reduce((acc, sale) => {
      if (!acc[sale.productName]) {
        acc[sale.productName] = {
          name: sale.productName,
          quantity: 0,
          total: 0,
          count: 0,
        };
      }
      acc[sale.productName].quantity += sale.quantity;
      acc[sale.productName].total += sale.saleValue;
      acc[sale.productName].count += 1;
      return acc;
    }, {});
    
    const topProducts = Object.values(productSummary)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
    
    // Calcular ventas por hora
    const salesByHour = todaySales.reduce((acc, sale) => {
      const hour = new Date(sale.createdAt).getHours();
      if (!acc[hour]) acc[hour] = 0;
      acc[hour]++;
      return acc;
    }, {});
    
    return {
      totalSales: todaySales.length,
      totalAmount,
      cashCount: cashSales.length,
      cashTotal,
      transferCount: transferSales.length,
      transferTotal,
      topProducts,
      averageTicket: todaySales.length > 0 ? totalAmount / todaySales.length : 0,
      salesByHour,
    };
  }, [todaySales]);

  const SummaryCard = ({ title, value, subtitle, icon, iconColor = '#0379AF' }) => (
    <Card className="flex-1 mx-1">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="font-inter text-gray-500 text-sm">{title}</Text>
          <Text className="font-inter font-bold text-[#00151F] text-xl mt-1">
            {value}
          </Text>
          {subtitle && (
            <Text className="font-inter text-gray-400 text-xs mt-1">
              {subtitle}
            </Text>
          )}
        </View>
        <View className={`bg-[#E8F1F3] p-3 rounded-full`}>
          <Ionicons name={icon} size={24} color={iconColor} />
        </View>
      </View>
    </Card>
  );

  if (isLoading && todaySales.length === 0) {
    return <LoadingSpinner fullScreen text="Cargando resumen..." />;
  }

  return (
    <Container safeArea={false}>
      <Header
        title="Resumen del Día"
        subtitle={new Date().toLocaleDateString('es-CO', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      />

      <ScrollView 
        className="flex-1 bg-[#F8F8F8]"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Resumen Principal */}
        <View className="px-4 mt-5">
          <Card className="bg-[#0379AF]">
            <View className="items-center py-2">
              <Text className="font-inter text-white/80 text-sm">
                Total del Día
              </Text>
              <Text className="font-inter font-bold text-white text-3xl mt-1">
                {formatCurrency(summary.totalAmount)}
              </Text>
              <Text className="font-inter text-white/60 text-sm mt-1">
                {summary.totalSales} {summary.totalSales === 1 ? 'venta' : 'ventas'}
              </Text>
            </View>
          </Card>
        </View>

        {/* Tarjetas de Resumen */}
        <View className="flex-row px-3 mt-4">
          <SummaryCard
            title="Efectivo"
            value={formatCurrency(summary.cashTotal)}
            subtitle={`${summary.cashCount} ${summary.cashCount === 1 ? 'venta' : 'ventas'}`}
            icon="cash-outline"
            iconColor="#10B981"
          />
          <SummaryCard
            title="Transferencias"
            value={formatCurrency(summary.transferTotal)}
            subtitle={`${summary.transferCount} ${summary.transferCount === 1 ? 'venta' : 'ventas'}`}
            icon="card-outline"
            iconColor="#0379AF"
          />
        </View>

        <View className="flex-row px-3 mt-2">
          <SummaryCard
            title="Ticket Promedio"
            value={formatCurrency(summary.averageTicket)}
            icon="analytics-outline"
            iconColor="#F59E0B"
          />
          <SummaryCard
            title="Total Ventas"
            value={summary.totalSales.toString()}
            subtitle="Transacciones"
            icon="receipt-outline"
            iconColor="#8B5CF6"
          />
        </View>

        {/* Productos Más Vendidos */}
        {summary.topProducts.length > 0 && (
          <View className="px-4 mt-6">
            <Text className="font-inter font-bold text-[#00151F] text-lg mb-3">
              Productos Más Vendidos
            </Text>
            {summary.topProducts.map((product, index) => (
              <Card key={product.name} className="mb-2">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="bg-[#E8F1F3] w-8 h-8 rounded-full items-center justify-center mr-3">
                      <Text className="font-inter font-bold text-[#0379AF]">
                        {index + 1}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-inter font-semibold text-[#00151F]">
                        {product.name}
                      </Text>
                      <Text className="font-inter text-gray-500 text-sm">
                        {product.quantity} unidades • {product.count} ventas
                      </Text>
                    </View>
                  </View>
                  <Text className="font-inter font-bold text-[#0379AF]">
                    {formatCurrency(product.total)}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Mensaje vacío */}
        {todaySales.length === 0 && (
          <View className="items-center justify-center py-20">
            <Ionicons name="bar-chart-outline" size={64} color="#E8F1F3" />
            <Text className="text-gray-400 mt-4 font-inter">
              No hay ventas registradas hoy
            </Text>
          </View>
        )}
        
        <View className="h-20" />
      </ScrollView>
    </Container>
  );
};

export default DailySummaryScreen;