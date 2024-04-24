import { devBaseUrl } from "./environment.dev";
import { prodBaseUrl } from "./environment.prod";

let baseUrl;

if (process.env.NODE_ENV === "production") {
  baseUrl = prodBaseUrl;
} else {
  baseUrl = devBaseUrl;
}

// Add an additional check to conditionally select base URL based on GitHub branch
if (process.env.REACT_APP_GITHUB_BRANCH === "refs/heads/release") {
  baseUrl = prodBaseUrl;
}

export { baseUrl };
