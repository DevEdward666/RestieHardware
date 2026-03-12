import { devBaseUrl } from "./environment.dev";
import { prodBaseUrl } from "./environment.prod";

const envBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();

const fallbackBaseUrl =
  import.meta.env.PROD && import.meta.env.VITE_LOCAL !== "true"
    ? prodBaseUrl
    : devBaseUrl;

const baseUrl = envBaseUrl || fallbackBaseUrl;

export default baseUrl;
