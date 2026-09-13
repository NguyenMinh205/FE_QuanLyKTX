# Hệ thống quản lý ký túc xá — Frontend

Giao diện người dùng của đồ án **Hệ thống quản lý ký túc xá**, viết bằng React + Vite.

- **Backend:** repo riêng `BE_QuanLyKTX` (Node.js + Express + MongoDB)
- **Tài liệu:** [`docs/`](docs/README.md) — dùng chung cho **cả hai repo**, không sao chép sang repo backend

---

## 1. Chạy dự án trên máy mình

Cần **Node.js 20 trở lên**.

```bash
git clone <đường-dẫn-repo>
cd FE_QuanLyKTX
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm run dev
```

Mở http://localhost:5173

> ✅ **Chạy được ngay, không cần backend.** Dự án có sẵn lớp dữ liệu giả (`src/mocks/`) mô phỏng đầy đủ 10 module theo mô hình **đăng ký theo phòng** (loại phòng, đơn đăng ký tự gán giường, nhu yếu phẩm). Khi backend xong, đặt `VITE_USE_MOCK=false` trong `.env` là chuyển sang gọi API thật, **không phải sửa một dòng code màn hình nào**.

### Tài khoản đăng nhập thử

| Vai trò | Email | Mật khẩu | Thấy được gì |
|---------|-------|----------|--------------|
| Quản trị | `admin@dorm.local` | `Admin@123` | Toàn bộ, kể cả quản lý tài khoản và danh mục phí |
| Nhân viên | `staff@dorm.local` | `Staff@123` | Nghiệp vụ hằng ngày, không vào được phần hệ thống |
| Người xem | `viewer@dorm.local` | `Viewer@123` | Chỉ xem — **mọi nút Thêm/Sửa/Xóa đều bị ẩn** |
| Sinh viên đang ở | `sv001@dorm.local` | `Student@123` | Cổng sinh viên: phòng Tiêu chuẩn, có công nợ, có đơn nhu yếu phẩm |
| Sinh viên chưa có chỗ | `sv002@dorm.local` | `Student@123` | Trang chủ mời đăng ký chỗ ở |
| Sinh viên phòng CLC | `sv004@dorm.local` | `Student@123` | Phòng Chất lượng cao — cửa hàng ẩn "Đệm mút" vì đã cấp sẵn |

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
├── lib/             axiosClient, authApi, env
├── mocks/           Dữ liệu giả — mockDb (dữ liệu) + mockApi (các endpoint, ném đúng mã lỗi)
├── routes/          AppRoutes, RoleRoute (chặn theo vai trò)
└── utils/           formatter (tiền, ngày), permission (ẩn/hiện nút)
```

---

## 4. Bắt đầu code một màn hình

1. Xem mình phụ trách màn hình nào: [`docs/09` mục 1.4](docs/09-KE-HOACH-PHAN-CONG.md)
2. Làm theo **checklist 6 bước**: [`docs/14` mục 15.8](docs/14-PHIEN-BAN-DON-GIAN-HOA.md) — khoảng 1 giờ cho một màn hình CRUD
3. Mẫu để sao chép: [`src/features/students/`](src/features/students/) — màn hình sinh viên đã làm xong, đầy đủ danh sách, tìm kiếm, phân trang, thêm, sửa, phân quyền

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
| Ant Design | **6.6** | Bộ giao diện — ⚠️ **v6, không phải v5**, xem [`docs/14` mục 3.1.1](docs/14-PHIEN-BAN-DON-GIAN-HOA.md) |
| react-router-dom | 7.18 | Điều hướng trang |
| axios | 1.20 | Gọi HTTP |
| dayjs | 1.11 | Xử lý ngày tháng |
| recharts | 3.10 | Biểu đồ ở Dashboard |

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
| `VITE_APP_NAME` | Hệ thống quản lý ký túc xá | Tên hiển thị |

Lúc chạy `npm run dev`, console của trình duyệt sẽ in rõ đang ở chế độ nào.

---

## 8. Tài liệu nên đọc trước

| Tài liệu | Đọc để làm gì |
|----------|---------------|
| [`docs/README.md`](docs/README.md) | Bản đồ toàn bộ tài liệu |
| [`docs/API.md`](docs/API.md) | **Hợp đồng chung với backend** — đổi phải báo nhau |
| [`docs/08-THIET-KE-GIAO-DIEN.md`](docs/08-THIET-KE-GIAO-DIEN.md) | Bố cục, màu sắc, quy ước giao diện |
| [`docs/14` mục 15.8](docs/14-PHIEN-BAN-DON-GIAN-HOA.md) | Checklist 6 bước thêm màn hình |
| [`docs/03-PHAN-TICH-NGHIEP-VU.md`](docs/03-PHAN-TICH-NGHIEP-VU.md) | Tra khi làm 3 màn hình khó: lưu trú, điện nước, hóa đơn |
