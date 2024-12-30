import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useTransportInfo } from "../../hooks/useTransportInfo";
import { Location } from "../../types";
import { COLORS } from "../../utils/constants";

interface TransportInfoProps {
  type: "PUBLIC" | "TAXI";
  start: Location | null;
  end: Location | null;
}

export const TransportInfo = ({ type, start, end }: TransportInfoProps) => {
  const { data, isLoading, error } = useTransportInfo(start, end);

  if (!start || !end) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>출발지와 도착지를 모두 설정해주세요</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.message}>경로를 검색중입니다...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorMessage}>경로 검색에 실패했습니다</Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>이용 가능한 경로가 없습니다</Text>
      </View>
    );
  }

  const info = data.find((info) => info.type === type);
  const summary = info?.summary;

  if (!info || !summary) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>이용 가능한 경로가 없습니다</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.routeScrollView}
      showsVerticalScrollIndicator={true}
    >
      <View style={styles.container}>
        {/* 헤더 정보 */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {type === "PUBLIC" ? "🚇 대중교통" : "🚕 택시"}
          </Text>
        </View>

        {/* 요약 정보 */}
        <View style={styles.summaryContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>총 거리</Text>
            <Text style={styles.value}>
              {(summary.distance / 1000).toFixed(1)}km
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>예상 소요 시간</Text>
            <Text style={styles.value}>
              {Math.round(summary.duration / 60)}분
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>예상 요금:</Text>
            <Text style={styles.value}>
              {Number(
                summary.fare.transit || summary.fare.taxi || -1
              ).toLocaleString("ko-KR") + " 원"}
            </Text>
          </View>
        </View>

        {/* 경로 정보 */}
        {type === "PUBLIC" && info.route && info.route.length > 0 && (
          <View style={styles.routeContainer}>
            <Text style={styles.sectionTitle}>상세 경로</Text>
            {info.route.map((step, index) => (
              <View key={index} style={styles.routeStep}>
                <Text style={styles.routeText}>
                  {index + 1}. {step}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  summaryContainer: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  label: {
    fontSize: 16,
    color: "#666",
  },
  value: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: COLORS.text,
  },
  routeContainer: {
    marginTop: 8,
    maxHeight: 300,
  },
  routeScrollView: {
    flexGrow: 1,
  },
  routeStep: {
    marginTop: 8,
    padding: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
  },
  routeText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  message: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
  },
  errorMessage: {
    textAlign: "center",
    color: COLORS.error,
    fontSize: 16,
  },
});
