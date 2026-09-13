# Bộ tài liệu dự án: HỆ THỐNG QUẢN LÝ KÝ TÚC XÁ (DMS)

> **Stack:** React + Vite · Node.js + Express · MongoDB + Mongoose
> **Kiến trúc:** Modular Monolith theo tính năng (vertical slice)
> **Quy mô đội:** 5 người (3 backend · 2 frontend) · **Thời lượng:** 12 tuần
> **Repo:** `FE_QuanLyKTX` (React + tài liệu này) · `BE_QuanLyKTX` (Node.js + Express)
> **Phiên bản tài liệu:** v2.1 · **Cập nhật:** 13/09/2026

---

## 1. Bản đồ tài liệu

Bộ tài liệu chia làm **hai tầng**. Tầng 1 là hợp đồng kỹ thuật (tiếng Anh), tầng 2 là phân tích và kế hoạch (tiếng Việt).

### Tầng 1 — Hợp đồng kỹ thuật ⭐ *đọc trước khi code*

| Tài liệu | Trả lời câu hỏi | Ai cần |
|---|---|---|
| [PRD.md](PRD.md) | **Làm gì, không làm gì?** Phạm vi v1 — ranh giới cứng | Cả nhóm |
| [ARCHITECTURE.md](ARCHITECTURE.md) | **Code để ở đâu?** Cấu trúc thư mục, phân tầng, quy ước đặt tên | Cả nhóm |
| [API.md](API.md) | **Gọi API thế nào?** Endpoint, envelope, mã lỗi | FE + BE |
| [DATA-SCHEMA.md](DATA-SCHEMA.md) | **Dữ liệu hình dạng ra sao?** 16 collection, index, ràng buộc | BE |

> ⚠️ **Bốn tài liệu này là chuẩn.** Khi một tài liệu tiếng Việt nói khác, lấy theo tầng 1.

### Tầng 2 — Phân tích, thiết kế, kế hoạch

| # | Tài liệu | Nội dung |
|---|----------|----------|
| 01 | [Tổng quan dự án](01-TONG-QUAN-DU-AN.md) | Bối cảnh, khảo sát hiện trạng, mục tiêu, rủi ro — nguyên liệu cho Chương 1 báo cáo |
| 02 | [Đặc tả yêu cầu (SRS)](02-DAC-TA-YEU-CAU.md) | **87 FR / 20 NFR / 8 use case chi tiết** — mọi chức năng phải truy vết về đây |
| 03 | [Phân tích nghiệp vụ](03-PHAN-TICH-NGHIEP-VU.md) | Quy tắc nghiệp vụ, máy trạng thái, luồng quy trình, công thức tính tiền |
| 07 | [Phân quyền & bảo mật](07-PHAN-QUYEN-BAO-MAT.md) | Ma trận RBAC, luồng JWT, chống IDOR, checklist bảo mật |
| 08 | [Thiết kế giao diện](08-THIET-KE-GIAO-DIEN.md) | Sitemap, danh sách màn hình, wireframe, bảng màu & trạng thái |
| 09 | [Kế hoạch & phân công](09-KE-HOACH-PHAN-CONG.md) | WBS, ngày công, phân vai, RACI |
| 10 | [Quy trình làm việc](10-QUY-TRINH-LAM-VIEC.md) | Git flow, quy ước commit/nhánh, Definition of Done |
| 11 | [Kế hoạch kiểm thử](11-KE-HOACH-KIEM-THU.md) | Chiến lược test, test case, kịch bản UAT |
| 12 | [Khung báo cáo đồ án](12-KHUNG-BAO-CAO.md) | Mục lục báo cáo, map tài liệu → chương, câu hỏi phản biện |
| 13 | [Lộ trình triển khai A→Z](13-LO-TRINH-TRIEN-KHAI.md) | Timeline 12 tuần, runbook cài đặt → deploy, 26 cạm bẫy |
| 14 | [Hướng dẫn cho người mới](14-PHIEN-BAN-DON-GIAN-HOA.md) | Lý do đơn giản hóa, lộ trình tự học, **mẫu code một module hoàn chỉnh** |

