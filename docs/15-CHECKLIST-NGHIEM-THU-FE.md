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

## Mẫu ghi lỗi

Chép vào mục **Lỗi phát hiện** của màn tương ứng:

```
- [ ] #<số> Bước <mã bước, VD 5.3 dòng 2>
  Làm: <thao tác, tài khoản, dữ liệu đã nhập>
  Thấy: <kết quả thực tế — dán ảnh nếu có>
  Mong đợi: <kết quả đúng theo checklist>
  Console/Network: <dòng lỗi đỏ hoặc code trong Response, nếu có>
```
