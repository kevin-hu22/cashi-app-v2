/* eslint-disable import/no-unresolved */
// src/navigation/MainNavigator.js
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Screens
import DailySummaryScreen from '../screens/main/DailySummaryScreen';
import ExportScreen from '../screens/main/ExportScreen';
import HomeScreen from '../screens/main/HomeScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import ReportsScreen from '../screens/main/ReportsScreen';
import SaleDetailScreen from '../screens/main/SaleDetailScreen';
import SettingsScreen from '../screens/main/SettingsScreen';

// Utils
import { COLORS } from '../utils/constants';
import { hapticFeedback } from '../utils/helpers';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Componente personalizado para el tab
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View 
      className="bg-white border-t border-gray-200"
      style={{ paddingBottom: insets.bottom }}
    >
      <View className="flex-row py-2">
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            hapticFeedback('light');
            
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            hapticFeedback('medium');
            
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const getIconName = () => {
            switch (route.name) {
              case 'Home':
                return isFocused ? 'home' : 'home-outline';
              case 'Summary':
                return isFocused ? 'bar-chart' : 'bar-chart-outline';
              case 'Settings':
                return isFocused ? 'settings' : 'settings-outline';
              default:
                return 'ellipse-outline';
            }
          };

          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              className="flex-1 items-center py-2"
            >
              <View className={`items-center ${isFocused ? 'scale-110' : ''}`}>
                <Ionicons
                  name={getIconName()}
                  size={24}
                  color={isFocused ? COLORS.primary : COLORS.textSecondary}
                />
                <Text
                  className={`font-inter text-xs mt-1 ${
                    isFocused ? 'text-[#0379AF] font-medium' : 'text-gray-500'
                  }`}
                >
                  {label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// Navegador de Tabs
const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Inicio',
        }}
      />
      <Tab.Screen 
        name="Summary" 
        component={DailySummaryScreen}
        options={{
          tabBarLabel: 'Resumen',
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Ajustes',
        }}
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
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={TabNavigator}
        options={{
          animation: 'fade',
        }}
      />
      
      <Stack.Screen 
        name="SaleDetail" 
        component={SaleDetailScreen}
        options={({ navigation }) => ({
          headerShown: true,
          title: 'Detalle de Venta',
          headerStyle: {
            backgroundColor: COLORS.darkNavy,
          },
          headerTintColor: COLORS.white,
          headerTitleStyle: {
            fontFamily: 'Inter',
            fontWeight: '600',
            fontSize: 18,
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="p-2"
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
          ),
          headerShadowVisible: false,
        })}
      />
      
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={({ navigation }) => ({
          headerShown: true,
          title: 'Mi Perfil',
          headerStyle: {
            backgroundColor: COLORS.background,
          },
          headerTintColor: COLORS.text,
          headerTitleStyle: {
            fontFamily: 'Inter',
            fontWeight: '600',
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
      
      <Stack.Screen 
        name="Reports" 
        component={ReportsScreen}
        options={({ navigation }) => ({
          headerShown: true,
          title: 'Reportes',
          headerStyle: {
            backgroundColor: COLORS.darkNavy,
          },
          headerTintColor: COLORS.white,
          headerTitleStyle: {
            fontFamily: 'Inter',
            fontWeight: '600',
            fontSize: 18,
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="p-2"
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
          ),
          headerShadowVisible: false,
        })}
      />
      
      <Stack.Screen 
        name="Export" 
        component={ExportScreen}
        options={({ navigation }) => ({
          headerShown: true,
          title: 'Exportar Datos',
          presentation: 'modal',
          headerStyle: {
            backgroundColor: COLORS.background,
          },
          headerTintColor: COLORS.text,
          headerTitleStyle: {
            fontFamily: 'Inter',
            fontWeight: '600',
            fontSize: 18,
          },
          headerLeft: Platform.OS === 'ios' ? () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="p-2"
            >
              <Text className="text-[#0379AF] font-inter text-base">Cancelar</Text>
            </TouchableOpacity>
          ) : undefined,
          headerRight: Platform.OS === 'android' ? () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="p-2"
            >
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          ) : undefined,
        })}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;