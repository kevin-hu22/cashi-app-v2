// src/screens/auth/LoginScreen.js
import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import { useEffect } from 'react';
import {
  Alert,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LoginForm from '../../components/auth/LoginForm';
import SocialLoginButtons from '../../components/auth/SocialLoginButtons';
import Container from '../../components/layout/Container';
import { useAuth } from '../../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const { login, loginWithGoogle, isLoading } = useAuth();
  
  // Configurar Google Sign In
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.GOOGLE_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleLogin(id_token);
    }
  }, [response]);

  const handleLogin = async (formData) => {
    const result = await login(formData.email, formData.password);
    
    if (!result.success) {
      Alert.alert('Error', result.error);
    }
  };

  const handleGoogleLogin = async (idToken) => {
    const result = await loginWithGoogle(idToken);
    
    if (!result.success) {
      Alert.alert('Error', result.error);
    }
  };

  const handleAppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      
      // Implementar login con Apple
      console.log('Apple credential:', credential);
      Alert.alert('Próximamente', 'Login con Apple ID estará disponible pronto');
    } catch (error) {
      if (error.code !== 'ERR_CANCELED') {
        Alert.alert('Error', 'No se pudo iniciar sesión con Apple');
      }
    }
  };

  return (
    <Container scrollable keyboardAvoiding>
      <View className="flex-1 px-6 justify-center min-h-screen">
        {/* Logo y Título */}
        <View className="items-center mb-8">
          <View className="bg-[#0379AF] w-20 h-20 rounded-full items-center justify-center mb-4">
            <Ionicons name="cash-outline" size={40} color="#FFFFFF" />
          </View>
          <Text className="text-3xl font-bold text-[#00151F] font-inter">
            Control de Ventas
          </Text>
          <Text className="text-gray-500 mt-2 font-inter">
            Inicia sesión para continuar
          </Text>
        </View>

        {/* Formulario de Login */}
        <LoginForm onSubmit={handleLogin} loading={isLoading} />

        {/* Botones Sociales */}
        <SocialLoginButtons
          onGooglePress={() => promptAsync()}
          onApplePress={handleAppleLogin}
          googleDisabled={!request}
        />

        {/* Link a registro */}
        <View className="flex-row justify-center mt-8 mb-4">
          <Text className="text-gray-600 font-inter">
            ¿No tienes cuenta?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text className="text-[#0379AF] font-inter font-semibold">
              Regístrate
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Container>
  );
};

export default LoginScreen;