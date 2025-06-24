/* eslint-disable import/no-unresolved */
// src/navigation/AuthNavigator.js
import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import { COLORS } from '../utils/constants';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: COLORS.background,
        },
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          animation: 'fade',
        }}
      />
      
      <Stack.Screen 
        name="Signup" 
        component={SignupScreen}
        options={({ navigation }) => ({
          headerShown: true,
          title: '',
          headerTransparent: true,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="p-2"
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
          ),
          headerShadowVisible: false,
        })}
      />
      
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={({ navigation }) => ({
          headerShown: true,
          title: 'Recuperar Contraseña',
          headerStyle: {
            backgroundColor: COLORS.background,
          },
          headerTintColor: COLORS.text,
          headerTitleStyle: {
            fontFamily: 'Inter',
            fontSize: 18,
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="p-2"
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
          ),
          headerShadowVisible: false,
        })}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;