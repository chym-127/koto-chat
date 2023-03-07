import axios, { AxiosResponse } from 'axios';
import { Res } from './type';
axios.defaults.baseURL = import.meta.env.VITE_BASE_API_URL;
axios.defaults.headers.common['Token'] = '1111';

// 添加请求拦截器
axios.interceptors.request.use(
  function (config) {
    config.headers['Token'] = localStorage.getItem('TOKEN');
    // 在发送请求之前做些什么
    return config;
  },
  function (error: any) {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

const onResponse = (response: AxiosResponse<Res>): AxiosResponse<Res> => {
  return response;
};

axios.interceptors.response.use(onResponse, function (error) {
  return Promise.reject(error);
});

function http(url: string, data: any): Promise<Res> {
  return new Promise((success, reject) => {
    axios
      .post<Res, AxiosResponse<Res, any>>(url, data)
      .then((resp) => {
        success(resp.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
  // return;
}

export { http };
