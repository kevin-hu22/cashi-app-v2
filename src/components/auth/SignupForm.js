// src/components/auth/SignupForm.js
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import Button from '../common/Button';
import Input from '../common/Input';

const SignupForm = ({ onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.displayName) {
      newErrors.displayName = 'El nombre es requerido';
    } else if (formData.displayName.length < 3) {
      newErrors.displayName = 'Mínimo 3 caracteres';
    }
    
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
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
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
        label="Nombre completo"
        placeholder="Juan Pérez"
        value={formData.displayName}
        onChangeText={(text) => setFormData({ ...formData, displayName: text })}
        autoCapitalize="words"
        error={errors.displayName}
      />

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

      <View className="relative">
        <Input
          label="Confirmar contraseña"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
          secureTextEntry={!showConfirmPassword}
          error={errors.confirmPassword}
        />
        <TouchableOpacity
          className="absolute right-4 top-9"
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <Ionicons
            name={showConfirmPassword ? 'eye-off' : 'eye'}
            size={20}
            color="#6B7280"
          />
        </TouchableOpacity>
      </View>

      <Button
        title="Crear Cuenta"
        onPress={handleSubmit}
        loading={loading}
        size="lg"
        className="mt-2"
      />
    </View>
  );
};

export default SignupForm;