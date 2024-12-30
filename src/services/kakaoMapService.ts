import { Location, TransportInfo } from "../types";
import { KAKAO_MAP_API_KEY, ODSAY_API_KEY } from "../utils/apikey";

export const searchRoute = async (
  start: Location,
  end: Location
): Promise<TransportInfo[]> => {
  try {
    // 대중교통 경로 검색
    const publicTransportInfo = await getPublicTransportRoute(start, end);

    // 택시 경로 검색
    const taxiTransportInfo = await getTaxiRoute(start, end);

    const transportInfoArray: TransportInfo[] = [];
    if (publicTransportInfo) {
      transportInfoArray.push(publicTransportInfo);
    }
    if (taxiTransportInfo) {
      transportInfoArray.push(taxiTransportInfo);
    }

    return transportInfoArray;
  } catch (error) {
    console.error("Route search error:", error);
    const taxiInfo = calculateTaxiFare(start, end);
    return [
      {
        type: "TAXI",
        estimatedTime: taxiInfo.estimatedTime,
        cost: taxiInfo.cost,
        summary: {
          distance: taxiInfo.distance * 1000,
          duration: taxiInfo.estimatedTime * 60,
          fare: { taxi: taxiInfo.cost },
        },
      },
    ];
  }
};

// 대중교통 경로 검색 함수 (ODsay 사용)
const getPublicTransportRoute = async (
  start: Location,
  end: Location
): Promise<TransportInfo | null> => {
  try {
    const originX = start.x;
    const originY = start.y;
    const destinationX = end.x;
    const destinationY = end.y;

    const response = await fetch(
      `https://api.odsay.com/v1/api/searchPubTransPathT?lang=0&SX=${originX}&SY=${originY}&EX=${destinationX}&EY=${destinationY}&apiKey=${ODSAY_API_KEY}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(
        "ODsay Public Transit API Error:",
        response.status,
        await response.text()
      );
      return null;
    }

    const data = await response.json();
    console.log("대중교통 응답 데이터:", JSON.stringify(data, null, 2));

    if (data.result.info.count === 0) {
      console.warn("대중교통 경로를 찾을 수 없습니다.");
      return null;
    }

    const path = data.result.path[0]; // 첫 번째 경로 선택
    const estimatedTime = path.info.totalTime; // 총 소요 시간 (초)
    const distance = path.info.totalDistance; // 총 거리 (m)
    const fare = path.info.totalFare || 0; // 총 요금

    const transitSteps: string[] = [];
    path.subPath.forEach((sub: any) => {
      if (sub.subPathType === 1) {
        // 지하철, 버스 등 대중교통
        const transportType = sub.passStopList[0].stationName
          ? "지하철"
          : "버스";
        const startStation =
          sub.passStopList[0].stationName || sub.passStopList[0].posName;
        const endStation =
          sub.passStopList[sub.passStopList.length - 1].stationName ||
          sub.passStopList[sub.passStopList.length - 1].posName;
        const duration = Math.round(sub.trafficTime / 60); // 분 단위
        const fareCost = sub.info.fare || 0;

        transitSteps.push(
          `${transportType} (${startStation} - ${endStation}) (${duration}분)`
        );
      } else if (sub.subPathType === 3) {
        // 도보
        const duration = Math.round(sub.walkTime / 60); // 분 단위
        transitSteps.push(`도보 (${duration}분)`);
      }
    });

    return {
      type: "PUBLIC",
      estimatedTime: Math.round(estimatedTime / 60),
      cost: fare || 1250, // ODsay API가 요금을 제공하지 않을 경우 기본 요금
      route: transitSteps,
      summary: {
        distance: distance,
        duration: estimatedTime,
        fare: { transit: fare || 1250 },
      },
    };
  } catch (error) {
    console.error("대중교통 경로 검색 에러:", error);
    return null;
  }
};

// 택시 경로 검색 함수
const getTaxiRoute = async (
  start: Location,
  end: Location
): Promise<TransportInfo | null> => {
  try {
    const response = await fetch(
      `https://apis-navi.kakaomobility.com/v1/directions?origin=${start.x},${start.y}&destination=${end.x},${end.y}&priority=TIME`,
      {
        headers: {
          Authorization: `KakaoAK ${KAKAO_MAP_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(
        "Kakao Taxi API Error:",
        response.status,
        await response.text()
      );
      throw new Error("택시 경로 검색에 실패했습니다.");
    }

    const data = await response.json();
    // console.log("택시 응답 데이터:", JSON.stringify(data, null, 2));

    if (!data.routes || data.routes.length === 0) {
      console.warn("택시 경로를 찾을 수 없습니다.");
      const taxiInfo = calculateTaxiFare(start, end);
      return {
        type: "TAXI",
        estimatedTime: taxiInfo.estimatedTime,
        cost: taxiInfo.cost,
        summary: {
          distance: taxiInfo.distance * 1000,
          duration: taxiInfo.estimatedTime * 60,
          fare: { taxi: taxiInfo.cost },
        },
      };
    }

    const route = data.routes[0];
    const summary = route.summary;

    return {
      type: "TAXI",
      estimatedTime: Math.round(summary.duration / 60),
      cost: summary.fare?.taxi || calculateTaxiFare(start, end).cost,
      summary: {
        distance: summary.distance,
        duration: summary.duration,
        fare: {
          taxi: summary.fare?.taxi || calculateTaxiFare(start, end).cost,
        },
      },
    };
  } catch (error) {
    console.error("택시 경로 검색 에러:", error);
    return null;
  }
};

// 택시 요금 계산 헬퍼 함수
const calculateTaxiFare = (start: Location, end: Location) => {
  const R = 6371; // 지구의 반경 (km)
  const toRad = (value: number) => (value * Math.PI) / 180;

  const lat1 = Number(start.y);
  const lon1 = Number(start.x);
  const lat2 = Number(end.y);
  const lon2 = Number(end.x);

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // km 단위

  // 기본 요금 3800원, km당 1000원 추가
  const cost = Math.round((3800 + distance * 1000) / 100) * 100;
  const estimatedTime = Math.round(distance * 2.5); // 예상 소요 시간 (분)

  return { cost, estimatedTime, distance };
};
