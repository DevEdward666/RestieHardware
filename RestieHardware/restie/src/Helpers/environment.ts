// environment.ts
export const baseUrl =
  process.env.NODE_ENV === "production"
    ? "https://restieapi.fly.dev/"
    : "http://192.168.1.8:45455/";
