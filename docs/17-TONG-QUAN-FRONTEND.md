# 17 – TỔNG QUAN FRONTEND (v3.0 — Chuẩn HaUI 2026–2027)

**Hệ thống:** Hệ thống Quản lý Ký túc xá Đại học Công nghiệp Hà Nội (`HaUI - DMS v3.0`)
**Hợp đồng API:** [`docs/API.md`](API.md) (khớp 100% `BE_QLKTX/docs/API.md`)

---

## 1. Tổng quan nhanh

1. **Ba khu vực giao diện:**
   - **Cổng công khai (`/`):** Trang thông tin KTX HaUI (`ssc.haui.edu.vn` thu gọn — 3 cơ sở, bảng giá 2026–2027, thông báo, các đợt đang mở), Nộp đơn trực tuyến (`/apply`), Tra cứu & tự hủy đơn (`/apply/status`), Đăng nhập (`/login`).
   - **Khu quản trị (`/admin/*`):** Sidebar phân nhánh rõ theo 3 vai trò `admin`, `manager`, `staff`.
   - **Cổng sinh viên (`/portal/*`):** Giao diện gọn nhẹ, menu ngang (responsive mobile), tích hợp Chuông thông báo In-app.
2. **Phân quyền 4 vai trò RBAC:**
   - `admin`: Chỉ quản trị tài khoản (`/admin/users`). Mặc định vào `/admin/users`, không truy cập nghiệp vụ KTX hay Dashboard.
   - `manager`: Quản lý Đợt đăng ký (`/admin/periods`), Tòa nhà/Phòng 3 cơ sở (`/admin/buildings`, `/admin/rooms`), duyệt chuyển phòng nguyên tử (`/admin/requests`), **độc quyền xem biểu đồ Doanh thu** trên `/admin/dashboard`, cùng toàn bộ nghiệp vụ vận hành.
   - `staff`: Vận hành hằng ngày (Sinh viên, Duyệt đơn, Hợp đồng & QR Check-in, Điện nước, Hóa đơn, Thanh toán, Yêu cầu báo hỏng/trả phòng, Bảng tin, Dashboard KPI & Lấp đầy).
   - `student`: Chỉ truy cập dữ liệu của chính mình qua `/api/portal/*` (chống IDOR từ JWT).
3. **Quản lý gọn đến cấp Phòng (bỏ theo dõi giường lẻ):**
   - Toàn bộ màn hình công khai, sơ đồ tầng, duyệt đơn, hợp đồng và cổng sinh viên hiển thị theo **Phòng** (`occupied / capacity`, `availableSlots`), gắn **Cơ sở (`cs1/cs2/cs3`)** và **Hạng phòng (`high_quality/standard/basic`)**. Không còn `BedPicker` hay `bedNumber`.

---

## 2. Danh sách màn hình v3.0

*Vai trò: **G** = Công khai · **A** = `admin` · **M** = `manager` · **S** = `staff` · **SV** = `student`.*

### 2.1. Công khai & Chung

| Màn hình | Đường dẫn | Quyền | API chính |
|---|---|---|---|
| Trang chủ KTX công khai | `/` | G | `GET /public/campuses`, `/public/announcements`, `/public/periods/open` |
| Đăng nhập | `/login` | G | `POST /auth/login` |
| Nộp đơn theo đợt & MSSV | `/apply` | G | `GET /public/periods/open`, `/public/rooms/available`, `POST /contracts/register-online` |
| Tra cứu & Tự hủy đơn | `/apply/status` | G | `GET /public/applications/status`, `POST /public/applications/cancel` |
| Đổi mật khẩu | `/admin/change-password`, `/portal/change-password` | A M S SV | `PATCH /auth/change-password` |
| 403 / 404 | `/403`, `*` | — | — |

### 2.2. Khu quản trị (`/admin/*`)

| Màn hình | Đường dẫn | Quyền | API chính |
|---|---|---|---|
| Dashboard 3 Cơ sở | `/admin/dashboard` | M S *(Doanh thu: chỉ M)* | `GET /dashboard/summary`, `/occupancy`, `/revenue` |
| Quản lý Đợt đăng ký | `/admin/periods` | M (CRUD) · S (xem) | `GET/POST/PUT /periods`, `PATCH /periods/:id/status` |
| Quản lý Sinh viên | `/admin/students` | M S | `GET/POST/PUT /students`, `/students/import`, `/deactivate`, `/users/:id/reset-password` |
| Tòa nhà 3 Cơ sở | `/admin/buildings` | M (CRUD) · S (xem) | `GET/POST/PUT /buildings` |
| Phòng — Sơ đồ tầng | `/admin/rooms` | M (CRUD) · S (xem) | `GET/POST/PUT /rooms`, `GET /rooms/:id` |
| Duyệt đơn & Tự xếp phòng | `/admin/applications` | M S | `GET /contracts?status=pending`, `PATCH /contracts/:id/approve`, `/reject`, `POST /contracts/auto-approve` |
| Hợp đồng & QR Check-in | `/admin/contracts` | M S | `GET /contracts`, `POST /contracts/checkin-qr`, `/cancel-overdue`, `PATCH /:id/cancel`, `/terminate`, `/deposit-refund` |
| Phiếu yêu cầu SV | `/admin/requests` | M S *(Chuyển phòng: chỉ M)* | `GET /requests`, `PATCH /requests/:id/status` |
| Bảng tin KTX | `/admin/notifications` | M S *(Xóa: chỉ M)* | `GET/POST/DELETE /notifications/announcements` |
| Chỉ số điện nước | `/admin/utility-readings` | M S | `GET /utility-readings/sheet`, `POST /bulk`, `/publish`, `GET /history` |
| Hóa đơn & Chi tiết | `/admin/invoices`, `/admin/invoices/:id` | M S | `GET /invoices`, `GET /invoices/:id`, `POST /payments/cash`, `/vietqr/confirm`, `/webhook/simulate` |
| Phiếu thu & Hoàn cọc | `/admin/payments` | M S | `GET /payments` |
| Tài khoản người dùng | `/admin/users` | **Chỉ A** | `GET/POST/PUT /users`, `PATCH /users/:id/status`, `POST /users/:id/reset-password` |

### 2.3. Cổng sinh viên (`/portal/*`, chỉ `student`)

| Màn hình | Đường dẫn | API chính |
|---|---|---|
| Trang chủ SV | `/portal/home` | `GET /portal/profile`, `/my-residence`, `/my-invoices`, `POST /portal/applications` *(đăng ký/gia hạn nội bộ)* |
| Chỗ ở, Hợp đồng & QR Check-in | `/portal/my-residence` | `GET /portal/my-residence`, `/my-contracts`, `/my-contracts/:id/checkin-qr`, `/my-room/utility-history` |
| Hóa đơn & Thanh toán VietQR | `/portal/my-invoices` | `GET /portal/my-invoices`, `/my-invoices/:id`, `/vietqr`, `/my-payments` |
| Phiếu yêu cầu trực tuyến | `/portal/requests` | `GET/POST /portal/requests`, `PATCH /portal/requests/:id/cancel` |
| Hồ sơ cá nhân | `/portal/profile` | `GET /portal/profile`, `/my-residence` |
| Chuông Thông báo (Header) | *(Mọi trang Portal)* | `GET /portal/notifications`, `PATCH /portal/notifications/:id/read`, `/read-all` |
