/* eslint-disable react/jsx-no-undef */
// src/screens/main/SettingsScreen.js
import { Ionicons } from '@expo/vector-icons';
import * as Application from 'expo-application';
import { useState } from 'react';
import {
    Alert,
    Linking,
    ScrollView,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Container from '../../components/layout/Container';
import Header from '../../components/layout/Header';
import { useAuth } from '../../context/AuthContext';
import { useSales } from '../../context/SalesContext';
import firebaseService from '../../services/firebase/firebaseService';

const SettingsScreen = () => {
  const { user, logout } = useAuth();
  const { syncOfflineSales } = useSales();
  const [notifications, setNotifications] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Limpiar Caché',
      'Esto eliminará todos los datos locales. Las ventas sincronizadas no se perderán.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: async () => {
            try {
              await firebaseService.clearCache();
              Alert.alert('Éxito', 'Caché limpiado correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo limpiar el caché');
            }
          },
        },
      ]
    );
  };

  const handleManualSync = async () => {
    try {
      setIsSyncing(true);
      await syncOfflineSales();
      Alert.alert('Éxito', 'Datos sincronizados correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudieron sincronizar los datos');
    } finally {
      setIsSyncing(false);
    }
  };

  const SettingItem = ({ icon, title, subtitle, onPress, rightComponent }) => (
    <TouchableOpacity
      className="flex-row items-center py-4 px-5 bg-white border-b border-gray-100"
      onPress={onPress}
      disabled={!onPress && !rightComponent}
    >
      <View className="bg-[#E8F1F3] p-2 rounded-full mr-4">
        <Ionicons name={icon} size={20} color="#0379AF" />
      </View>
      <View className="flex-1">
        <Text className="font-inter font-medium text-[#00151F]">{title}</Text>
        {subtitle && (
          <Text className="font-inter text-sm text-gray-500 mt-1">{subtitle}</Text>
        )}
      </View>
      {rightComponent || (
        onPress && <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      )}
    </TouchableOpacity>
  );

  return (
    <Container safeArea={false}>
      <Header title="Configuración" />
      
      <ScrollView className="flex-1 bg-[#F8F8F8]">
        {/* Información del usuario */}
        <View className="px-5 py-4">
          <Card>
            <View className="flex-row items-center">
              <View className="bg-[#0379AF] w-16 h-16 rounded-full items-center justify-center">
                <Text className="text-white text-2xl font-bold font-inter">
                  {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <View className="ml-4 flex-1">
                <Text className="font-inter font-semibold text-lg text-[#00151F]">
                  {user?.displayName || 'Usuario'}
                </Text>
                <Text className="font-inter text-gray-500">
                  {user?.email}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Sección de Sincronización */}
        <View className="mt-6">
          <Text className="px-5 pb-2 text-sm font-inter font-medium text-gray-500 uppercase">
            Sincronización
          </Text>
          <View className="bg-white">
            <SettingItem
              icon="sync-outline"
              title="Sincronizar Ahora"
              subtitle="Sincroniza las ventas pendientes"
              onPress={handleManualSync}
              rightComponent={
                isSyncing ? (
                  <ActivityIndicator size="small" color="#0379AF" />
                ) : null
              }
            />
            <SettingItem
              icon="refresh-outline"
              title="Sincronización Automática"
              subtitle="Sincroniza cuando hay conexión"
              rightComponent={
                <Switch
                  value={autoSync}
                  onValueChange={setAutoSync}
                  trackColor={{ false: '#E5E7EB', true: '#0379AF' }}
                  thumbColor="#FFFFFF"
                />
              }
            />
          </View>
        </View>

        {/* Sección de Notificaciones */}
        <View className="mt-6">
          <Text className="px-5 pb-2 text-sm font-inter font-medium text-gray-500 uppercase">
            Notificaciones
          </Text>
          <View className="bg-white">
            <SettingItem
              icon="notifications-outline"
              title="Notificaciones Push"
              subtitle="Recibe alertas de ventas"
              rightComponent={
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: '#E5E7EB', true: '#0379AF' }}
                  thumbColor="#FFFFFF"
                />
              }
            />
          </View>
        </View>

        {/* Sección de Datos */}
        <View className="mt-6">
          <Text className="px-5 pb-2 text-sm font-inter font-medium text-gray-500 uppercase">
            Datos y Almacenamiento
          </Text>
          <View className="bg-white">
            <SettingItem
              icon="trash-outline"
              title="Limpiar Caché"
              subtitle="Elimina datos temporales"
              onPress={handleClearCache}
            />
            <SettingItem
              icon="download-outline"
              title="Exportar Datos"
              subtitle="Próximamente"
              onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto')}
            />
          </View>
        </View>

        {/* Sección de Soporte */}
        <View className="mt-6">
          <Text className="px-5 pb-2 text-sm font-inter font-medium text-gray-500 uppercase">
            Soporte
          </Text>
          <View className="bg-white">
            <SettingItem
              icon="help-circle-outline"
              title="Centro de Ayuda"
              subtitle="Preguntas frecuentes y guías"
              onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto')}
            />
            <SettingItem
              icon="mail-outline"
              title="Contactar Soporte"
              subtitle="soporte@controlventas.com"
              onPress={() => Linking.openURL('mailto:soporte@controlventas.com')}
            />
            <SettingItem
              icon="star-outline"
              title="Calificar App"
              subtitle="Ayúdanos con tu opinión"
              onPress={() => Alert.alert('Gracias', 'Tu opinión es muy importante para nosotros')}
            />
          </View>
        </View>

        {/* Sección Legal */}
        <View className="mt-6">
          <Text className="px-5 pb-2 text-sm font-inter font-medium text-gray-500 uppercase">
            Legal
          </Text>
          <View className="bg-white">
            <SettingItem
              icon="document-text-outline"
              title="Términos de Servicio"
              onPress={() => Alert.alert('Términos', 'Términos de servicio')}
            />
            <SettingItem
              icon="shield-checkmark-outline"
              title="Política de Privacidad"
              onPress={() => Alert.alert('Privacidad', 'Política de privacidad')}
            />
          </View>
        </View>

        {/* Información de la app */}
        <View className="px-5 py-6">
          <Text className="text-center text-gray-400 font-inter text-sm">
            Control de Ventas v{Application.nativeApplicationVersion || '1.0.0'}
          </Text>
          <Text className="text-center text-gray-400 font-inter text-xs mt-1">
            © 2024 Control de Ventas. Todos los derechos reservados.
          </Text>
        </View>

        {/* Botón de cerrar sesión */}
        <View className="px-5 pb-10">
          <Button
            title="Cerrar Sesión"
            onPress={handleLogout}
            variant="danger"
            size="lg"
          />
        </View>
      </ScrollView>
    </Container>
  );
};

export default SettingsScreen;