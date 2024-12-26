import { Location, TransportInfo } from "../types";
import { KAKAO_MAP_API_KEY } from "../utils/apikey";

export const searchRoute = async (
  start: Location,
  end: Location
): Promise<TransportInfo[]> => {
  try {
    // 대중교통 경로 검색
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
      console.error("Kakao API Error:", response.status, await response.text());
      throw new Error("경로 검색에 실패했습니다.");
    }

    const data = await response.json();

    // 택시 요금 계산
    const taxiInfo = calculateTaxiFare(start, end);

    // 대중교통 정보가 없는 경우
    if (!data.routes || data.routes.length === 0) {
      return [
        {
          type: "TAXI",
          estimatedTime: taxiInfo.estimatedTime,
          cost: taxiInfo.cost,
        },
      ];
    }

    const route = data.routes[0];
    const summary = route.summary;

    return [
      {
        type: "PUBLIC",
        estimatedTime: Math.round(summary.duration / 60),
        cost: 1250, // 기본 버스 요금
        route: ["도보 이동"], // 임시 경로 정보
        summary: summary,
      },
      {
        type: "TAXI",
        estimatedTime: Math.round(summary.duration / 60),
        cost: summary.fare.taxi,
        summary: summary,
      },
    ];
  } catch (error) {
    console.error("Route search error:", error);
    // 에러 발생 시 택시 정보만이라도 반환
    const taxiInfo = calculateTaxiFare(start, end);
    return [
      {
        type: "TAXI",
        estimatedTime: taxiInfo.estimatedTime,
        cost: taxiInfo.cost,
      },
    ];
  }
};

// 택시 요금 계산 헬퍼 함수
const calculateTaxiFare = (start: Location, end: Location) => {
  const R = 6371; // 지구의 반경 (km)
  const dLat = toRad(Number(end.x) - Number(start.x));
  const dLon = toRad(Number(end.y) - Number(start.y));

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(Number(start.x))) *
      Math.cos(toRad(Number(end.x))) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // 기본 요금 3800원, km당 1000원 추가
  const cost = Math.round((3800 + distance * 1000) / 100) * 100;
  const estimatedTime = Math.round(distance * 2.5); // 예상 소요 시간 (분)

  return { cost, estimatedTime };
};

const toRad = (value: number) => (value * Math.PI) / 180;
