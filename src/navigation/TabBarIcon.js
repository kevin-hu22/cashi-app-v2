// src/navigation/TabBarIcon.js
 
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { COLORS } from '../utils/constants';

/**
 * Componente animado de icono para el tab bar
 */
const TabBarIcon = ({ 
  name, 
  focused, 
  color = COLORS.textSecondary,
  size = 24,
  showBadge = false,
  badgeCount = 0,
}) => {
  const scale = useSharedValue(focused ? 1 : 0.9);
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    if (focused) {
      scale.value = withSpring(1.1, {
        damping: 15,
        stiffness: 150,
      });
      rotation.value = withSpring(5, {
        damping: 20,
        stiffness: 80,
      });
      
      // Volver a la posición normal
      setTimeout(() => {
        scale.value = withSpring(1, {
          damping: 15,
          stiffness: 150,
        });
        rotation.value = withSpring(0, {
          damping: 20,
          stiffness: 80,
        });
      }, 200);
    } else {
      scale.value = withTiming(0.9, { duration: 200 });
      rotation.value = withTiming(0, { duration: 200 });
    }
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
    };
  });

  const Badge = () => {
    if (!showBadge || badgeCount === 0) return null;

    return (
      <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
        <Text className="text-white text-xs font-bold font-inter">
          {badgeCount > 99 ? '99+' : badgeCount}
        </Text>
      </View>
    );
  };

  return (
    <View className="relative">
      <Animated.View style={animatedStyle}>
        <Ionicons
          name={name}
          size={size}
          color={focused ? COLORS.primary : color}
        />
      </Animated.View>
      <Badge />
    </View>
  );
};

export default TabBarIcon;