// src/components/common/Button.js
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) => {
  const variants = {
    primary: 'bg-[#0379AF] active:bg-[#025a84]',
    secondary: 'bg-[#E8F1F3] active:bg-[#d4e5e8]',
    outline: 'bg-transparent border-2 border-[#0379AF]',
    danger: 'bg-red-500 active:bg-red-600',
  };

  const sizes = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  };

  const textColors = {
    primary: 'text-white',
    secondary: 'text-[#00151F]',
    outline: 'text-[#0379AF]',
    danger: 'text-white',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <TouchableOpacity
      className={`rounded-lg items-center justify-center ${variants[variant]} ${sizes[size]} ${
        disabled ? 'opacity-50' : ''
      } ${className}`}
      onPress={onPress}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? '#00151F' : '#FFFFFF'} />
      ) : (
        <Text
          className={`font-inter font-semibold ${textColors[variant]} ${textSizes[size]}`}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;