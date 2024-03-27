import axios, { AxiosError, AxiosRequestConfig } from "axios";

//   const fetchData = async (config: AxiosRequestConfig<any>) => {
//     try {
//       setLoading(true);
//       const response = await axios(config);
//       setData(response.data);
//       setError(null);
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

export const postWithAuth = async (
  url: any,
  headers: any,
  body: any,
  auth: any
) => {
  const response = await axios({
    method: "POST",
    url,
    auth: auth,
    data: body,
    headers: headers,
  });
  return response;
};
export const post = async (url: any, headers: any, body: any) => {
  const response = await axios({
    url,
    method: "POST",
    headers: headers,
    data: body,
  });
  return response.data;
};

export const get = async (url: any, headers: any) => {
  const response = await axios({
    method: "GET",
    url,
    headers: headers,
  });
  return response.data;
};
export const getWithAuth = async (url: string, headers: any, token: string) => {
  try {
    if (token.length <= 0 || token === "undefined") {
      return;
    }
    const response = await axios.get(url, {
      headers: {
        ...headers,
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      // The request was made and the server responded with a status code
      console.warn("Response data:", axiosError.response.data);
      console.warn("Response status:", axiosError.response.status);
      console.warn("Response headers:", axiosError.response.headers);
    } else if (axiosError.request) {
      // The request was made but no response was received
      console.warn("No response received:", axiosError.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.warn("Error:", axiosError.message);
    }
    throw error; // Re-throw the error to be handled by the caller
  }
};
export const put = async (url: any, body: any) => {
  await axios({
    method: "PUT",
    url,
    data: body,
  });
};

export const patch = async (url: any, body: any) => {
  await axios({
    method: "PATCH",
    url,
    data: body,
  });
};
