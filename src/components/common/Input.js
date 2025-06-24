// src/components/common/Input.js
import { Text, TextInput, View } from 'react-native';

export const Input = ({
  label,
  error,
  className = '',
  containerClassName = '',
  ...props
}) => {
  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label && (
        <Text className="text-sm text-gray-600 mb-1 font-inter">{label}</Text>
      )}
      <TextInput
        className={`bg-[#F8F8F8] px-4 py-3 rounded-lg font-inter text-[#00151F] ${
          error ? 'border-2 border-red-500' : ''
        } ${className}`}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error && (
        <Text className="text-red-500 text-xs mt-1 font-inter">{error}</Text>
      )}
    </View>
  );
};

export default Input;