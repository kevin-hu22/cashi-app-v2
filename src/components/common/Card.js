// src/components/common/Card.js
import { TouchableOpacity, View } from 'react-native';

export const Card = ({
  children,
  onPress,
  className = '',
  ...props
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      className={`bg-white rounded-lg p-4 shadow-sm mb-3 ${className}`}
      onPress={onPress}
      activeOpacity={0.9}
      {...props}
    >
      {children}
    </Container>
  );
};

export default Card;