> **Vì sao thiếu 04, 05, 06?** Ba tài liệu đó (Thiết kế CSDL, Kiến trúc, Đặc tả API) đã được thay thế bằng `DATA-SCHEMA.md`, `ARCHITECTURE.md`, `API.md` ở tầng 1 vào ngày 12/09/2026. Giữ số cũ cho các tài liệu còn lại để không phải sửa hàng trăm tham chiếu chéo. **Không tạo lại 04/05/06.**

---

## 2. Đọc gì trước — theo vai trò

**Chưa từng làm web bao giờ** → bắt đầu ở [`14` mục 14 (lộ trình tự học)](14-PHIEN-BAN-DON-GIAN-HOA.md), học xong mới đọc tiếp.

| Vai trò | Thứ tự đọc |
|---|---|
| **Thành viên mới (30 phút)** | `PRD.md` → `ARCHITECTURE.md` → [`14` mục 15 (mẫu code)](14-PHIEN-BAN-DON-GIAN-HOA.md) → `13` mục 3 (cài môi trường) |
| **Backend** | `DATA-SCHEMA.md` → `API.md` (module đang làm) → `03` (quy tắc BR) → `07` |
| **Frontend** | `08` (31 màn hình, desktop trước) → `09` mục 1.4 (ai làm màn nào) → [`14` mục 15.8 (checklist 6 bước)](14-PHIEN-BAN-DON-GIAN-HOA.md) → `API.md` → `07` (ma trận RBAC) |
| **Viết báo cáo** | `12` trước tiên, rồi lấy nội dung từ `01`, `02`, `03`, `DATA-SCHEMA.md` |
| **Quản lý tiến độ** | `09` → `13` |

---

## 3. Quy ước ký hiệu

| Ký hiệu | Ý nghĩa | Định nghĩa ở |
|---------|---------|--------------|
| `FR-xx` | Yêu cầu chức năng | `02` mục 3 |
| `NFR-xx` | Yêu cầu phi chức năng | `02` mục 4 |
| `UC-xx` | Ca sử dụng | `02` mục 5 |
| `BR-xx` | Quy tắc nghiệp vụ | `03` mục 3 |
| `SCR-xx` | Màn hình giao diện | `08` mục 5 |
| `TC-xx` | Ca kiểm thử | `11` mục 4 |
| ⭐ | Ba nghiệp vụ bổ sung 12/09/2026 | `PRD.md` §2.9 |
| 🆕 | Đăng ký theo phòng + nhu yếu phẩm, 13/09/2026 | `PRD.md` §2.10 |

**Ưu tiên:** `M` Must (bắt buộc v1) · `S` Should · `C` Could · `W` Won't

---

## 4. Quy ước kỹ thuật đã chốt

| Hạng mục | Quy ước | Chi tiết |
|---|---|---|
| Giá trị enum | **chữ thường** — `active`, `admin`, `available` | `DATA-SCHEMA.md` §1 |
| Envelope API | `{ code, message, data }` | `API.md` §1.1 |
| Phân trang | `data: { items, total, page, limit }` | `API.md` §1.2 |
| Base URL | `/api` | `API.md` |
| Xác thực | 1 JWT hạn 7 ngày, không refresh token | `02` FR-08 |
| Chống tranh chấp giường | Hệ thống **tự gán** giường trống số nhỏ nhất bằng **một** lệnh `findOneAndUpdate` có điều kiện — không ai chọn giường, không đọc-rồi-ghi | `ARCHITECTURE.md` §3.5 · `03` mục 4.1 |
| Giao diện & comment | Tiếng Việt | `10` mục 2.1 |
| Tên nhánh & commit | Tiếng Anh | `10` mục 1.2, 1.3 |
| Tiền tệ | Số nguyên VND, không dùng số thực | `DATA-SCHEMA.md` §1 |

---

## 5. Trạng thái dự án

