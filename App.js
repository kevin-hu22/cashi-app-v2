// App.js
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import NetInfo from '@react-native-community/netinfo';

// Providers
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { SalesProvider } from './src/context/SalesContext';

// Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import HomeScreen from './src/screens/main/HomeScreen';
import DailySummaryScreen from './src/screens/main/DailySummaryScreen';
import SaleDetailScreen from './src/screens/main/SaleDetailsScreen';
import SettingsScreen from './src/screens/main/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Navegador de Autenticación
const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
};

// Navegador de Tabs Principal
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Summary') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0379AF',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter',
          fontSize: 12,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Inicio' }}
      />
      <Tab.Screen 
        name="Summary" 
        component={DailySummaryScreen}
        options={{ title: 'Resumen' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Ajustes' }}
      />
    </Tab.Navigator>
  );
};

// Navegador Principal con Stack
const MainNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen 
        name="SaleDetail" 
        component={SaleDetailScreen}
        options={{
          headerShown: true,
          title: 'Detalle de Venta',
          headerStyle: {
            backgroundColor: '#00151F',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontFamily: 'Inter',
            fontWeight: '600',
          },
        }}
      />
    </Stack.Navigator>
  );
};

// Componente de Navegación Principal
const Navigation = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F8F8' }}>
        <ActivityIndicator size="large" color="#0379AF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

// Componente Principal de la App
export default function App() {
  const [fontsLoaded, setFontsLoaded] = React.useState(false);

  useEffect(() => {
    // Cargar fuentes
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          'Inter': require('./assets/fonts/Inter-Regular.ttf'),
          'Inter-Medium': require('./assets/fonts/Inter-Medium.ttf'),
          'Inter-SemiBold': require('./assets/fonts/Inter-SemiBold.ttf'),
          'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error cargando fuentes:', error);
        setFontsLoaded(true); // Continuar incluso si las fuentes fallan
      }
    };

    loadFonts();

    // Configurar listener de red
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('Conexión:', state.isConnected ? 'Online' : 'Offline');
    });

    return () => unsubscribe();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F8F8' }}>
        <ActivityIndicator size="large" color="#0379AF" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <SalesProvider>
        <StatusBar style="light" />
        <Navigation />
      </SalesProvider>
    </AuthProvider>
  );
}