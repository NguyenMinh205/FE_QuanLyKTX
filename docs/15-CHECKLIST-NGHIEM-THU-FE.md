# 15 – CHECKLIST NGHIỆM THU FRONTEND

**Hệ thống:** DMS – Hệ thống quản lý ký túc xá
**Người dùng tài liệu:** người nghiệm thu từng màn hình frontend (FE Lead, BA, thành viên nhóm)
**Cập nhật:** mỗi màn hình làm xong được thêm một mục vào tài liệu này, cùng nhánh với code của màn đó.

> Mỗi dòng `- [ ]` là một bước: **làm gì** → **kết quả đúng phải thấy**. Làm đúng thứ tự từ trên xuống, vì các bước sau dùng dữ liệu bước trước để lại.
> Đạt thì đánh dấu `- [x]`. Sai thì giữ `- [ ]`, ghi lỗi vào mục **Lỗi phát hiện** cuối màn đó theo **Mẫu ghi lỗi** ở cuối tài liệu.

---

## 0. Bảng theo dõi

| # | Màn hình | Mã | Nhánh | Chạy với | Trạng thái |
|---|----------|----|-------|----------|------------|
| 1 | Đăng nhập · Đổi mật khẩu · Không có quyền | SCR-01, 03, 04 | `feature/login-and-room-types` | Dữ liệu giả **và** backend thật | ⬜ Chưa test |
| 2 | Loại phòng | SCR-22 | `feature/login-and-room-types` | Dữ liệu giả | ⬜ Chưa test |
| 3 | Quản lý phòng — sơ đồ tầng | SCR-23 | `feature/room-management` | Dữ liệu giả | ⬜ Chưa test |
| 4 | Duyệt đơn đăng ký | SCR-31 | `feature/application-review` | Dữ liệu giả | ⬜ Chưa test |
| 5 | Cổng SV — Đăng ký chỗ ở 3 bước (+ header cổng SV) | SCR-62 | `feature/student-room-application` | Dữ liệu giả | ⬜ Chưa test |
| 6 | Cổng SV — Trang chủ theo tình trạng lưu trú | SCR-61 | `feature/student-home` | Dữ liệu giả | ⬜ Chưa test |
| 7 | Quản lý hợp đồng (tab + drawer + chấm dứt) | SCR-32 | `feature/contract-management` | Dữ liệu giả | ⬜ Chưa test |
| 8 | Yêu cầu gia hạn / trả phòng + quyết toán cọc | SCR-41 | `feature/request-review` | Dữ liệu giả | ⬜ Chưa test |
| 9 | Cổng SV — Yêu cầu của tôi | SCR-66 | `feature/student-requests` | Dữ liệu giả | ⬜ Chưa test |
| 10 | Dashboard | SCR-10 | `feature/admin-dashboard` | Dữ liệu giả **và** backend thật | ⬜ Chưa test |
| 11 | Quản lý tài khoản (+ đặt lại mật khẩu) | SCR-81 | `feature/user-accounts` | Dữ liệu giả | ⬜ Chưa test |
| 12 | Tòa nhà | SCR-21 | `feature/building-management` | Dữ liệu giả **và** backend thật (chỉ xem) | ⬜ Chưa test |
| 13 | Danh mục loại phí | SCR-82 | `feature/fee-type-catalog` | Dữ liệu giả **và** backend thật (chỉ xem) | ⬜ Chưa test |
| 14 | Nhập chỉ số điện nước | SCR-51 | `feature/utility-readings` | Dữ liệu giả **và** backend thật (chỉ xem) | ⬜ Chưa test |
| 15 | Hóa đơn + lập hàng loạt + hóa đơn lẻ | SCR-52, SCR-53 | `feature/invoice-management` | Dữ liệu giả **và** backend thật (chỉ xem) | ⬜ Chưa test |
| 16 | Chi tiết hóa đơn + ghi nhận thanh toán | SCR-54, SCR-55 | `feature/invoice-detail-payment` | Dữ liệu giả **và** backend thật (chỉ xem) | ⬜ Chưa test |
| 17 | Lịch sử thanh toán | SCR-56 | `feature/payment-history` | Dữ liệu giả **và** backend thật (chỉ xem) | ⬜ Chưa test |
| 18 | Nhu yếu phẩm (đơn hàng + danh mục) | SCR-71 | `feature/supplies-management` | Dữ liệu giả (backend chưa có API) | ⬜ Chưa test |
| 19 | Cổng SV: Chỗ ở & hợp đồng + Hồ sơ | SCR-63, SCR-69 | `feature/portal-residence-profile` | Dữ liệu giả (backend chưa có API cổng SV) | ⬜ Chưa test |
| 20 | Cổng SV: Hóa đơn + Kết quả thanh toán | SCR-64, SCR-65 | `feature/portal-invoices-payment` | Dữ liệu giả (backend chưa có API cổng SV) | ⬜ Chưa test |
| 21 | Cổng SV: Mua sắm + Đơn hàng của tôi | SCR-67, SCR-68 | `feature/portal-shop-orders` | Dữ liệu giả (backend chưa có API cổng SV) | ⬜ Chưa test |
| 22 | Đăng ký tài khoản sinh viên | SCR-02 | `feature/student-register` | Dữ liệu giả (backend đăng ký sai nghiệp vụ) | ⬜ Chưa test |

Trạng thái: ⬜ Chưa test · ✅ Đạt · ❌ Có lỗi (xem mục Lỗi phát hiện của màn đó).

> **Vì sao phần lớn chạy với dữ liệu giả?** Backend hiện làm theo API v1.1, chưa có loại phòng, giường tự sinh, đơn đăng ký (API v1.2). Khi backend có đủ, chạy lại đúng checklist này ở chế độ backend thật.

---

## 1. Chuẩn bị (làm một lần)

### 1.1. Chạy với dữ liệu giả

- [ ] Mở `.env` ở thư mục gốc FE, đặt `VITE_USE_MOCK=true` → lưu file.
- [ ] Chạy `npm install` (lần đầu) rồi `npm run dev` → terminal hiện `Local: http://localhost:5173/`.
- [ ] Mở `http://localhost:5173` bằng Chrome → F12 → tab **Console** hiện dòng vàng `[DỮ LIỆU GIẢ] Đang dùng src/mocks`.

> ⚠️ Dữ liệu giả nằm trong bộ nhớ trình duyệt. **Nhấn F5 là toàn bộ dữ liệu về như ban đầu.** Các bước có con số cụ thể (tên sinh viên, số phòng) đều tính từ trạng thái vừa F5.

**Tài khoản dữ liệu giả**

| Email | Mật khẩu | Vai trò | Dùng để |
|-------|----------|---------|---------|
| `admin@dorm.local` | `Admin@123` | Quản trị | Thấy mọi nút |
| `staff@dorm.local` | `Staff@123` | Nhân viên | Thao tác nghiệp vụ |
| `viewer@dorm.local` | `Viewer@123` | Người xem | Kiểm tra chỉ xem, không có nút |
| `sv001@dorm.local` | `Student@123` | Sinh viên (đang ở) | Kiểm tra bị chặn khỏi khu quản trị, không đăng ký thêm được |
| `sv002@dorm.local` | `Student@123` | Sinh viên nữ chưa có chỗ, chưa có đơn | Đăng ký chỗ ở (SCR-62), trang chủ "chưa có chỗ" |
| `sv004@dorm.local` | `Student@123` | Sinh viên đang ở phòng CLC, hợp đồng còn 20 ngày | Trang chủ — thẻ sắp hết hạn |
| `sv005@dorm.local` | `Student@123` | Sinh viên có đơn gần nhất bị từ chối | Trang chủ — thẻ đơn bị từ chối |
| `sv006@dorm.local` | `Student@123` | Sinh viên có đơn chờ duyệt (phòng B101 đã đầy) | Trang chủ — thẻ đơn chờ duyệt, hủy đơn |
| `doimk@dorm.local` | `Tam@12345` | Nhân viên | Mật khẩu tạm — bị buộc đổi mật khẩu |

### 1.2. Chạy với backend thật (chỉ màn 1)

- [ ] Backend chạy ở `http://localhost:5000` (thư mục `D:\BE_QLKTX`, lệnh `npm run dev`, terminal không báo lỗi kết nối MongoDB).
- [ ] `.env` của FE: `VITE_USE_MOCK=false`, `VITE_API_BASE_URL=http://localhost:5000/api` → **tắt và chạy lại** `npm run dev` (Vite chỉ đọc `.env` lúc khởi động).
- [ ] Console **không** còn dòng `[DỮ LIỆU GIẢ]`.

Tài khoản backend thật: `admin@dorm.local / Admin@123`, `staff1@dorm.local / Staff@123`, `viewer@dorm.local / Viewer@123`, `student.nam@dorm.local / Student@123`.

### 1.3. Kiểm tra chung — áp dụng cho MỌI màn

- [ ] F12 → **Console** trong suốt quá trình test: không có dòng đỏ, không có cảnh báo vàng chứa chữ `antd` hoặc `Warning:`.
- [ ] Cửa sổ rộng (≥ 1440px): bố cục giống ảnh thiết kế trong `design/` (khác biệt đã chấp nhận được liệt kê trong từng màn).
- [ ] Thu hẹp cửa sổ còn khoảng 900px (F12 → biểu tượng điện thoại/máy tính bảng → Responsive, gõ 900): không có thanh cuộn ngang ở cả trang.
- [ ] Đăng nhập `viewer@dorm.local`: xem được dữ liệu, không thấy nút thêm / sửa / duyệt nào.

---

## 2. Đăng nhập · Đổi mật khẩu · Không có quyền (SCR-01, 03, 04)

**Nhánh:** `feature/login-and-room-types` · **Chạy:** dữ liệu giả, sau đó lặp lại mục 2.1–2.3 với backend thật.

### 2.1. Đăng nhập

- [ ] Vào `/login` → bố cục 2 nửa: trái nền xanh có logo và dòng "Phiên bản v1.0", phải là form. Ô "Ghi nhớ đăng nhập" đã tích sẵn.
- [ ] Bấm **Đăng nhập** khi để trống → dưới ô Email hiện "Vui lòng nhập email", dưới ô Mật khẩu hiện "Vui lòng nhập mật khẩu".
- [ ] Email gõ `abc` → "Email không đúng định dạng".
- [ ] `admin@dorm.local` + mật khẩu sai → khung đỏ "Email hoặc mật khẩu không chính xác", vẫn ở trang đăng nhập.
- [ ] F12 → **Network** → bấm request `login` → **Response**: `code` là `INVALID_CREDENTIALS`, mã HTTP 401.
- [ ] Đăng nhập đúng `admin@dorm.local / Admin@123` → chuyển tới `/admin/dashboard`, góc phải trên hiện tên người dùng.
- [ ] F12 → **Application** → **Local Storage** → `http://localhost:5173` có hai khóa `token` và `user` (vì đã tích "Ghi nhớ").
- [ ] Đóng tab, mở lại `http://localhost:5173` → vẫn đăng nhập, không phải nhập lại.
- [ ] Đăng xuất → đăng nhập lại nhưng **bỏ tích** "Ghi nhớ" → token nằm ở **Session Storage**, không ở Local Storage.
- [ ] Đang đăng nhập mà gõ `/login` trên thanh địa chỉ → tự quay về trang chủ đúng vai trò.
- [ ] Bấm "Cần trợ giúp?" → hiện khung thông tin hỗ trợ (phòng quản sinh, hotline).

### 2.2. Chặn theo vai trò

- [ ] Đăng nhập `sv001@dorm.local` → vào `/portal/home`.
- [ ] Gõ `/admin/rooms` → trang **403 Không có quyền**, hiện tài khoản đang dùng, có nút "Về trang chủ" và "Đăng nhập tài khoản khác".
- [ ] Bấm "Đăng nhập tài khoản khác" → về `/login`, đã đăng xuất.
- [ ] Chưa đăng nhập, gõ `/admin/rooms` → bị đưa về `/login`; đăng nhập admin xong → **quay lại đúng** `/admin/rooms`.

### 2.3. Đổi mật khẩu

- [ ] Đăng nhập `doimk@dorm.local / Tam@12345` → bị đưa thẳng tới trang **Đổi mật khẩu**, có khung vàng "Bạn đang dùng mật khẩu tạm".
- [ ] Bấm menu hoặc gõ `/admin/dashboard` → vẫn bị giữ ở trang đổi mật khẩu.
- [ ] Mật khẩu mới `abc` → "Mật khẩu tối thiểu 8 ký tự"; `abcdefgh` → "Mật khẩu phải có cả chữ và số"; ô nhập lại khác → báo không khớp.
- [ ] Mật khẩu hiện tại sai → lỗi hiện **ngay dưới ô Mật khẩu hiện tại** (không phải thông báo góc màn hình).
- [ ] Nhập đúng `Tam@12345` → mới `Moi@12345` → "Đổi mật khẩu thành công", vào được dashboard.
- [ ] Network → request đổi mật khẩu → **Payload** có đúng 2 trường `oldPassword`, `newPassword`.

### 2.4. Phiên đăng nhập hỏng

- [ ] Đăng nhập admin → F12 → Application → Local Storage → sửa giá trị khóa `user`, đổi `"role":"admin"` thành `"role":"ADMIN"` → F5 → bị đưa về `/login` (không kẹt ở trang 403).

**Lỗi phát hiện:** _(chưa có)_

---

## 3. Loại phòng (SCR-22)

**Nhánh:** `feature/login-and-room-types` · **Đường dẫn:** Cơ sở vật chất → Loại phòng · **Chạy:** dữ liệu giả, tài khoản `admin@dorm.local`.

- [ ] Lưới thẻ 3 cột, mỗi thẻ có: tag hạng, tên (VD "Tiêu chuẩn · 6 người"), giá `/người/tháng`, tiện nghi, số phòng và số chỗ trống. Loại không còn chỗ ghi "hết chỗ" màu đỏ (nếu có).
- [ ] Segmented "Tất cả · Tiêu chuẩn · Chất lượng cao" → lọc đúng hạng.
- [ ] Bấm **Sửa** trên một thẻ đang có phòng dùng → drawer "Sửa loại phòng": ô **Hạng phòng** và **Sức chứa** bị khóa, rê chuột thấy "Đang có N phòng dùng loại này — tạo loại mới nếu cần đổi".
- [ ] Trong drawer có khung vàng "Lưu ý quan trọng — Đổi giá hoặc tiền cọc không ảnh hưởng hợp đồng đã ký".
- [ ] Đổi giá → **Lưu thay đổi** → "Cập nhật loại phòng thành công", thẻ hiện giá mới.
- [ ] **Thêm loại phòng** trùng hạng + sức chứa đã có (VD Tiêu chuẩn · 6) → báo "Loại phòng này đã tồn tại".
- [ ] Thêm loại mới (VD Chất lượng cao · 8) → thẻ mới xuất hiện.
- [ ] Đăng nhập `staff@dorm.local` hoặc `viewer@dorm.local` → không có nút "Thêm loại phòng", không có link "Sửa".

**Lỗi phát hiện:** _(chưa có)_

---

## 4. Quản lý phòng — sơ đồ tầng (SCR-23)

**Nhánh:** `feature/room-management` · **Đường dẫn:** Cơ sở vật chất → Phòng · **Chạy:** dữ liệu giả, tài khoản `admin@dorm.local`, F5 trước khi bắt đầu.

**Khác thiết kế đã chấp nhận:** không có nút "Xếp chỗ" (giường do hệ thống tự gán khi duyệt đơn — BR-38), không có "Sơ đồ 3D", bảo trì chỉ có ghi chú (không có mã phiếu), tiện nghi không kèm số lượng, không có ô điện nước.

### 4.1. Sơ đồ

- [ ] Mặc định chọn **Tòa A**. Các tầng xếp **Tầng 3 → 2 → 1** từ trên xuống; đầu mỗi tầng ghi "N phòng (x/y giường đang sử dụng)" và "Tỷ lệ: z%".
- [ ] 4 chip chú giải: Còn chỗ · Sắp đầy · Đã đầy · Có giường bảo trì.
- [ ] Đối chiếu số liệu Tòa A: **A101** "Đã đầy" 6/6 nền xám · **A102** nền đỏ "Hết chỗ", dòng dưới "1 bảo trì", 5/6 · **A206** "Còn 1 chỗ" nền vàng 7/8 · **A310** "Còn 4 chỗ" 0/4.
- [ ] Không ô nào bị vỡ chữ xuống dòng lung tung (đặc biệt A102).
- [ ] Rê chuột lên một ô → tooltip tên loại phòng + giá.

### 4.2. Khung chi tiết + bảo trì giường

- [ ] Bấm **A309** → khung phải "Phòng A309 · Tầng 3 · Tòa A", tag hạng / loại / giới tính, đơn giá, danh sách giường, "Cấp sẵn trong phòng".
- [ ] Giường có người: tên, mã SV · lớp, **không có nút**.
- [ ] Giường trống (xanh): dòng "Sẵn sàng — tự gán khi duyệt đơn đăng ký" + nút **Bảo trì**.
- [ ] Bấm **Bảo trì** → hộp thoại có ô ghi chú (đếm tối đa 200 ký tự) → gõ "Khung giường gãy" → **Chuyển bảo trì** → giường chuyển đỏ, hiện ghi chú; ô A309 trên sơ đồ **đổi sang đỏ ngay** không cần F5.
- [ ] Bấm **Mở lại** → hộp xác nhận → **Mở lại** → giường về xanh, ô A309 về màu cũ.
- [ ] Network → request `beds/.../status` → Payload `{ "status": "maintenance", "note": "Khung giường gãy" }`.

### 4.3. Bộ lọc + danh sách

- [ ] Tình trạng = **Hết chỗ** → chỉ còn ô "Đã đầy" hoặc "Hết chỗ" (có cả A102).
- [ ] Xóa lọc, Tầng = **Tầng 2** → chỉ còn khung Tầng 2.
- [ ] Đổi Tòa nhà sang **Tòa B** khi đang mở chi tiết → khung chi tiết tự đóng.
- [ ] Bấm **Danh sách** → bảng có cột Phòng, Tầng, Loại phòng, Giới tính, Đang ở, Chỗ trống, Bảo trì, Tình trạng. Bấm một hàng → mở chi tiết.

### 4.4. Thêm / sửa phòng

- [ ] **Thêm phòng** → form không có ô giá, không có ô sức chứa. Chọn loại "Tiêu chuẩn · 6 người" → khung xanh "Hệ thống sẽ tự tạo 6 giường cho phòng này".
- [ ] Số phòng `399`, tầng 3, giới tính Nam → **Thêm phòng** → thông báo "…với 6 giường", ô A399 xuất hiện ở Tầng 3.
- [ ] Thêm lại số `399` cùng tòa → lỗi đỏ **ngay dưới ô Số phòng** "…đã tồn tại".
- [ ] Số phòng `3@9` → "Chỉ gồm chữ, số, dấu -".
- [ ] Mở **A101** → **Sửa phòng** → ô Loại phòng và Giới tính **bị khóa**, dòng "Phòng đang có 6 người ở — không đổi được".
- [ ] Mở **A310** (0 người) → Sửa → đổi loại phòng → hiện cảnh báo vàng "Đổi loại phòng sẽ tạo lại N giường…".

### 4.5. Quyền + màn hình hẹp

- [ ] `viewer@dorm.local` → không có "Thêm phòng", "Bảo trì", "Mở lại", "Sửa phòng"; vẫn mở được chi tiết.
- [ ] Cửa sổ < 1200px → bấm một phòng → chi tiết mở dạng **ngăn kéo trượt từ phải** thay vì cột bên cạnh.

