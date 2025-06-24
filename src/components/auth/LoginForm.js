// src/components/auth/LoginForm.js
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Button from '../common/Button';
import Input from '../common/Input';

const LoginForm = ({ onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Correo inválido';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <View>
      <Input
        label="Correo electrónico"
        placeholder="correo@ejemplo.com"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />

      <View className="relative">
        <Input
          label="Contraseña"
          placeholder="••••••••"
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          secureTextEntry={!showPassword}
          error={errors.password}
        />
        <TouchableOpacity
          className="absolute right-4 top-9"
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={20}
            color="#6B7280"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity className="mb-6">
        <Text className="text-[#0379AF] text-sm font-inter text-right">
          ¿Olvidaste tu contraseña?
        </Text>
      </TouchableOpacity>

      <Button
        title="Iniciar Sesión"
        onPress={handleSubmit}
        loading={loading}
        size="lg"
      />
    </View>
  );
};

export default LoginForm;