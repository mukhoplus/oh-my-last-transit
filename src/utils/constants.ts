import { Dimensions } from "react-native";

export const SCREEN_WIDTH = Dimensions.get("window").width;
export const SCREEN_HEIGHT = Dimensions.get("window").height;

export const COLORS = {
  primary: "#0064FF",
  background: "#FFFFFF",
  text: "#191F28",
  border: "#E5E5E5",
  error: "#FF4B4B",
};

export const STORAGE_KEYS = {
  HOME_ADDRESS: "@home_address",
};
