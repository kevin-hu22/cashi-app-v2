// src/screens/SplashScreen.js
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Animated, Text, View } from 'react-native';

const SplashScreen = () => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View className="flex-1 bg-[#0379AF] items-center justify-center">
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
        className="items-center"
      >
        <View className="bg-white w-24 h-24 rounded-full items-center justify-center mb-6 shadow-lg">
          <Ionicons name="cash-outline" size={50} color="#0379AF" />
        </View>
        <Text className="text-white text-3xl font-bold font-inter">
          Control de Ventas
        </Text>
        <Text className="text-white/80 text-lg font-inter mt-2">
          Gestiona tu negocio
        </Text>
      </Animated.View>
      
      <View className="absolute bottom-10">
        <Text className="text-white/60 font-inter text-sm">
          Cargando...
        </Text>
      </View>
    </View>
  );
};

export default SplashScreen;