**Lỗi phát hiện:** _(chưa có)_

---

## 5. Duyệt đơn đăng ký (SCR-31)

**Nhánh:** `feature/application-review` · **Đường dẫn:** Lưu trú & hợp đồng → Duyệt đơn đăng ký · **Chạy:** dữ liệu giả, tài khoản `staff@dorm.local`, **F5 trước khi bắt đầu**.

**Khác thiết kế đã chấp nhận:** không có ảnh chân dung (dùng chữ viết tắt tên), không có email / quê quán / diện ưu tiên (API không trả); không có "Lưu nháp", "Lịch sử xét duyệt", "Học kỳ"; sơ đồ giường chỉ để xem (không chọn giường — BR-38); chưa hiện hạn thanh toán của hóa đơn (API chưa trả).

**Dữ liệu giả sau F5 — tab Chờ duyệt (6 đơn, đơn cũ nhất lên đầu):**

| # | Sinh viên | Loại · phòng nguyện vọng | Tình huống để test |
|---|-----------|--------------------------|--------------------|
| 1 | Phạm Phương Linh · SV2026076 | Tiêu chuẩn · 6 · B101 | Phòng nguyện vọng **đã đầy từ trước** |
| 2 | Vũ Minh Châu · SV2026078 | Chất lượng cao · 4 · B205 | Còn 1 chỗ nhưng lúc bấm duyệt **một cán bộ khác vừa lấy giường cuối** → `ROOM_FULL` |
| 3 | Bùi Ngọc Ánh · SV2026080 | Chất lượng cao · 4 · B205 | Đơn "cán bộ khác" duyệt — sẽ tự biến mất ở bước 5.3 |
| 4–6 | Đặng Quốc Bảo · Bùi Minh Châu · Nguyễn Văn An | … | Đơn bình thường, dùng test từ chối / tìm kiếm |

> Tình huống 2 là **giả lập riêng của dữ liệu giả** để test được lỗi tranh chỗ khi chỉ có một người dùng. Phải duyệt đơn **Vũ Minh Châu trước** đơn Bùi Ngọc Ánh thì mới thấy lỗi.

### 5.1. Hàng chờ

- [ ] Tab **Chờ duyệt** có số đỏ `6`; "Đã duyệt" và "Đã từ chối" có số xám bên cạnh.
- [ ] Tiêu đề danh sách "CHỜ DUYỆT (6)", bên phải "● 1 đơn hết chỗ".
- [ ] Đơn đầu tiên (Phạm Phương Linh, nộp 28/10/2026) **tự mở**, viền trái đỏ, tag "Hết chỗ", chữ "Phòng B101" gạch ngang đỏ.
- [ ] Khung phải: **Thông tin sinh viên** (họ tên, MSSV, giới tính, lớp, SĐT, mã đơn, ngày nộp, thời gian ở, ghi chú "Em muốn ở cùng phòng với chị khóa trên"), tag xanh "Không có công nợ".
- [ ] Không có nút "Xếp chỗ" hay nút chọn giường nào.

### 5.2. Phòng nguyện vọng đã đầy → chọn phòng khác

- [ ] Thẻ **Phòng xếp cho sinh viên** có khung vàng "Phòng B101 sinh viên chọn đã hết chỗ — Còn 1 phòng cùng loại, cùng giới tính có chỗ trống".
- [ ] Ô **Chọn phòng bố trí** viền đỏ, ghi "Phòng B101 — đã đầy · nguyện vọng". Thanh dưới cùng: chữ đỏ "Chưa có phòng còn chỗ…", nút **Duyệt và xếp phòng** bị mờ (không bấm được).
- [ ] Mở ô chọn phòng → dòng B101 mờ không chọn được; các dòng còn lại đều dạng "Phòng B102 — Tòa B, tầng 1 — còn 1 chỗ" và **chỉ là phòng nữ, cùng loại Tiêu chuẩn · 6**.
- [ ] Chọn B102 → hiện **Sơ đồ giường Phòng B102**: giường có người màu xám kèm tên, giường trống số nhỏ nhất viền xanh có ⭐ "Dự kiến gán". Bấm vào giường → không có gì xảy ra.
- [ ] Thanh dưới: "Sẽ xếp vào Phòng B102 — dự kiến giường NN", nút duyệt sáng lên.
- [ ] Thẻ **Hóa đơn sẽ tạo khi duyệt**: Tiền cọc 500.000 đ · Tiền phòng tháng đầu 320.000 đ · Tổng cộng 820.000 đ.
- [ ] Bấm **Duyệt và xếp phòng** → hộp xác nhận "Duyệt đơn DK-2026-…?" nêu tên sinh viên + phòng → bấm **Duyệt và xếp phòng**.
- [ ] Góc phải trên hiện thông báo xanh (tự tắt sau ~8 giây): "Đã xếp Phạm Phương Linh vào B102 · Giường NN" — **NN trùng số "dự kiến giường"** ở bước trước; dòng dưới "Hợp đồng HD-2026-… · 2 hóa đơn: 500.000 đ + 320.000 đ".
- [ ] Đơn biến mất khỏi danh sách, tab Chờ duyệt còn `5`, đơn tiếp theo tự mở.
- [ ] Network → request `approve` → Payload có `roomId` (vì đã đổi phòng).

### 5.3. Tranh chỗ — lỗi ROOM_FULL

- [ ] Đơn đang mở là **Vũ Minh Châu**, phòng B205 còn chỗ, nút duyệt sáng. Bấm **Duyệt và xếp phòng** → xác nhận.
- [ ] **Không** có thông báo tự tắt. Trên thẻ phòng hiện **khung đỏ** "Phòng B205 vừa hết chỗ. Vui lòng chọn phòng khác cùng loại" + "Danh sách phòng đã được tải lại…", có dấu × để đóng.
- [ ] Đơn Vũ Minh Châu **vẫn đang mở** (không đóng khung, không nhảy sang đơn khác).
- [ ] Đơn **Bùi Ngọc Ánh biến mất** khỏi danh sách (đã được "cán bộ khác" duyệt), tab Chờ duyệt còn `4`.
- [ ] Ô chọn phòng giờ ghi "Phòng B205 — đã đầy", nút duyệt mờ.
- [ ] Network → request `approve` → mã HTTP **409**, Response `code: "ROOM_FULL"`.
- [ ] Chọn phòng khác cùng loại (**B310**) → khung đỏ tự đóng, nút duyệt sáng → duyệt → thông báo "Đã xếp Vũ Minh Châu vào B310 · Giường 01".

### 5.4. Từ chối

- [ ] Mở một đơn bất kỳ → **Từ chối** → hộp "Từ chối đơn DK-…".
- [ ] Gõ `ngan qua` → **Từ chối đơn** → lỗi "Lý do tối thiểu 10 ký tự", hộp không đóng.
- [ ] Gõ lý do đủ dài (VD "Hồ sơ thiếu giấy xác nhận sinh viên") → đơn biến mất khỏi hàng chờ.
- [ ] Tab **Đã từ chối** → đơn vừa từ chối nằm đầu, khung phải "Kết quả xử lý" tag đỏ, khung "Lý do từ chối" đúng nội dung vừa gõ, **không có nút Duyệt / Từ chối**.
- [ ] Tab **Đã duyệt** → đơn đã duyệt ở 5.2/5.3 nằm đầu; chi tiết có "Phòng được xếp", "Giường", "Hợp đồng HD-2026-…".

### 5.5. Tìm kiếm + lọc

- [ ] Tab Chờ duyệt → gõ mã đơn của đơn đang mở (xem dòng "Mã đơn" ở khung phải) → chỉ còn 1 đơn.
- [ ] Gõ một MSSV, một phần họ tên, hoặc số phòng (VD `103`) → lọc đúng.
- [ ] Chọn loại phòng ở ô bên phải ô tìm kiếm → chỉ còn đơn loại đó. Không có đơn khớp → "Không có đơn phù hợp bộ lọc".

### 5.6. Lập đơn cho sinh viên

- [ ] Bấm **Lập đơn cho sinh viên** (góc phải tiêu đề) → hộp thoại: Sinh viên, Loại phòng, Phòng, Thời gian ở (đã điền sẵn từ hôm nay tới 30/06), Ghi chú.
- [ ] Ô Phòng bị khóa, ghi "Chọn sinh viên và loại phòng trước".
- [ ] Ô Sinh viên gõ `SV2026001` → dòng hiện "… — đang ở A…", **mờ, không chọn được**.
- [ ] Gõ `SV2026089` → chọn → Loại phòng "Tiêu chuẩn · 4 người" → ô Phòng mở, **chỉ có phòng Tòa A** (sinh viên nam), mỗi dòng ghi "còn N chỗ".
- [ ] Chọn phòng → **Lập đơn** → "Đã lập đơn DK-2026-… cho …", đơn mới được mở ngay ở khung phải, hàng chờ tăng 1.
- [ ] Lập đơn lần nữa cho **SV2026089** → lỗi đỏ dưới ô Sinh viên "Sinh viên đã có một đơn đăng ký đang chờ duyệt", hộp không đóng.
- [ ] Mở lại hộp thoại, bấm **Lập đơn** khi chưa chọn gì → ô Sinh viên, Loại phòng, Phòng đều báo lỗi riêng.

### 5.7. Quyền + màn hình hẹp

- [ ] `viewer@dorm.local` → xem được danh sách và chi tiết; **không có** "Lập đơn cho sinh viên", "Duyệt và xếp phòng", "Từ chối"; ô chọn phòng bị khóa.
- [ ] `admin@dorm.local` → có đủ nút như staff.
- [ ] Cửa sổ ~900px → danh sách nằm trên, chi tiết nằm dưới, không có thanh cuộn ngang.

### 5.8. Đã biết, chưa làm

- Số đỏ ở menu trái "Duyệt đơn đăng ký" chỉ cập nhật khi tải lại trang (F5), chưa tự giảm ngay sau khi duyệt.

**Lỗi phát hiện:** _(chưa có)_

---

## 6. Cổng sinh viên — Đăng ký chỗ ở 3 bước (SCR-62)

**Nhánh:** `feature/student-room-application` · **Đường dẫn:** `/portal/apply` (nút "Đăng ký chỗ ở" ở trang chủ sinh viên) · **Chạy:** dữ liệu giả, tài khoản `sv002@dorm.local` (Vũ Ngọc Ánh, nữ, chưa có chỗ, chưa có đơn), **F5 trước khi bắt đầu**.

**Khác thiết kế đã chấp nhận:**
- Không có ảnh phòng, "Hạn nộp hồ sơ", "Tiện ích đi kèm miễn phí", chuông thông báo, phí dịch vụ/VAT — không có dữ liệu trong API.
- **Bỏ "Đang giữ chỗ tạm thời 14:48"** và **"Mã chỗ ở KTX1-B-203-04"** — trái BR-34 (nộp đơn không giữ chỗ) và BR-38 (giường chỉ gán khi duyệt). Thay bằng dòng "Nộp đơn chưa giữ chỗ".
- Bảng phòng ở bước 2 chỉ có phòng **còn chỗ** (API `GET /rooms/available` không trả phòng đầy), nên không có dòng mờ "Đã đầy" như bản vẽ.
- Bước 1 dùng danh sách hàng dọc theo bản vẽ Figma thay cho lưới 3 cột trong docs/08.

> ⚠️ Dữ liệu giả reset khi tải lại trang. Từ bước 6.1 tới 6.6 **chỉ bấm trong ứng dụng**, không F5, không gõ lại địa chỉ.

### 6.1. Header cổng sinh viên + lối vào

- [ ] Đăng nhập `sv002@dorm.local` → header có logo, "KÝ TÚC XÁ · Cổng thông tin sinh viên"; góc phải tên "Vũ Ngọc Ánh", dòng dưới "Chưa có chỗ ở".
- [ ] Menu **Chỗ ở & hợp đồng**, **Mua sắm** và biểu tượng giỏ hàng **mờ, bấm không đi đâu**, rê chuột thấy "Mở sau khi bạn có chỗ ở tại ký túc xá". Trang chủ, Hóa đơn, Yêu cầu vẫn bấm được.
- [ ] Trang chủ có thẻ "Bạn chưa có chỗ ở tại ký túc xá" + nút **Đăng ký chỗ ở** → bấm → vào `/portal/apply`.
- [ ] Đăng nhập `sv001@dorm.local` (đang ở) → header ghi "Phòng A…", menu không mờ; gõ `/portal/apply` → quay về trang chủ, thông báo "Bạn đang có chỗ ở tại ký túc xá, không cần đăng ký thêm".

### 6.2. Bước 1 — Loại phòng

- [ ] Thanh 3 bước: **Loại phòng** (đang làm) · Chọn phòng · Xác nhận. Khung xanh "Hiển thị phòng dành cho sinh viên nữ", có dấu × đóng được.
- [ ] Thẻ phải "Tóm tắt lựa chọn" ghi "Chọn một loại phòng để xem chi phí", nút **Tiếp tục chọn phòng** mờ.
- [ ] Segmented **Tiêu chuẩn** → chỉ loại Tiêu chuẩn (8, 6, 4 người); mỗi hàng: ô số người, tên, tiện nghi, "Còn N chỗ · M phòng", giá "/ người / tháng".
- [ ] Segmented **Chất lượng cao** → chọn **Chất lượng cao · 4 người** → hàng viền xanh "Đang chọn"; thẻ phải: Giá thuê 950.000 đ, Tiền cọc 1.000.000 đ, "Dự kiến hằng tháng 950.000 đ", nút tiếp tục sáng.
- [ ] Loại có tag "Cấp sẵn: Đệm mút 90x190cm" (nếu loại đó được cấp sẵn nhu yếu phẩm).
- [ ] _(Không test được với dữ liệu mặc định)_ Loại hết chỗ hiển thị mờ, chữ đỏ "Hết chỗ", không chọn được.

### 6.3. Bước 2 — Chọn phòng

- [ ] Bấm **Tiếp tục chọn phòng** → bước 1 có dấu ✓ "Đã chọn: Chất lượng cao · 4 người". Thẻ đầu trang có "Đã chọn" + link **Đổi loại phòng**.
- [ ] Ô Tòa nhà chỉ có **Tòa B** (tòa nữ). Bảng có **Phòng B205** (Tầng 2, Còn 1 chỗ màu cam) và **Phòng B310** (Tầng 3, Còn 4 chỗ). Cột "Sơ đồ giường" là chấm xám (có người) / xanh (trống) kèm "x/4 trống" — bấm chấm không có gì xảy ra.
- [ ] Dòng xanh cuối bảng: "bạn chỉ chọn phòng. Giường cụ thể do ban quản lý ký túc xá tự sắp xếp khi duyệt đơn."
- [ ] Chưa chọn phòng → nút **Tiếp tục sang bước 3** mờ.
- [ ] Bấm hàng **B205** → tag "Đang chọn", thẻ phải: Tòa B, "Phòng B205 (Tầng 2)", "● Còn 1 chỗ", nút sáng. Dưới nút có dòng "Nộp đơn **chưa giữ chỗ**…".
- [ ] Bấm **Quay lại chọn loại phòng** → về bước 1, vẫn đang chọn CLC · 4 → tiếp tục lại → vẫn đang chọn B205.

### 6.4. Bước 3 — Xác nhận

- [ ] Bấm **Tiếp tục sang bước 3** → "Tòa B · Phòng B205", tag loại phòng. Từ ngày = hôm nay, Đến ngày = 30/06 năm học, dòng xanh "Thời hạn: N tháng".
- [ ] Thẻ **Phòng đã có sẵn**: các tiện nghi của loại phòng (+ đồ cấp sẵn màu xanh). Khung cam "Lưu ý về đồ dùng cá nhân".
- [ ] Thẻ phải **Chi phí ban đầu**: Tiền cọc 1.000.000 đ · Tiền phòng tháng đầu 950.000 đ ("Thu đủ 1 tháng, kể cả khi vào ở giữa tháng") · **Tổng cộng 1.950.000 đ**.
- [ ] Chưa tích ô "Tôi đã đọc và đồng ý với nội quy…" → nút **Nộp đơn đăng ký** mờ.
- [ ] Ô Từ ngày: các ngày trước hôm nay bị mờ, không chọn được.
- [ ] Đổi Đến ngày thành 10 ngày sau Từ ngày → tích đồng ý → **Nộp đơn đăng ký** → lỗi đỏ "Thời gian ở tối thiểu 1 tháng", chưa gửi đơn.
- [ ] Sửa Đến ngày về 30/06 năm sau, ghi chú "Em muốn ở gần bạn cùng lớp".

### 6.5. Phòng vừa hết chỗ lúc nộp (ROOM_FULL)

> Dữ liệu giả cài sẵn: nộp đơn vào **B205** khi phòng còn đúng 1 chỗ thì hệ thống giả lập một sinh viên khác vừa được duyệt vào giường cuối.

- [ ] Bấm **Nộp đơn đăng ký** → tự quay về **bước 2**, khung đỏ "Phòng B205 vừa hết chỗ. Vui lòng chọn phòng khác" + "Danh sách phòng đã được tải lại. Loại phòng và thời gian ở bạn đã chọn vẫn được giữ nguyên."
- [ ] Bảng **không còn B205**, chỉ còn B310; không phòng nào đang được chọn, nút bước 3 mờ.
- [ ] Network → request `my-applications` (POST) → HTTP **409**, Response `code: "ROOM_FULL"`.
- [ ] Chọn **B310** → khung đỏ tự đóng → bước 3: ngày, ghi chú và ô đồng ý **vẫn giữ nguyên** như đã nhập.

### 6.6. Nộp thành công + đã có đơn chờ duyệt

- [ ] **Nộp đơn đăng ký** → màn kết quả xanh "Nộp đơn đăng ký thành công", mã **DK-2026-…**, trạng thái "Chờ duyệt", phòng "Tòa B · Phòng B310", thời gian ở, tiền cọc + tháng đầu + tổng, khung "Nộp đơn chưa giữ chỗ".
- [ ] Network → POST `my-applications` → **Payload** chỉ có `roomId`, `startDate`, `endDate`, `note` — **không có** `studentId`, `bedId`.
- [ ] Bấm **Về trang chủ** → trang chủ hiện thẻ cam "Đơn đăng ký đang chờ duyệt" với đúng mã đơn vừa nộp, không còn nút "Đăng ký chỗ ở".
- [ ] Đăng xuất → đăng nhập `sv006@dorm.local` (có sẵn đơn chờ duyệt) → gõ `/portal/apply` → màn vàng "Bạn đã có một đơn đăng ký đang chờ duyệt" kèm mã đơn, phòng, loại, ngày nộp; không hiện 3 bước.

### 6.7. Màn hình hẹp + chưa kiểm được

- [ ] Cửa sổ ~900px → cột tóm tắt xuống dưới nội dung, không có thanh cuộn ngang.
- [ ] Cửa sổ < 768px → menu ngang chuyển thành thanh tab dưới đáy; "Chỗ ở", "Mua sắm" mờ với `sv002`.
- [ ] `sv005@dorm.local` → gõ `/portal/apply` → bước 1 hiện khung đỏ "Đơn DK-… trước đây đã bị từ chối" + "Lý do: Hồ sơ còn thiếu giấy xác nhận sinh viên. Bạn có thể đăng ký lại."
- _(Chờ backend v1.2)_ `409 DUPLICATE_PENDING_APPLICATION` / `STUDENT_HAS_ACTIVE_CONTRACT` lúc nộp → thông báo vàng và về trang chủ.

**Lỗi phát hiện:** _(chưa có)_

