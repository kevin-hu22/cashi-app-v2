// src/components/common/FAB.js
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

export const FAB = ({ onPress, icon = 'add', className = '' }) => {
  return (
    <TouchableOpacity
      className={`absolute bottom-6 right-6 bg-[#0379AF] w-14 h-14 rounded-full items-center justify-center shadow-lg ${className}`}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name={icon} size={28} color="#FFFFFF" />
    </TouchableOpacity>
  );
};

export default FAB;