// src/screens/auth/ForgotPasswordScreen.js
/* eslint-disable import/no-unresolved */
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Container from '../../components/layout/Container';
import authService from '../../services/firebase/authService';
import { validateEmail } from '../../utils/validators';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const handleResetPassword = async () => {
    // Validar email
    const validation = validateEmail(email);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await authService.sendPasswordReset(email);
      
      if (result.success) {
        setEmailSent(true);
        Alert.alert(
          'Correo Enviado',
          'Hemos enviado un enlace para restablecer tu contraseña a tu correo electrónico.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar el correo de recuperación');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <Container className="px-6">
        <View className="flex-1 justify-center items-center">
          <View className="bg-[#E8F1F3] w-20 h-20 rounded-full items-center justify-center mb-4">
            <Ionicons name="mail-open-outline" size={40} color="#0379AF" />
          </View>
          <Text className="text-2xl font-bold text-[#00151F] font-inter text-center">
            Revisa tu correo
          </Text>
          <Text className="text-gray-500 mt-3 font-inter text-center px-8">
            Hemos enviado instrucciones para restablecer tu contraseña a {email}
          </Text>
          <Button
            title="Volver al inicio"
            onPress={() => navigation.navigate('Login')}
            size="lg"
            className="mt-8 w-full"
          />
        </View>
      </Container>
    );
  }

  return (
    <Container scrollable keyboardAvoiding className="px-6">
      <View className="flex-1 justify-center min-h-screen">
        <View className="items-center mb-8">
          <View className="bg-[#0379AF] w-20 h-20 rounded-full items-center justify-center mb-4">
            <Ionicons name="lock-closed-outline" size={40} color="#FFFFFF" />
          </View>
          <Text className="text-2xl font-bold text-[#00151F] font-inter text-center">
            ¿Olvidaste tu contraseña?
          </Text>
          <Text className="text-gray-500 mt-3 font-inter text-center px-4">
            No te preocupes, te enviaremos instrucciones para restablecerla.
          </Text>
        </View>

        <View>
          <Input
            label="Correo electrónico"
            placeholder="correo@ejemplo.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            error={error}
          />

          <Button
            title="Enviar instrucciones"
            onPress={handleResetPassword}
            loading={loading}
            size="lg"
            className="mt-4"
          />

          <Button
            title="Volver al inicio de sesión"
            onPress={() => navigation.goBack()}
            variant="outline"
            size="lg"
            className="mt-3"
          />
        </View>
      </View>
    </Container>
  );
};

export default ForgotPasswordScreen;