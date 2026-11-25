import axios from 'axios';
import { API_BASE_URL } from './env';
import { authStorage } from './authStorage';
import { changePasswordPathOf } from '../routes/paths';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Gắn JWT vào mọi request
axiosClient.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const PUBLIC_PATHS = new Set(['/', '/apply', '/apply/status', '/login', '/admin/login']);

// Token hết hạn -> xóa và về đúng cổng đăng nhập (không ép redirect khi đang ở trang công khai hoặc chính request /auth/login)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const reqUrl = String(error.config?.url || '');
    const isLoginRequest = reqUrl.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginRequest) {
      authStorage.clear();
      const path = window.location.pathname;
      if (!PUBLIC_PATHS.has(path)) {
        window.location.href = path.startsWith('/admin') ? '/admin/login' : '/login';
      }
    }
    // API.md §1.4: mật khẩu vừa bị đặt lại khi đang đăng nhập → mọi API trả 403 MUST_CHANGE_PASSWORD
    if (error.response?.status === 403 && error.response?.data?.code === 'MUST_CHANGE_PASSWORD') {
      const user = authStorage.getUser();
      if (user) {
        authStorage.updateUser({ ...user, mustChangePassword: true });
        const target = changePasswordPathOf(user.role);
        if (window.location.pathname !== target) window.location.href = target;
      }
    }
    return Promise.reject(error);
  },
);

export default axiosClient;

/**
 * Envelope của backend: { code, message, data }  — xem API.md mục 1.1
 * Lấy thông báo lỗi thân thiện (backend trả message bằng tiếng Việt).
 */
export const getErrorMessage = (error, fallback = 'Có lỗi xảy ra, vui lòng thử lại') => {
  if (error?.code === 'ERR_NETWORK') return 'Không kết nối được máy chủ';
  return error?.response?.data?.message || fallback;
};

/** Mã lỗi ổn định để xử lý theo từng trường hợp, VD: 'ROOM_FULL' */
export const getErrorCode = (error) => error?.response?.data?.code || null;

/** Lỗi theo từng trường để đổ vào Form của antd — API.md mục 1.1 */
export const getFieldErrors = (error) => error?.response?.data?.data?.errors || null;
