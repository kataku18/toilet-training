import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  PROFILE: "@toilet_adventure/profile",
  RECORDS: "@toilet_adventure/records",
  REWARD_STATE: "@toilet_adventure/reward_state",
  STICKER_PAGES: "@toilet_adventure/sticker_pages",
  UNLOCKED_ITEMS: "@toilet_adventure/unlocked_items",
} as const;

/**
 * 安全にJSONをパースする。失敗時はnullを返す。
 */
function safeParse<T>(json: string | null): T | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

/**
 * AsyncStorageへの保存。値はJSON文字列化される。
 */
async function save<T>(key: string, value: T): Promise<void> {
  try {
    const json = JSON.stringify(value);
    await AsyncStorage.setItem(key, json);
  } catch (error) {
    console.error(`[Storage] Failed to save key "${key}":`, error);
  }
}

/**
 * AsyncStorageからの読み込み。値はJSONパースされる。
 */
async function load<T>(key: string): Promise<T | null> {
  try {
    const json = await AsyncStorage.getItem(key);
    return safeParse<T>(json);
  } catch (error) {
    console.error(`[Storage] Failed to load key "${key}":`, error);
    return null;
  }
}

/**
 * AsyncStorageからキーを削除する。
 */
async function remove(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`[Storage] Failed to remove key "${key}":`, error);
  }
}

export const storage = {
  keys: STORAGE_KEYS,
  save,
  load,
  remove,
};
