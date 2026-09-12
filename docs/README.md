# Bộ tài liệu dự án: HỆ THỐNG WEB QUẢN LÝ KÝ TÚC XÁ (DMS - Dormitory Management System)

> Mã dự án: **DMS-KTX**
> Phiên bản tài liệu: **v1.0**
> Cập nhật: 2026-09-11
> Trạng thái: Baseline cho Sprint 0 (khởi động dự án)

---

## 1. Mục đích bộ tài liệu

Bộ tài liệu này là **nguồn sự thật duy nhất (single source of truth)** cho cả team Frontend (React) và Backend (Node.js) trong suốt vòng đời dự án. Mọi thành viên phải đọc tài liệu 01 → 03 trước khi bắt đầu code, và tra cứu 04 → 07 trong quá trình implement.

Tài liệu cũng đóng vai trò là **khung để viết báo cáo đồ án** (xem `12-KHUNG-BAO-CAO.md` để biết cách map từng tài liệu vào từng chương báo cáo).

---

## 2. Danh mục tài liệu

| # | Tài liệu | Nội dung | Đối tượng đọc chính |
|---|----------|----------|---------------------|
| 01 | [Tổng quan dự án](01-TONG-QUAN-DU-AN.md) | Bối cảnh, mục tiêu, phạm vi, stakeholder, rủi ro, tiêu chí thành công | Cả team + GVHD |
| 02 | [Đặc tả yêu cầu (SRS)](02-DAC-TA-YEU-CAU.md) | Tác nhân, yêu cầu chức năng (FR), phi chức năng (NFR), use case chi tiết | Cả team |
| 03 | [Phân tích nghiệp vụ](03-PHAN-TICH-NGHIEP-VU.md) | Quy tắc nghiệp vụ (BR), máy trạng thái, luồng quy trình | BE + FE + BA |
| 04 | [Thiết kế cơ sở dữ liệu](04-THIET-KE-CSDL.md) | ERD, từ điển dữ liệu, enum, ràng buộc, index, dữ liệu mẫu | Backend |
| 05 | [Kiến trúc hệ thống](05-KIEN-TRUC-HE-THONG.md) | Sơ đồ kiến trúc, tech stack, cấu trúc thư mục FE/BE, biến môi trường | Cả team |
| 06 | [Đặc tả API](06-DAC-TA-API.md) | Chuẩn REST, mã lỗi, danh sách endpoint đầy đủ, request/response mẫu | FE + BE (hợp đồng) |
| 07 | [Phân quyền & bảo mật](07-PHAN-QUYEN-BAO-MAT.md) | Ma trận RBAC, luồng JWT, quy tắc bảo mật | Cả team |
| 08 | [Thiết kế giao diện (UI/UX)](08-THIET-KE-GIAO-DIEN.md) | Sitemap, danh sách màn hình, wireframe mô tả, design system | Frontend |
| 09 | [Kế hoạch & phân công](09-KE-HOACH-PHAN-CONG.md) | WBS, sprint backlog, phân công, RACI, lịch trình | Cả team + GVHD |
| 10 | [Quy trình làm việc](10-QUY-TRINH-LAM-VIEC.md) | Git flow, quy ước code, quy ước commit, Definition of Done | Cả team |
| 11 | [Kế hoạch kiểm thử](11-KE-HOACH-KIEM-THU.md) | Chiến lược test, test case theo chức năng, checklist UAT | QA + cả team |
| 12 | [Khung báo cáo đồ án](12-KHUNG-BAO-CAO.md) | Mục lục báo cáo, map tài liệu → chương, checklist nộp bài | Người viết báo cáo |
| 13 | [Lộ trình triển khai A→Z](13-LO-TRINH-TRIEN-KHAI.md) | Timeline 12 tuần theo ngày, runbook cài đặt → code → deploy → bàn giao | Cả team + GVHD |
| 14 | [⭐ Phiên bản đơn giản hóa](14-PHIEN-BAN-DON-GIAN-HOA.md) | **31 thay đổi kỹ thuật giúp dễ làm hơn, giữ nguyên 100% chức năng** (Bậc A + Bậc B cho nhóm mới bắt đầu). Kèm **lộ trình tự học** và **mẫu code một module hoàn chỉnh để nhân bản**. Ghi đè các lựa chọn kỹ thuật trong 02/03/04/05/06/09/11/13 | **Cả team — đọc trước khi code** |

