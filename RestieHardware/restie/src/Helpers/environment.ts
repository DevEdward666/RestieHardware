// environment.ts
export const baseUrl =
  process.env.NODE_ENV === "production"
    ? "https://restiehardware.onrender.com/"
    : "http://192.168.1.8:45455/";
