# MÔ TẢ ĐỀ TÀI (v3.0 — Chuẩn nghiệp vụ HaUI 2026–2027)

**Tên đề tài:** Xây dựng hệ thống web quản lý ký túc xá Trường Đại học Công nghiệp Hà Nội *(HaUI Dormitory Management System — HaUI DMS)*
**Đơn vị áp dụng:** Trung tâm Hỗ trợ sinh viên / Trung tâm Ký túc xá Đại học Công nghiệp Hà Nội (`ssc.haui.edu.vn`)
**Phiên bản:** v3.0 (3 Cơ sở địa giới hành chính 2026 · 4 Vai trò RBAC · 10 Phân hệ · 11 Collections · Quản lý cấp Phòng)

---

## 1. Bối cảnh 3 Cơ sở thực tế (Địa giới hành chính 2026)

- **Cơ sở 1 (`cs1`):** Ngõ 296 / Số 298 Đường Cầu Diễn, Phường Tây Tựu, TP. Hà Nội — Tòa **A14, A15** (264 phòng, >1.100 chỗ).
- **Cơ sở 2 (`cs2`):** Tổ dân phố Thượng 2, Phường Tây Tựu, TP. Hà Nội — Tòa **B12, B14** (112 phòng, >476 chỗ).
- **Cơ sở 3 (`cs3`):** Phường Phù Vân, Tỉnh Ninh Bình — Tòa **C15, C16, C17** (330 phòng, >1.400 chỗ; tiếp nhận đa số tân sinh viên năm nhất).

Hệ thống áp dụng đúng **Bảng giá phòng ở KTX HaUI năm học 2026–2027** gồm 3 hạng phòng (`high_quality` Chất lượng cao 3/4/6 người, `standard` Tiêu chuẩn 4/6 người, `basic` Cơ bản 4/6 người) và quản lý chỗ ở tinh gọn đến **cấp Phòng** (`capacity` & `occupiedCount`, sinh viên vào phòng tự chia giường với nhau).

---

## 2. Tác nhân & Phân quyền RBAC (4 Vai trò + Khách công khai)

| Tác nhân | Mã role | Trách nhiệm chính |
|---|---|---|
| **Quản trị Hệ thống** | `admin` | Quản lý tài khoản người dùng, phân quyền, khóa/mở tài khoản, cấp lại mật khẩu (tách biệt khỏi nghiệp vụ KTX & doanh thu) |
| **Trưởng ban QLKTX** | `manager` | Mở/đóng Đợt đăng ký, quản lý Tòa nhà & Phòng 3 cơ sở, phê duyệt chuyển phòng nguyên tử, xem **Báo cáo Doanh thu 3 cơ sở** và điều hành chung |
| **Cán bộ Quản sinh** | `staff` | Quản lý hồ sơ SV & Import Excel, duyệt/tự xếp phòng/hủy đơn quá hạn, quét **QR Check-in**, chốt điện nước bảng lưới, thu tiền mặt/VietQR, xử lý báo hỏng & trả phòng, đăng bảng tin |
| **Sinh viên nội trú** | `student` | Xem phòng ở & mã **QR Check-in**, thanh toán VietQR tự động gạch nợ, gửi yêu cầu trực tuyến (Báo hỏng / Chuyển phòng / Trả phòng), nhận Chuông thông báo, đăng ký/gia hạn nội bộ |
| **Khách / Tân SV** | *(Guest)* | Xem Trang chủ KTX công khai (3 cơ sở, bảng giá 2026–2027, thông báo, đợt mở), nộp đơn phân luồng theo 4 số đầu MSSV, tra cứu và tự hủy đơn khi đang `pending` |

---

## 3. 10 Phân hệ nghiệp vụ chính

1. **Xác thực & Tài khoản (`auth`):** JWT 7 ngày, buộc đổi mật khẩu lần đầu (`mustChangePassword`), 4 vai trò RBAC.
2. **Hồ sơ Sinh viên (`students`):** Trích `enrollmentYear` từ MSSV 10 chữ số, diện ưu tiên chính sách, tình trạng sức khỏe ưu tiên tầng thấp, Import Excel tối đa 1.000 dòng.
3. **Cơ sở vật chất 3 Cơ sở (`rooms`):** Tòa nhà `A14-A15`, `B12-B14`, `C15-C17`; hạng phòng & giá 2026–2027; khóa chỗ nguyên tử cấp Phòng (`occupiedCount < capacity`).
4. **Đợt đăng ký & Phân luồng MSSV (`periods`):** Chỉ mở đăng ký trong đợt `open`; tự phân biệt Tân SV (`freshman`) vs SV khóa cũ (`returning`) và phân luồng CS1–CS2 vs CS3 theo Khoa/Ngành.
5. **Xét duyệt, Chờ đóng phí & QR Check-in (`contracts`):** `pending` → `pending_payment` (hạn 7 ngày, hủy quá hạn nhả chỗ ngay) → tự động `active` khi đóng đủ phí đầu kỳ + sinh mã `checkinCode` QR bàn giao phòng; thanh lý sạch nợ 100% & hoàn cọc có khấu trừ hỏng tài sản.
6. **Điện nước bảng lưới & Hóa đơn phòng (`fees`):** Nhập chỉ số theo tòa/tháng (nối tiếp chỉ số cũ + cờ `allowMeterReset`), chốt 01 hóa đơn/phòng + bắn Thông báo & Email đồng loạt.
7. **Thanh toán & Webhook VietQR tự động (`payments`):** Tiền mặt, đối soát thủ công, Webhook VietQR idempotent + Simulator demo, lưu riêng phiếu chi hoàn cọc (`paymentType: 'refund'`).
8. **Phiếu yêu cầu SV (`requests`):** Báo hỏng thiết bị (`repair`), Xin chuyển phòng nguyên tử (`transfer`), Đăng ký trả phòng (`checkout`).
9. **Chuông Thông báo & Bảng tin (`notifications`):** Thông báo cá nhân chưa đọc và bảng tin chung 3 cơ sở.
10. **Cổng SV & Dashboard 3 Cơ sở (`portal` & `dashboard`):** Tỷ lệ lấp đầy theo 3 cơ sở/tòa nhà, công nợ và Báo cáo Doanh thu dành riêng cho `manager`.

---

## 4. Công nghệ & Kiến trúc

- **Frontend:** React 19, Vite 8, Ant Design 6, React Router 7, Axios, Dayjs, Recharts, ExcelJS.
- **Backend:** Node.js, Express 5, MongoDB + Mongoose 9 (Modular Monolith — 10 Modules, 11 Collections), JWT + Bcrypt, Nodemailer, Webhook VietQR (không phụ thuộc Redis/BullMQ hay Socket.io).