---

> ⚠️ **QUAN TRỌNG:** dự án đang chạy theo **phiên bản đơn giản hóa, Bậc B** (mức dành cho nhóm mới bắt đầu). Khi tài liệu 14 và các tài liệu khác nói khác nhau về **cách cài đặt**, lấy theo tài liệu 14. Về **chức năng và nghiệp vụ**, `02` và `03` vẫn là chuẩn.
>
> 🚀 **Bắt đầu code từ đâu?** Đọc `14` mục 15 — mẫu code trọn vẹn một module. Làm module "Quản lý sinh viên" trước, chạy được rồi mới nhân bản cho 8 module còn lại.

---

## 3. Thứ tự đọc đề xuất

**Thành viên mới vào dự án (30 phút):**
`01` → `02` (mục 3, 4) → **`14` mục 2, 13, 15** → `13` (mục 3: cài môi trường)

**Chưa từng làm web bao giờ:** bắt đầu bằng **`14` mục 14 (lộ trình tự học)**, học xong mới đọc tiếp.

**Lập trình viên Backend:**
**`14` mục 15.1–15.2 (mẫu code)** → `14` mục 4 → `02` → `03` → `04` → `06` → `07`

**Lập trình viên Frontend:**
**`14` mục 15.3–15.5 (mẫu code)** → `14` mục 4.1–4.4 → `02` → `06` → `07` (ma trận RBAC) → `08`

**Người viết báo cáo:**
`12` trước tiên, sau đó lấy nội dung từ `01`, `02`, `03`, `04`, `08`.

---

## 4. Quy ước ký hiệu dùng chung

| Ký hiệu | Ý nghĩa | Ví dụ |
|---------|---------|-------|
| `FR-xx` | Functional Requirement – Yêu cầu chức năng | FR-12 |
| `NFR-xx` | Non-Functional Requirement – Yêu cầu phi chức năng | NFR-03 |
| `UC-xx` | Use Case – Ca sử dụng | UC-07 |
| `BR-xx` | Business Rule – Quy tắc nghiệp vụ | BR-15 |
| `SCR-xx` | Screen – Màn hình giao diện | SCR-21 |
| `TC-xx` | Test Case – Ca kiểm thử | TC-33 |

**Mức độ ưu tiên:** `M` = Must have (bắt buộc v1) · `S` = Should have (nên có) · `C` = Could have (nếu còn thời gian) · `W` = Won't have (ngoài phạm vi v1)

---

## 5. Quy tắc cập nhật tài liệu

1. Mọi thay đổi yêu cầu (thêm/bớt chức năng) **phải** cập nhật `02-DAC-TA-YEU-CAU.md` trước khi code.
2. Mọi thay đổi schema DB **phải** cập nhật `04-THIET-KE-CSDL.md` + tạo migration tương ứng.
3. Mọi thay đổi API **phải** cập nhật `06-DAC-TA-API.md` và thông báo cho phía còn lại (FE/BE) trong nhóm chat.
4. Sửa tài liệu đi kèm trong Pull Request của tính năng, không sửa riêng lẻ.
5. Ghi lại thay đổi lớn vào bảng lịch sử phiên bản ở cuối mỗi tài liệu.

---

## 6. Trạng thái dự án hiện tại

| Hạng mục | Trạng thái |
|----------|-----------|
| Tài liệu đặc tả | ✅ Hoàn thành, đã rà soát chéo (v1.1) |
| Phiên bản kỹ thuật áp dụng | ✅ **Bậc B — mức nhẹ nhàng** (xem tài liệu 14) |
| Khối lượng ước tính | ~120 ngày công / 12 tuần |
| Repo Frontend | ⚠️ Mới khởi tạo (Vite + React 19, chưa có cấu trúc) |
| Repo Backend | ❌ Chưa khởi tạo |
| Cơ sở dữ liệu | ❌ Chưa thiết lập |
| CI/CD | ❌ Chưa có |

**Việc cần làm ngay (Sprint 0):** xem `09-KE-HOACH-PHAN-CONG.md`, mục "Sprint 0".
