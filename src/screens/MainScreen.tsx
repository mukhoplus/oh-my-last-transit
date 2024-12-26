import React, { useState, useEffect } from "react";
import { View, StyleSheet, SafeAreaView, Alert } from "react-native";
import { Tab } from "../components/common/Tab";
import { AddressSearch } from "../components/common/AddressSearch";
import { TransportInfo } from "../components/transport/TransportInfo";
import { AddressSearchModal } from "../components/common/AddressSearchModal";
import { useLocation } from "../hooks/useLocation";
import { Location } from "../types";
import { COLORS } from "../utils/constants";
import { saveHomeLocation, getHomeLocation } from "../services/storageService";

export const MainScreen = () => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [homeLocation, setHomeLocation] = useState<Location | null>(null);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [searchMode, setSearchMode] = useState<"home" | "current">("home");
  const [activeTab, setActiveTab] = useState<"PUBLIC" | "TAXI">("PUBLIC");
  const { getCurrentLocation, isLoading } = useLocation();

  useEffect(() => {
    loadHomeLocation();
  }, []);

  const loadHomeLocation = async () => {
    try {
      const savedLocation = await getHomeLocation();
      if (savedLocation) {
        setHomeLocation(savedLocation);
      }
    } catch (error) {
      Alert.alert("오류", "저장된 주소를 불러오는데 실패했습니다.");
    }
  };

  const handleHomeSearch = () => {
    setSearchMode("home");
    setIsSearchModalVisible(true);
  };

  const handleCurrentLocation = async () => {
    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location);
    } catch (error) {
      Alert.alert("오류", "현재 위치를 가져오는데 실패했습니다.");
    }
  };

  const handleLocationSelect = async (location: Location) => {
    if (searchMode === "home") {
      try {
        await saveHomeLocation(location);
        setHomeLocation(location);
      } catch (error) {
        Alert.alert("오류", "주소 저장에 실패했습니다.");
      }
    } else {
      setCurrentLocation(location);
    }
    setIsSearchModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* 주소 검색 영역 */}
        <View style={styles.searchSection}>
          <AddressSearch
            label="현재 위치"
            address={currentLocation?.name}
            onPress={handleCurrentLocation}
          />
          <AddressSearch
            label="집 주소"
            address={homeLocation?.name}
            onPress={handleHomeSearch}
          />
        </View>

        {/* 탭 영역 */}
        <View style={styles.tabSection}>
          <Tab
            tabs={[
              { key: "PUBLIC", title: "대중교통" },
              { key: "TAXI", title: "택시" },
            ]}
            activeTab={activeTab}
            onChangeTab={setActiveTab}
          />
        </View>

        {/* 결과 표시 영역 */}
        <TransportInfo
          type={activeTab}
          start={currentLocation}
          end={homeLocation}
        />
      </View>

      <AddressSearchModal
        visible={isSearchModalVisible}
        onClose={() => setIsSearchModalVisible(false)}
        onSelect={handleLocationSelect}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  searchSection: {
    marginBottom: 20,
  },
  tabSection: {
    marginBottom: 16,
  },
});
