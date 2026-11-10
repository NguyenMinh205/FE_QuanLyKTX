# Hệ thống quản lý ký túc xá — Frontend

Giao diện người dùng của đồ án **Hệ thống quản lý ký túc xá HaUI** (bản tinh gọn v2), viết bằng React + Vite.
Tổng quan toàn bộ phần frontend: [`docs/17-TONG-QUAN-FRONTEND.md`](docs/17-TONG-QUAN-FRONTEND.md).

- **Backend:** repo riêng `BE_QuanLyKTX` (Node.js + Express + MongoDB)
- **Tài liệu:** [`docs/`](docs/README.md) — dùng chung cho **cả hai repo**, không sao chép sang repo backend

---

## 1. Chạy dự án trên máy mình

Cần **Node.js 20.19 trở lên** (hoặc 22.12 trở lên) — yêu cầu của Vite 8.

```bash
git clone <đường-dẫn-repo>
cd FE_QuanLyKTX
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm run dev
```

Mở http://localhost:5173

> ✅ **Chạy được ngay, không cần backend.** Dự án có sẵn lớp dữ liệu giả (`src/mocks/`). Khi backend xong, đặt
> `VITE_USE_MOCK=false` trong `.env` là chuyển sang gọi API thật, không phải sửa code màn hình.

Ở màn Đăng nhập, bấm "Tài khoản thử" rồi bấm một tài khoản là tự điền.

---

## 2. Lệnh hay dùng

| Lệnh | Việc |
|------|------|
| `npm run dev` | Chạy máy chủ phát triển, sửa code là trang tự cập nhật |
| `npm run lint` | Kiểm tra lỗi code — **phải sạch trước khi tạo pull request** |
| `npm run build` | Đóng gói bản chạy thật — **phải chạy được trước khi tạo pull request** |
| `npm run preview` | Xem thử bản đã đóng gói |

---

## 3. Cấu trúc thư mục

```
src/
├── components/      Thành phần dùng chung: DataTable, StatusTag, MoneyText, ErrorBoundary...
├── constants/       Hằng số: vai trò, các trạng thái kèm nhãn tiếng Việt và màu
├── context/         AuthContext + AuthProvider (thông tin người đăng nhập)
├── features/        ⭐ Mỗi nghiệp vụ một thư mục — chỗ làm việc chính
│   └── students/
│       ├── api/         Gọi API của riêng module này
│       ├── components/  Form, modal riêng của module
│       └── pages/       Màn hình
├── hooks/           useApi — gọi API và quản 3 trạng thái tải/lỗi/dữ liệu
├── layouts/         Khung trang: AdminLayout (quản trị), PortalLayout (sinh viên)
├── lib/             axiosClient, authApi, authStorage, env
├── mocks/           Dữ liệu giả — mockDb (dữ liệu) + mockApi (các endpoint, ném đúng mã lỗi)
├── routes/          AppRoutes, RoleRoute (chặn theo vai trò, buộc đổi mật khẩu)
├── theme/           tokens.js — một nguồn màu cho theme antd và biến CSS
└── utils/           formatter (tiền, ngày), permission (ẩn/hiện nút), excel (tải exceljs khi cần)
```

---

## 4. Bắt đầu code một màn hình

1. Đọc [`docs/17` mục 3 và 7](docs/17-TONG-QUAN-FRONTEND.md): cấu trúc thư mục và các cơ chế dùng chung.
2. Endpoint và mã lỗi lấy từ [`docs/API.md`](docs/API.md); thêm endpoint thì viết vào `API.md` trước, rồi thêm hàm giả vào `src/mocks/mockApi.js`.
3. Mẫu để sao chép: [`src/features/students/`](src/features/students/) — danh sách, tìm kiếm, phân trang, thêm, sửa, drawer chi tiết, phân quyền.

Ba thứ đã dựng sẵn, **dùng lại, đừng viết lại**:

