// src/screens/main/SaleDetailScreen.js
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Container from '../../components/layout/Container';
import SaleForm from '../../components/sales/SaleForm';
import { useSales } from '../../context/SalesContext';

const SaleDetailScreen = ({ route, navigation }) => {
  const { saleId } = route.params;
  const { getSaleById, updateSale, deleteSale, getProductsSummary } = useSales();
  const [sale, setSale] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    const saleData = getSaleById(saleId);
    if (saleData) {
      setSale(saleData);
    } else {
      Alert.alert('Error', 'Venta no encontrada');
      navigation.goBack();
    }

    // Obtener productos recientes
    const products = getProductsSummary();
    setRecentProducts(products.map(p => p.name).slice(0, 5));
  }, [saleId]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleUpdate = async (updatedData) => {
    try {
      setIsUpdating(true);
      const result = await updateSale(saleId, updatedData);
      
      if (result.success) {
        setSale({ ...sale, ...updatedData });
        setEditModalVisible(false);
        Alert.alert('Éxito', 'Venta actualizada correctamente');
      } else {
        Alert.alert('Error', 'No se pudo actualizar la venta');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al actualizar');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Venta',
      '¿Estás seguro de que deseas eliminar esta venta?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteSale(saleId);
              if (result.success) {
                Alert.alert('Éxito', 'Venta eliminada correctamente');
                navigation.goBack();
              } else {
                Alert.alert('Error', 'No se pudo eliminar la venta');
              }
            } catch (error) {
              Alert.alert('Error', 'Ocurrió un error al eliminar');
            }
          },
        },
      ]
    );
  };

  if (!sale) {
    return <LoadingSpinner fullScreen text="Cargando detalles..." />;
  }

  return (
    <>
      <Container scrollable>
        <View className="px-5 py-4">
          {/* Información principal */}
          <Card>
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1">
                <Text className="font-inter font-bold text-xl text-[#00151F]">
                  {sale.productName}
                </Text>
                <Text className="font-inter text-gray-500 mt-1">
                  Cantidad: {sale.quantity} {sale.quantity === 1 ? 'unidad' : 'unidades'}
                </Text>
              </View>
              <Text className="font-inter font-bold text-2xl text-[#0379AF]">
                {formatCurrency(sale.saleValue)}
              </Text>
            </View>

            <View className="border-t border-gray-200 pt-4">
              <View className="flex-row justify-between mb-2">
                <Text className="font-inter text-gray-600">Tipo de pago:</Text>
                <View className="flex-row items-center">
                  <Ionicons
                    name={sale.paymentType === 'cash' ? 'cash-outline' : 'card-outline'}
                    size={16}
                    color="#6B7280"
                  />
                  <Text className="font-inter text-[#00151F] ml-1">
                    {sale.paymentType === 'cash' ? 'Efectivo' : 'Transferencia'}
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between mb-2">
                <Text className="font-inter text-gray-600">Fecha:</Text>
                <Text className="font-inter text-[#00151F]">
                  {formatDate(sale.createdAt)}
                </Text>
              </View>

              {sale.syncStatus === 'pending' && (
                <View className="flex-row justify-between mb-2">
                  <Text className="font-inter text-gray-600">Estado:</Text>
                  <View className="flex-row items-center">
                    <Ionicons name="cloud-offline-outline" size={16} color="#F59E0B" />
                    <Text className="font-inter text-yellow-600 ml-1">
                      Pendiente de sincronizar
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </Card>

          {/* Recibo */}
          {sale.receiptPhotoUrl && (
            <Card className="mt-4">
              <Text className="font-inter font-semibold text-[#00151F] mb-3">
                Recibo
              </Text>
              <TouchableOpacity
                onPress={() => setImageModalVisible(true)}
                className="relative"
              >
                <Image
                  source={{ uri: sale.receiptPhotoUrl }}
                  className="w-full h-48 rounded-lg"
                  resizeMode="cover"
                />
                <View className="absolute inset-0 bg-black/10 rounded-lg items-center justify-center">
                  <Ionicons name="expand-outline" size={32} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </Card>
          )}

          {/* Botones de acción */}
          <View className="mt-6 space-y-3">
            <Button
              title="Editar Venta"
              onPress={() => setEditModalVisible(true)}
              variant="primary"
              size="lg"
            />
            <Button
              title="Eliminar Venta"
              onPress={handleDelete}
              variant="danger"
              size="lg"
            />
          </View>
        </View>
      </Container>

      {/* Modal de edición */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View className="flex-1 bg-black/50">
          <View className="bg-white mt-auto rounded-t-3xl max-h-[90%]">
            <ScrollView bounces={false}>
              <View className="p-5">
                <View className="flex-row justify-between items-center mb-5">
                  <Text className="text-xl font-bold text-[#00151F] font-inter">
                    Editar Venta
                  </Text>
                  <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#00151F" />
                  </TouchableOpacity>
                </View>

                <SaleForm
                  initialData={sale}
                  onSubmit={handleUpdate}
                  onCancel={() => setEditModalVisible(false)}
                  loading={isUpdating}
                  recentProducts={recentProducts}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de imagen completa */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={imageModalVisible}
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View className="flex-1 bg-black">
          <TouchableOpacity
            className="absolute top-14 right-5 z-10 bg-black/50 p-2 rounded-full"
            onPress={() => setImageModalVisible(false)}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          {sale.receiptPhotoUrl && (
            <Image
              source={{ uri: sale.receiptPhotoUrl }}
              className="flex-1"
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </>
  );
};

export default SaleDetailScreen;