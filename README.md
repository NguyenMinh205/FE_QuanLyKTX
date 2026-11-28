# Hệ thống Quản lý Ký túc xá Đại học Công nghiệp Hà Nội (HaUI - DMS) — Frontend

Ứng dụng web Frontend (**React 19 + Vite 8 + Ant Design 6 + Recharts + ExcelJS**) cho hệ thống **HaUI - DMS — Ký túc xá Cơ sở 1 (Cầu Diễn · Nhà A14 & A15)** năm học **2026–2027**, tích hợp trực tiếp với Backend [BE_QLKTX](../BE_QLKTX) trên nhánh `develop`.

---

## 1. Cài đặt & Khởi chạy

Yêu cầu **Node.js `>= 20.19`** (hoặc `>= 22.12`) và Backend `BE_QLKTX` đang lắng nghe tại `http://localhost:5000`.

```bash
git checkout develop
npm install
copy .env.example .env    # macOS/Linux: cp .env.example .env
npm run dev
```

Mở trình duyệt tại `http://localhost:5173`.

### Cấu hình biến môi trường (`.env`)
Xem [.env.example](.env.example):
```env
VITE_API_BASE_URL=http://localhost:5000/api
```
Frontend kết nối trực tiếp Backend thật qua `axiosClient` (không dùng chế độ mock).

---

## 2. Lệnh NPM Scripts

| Lệnh | Mục đích |
|---|---|
| `npm run dev` | Khởi chạy Vite dev server (`http://localhost:5173`) |
| `npm run lint` | Kiểm tra ESLint toàn bộ dự án (`0 errors / 0 warnings` trước khi commit) |
| `npm run build` | Đóng gói bản production (`vite build`) |
| `npm run preview` | Xem trước bản build production |

---

## 3. Phân luồng Cổng & 4 Vai trò (RBAC)

Hệ thống tách riêng **2 cổng đăng nhập** (`/login` cho Sinh viên và `/admin/login` cho Cán bộ/Quản trị):

| Vai trò | Trang mặc định | Chức năng chính trên giao diện |
|---|---|---|
| **Khách (Công khai)** | `/` | Xem thông tin & bảng giá KTX Cơ sở 1 (2026–2027), Bảng tin phân màu ưu tiên, nộp đơn đăng ký tự động xếp phòng `/apply` (khóa loại phòng hết chỗ, 2 gói 6T/12T), tra cứu & tự hủy giữ chỗ `/apply/status` |
| **Sinh viên (`student`)** | `/portal/home` | Trang chủ chỗ ở & Việc cần làm, Chuông thông báo ưu tiên (khẩn/quan trọng tự ghim), Chỗ ở & **QR Check-in** & **In Hợp đồng A4**, Hóa đơn gộp đầu kỳ + điện nước + **VietQR Sandbox**, Lịch sử nộp tiền/hoàn cọc (kèm in chứng từ), Gửi phiếu Báo hỏng / Chuyển phòng cùng hạng (2A) / Trả phòng, Gia hạn nội bộ |
| **Cán bộ quản sinh (`staff`)** | `/admin/dashboard` | Dashboard tác vụ nhanh, Hợp đồng & Quét QR Check-in & Hủy quá hạn & Thanh lý tự đóng phiếu trả phòng, **Hoàn cọc trực tiếp kèm danh mục khấu trừ tài sản**, Hồ sơ SV & Import Excel, Sơ đồ tầng phòng `A14`/`A15`, Xử lý phiếu báo hỏng & hẹn trả phòng, Bảng tin KTX, Ghi chỉ số điện nước theo SV đã Check-in (3A) & Xuất/Nhập Excel, Hóa đơn & Thu tiền/Webhook VietQR & **Xuất Excel công nợ**, Thu chi & **Xuất sổ thu chi Excel** |
| **Trưởng ban KTX (`manager`)** | `/admin/dashboard` | Toàn bộ quyền vận hành của `staff` + cấu hình Đợt đăng ký, thêm/sửa Tòa nhà & Phòng, **phê duyệt chuyển phòng nguyên tử (2A)** và **độc quyền xem Biểu đồ Doanh thu thực thu (đã tách tiền cọc)** |
| **Quản trị hệ thống (`admin`)** | `/admin/users` | Chỉ quản trị tài khoản người dùng (`admin`, `manager`, `staff`, `student`), khóa/mở khóa và cấp lại mật khẩu tạm |