| Thứ | Dùng khi nào |
|-----|--------------|
| `useApi` | Mọi lần gọi API để **lấy** dữ liệu. Trả về `{ data, meta, loading, error, refetch }` |
| `DataTable` | Mọi màn hình danh sách. Đã gom sẵn ô tìm kiếm, phân trang, trạng thái tải/lỗi/rỗng |
| `ErrorBoundary` | Đã bọc sẵn ở `main.jsx` — không cần đụng vào |

Gọi API để **ghi** (thêm/sửa/xóa) thì không dùng `useApi` — `await` thẳng trong hàm xử lý sự kiện rồi gọi `refetch()`.

---

## 5. Quy ước làm việc

| Việc | Quy ước |
|------|---------|
| Nhánh | `feature/<ten-tieng-anh>` — ví dụ `feature/invoice-management` |
| Commit | Tiếng Anh, có tiền tố: `feat:` `fix:` `refactor:` `chore:` `docs:` |
| Phạm vi sửa | Chỉ sửa trong thư mục `features/` mình phụ trách |
| File dùng chung | `components/` `hooks/` `utils/` `layouts/` `mocks/` — **báo nhóm trước khi sửa** |
| Gộp nhánh | Tạo pull request, người kia review rồi mới gộp vào `main` |
| Trước khi tạo PR | `npm run lint` sạch **và** `npm run build` chạy được |

---

## 6. Thư viện đang dùng

| Thư viện | Phiên bản | Việc |
|----------|-----------|------|
| React | 19.2 | Thư viện giao diện |
| Vite | 8.3 | Công cụ dựng và máy chủ phát triển |
| Ant Design | **6.6** | Bộ giao diện — ⚠️ **v6, không phải v5** |
| react-router-dom | 7.18 | Điều hướng trang |
| axios | 1.20 | Gọi HTTP |
| dayjs | 1.11 | Xử lý ngày tháng |
| recharts | 3.10 | Biểu đồ ở Dashboard |
| exceljs | 4.4 | Nhập sinh viên, xuất/nhập chỉ số điện nước — tải động qua `utils/excel.js`, chỉ khi bấm nút |

Hai khác biệt của antd 6 hay làm sai:

```jsx
<Modal destroyOnHidden />              // KHÔNG phải destroyOnClose (đã bỏ ở v6)
const { message } = App.useApp();      // KHÔNG import { message } from 'antd'
```

---

## 7. Biến môi trường

Chép `.env.example` thành `.env`. **Không bao giờ commit file `.env`.**

| Biến | Mặc định | Ý nghĩa |
|------|----------|---------|
| `VITE_USE_MOCK` | `true` | `true` dùng dữ liệu giả · `false` gọi backend thật |
| `VITE_API_BASE_URL` | `http://localhost:5000/api` | Địa chỉ gốc của backend |

Lúc chạy `npm run dev`, console của trình duyệt sẽ in rõ đang ở chế độ nào.

---

## 8. Tài liệu nên đọc trước

| Tài liệu | Đọc để làm gì |
|----------|---------------|
| [`docs/17-TONG-QUAN-FRONTEND.md`](docs/17-TONG-QUAN-FRONTEND.md) | Nắm toàn bộ frontend v2: màn hình, luồng, quyết định đã chốt |
| [`docs/API.md`](docs/API.md) | **Hợp đồng chung với backend** (v2.5) — đổi phải báo nhau |
| [`docs/16-YEU-CAU-API-BACKEND.md`](docs/16-YEU-CAU-API-BACKEND.md) | Việc backend cần làm để lên v2 |
| [`docs/15-CHECKLIST-NGHIEM-THU-FE.md`](docs/15-CHECKLIST-NGHIEM-THU-FE.md) | Bấm thử từng màn — bản v2 ở mục 24–35 |
| [`docs/README.md`](docs/README.md) | Bản đồ tài liệu. ⚠️ Tài liệu `01`–`14` mô tả bản v1 |
