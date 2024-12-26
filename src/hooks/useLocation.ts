import { useState } from "react";
import * as ExpoLocation from "expo-location";
import { Location } from "../types";
import { KAKAO_MAP_API_KEY } from "../utils/apikey";

export const useLocation = () => {
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentLocation = async (): Promise<Location> => {
    setIsLoading(true);
    try {
      // 1. 위치 권한 요청
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("위치 권한이 거부되었습니다.");
      }

      // 2. 현재 위치 가져오기
      const location = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.Balanced,
      });

      if (!location || !location.coords) {
        throw new Error("위치 정보를 가져올 수 없습니다.");
      }

      // 3. 카카오 로컬 API로 주소 정보 가져오기
      const response = await fetch(
        `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${location.coords.longitude}&y=${location.coords.latitude}&input_coord=WGS84`,
        {
          headers: {
            Authorization: `KakaoAK ${KAKAO_MAP_API_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("주소 변환에 실패했습니다.");
      }

      const data = await response.json();

      if (!data.documents || data.documents.length === 0) {
        // 주소를 찾을 수 없는 경우, 좌표만 반환
        return {
          name: `위도: ${location.coords.latitude.toFixed(
            6
          )}, 경도: ${location.coords.longitude.toFixed(6)}`,
          x: location.coords.longitude.toString(),
          y: location.coords.latitude.toString(),
        };
      }

      const addressInfo = data.documents[0];

      return {
        name: addressInfo.address?.address_name || "주소 없음",
        address: addressInfo.address?.address_name,
        x: location.coords.longitude.toString(),
        y: location.coords.latitude.toString(),
      };
    } catch (error) {
      console.error("Location error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getCurrentLocation,
    isLoading,
  };
};
