import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Gắn JWT vào mọi request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Token hết hạn -> xóa và về trang đăng nhập
// v1-lite dùng 1 token hạn 7 ngày, không có refresh token (docs/14 mục 4.11)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default axiosClient;

/** Lấy thông báo lỗi thân thiện từ response của backend */
export const getErrorMessage = (error, fallback = 'Có lỗi xảy ra, vui lòng thử lại') =>
  error?.response?.data?.message || (error?.code === 'ERR_NETWORK' ? 'Không kết nối được máy chủ' : fallback);

/** Lấy danh sách lỗi theo từng trường để đổ vào Form của antd */
export const getFieldErrors = (error) => error?.response?.data?.errors || null;