---

## 7. Cổng sinh viên — Trang chủ (SCR-61)

**Nhánh:** `feature/student-home` · **Đường dẫn:** `/portal/home` (trang mở ngay sau khi sinh viên đăng nhập) · **Chạy:** dữ liệu giả, mỗi tài khoản đăng nhập lại từ đầu (F5 được).

**Khác thiết kế đã chấp nhận:** không có "Thẻ phòng số", "Lịch sử ra vào", "Bản scan đã ký số", chuông thông báo, ảnh sản phẩm thật (dữ liệu giả chưa có ảnh — hiện biểu tượng) — không có trong API. Thẻ công nợ chỉ có nút "Thanh toán ngay" (mở danh sách hóa đơn chưa trả), không có nút "Chi tiết nợ" riêng. Các link sang Hóa đơn, Chỗ ở & hợp đồng, Yêu cầu, Mua sắm hiện vẫn mở trang "đang xây dựng" — sẽ có ở các màn sau.

### 7.1. Đang lưu trú — `sv001@dorm.local`

- [ ] Thẻ chào: "Xin chào, Nguyễn Văn An", "Mã sinh viên: SV2026001 · Khoa: Công nghệ thông tin", tag xanh **Đang ở**.
- [ ] Thẻ đỏ **Công nợ cần thanh toán**: "Bạn đang nợ: 726.000 đ", "2 hóa đơn chưa thanh toán đủ · Hạn gần nhất: dd/mm/yyyy (còn N ngày)". Hóa đơn đã quá hạn thì có tag đỏ "QUÁ HẠN" và chữ "quá hạn N ngày".
- [ ] Bấm **Thanh toán ngay** → sang `/portal/my-invoices?status=unpaid` (trang đang xây dựng) → quay lại trang chủ.
- [ ] **Không** có thẻ "Hợp đồng còn N ngày" (hợp đồng sv001 còn hơn 30 ngày).
- [ ] Thẻ **Chỗ ở của tôi**: "Tòa A · Phòng A101 · Giường 01", loại phòng "Tiêu chuẩn · 6 người", đơn giá 320.000 đ/tháng, mục "CÓ SẴN TRONG PHÒNG" (Giường tầng, Tủ cá nhân, Quạt trần, Bàn học chung), "Bạn cùng phòng: 5 người" — rê chuột thấy họ tên + MSSV.
- [ ] Thẻ **Hợp đồng của tôi**: tag "Đang hiệu lực", số HD-2026-00001, thời hạn "10 tháng" + "01/09/2026 – 30/06/2027", tiền cọc đã nộp 500.000 đ, link "Gia hạn hợp đồng".
- [ ] Bảng **Hóa đơn gần đây** tối đa 3 dòng, mới nhất lên đầu: cột Kỳ hóa đơn ("Tháng 10/2026" hoặc "Nhu yếu phẩm"), Khoản thu, Số tiền, Trạng thái (tag màu), "Chi tiết". Chân bảng "Xem tất cả hóa đơn (5)".
- [ ] Cột phải: khung xanh **"Đơn DH-2026-00002 đang chờ bạn nhận"** — Chăn mỏng, nút "Xem".
- [ ] Thẻ **Nhu yếu phẩm**: chỉ gợi ý món sinh viên **chưa đặt** (với sv001 chỉ còn "Móc treo quần áo (bộ 10)") — không hiện Chăn mỏng, Màn chống muỗi, Gối bông, Vỏ đệm, Vỏ gối vì đã đặt. Nút "Đến cửa hàng nhu yếu phẩm".
- [ ] Thẻ **Hỗ trợ sinh viên** có hotline 1900 6868.
- [ ] Bấm biểu tượng ⟳ ở "Hóa đơn gần đây" → bảng tải lại, không lỗi.

### 7.2. Hợp đồng sắp hết hạn — `sv004@dorm.local`

- [ ] Khung vàng **"Hợp đồng còn 20 ngày"** (hoặc 19, tùy giờ chạy) + "Hợp đồng HD-… hết hạn ngày …", nút **Gia hạn** → sang `/portal/my-requests?create=renewal`.
- [ ] Thẻ Hợp đồng dòng cuối chữ cam "Còn 20 ngày".
- [ ] Phòng Chất lượng cao: mục có sẵn trong phòng có "Đệm mút 90x190cm"; header góc phải "Phòng A…".

### 7.3. Chưa có chỗ, chưa có đơn — `sv002@dorm.local`

- [ ] Tag xám "Chưa có chỗ ở". Thẻ xanh lớn **"Bạn chưa có chỗ ở tại ký túc xá"** + nút **Đăng ký chỗ ở** → `/portal/apply`.
- [ ] Mục **"Loại phòng còn chỗ"**: tối đa 3 thẻ, giá thấp nhất trước (Tiêu chuẩn 8 · 6 · 4 người), mỗi thẻ có giá/người/tháng, tiện nghi, "● Còn N chỗ". Bấm thẻ → `/portal/apply`.
- [ ] Không có thẻ công nợ, hợp đồng, hóa đơn, nhu yếu phẩm.

### 7.4. Có đơn chờ duyệt — `sv006@dorm.local`

- [ ] Thẻ cam **"Đơn đăng ký đang chờ duyệt"** + tag mã DK-2026-00074: phòng "Tòa B · Phòng B101", "Tiêu chuẩn · 6 người", thời gian ở, "Nộp lúc 28/10/2026 08:15", "Cần thanh toán khi được duyệt 820.000 đ".
- [ ] Khung vàng **"Phòng B101 hiện đã hết chỗ"** + "…hãy hủy đơn này và đăng ký lại" (vì phòng nguyện vọng đã đầy).
- [ ] Bấm **Hủy đơn** → hộp xác nhận "Hủy đơn DK-2026-00074?" → **Giữ đơn** → không đổi gì.
- [ ] **Hủy đơn** lần nữa → **Hủy đơn** → thông báo "Đã hủy đơn đăng ký", trang đổi sang thẻ xanh "Bạn chưa có chỗ ở tại ký túc xá" + loại phòng còn chỗ.
- [ ] Network → request `DELETE /portal/my-applications/<id>` thành công.

### 7.5. Đơn bị từ chối — `sv005@dorm.local`

- [ ] Thẻ đỏ **"Đơn đăng ký DK-… đã bị từ chối"**: phòng, loại, thời điểm xử lý, "Lý do: Hồ sơ còn thiếu giấy xác nhận sinh viên", nút **Đăng ký lại**.
- [ ] Bên dưới vẫn có mục "Loại phòng còn chỗ".
- [ ] Bấm **Đăng ký lại** → `/portal/apply`, bước 1 có khung đỏ nhắc đơn bị từ chối.

### 7.6. Màn hình hẹp

- [ ] `sv001`, cửa sổ ~900px → cột phải (đơn chờ nhận, nhu yếu phẩm, hỗ trợ) xuống dưới; hai thẻ Chỗ ở / Hợp đồng vẫn cạnh nhau hoặc xếp chồng gọn; bảng hóa đơn cuộn ngang trong thẻ, trang không có thanh cuộn ngang.

**Lỗi phát hiện:** _(chưa có)_

---

## 8. Quản lý hợp đồng (SCR-32)

**Nhánh:** `feature/contract-management` · **Đường dẫn:** Lưu trú & hợp đồng → Hợp đồng · **Chạy:** dữ liệu giả, tài khoản `staff@dorm.local`, **F5 trước khi bắt đầu**.

**Khác thiết kế đã chấp nhận:**
- Không có tab "Chờ kích hoạt" — từ v1.2 hợp đồng tạo sẵn `active` khi duyệt đơn, không còn trạng thái chờ.
- Drawer **không có nút "Gia hạn"** — không có API cho cán bộ tự gia hạn; gia hạn đi qua yêu cầu của sinh viên (SCR-66 → duyệt ở SCR-41). Thay bằng khung nhắc "còn N ngày" / khung yêu cầu đang chờ + nút "Mở Yêu cầu".
- Không có "Bản scan đã ký số", menu con "Danh sách lưu trú" / "Gia hạn hợp đồng" — không có trong docs.
- Thêm so với bản vẽ: bộ lọc loại phòng, cột giá thuê + công nợ, hóa đơn của hợp đồng, sửa điều khoản trong drawer.

> Ngày "sắp hết hạn" của dữ liệu giả tính theo **ngày máy đang chạy**, nên số ngày còn lại sẽ khác nhau tùy hôm test — chỉ cần luôn nằm trong 0–30.

### 8.1. Tab + danh sách

- [ ] Mặc định mở tab **Đang hiệu lực**. 5 tab kèm số: Tất cả **75** · Đang hiệu lực **72** · Sắp hết hạn **11** (số trên nền vàng) · Hết hạn **2** · Đã chấm dứt **1**.
- [ ] Bảng có cột: Mã hợp đồng (chữ xanh), Sinh viên (tên + MSSV), Chỗ ở ("A101 · Giường 01"), Loại phòng (tag, CLC màu vàng), Thời hạn ("01/09/2026 → 30/06/2027"), Giá thuê, Công nợ (đỏ nếu > 0), Trạng thái. Chân bảng "Tổng 72 hợp đồng", phân trang 20 dòng.
- [ ] Tab **Sắp hết hạn**: mọi dòng có chữ cam "còn N ngày" (0–30), **hết hạn sớm nhất lên đầu**; có dòng HD-2026-00004 (sinh viên `sv004`, còn 20 ngày).
- [ ] Tab **Hết hạn**: 2 hợp đồng **HD-2025-00001**, **HD-2025-00002** — năm học 2025-2026, trạng thái "Hết hạn".
- [ ] Tab **Đã chấm dứt**: **HD-2025-00003**, dưới thời hạn có chữ đỏ "chấm dứt 15/01/2026".

### 8.2. Tìm kiếm + lọc

- [ ] Tab Tất cả → gõ `SV2026001` → Enter → chỉ còn **HD-2026-00001**. Xóa ô tìm → Enter → đủ lại.
- [ ] Gõ mã giường `B205-01` hoặc một phần họ tên → lọc đúng.
- [ ] Chọn **Tòa B** → chỉ còn chỗ ở "B…". Chọn thêm loại phòng "Chất lượng cao · 4 người" → chỉ còn loại đó. Bỏ chọn → đủ lại, về trang 1.

### 8.3. Drawer hợp đồng cũ

- [ ] Tab Đã chấm dứt → bấm dòng HD-2025-00003 → drawer "Hợp đồng HD-2025-00003" tag "Đã chấm dứt".
- [ ] Khung đỏ "Chấm dứt ngày 15/01/2026 — Lý do: Sinh viên chuyển trường, đã bàn giao phòng và thu hồi chìa khóa"; dòng "Đã hoàn cọc 500.000 đ".
- [ ] Giá thuê thấp hơn giá loại phòng hiện tại 20.000 đ, kèm dòng "giá chốt lúc duyệt đơn — không đổi khi loại phòng tăng giá" (BR-27).
- [ ] Lịch sử (mới nhất trên cùng): Chấm dứt hợp đồng · Duyệt đơn, tạo hợp đồng · Nộp đơn đăng ký (DK-2025-…).
- [ ] Chân drawer **không có** nút "Chấm dứt hợp đồng"; mục Điều khoản **không có** link "Sửa".
- [ ] Tab Hết hạn → mở HD-2025-00001 → lịch sử có "Hết hạn hợp đồng — Hệ thống tự chuyển trạng thái và trả giường".

### 8.4. Drawer hợp đồng đang hiệu lực — HD-2026-00001 (sinh viên `sv001`)

- [ ] Tìm `SV2026001` → bấm dòng → hàng được tô xanh, drawer mở: tag "Đang hiệu lực".
- [ ] Khung xanh "Yêu cầu gia hạn gửi ngày <3 ngày trước> — Đang chờ xử lý…" + nút **Mở Yêu cầu** → sang `/admin/requests`.
- [ ] Thông tin sinh viên: Nguyễn Văn An · SV2026001 · lớp CNTT2026A · số điện thoại dạng "0912 000 000".
- [ ] Lưu trú: "Tòa A · Phòng A101 · Giường 01", Tiêu chuẩn · 6 người, "01/09/2026 → 30/06/2027 · 10 tháng · còn N ngày", 320.000 đ/tháng, tiền cọc 500.000 đ "✓ đã thu", **Công nợ hiện tại 726.000 đ** màu đỏ.
- [ ] **Hóa đơn của hợp đồng (5)**: mã, loại/kỳ, số tiền, còn nợ (đỏ khi > 0), trạng thái.
- [ ] Lịch sử có "Yêu cầu gia hạn đang chờ xử lý", "Duyệt đơn, tạo hợp đồng", "Nộp đơn đăng ký".
- [ ] Mở một hợp đồng ở tab **Sắp hết hạn** không có yêu cầu gia hạn → tiêu đề có tag vàng "Sắp hết hạn" + khung vàng "Hợp đồng còn N ngày — Sinh viên chưa gửi yêu cầu gia hạn…".

### 8.5. Sửa điều khoản

- [ ] Drawer HD-2026-00001 → mục Điều khoản → **Sửa** → ô nhập hiện nội dung cũ + dòng "Chỉ sửa được điều khoản. Ngày ở thay đổi qua yêu cầu gia hạn / trả phòng."
- [ ] Xóa hết → **Lưu điều khoản** → chữ đỏ "Điều khoản không được để trống".
- [ ] Gõ "Không nấu ăn trong phòng. Về trước 23h." → **Lưu điều khoản** → thông báo "Cập nhật điều khoản thành công", mục Điều khoản hiện nội dung mới. **Hủy** khi đang sửa → về nội dung cũ.

### 8.6. Chấm dứt hợp đồng

- [ ] Drawer HD-2026-00001 → **Chấm dứt hợp đồng** → hộp thoại có khung vàng **"Không thể hoàn tác"** liệt kê: giường A101 · Giường 01 trả về trống, lưu trú bị đóng · đơn nhu yếu phẩm chưa thanh toán tự hủy **(1 đơn)** · tiền phòng kỳ đang ở tính theo ngày ở thực tế.
- [ ] Khung **QUYẾT TOÁN TẠM TÍNH**: Tiền cọc 500.000 đ · Công nợ − 726.000 đ · **Dự kiến sinh viên nộp thêm 226.000 đ** (đỏ).
- [ ] Ngày chấm dứt mặc định hôm nay; lịch mờ các ngày trước 01/09/2026 và sau 30/06/2027.
- [ ] Lý do "vi pham" → **Chấm dứt hợp đồng** → lỗi "Lý do tối thiểu 10 ký tự", chưa gửi.
- [ ] Lý do đủ dài → xác nhận → hộp kết quả xanh "Đã chấm dứt hợp đồng HD-2026-00001": Tiền cọc 500.000 đ · Trừ công nợ − 566.000 đ · **Sinh viên còn phải nộp thêm 66.000 đ** · "Đã tự hủy 1 đơn nhu yếu phẩm chưa thanh toán". (Công nợ giảm 160.000 đ vì đơn nhu yếu phẩm chưa trả bị hủy, không trừ vào cọc — BR-97.)
- [ ] Network → `PATCH /contracts/<id>/terminate` → Payload `{ reason, terminationDate: "YYYY-MM-DD" }`; Response có `settlement`.
- [ ] Bấm **Đóng** → drawer đổi sang "Đã chấm dứt", khung đỏ ngày chấm dứt + lý do; không còn nút Chấm dứt, link Sửa, khung yêu cầu gia hạn.
- [ ] Danh sách tự tải lại: tab Đang hiệu lực còn **71**, Đã chấm dứt **2**; HD-2026-00001 không còn ở tab Đang hiệu lực.
- [ ] _(Kiểm chéo)_ Sang Cơ sở vật chất → Phòng → A101: giường 01 đã **trống** (chỉ đúng nếu không F5 giữa chừng).

### 8.7. Quyền + màn hình hẹp

- [ ] `viewer@dorm.local` → xem được danh sách và drawer; **không có** "Chấm dứt hợp đồng", "Sửa" điều khoản.
- [ ] `admin@dorm.local` → có đủ nút như staff.
- [ ] Cửa sổ ~1000px → bảng cuộn ngang trong thẻ (cột Mã hợp đồng ghim trái), trang không có thanh cuộn ngang; drawer vẫn đọc được.

**Lỗi phát hiện:** _(chưa có)_

---

## 9. Yêu cầu gia hạn / trả phòng + quyết toán cọc (SCR-41)

**Nhánh:** `feature/request-review` · **Đường dẫn:** menu **Yêu cầu** · **Chạy:** dữ liệu giả, tài khoản `staff@dorm.local`, **F5 trước khi bắt đầu**, làm liền mạch từ 9.1 tới 9.6 (không F5 giữa chừng).

**Khác thiết kế đã chấp nhận:**
- Không có "Lịch sử xử lý", "Xuất báo cáo", "Liên hệ", "Hồ sơ SV", giờ hẹn bàn giao, chi tiết tài sản trong phòng — không có trong API.
- Chưa đổi được **ngày trả phòng thực tế** lúc duyệt: dùng ngày sinh viên đề xuất (API đã có `actualCheckoutDate`, bổ sung sau).
- Viewer chỉ xem danh sách + thông tin yêu cầu, không xem được bảng quyết toán (API: `GET /requests/:id` chỉ cho admin, staff).
- Thêm so với bản vẽ: dòng **tiền phòng kỳ dở theo ngày ở** (BR-31) trong bảng quyết toán, cảnh báo công nợ cho yêu cầu gia hạn.

> Ngày gửi, ngày dự kiến trả và tiền phòng kỳ dở tính theo **ngày máy đang chạy** — số tiền dưới đây đúng khi test trong **tháng 9/2026**. Test tháng khác thì số ngày ở/tiền phòng kỳ dở đổi theo, chỉ cần kiểm công thức: *Hoàn/nộp thêm = cọc − công nợ − tiền phòng kỳ dở*.

### 9.1. Hàng chờ

- [ ] Tab **Chờ xử lý** số đỏ **5** · Đã duyệt **2** · Đã từ chối **1**. Nút lọc: Tất cả (5) · Gia hạn (2) · Trả phòng (3).
- [ ] 5 thẻ, **gửi mới nhất lên đầu**; thẻ đầu (**Đặng Văn An**, Trả phòng) tự mở, viền trái xanh.
- [ ] Thẻ trả phòng có "Dự kiến trả: dd/mm/yyyy"; thẻ gia hạn có "Gia hạn tới 31/12/2027 (+6 tháng)"; thẻ còn nợ có tag đỏ "Còn nợ" + "Công nợ: … đ" (VD Hoàng Quốc Bảo 578.000 đ).
- [ ] Bấm "Gia hạn" / "Trả phòng" → chỉ còn loại đó; gõ `SV2026002` vào ô tìm → chỉ còn Trần Ngọc Ánh. Xóa bộ lọc.

### 9.2. Trả phòng được hoàn cọc — Đặng Văn An

