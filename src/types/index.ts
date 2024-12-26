export interface Location {
  name: string;
  x: string;
  y: string;
  address?: string;
}

export interface Section {
  type: "WALK" | "BUS" | "SUBWAY";
  name?: string;
  distance?: number;
  stations?: number;
}

export interface TransportInfo {
  type: "PUBLIC" | "TAXI";
  estimatedTime: number;
  cost: number;
  route?: string[];
  summary?: any;
}
