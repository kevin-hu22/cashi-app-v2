// src/components/auth/SocialLoginButtons.js
import { Ionicons } from '@expo/vector-icons';
import { Platform, Text, TouchableOpacity, View } from 'react-native';

const SocialLoginButtons = ({
  onGooglePress,
  onApplePress,
  googleDisabled = false,
  appleDisabled = false,
}) => {
  return (
    <View>
      {/* Divisor */}
      <View className="flex-row items-center my-6">
        <View className="flex-1 h-[1px] bg-gray-300" />
        <Text className="mx-4 text-gray-500 font-inter">o continúa con</Text>
        <View className="flex-1 h-[1px] bg-gray-300" />
      </View>

      {/* Botones sociales */}
      <View className="space-y-3">
        <TouchableOpacity
          className="bg-white border border-gray-300 py-3 rounded-lg flex-row items-center justify-center"
          onPress={onGooglePress}
          disabled={googleDisabled}
        >
          <Ionicons name="logo-google" size={20} color="#DB4437" />
          <Text className="ml-2 font-inter font-medium text-[#00151F]">
            Google
          </Text>
        </TouchableOpacity>

        {Platform.OS === 'ios' && (
          <TouchableOpacity
            className="bg-black py-3 rounded-lg flex-row items-center justify-center mt-3"
            onPress={onApplePress}
            disabled={appleDisabled}
          >
            <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
            <Text className="ml-2 font-inter font-medium text-white">
              Apple ID
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default SocialLoginButtons;