- [ ] Thẻ sinh viên: tên, giới tính, lớp, MSSV SV2026007, SĐT, phòng A101.
- [ ] **Thông tin yêu cầu trả phòng**: mã YC-2026-00005, hợp đồng HD-2026-000xx (chữ xanh), "A101 · Giường 04", ngày dự kiến bàn giao "(còn N ngày)", thời hạn hợp đồng gốc, lý do trong ngoặc kép.
- [ ] **Quyết toán tiền cọc** (tag xanh "Hoàn cọc"): Tiền cọc 500.000 đ · Trừ công nợ − 0 đ · Trừ tiền phòng tháng 9/2026 (17/30 ngày ở) − 181.333 đ · khung xanh **Hoàn trả cho sinh viên 318.667 đ**.
- [ ] Dòng xám: "Đơn nhu yếu phẩm chưa thanh toán sẽ tự hủy, không trừ vào tiền cọc **(1 đơn)**". Có chọn **Hình thức hoàn tiền**: Tiền mặt / Chuyển khoản.
- [ ] **Kiểm tra trước khi duyệt** "2/3 điều kiện": ✓ Đã có chỉ số điện nước tháng 10/2026 · ✓ Không có đơn nhu yếu phẩm chờ nhận · ☐ Đã kiểm tra tài sản phòng và thu hồi chìa khóa (chữ đỏ bắt buộc).
- [ ] Thanh dưới: chữ cam "Xác nhận đã kiểm tra tài sản để bật nút duyệt", nút **Duyệt và hoàn 318.667 đ** mờ.
- [ ] Tích ô kiểm tra → "3/3 điều kiện", nút sáng. Chọn **Chuyển khoản** → bấm duyệt → hộp xác nhận nêu giường trả về trống + "Hoàn 318.667 đ bằng chuyển khoản" → **Duyệt**.
- [ ] Hộp kết quả "Đã duyệt trả phòng của Đặng Văn An": bảng quyết toán chốt, "Hình thức hoàn: Chuyển khoản — đã ghi nhận phiếu hoàn tiền", "Đã tự hủy 1 đơn nhu yếu phẩm chưa thanh toán".
- [ ] Đóng → hàng chờ còn **4**, Trả phòng (2).
- [ ] Network → `PATCH /requests/<id>/approve` → Payload `{ "refundMethod": "bank_transfer" }` (không có forceConfirm vì không nợ).

### 9.3. Trả phòng nợ vượt cọc — Hoàng Quốc Bảo (BR-75)

- [ ] Bấm thẻ Hoàng Quốc Bảo → tag đỏ **"Công nợ vượt tiền cọc"**: cọc 500.000 · công nợ − 578.000 · tiền phòng 9/2026 (22/30 ngày) − 234.667 · khung đỏ **Sinh viên còn phải nộp thêm 312.667 đ** + khung vàng "Tiền cọc bị trừ hết. Hệ thống sẽ tạo hóa đơn quyết toán 312.667 đ…".
- [ ] **Không** có "Hình thức hoàn tiền".
- [ ] Bấm "Xem 1 hóa đơn còn nợ" → hiện mã INV-202610-…, Hàng tháng 10/2026, hạn, 578.000 đ.
- [ ] Checklist dòng vàng "Còn 1 đơn nhu yếu phẩm đã thanh toán chưa giao" + nút **Xem đơn** (không chặn duyệt).
- [ ] Nút **Duyệt và lập hóa đơn 312.667 đ**. Tích kiểm tra tài sản → bấm → hộp đỏ **"Sinh viên còn nợ 578.000 đ. Vẫn duyệt?"**.
- [ ] Network: request đầu trả **422**, `code: "STUDENT_HAS_DEBT"`, `data.outstandingDebt: 578000`.
- [ ] Bấm **Xem lại** → hộp đóng, yêu cầu vẫn còn trong hàng chờ.
- [ ] Bấm duyệt lần nữa → **Vẫn duyệt trả phòng** → request thứ hai có `forceConfirm: true` → kết quả "Sinh viên còn phải nộp thêm 312.667 đ".

### 9.4. Gia hạn — Nguyễn Văn An (sv001)

- [ ] **Thông tin yêu cầu gia hạn**: "30/06/2027 → 31/12/2027", "+6 tháng · 320.000 đ/tháng".
- [ ] Thẻ **Sau khi duyệt gia hạn**: hợp đồng kéo dài tới 31/12/2027 · tiền phòng các kỳ gia hạn lập hóa đơn theo tháng · **Không thu thêm tiền cọc** · khung vàng "Sinh viên đang nợ 566.000 đ (1 hóa đơn) — Công nợ không chặn việc gia hạn".
- [ ] Không có quyết toán / checklist; nút **Duyệt gia hạn** sáng ngay → xác nhận → thông báo "Đã gia hạn hợp đồng HD-2026-00001 — Tới 31/12/2027 (+6 tháng)".
- [ ] _(Kiểm chéo)_ Menu Hợp đồng → tìm SV2026001 → thời hạn kết thúc 31/12/2027.

### 9.5. Từ chối — Lê Hoàng Long

- [ ] **Từ chối** → **Từ chối yêu cầu** khi để trống → lỗi "Nhập lý do từ chối".
- [ ] Nhập "Sinh viên chưa hoàn tất học phí kỳ trước" → hàng chờ còn 1 (Trần Ngọc Ánh).

### 9.6. Đã xử lý + liên kết

- [ ] Tab **Đã duyệt** → 5 yêu cầu (vừa duyệt ở trên + 2 có sẵn), xử lý gần nhất lên đầu. Mở Hoàng Quốc Bảo → **Kết quả xử lý** có bảng quyết toán đã chốt, không có nút duyệt/từ chối.
- [ ] Mở **Hoàng Văn An** (HD-2025-00003) → hoàn 500.000 đ, "Trả phòng ngày 15/01/2026 · hoàn bằng tiền mặt".
- [ ] Mở **Vũ Minh Châu** (gia hạn có sẵn) → "Đã gia hạn hợp đồng từ 30/06/2027 tới 31/12/2027 (+6 tháng)".
- [ ] Tab **Đã từ chối** → Lê Hoàng Long với lý do vừa nhập; Nguyễn Hoàng Long với lý do "Chỉ gia hạn tối đa đến hết năm học tiếp theo…".
- [ ] Tab Chờ xử lý → mở Trần Ngọc Ánh → bấm mã hợp đồng → sang màn Hợp đồng, tab Tất cả, ô tìm đã điền sẵn mã, bảng chỉ 1 dòng.
- [ ] Trần Ngọc Ánh: công nợ 295.250 đ < cọc nhưng cộng tiền phòng tháng 9 (25/30 ngày) 266.667 đ thì **nộp thêm 61.917 đ** — kiểm lại công thức.

### 9.7. Quyền + màn hình hẹp

- [ ] `viewer@dorm.local` → thấy 5 thẻ và thông tin yêu cầu + khung xanh "Chi tiết công nợ, quyết toán và thao tác duyệt chỉ dành cho quản trị viên và nhân viên"; không có nút Từ chối / Duyệt.
- [ ] Cửa sổ ~900px → danh sách trên, chi tiết dưới, không cuộn ngang.

**Lỗi phát hiện:** _(chưa có)_

---

## 10. Cổng sinh viên — Yêu cầu của tôi (SCR-66)

**Nhánh:** `feature/student-requests` · **Đường dẫn:** menu **Yêu cầu** ở cổng sinh viên (`/portal/my-requests`) · **Chạy:** dữ liệu giả, F5 trước mỗi mục.

**Khác thiết kế đã chấp nhận:** bỏ loại **"Báo hỏng thiết bị & sửa chữa"** và **tải tệp minh chứng** — không có trong docs/API (PRD không có module sửa chữa, không upload). Bỏ khung "tỷ lệ duyệt" — thay bằng số yêu cầu theo trạng thái. Ngày gửi gộp vào cột "Mã & loại" cho bảng gọn.

### 10.1. Danh sách — `sv001@dorm.local`

- [ ] Bấm menu **Yêu cầu** → tiêu đề "Yêu cầu của tôi" + tag "2 yêu cầu". Tab: Tất cả (2) · Chờ duyệt (1) · Đã duyệt (0) · Bị từ chối (0) · Đã hủy (1).
- [ ] Bảng, mới nhất lên đầu:
  - YC-2026-00001 · tag Gia hạn · "Gửi dd/mm/yyyy hh:mm" · **Gia hạn đến 31/12/2027** + lý do · "Chờ xử lý" · "Ban quản lý thường xử lý trong 1–2 ngày làm việc" · link đỏ **Hủy**.
  - YC-2026-00006 · Trả phòng · "Đã hủy" · "Bạn đã hủy" · không có link Hủy.
- [ ] Bấm từng tab → chỉ còn yêu cầu đúng trạng thái; tab rỗng ghi "Không có yêu cầu ở trạng thái này".
- [ ] Cột phải **Tổng quan**: "Hợp đồng HD-2026-00001", "Tòa A · Phòng A101", "Hết hạn 30/06/2027 · còn N ngày"; 3 dòng đếm Đang chờ duyệt 1 / Đã duyệt 0 / Bị từ chối 0; nút "Gia hạn chỗ ở", "Trả phòng". Dưới là thẻ "Hỗ trợ & khiếu nại".

### 10.2. Chặn gửi trùng + gửi trả phòng

- [ ] **Tạo yêu cầu** → hộp "Tạo yêu cầu mới", mặc định chọn **Gia hạn chỗ ở** → khung đỏ "Bạn đang có một yêu cầu gia hạn chờ xử lý…", nút **Gửi yêu cầu gia hạn** mờ.
- [ ] Chọn **Trả phòng** → khung đỏ biến mất, nút đổi thành **Gửi yêu cầu trả phòng** và sáng; khung xanh "Tiền cọc 500.000 đ sẽ được trừ vào công nợ còn lại (726.000 đ) và quyết toán khi ban quản lý duyệt" + ghi chú tiền phòng theo ngày ở, đơn nhu yếu phẩm chưa thanh toán tự hủy.
- [ ] Bấm gửi khi để trống → lỗi "Chọn ngày dự kiến trả phòng" và "Nhập lý do trả phòng".
- [ ] Lịch chọn ngày: mờ các ngày trước hôm nay và sau 30/06/2027.
- [ ] Chọn ngày ~2 tuần tới, lý do "Em chuyển ra ở cùng gia đình" → gửi → thông báo "Đã gửi yêu cầu trả phòng", hộp đóng, chuyển sang tab **Chờ duyệt (2)** có dòng mới.
- [ ] Network → `POST /portal/my-requests` → Payload `{ type: "checkout", requestedEndDate: "YYYY-MM-DD", reason }` — **không có** `studentId`.

### 10.3. Hủy yêu cầu

- [ ] Dòng trả phòng vừa gửi → **Hủy** → hộp "Hủy yêu cầu trả phòng?" → **Giữ lại** → không đổi gì.
- [ ] **Hủy** lần nữa → **Hủy yêu cầu** → thông báo "Đã hủy yêu cầu"; Chờ duyệt (1), Đã hủy (2).
- [ ] Network → `DELETE /portal/my-requests/<id>` thành công.
- [ ] _(Kiểm chéo trong cùng phiên, không F5)_ Đăng xuất → đăng nhập `staff@dorm.local` → menu Yêu cầu: yêu cầu trả phòng của Nguyễn Văn An **không** có trong hàng chờ.

### 10.4. Gia hạn từ trang chủ — `sv004@dorm.local`

- [ ] Trang chủ có khung vàng "Hợp đồng còn 20 ngày" → bấm **Gia hạn** → sang `/portal/my-requests` và **hộp tạo yêu cầu mở sẵn** ở loại Gia hạn.
- [ ] Dòng dưới ô ngày: "Hợp đồng hiện kết thúc ngày <hạn hiện tại>". Lịch mờ mọi ngày ≤ hạn hiện tại (BR-72).
- [ ] Chọn ngày **đúng 6 tháng sau** hạn hiện tại → hiện chữ xanh **"Thêm 6 tháng."**; khung xanh "Gia hạn không thu thêm tiền cọc".
- [ ] Gửi (lý do để trống được) → "Đã gửi yêu cầu gia hạn"; thanh địa chỉ không còn `?create=renewal`.
- [ ] Bấm **Gia hạn chỗ ở** ở cột phải → khung đỏ yêu cầu gia hạn đang chờ, nút gửi mờ. **Hủy bỏ** để đóng.

### 10.5. Chưa có hợp đồng + màn hình hẹp

- [ ] `sv002@dorm.local` → menu Yêu cầu → khung xanh "Bạn chưa có hợp đồng lưu trú đang hiệu lực" + nút "Về trang chủ"; nút **Tạo yêu cầu** mờ (rê chuột: "Cần có hợp đồng đang hiệu lực để gửi yêu cầu"); bảng "Bạn chưa gửi yêu cầu nào"; Tổng quan ghi "Chưa có hợp đồng đang hiệu lực."
- [ ] `sv001`, cửa sổ ~900px → cột Tổng quan xuống dưới bảng, bảng cuộn ngang trong thẻ, trang không cuộn ngang.

**Lỗi phát hiện:** _(chưa có)_

---

## 11. Dashboard (SCR-10)

**Nhánh:** `feature/admin-dashboard` · **Đường dẫn:** `/admin/dashboard` (trang mở sau khi admin/staff/viewer đăng nhập) · **Chạy:** dữ liệu giả (11.1–11.5), sau đó backend thật (11.6).

**Khác thiết kế đã chấp nhận:** không có "Xuất báo cáo PDF", ô tìm kiếm trên header, chuông, "+4 tuần này", "Mục tiêu 85%", chia Nam/Nữ, "Gửi thông báo nhắc nợ" — không có trong docs/API. **Chưa có bộ lọc theo tòa (FR-75, mức S)** — API summary chưa nhận `buildingId`; số liệu từng tòa xem ở biểu đồ. Thêm so với bản vẽ: "Chỗ trống theo loại phòng" (FR-74) và "Hợp đồng sắp hết hạn gần nhất" (FR-73).

> Số "Hợp đồng sắp hết hạn", "còn N ngày" tính theo ngày máy chạy. Số tiền công nợ đổi nếu trước đó đã thao tác ở màn khác trong cùng phiên — **F5 trước khi test**.

### 11.1. Thẻ chỉ số — `staff@dorm.local`

- [ ] Hàng 1: **Tổng số giường 98** ("Trong đó 2 giường đang bảo trì") · **Đã sử dụng 72** · **Còn trống 24** · **Tỷ lệ lấp đầy 75,00%** + thanh tiến độ + "72 / 96 giường dùng được".
- [ ] Kiểm công thức (FR-70): 98 = 72 + 24 + 2. Tỷ lệ = 72 / (98 − 2) = 75,00% — **không phải** 72/98 = 73,47%. Rê chuột biểu tượng ⓘ thấy "Đã sử dụng / (tổng giường − giường bảo trì)".
- [ ] Hàng 2: **Sinh viên đang ở 72** ("Hợp đồng: 72 hiệu lực · 2 hết hạn · 1 chấm dứt") · **Hợp đồng sắp hết hạn 11** (tag "Trong 30 ngày tới", link "Xem danh sách") · **Tổng công nợ** (số đỏ, dạng 33.682.500 đ) · **Hóa đơn quá hạn 18** (tag "Cần đôn đốc", "Còn nợ … đ", link đỏ "Xem hóa đơn").
- [ ] Không có khung vàng "Số liệu giường không khớp".

### 11.2. Biểu đồ + chỗ trống theo loại

- [ ] **Tỷ lệ lấp đầy theo tòa**: 2 thanh ngang Tòa A / Tòa B, mỗi thanh chia 3 màu (xanh đậm đã có người · xanh nhạt còn trống · hồng bảo trì); bên phải ghi "72,92% · 35/48 giường" và "77,08% · 37/48 giường". Rê chuột lên thanh → hộp số giường từng loại + tỷ lệ.
- [ ] Dải dưới biểu đồ: "96 giường dùng được" · "2 giường (Tòa A: 1, Tòa B: 1)".
- [ ] **Chỗ trống theo loại phòng**: 6 dòng loại phòng, mỗi dòng số phòng + tag xanh "Còn N chỗ" (hoặc đỏ "Hết chỗ"). Link "Loại phòng" → `/admin/room-types`.

### 11.3. Hợp đồng sắp hết hạn + cần xử lý

- [ ] **Hợp đồng sắp hết hạn gần nhất**: 5 dòng, gần hết hạn nhất lên đầu, tag đỏ khi ≤ 7 ngày, vàng khi > 7 ngày; link "Xem tất cả (11)".
- [ ] Bấm một dòng → màn Hợp đồng, ô tìm đã điền mã hợp đồng.
- [ ] Dải **Cần xử lý · 13**: "6 đơn đăng ký chờ duyệt · 2 yêu cầu gia hạn · 3 yêu cầu trả phòng · 2 đơn nhu yếu phẩm chờ nhận" — mỗi mục là link.
- [ ] Bấm "3 yêu cầu trả phòng" → `/admin/requests?type=checkout`, nút lọc **Trả phòng** đã chọn sẵn. Quay lại → bấm "2 yêu cầu gia hạn" → lọc **Gia hạn**.
- [ ] Bấm "Xem danh sách" ở thẻ hợp đồng → `/admin/contracts?tab=expiring`, tab **Sắp hết hạn** đang chọn.
- [ ] Bấm "6 đơn đăng ký chờ duyệt" → màn Duyệt đơn. "Xem hóa đơn" / "đơn nhu yếu phẩm" → trang đang xây dựng (màn chưa làm).

### 11.4. Làm mới + cập nhật số

- [ ] Bấm **Làm mới dữ liệu** → nút xoay, số liệu tải lại, không lỗi.
- [ ] _(Không F5)_ Sang Yêu cầu → duyệt 1 yêu cầu trả phòng → quay lại Dashboard → Đã sử dụng **71**, Còn trống **25**, "3 yêu cầu trả phòng" thành **2**.

### 11.5. Quyền + màn hình hẹp

- [ ] `viewer@dorm.local` → thấy đủ thẻ số liệu, biểu đồ, chỗ trống theo loại, dải Cần xử lý (chữ thường, **không** bấm được); **không có** link "Xem danh sách", "Xem hóa đơn", "Loại phòng", **không có** thẻ "Hợp đồng sắp hết hạn gần nhất".
- [ ] `admin@dorm.local` → có đủ như staff.
- [ ] Cửa sổ ~900px → thẻ xếp 2 cột, biểu đồ và "Chỗ trống theo loại phòng" xếp chồng, không cuộn ngang.

### 11.6. Với backend thật

Chuẩn bị theo mục 1.2 (backend `npm run dev`, `.env` FE `VITE_USE_MOCK=false`, chạy FE ở **cổng 5173** — backend chỉ cho phép CORS từ 5173). Đăng nhập `admin@dorm.local / Admin@123`.

- [ ] 8 thẻ hiện, số giường khớp dữ liệu DB (lúc test 15/09: 8 giường, 0 đang ở, 8 trống, 0 bảo trì, công nợ 2.100.000 đ).
- [ ] Kiểm lại công thức: tổng = đã sử dụng + trống + bảo trì; tỷ lệ tính theo (tổng − bảo trì).
- [ ] Thẻ "Sinh viên đang ở" hiện **"—"** và "— hợp đồng đang hiệu lực" (backend chưa trả trường này) — **không** hiện số 0 sai.
- [ ] Biểu đồ vẫn có nhãn "0,00% · 0/4 giường" cho tòa chưa có ai ở.
- [ ] "Chỗ trống theo loại phòng" hiện **khung vàng** "Chưa lấy được số chỗ theo loại phòng — Không tìm thấy endpoint…" (backend chưa có API loại phòng v1.2), trang không vỡ.
- [ ] Dải Cần xử lý: "— đơn đăng ký chờ duyệt · 0 yêu cầu gia hạn / trả phòng · — đơn nhu yếu phẩm chờ nhận" (backend chỉ trả tổng số yêu cầu).
- [ ] Network → `GET /dashboard/summary` 200, `GET /dashboard/occupancy` 200, `GET /contracts?expiringInDays=30&limit=5` 200, `GET /room-types?...` 404 (đã biết).

