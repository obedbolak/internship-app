import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

// On device, localhost won't work — use your machine's LAN IP e.g. http://192.168.x.x:8081
// On web, relative paths work fine
const BASE = "https://internlink-production-f954.up.railway.app";

console.log("[API] Base URL:", BASE);

async function headers(): Promise<Record<string, string>> {
  const token = await AsyncStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(
  method: string,
  path: string,
  body?: object,
): Promise<T> {
  console.log(`[API] ${method} ${BASE}${path}`);
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: await headers(),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  console.log(`[API] Response status: ${res.status}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body: object) => request<T>("POST", path, body),
  patch: <T>(path: string, body: object) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};
