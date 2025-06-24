// src/components/layout/Container.js
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Container = ({
  children,
  scrollable = false,
  keyboardAvoiding = false,
  safeArea = true,
  className = '',
  contentClassName = '',
}) => {
  const content = scrollable ? (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      className={contentClassName}
    >
      {children}
    </ScrollView>
  ) : (
    <View className={`flex-1 ${contentClassName}`}>{children}</View>
  );

  const wrappedContent = keyboardAvoiding ? (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      {content}
    </KeyboardAvoidingView>
  ) : (
    content
  );

  if (safeArea) {
    return (
      <SafeAreaView className={`flex-1 bg-[#F8F8F8] ${className}`}>
        {wrappedContent}
      </SafeAreaView>
    );
  }

  return (
    <View className={`flex-1 bg-[#F8F8F8] ${className}`}>
      {wrappedContent}
    </View>
  );
};

export default Container;