**Lỗi phát hiện:** _(chưa có)_

---

## 12. Quản lý tài khoản (SCR-81)

**Nhánh:** `feature/user-accounts` · **Đường dẫn:** Hệ thống → Tài khoản (`/admin/users`) · **Chạy:** dữ liệu giả, tài khoản `admin@dorm.local`, **F5 trước khi bắt đầu**; từ 12.3 tới 12.7 làm liền mạch, không F5 (dữ liệu giả reset khi tải lại).

**Ghi chú:** màn không có bản vẽ (📋 code theo khuôn màn Sinh viên). API quản lý tài khoản chưa có trong docs lẫn backend — FE đã định nghĩa ở `API.md` mục 2.1 (bản 1.2.6); backend hiện chỉ có đặt lại mật khẩu. Đặt lại mật khẩu cho Staff (FR-09) sẽ gắn vào màn Sinh viên (SCR-11, FE Dev) — màn này chỉ Admin vào được.

### 12.1. Quyền truy cập

- [ ] Đăng nhập `staff@dorm.local` → menu **không** có mục Hệ thống; gõ `/admin/users` → trang 403.
- [ ] Đăng nhập `admin@dorm.local` → Hệ thống → **Tài khoản**.

### 12.2. Danh sách + lọc

- [ ] Nút lọc: Tất cả (12) · Quản trị viên (2) · Nhân viên (3) · Người xem (1) · Sinh viên (6). Chân bảng "Tổng 12 tài khoản".
- [ ] Bảng sắp quản trị viên → nhân viên → người xem → sinh viên. Cột: Tài khoản (họ tên + email), Vai trò (tag màu), Hồ sơ sinh viên (mã SV hoặc —), Trạng thái, Đăng nhập gần nhất, Thao tác.
- [ ] Dòng **Nguyễn Văn Quản Trị** có tag "Bạn"; hai nút **Đặt lại mật khẩu** và **Khóa** mờ (rê chuột thấy lý do).
- [ ] `staff2@dorm.local` (Đỗ Minh Tuấn) tag đỏ **Đã khóa**, nút **Mở khóa**; `doimk@dorm.local` có thêm tag vàng **Chờ đổi mật khẩu**; `sv001` cột hồ sơ **SV2026001**; tài khoản chưa từng đăng nhập ghi "Chưa đăng nhập".
- [ ] Lọc **Sinh viên** → 6 dòng. Ô tìm gõ `SV2026004` → Enter → chỉ `sv004@dorm.local`. Trạng thái **Đã khóa (1)** → chỉ staff2. Xóa bộ lọc.

### 12.3. Tạo tài khoản cán bộ

- [ ] **Thêm tài khoản** → mặc định vai trò **Nhân viên**, dòng gợi ý quyền; bấm **Tạo tài khoản** khi trống → lỗi "Nhập email", "Nhập họ tên".
- [ ] Email `staff@dorm.local` → lỗi dưới ô Email "Email này đã được dùng cho tài khoản khác".
- [ ] Email `nhanvien3@dorm.local`, họ tên "Vũ Thị Nhân Viên Mới" → **Tạo tài khoản** → hộp **Đã tạo tài khoản**: mật khẩu tạm 10 ký tự chữ + số, nút **Chép**, khung vàng "Mật khẩu chỉ hiện một lần". Ghi lại mật khẩu này.
- [ ] Bấm ra ngoài hộp → hộp **không** đóng; chỉ đóng bằng "Tôi đã ghi lại mật khẩu" hoặc ×.
- [ ] Danh sách có dòng mới: Nhân viên · Đang hoạt động · **Chờ đổi mật khẩu** · Chưa đăng nhập. Nút lọc thành Tất cả (13), Nhân viên (4).
- [ ] Network → `POST /users` → Response có `temporaryPassword`; Payload **không** có trường mật khẩu.

### 12.4. Tạo tài khoản sinh viên

- [ ] **Thêm tài khoản** → chọn **Sinh viên** → ô "Họ và tên" đổi thành **Hồ sơ sinh viên** (tìm từ xa).
- [ ] Gõ `SV2026001` → dòng "SV2026001 · Nguyễn Văn An — đã có tài khoản" **mờ, không chọn được** (BR-82).
- [ ] Gõ `SV2026010` → chọn → email `sv010@dorm.local` → tạo → hộp mật khẩu tạm; danh sách có dòng Sinh viên với hồ sơ **SV2026010**, họ tên lấy theo hồ sơ.

### 12.5. Sửa tài khoản

- [ ] Dòng Đỗ Minh Tuấn → **Sửa** → nút vai trò **Sinh viên** mờ (cán bộ không đổi thành sinh viên). Đổi sang **Người xem**, họ tên "Đỗ Minh Tuấn (đã chuyển)" → **Lưu thay đổi** → thông báo "Cập nhật tài khoản thành công", dòng cập nhật.
- [ ] Dòng của mình → **Sửa** → tất cả nút vai trò mờ, dòng "Không tự đổi vai trò của chính mình"; đổi họ tên của mình rồi lưu → tên ở góc phải header đổi theo.
- [ ] Dòng một sinh viên → **Sửa** → ô Họ và tên mờ, ghi "Họ tên sinh viên sửa ở màn Sinh viên"; các vai trò cán bộ mờ.

### 12.6. Khóa / mở khóa

- [ ] Dòng `nhanvien3@dorm.local` → **Khóa** → hộp "Khóa tài khoản nhanvien3@dorm.local?" nêu hậu quả → **Khóa tài khoản** → thông báo "Đã khóa tài khoản", tag **Đã khóa**, nút đổi thành **Mở khóa**.
- [ ] Network → `PATCH /users/<id>/status` Payload `{ "isActive": false }`.
- [ ] Dòng staff2 → **Mở khóa** → xác nhận → tag Đang hoạt động.

### 12.7. Đặt lại mật khẩu + kiểm chéo

- [ ] Dòng `sv001@dorm.local` → **Đặt lại mật khẩu** → hộp xác nhận → **Đặt lại mật khẩu** → hộp **Đã đặt lại mật khẩu** với mật khẩu tạm mới; dòng sv001 thêm tag **Chờ đổi mật khẩu**. Ghi lại mật khẩu.
- [ ] _(Không F5)_ Đăng xuất → đăng nhập `nhanvien3@dorm.local` + mật khẩu tạm ở 12.3 → khung đỏ "Tài khoản của bạn đã bị vô hiệu hóa…" (đã khóa ở 12.6).
- [ ] Đăng nhập `sv001@dorm.local / Student@123` → "Email hoặc mật khẩu không chính xác" (mật khẩu cũ hết hiệu lực).
- [ ] Đăng nhập `sv001@dorm.local` + mật khẩu tạm ở 12.7 → bị đưa thẳng tới **Đổi mật khẩu** với khung "Bạn đang dùng mật khẩu tạm".

### 12.8. Màn hình hẹp

- [ ] Cửa sổ ~1000px → bảng cuộn ngang trong thẻ (cột Thao tác ghim phải), trang không cuộn ngang; hộp thoại vẫn đọc được.

**Lỗi phát hiện:** _(chưa có)_

---

## 13. Tòa nhà (SCR-21)

**Nhánh:** `feature/building-management` · **Đường dẫn:** Cơ sở vật chất → Tòa nhà (`/admin/buildings`) · **Chạy:** dữ liệu giả, tài khoản `staff@dorm.local` (FR-20 cho Staff), **F5 trước khi bắt đầu**, từ 13.2 tới 13.5 làm liền mạch không F5.

**Ghi chú:** màn không có bản vẽ (📋). Không có nút xóa — docs không có API xóa tòa và BR-07 cấm xóa tòa đã có dữ liệu. Dữ liệu giả có thêm **Tòa C** (ngừng hoạt động, đang cải tạo, chưa có phòng).

### 13.1. Danh sách

- [ ] Nút lọc: **Đang hoạt động (2)** (mặc định) · Ngừng hoạt động (1) · Tất cả (3). Dòng ghi chú bên phải "Tòa đã có dữ liệu không xóa được, chỉ ngừng hoạt động (FR-25)".
- [ ] Bảng: ô mã A/B, tên + địa chỉ · Số phòng **10** · Giường "35/49 đang ở — 13 trống · 1 bảo trì" (Tòa A), "37/49 đang ở — 11 trống · 1 bảo trì" (Tòa B) · thanh **72,92%** / **77,08%** · tag Đang hoạt động.
- [ ] Kiểm công thức: 35 / (49 − 1) = 72,92% (không phải 35/49). Rê chuột lên thanh thấy "Đã ở / (tổng giường − bảo trì)".
- [ ] Tòa A, B có người ở → nút **Ngừng hoạt động** mờ, rê chuột "Còn 35 sinh viên đang ở — không ngừng hoạt động được".
- [ ] Lọc **Ngừng hoạt động** → Tòa C: ô mã xám, "Đang cải tạo…", "Chưa có giường", tag xám, nút **Kích hoạt lại**, **không** có "Xem sơ đồ".

### 13.2. Thêm tòa nhà

- [ ] **Thêm tòa nhà** → bấm **Thêm tòa nhà** khi trống → lỗi "Nhập mã tòa nhà", "Nhập tên tòa nhà".
- [ ] Gõ mã `a` → tự thành **A**; tên "Tòa trùng" → thêm → lỗi dưới ô Mã "Mã tòa nhà A đã tồn tại" (BR-01).
- [ ] Mã `a@` → "Mã gồm chữ, số, dấu -, tối đa 10 ký tự".
- [ ] Mã `D`, tên "Tòa D", địa chỉ "Khu KTX số 2" → thông báo "Đã thêm tòa nhà Tòa D"; dòng mới 0 phòng, "0/0 đang ở", "Chưa có giường".

### 13.3. Sửa

- [ ] Dòng Tòa D → **Sửa** → ô Mã **mờ**, ghi chú "Mã tòa không đổi được sau khi tạo — đã in trên mã giường".
- [ ] Mô tả "Dành cho sinh viên năm nhất" → **Lưu thay đổi** → "Cập nhật tòa nhà thành công", mô tả hiện dưới tên.
- [ ] Network → `PUT /buildings/<id>` Payload chỉ có `name`, `address`, `description` — **không** có `code`.

### 13.4. Ngừng hoạt động / kích hoạt lại

- [ ] Dòng Tòa D → **Ngừng hoạt động** → hộp nêu hậu quả (ẩn khỏi sơ đồ phòng, đăng ký, dashboard; dữ liệu cũ giữ nguyên) → xác nhận → "Đã ngừng hoạt động tòa nhà", tag xám, nút **Kích hoạt lại**.
- [ ] Sang **Phòng** → ô chọn tòa chỉ có Tòa A, Tòa B (không có C, D). Sang **Dashboard** → biểu đồ vẫn chỉ 2 tòa.
- [ ] Quay lại Tòa nhà → lọc **Ngừng hoạt động (2)** → Tòa D → **Kích hoạt lại** → xác nhận → "Đã kích hoạt lại tòa nhà".

### 13.5. Xem sơ đồ + quyền

- [ ] Dòng Tòa B → **Xem sơ đồ** → `/admin/rooms?buildingId=b2`, sơ đồ mở sẵn **Tòa B** (các ô phòng B…).
- [ ] Gõ `/admin/rooms?buildingId=b3` (Tòa C ngừng hoạt động) → sơ đồ tự quay về Tòa A, không lỗi.
- [ ] `viewer@dorm.local` → thấy bảng và "Xem sơ đồ"; **không có** Thêm tòa nhà, Sửa, Ngừng hoạt động, Kích hoạt lại.
- [ ] Cửa sổ ~1000px → bảng cuộn ngang trong thẻ (Thao tác ghim phải), trang không cuộn ngang.

### 13.6. Với backend thật (chỉ xem — không thêm/sửa trên DB chung)

Chuẩn bị như mục 11.6 (backend + FE cổng 5173, `VITE_USE_MOCK=false`), đăng nhập `admin@dorm.local`.

- [ ] Bảng hiện 2 tòa "Tòa nhà A (Khu Nam)", "Tòa nhà B (Khu Nữ)" với mô tả, 1 phòng, "0/4 đang ở", 0,00%.
- [ ] Lọc **Ngừng hoạt động (0)** — backend chưa trả tòa ngừng hoạt động (đã ghi ở `API.md`), nên sau khi ngừng một tòa sẽ **không** kích hoạt lại được từ giao diện cho tới khi backend hỗ trợ `includeInactive`.
- [ ] _(Chỉ làm trên DB riêng, không làm trên DB chung)_ Thêm tòa trùng mã → lỗi vẫn hiện dưới ô Mã (FE nhận cả mã lỗi `BUILDING_CODE_ALREADY_EXISTS` của backend).

**Lỗi phát hiện:** _(chưa có)_

---

## 14. Danh mục loại phí (SCR-82)

**Nhánh:** `feature/fee-type-catalog` · **Đường dẫn:** Hệ thống → Danh mục loại phí (`/admin/fee-types`) · **Chạy:** dữ liệu giả, tài khoản `admin@dorm.local` (chỉ Admin — FR-45), **F5 trước khi bắt đầu**, từ 14.2 tới 14.5 làm liền mạch không F5.

**Ghi chú:** màn không có bản vẽ (📋). Không có nút xóa — hóa đơn cũ tham chiếu loại phí, docs không có API xóa. 6 loại **hệ thống** (`rent`, `electricity`, `water`, `deposit`, `supplies`, `other`) không ngừng dùng được vì lập hóa đơn, quyết toán cần tới. Dữ liệu giả có thêm 2 loại tự thêm: `lost_key` (đang dùng), `internet` (đã ngừng).

### 14.1. Danh sách

- [ ] Hộp xanh trên cùng: "Chỉ tiền điện và tiền nước dùng đơn giá ở đây" + giải thích tiền phòng/cọc lấy từ hợp đồng, nhu yếu phẩm lấy từ đơn hàng.
- [ ] Nút lọc: **Đang dùng (7)** (mặc định) · Ngừng dùng (1) · Tất cả (8).
- [ ] Thứ tự: rent, electricity, water, deposit, supplies, other (có chữ nhỏ "Hệ thống" dưới mã), rồi lost_key.
- [ ] Cột Đơn giá mặc định: Tiền điện **2.500 đ/kWh** "Dùng khi nhập chỉ số điện nước" · Tiền nước **12.000 đ/m3** · Tiền phòng, Tiền đặt cọc "Theo hợp đồng" · Nhu yếu phẩm "Theo đơn hàng" · Phí khác "Nhập số tiền khi lập hóa đơn" · Làm mất chìa khóa **50.000 đ/chiếc** "Gợi ý khi lập hóa đơn thủ công".
- [ ] Cột Kỳ thu: tiền phòng, điện, nước tag xanh **Hằng tháng**; còn lại **Một lần**.
- [ ] 6 loại hệ thống: nút **Ngừng dùng** mờ, rê chuột "Loại phí hệ thống dùng khi lập hóa đơn — không ngừng sử dụng được". Làm mất chìa khóa: nút đỏ bấm được.
- [ ] Lọc **Ngừng dùng** → Internet phòng, tag xám, nút **Dùng lại**.

### 14.2. Thêm loại phí

- [ ] **Thêm loại phí** → xóa ô đơn giá → bấm **Thêm loại phí** → lỗi "Nhập mã loại phí", "Nhập tên loại phí", "Nhập đơn vị tính", "Nhập đơn giá".
- [ ] Gõ mã `Water` → tự thành **water**; tên "Nước trùng", đơn vị `m3`, đơn giá 5000 → thêm → lỗi dưới ô Mã "Mã loại phí water đã tồn tại".
- [ ] Mã `9x` → "Mã bắt đầu bằng chữ, gồm chữ thường, số, dấu _, 2–30 ký tự".
- [ ] Ô Đơn vị: bấm vào thấy gợi ý tháng, kWh, m3, lần, chiếc…; gõ tự do được.
- [ ] Mã `cleaning`, tên "Phí vệ sinh phòng", đơn vị `tháng`, đơn giá 20000 → ô hiện **20.000**, hậu tố **đ/tháng**; chọn **Hằng tháng** → thêm → thông báo "Đã thêm loại phí Phí vệ sinh phòng", dòng mới "20.000 đ/tháng", tag Hằng tháng.

### 14.3. Sửa đơn giá điện (BR-52)

- [ ] Dòng Tiền điện → **Sửa** → ô Mã mờ ("Mã không đổi được sau khi tạo…"), ô Kỳ thu mờ ("Loại phí hệ thống — kỳ thu cố định"), dưới ô đơn giá có ghi chú BR-52.
- [ ] Đơn giá 0 → **Lưu thay đổi** → "Đơn giá điện, nước phải lớn hơn 0".
- [ ] Đơn giá 2800 → **Lưu thay đổi** → hộp hỏi "Đổi đơn giá tiền điện?" nêu **2.500 đ → 2.800 đ** mỗi kWh và "Chỉ số đã nhập và hóa đơn đã lập giữ nguyên giá cũ".
- [ ] Bấm **Xem lại** → quay về form, chưa lưu. Bấm lưu lần nữa → **Đổi đơn giá** → "Cập nhật loại phí thành công", bảng hiện 2.800 đ/kWh.

### 14.4. Sửa tiền phòng + ngừng dùng / dùng lại

- [ ] Dòng Tiền phòng → **Sửa** → ô đơn giá **mờ**, ghi chú "Tiền phòng lấy số tiền theo hợp đồng — không dùng đơn giá ở đây". Đổi tên "Tiền phòng ở" → lưu **không** hỏi xác nhận, bảng đổi tên.
- [ ] Network → `PUT /fee-types/<id>` Payload có `name`, `unit`, `defaultAmount`, `isRecurring` — **không** có `code`.
- [ ] Dòng Phí vệ sinh phòng → **Ngừng dùng** → hộp "Ngừng sử dụng Phí vệ sinh phòng?" (không chọn được khi lập hóa đơn mới, hóa đơn cũ giữ nguyên) → xác nhận → "Đã ngừng sử dụng loại phí", tag xám, nút **Dùng lại**.
- [ ] **Dùng lại** → xác nhận → "Đã dùng lại loại phí"; nút lọc về **Ngừng dùng (1)**.

### 14.5. Quyền + màn hẹp

- [ ] `staff@dorm.local`, `viewer@dorm.local`: menu Hệ thống **không** có Danh mục loại phí; gõ `/admin/fee-types` → trang **403**.
- [ ] Cửa sổ ~1000px → bảng cuộn ngang trong thẻ (Thao tác ghim phải), trang không cuộn ngang.

### 14.6. Với backend thật (chỉ xem — không thêm/sửa trên DB chung)

Chuẩn bị như mục 11.6 (backend + FE cổng 5173, `VITE_USE_MOCK=false`), đăng nhập `admin@dorm.local`.

- [ ] Bảng hiện 5 loại: **rent** "Tiền thuê phòng hàng tháng" (Theo hợp đồng) · **electricity** 3.000 đ/kWh · **water** 15.000 đ/m3 · **deposit** (Theo hợp đồng) · **internet** 50.000 đ/tháng. Mã hiện **chữ thường** dù backend trả `ROOM_FEE`, `ELECTRICITY`… (FE chuyển đổi khi đọc, xem `API.md` bản 1.2.9).
- [ ] Tiền phòng, điện, nước, internet hiện **Hằng tháng** (backend chưa có `isRecurring`, FE suy ra từ đồng hồ điện nước hoặc đơn vị "tháng").
- [ ] Không có `supplies`, `other` — backend chưa seed (đã ghi ở `16-YEU-CAU-API-BACKEND.md` mục 3.12).
- [ ] F12 → Console có 2 lỗi 404 `/room-types` — do Dashboard gọi lúc đăng nhập, backend chưa có loại phòng, **không phải** lỗi màn này.
- [ ] _(Chỉ làm trên DB riêng)_ Thêm/sửa loại phí: backend đang dùng tên trường `unitPrice` nên thêm/sửa **chưa chạy đúng** cho tới khi backend đổi theo docs.

