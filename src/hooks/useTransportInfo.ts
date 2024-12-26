import { useQuery } from "react-query";
import { searchRoute } from "../services/kakaoMapService";
import { Location } from "../types";

export const useTransportInfo = (
  start: Location | null,
  end: Location | null
) => {
  return useQuery(
    ["transport", start?.x, start?.y, end?.x, end?.y],
    () => {
      if (!start || !end) {
        return null;
      }
      return searchRoute(start, end);
    },
    {
      enabled: !!start && !!end, // start와 end가 모두 있을 때만 쿼리 실행
      retry: false,
    }
  );
};
