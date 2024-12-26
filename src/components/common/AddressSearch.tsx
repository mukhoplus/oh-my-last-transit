import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { COLORS } from "../../utils/constants";

interface AddressSearchProps {
  label: string;
  address?: string;
  onPress: () => void;
  isLoading?: boolean;
}

export const AddressSearch = ({
  label,
  address,
  onPress,
  isLoading = false,
}: AddressSearchProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      disabled={isLoading}
    >
      <View>
        <Text style={styles.label}>{label}</Text>
        {isLoading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Text style={styles.address}>{address || "주소를 입력해주세요"}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: "#8E94A0",
    marginBottom: 4,
  },
  address: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
});
