# Bộ tài liệu dự án: HỆ THỐNG QUẢN LÝ KÝ TÚC XÁ ĐH CÔNG NGHIỆP HÀ NỘI (HaUI - DMS)

> **Stack:** React 19 + Vite 8 + Ant Design 6 · Node.js + Express 5 · MongoDB + Mongoose 9
> **Kiến trúc:** Modular Monolith theo tính năng (10 Modules · 11 Collections · 4 Vai trò RBAC)
> **Repo:** `FE_QuanLyKTX` (React Frontend) · `BE_QLKTX` (Node.js/Express Backend)
> **Phiên bản hiện hành:** **v3.0** (Chuẩn nghiệp vụ KTX HaUI 2026–2027)

---

## ⚠️ Nguồn chuẩn hiện hành là **v3.0 (HaUI 2026–2027)**

Dự án đã chuẩn hóa toàn bộ cả `BE_QLKTX` và `FE_QuanLyKTX` (trên nhánh `develop`) sang **v3.0** bám sát vận hành thực tế của Trung tâm Ký túc xá HaUI (`ssc.haui.edu.vn`):

- **4 vai trò RBAC:** `admin` (chỉ quản trị tài khoản/hệ thống), `manager` (Trưởng ban KTX — mở đợt ĐK, tòa/phòng, duyệt chuyển phòng, độc quyền xem doanh thu), `staff` (vận hành hằng ngày), `student` (Cổng sinh viên).
- **3 Cơ sở địa giới 2026:** CS1 (`A14, A15` — 298 Cầu Diễn, Tây Tựu, HN), CS2 (`B12, B14` — TDP Thượng 2, Tây Tựu, HN), CS3 (`C15, C16, C17` — Phù Vân, Ninh Bình) kèm bảng giá chính thức 2026–2027.
- **Quản lý gọn đến cấp Phòng (bỏ theo dõi giường lẻ):** dùng `capacity` (`2/3/4/6`) và khóa chỗ nguyên tử `occupiedCount < capacity`; SV vào phòng tự chia giường.
- **Số hóa đầy đủ quy trình thực tế:** Trang chủ KTX công khai → Đợt đăng ký & phân luồng tự động theo 4 số đầu MSSV (`freshman` vs `returning`) → Duyệt / Tự động xếp phòng ưu tiên tầng thấp → Chờ đóng phí (`pending_payment`, hạn 7 ngày) + Hủy quá hạn → Webhook VietQR tự động kích hoạt `active` + Mã **QR Check-in** → Điện nước bảng lưới (nối tiếp chỉ số / `allowMeterReset`) → Phiếu yêu cầu SV (`repair`, `transfer`, `checkout`) → Chuông thông báo & Bảng tin chung → Thanh lý & Hoàn cọc có khấu trừ hỏng đồ.

---

## Bản đồ tài liệu

### Tầng chuẩn hiện hành (v3.0) ⭐ *đọc trước khi code*

| Tài liệu | Vai trò | Vị trí |
|---|---|---|
| [API.md](API.md) | Hợp đồng RESTful API đầy đủ (khớp 100% `BE_QLKTX/docs/API.md`) | `FE_QuanLyKTX/docs/` |
| [17-TONG-QUAN-FRONTEND.md](17-TONG-QUAN-FRONTEND.md) | Kiến trúc, danh sách màn hình, luồng chạy & phân quyền Frontend v3.0 | `FE_QuanLyKTX/docs/` |
| [MO-TA-DE-TAI.md](MO-TA-DE-TAI.md) | Mô tả đề tài chuẩn v3.0 (3 cơ sở địa giới 2026, 4 vai trò, 10 phân hệ) | `FE_QuanLyKTX/docs/` |
| `BE_QLKTX/docs/EDIT_DOCS_DAC_TA_YEU_CAU.md` | Đặc tả yêu cầu phần mềm (SRS v3.0) | Repo `BE_QLKTX` |
| `BE_QLKTX/docs/EDIT_DOCS_DATA_SCHEMA.md` | Thiết kế CSDL 11 Collections & ERD v3.0 | Repo `BE_QLKTX` |
| `BE_QLKTX/docs/PRD.md` & `ARCHITECTURE.md` | Phạm vi sản phẩm & Kiến trúc hệ thống v3.0 | Repo `BE_QLKTX` |

### Tài liệu lưu trữ lịch sử (v1 / v2 cũ — chỉ để đối chiếu)

- `15-CHECKLIST-NGHIEM-THU-FE.md`, `16-YEU-CAU-API-BACKEND.md`, `FE_V2_PLAN.md`: tài liệu giai đoạn v2.x trước đây (3 vai trò, có chọn giường).
- `01`–`14`, `PRD.md`, `ARCHITECTURE.md`, `DATA-SCHEMA.md`: tài liệu gốc giai đoạn v1 (16 collections, `viewer`, `supplies`, `VNPay`). Không sử dụng để triển khai tính năng mới.
