import AsyncStorage from '@react-native-async-storage/async-storage';

export const clear = async (key) => {
    try {
        if (key === undefined) await AsyncStorage.clear();
        else await AsyncStorage.removeItem(key);
        return true;
    } catch (error) {
        throw new Error('There was an error on the native side');
    }
};