**Lỗi phát hiện:** _(chưa có)_

---

## 15. Nhập chỉ số điện nước (SCR-51)

**Nhánh:** `feature/utility-readings` · **Đường dẫn:** Tài chính → Chỉ số điện nước (`/admin/utility-readings`) · **Chạy:** dữ liệu giả, tài khoản `staff@dorm.local`, **F5 trước khi bắt đầu**, từ 15.2 tới 15.6 làm liền mạch không F5.

**Dữ liệu giả (tính theo ngày chạy):** kỳ **tháng trước** đủ 20 phòng và **đã lập hóa đơn** · kỳ **tháng này**: Tòa A đã nhập đủ 9 phòng có người, Tòa B mới nhập 5/9 (B101→B205), còn B206, B207, B208, B309 chưa nhập · A310, B310 là phòng trống · kỳ **2 tháng trước** chưa có dữ liệu. Đơn giá lấy từ Danh mục loại phí (2.500 đ/kWh, 12.000 đ/m³).

**Khác bản vẽ:**
- Không có nút **Xuất Excel**, **Lịch sử ghi** và dòng **Hạn chốt ghi**: docs không có FR/API cho các phần này.
- Không phân trang: hiện hết phòng của tòa (≤ 20) để không mất bản nháp khi chuyển trang.
- Cột tiền đặt tên **Tiền mỗi người** (bản vẽ bị tooltip che mất tên cột).
- Có thêm trạng thái **Nhập dở** (mới gõ một chỉ số) và **Đã lập HĐ** (kỳ đã khóa, BR-53).

### 15.1. Mở màn — Tòa A

- [ ] Ô **Kỳ** mặc định tháng hiện tại, danh sách 12 kỳ lùi về trước (không có tháng sau). Ô **Tòa nhà** mặc định Tòa A. Hộp bên phải "Đơn giá: Điện 2.500 đ/kWh · Nước 12.000 đ/m³".
- [ ] Thẻ tiến độ "Đã nhập **9/9** phòng (100%)". Bảng 10 dòng: A101 → A310, tiêu đề nhóm **ĐIỆN (kWh)** nền xanh, **NƯỚC (m³)** nền xanh lá.
- [ ] A310: người ở **0**, ô nhập khóa, "Phòng trống — không chia", tag **Bỏ qua**.
- [ ] Thanh dưới cùng: "Đã nhập đủ 9 phòng có người ở", nút **Lưu** mờ.

### 15.2. Tòa B — phòng chưa nhập, công thức chia

- [ ] Chọn **Tòa B** → "Đã nhập **5/9** phòng (56%)". Thanh dưới: "4 phòng chưa nhập".
- [ ] B208 **Chưa nhập**: ô Chỉ số cũ (điện, nước) **nền xám, đã điền sẵn** bằng chỉ số cuối tháng trước; ô Chỉ số mới trống "Nhập số".
- [ ] Rê chuột ô vuông máy tính cạnh số tiền B205 (3 người) → hộp đen "Công thức chia tiền phòng B205": dòng Điện `82 kWh × 2.500 = …`, dòng Nước, "Tổng … ÷ 3 người = …", dòng "Dư … → SV mã nhỏ nhất trả …", "Đơn giá đã chốt lúc nhập (BR-52)".
- [ ] Rê chuột số người ở → "3 người đang ở / 4 giường".

### 15.3. Nhập, lỗi, cảnh báo

- [ ] B206: gõ điện mới **2600** → Tab → tag **Nhập dở** (không báo đỏ); thanh dưới "1 phòng nhập dở…", nút Lưu vẫn mờ.
- [ ] B206: nước mới **250** → tag **Chưa lưu**, dòng nền xanh nhạt, Tiêu thụ **170** và **64** màu xanh, tiền **170.428 đ** (1.193.000 đ ÷ 7). Nút **Lưu 1 phòng**.
- [ ] B207: điện mới **100** → ô viền đỏ "Nhỏ hơn chỉ số cũ", tag **Lỗi**, dòng nền hồng; thanh dưới chữ đỏ "1 phòng có lỗi, …".
- [ ] Bấm vào ô điện mới B207 → **Enter** → con trỏ nhảy xuống ô điện mới B208.
- [ ] B208: sửa ô Chỉ số cũ điện cộng thêm 5 → viền vàng "Kỳ trước <số cũ>" (BR-51, chỉ cảnh báo). Sửa lại đúng số cũ → hết cảnh báo, tag về **Chưa nhập**.

### 15.4. Đổi tòa khi chưa lưu + lưu

- [ ] Chọn **Tòa A** → hộp "Bỏ các thay đổi chưa lưu?" "2 phòng đã sửa…" → **Ở lại** → vẫn Tòa B, giữ nguyên số đã gõ.
- [ ] F5 khi còn thay đổi → trình duyệt hỏi "Rời trang?" → Hủy.
- [ ] **Lưu 1 phòng** → "Đã lưu chỉ số 1 phòng"; B206 **Đã lưu**; tiến độ **6/9**; B207 vẫn **Lỗi** (không bị lưu).
- [ ] Network: `POST /utility-readings` Payload `{ roomId, billingPeriod, electricityStart, electricityEnd, waterStart, waterEnd }` — **không** có đơn giá.
- [ ] **Hủy thay đổi** → B207 về **Chưa nhập**, ô trống.

### 15.5. Sửa phòng đã lưu

- [ ] B101: tăng điện mới thêm 10 → **Chưa lưu** → **Lưu 1 phòng** → "Đã lưu chỉ số 1 phòng", số mới giữ nguyên, tag **Đã lưu**.
- [ ] Network: `PUT /utility-readings/<id>` chỉ có 4 chỉ số.

### 15.6. Kỳ đã lập hóa đơn / kỳ trống

- [ ] Chọn **tháng trước** → hộp xanh "Tháng … của Tòa B đã lập hóa đơn" + "(BR-53)"; mọi ô khóa; tag tím **Đã lập HĐ**; **không** có thanh Lưu.
- [ ] Chọn **2 tháng trước** → ô Chỉ số cũ **trống** (không có kỳ trước để điền), mọi phòng **Chưa nhập**, "Đã nhập 0/9 phòng".

### 15.7. Quyền + màn hẹp

- [ ] `viewer@dorm.local` → hộp "Bạn chỉ có quyền xem chỉ số điện nước", ô nhập khóa, không có thanh Lưu.
- [ ] `admin@dorm.local` nhập được như Staff.
- [ ] Cửa sổ ~1000px → bảng cuộn ngang trong thẻ, trang không cuộn ngang; thanh Lưu luôn dính đáy khi cuộn.

### 15.8. Với backend thật (chỉ xem — không lưu trên DB chung)

Chuẩn bị như mục 11.6, đăng nhập `admin@dorm.local`.

- [ ] Đơn giá lấy từ backend: "Điện 3.000 đ/kWh · Nước 15.000 đ/m³".
- [ ] Ô Tòa nhà hiện đủ tên "Tòa nhà A (Khu Nam)". Bảng có phòng **A101** (0 người, **Bỏ qua**); thanh dưới "Chưa có phòng nào có người ở — không cần nhập".
- [ ] F12 → Console chỉ có 2 lỗi 404 `/room-types` của Dashboard (đã biết).
- [ ] _(Chỉ làm trên DB riêng)_ Nhập và lưu chỉ số: backend chưa kiểm tra kỳ tương lai và trả `READING_ALREADY_EXISTS` khi trùng (xem `API.md` bản 1.2.10).

**Lỗi phát hiện:** _(chưa có)_

---

## 16. Hóa đơn + Lập hóa đơn hàng loạt (SCR-52, SCR-53)

**Nhánh:** `feature/invoice-management` · **Đường dẫn:** Tài chính → Hóa đơn (`/admin/invoices`) · **Chạy:** dữ liệu giả, tài khoản `staff@dorm.local`, **F5 trước khi bắt đầu**, từ 16.2 tới 16.6 làm liền mạch không F5.

**Dữ liệu giả:** như mục 15. Kỳ tháng này: Tòa A đã nhập đủ chỉ số; Tòa B thiếu B206, B207, B208, B309. Có 3 sinh viên Tòa A đã có hóa đơn tháng này (tháng đầu ở, mới có tiền phòng, đã trả).

**Khác bản vẽ:**
- Mã hóa đơn theo docs `INV-YYYYMM-XXXXX` (bản vẽ `HD-2026-10-0042`).
- Thẻ Phải thu không có "+4,2% so với tháng trước": API chưa có số kỳ trước.
- Cột Phòng gộp vào cột Sinh viên để không mất cột Trạng thái ở màn 1600px (bản vẽ bị tràn).
- Lọc chạy ngay khi chọn (không cần nút "Lọc"); nút tròn là **Xóa bộ lọc**.
- Chưa có nút "Thu tiền": thuộc SCR-55, làm ở nhánh sau. Bấm mã hóa đơn mở trang chi tiết (SCR-54, cũng làm ở nhánh sau).
- Modal lập hàng loạt có thêm ô **Hạn thanh toán** (UC-04 bước 1).
- Không ghi "gửi thông báo": hệ thống không gửi thông báo (ngoài phạm vi).

### 16.1. Danh sách + thẻ tổng

- [ ] 4 thẻ: **Phải thu** · **Đã thu** (xanh, "Tỷ lệ hoàn thành: x%") · **Còn nợ** (đỏ, "Chiếm x% số phải thu") · **Quá hạn** (đỏ, "N hóa đơn", link "… chưa thu — xem ngay"). Kiểm: Đã thu + Còn nợ = Phải thu.
- [ ] Bảng 10 dòng/trang, cuối bảng "Tổng N hóa đơn". Cột: Mã hóa đơn (link) · Sinh viên · Phòng (tên, MSSV, tag phòng) · Loại (tag màu) · Kỳ (`MM/YYYY` hoặc —) · Tổng tiền · Đã trả · Còn lại (**đỏ đậm** khi > 0, xanh khi 0) · Hạn TT (đỏ khi quá hạn) · Trạng thái · Thao tác.
- [ ] Hóa đơn **Đã hủy**: dòng mờ, Đã trả / Còn lại "—", không có nút Hủy.

### 16.2. Lọc

- [ ] Bấm "xem ngay" ở thẻ Quá hạn → ô Trạng thái = **Quá hạn**, mọi dòng Quá hạn, thẻ tính lại theo bộ lọc.
- [ ] Nút **Xóa bộ lọc** (vòng tròn) → về tất cả, ô tìm kiếm trống.
- [ ] Loại **Tiền cọc** → mọi dòng Tiền cọc, Kỳ "—"; thêm Tòa **Tòa B** → mọi phòng B….
- [ ] Tìm `SV2026001` (Enter) → chỉ hóa đơn của sinh viên đó.
- [ ] Từ Dashboard bấm "Xem hóa đơn" ở ô quá hạn → mở `/admin/invoices?status=overdue`, đã lọc sẵn. Bấm menu **Hóa đơn** → bộ lọc về mặc định.

### 16.3. Hủy hóa đơn (FR-58, BR-46)

- [ ] Hóa đơn **Nhu yếu phẩm**: nút Hủy mờ, rê chuột "Hóa đơn nhu yếu phẩm hủy theo đơn hàng…".
- [ ] Hóa đơn **Thanh toán một phần** / **Đã thanh toán**: nút Hủy mờ, "Đã có thanh toán — không hủy được (BR-46)".
- [ ] Lọc Loại Hàng tháng + Trạng thái Chưa thanh toán → Hủy dòng đầu → hộp "Hủy hóa đơn INV-…?" nêu tên, loại, số tiền, "không khôi phục được" → **Hủy hóa đơn** → "Đã hủy hóa đơn INV-…", dòng biến mất khỏi bộ lọc Chưa thanh toán.

### 16.4. Lập hóa đơn hàng loạt (SCR-53)

- [ ] **Lập hóa đơn hàng loạt** → Tháng/Năm = tháng hiện tại, Hạn thanh toán = **ngày 10 tháng sau**, Tòa = "Tất cả các tòa (Tòa A, Tòa B)".
- [ ] Hộp vàng "Chưa nhập chỉ số điện nước cho **4 phòng: B206, B207, B208, B309**" + link **Nhập ngay →**.
- [ ] Khung xem trước (tag "Dữ liệu tạm tính"): Sinh viên đủ điều kiện **55** · Hóa đơn sẽ tạo **52 HĐ + bổ sung 3** · Tổng tiền dự kiến. Dòng ghi chú: 3 sinh viên đã có hóa đơn tháng này → chỉ bổ sung điện nước (BR-48); bỏ qua 4 phòng thiếu chỉ số; 2 phòng trống A310, B310.
- [ ] Nút **Lập 52 hóa đơn · bổ sung 3** mờ cho tới khi tích "Tôi đã kiểm tra chỉ số điện nước…".
- [ ] Đổi Tòa → **Tòa A** → 35 SV, **32 HĐ + bổ sung 3**, hết hộp vàng, ô tích bị bỏ tích.
- [ ] Chọn **tháng sau** → hộp đỏ "… chưa tới — không lập hóa đơn trước được", nút mờ. Chọn lại tháng này.
- [ ] Tích xác nhận → **Lập 32 hóa đơn · bổ sung 3** → khi đang gọi, nút quay và không bấm đúp được → thông báo "Đã lập 32 hóa đơn, bổ sung 3 hóa đơn cho kỳ …" + "Tổng … · bỏ qua 1 phòng".
- [ ] Lọc Kỳ tháng này + Tòa A → "Tổng 35 hóa đơn", loại Hàng tháng. Mở một hóa đơn mới (khi có SCR-54) thấy 3 dòng: tiền phòng, "Tiền điện … (x kWh, chia đều N người)", tiền nước.
- [ ] Thêm Trạng thái **Thanh toán một phần** → đúng **3** hóa đơn (tháng đầu đã trả tiền phòng, nay thêm điện nước).
- [ ] Mở lại modal, chọn Tòa A → "9 phòng đã lập hóa đơn kỳ này", "Không có hóa đơn nào để lập", ô tích và nút đều mờ.
- [ ] Chọn Tòa B → **Nhập ngay** → màn Chỉ số điện nước mở đúng **Tòa B**, đúng kỳ ("Đã nhập 5/9 phòng"). Đổi sang Tòa A → hộp "đã lập hóa đơn", ô nhập khóa (BR-53).

### 16.5. Tạo hóa đơn lẻ (FR-46)

- [ ] **Tạo hóa đơn lẻ** → Hạn thanh toán mặc định hôm nay + 7. Ô Loại phí **không có** Tiền phòng, Tiền đặt cọc, Nhu yếu phẩm.
- [ ] Bấm **Tạo hóa đơn** khi trống → lỗi "Chọn sinh viên", "Chọn loại phí", "Nhập nội dung", "Nhập đơn giá".
- [ ] Ô Sinh viên gõ `SV2026001` → chọn. Dòng 1 chọn **Làm mất chìa khóa** → Nội dung tự điền, Đơn giá **50.000**.
- [ ] **Thêm khoản phí** → dòng 2: Phí khác, "Thay bóng đèn", SL 2, đơn giá 30000 → Thành tiền **60.000 đ**, Tổng cộng **110.000 đ**, nút **Tạo hóa đơn 110.000 đ**. Nút xóa dòng mờ khi chỉ còn 1 dòng.
- [ ] Tạo → "Đã tạo hóa đơn INV-…" → tìm mã đó: loại **Khác**, Kỳ —, 110.000 đ, **Chưa thanh toán**.

### 16.6. Quyền + màn hẹp

- [ ] `viewer@dorm.local`: xem được bảng + thẻ; **không có** Tạo hóa đơn lẻ, Lập hóa đơn hàng loạt, cột Thao tác.
- [ ] Cửa sổ ~1000px → bảng cuộn ngang trong thẻ (Mã hóa đơn ghim trái, Thao tác ghim phải), trang không cuộn ngang; 4 thẻ xuống 2 hàng.

### 16.7. Với backend thật (chỉ xem — **không** bấm Hủy, Tạo, Lập trên DB chung)

Chuẩn bị như mục 11.6, đăng nhập `admin@dorm.local`.

- [ ] Bảng hiện hóa đơn thử của backend (mã `HD-TEST-…`) với **tên + MSSV** sinh viên và cột **Còn lại** = Tổng − Đã trả (FE tự tính vì backend chưa trả).
- [ ] 4 thẻ hiện "—", thẻ Quá hạn ghi "Backend chưa trả số tổng hợp".
- [ ] Mở **Lập hóa đơn hàng loạt** → hộp đỏ "Không xem trước được kết quả lập hóa đơn — chưa lập được từ màn này", nút Lập mờ. F12 → Network chỉ có `GET /invoices/generation-preview` (400) — **không** có POST nào.
- [ ] F12 → Console: 2 lỗi 404 `/room-types` (Dashboard) + 1 lỗi 400 `generation-preview` — đều đã biết.

**Lỗi phát hiện:** _(chưa có)_

---

## 17. Chi tiết hóa đơn + Ghi nhận thanh toán (SCR-54, SCR-55)

**Nhánh:** `feature/invoice-detail-payment` · **Đường dẫn:** Tài chính → Hóa đơn → bấm mã hóa đơn (`/admin/invoices/:id`) · **Chạy:** dữ liệu giả, tài khoản `staff@dorm.local`, **F5 trước khi bắt đầu**, từ 17.2 tới 17.5 làm liền mạch không F5.

**Khác bản vẽ:**
- Có thêm nút **Danh sách** (quay lại) và **Hủy hóa đơn** ở đầu trang (docs/08 mục 6.7: nút hủy khóa kèm lý do khi đã có thanh toán).
- **In hóa đơn** dùng lệnh in của trình duyệt; bản in ẩn menu, nút.
- **Ghi chú đối soát** chỉ hiện khi còn nợ, cú pháp chuyển khoản = mã hóa đơn bỏ dấu "-" + MSSV (có nút sao chép). Không có "tự động đối soát trong 15 phút": hệ thống không kết nối ngân hàng.
- Modal thu tiền dùng nút radio **Tiền mặt / Chuyển khoản** gọn thay cho 2 thẻ lớn. Không có nút "Khớp tự động" (ngoài phạm vi).

### 17.1. Trang chi tiết

- [ ] Danh sách → Trạng thái **Thanh toán một phần** → bấm mã một hóa đơn **Hàng tháng** → mở `/admin/invoices/<id>`.
- [ ] Tiêu đề "Hóa đơn INV-…" + tag trạng thái, dòng phụ "Hàng tháng · Kỳ MM/YYYY".
- [ ] 3 thẻ: **Tổng tiền** ("N khoản phí") · **Đã thanh toán** (xanh, %) · **Còn lại** (đỏ, "Chưa thu x%"). Tổng = Đã thanh toán + Còn lại.
- [ ] **Thông tin chung:** Sinh viên (MSSV) · Chỗ ở "Tòa B - Phòng B309 - Giường 02" · Loại · Kỳ · Ngày lập · Hạn (đỏ khi quá hạn) · Hợp đồng (link → màn Hợp đồng đã tìm sẵn mã).
- [ ] **Chi tiết các khoản:** bảng Khoản mục / Đơn giá / Số lượng / Thành tiền, dòng điện nước có dòng phụ xám (VD "65 kWh" hoặc "56 kWh, chia đều 2 người" với hóa đơn lập ở mục 16), dòng **Tổng cộng** xanh.
- [ ] **Lịch sử thanh toán:** "1 đợt thu", mục thời gian · VNPay · tag "+… đ" · mã giao dịch; mục cuối "Còn lại … chưa thanh toán — Chờ sinh viên tất toán trước …".
- [ ] Nút **Hủy hóa đơn** mờ, rê chuột "Đã có thanh toán — không hủy được (BR-46)".
- [ ] Ghi chú đối soát có mã dạng `INV202610000140 SV2026070`, bấm biểu tượng sao chép → "Đã sao chép".