| Hạng mục | Trạng thái |
|----------|-----------|
| Tài liệu | ✅ v2.1 — đăng ký theo phòng, nhu yếu phẩm, ưu tiên máy tính |
| Thiết kế giao diện | ✅ 21 màn hình trên Stitch (bản máy tính cho quản trị + bản điện thoại cho cổng SV); bản máy tính cổng SV đang làm |
| Frontend — khung nền | ✅ Chạy được: đăng nhập, layout, routing, phân quyền, dữ liệu giả đủ 10 module, module Sinh viên mẫu, `DataTable`, đổi mật khẩu |
| Frontend — thư viện | ✅ antd 6.6.3, react-router-dom 7.18.3, axios, dayjs, recharts |
| Frontend — nối API thật | ⏳ Đang chạy chế độ dữ liệu giả (`VITE_USE_MOCK=true`) |
| Backend | ❌ Repo `BE_QuanLyKTX` chưa tạo — xem `13` mục 3.3 |
| MongoDB | ❌ Chưa thiết lập — xem `13` mục 3.2 (khuyến nghị dùng Atlas, không cần cài gì) |
| Deploy | ❌ Chưa có — quy trình đầy đủ ở `13` mục 4.2 (Atlas + Render + Vercel, đều miễn phí) |

**Việc tiếp theo:**
1. Tạo cụm MongoDB Atlas (`13` mục 3.2) — cả nhóm dùng chung một cụm.
2. Tạo repo `BE_QuanLyKTX` và dựng cấu trúc thư mục (`13` mục 3.3).
3. Backend: làm trọn module `students` (`14` mục 15), rồi `rooms` + `residencies` — chỗ khó nhất là `claimBedInRoom` và `applicationService.approve` (`14` mục 4.6).
4. Frontend: hai bạn nhận màn hình theo `09` mục 1.4 và code song song trên dữ liệu giả.

> 📖 **Tài liệu này dùng chung cho cả hai repo.** Người làm backend đọc trực tiếp tại đây, **không sao chép sang repo BE** — hai bản sẽ lệch nhau chỉ sau vài ngày.

---

## 6. Quy tắc cập nhật tài liệu

1. Thay đổi **phạm vi** (thêm/bớt chức năng) → sửa `PRD.md` **trước**, rồi mới sửa `02`.
2. Thay đổi **API** → sửa `API.md` **trước khi code**, báo cho cả FE và BE trong nhóm chat.
3. Thay đổi **schema** → sửa `DATA-SCHEMA.md` cùng lúc với code.
4. Sửa tài liệu đi kèm trong Pull Request của tính năng, không tách PR riêng.
5. Thay đổi lớn ghi vào bảng lịch sử phiên bản ở cuối mỗi tài liệu.

---

## 7. Lịch sử phiên bản bộ tài liệu

| Phiên bản | Ngày | Nội dung |
|-----------|------|----------|
| v1.0 | 11/09/2026 | Khởi tạo 15 tài liệu tiếng Việt (PostgreSQL + Prisma, kiến trúc theo tầng) |
| v1.1 | 12/09/2026 | Rà soát chéo: sửa 10 lỗi nhất quán, 11 vấn đề nghiệp vụ |
| v1.2 | 12/09/2026 | Áp dụng phiên bản đơn giản hóa (Bậc A + Bậc B) cho nhóm mới bắt đầu |
| **v2.1** | **13/09/2026** | **Đăng ký theo phòng, không theo giường** (`PRD.md` §2.10). Thêm `RoomType`, `Application`, `SupplyItem`, `SupplyOrder` (16 collection); hệ thống tự gán giường khi duyệt đơn; hợp đồng bỏ `pending`; module nhu yếu phẩm. `08` viết lại thành 31 màn hình ưu tiên máy tính theo bản Stitch. **87 FR · 81 BR · 111 TC.** Nhân đợt này sửa loạt mẫu code và tham chiếu hỏng sẵn có ở `07`, `10`, `13`, `14` (cú pháp Prisma sót lại, envelope sai, so sánh ObjectId, mã test trỏ sai). |
| v2.0 | 12/09/2026 | **Hợp nhất với bộ `PRD`/`ARCHITECTURE`/`API`/`DATA-SCHEMA`.** Đổi sang **MongoDB + Mongoose**, kiến trúc **theo tính năng**, envelope `{code,message,data}`, enum chữ thường, thêm thực thể `Residency`. Xóa `04`/`05`/`06` (đã bị thay thế). Giữ lại 3 nghiệp vụ từ bộ cũ: giới tính phòng, chỉ số điện nước, quyết toán tiền cọc |
