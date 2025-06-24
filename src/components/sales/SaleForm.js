// src/components/sales/SaleForm.js
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRef, useState } from 'react';
import {
    Alert,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const SaleForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  loading = false,
  recentProducts = [],
}) => {
  const [saleData, setSaleData] = useState({
    quantity: initialData?.quantity?.toString() || '',
    productName: initialData?.productName || '',
    saleValue: initialData?.saleValue?.toString() || '',
    paymentType: initialData?.paymentType || 'cash',
    receiptPhoto: initialData?.receiptPhoto || null,
  });
  const [showSuggestions, setShowSuggestions] = useState(false);

  const productInputRef = useRef(null);
  const valueInputRef = useRef(null);

  const validateForm = () => {
    if (!saleData.quantity || !saleData.productName || !saleData.saleValue) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit({
        ...saleData,
        quantity: parseInt(saleData.quantity),
        saleValue: parseFloat(saleData.saleValue),
      });
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSaleData({ ...saleData, receiptPhoto: result.assets[0].uri });
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSaleData({ ...saleData, receiptPhoto: result.assets[0].uri });
    }
  };

  return (
    <View className="space-y-4">
      {/* Cantidad */}
      <View>
        <Text className="text-sm text-gray-600 mb-1 font-inter">
          Cantidad
        </Text>
        <TextInput
          className="bg-[#F8F8F8] px-4 py-3 rounded-lg font-inter text-[#00151F]"
          placeholder="Ej: 1"
          keyboardType="numeric"
          value={saleData.quantity}
          onChangeText={(text) =>
            setSaleData({ ...saleData, quantity: text })
          }
          onSubmitEditing={() => productInputRef.current?.focus()}
          returnKeyType="next"
        />
      </View>

      {/* Producto */}
      <View>
        <Text className="text-sm text-gray-600 mb-1 font-inter">
          Producto
        </Text>
        <TextInput
          ref={productInputRef}
          className="bg-[#F8F8F8] px-4 py-3 rounded-lg font-inter text-[#00151F]"
          placeholder="Nombre del producto"
          value={saleData.productName}
          onChangeText={(text) => {
            setSaleData({ ...saleData, productName: text });
            setShowSuggestions(text.length > 0);
          }}
          onSubmitEditing={() => valueInputRef.current?.focus()}
          returnKeyType="next"
        />
        
        {/* Sugerencias de productos */}
        {showSuggestions && recentProducts.length > 0 && (
          <View className="absolute top-16 left-0 right-0 bg-white border border-gray-200 rounded-lg z-10">
            {recentProducts
              .filter((p) =>
                p.toLowerCase().includes(saleData.productName.toLowerCase())
              )
              .slice(0, 3)
              .map((product, index) => (
                <TouchableOpacity
                  key={index}
                  className="px-4 py-3 border-b border-gray-100"
                  onPress={() => {
                    setSaleData({ ...saleData, productName: product });
                    setShowSuggestions(false);
                    valueInputRef.current?.focus();
                  }}
                >
                  <Text className="font-inter text-[#00151F]">
                    {product}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        )}
      </View>

      {/* Valor */}
      <View>
        <Text className="text-sm text-gray-600 mb-1 font-inter">
          Valor de venta
        </Text>
        <TextInput
          ref={valueInputRef}
          className="bg-[#F8F8F8] px-4 py-3 rounded-lg font-inter text-[#00151F]"
          placeholder="$0"
          keyboardType="numeric"
          value={saleData.saleValue}
          onChangeText={(text) =>
            setSaleData({ ...saleData, saleValue: text })
          }
          returnKeyType="done"
        />
      </View>

      {/* Tipo de pago */}
      <View>
        <Text className="text-sm text-gray-600 mb-2 font-inter">
          Tipo de pago
        </Text>
        <View className="flex-row space-x-3">
          <TouchableOpacity
            className={`flex-1 py-3 rounded-lg items-center ${
              saleData.paymentType === 'cash'
                ? 'bg-[#0379AF]'
                : 'bg-[#E8F1F3]'
            }`}
            onPress={() =>
              setSaleData({ ...saleData, paymentType: 'cash' })
            }
          >
            <Text
              className={`font-inter font-medium ${
                saleData.paymentType === 'cash'
                  ? 'text-white'
                  : 'text-[#00151F]'
              }`}
            >
              Efectivo
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 rounded-lg items-center ${
              saleData.paymentType === 'transfer'
                ? 'bg-[#0379AF]'
                : 'bg-[#E8F1F3]'
            }`}
            onPress={() =>
              setSaleData({ ...saleData, paymentType: 'transfer' })
            }
          >
            <Text
              className={`font-inter font-medium ${
                saleData.paymentType === 'transfer'
                  ? 'text-white'
                  : 'text-[#00151F]'
              }`}
            >
              Transferencia
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Foto del recibo */}
      <View>
        <Text className="text-sm text-gray-600 mb-2 font-inter">
          Recibo (opcional)
        </Text>
        <View className="flex-row space-x-3">
          <TouchableOpacity
            className="flex-1 bg-[#E8F1F3] py-3 rounded-lg items-center flex-row justify-center"
            onPress={takePhoto}
          >
            <Ionicons name="camera" size={20} color="#00151F" />
            <Text className="ml-2 font-inter text-[#00151F]">
              Tomar foto
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-[#E8F1F3] py-3 rounded-lg items-center flex-row justify-center"
            onPress={pickImage}
          >
            <Ionicons name="image" size={20} color="#00151F" />
            <Text className="ml-2 font-inter text-[#00151F]">
              Galería
            </Text>
          </TouchableOpacity>
        </View>
        {saleData.receiptPhoto && (
          <View className="mt-2 flex-row items-center">
            <Ionicons name="checkmark-circle" size={20} color="#0379AF" />
            <Text className="ml-2 text-[#0379AF] font-inter">
              Foto adjunta
            </Text>
          </View>
        )}
      </View>

      {/* Botones de acción */}
      <View className="flex-row space-x-3 mt-4">
        <TouchableOpacity
          className="flex-1 bg-gray-200 py-4 rounded-lg items-center"
          onPress={onCancel}
        >
          <Text className="text-gray-700 font-medium font-inter">
            Cancelar
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-[#0379AF] py-4 rounded-lg items-center"
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text className="text-white font-bold font-inter">
            {loading ? 'Guardando...' : initialData ? 'Actualizar' : 'Guardar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SaleForm;