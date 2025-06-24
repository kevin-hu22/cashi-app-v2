/* eslint-disable import/no-unresolved */
// src/screens/auth/SignupScreen.js
import { Ionicons } from '@expo/vector-icons';
import {
    Alert,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import SignupForm from '../../components/auth/SignupForm';
import Container from '../../components/layout/Container';
import { useAuth } from '../../context/AuthContext';

const SignupScreen = ({ navigation }) => {
  const { signup, isLoading } = useAuth();

  const handleSignup = async (formData) => {
    const result = await signup(
      formData.email,
      formData.password,
      formData.displayName
    );
    
    if (!result.success) {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <Container scrollable keyboardAvoiding>
      <View className="flex-1 px-6 justify-center min-h-screen">
        {/* Header con botón de volver */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="absolute top-14 left-6 z-10"
        >
          <Ionicons name="arrow-back" size={24} color="#00151F" />
        </TouchableOpacity>

        {/* Logo y Título */}
        <View className="items-center mb-8">
          <View className="bg-[#0379AF] w-20 h-20 rounded-full items-center justify-center mb-4">
            <Ionicons name="person-add-outline" size={40} color="#FFFFFF" />
          </View>
          <Text className="text-3xl font-bold text-[#00151F] font-inter">
            Crear Cuenta
          </Text>
          <Text className="text-gray-500 mt-2 font-inter text-center px-8">
            Regístrate para empezar a controlar tus ventas
          </Text>
        </View>

        {/* Formulario de Registro */}
        <SignupForm onSubmit={handleSignup} loading={isLoading} />

        {/* Términos y condiciones */}
        <Text className="text-center text-xs text-gray-500 font-inter mt-6 px-8">
          Al crear una cuenta, aceptas nuestros{' '}
          <Text className="text-[#0379AF]">Términos de Servicio</Text> y{' '}
          <Text className="text-[#0379AF]">Política de Privacidad</Text>
        </Text>

        {/* Link a login */}
        <View className="flex-row justify-center mt-6 mb-4">
          <Text className="text-gray-600 font-inter">
            ¿Ya tienes cuenta?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text className="text-[#0379AF] font-inter font-semibold">
              Inicia sesión
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Container>
  );
};

export default SignupScreen;