# Hệ thống Quản lý Ký túc xá Đại học Công nghiệp Hà Nội (HaUI - DMS) — Frontend (v3.0)

Ứng dụng giao diện web (React 19 + Vite 8 + Ant Design 6) cho hệ thống **HaUI - DMS v3.0**, đồng bộ 100% với Backend [BE_QLKTX](../BE_QLKTX) trên nhánh `develop`.

- **Hợp đồng API chuẩn:** [`docs/API.md`](docs/API.md)
- **Tổng quan Frontend v3.0:** [`docs/17-TONG-QUAN-FRONTEND.md`](docs/17-TONG-QUAN-FRONTEND.md)
- **SRS & CSDL gốc (v3.0):** `BE_QLKTX/docs/EDIT_DOCS_DAC_TA_YEU_CAU.md` & `BE_QLKTX/docs/EDIT_DOCS_DATA_SCHEMA.md`

---

## 1. Cài đặt và chạy dự án

Yêu cầu **Node.js `>= 20.19`** (hoặc `>= 22.12`).

```bash
git checkout develop
npm install
copy .env.example .env    # macOS/Linux: cp .env.example .env
npm run dev
```

Mở `http://localhost:5173`.

### Kết nối Backend thật vs Dữ liệu giả
Cấu hình trong file `.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_USE_MOCK=false
```
- Đặt `VITE_USE_MOCK=false` để nối trực tiếp với `BE_QLKTX` (mặc định khuyến nghị khi tích hợp & demo).
- Đặt `VITE_USE_MOCK=true` nếu muốn chạy thử nhanh giao diện khi chưa bật server Backend.

---

## 2. Lệnh NPM thường dùng

| Lệnh | Mục đích |
|---|---|
| `npm run dev` | Khởi chạy Vite dev server (`http://localhost:5173`) |
| `npm run lint` | Kiểm tra ESLint (phải sạch trước khi commit/merge) |
| `npm run build` | Build production (phải không có lỗi trước khi merge) |
| `npm run preview` | Xem trước bản build production |

---

## 3. Phân quyền 4 vai trò (RBAC v3.0)

| Vai trò | Trang mặc định | Phạm vi truy cập |
|---|---|---|
| `admin` | `/admin/users` | Chỉ quản trị tài khoản người dùng & phân quyền (`admin` / `manager` / `staff` / `student`) |
| `manager` | `/admin/dashboard` | Trưởng ban KTX: Đợt đăng ký, Tòa nhà & Phòng 3 cơ sở, Duyệt chuyển phòng, toàn bộ vận hành, **độc quyền biểu đồ Doanh thu** |
| `staff` | `/admin/dashboard` | Cán bộ quản sinh: Hồ sơ SV, Duyệt đơn & Tự xếp phòng, Hợp đồng & QR Check-in, Điện nước, Hóa đơn/Thanh toán, Yêu cầu báo hỏng/trả phòng, Bảng tin |
| `student` | `/portal/home` | Cổng SV: Phòng ở & QR Check-in, Hóa đơn & VietQR, Gửi yêu cầu (Báo hỏng/Chuyển/Trả phòng), Chuông thông báo, Đăng ký/Gia hạn nội bộ |
| Guest *(Công khai)* | `/` | Trang thông tin KTX HaUI (3 cơ sở, bảng giá 2026–2027, thông báo, đợt mở), Nộp đơn `/apply`, Tra cứu & Tự hủy đơn `/apply/status` |

---

## 4. Cấu trúc thư mục `src/`

```text
src/
├── components/      Thành phần dùng chung (PageHeader, DataTable, StatCard, StatusTag, MoneyText...)
├── constants/       roles.js (4 vai trò), statuses.js (enum v3.0, bảng giá 2026-2027), app.js
├── context/         AuthContext, AuthProvider
├── features/        Tổ chức theo phân hệ (Vertical Slice):
│   ├── auth/            Đăng nhập, Đổi mật khẩu, 403, 404
│   ├── apply/           Trang chủ KTX công khai, Nộp đơn theo đợt & MSSV, Tra cứu & Tự hủy đơn
│   ├── periods/         Quản lý Đợt đăng ký (Manager CRUD, Staff xem)
│   ├── rooms/           Tòa nhà 3 Cơ sở & Sơ đồ Phòng (cấp phòng, không theo dõi giường)
│   ├── students/        Hồ sơ SV, diện ưu tiên, sức khỏe, Import Excel
│   ├── applications/    Duyệt đơn, Tự động xếp phòng nhân văn, Từ chối
│   ├── contracts/       Hợp đồng, Chờ đóng phí, Hủy quá hạn, Quét QR Check-in, Thanh lý & Khấu trừ cọc
│   ├── fees/            Bảng lưới điện nước (có cờ reset đồng hồ), Hóa đơn
│   ├── payments/        Phiếu thu & Phiếu chi hoàn cọc, Tiền mặt, Đối soát & Giả lập Webhook VietQR
│   ├── requests/        Xử lý Phiếu yêu cầu SV (Báo hỏng / Chuyển phòng nguyên tử / Trả phòng)
│   ├── notifications/   Quản lý Bảng tin KTX
│   ├── dashboard/       Thống kê 3 cơ sở & Doanh thu (chỉ Manager)
│   ├── users/           Quản lý tài khoản (chỉ Admin)
│   └── portal/          Cổng sinh viên (Trang chủ, Chỗ ở & QR, Hóa đơn & VietQR, Yêu cầu, Chuông TB, Hồ sơ)
├── hooks/           useApi, useDebounce
├── layouts/         AdminLayout, PortalLayout
├── lib/             axiosClient, authApi, authStorage, env
├── routes/          AppRoutes, RoleRoute, paths
└── utils/           formatter, permission, excel
```
