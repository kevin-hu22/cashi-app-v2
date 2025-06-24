// src/components/layout/Header.js
import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Header = ({
  title,
  subtitle,
  showBack = false,
  onBackPress,
  rightIcon,
  onRightPress,
  className = '',
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View 
      className={`bg-[#00151F] px-5 pb-4 shadow-md ${className}`}
      style={{ paddingTop: insets.top + 16 }}
    >
      <View className="flex-row items-center justify-between">
        {showBack ? (
          <TouchableOpacity onPress={onBackPress} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ) : null}

        <View className="flex-1">
          <Text className="text-white text-2xl font-bold font-inter">
            {title}
          </Text>
          {subtitle && (
            <Text className="text-[#E8F1F3] text-sm font-inter mt-1">
              {subtitle}
            </Text>
          )}
        </View>

        {rightIcon && (
          <TouchableOpacity onPress={onRightPress}>
            <Ionicons name={rightIcon} size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default Header;