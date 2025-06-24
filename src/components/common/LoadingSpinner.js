// src/components/common/LoadingSpinner.js
import { ActivityIndicator, Text, View } from 'react-native';

export const LoadingSpinner = ({
  size = 'large',
  color = '#0379AF',
  text = '',
  fullScreen = false,
  className = '',
}) => {
  if (fullScreen) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F8F8F8]">
        <ActivityIndicator size={size} color={color} />
        {text ? (
          <Text className="mt-4 text-gray-600 font-inter">{text}</Text>
        ) : null}
      </View>
    );
  }

  return (
    <View className={`items-center justify-center py-4 ${className}`}>
      <ActivityIndicator size={size} color={color} />
      {text ? (
        <Text className="mt-2 text-gray-600 font-inter text-sm">{text}</Text>
      ) : null}
    </View>
  );
};

export default LoadingSpinner;