import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Location } from "../../types";
import { COLORS } from "../../utils/constants";
import { KAKAO_MAP_API_KEY } from "../../utils/apikey";

interface AddressSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (location: Location) => void;
}

interface SearchResult {
  place_name: string;
  address_name: string;
  x: string;
  y: string;
}

export const AddressSearchModal = ({
  visible,
  onClose,
  onSelect,
}: AddressSearchModalProps) => {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchAddress = async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(
          query
        )}`,
        {
          headers: {
            Authorization: `KakaoAK ${KAKAO_MAP_API_KEY}`,
          },
        }
      );
      const data = await response.json();
      setResults(data.documents);
    } catch (error) {
      console.error("주소 검색 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (item: SearchResult) => {
    onSelect({
      name: item.place_name,
      address: item.address_name,
      x: item.x,
      y: item.y,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>주소 검색</Text>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="주소나 장소를 입력하세요"
            value={keyword}
            onChangeText={(text) => {
              setKeyword(text);
              if (text.length > 1) {
                searchAddress(text);
              }
            }}
            autoFocus
          />
        </View>

        <FlatList
          data={results}
          keyExtractor={(item, index) => `${item.place_name}-${index}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultItem}
              onPress={() => handleSelect(item)}
            >
              <Text style={styles.placeName}>{item.place_name}</Text>
              <Text style={styles.addressName}>{item.address_name}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {isLoading ? "검색 중..." : "검색어를 입력해주세요"}
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  closeButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 40,
  },
  searchContainer: {
    padding: 16,
  },
  input: {
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  resultItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  placeName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  addressName: {
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    padding: 16,
    alignItems: "center",
  },
  emptyText: {
    color: "#666",
  },
});