---

## 4. Điểm nổi bật về Số hóa & Trải nghiệm (UX)

- **01 Hóa đơn đầu kỳ gộp (`initial_payment`):** Bóc tách rõ *Tiền phòng cả kỳ* và *Tiền cọc tài sản* trên cả trang quản trị lẫn Cổng SV — quét 1 mã VietQR là tự động kích hoạt hợp đồng và sinh mã QR Check-in.
- **Số hóa chứng từ A4 (`@media print`):** In / lưu PDF trực tiếp từ trình duyệt cho **Hợp đồng nội trú (`HD-...`)**, **Phiếu thu (`PAY-...`)** và **Phiếu chi hoàn cọc (`REF-...`)** có đầy đủ khối chữ ký hai bên.
- **Danh mục kiểm kê khấu trừ tài sản chuẩn:** Tích nhanh lỗi hư hại theo hạng phòng (có thêm mục điều hòa/đệm cho phòng CLC) trong modal hoàn cọc để tự tính tổng khấu trừ và ghép lý do.
- **Xuất / Nhập Excel bằng `exceljs` (lazy-loaded):** Nhập danh sách sinh viên, Xuất/Nhập bảng ghi chỉ số điện nước, Xuất Bảng kê công nợ hóa đơn và Xuất Sổ thu chi & hoàn cọc.
- **Bố cục quản trị linh hoạt:** Thanh sidebar hỗ trợ **thu gọn thành chỉ hiện icon (`68px`)** lưu trạng thái theo trình duyệt, giữ chấm thông báo hàng đợi và tooltip tên mục khi rê chuột.

---

## 5. Cấu trúc Thư mục `src/`

```text
src/
├── components/      Thành phần dùng chung (BrandLogo, PageHeader, DataTable, StatCard, StatusTag, MoneyText, EmptyState, ErrorBoundary)
├── constants/       roles.js (4 vai trò), statuses.js (enum CS1 & bảng giá 2026–2027), app.js
├── context/         AuthContext.js, AuthProvider.jsx
├── features/        13 phân hệ tổ chức theo tính năng (Vertical Slice):
│   ├── apply/           Trang chủ KTX CS1, Đăng ký tự động xếp phòng, Tra cứu & Tự hủy giữ chỗ
│   ├── auth/            Đăng nhập tách cổng (SV / Cán bộ), Đổi mật khẩu, 403, 404
│   ├── contracts/       Hợp đồng, QR Check-in, Thanh lý, Hoàn cọc có checklist khấu trừ, In Hợp đồng A4
│   ├── dashboard/       Thống kê lấp đầy A14/A15 & Doanh thu thực thu (chỉ Manager)
│   ├── fees/            Bảng lưới chỉ số điện nước (3A + Excel), Hóa đơn, Thu tiền/VietQR & Xuất Excel kế toán
│   ├── notifications/   Quản lý Bảng tin KTX ưu tiên 3 mức
│   ├── payments/        Sổ Phiếu thu & Phiếu chi hoàn cọc, Chứng từ in A4 & Xuất Excel
│   ├── periods/         Quản lý Đợt đăng ký (Manager CRUD, Staff xem)
│   ├── portal/          Cổng sinh viên (Trang chủ, Chỗ ở & HĐ A4, Hóa đơn & VietQR, Yêu cầu, Chuông TB, Hồ sơ)
│   ├── requests/        Xử lý Phiếu yêu cầu SV (Báo hỏng / Chuyển phòng 2A / Liên kết 1 chạm Thanh lý)
│   ├── rooms/           Tòa nhà A14, A15 & Sơ đồ phòng trực quan theo tầng
│   ├── students/        Hồ sơ sinh viên, tìm kiếm, Import Excel, đặt lại mật khẩu
│   └── users/           Quản trị tài khoản hệ thống (chỉ Admin)
├── hooks/           useApi.js
├── layouts/         AdminLayout.jsx (sidebar thu gọn icon), PortalLayout.jsx
├── lib/             axiosClient.js, authApi.js, authStorage.js, env.js
├── routes/          AppRoutes.jsx, RoleRoute.jsx, paths.js
└── utils/           formatter.js, permission.js, excel.js
```