### 17.2. Ghi nhận thanh toán (SCR-55)

- [ ] **Ghi nhận thanh toán** → khung xám: tên, MSSV, mã hóa đơn · tháng · phòng; Tổng / Đã trả (xanh) / **Còn lại** (đỏ).
- [ ] Ô Số tiền thu = số còn lại, chip **Thu đủ (…)** sáng; nút **Xác nhận thu …** đúng số đó. Dưới cùng "Người thu: Lê Thị Nhân Viên".
- [ ] Bấm **Thu một phần** → ô trống, con trỏ vào ô, nút mờ.
- [ ] Gõ số lớn hơn còn lại → viền đỏ + "Số tiền vượt quá số còn phải trả (…)" + nút mờ có ổ khóa (BR-44).
- [ ] Gõ **100000**, chọn **Chuyển khoản** → hiện ô Mã giao dịch ngân hàng; bấm xác nhận khi trống → "Nhập mã giao dịch ngân hàng".
- [ ] Gõ `ft26256891042` → tự thành **FT26256891042** → xác nhận → "Đã thu 100.000 đ"; thẻ Đã thanh toán +100.000, Còn lại −100.000; lịch sử "2 đợt thu" có "Chuyển khoản", "Người thu: Lê Thị Nhân Viên", mã FT….
- [ ] Mở lại, 1.000 đ, Chuyển khoản, cùng mã **FT26256891042** → lỗi dưới ô mã "Mã giao dịch này đã được ghi nhận trước đó".
- [ ] Trong cùng hộp: **Thu đủ** + **Tiền mặt** → "Đã thu … — hóa đơn đã thanh toán đủ"; tag **Đã thanh toán**, Còn lại 0 đ, mất nút Ghi nhận thanh toán, lịch sử cuối "Đã thanh toán đủ".
- [ ] Ô Ngày thu không chọn được ngày sau hôm nay.

### 17.3. Thu tiền từ danh sách + nhu yếu phẩm (BR-95)

- [ ] Danh sách → Chưa thanh toán + Loại **Nhu yếu phẩm** → dòng đầu có nút **Thu tiền** → hộp đúng mã hóa đơn → xác nhận thu đủ → thông báo "… Đơn hàng DH-… chuyển sang Chờ nhận hàng".
- [ ] Tìm lại mã đó → **Đã thanh toán**, không còn nút Thu tiền. Mở chi tiết → dòng "Đơn hàng: Xem đơn hàng DH-…" + "Chờ nhận hàng".

### 17.4. Hủy ở trang chi tiết

- [ ] Mở một hóa đơn **Hàng tháng · Chưa thanh toán** → **Hủy hóa đơn** bật → xác nhận → hộp vàng "Hóa đơn đã hủy — sinh viên không phải trả khoản này", thẻ Còn lại "—", không còn nút thu / hủy, lịch sử "Hóa đơn đã hủy".
- [ ] Gõ `/admin/invoices/khong-co` → trang "Không mở được hóa đơn" + nút **Về danh sách hóa đơn**.

### 17.5. Quyền, in, màn hẹp

- [ ] `viewer@dorm.local` → xem được chi tiết, **không có** Ghi nhận thanh toán, Hủy hóa đơn; danh sách không có cột Thao tác.
- [ ] **In hóa đơn** → bản xem trước chỉ có nội dung hóa đơn, không có menu trái, thanh trên, các nút.
- [ ] Cửa sổ ~1000px → 2 cột xếp chồng, trang không cuộn ngang.

### 17.6. Với backend thật (chỉ xem — **không** bấm Ghi nhận thanh toán, Hủy trên DB chung)

- [ ] Mở một hóa đơn `HD-TEST-…` → tên + MSSV, 1 khoản "Tiền phòng tháng 10" (FE đổi `items` → khoản phí), Chỗ ở "—" (backend chưa trả phòng).
- [ ] Lịch sử thanh toán lấy từ danh sách thanh toán: thấy giao dịch VNPay **Đang xử lý** của hóa đơn đó.
- [ ] F12 → Network không có request POST/PATCH nào khi chỉ xem.

**Lỗi phát hiện:** _(chưa có)_

---

## 18. Lịch sử thanh toán (SCR-56)

**Nhánh:** `feature/payment-history` · **Đường dẫn:** Tài chính → Thanh toán (`/admin/payments`) · **Chạy:** dữ liệu giả, tài khoản `staff@dorm.local`, **F5 trước khi bắt đầu**, từ 18.2 tới 18.4 làm liền mạch không F5.

**Ghi chú:** màn không có bản vẽ (📋). Dữ liệu giả có **2 giao dịch đang xử lý** (1 đối soát ra thành công, 1 treo quá 15 phút) và **1 giao dịch thất bại** (ZaloPay).

### 18.1. Danh sách + thẻ

- [ ] 4 thẻ: **Đã thu** (xanh, "N giao dịch thành công") · **Đã hoàn trả** (xanh dương) · **Đang xử lý** (2 giao dịch, link "Xem và đối soát") · **Thất bại / hết hạn** (1 giao dịch).
- [ ] Bảng: Mã giao dịch (+ thời gian) · Sinh viên · Hóa đơn (link + loại) · Số tiền (**+** xanh khi thu thành công, **−** xanh dương khi hoàn tiền) · Hình thức · Trạng thái · Thao tác.
- [ ] Bấm mã hóa đơn → mở đúng trang chi tiết hóa đơn.

### 18.2. Lọc

- [ ] Hình thức **Tiền mặt** → mọi dòng Tiền mặt. **Xóa bộ lọc** (nút tròn) → về tất cả.
- [ ] Trạng thái **Thất bại** → đúng 1 dòng ZaloPay.
- [ ] Tìm theo mã giao dịch `PAY…` → còn 1 dòng. Xóa bộ lọc → ô tìm kiếm trống.
- [ ] Chọn khoảng ngày → chỉ còn giao dịch trong khoảng; không chọn được ngày sau hôm nay.

### 18.3. Đối soát giao dịch treo (FR-56, BR-64)

- [ ] Thẻ **Đang xử lý** → "Xem và đối soát" → lọc còn 2 dòng, mỗi dòng có nút **Đối soát**.
- [ ] Bấm mã giao dịch dòng đầu → khung bên phải: hộp vàng "Giao dịch đang chờ cổng thanh toán phản hồi", số tiền màu **xám** (chưa vào hóa đơn), "Thời điểm thành công —", "Người ghi nhận: Sinh viên tự thanh toán", nút **Đối soát lại**.
- [ ] **Đối soát lại** → thông báo "Cổng thanh toán báo giao dịch … đã thành công — đã cập nhật hóa đơn"; trạng thái đổi **Thành công**, mất nút đối soát.
- [ ] Mở hóa đơn của giao dịch đó → tiền đã được cộng vào **Đã thanh toán**, lịch sử thanh toán có giao dịch này.
- [ ] Quay lại, đối soát dòng còn lại (tạo đã hơn 15 phút) → "Giao dịch … đã hết hạn ở cổng thanh toán"; thẻ Đang xử lý về **0**, Thất bại / hết hạn thành **2**.
- [ ] Giao dịch tiền mặt / chuyển khoản **không có** nút Đối soát.

### 18.4. Quyền + màn hẹp

- [ ] `viewer@dorm.local` → xem được danh sách và khung chi tiết; **không có** nút Đối soát ở cả bảng lẫn khung chi tiết.
- [ ] Cửa sổ ~1000px → bảng cuộn ngang trong thẻ, trang không cuộn ngang.

### 18.5. Với backend thật (chỉ xem — **không** bấm Đối soát trên DB chung)

- [ ] Danh sách hiện các giao dịch thử `PAY…` với tên + MSSV, mã hóa đơn `HD-TEST-…` (FE tự chuyển đổi `paymentMethod`, `transactionId`, trạng thái `completed`).
- [ ] Giao dịch tại quầy của backend **chưa có mã tham chiếu** nên cột Mã giao dịch hiện "Xem giao dịch" (đã ghi ở `16-YEU-CAU-API-BACKEND.md` mục 3.13).
- [ ] 4 thẻ hiện "—" kèm "Backend chưa trả số tổng hợp".
- [ ] F12 → Network không có request POST nào khi chỉ xem.

**Lỗi phát hiện:** _(chưa có)_

---

## 19. Nhu yếu phẩm — đơn hàng + danh mục (SCR-71)

**Nhánh:** `feature/supplies-management` · **Đường dẫn:** Nhu yếu phẩm (`/admin/supplies`) · **Chạy:** dữ liệu giả, tài khoản `staff@dorm.local`, **F5 trước khi bắt đầu**, từ 19.2 tới 19.5 làm liền mạch không F5.

**Dữ liệu giả:** 7 đơn — 2 chờ thanh toán, 2 chờ nhận hàng, 2 đã giao, 1 đã hủy · 8 sản phẩm (1 ngừng bán, "Đệm mút" được cấp sẵn cho 3 loại phòng Chất lượng cao).

**Khác bản vẽ:**
- Bỏ **Xuất Excel**, **Tạo đơn tại quầy**, **In phiếu**, dòng "Kho phát", "Cập nhật tự động": docs không có FR/API cho các phần này (sinh viên tự đặt hàng ở cổng SV).
- Thẻ thứ tư là **Đã giao hôm nay** thay cho "Doanh thu trong ngày": `summary` của API không có doanh thu; số tiền đã thu xem ở màn Thanh toán.
- Bảng ghép **Sinh viên · Phòng** thành một cột; đơn đã giao / đã hủy chỉ còn nút **Xem** (không thao tác gì thêm).
- Thêm **Thu tiền** ngay trên đơn chờ thanh toán — mở đúng hóa đơn của đơn hàng (docs/08 mục 6.7).

### 19.1. Tab Đơn hàng — thẻ và danh sách

- [ ] 4 thẻ: **Tổng đơn 7** · **Chờ thanh toán 2** · **Chờ nhận tại quầy 2** (link "Xem đơn cần giao") · **Đã giao hôm nay 0** ("Tổng đã giao: 2").
- [ ] Dải lọc: Tất cả (7) · Chờ thanh toán (2) · Chờ nhận hàng (2) · Đã giao (2) · Đã hủy (1).
- [ ] Bảng: Mã đơn + ngày đặt · Sinh viên · MSSV · tag phòng · Sản phẩm ("Vỏ đệm 90x190cm ×1, Vỏ gối ×1") · Tổng tiền · Trạng thái · Thao tác.
- [ ] Đơn **Chờ thanh toán** có **Thu tiền** + **Hủy**; đơn **Chờ nhận hàng** có **Đã giao**; đơn đã giao / đã hủy chỉ có **Xem**.

### 19.2. Lọc + chi tiết đơn

- [ ] Thẻ **Chờ nhận tại quầy** → "Xem đơn cần giao" → còn 2 dòng Chờ nhận hàng. Bấm dải lọc **Chờ thanh toán** → 2 dòng.
- [ ] Tìm `SV2026007` → chỉ đơn của sinh viên đó. **Xóa bộ lọc** → về tất cả. Chọn khoảng ngày đặt → lọc đúng.
- [ ] Bấm mã đơn → khung bên phải: trạng thái, tổng tiền, hộp "Chờ sinh viên thanh toán", thông tin sinh viên / phòng / ngày đặt, link **Xem hóa đơn** kèm số còn lại, bảng sản phẩm có dòng **Tổng cộng**.

### 19.3. Thu tiền → đơn sẵn sàng (BR-95)

- [ ] Dải lọc **Chờ thanh toán** → dòng đầu bấm **Thu tiền** → hộp Ghi nhận thanh toán mở đúng hóa đơn của đơn hàng (mã `INV-…`, số tiền bằng tổng đơn).
- [ ] Xác nhận thu đủ → thông báo "… Đơn hàng DH-… chuyển sang Chờ nhận hàng".
- [ ] Dải lọc **Chờ nhận hàng** → đơn vừa thu nằm trong danh sách, số đếm thành **3**.

### 19.4. Xác nhận đã giao (FR-104)

- [ ] Bấm **Đã giao** ở đơn đó → hộp "Xác nhận đã giao DH-…?" liệt kê sản phẩm và ghi rõ không hoàn tác được.
- [ ] Xác nhận → thông báo "Đã giao đơn DH-… cho <tên sinh viên>"; thẻ **Đã giao hôm nay** thành **1**.
- [ ] Mở lại đơn đó → khung chi tiết có "Đã giao lúc" + "Người giao: Lê Thị Nhân Viên", không còn nút thao tác.

### 19.5. Hủy đơn (FR-105)

- [ ] Dải lọc **Chờ thanh toán** → **Hủy** ở dòng đầu → hộp nêu sản phẩm + hộp xanh "Hóa đơn đi kèm cũng bị hủy".
- [ ] Bấm hủy khi chưa nhập lý do → "Nhập lý do hủy". Nhập "Sinh viên báo không mua nữa" → "Đã hủy đơn DH-… và hóa đơn đi kèm".
- [ ] Dải lọc **Đã hủy (2)** → có đơn vừa hủy; mở chi tiết thấy dòng "Lý do: …".
- [ ] Sang màn **Hóa đơn**, tìm mã hóa đơn của đơn đó → trạng thái **Đã hủy**.
- [ ] Đơn **Chờ nhận hàng** (đã thanh toán) **không có** nút Hủy — mở chi tiết thấy ghi chú "chỉ hủy được đơn chưa thanh toán".

### 19.6. Tab Danh mục sản phẩm (FR-100)

- [ ] Sang tab **Danh mục sản phẩm**: 8 sản phẩm, có cột Ảnh (ô xám khi chưa có ảnh), Nhóm, Đơn vị, Giá, **Loại phòng cấp sẵn** (Đệm mút có 3 tag Chất lượng cao), Trạng thái.
- [ ] Dòng **Ổ cắm điện**: tag **Ngừng bán** + nút **Bán lại**. Dòng cuối bảng có ghi chú "Sản phẩm được cấp sẵn cho loại phòng nào sẽ tự ẩn khỏi cửa hàng…".
- [ ] Lọc Nhóm **Điện** → 1 sản phẩm. Tìm theo tên → lọc đúng. **Xóa bộ lọc** → về 8 sản phẩm.
- [ ] **Thêm sản phẩm** → bấm Thêm khi trống → lỗi "Nhập tên sản phẩm", "Nhập giá bán". Nhập tên "Quạt mini để bàn", giá 250000, mô tả → thêm → dòng mới **250.000 đ**, **Đang bán**.
- [ ] **Sửa** sản phẩm vừa thêm: form có sẵn dữ liệu; đổi giá 260000 → lưu → bảng cập nhật.
- [ ] Chọn "Loại phòng được cấp sẵn" cho một sản phẩm → lưu → tag loại phòng hiện ở cột Loại phòng cấp sẵn.
- [ ] **Ngừng bán** → hộp xác nhận nêu "không còn hiện trong cửa hàng của sinh viên" → xác nhận → tag **Ngừng bán** + nút **Bán lại**.

### 19.7. Quyền + màn hẹp

- [ ] `viewer@dorm.local` → xem được cả 2 tab; **không có** Thu tiền, Đã giao, Hủy, Thêm sản phẩm, Sửa.
- [ ] Cửa sổ ~1000px → bảng cuộn ngang trong thẻ, trang không cuộn ngang.

### 19.8. Với backend thật

- [ ] Vào màn → cả 2 tab báo **"Không tìm thấy endpoint: GET /api/supply-orders…"** và `/api/supply-items`; 4 thẻ hiện "—".
- [ ] Đây là đúng hiện trạng: backend **chưa có module nhu yếu phẩm** (xem `16-YEU-CAU-API-BACKEND.md` mục 3.14). Màn chỉ chạy đầy đủ với dữ liệu giả cho tới khi backend bổ sung.

**Lỗi phát hiện:** _(chưa có)_

---

## 20. Cổng SV: Chỗ ở & hợp đồng + Hồ sơ cá nhân (SCR-63, SCR-69)

**Nhánh:** `feature/portal-residence-profile` · **Đường dẫn:** Cổng SV → Chỗ ở & hợp đồng (`/portal/my-residence`) và Hồ sơ cá nhân (menu tài khoản, `/portal/profile`) · **Chạy:** dữ liệu giả, **F5 trước khi bắt đầu**.

**Tài khoản dùng để test** (mật khẩu đều `Student@123`):
- `sv001@dorm.local` — đang ở A101, có công nợ.
- `sv002@dorm.local` — chưa có chỗ ở.
- `sv007@dorm.local` — **mới thêm**: từng ở năm trước, hiện không còn chỗ (để xem lịch sử lưu trú).

**Ghi chú:** cả 2 màn không có bản vẽ (📋). Hồ sơ **chỉ đọc** theo FR-86 — không có ô nhập hay nút lưu.

### 20.1. Chỗ ở & hợp đồng — đang ở (sv001)

- [ ] Thẻ **Chỗ ở của tôi**: số phòng lớn **A101**, dòng "Tòa A · Giường 01", loại phòng "Tiêu chuẩn · 6 người" kèm giá tháng.
- [ ] **Bạn cùng phòng**: danh sách họ tên + MSSV (5 người). Phòng chỉ có mình → "Chưa có ai khác trong phòng".
- [ ] **Phòng đã có sẵn**: các tag đồ cấp sẵn (Giường tầng, Tủ cá nhân…) + link **Mua thêm đồ dùng** → màn Mua sắm.
- [ ] Thẻ **Hợp đồng lưu trú**: tag Đang hiệu lực, mã hợp đồng, thời hạn `01/09/2026 → 30/06/2027` kèm "Còn N ngày", tiền phòng, tiền cọc, điều khoản.
- [ ] Thẻ **Công nợ**: số tiền đỏ + "N hóa đơn chưa thanh toán" + nút **Thanh toán ngay** → màn Hóa đơn. Không nợ thì hiện "Bạn không còn khoản nào phải thanh toán".
- [ ] **Lịch sử lưu trú**: sv001 chưa có hợp đồng cũ → "Đây là lần đầu bạn ở ký túc xá".

### 20.2. Điều hướng

- [ ] **Gia hạn hợp đồng** → mở màn Yêu cầu của tôi với hộp **Tạo yêu cầu mới** (loại Gia hạn, có dòng "Gia hạn không thu thêm tiền cọc").
- [ ] **Xin trả phòng** → hộp Tạo yêu cầu mới ở loại Trả phòng (có ô "Ngày dự kiến trả phòng").
- [ ] Link **Xem hóa đơn** ở thẻ Công nợ → màn Hóa đơn của tôi.
- [ ] Hợp đồng còn ≤ 30 ngày (đăng nhập `sv004@dorm.local`) → đầu trang có dải vàng "Hợp đồng còn N ngày…" kèm nút **Gia hạn**.

### 20.3. Chưa có chỗ ở (sv002)

