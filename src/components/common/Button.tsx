import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { COLORS } from "../../utils/constants";

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export const Button = ({ title, onPress, disabled }: ButtonProps) => {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: "600",
  },
});
