export interface Location {
  name: string;
  x: string; // 경도
  y: string; // 위도
  address?: string;
}

export interface Fare {
  transit?: number;
  taxi?: number;
}

export interface Summary {
  distance: number;
  duration: number;
  fare: Fare;
}

export interface TransportInfo {
  type: "PUBLIC" | "TAXI";
  estimatedTime: number;
  cost: number;
  route?: string[];
  summary: Summary;
}
