// src/components/sales/SalesList.js
import { Ionicons } from '@expo/vector-icons';
import { FlatList, Text, View } from 'react-native';
import SaleCard from './SaleCard';

const SalesList = ({ sales, onSalePress, emptyMessage = 'No hay ventas registradas' }) => {
  if (sales.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <Ionicons name="receipt-outline" size={64} color="#E8F1F3" />
        <Text className="text-gray-400 mt-4 font-inter text-center">
          {emptyMessage}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={sales}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <SaleCard
          sale={item}
          onPress={() => onSalePress(item)}
        />
      )}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default SalesList;