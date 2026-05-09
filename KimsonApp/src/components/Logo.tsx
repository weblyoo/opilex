import React from 'react';
import { View, Image, ImageStyle, StyleSheet } from 'react-native';


interface LogoProps {
  size?: number;
  style?: ImageStyle | StyleSheet.NamedStyles<any>;
  forceDark?: boolean;
  dark?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 48, 
  style,
  forceDark = false,
  dark = false
}) => {
  // Use dark prop if provided, otherwise use forceDark
  const useDarkBackground = Boolean(dark || forceDark);
  
  // Select the appropriate logo based on theme
  // If dark background, use light logo (and vice versa)
  const logoSource = useDarkBackground 
    ? require('../../assets/logo-light.png')
    : require('../../assets/logo-dark.png');

  return (
    <View style={styles.container}>
      <Image
        source={logoSource}
        style={[
          {
            width: size,
            height: size,
            resizeMode: 'contain',
          },
          style
        ]}
        accessible={false}
        accessibilityElementsHidden={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Logo;




