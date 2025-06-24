// src/screens/main/HomeScreen.js
import { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import Card from '../../components/common/Card';
import FAB from '../../components/common/FAB';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Container from '../../components/layout/Container';
import Header from '../../components/layout/Header';
import QuickSaleModal from '../../components/sales/QuickSaleModal';
import SalesList from '../../components/sales/SalesList';
import { useAuth } from '../../context/AuthContext';
import { useSales } from '../../context/SalesContext';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { todaySales, addSale, isLoading, getProductsSummary } = useSales();
  const [modalVisible, setModalVisible] = useState(false);
  const [recentProducts, setRecentProducts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Obtener productos recientes para autocompletado
    const products = getProductsSummary();
    setRecentProducts(products.map(p => p.name).slice(0, 5));
  }, [todaySales]);

  const handleAddSale = async (saleData) => {
    try {
      setIsSubmitting(true);
      const result = await addSale(saleData);
      
      if (result.success) {
        setModalVisible(false);
        Alert.alert('Éxito', 'Venta registrada correctamente');
      } else {
        Alert.alert('Error', 'No se pudo registrar la venta');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al registrar la venta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getTotalSales = () => {
    return todaySales.reduce((sum, sale) => sum + sale.saleValue, 0);
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading && todaySales.length === 0) {
    return <LoadingSpinner fullScreen text="Cargando ventas..." />;
  }

  return (
    <Container safeArea={false}>
      {/* Header personalizado */}
      <Header
        title={`Hola, ${user?.displayName || 'Vendedor'}`}
        subtitle={getCurrentDate()}
        rightIcon="sync-outline"
        onRightPress={() => {
          // Función de sincronización manual
          Alert.alert('Sincronización', 'Datos actualizados');
        }}
      />

      <View className="flex-1 bg-[#F8F8F8]">
        {/* Resumen del día */}
        <View className="px-5 mt-5">
          <Card className="bg-white">
            <Text className="text-[#00151F] text-lg font-bold font-inter mb-2">
              Resumen de Hoy
            </Text>
            <View className="flex-row justify-between">
              <Text className="text-gray-600 font-inter">Total Ventas:</Text>
              <Text className="text-[#0379AF] font-bold font-inter">
                {formatCurrency(getTotalSales())}
              </Text>
            </View>
            <View className="flex-row justify-between mt-1">
              <Text className="text-gray-600 font-inter">Cantidad:</Text>
              <Text className="text-[#00151F] font-bold font-inter">
                {todaySales.length} {todaySales.length === 1 ? 'venta' : 'ventas'}
              </Text>
            </View>
          </Card>
        </View>

        {/* Lista de ventas */}
        <View className="flex-1 px-5 mt-4">
          <Text className="text-[#00151F] text-lg font-bold font-inter mb-3">
            Ventas Recientes
          </Text>
          <SalesList
            sales={todaySales}
            onSalePress={(sale) => 
              navigation.navigate('SaleDetail', { saleId: sale.id })
            }
            emptyMessage="No hay ventas registradas hoy. Toca el botón + para agregar una."
          />
        </View>

        {/* Modal de venta rápida */}
        <QuickSaleModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSubmit={handleAddSale}
          loading={isSubmitting}
          recentProducts={recentProducts}
        />

        {/* FAB */}
        <FAB onPress={() => setModalVisible(true)} />
      </View>
    </Container>
  );
};

export default HomeScreen;