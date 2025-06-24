// components/sales/SaleCard.js
import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

const SaleCard = ({ sale, onPress }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPaymentIcon = (type) => {
    return type === 'cash' ? 'cash-outline' : 'card-outline';
  };

  const getPaymentText = (type) => {
    return type === 'cash' ? 'Efectivo' : 'Transferencia';
  };

  const getSyncStatusIcon = (status) => {
    if (status === 'pending') {
      return <Ionicons name="cloud-offline-outline" size={16} color="#F59E0B" />;
    }
    return null;
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-lg p-4 mb-3 shadow-sm"
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="font-inter font-semibold text-[#00151F] text-lg">
              {sale.productName}
            </Text>
            {getSyncStatusIcon(sale.syncStatus)}
          </View>
          <Text className="font-inter text-gray-500 text-sm">
            Cantidad: {sale.quantity}
          </Text>
          <View className="flex-row items-center mt-2">
            <Ionicons
              name={getPaymentIcon(sale.paymentType)}
              size={16}
              color="#6B7280"
            />
            <Text className="font-inter text-gray-500 text-sm ml-1">
              {getPaymentText(sale.paymentType)}
            </Text>
            {sale.receiptPhotoUrl && (
              <>
                <Text className="mx-2 text-gray-300">•</Text>
                <Ionicons name="image-outline" size={16} color="#6B7280" />
                <Text className="font-inter text-gray-500 text-sm ml-1">
                  Recibo
                </Text>
              </>
            )}
          </View>
        </View>
        
        <View className="items-end">
          <Text className="font-inter font-bold text-[#0379AF] text-lg">
            {formatCurrency(sale.saleValue)}
          </Text>
          <Text className="font-inter text-gray-400 text-xs mt-1">
            {formatTime(sale.createdAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SaleCard;