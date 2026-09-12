/**
 * Cấu hình lấy từ biến môi trường — khai báo MỘT chỗ duy nhất.
 *
 * Vì sao mặc định là BẬT dữ liệu giả:
 * file `.env` nằm trong `.gitignore` nên người mới clone repo về sẽ KHÔNG có nó.
 * Nếu mặc định là tắt, họ chạy `npm run dev` và thấy mọi màn hình báo
 * "Không kết nối được máy chủ" mà không hiểu vì sao. Mặc định bật giúp
 * clone xong là chạy được ngay.
 *
 * Khi backend đã sẵn sàng: đặt VITE_USE_MOCK=false trong file `.env`.
 */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Hệ thống quản lý ký túc xá';

// In ra console lúc khởi động để không ai nhầm dữ liệu giả với dữ liệu thật
if (import.meta.env.DEV) {
  console.info(
    USE_MOCK
      ? '%c[DỮ LIỆU GIẢ] Đang dùng src/mocks — không gọi backend. Đặt VITE_USE_MOCK=false trong .env để nối backend thật.'
      : `%c[BACKEND THẬT] Đang gọi ${API_BASE_URL}`,
    `color:${USE_MOCK ? '#FAAD14' : '#52C41A'};font-weight:600`,
  );
}
