import AsyncStorage from '@react-native-async-storage/async-storage';

export const setItem = async (key, value) => {
    if (value === null) {
        throw new Error('invalid-value');
    }

    if (key === null) {
        throw new Error('invalid-key');
    }

    try {
        await AsyncStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        throw new Error('There was an error on the native side');
    }
};