- [ ] Màn hiện "Bạn chưa có chỗ ở tại ký túc xá" + nút **Đăng ký chỗ ở** → mở màn đăng ký.
- [ ] Vào Hồ sơ cá nhân → dòng "Chỗ ở hiện tại: Chưa có chỗ ở".

### 20.4. Lịch sử lưu trú (sv007, FR-39)

- [ ] Màn Chỗ ở & hợp đồng: phần trên báo chưa có chỗ ở, phía dưới có bảng **Lịch sử lưu trú**.
- [ ] Bảng có mã hợp đồng cũ `HD-2025-…`, chỗ ở, thời hạn, trạng thái **Hết hạn** hoặc **Đã chấm dứt** (kèm lý do chấm dứt).

### 20.5. Hồ sơ cá nhân (SCR-69, FR-86)

- [ ] Mở từ menu tài khoản góc phải → **Hồ sơ cá nhân**.
- [ ] Hộp xanh "Hồ sơ chỉ để xem — … mang thẻ sinh viên đến văn phòng ban quản lý để chỉnh sửa".
- [ ] Thẻ trái: chữ cái tên, họ tên, MSSV, tag giới tính, chỗ ở hiện tại, tài khoản đăng nhập, nút **Đổi mật khẩu** → màn đổi mật khẩu.
- [ ] Thẻ **Thông tin sinh viên**: họ tên, mã SV, ngày sinh, khoa, lớp, số điện thoại (dạng `0912 000 000`), email.
- [ ] Thẻ **Liên hệ khẩn cấp**: họ tên, quan hệ, số điện thoại. Không có dữ liệu → câu nhắc báo văn phòng bổ sung.
- [ ] **Toàn trang không có ô nhập hay nút Lưu** (FR-86).

### 20.6. Màn hẹp

- [ ] Thu cửa sổ ~400px (hoặc mở bằng điện thoại): 2 cột xếp chồng, trang không cuộn ngang.

### 20.7. Với backend thật

- [ ] Backend **chưa có nhóm API cổng sinh viên**: cả 2 màn hiện tiêu đề bình thường kèm hộp đỏ "Không tải được thông tin chỗ ở / hồ sơ — Không tìm thấy endpoint: GET /api/portal/my-residence (hoặc /profile)".
- [ ] Đây là đúng hiện trạng, đã ghi ở `16-YEU-CAU-API-BACKEND.md` mục 3.10; 2 màn chỉ chạy đầy đủ với dữ liệu giả cho tới khi backend bổ sung.

**Lỗi phát hiện:** _(chưa có)_

---

## 21. Cổng SV: Hóa đơn của tôi + Kết quả thanh toán (SCR-64, SCR-65)

**Nhánh:** `feature/portal-invoices-payment` · **Đường dẫn:** Cổng SV → Hóa đơn (`/portal/my-invoices`) · **Chạy:** dữ liệu giả, tài khoản `sv001@dorm.local` / `Student@123`, **F5 trước khi bắt đầu**.

**Khác bản vẽ:**
- **Bỏ nút "Thanh toán tất cả":** API tạo giao dịch nhận **một** hóa đơn mỗi lần (`POST /payments/online/checkout`), gộp nhiều hóa đơn phải chờ backend hỗ trợ. Thẻ tổng vẫn hiện tổng nợ và kỳ hạn gần nhất.
- Bỏ "Chi tiết đối soát", nút chia sẻ / in ở góc chi tiết, dòng "Bảo mật SSL 256-bit" và "Hỗ trợ QR VNPAY, Viettel Money, thẻ sinh viên": ngoài phạm vi docs, hệ thống chỉ có VNPay/ZaloPay sandbox.
- Thêm phần **Đã thanh toán** trong chi tiết (liệt kê các lần thu) vì hóa đơn có thể trả nhiều đợt.

**Lưu ý dữ liệu giả:** không có cổng thanh toán thật, nên nút VNPay quay thẳng về màn Kết quả và "webhook" được giả lập về sau **5 giây** — đúng để thử luồng hỏi lại nhiều lần.

### 21.1. Danh sách hóa đơn

- [ ] Thẻ trên cùng: **Tổng đang nợ** (đỏ) + tag "N khoản cần nộp" + "Kỳ hạn gần nhất: dd/mm/yyyy".
- [ ] Cột trái có 2 tab: **Chưa thanh toán** (có chấm đếm) và **Đã thanh toán (N)**.
- [ ] Mỗi dòng: biểu tượng (giỏ hàng cho hóa đơn nhu yếu phẩm), tên loại + kỳ, mã hóa đơn, hạn, số tiền, tag trạng thái. Hóa đơn quá hạn có chữ đỏ "Quá hạn thanh toán".
- [ ] Vào màn là hóa đơn đầu tiên **tự mở** ở cột phải.

### 21.2. Chi tiết hóa đơn

- [ ] Khối vàng: "SỐ TIỀN CẦN THANH TOÁN" + số tiền lớn + "Hạn thanh toán: … (còn N ngày / quá hạn N ngày)".
- [ ] Bảng khoản thu (dòng điện nước có dòng phụ xám) + dòng **Tổng cộng**.
- [ ] Mục gập **Cách tính tiền điện nước** → mở ra thấy câu kiểu "Tiền điện: phòng dùng 60 kWh hết 150.000 đ, chia đều 5 người → phần của bạn 30.000 đ" và ghi chú phần lẻ do sinh viên có mã nhỏ nhất chịu.
- [ ] Nút xanh **Thanh toán … đ qua VNPay** + dòng xám "Hoặc nộp tiền mặt trực tiếp tại văn phòng ban quản lý ký túc xá".
- [ ] Tab **Đã thanh toán** → chọn một hóa đơn: khối xanh "Hóa đơn đã thanh toán", có mục "Đã thanh toán" liệt kê các lần thu, **không** còn nút thanh toán.

### 21.3. Thanh toán trực tuyến (SCR-65)

- [ ] Chọn hóa đơn **Nhu yếu phẩm** → bấm **Thanh toán … qua VNPay** → chuyển sang `/portal/payment-result?ref=PAY…`.
- [ ] Màn kết quả hiện **"Đang kiểm tra giao dịch…"** kèm số lần thử (lần 1/5, 2/5…).
- [ ] Sau vài giây → **Thanh toán thành công**: số tiền, mã giao dịch, mã cổng thanh toán, hình thức, thời gian, mã hóa đơn.
- [ ] Vì là hóa đơn nhu yếu phẩm → thêm hộp xanh **"Đơn hàng đã sẵn sàng — mời bạn đến văn phòng ban quản lý ký túc xá để nhận hàng"** (BR-95).
- [ ] Bấm **Xem hóa đơn** → quay lại màn Hóa đơn, tự mở tab **Đã thanh toán** đúng hóa đơn vừa trả. Tab Chưa thanh toán còn 1 hóa đơn, tổng nợ giảm.
- [ ] Vào màn quản trị (tài khoản staff) → **Nhu yếu phẩm**: đơn của hóa đơn vừa trả đã sang **Chờ nhận hàng**.

### 21.4. Trường hợp chưa chắc chắn

- [ ] Gõ `/portal/payment-result?ref=KHONG-CO-MA` → hỏi đủ 5 lần rồi hiện **"Giao dịch đang được xử lý"** + nút **Kiểm tra lại**. **Không** được hiện "Thất bại".
- [ ] Mở tab trình duyệt mới (phiên mới), vào `/portal/payment-result` không kèm mã → "Không có giao dịch để kiểm tra" + nút về trang Hóa đơn.
- [ ] Bấm **Kiểm tra lại** → chạy lại vòng hỏi từ lần 1.

### 21.5. Trạng thái khác + màn hẹp

- [ ] Sinh viên chưa có hóa đơn (`sv002@dorm.local`): tổng nợ 0 đ, danh sách rỗng "Bạn không còn hóa đơn nào cần nộp", cột phải nhắc chọn hóa đơn.
- [ ] Thu cửa sổ ~400px: hai cột xếp chồng, trang không cuộn ngang.

### 21.6. Với backend thật

- [ ] Backend **chưa có API cổng sinh viên**: màn Hóa đơn hiện tiêu đề + hộp đỏ "Không tìm thấy endpoint: GET /api/portal/my-invoices"; màn Kết quả (không mã) báo "Không có giao dịch để kiểm tra".
- [ ] Đã ghi ở `16-YEU-CAU-API-BACKEND.md` mục 3.10 — 2 màn chỉ chạy đầy đủ với dữ liệu giả cho tới khi backend bổ sung.

**Lỗi phát hiện:** _(chưa có)_

---

## 22. Cổng SV: Mua sắm + Đơn hàng của tôi (SCR-67, SCR-68)

**Nhánh:** `feature/portal-shop-orders` · **Đường dẫn:** Cổng SV → Mua sắm (`/portal/shop`) và Đơn hàng của tôi (`/portal/my-orders`) · **Chạy:** dữ liệu giả, `sv001@dorm.local` / `Student@123`, **F5 trước khi bắt đầu**.

**Khác bản vẽ:**
- **Bỏ "Giao về phòng", "Đổi trả miễn phí 48h", hotline, giờ 08:00–20:00, "gói hỗ trợ tân sinh viên":** docs chỉ có hình thức **nhận tại văn phòng ban quản lý**, không có chính sách đổi trả hay giao tận phòng. Màn ghi giờ làm việc 8:00–17:00 như docs/08 mục 6.13.
- **Bỏ ô tìm kiếm đơn và phân trang khi ít đơn:** sinh viên thường chỉ có vài đơn; đã có dải lọc theo trạng thái.
- Thêm cột **Thao tác** với **Thanh toán** (mở đúng hóa đơn của đơn) và **Hủy**.

### 22.1. Cửa hàng (SCR-67)

- [ ] Thẻ đầu trang: "Phòng 101 · Tiêu chuẩn · 6 người", các tag **Phòng đã được cấp sẵn**, ghi chú món cấp sẵn không hiện trong cửa hàng, nút **Đơn hàng của tôi**.
- [ ] Dải lọc nhóm: Tất cả (7) · Chăn ga gối đệm (5) · Đồ dùng cá nhân (2). Lưới sản phẩm có ảnh (ô xám khi chưa có ảnh), tên, nhóm · đơn vị, giá.
- [ ] **Không** thấy "Ổ cắm điện" (đã ngừng bán). Với phòng Chất lượng cao (`sv004@dorm.local`) thì **không** thấy "Đệm mút 90x190cm" vì phòng đã cấp sẵn (FR-101).
- [ ] Giỏ hàng bên phải khi chưa chọn: "Chưa chọn món nào".

### 22.2. Giỏ hàng

- [ ] Bấm **Thêm vào giỏ** ở 2 sản phẩm → giỏ hiện "(2 món)", từng dòng có đơn giá × số lượng, **Tổng cộng** đúng bằng tổng, hộp xanh "Nhận hàng tại văn phòng ban quản lý".
- [ ] Ô số lượng: gõ 9 → tự về **5** (mỗi sản phẩm tối đa 5 cái, BR-91). Gõ 0 → món rời khỏi giỏ.
- [ ] Bấm **Bỏ** ở một dòng → giỏ còn 1 món.
- [ ] Sang màn khác rồi quay lại → giỏ vẫn còn (lưu trong phiên làm việc). Đóng hẳn trình duyệt rồi mở lại → giỏ trống (đúng thiết kế, không có API giỏ hàng).
- [ ] **Xóa giỏ** → giỏ trống.

### 22.3. Đặt hàng

- [ ] Bấm **Đặt hàng** → thông báo "Đặt hàng thành công — đơn DH-…" kèm mã hóa đơn, số tiền, hạn thanh toán và nút **Thanh toán ngay**.
- [ ] Bấm **Thanh toán ngay** → mở màn Hóa đơn đúng hóa đơn nhu yếu phẩm vừa tạo.
- [ ] Sau khi đặt, giỏ hàng trống.
- [ ] F12 → Network: `POST /portal/my-supply-orders` Payload chỉ có `supplyItemId` + `quantity`, **không** có giá tiền (BR-92).

### 22.4. Đơn hàng của tôi (SCR-68)

- [ ] Dải xanh "N đơn đã sẵn sàng tại văn phòng ban quản lý — mang thẻ sinh viên đến nhận: DH-…".
- [ ] Dải vàng "N đơn chờ bạn thanh toán — đơn quá hạn thanh toán sẽ tự hủy, bạn không bị trừ vào tiền cọc".
- [ ] Bảng: mã đơn + ngày đặt · sản phẩm ("Vỏ đệm ×1, Vỏ gối ×1" + số món) · tổng tiền · trạng thái · thao tác.
- [ ] Dải lọc Tất cả / Chờ thanh toán / Chờ nhận hàng / Đã nhận / Đã hủy kèm số đếm.
- [ ] Đơn **Chờ nhận hàng**: có dòng "Mang thẻ sinh viên đến văn phòng nhận", không có nút thao tác.
- [ ] Thẻ phải: **Tổng quan đơn hàng** (chờ thanh toán, chờ nhận, đã chi) và **Nhận hàng** (văn phòng, giờ 8:00–17:00, không giao tận phòng).

### 22.5. Thanh toán và hủy đơn

- [ ] Đơn **Chờ thanh toán** → **Thanh toán** → mở đúng hóa đơn của đơn đó ở màn Hóa đơn.
- [ ] Đơn **Chờ thanh toán** → **Hủy** → hộp xác nhận nêu sản phẩm, số tiền và "Hóa đơn đi kèm cũng bị hủy" → xác nhận → "Đã hủy đơn hàng", đơn chuyển **Đã hủy**.
- [ ] Sang màn **Hóa đơn**: hóa đơn của đơn vừa hủy không còn ở mục chưa thanh toán.
- [ ] Đơn đã thanh toán (Chờ nhận hàng) **không có** nút Hủy.

### 22.6. Trạng thái rỗng + màn hẹp

- [ ] `sv002@dorm.local` (chưa có chỗ ở): màn Mua sắm báo "Bạn cần có chỗ ở để mua nhu yếu phẩm" + nút **Đăng ký chỗ ở**; màn Đơn hàng báo "Bạn chưa đặt đơn nhu yếu phẩm nào" + nút **Mua sắm ngay**.
- [ ] Thu cửa sổ ~400px: lưới sản phẩm 2 cột, giỏ hàng xuống dưới, trang không cuộn ngang.

### 22.7. Với backend thật

- [ ] Backend **chưa có API cổng sinh viên**: màn Mua sắm và Đơn hàng hiện tiêu đề kèm báo lỗi endpoint; không gửi request ghi nào.
- [ ] Đã ghi ở `16-YEU-CAU-API-BACKEND.md` mục 3.10 và 3.14.

**Lỗi phát hiện:** _(chưa có)_

---

## 23. Đăng ký tài khoản sinh viên (SCR-02)

**Nhánh:** `feature/student-register` · **Đường dẫn:** `/register` (công khai, có link từ màn Đăng nhập) · **Chạy:** dữ liệu giả, **không cần đăng nhập**, F5 trước khi bắt đầu.

**Ghi chú nghiệp vụ:** tài khoản **gắn với hồ sơ sinh viên ban quản lý đã có** (FR-80). Không khớp hồ sơ thì từ chối, không tạo hồ sơ mới (FR-81).

**Dữ liệu giả để test:** hồ sơ `SV2026080` — **Bùi Ngọc Ánh** (chưa có tài khoản). `SV2026001` — Nguyễn Văn An (đã có tài khoản `sv001@dorm.local`).

### 23.1. Giao diện

- [ ] Vào `/register` khi chưa đăng nhập → mở được, có tiêu đề "Đăng ký tài khoản sinh viên", dòng "Dành cho sinh viên đã có hồ sơ tại ký túc xá".
- [ ] Hộp xanh "Thông tin phải khớp hồ sơ ban quản lý đang giữ …" hướng dẫn mang thẻ sinh viên đến văn phòng.
- [ ] Đủ ô: Mã số sinh viên · Họ và tên · Email · Giới tính · Số điện thoại · Mật khẩu · Nhập lại mật khẩu. Cuối trang có link **Đã có tài khoản? Đăng nhập**.

### 23.2. Kiểm tra dữ liệu nhập

- [ ] Bấm **Đăng ký** khi trống → lỗi ở từng ô: "Nhập mã số sinh viên", "Nhập họ và tên", "Nhập email", "Nhập mật khẩu", "Nhập lại mật khẩu".
- [ ] Email `sai-dinh-dang` → "Email không đúng định dạng".
- [ ] Mật khẩu `abc` → "Mật khẩu tối thiểu 8 ký tự"; `khongcoso` → "Mật khẩu phải có cả chữ và số" (BR-81).
- [ ] Nhập lại mật khẩu khác → "Mật khẩu nhập lại không khớp".
- [ ] Số điện thoại `123` → "Số điện thoại gồm 10 chữ số, bắt đầu bằng 0".
- [ ] Gõ mã `sv2026080` → tự viết hoa thành **SV2026080**.

### 23.3. Đối chiếu hồ sơ (FR-81)

- [ ] Mã `SV9999999` (không có hồ sơ) → lỗi dưới ô Mã số sinh viên: "Không tìm thấy hồ sơ sinh viên mã SV9999999. Liên hệ ban quản lý ký túc xá…".
- [ ] Mã `SV2026080` + họ tên "Nguyễn Sai Tên" → "Họ tên không khớp hồ sơ của mã sinh viên SV2026080".
- [ ] Mã `SV2026001` + "Nguyễn Văn An" (đã có tài khoản) → "Mã sinh viên SV2026001 đã có tài khoản…".
- [ ] Email `sv001@dorm.local` (đã dùng) → lỗi dưới ô Email "Email này đã được sử dụng".

### 23.4. Đăng ký thành công

- [ ] Mã `SV2026080`, họ tên **Bùi Ngọc Ánh**, email mới, mật khẩu `Ktx@2026` → thông báo "Đăng ký thành công" và **vào thẳng** trang chủ cổng sinh viên.
- [ ] Trang chủ hiện đúng tên **Bùi Ngọc Ánh** lấy từ hồ sơ ban quản lý (không phải tên tự nhập), trạng thái **Chưa có chỗ ở** kèm đơn đăng ký đang chờ duyệt của hồ sơ đó.
- [ ] Đăng xuất rồi đăng nhập lại bằng email + mật khẩu vừa tạo → vào được cổng sinh viên.
  _(Dữ liệu giả: tài khoản vừa đăng ký được giữ trong trình duyệt để đăng nhập thử; xóa dữ liệu trang web thì mất.)_
- [ ] Thu cửa sổ ~400px: form vẫn đọc được, trang không cuộn ngang.

### 23.5. Với backend thật

- [ ] Mở `/register` với backend thật: form hiện bình thường (đây là API công khai duy nhất ngoài đăng nhập).
- [ ] **Không thử đăng ký trên DB chung.** Backend hiện **tạo hồ sơ sinh viên mới** từ dữ liệu nhập thay vì liên kết hồ sơ có sẵn — sai FR-80/FR-81, đã ghi ở `16-YEU-CAU-API-BACKEND.md` mục 3.1 và `API.md` bản 1.2.18. Chờ backend sửa rồi mới thử.

**Lỗi phát hiện:** _(chưa có)_

---

## Mẫu ghi lỗi

Chép vào mục **Lỗi phát hiện** của màn tương ứng:

```
- [ ] #<số> Bước <mã bước, VD 5.3 dòng 2>
  Làm: <thao tác, tài khoản, dữ liệu đã nhập>
  Thấy: <kết quả thực tế — dán ảnh nếu có>
  Mong đợi: <kết quả đúng theo checklist>
  Console/Network: <dòng lỗi đỏ hoặc code trong Response, nếu có>
```
