import axios, { AxiosRequestConfig } from "axios";

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
