// src/components/sales/QuickSaleModal.js
import { Ionicons } from '@expo/vector-icons';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import SaleForm from './SaleForm';

const QuickSaleModal = ({
  visible,
  onClose,
  onSubmit,
  loading = false,
  recentProducts = [],
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <TouchableOpacity
          className="flex-1 bg-black/50"
          activeOpacity={1}
          onPress={onClose}
        >
          <TouchableOpacity
            activeOpacity={1}
            className="bg-white mt-auto rounded-t-3xl max-h-[90%]"
            onPress={() => {}}
          >
            <ScrollView bounces={false}>
              <View className="p-5">
                {/* Header del modal */}
                <View className="flex-row justify-between items-center mb-5">
                  <Text className="text-xl font-bold text-[#00151F] font-inter">
                    Nueva Venta
                  </Text>
                  <TouchableOpacity onPress={onClose}>
                    <Ionicons name="close" size={24} color="#00151F" />
                  </TouchableOpacity>
                </View>

                {/* Formulario */}
                <SaleForm
                  onSubmit={onSubmit}
                  onCancel={onClose}
                  loading={loading}
                  recentProducts={recentProducts}
                />
              </View>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default QuickSaleModal;