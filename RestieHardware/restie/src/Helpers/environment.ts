import { devBaseUrl } from "./environment.dev";
import { prodBaseUrl } from "./environment.prod";
// environment.ts
export const baseUrl =
  process.env.NODE_ENV === "production" ? prodBaseUrl : devBaseUrl;
