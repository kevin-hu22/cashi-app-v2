// src/screens/main/ReportsScreen.js
/* eslint-disable import/no-unresolved */
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Container from '../../components/layout/Container';
import { useSales } from '../../context/SalesContext';
import {
    calculateSalesByPaymentType,
    calculateSalesMetrics,
    getPeakHours,
    getTopProducts,
    groupSalesByDay,
} from '../../utils/analytics';
import { COLORS } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';

const screenWidth = Dimensions.get('window').width;

const ReportsScreen = ({ route }) => {
  const { todaySales } = useSales();
  const [period, setPeriod] = useState(route.params?.initialPeriod || 'week');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    generateReport();
  }, [period, todaySales]);

  const generateReport = async () => {
    setLoading(true);
    try {
      // Aquí normalmente obtendrías datos según el período seleccionado
      // Por ahora usamos solo los datos de hoy como ejemplo
      
      const metrics = calculateSalesMetrics(todaySales);
      const paymentTypes = calculateSalesByPaymentType(todaySales);
      const topProducts = getTopProducts(todaySales, 5);
      const dailySales = groupSalesByDay(todaySales);
      const peakHours = getPeakHours(todaySales, 3);

      setReportData({
        metrics,
        paymentTypes,
        topProducts,
        dailySales,
        peakHours,
      });
    } catch (error) {
      console.error('Error generando reporte:', error);
    } finally {
      setLoading(false);
    }
  };

  const PeriodSelector = () => (
    <View className="flex-row bg-[#E8F1F3] p-1 rounded-lg mb-4">
      {['day', 'week', 'month', 'year'].map((p) => (
        <TouchableOpacity
          key={p}
          className={`flex-1 py-2 rounded-md items-center ${
            period === p ? 'bg-white' : ''
          }`}
          onPress={() => setPeriod(p)}
        >
          <Text
            className={`font-inter font-medium ${
              period === p ? 'text-[#0379AF]' : 'text-gray-600'
            }`}
          >
            {p === 'day' ? 'Día' : p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Año'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const MetricCard = ({ title, value, subtitle, icon, trend }) => (
    <Card className="flex-1 mx-1">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="font-inter text-gray-500 text-xs">{title}</Text>
          <Text className="font-inter font-bold text-[#00151F] text-lg mt-1">
            {value}
          </Text>
          {subtitle && (
            <Text className="font-inter text-gray-400 text-xs mt-1">
              {subtitle}
            </Text>
          )}
        </View>
        <View className="bg-[#E8F1F3] p-2 rounded-full">
          <Ionicons name={icon} size={20} color={COLORS.primary} />
        </View>
      </View>
      {trend && (
        <View className="flex-row items-center mt-2">
          <Ionicons
            name={trend > 0 ? 'trending-up' : 'trending-down'}
            size={16}
            color={trend > 0 ? COLORS.success : COLORS.error}
          />
          <Text
            className={`font-inter text-xs ml-1 ${
              trend > 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {Math.abs(trend)}%
          </Text>
        </View>
      )}
    </Card>
  );

  if (loading || !reportData) {
    return <LoadingSpinner fullScreen text="Generando reporte..." />;
  }

  // Configuración de gráficos
  const chartConfig = {
    backgroundColor: COLORS.white,
    backgroundGradientFrom: COLORS.white,
    backgroundGradientTo: COLORS.white,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(3, 121, 175, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 21, 31, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: COLORS.primary,
    },
  };

  // Datos para gráfico de línea (ventas diarias)
  const lineChartData = {
    labels: reportData.dailySales.slice(-7).map(d => d.day.toString()),
    datasets: [
      {
        data: reportData.dailySales.slice(-7).map(d => d.total),
        color: (opacity = 1) => `rgba(3, 121, 175, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  // Datos para gráfico de torta (tipos de pago)
  const pieChartData = [
    {
      name: 'Efectivo',
      population: reportData.paymentTypes.cash.total,
      color: COLORS.success,
      legendFontColor: COLORS.text,
      legendFontSize: 12,
    },
    {
      name: 'Transferencia',
      population: reportData.paymentTypes.transfer.total,
      color: COLORS.primary,
      legendFontColor: COLORS.text,
      legendFontSize: 12,
    },
  ];

  return (
    <Container>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-4">
          <PeriodSelector />

          {/* Métricas principales */}
          <View className="mb-4">
            <Text className="font-inter font-bold text-[#00151F] text-lg mb-3">
              Resumen General
            </Text>
            <View className="flex-row">
              <MetricCard
                title="Total Ventas"
                value={formatCurrency(reportData.metrics.totalSales)}
                subtitle={`${reportData.metrics.salesCount} ventas`}
                icon="cash-outline"
                trend={15}
              />
              <MetricCard
                title="Ticket Promedio"
                value={formatCurrency(reportData.metrics.averageTicket)}
                icon="receipt-outline"
                trend={-5}
              />
            </View>
          </View>

          {/* Gráfico de ventas */}
          <Card className="mb-4">
            <Text className="font-inter font-bold text-[#00151F] mb-3">
              Tendencia de Ventas
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={lineChartData}
                width={screenWidth - 60}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
              />
            </ScrollView>
          </Card>

          {/* Distribución por tipo de pago */}
          <Card className="mb-4">
            <Text className="font-inter font-bold text-[#00151F] mb-3">
              Distribución por Tipo de Pago
            </Text>
            <View className="items-center">
              <PieChart
                data={pieChartData}
                width={screenWidth - 80}
                height={200}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>
          </Card>

          {/* Productos más vendidos */}
          <Card className="mb-4">
            <Text className="font-inter font-bold text-[#00151F] mb-3">
              Top 5 Productos
            </Text>
            {reportData.topProducts.map((product, index) => (
              <View
                key={product.name}
                className="flex-row items-center py-3 border-b border-gray-100"
              >
                <View className="bg-[#E8F1F3] w-8 h-8 rounded-full items-center justify-center mr-3">
                  <Text className="font-inter font-bold text-[#0379AF]">
                    {index + 1}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="font-inter font-medium text-[#00151F]">
                    {product.name}
                  </Text>
                  <Text className="font-inter text-xs text-gray-500">
                    {product.quantity} unidades
                  </Text>
                </View>
                <Text className="font-inter font-bold text-[#0379AF]">
                  {formatCurrency(product.totalValue)}
                </Text>
              </View>
            ))}
          </Card>

          {/* Horas pico */}
          <Card className="mb-4">
            <Text className="font-inter font-bold text-[#00151F] mb-3">
              Horas Pico de Ventas
            </Text>
            {reportData.peakHours.map((hour, index) => (
              <View
                key={hour.hour}
                className="flex-row items-center py-3 border-b border-gray-100"
              >
                <Ionicons 
                  name="time-outline" 
                  size={20} 
                  color={COLORS.textSecondary}
                  style={{ marginRight: 12 }}
                />
                <View className="flex-1">
                  <Text className="font-inter font-medium text-[#00151F]">
                    {hour.hourRange}
                  </Text>
                  <Text className="font-inter text-xs text-gray-500">
                    {hour.count} ventas
                  </Text>
                </View>
                <Text className="font-inter font-bold text-[#0379AF]">
                  {formatCurrency(hour.total)}
                </Text>
              </View>
            ))}
          </Card>

          {/* Botón de exportar */}
          <TouchableOpacity
            className="bg-[#0379AF] py-4 rounded-lg items-center mt-4 mb-8 flex-row justify-center"
            onPress={() => navigation.navigate('Export', { 
              dateRange: { start: new Date(), end: new Date() },
              reportData 
            })}
          >
            <Ionicons name="download-outline" size={20} color="#FFFFFF" />
            <Text className="text-white font-bold font-inter ml-2">
              Exportar Reporte
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Container>
  );
};

export default ReportsScreen;