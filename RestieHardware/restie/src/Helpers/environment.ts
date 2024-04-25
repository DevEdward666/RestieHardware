import { devBaseUrl } from "./environment.dev";
import { prodBaseUrl } from "./environment.prod";
// environment.ts

let baseUrl = "";

if (process.env.NODE_ENV === "production") {
  if (import.meta.env.VITE_LOCAL === "true") {
    baseUrl = devBaseUrl;
  } else {
    baseUrl = prodBaseUrl;
  }
} else {
  baseUrl = devBaseUrl;
}

export default baseUrl;
