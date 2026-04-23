import type { Boss } from "@typings/api/guild";
import { fetchData } from "./main";

export async function getBosses() {
  return await fetchData<Boss[]>("bosses");
}

export async function checkHealth() {
  const API_URL = process.env.API_URL
    ? `https://${process.env.API_URL}/`
    : "http://localhost:8080/";

  return await fetchData("openapi.json", {}, API_URL);
}
