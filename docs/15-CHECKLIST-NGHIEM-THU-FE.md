# 15 – CHECKLIST NGHIỆM THU FRONTEND

**Hệ thống:** DMS – Hệ thống quản lý ký túc xá
**Người dùng tài liệu:** người nghiệm thu từng màn hình frontend (FE Lead, BA, thành viên nhóm)
**Cập nhật:** mỗi màn hình làm xong được thêm một mục vào tài liệu này, cùng nhánh với code của màn đó.

> Mỗi dòng `- [ ]` là một bước: **làm gì** → **kết quả đúng phải thấy**. Làm đúng thứ tự từ trên xuống, vì các bước sau dùng dữ liệu bước trước để lại.
> Đạt thì đánh dấu `- [x]`. Sai thì giữ `- [ ]`, ghi lỗi vào mục **Lỗi phát hiện** cuối màn đó theo mẫu ở mục 9.

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

## 9. Mẫu ghi lỗi

Chép vào mục **Lỗi phát hiện** của màn tương ứng:

```
- [ ] #<số> Bước <mã bước, VD 5.3 dòng 2>
  Làm: <thao tác, tài khoản, dữ liệu đã nhập>
  Thấy: <kết quả thực tế — dán ảnh nếu có>
  Mong đợi: <kết quả đúng theo checklist>
  Console/Network: <dòng lỗi đỏ hoặc code trong Response, nếu có>
```
