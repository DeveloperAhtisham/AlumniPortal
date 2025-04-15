import AsyncStorage from "@react-native-async-storage/async-storage";

export async function retrieve(key) {
  if (key === null) {
    throw new Error("invalid-key");
  }

  try {
    let data = await AsyncStorage.getItem(key);
    if (data !== undefined) return JSON.parse(data);
    else return undefined;
  } catch (error) {
    throw new Error("There was an error on the native side");
  }
}
