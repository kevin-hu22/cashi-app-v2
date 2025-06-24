// src/components/layout/TabBar.js
import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  const getIconName = (routeName, focused) => {
    const icons = {
      Home: focused ? 'home' : 'home-outline',
      Summary: focused ? 'bar-chart' : 'bar-chart-outline',
      Settings: focused ? 'settings' : 'settings-outline',
    };
    return icons[routeName] || 'ellipse-outline';
  };

  return (
    <View 
      className="bg-white border-t border-gray-200"
      style={{ paddingBottom: insets.bottom }}
    >
      <View className="flex-row">
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel || options.title || route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
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
              className="flex-1 items-center py-3"
            >
              <Ionicons
                name={getIconName(route.name, isFocused)}
                size={24}
                color={isFocused ? '#0379AF' : '#6B7280'}
              />
              <Text
                className={`font-inter text-xs mt-1 ${
                  isFocused ? 'text-[#0379AF]' : 'text-gray-500'
                }`}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default TabBar;