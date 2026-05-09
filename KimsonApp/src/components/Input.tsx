import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../config/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Normalize boolean props to ensure they're actual booleans, not strings
  const normalizedProps = {
    ...props,
    // Ensure all boolean TextInput props are actual booleans
    editable: props.editable !== undefined ? Boolean(props.editable) : undefined,
    multiline: props.multiline !== undefined ? Boolean(props.multiline) : undefined,
    secureTextEntry: props.secureTextEntry !== undefined ? Boolean(props.secureTextEntry) : undefined,
    autoFocus: props.autoFocus !== undefined ? Boolean(props.autoFocus) : undefined,
    selectTextOnFocus: props.selectTextOnFocus !== undefined ? Boolean(props.selectTextOnFocus) : undefined,
    blurOnSubmit: props.blurOnSubmit !== undefined ? Boolean(props.blurOnSubmit) : undefined,
    autoCorrect: props.autoCorrect !== undefined ? Boolean(props.autoCorrect) : undefined,
    autoCapitalize: props.autoCapitalize, // This is a string, not boolean
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={theme.colors.accent}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...normalizedProps}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    fontWeight: '500',
  },
  input: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.medium,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.fontSize.medium,
    color: theme.colors.text,
    backgroundColor: theme.colors.primary,
    minHeight: 48,
  },
  inputFocused: {
    borderColor: theme.colors.accent,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.small,
    marginTop: theme.spacing.xs,
  },
});

export default Input;




