import AsyncStorage from "@react-native-async-storage/async-storage";
import { Location } from "../types";

const STORAGE_KEYS = {
  HOME_LOCATION: "@home_location",
};

export const saveHomeLocation = async (location: Location): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.HOME_LOCATION,
      JSON.stringify(location)
    );
  } catch (error) {
    console.error("Failed to save home location:", error);
    throw error;
  }
};

export const getHomeLocation = async (): Promise<Location | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.HOME_LOCATION);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Failed to get home location:", error);
    throw error;
  }
};
