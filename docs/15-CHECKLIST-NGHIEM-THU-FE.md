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
| 1 | Đăng nhập · Đổi mật khẩu · Không có quyền | SCR-01, 03, 04 | `feature/login-and-room-types` | Dữ liệu giả **và** backend thật | 🔁 Làm lại ở v2 (mục 25) |
| 2 | Loại phòng | SCR-22 | `feature/login-and-room-types` | Dữ liệu giả | 🚫 Bỏ ở v2 |
| 3 | Quản lý phòng — sơ đồ tầng | SCR-23 | `feature/room-management` | Dữ liệu giả | 🔁 Làm lại ở v2 (mục 26) |
| 4 | Duyệt đơn đăng ký | SCR-31 | `feature/application-review` | Dữ liệu giả | 🔁 Làm lại ở v2 (mục 27) |
| 5 | Cổng SV — Đăng ký chỗ ở 3 bước (+ header cổng SV) | SCR-62 | `feature/student-room-application` | Dữ liệu giả | 🔁 Làm lại ở v2 (mục 27) |
| 6 | Cổng SV — Trang chủ theo tình trạng lưu trú | SCR-61 | `feature/student-home` | Dữ liệu giả | 🔁 Làm lại ở v2 (mục 28, 31, 34) |
| 7 | Quản lý hợp đồng (tab + drawer + chấm dứt) | SCR-32 | `feature/contract-management` | Dữ liệu giả | 🔁 Làm lại ở v2 (mục 28) |
| 8 | Yêu cầu gia hạn / trả phòng + quyết toán cọc | SCR-41 | `feature/request-review` | Dữ liệu giả | 🚫 Bỏ ở v2 |
| 9 | Cổng SV — Yêu cầu của tôi | SCR-66 | `feature/student-requests` | Dữ liệu giả | 🚫 Bỏ ở v2 |
| 10 | Dashboard | SCR-10 | `feature/admin-dashboard` | Dữ liệu giả **và** backend thật | 🔁 Làm lại ở v2 (mục 32) |
| 11 | Quản lý tài khoản (+ đặt lại mật khẩu) | SCR-81 | `feature/user-accounts` | Dữ liệu giả | 🔁 Làm lại ở v2 (mục 25) |
| 12 | Tòa nhà | SCR-21 | `feature/building-management` | Dữ liệu giả **và** backend thật (chỉ xem) | 🔁 Làm lại ở v2 (mục 26) |
| 13 | Danh mục loại phí | SCR-82 | `feature/fee-type-catalog` | Dữ liệu giả **và** backend thật (chỉ xem) | 🚫 Bỏ ở v2 |
| 14 | Nhập chỉ số điện nước | SCR-51 | `feature/utility-readings` | Dữ liệu giả **và** backend thật (chỉ xem) | 🔁 Làm lại ở v2 (mục 29) |
| 15 | Hóa đơn + lập hàng loạt + hóa đơn lẻ | SCR-52, SCR-53 | `feature/invoice-management` | Dữ liệu giả **và** backend thật (chỉ xem) | 🔁 Làm lại ở v2 (mục 30) |
| 16 | Chi tiết hóa đơn + ghi nhận thanh toán | SCR-54, SCR-55 | `feature/invoice-detail-payment` | Dữ liệu giả **và** backend thật (chỉ xem) | 🔁 Làm lại ở v2 (mục 30) |
| 17 | Lịch sử thanh toán | SCR-56 | `feature/payment-history` | Dữ liệu giả **và** backend thật (chỉ xem) | 🔁 Làm lại ở v2 (mục 30) |
| 18 | Nhu yếu phẩm (đơn hàng + danh mục) | SCR-71 | `feature/supplies-management` | Dữ liệu giả **và** backend thật | 🚫 Bỏ ở v2 |
| 19 | Cổng SV: Chỗ ở & hợp đồng + Hồ sơ | SCR-63, SCR-69 | `feature/portal-residence-profile` | Dữ liệu giả **và** backend thật | 🔁 Làm lại ở v2 (mục 28) |
| 20 | Cổng SV: Hóa đơn + Kết quả thanh toán | SCR-64, SCR-65 | `feature/portal-invoices-payment` | Dữ liệu giả **và** backend thật | 🔁 Làm lại ở v2 (mục 31) |
| 21 | Cổng SV: Mua sắm + Đơn hàng của tôi | SCR-67, SCR-68 | `feature/portal-shop-orders` | Dữ liệu giả **và** backend thật | 🚫 Bỏ ở v2 |
| 22 | Đăng ký tài khoản sinh viên | SCR-02 | `feature/student-register` | Dữ liệu giả **và** backend thật | 🚫 Bỏ ở v2 |
| 23 | v2 · M1: cắt Viewer, tự đăng ký, Nhu yếu phẩm, Yêu cầu, Gia hạn | — | `feature/v2-trim-scope` | Dữ liệu giả | ⬜ Chưa test |
| 24 | v2 · M2: đăng nhập Email/MSSV, tài khoản cán bộ, nhận diện HaUI | — | `feature/v2-auth-accounts` | Dữ liệu giả | ⬜ Chưa test |
| 25 | v2 · M3: tòa nhà và phòng, bỏ loại phòng | — | `feature/v2-rooms` | Dữ liệu giả | ⬜ Chưa test |
| 26 | v2 · M4: nộp đơn công khai, tra cứu, duyệt đơn | — | `feature/v2-online-application` | Dữ liệu giả | ⬜ Chưa test |
| 27 | v2 · M5: hợp đồng, thanh lý, hoàn cọc, chỗ ở của sinh viên | SCR-32, SCR-61, SCR-63 | `feature/v2-contracts-checkout` | Dữ liệu giả | ⬜ Chưa test |
| 28 | v2 · M6: chỉ số điện nước, chốt & phát hành, lịch sử phòng | SCR-51 | `feature/v2-utility-billing` | Dữ liệu giả | ⬜ Chưa test |
| 29 | v2 · M7: hóa đơn, thu tiền mặt / xác nhận VietQR, biên lai, phiếu thu | SCR-52, 54, 55, 56 | `feature/v2-invoices-payments` | Dữ liệu giả | ⬜ Chưa test |
| 30 | v2 · M8: cổng SV — hóa đơn 2 nhóm, VietQR, chuông, lịch sử nộp tiền, điện nước phòng | SCR-61, 63, 64 | `feature/v2-portal-vietqr` | Dữ liệu giả | ⬜ Chưa test |
| 31 | v2 · M9: Dashboard — KPI, lấp đầy theo tòa, doanh thu (chỉ Admin) | SCR-10 | `feature/v2-dashboard` | Dữ liệu giả | ⬜ Chưa test |
| 32 | v2 · M10: Sinh viên (lọc, chi tiết, đặt lại MK), nhập Excel sinh viên, Excel chỉ số điện nước | SCR-11, SCR-51 | `feature/v2-students-excel` | Dữ liệu giả | ⬜ Chưa test |
| 33 | v2 · M10b: sửa lỗi đợt soát tổng + làm đẹp giao diện | Mọi màn | `feature/v2-ui-polish` | Dữ liệu giả | ⬜ Chưa test |
| 34 | v2 · M11: thử trọn luồng 3 vai trò + tổng nghiệm thu | Mọi màn | `docs/v2-acceptance` | Dữ liệu giả | ⬜ Chưa test |
| 35 | Sửa lỗi trước khi nối backend: phòng bảo trì còn người, khóa giới tính, MSSV 10 số, API.md 2.6 (mục 36) | SCR-11, 23, 51, 62 | `fix/pre-integration` | Dữ liệu giả | ⬜ Chưa test |

Trạng thái: ⬜ Chưa test · ✅ Đạt · ❌ Có lỗi (xem mục Lỗi phát hiện của màn đó).

> **Cập nhật 17/09/2026:** backend đã làm xong gần hết (82/82 endpoint đã có route) và các luồng chính đã chạy thông với backend thật. Vì vậy mỗi màn nên nghiệm thu **hai lượt**: lượt 1 với dữ liệu giả để soi kỹ giao diện, lượt 2 với backend thật để soi dữ liệu. Chi tiết cách chạy ở mục 1.

---

## 1. Chuẩn bị (làm một lần)

### 1.1. Chạy với dữ liệu giả

- [ ] Chạy `npm install` (lần đầu).
- [ ] Chạy **dữ liệu giả ở cổng riêng 5174** để dùng song song với bản nối backend thật (cổng 5173):
      `VITE_USE_MOCK=true npx vite --port 5174 --strictPort`
      *(hoặc đặt `VITE_USE_MOCK=true` trong `.env` rồi `npm run dev` nếu chỉ chạy một bản)*
- [ ] Mở `http://localhost:5174` bằng Chrome → F12 → tab **Console** hiện dòng vàng `[DỮ LIỆU GIẢ] Đang dùng src/mocks`.

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

### 1.2. Chạy với backend thật

> ⚠️ **Không trỏ vào cụm Atlas dùng chung khi test.** Test là có ghi dữ liệu; ghi vào cụm chung sẽ làm bẩn dữ liệu của bạn làm backend. Dùng một CSDL test riêng như dưới đây.

**Bốn cửa sổ dòng lệnh, chạy theo thứ tự:**

| # | Chạy gì | Lệnh |
|---|---|---|
| 1 | MongoDB cục bộ cho test | `cd <thư mục scratchpad>/localdb` rồi `node start-mongo.mjs` — giữ cửa sổ này mở |
| 2 | Nạp dữ liệu mẫu *(chỉ khi muốn làm lại từ đầu)* | `cd D:\BE_QLKTX` rồi `MONGODB_URI="mongodb://127.0.0.1:27018/dms_ktx_test" npm run seed` |
| 3 | Backend | `cd D:\BE_QLKTX` rồi `MONGODB_URI="mongodb://127.0.0.1:27018/dms_ktx_test" node src/server.js` |
| 4 | Frontend nối backend thật | `cd D:\FE_QuanLyKTX` rồi `VITE_USE_MOCK=false VITE_API_BASE_URL=http://localhost:5000/api npx vite --port 5173 --strictPort` |

- [ ] Backend in `CSDL: dms_ktx_test (Host: 127.0.0.1)` — **nếu thấy tên cụm Atlas thì dừng lại**, đang trỏ nhầm CSDL chung.
- [ ] Mở `http://localhost:5173`, Console **không** còn dòng vàng `[DỮ LIỆU GIẢ]`.
- [ ] Kiểm tra nhanh đang đúng CSDL test: màn Sinh viên chỉ có **2 sinh viên** (`SV20260001`, `SV20260002`) sau khi vừa nạp lại dữ liệu mẫu.

**Tài khoản backend thật:** `admin@dorm.local / Admin@123` · `staff1@dorm.local / Staff@123` · `viewer@dorm.local / Viewer@123` · `student.nam@dorm.local / Student@123` · `student.nu@dorm.local / Student@123`.

**Ba điều phải biết trước khi test với backend thật:**

1. **Đăng nhập tối đa 10 lần / 15 phút** (tính theo máy, kể cả đăng nhập đúng). Vượt quá sẽ báo "sai quá nhiều lần" dù mật khẩu đúng. Cách gỡ: **khởi động lại backend** (cửa sổ 3) là bộ đếm về 0. Mẹo: mỗi vai trò dùng một cửa sổ trình duyệt riêng (Chrome thường + cửa sổ ẩn danh) để khỏi đăng xuất/đăng nhập lại liên tục.
2. **Thu tiền chỉ chạy được một lần** — từ giao dịch thứ hai trở đi backend trả lỗi trùng `gatewayTransactionId` (lỗi backend đã báo, mục 10 của `16-YEU-CAU-API-BACKEND.md`). Trước khi backend sửa, mỗi vòng test chỉ nghiệm thu được một lần thu tiền; muốn thu tiếp thì nạp lại dữ liệu mẫu (bước 2).
3. **Dữ liệu test giữ nguyên** giữa các lần tắt/bật, khác với dữ liệu giả (F5 là về ban đầu). Muốn quay lại trạng thái sạch thì chạy lại bước 2.

### 1.3. Nghiệm thu theo thứ tự nào

Không bấm lung tung — các màn phụ thuộc dữ liệu của nhau. Thứ tự đỡ tốn công nhất:

| Đợt | Màn | Vì sao trước |
|---|---|---|
| 1 | Mục 1 (Đăng nhập, Đổi mật khẩu, 403) | Sai ở đây thì không test được gì khác |
| 2 | Mục 2, 12, 3 (Loại phòng → Tòa nhà → Phòng) | Dựng cơ sở vật chất trước |
| 3 | Mục 22, 5, 4 (Đăng ký tài khoản → Đăng ký chỗ ở → Duyệt đơn) | Tạo ra sinh viên đang ở + hợp đồng + 2 hóa đơn cho các màn sau |
| 4 | Mục 6, 7 (Trang chủ SV, Hợp đồng) | Xem kết quả của đợt 3 |
| 5 | Mục 13, 14, 15, 16, 17 (Loại phí → Chỉ số → Hóa đơn → Chi tiết + thu tiền → Lịch sử thanh toán) | Toàn bộ khâu tiền |
| 6 | Mục 18, 21 (Nhu yếu phẩm quản trị ↔ Mua sắm của SV) | Cần sinh viên đang ở |
| 7 | Mục 8, 9, 19, 20 (Yêu cầu, Cổng SV còn lại) | Cần hợp đồng và hóa đơn đã có |
| 8 | Mục 10, 11 (Dashboard, Tài khoản) | Dashboard chỉ đúng khi đã có dữ liệu thật |

Mỗi mục làm xong: đánh dấu `- [x]` từng dòng đạt, ghi dòng không đạt vào phần **Lỗi phát hiện** của mục đó, rồi cập nhật cột **Trạng thái** ở bảng theo dõi mục 0.

### 1.4. Kiểm tra chung — áp dụng cho MỌI màn

- [ ] F12 → **Console** trong suốt quá trình test: không có dòng đỏ, không có cảnh báo vàng chứa chữ `antd` hoặc `Warning:`.
- [ ] Cửa sổ rộng (≥ 1440px): bố cục giống ảnh thiết kế trong `design/` (khác biệt đã chấp nhận được liệt kê trong từng màn).
- [ ] Thu hẹp cửa sổ còn khoảng 900px (F12 → biểu tượng điện thoại/máy tính bảng → Responsive, gõ 900): không có thanh cuộn ngang ở cả trang.
- [ ] Đăng nhập `viewer@dorm.local`: xem được dữ liệu, không thấy nút thêm / sửa / duyệt nào.

---

## 2. Đăng nhập · Đổi mật khẩu · Không có quyền (SCR-01, 03, 04)

**Nhánh:** `feature/login-and-room-types` · **Chạy:** dữ liệu giả, sau đó lặp lại mục 2.1–2.3 với backend thật.

### 2.1. Đăng nhập

- [x] Vào `/login` → bố cục 2 nửa: trái nền xanh có logo và dòng "Phiên bản v1.0", phải là form. Ô "Ghi nhớ đăng nhập" đã tích sẵn.
- [X] Bấm **Đăng nhập** khi để trống → dưới ô Email hiện "Vui lòng nhập email", dưới ô Mật khẩu hiện "Vui lòng nhập mật khẩu".
- [X] Email gõ `abc` → "Email không đúng định dạng".
- [X] `admin@dorm.local` + mật khẩu sai → khung đỏ "Email hoặc mật khẩu không chính xác", vẫn ở trang đăng nhập.
- [x] F12 → **Network** → bấm request `login` → **Response**: `code` là `INVALID_CREDENTIALS`, mã HTTP 401.
- [X] Đăng nhập đúng `admin@dorm.local / Admin@123` → chuyển tới `/admin/dashboard`, góc phải trên hiện tên người dùng.
- [x] F12 → **Application** → **Local Storage** → `http://localhost:5173` có hai khóa `token` và `user` (vì đã tích "Ghi nhớ").
- [X] Đóng tab, mở lại `http://localhost:5173` → vẫn đăng nhập, không phải nhập lại.
- [X] Đăng xuất → đăng nhập lại nhưng **bỏ tích** "Ghi nhớ" → token nằm ở **Session Storage**, không ở Local Storage.
- [X] Đang đăng nhập mà gõ `/login` trên thanh địa chỉ → tự quay về trang chủ đúng vai trò.
- [X] Bấm "Cần trợ giúp?" → hiện khung thông tin hỗ trợ (phòng quản sinh, hotline).

### 2.2. Chặn theo vai trò

- [X] Đăng nhập `sv001@dorm.local` → vào `/portal/home`.
- [X] Gõ `/admin/rooms` → trang **403 Không có quyền**, hiện tài khoản đang dùng, có nút "Về trang chủ" và "Đăng nhập tài khoản khác".
- [X] Bấm "Đăng nhập tài khoản khác" → về `/login`, đã đăng xuất.
- [X] Chưa đăng nhập, gõ `/admin/rooms` → bị đưa về `/login`; đăng nhập admin xong → **quay lại đúng** `/admin/rooms`.

### 2.3. Đổi mật khẩu

- [x] Đăng nhập `doimk@dorm.local / Tam@12345` → bị đưa thẳng tới trang **Đổi mật khẩu**, có khung vàng "Bạn đang dùng mật khẩu tạm".
- [X] Bấm menu hoặc gõ `/admin/dashboard` → vẫn bị giữ ở trang đổi mật khẩu.
- [X] Mật khẩu mới `abc` → "Mật khẩu tối thiểu 8 ký tự"; `abcdefgh` → "Mật khẩu phải có cả chữ và số"; ô nhập lại khác → báo không khớp.
- [X] Mật khẩu hiện tại sai → lỗi hiện **ngay dưới ô Mật khẩu hiện tại** (không phải thông báo góc màn hình).
- [x] Nhập đúng `Tam@12345` → mới `Moi@12345` → "Đổi mật khẩu thành công", vào được dashboard.
- [X] Network → request đổi mật khẩu → **Payload** có đúng 2 trường `oldPassword`, `newPassword`.

### 2.4. Phiên đăng nhập hỏng

- [X] Đăng nhập admin → F12 → Application → Local Storage → sửa giá trị khóa `user`, đổi `"role":"admin"` thành `"role":"ADMIN"` → F5 → bị đưa về `/login` (không kẹt ở trang 403).

**Lỗi phát hiện:** _(chưa có)_

---

## 3. Loại phòng (SCR-22)

**Nhánh:** `feature/login-and-room-types` · **Đường dẫn:** Cơ sở vật chất → Loại phòng · **Chạy:** dữ liệu giả, tài khoản `admin@dorm.local`.

- [X] Lưới thẻ 3 cột, mỗi thẻ có: tag hạng, tên (VD "Tiêu chuẩn · 6 người"), giá `/người/tháng`, tiện nghi, số phòng và số chỗ trống. Loại không còn chỗ ghi "hết chỗ" màu đỏ (nếu có).
- [X] Segmented "Tất cả · Tiêu chuẩn · Chất lượng cao" → lọc đúng hạng.
- [X] Bấm **Sửa** trên một thẻ đang có phòng dùng → drawer "Sửa loại phòng": ô **Hạng phòng** và **Sức chứa** bị khóa, rê chuột thấy "Đang có N phòng dùng loại này — tạo loại mới nếu cần đổi".
- [X] Trong drawer có khung vàng "Lưu ý quan trọng — Đổi giá hoặc tiền cọc không ảnh hưởng hợp đồng đã ký".
- [X] Đổi giá → **Lưu thay đổi** → "Cập nhật loại phòng thành công", thẻ hiện giá mới.
- [X] **Thêm loại phòng** trùng hạng + sức chứa đã có (VD Tiêu chuẩn · 6) → báo "Loại phòng này đã tồn tại".
- [X] Thêm loại mới (VD Chất lượng cao · 8) → thẻ mới xuất hiện.
- [X] Đăng nhập `staff@dorm.local` hoặc `viewer@dorm.local` → không có nút "Thêm loại phòng", không có link "Sửa".

**Lỗi phát hiện:** _(chưa có)_

---

## 4. Quản lý phòng — sơ đồ tầng (SCR-23)

**Nhánh:** `feature/room-management` · **Đường dẫn:** Cơ sở vật chất → Phòng · **Chạy:** dữ liệu giả, tài khoản `admin@dorm.local`, F5 trước khi bắt đầu.

**Khác thiết kế đã chấp nhận:** không có nút "Xếp chỗ" (giường do hệ thống tự gán khi duyệt đơn — BR-38), không có "Sơ đồ 3D", bảo trì chỉ có ghi chú (không có mã phiếu), tiện nghi không kèm số lượng, không có ô điện nước.

### 4.1. Sơ đồ

- [X] Mặc định chọn **Tòa A**. Các tầng xếp **Tầng 3 → 2 → 1** từ trên xuống; đầu mỗi tầng ghi "N phòng (x/y giường đang sử dụng)" và "Tỷ lệ: z%".
- [X] 4 chip chú giải: Còn chỗ · Sắp đầy · Đã đầy · Có giường bảo trì.
- [X] Đối chiếu số liệu Tòa A: **A101** "Đã đầy" 6/6 nền xám · **A102** nền đỏ "Hết chỗ", dòng dưới "1 bảo trì", 5/6 · **A206** "Còn 1 chỗ" nền vàng 7/8 · **A310** "Còn 4 chỗ" 0/4.
- [X] Không ô nào bị vỡ chữ xuống dòng lung tung (đặc biệt A102).
- [X] Rê chuột lên một ô → tooltip tên loại phòng + giá.

### 4.2. Khung chi tiết + bảo trì giường

- [X] Bấm **A309** → khung phải "Phòng A309 · Tầng 3 · Tòa A", tag hạng / loại / giới tính, đơn giá, danh sách giường, "Cấp sẵn trong phòng".
- [X] Giường có người: tên, mã SV · lớp, **không có nút**.
- [X] Giường trống (xanh): dòng "Sẵn sàng — tự gán khi duyệt đơn đăng ký" + nút **Bảo trì**.
- [X] Bấm **Bảo trì** → hộp thoại có ô ghi chú (đếm tối đa 200 ký tự) → gõ "Khung giường gãy" → **Chuyển bảo trì** → giường chuyển đỏ, hiện ghi chú; ô A309 trên sơ đồ **đổi sang đỏ ngay** không cần F5.
- [X] Bấm **Mở lại** → hộp xác nhận → **Mở lại** → giường về xanh, ô A309 về màu cũ.
- [X] Network → request `beds/.../status` → Payload `{ "status": "maintenance", "note": "Khung giường gãy" }`.

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

## 24. v2 · M1 — Cắt phần không còn dùng

Chạy dữ liệu giả: `VITE_USE_MOCK=true npx vite --port 5174 --strictPort`, mở `http://localhost:5174`. Các mục 9, 10, 19, 22, 23 phía trên mô tả màn đã bỏ, không cần test nữa.

### 24.1. Vai trò và đăng nhập

- [ ] Đăng nhập `viewer@dorm.local` / `Viewer@123` → báo "Tài khoản hoặc mật khẩu không chính xác".
- [ ] Mở `/register` → trang 404.
- [ ] Khung tài khoản thử ở màn đăng nhập không còn dòng "Người xem".
- [ ] `admin@dorm.local` / `Admin@123` → màn Tài khoản: bộ lọc vai trò và nút chọn vai trò không còn "Người xem".
- [ ] `doimk@dorm.local` / `Tam@12345` → vẫn bị chuyển sang đổi mật khẩu.

### 24.2. Khu quản trị (`staff@dorm.local` / `Staff@123`)

- [ ] Menu trái không còn **Yêu cầu** và **Nhu yếu phẩm**.
- [ ] `/admin/requests`, `/admin/supplies` → trang 404.
- [ ] Dashboard: dòng **Cần xử lý** chỉ còn "đơn đăng ký chờ duyệt".
- [ ] Hợp đồng: bấm một dòng → drawer mở bình thường, không có thông báo về yêu cầu gia hạn.
- [ ] Hợp đồng: bấm **Chấm dứt hợp đồng** → nội dung không nhắc đơn nhu yếu phẩm, chấm dứt thành công.
- [ ] Hóa đơn: bấm **Thu tiền** một hóa đơn còn nợ, xác nhận → báo "Đã thu", không nhắc đơn hàng.

### 24.3. Cổng sinh viên (`sv001@dorm.local` / `Student@123`)

- [ ] Menu còn đúng 3 mục: Trang chủ, Chỗ ở & hợp đồng, Hóa đơn. Không còn nút giỏ hàng.
- [ ] Bấm vào tên tài khoản → không còn "Đơn hàng của tôi".
- [ ] Trang chủ: không còn khối Nhu yếu phẩm và nút Gia hạn.
- [ ] Chỗ ở & hợp đồng: không còn nút Gia hạn, Xin trả phòng; có dòng "Muốn trả phòng, bạn đến văn phòng KTX làm thủ tục".
- [ ] `/portal/my-requests`, `/portal/shop`, `/portal/my-orders` → trang 404.
- [ ] `sv004@dorm.local` (hợp đồng sắp hết hạn) → cảnh báo hướng dẫn nộp đơn mới, không có nút Gia hạn.

**Lỗi phát hiện:** _(chưa có)_

---

## 25. v2 · M2 — Đăng nhập, tài khoản, nhận diện

Chạy dữ liệu giả như mục 24. Từ mốc này, các mã phòng hiện dạng `K1-101`, MSSV dạng `2021600001`. Các mục cũ nhắc `SV2026…`, Tòa A, B hiểu theo dữ liệu mới.

### 25.1. Đăng nhập (FR-01)

- [ ] Màn đăng nhập hiện "KÝ TÚC XÁ HaUI", ô nhập có nhãn **Email hoặc mã sinh viên**.
- [ ] Để trống ô đó, bấm Đăng nhập → "Vui lòng nhập email hoặc mã sinh viên".
- [ ] `admin@dorm.local` / `Admin@123` → vào Dashboard.
- [ ] `2021600001` / `Student@123` (sv001 dùng MSSV) → vào Cổng sinh viên.
- [ ] `2021600001` / `sai` → khung đỏ "Tài khoản hoặc mật khẩu không chính xác".
- [ ] `staff2@dorm.local` / `Staff@123` (đã khóa) → báo tài khoản bị vô hiệu hóa.

### 25.2. Đổi mật khẩu lần đầu (FR-05, UC-04)

> Nếu đăng nhập bằng `2021600005` mà Chrome không nhận phím ở trang đổi mật khẩu, đăng nhập lại bằng `sv008@dorm.local` / `2021600005`. Chrome chạy tự động khi kiểm thử gặp hiện tượng này khi tên đăng nhập trùng mật khẩu; cùng tài khoản đăng nhập bằng email thì bình thường.

- [ ] `2021600005` / `2021600005` → bị chuyển sang Đổi mật khẩu, cảnh báo nêu "mật khẩu hiện tại là mã sinh viên".
- [ ] Gõ thẳng `/portal/home` trên thanh địa chỉ → vẫn quay lại Đổi mật khẩu.
- [ ] Mật khẩu hiện tại sai → lỗi ngay dưới ô đó.
- [ ] Mật khẩu mới `2021600005` → báo không được trùng mã sinh viên.
- [ ] Mật khẩu mới `Ktx@2026`, nhập lại đúng → vào Trang chủ sinh viên.

### 25.3. Tài khoản (`admin@dorm.local`)

- [ ] Nút **Thêm tài khoản cán bộ** → form chỉ có 2 vai trò: Quản trị viên, Cán bộ KTX. Không có ô chọn hồ sơ sinh viên.
- [ ] Tạo tài khoản email mới, vai trò Cán bộ KTX → hiện mật khẩu tạm một lần. Đăng nhập bằng email đó → buộc đổi mật khẩu.
- [ ] Sửa một tài khoản sinh viên → vai trò khóa ở Sinh viên, ô họ tên khóa.
- [ ] Sửa chính mình → không đổi được vai trò.

### 25.4. Nhận diện và dữ liệu

- [ ] Header khu quản trị và cổng sinh viên hiện "KÝ TÚC XÁ HaUI". Tab trình duyệt ghi "Ký túc xá HaUI".
- [ ] Màn Tòa nhà có K1, K2 hoạt động, K3, K4 ngừng hoạt động.
- [ ] Màn Phòng hiện mã dạng `K1-101`. Trang chủ sinh viên hiện Phòng `K1-101` · Giường `01`, header ghi Phòng K1-101.

**Lỗi phát hiện:** _(chưa có)_

---

## 26. v2 · M3 — Tòa nhà và phòng

Chạy dữ liệu giả như mục 24, đăng nhập `staff@dorm.local` / `Staff@123`. Mục 3 (Loại phòng) phía trên không cần test nữa.

### 26.1. Bỏ Loại phòng

- [ ] Menu **Cơ sở vật chất** còn Tòa nhà và Phòng. Mở `/admin/room-types` → trang 404.

### 26.2. Tòa nhà (FR-20, FR-21)

- [ ] Cột **Tòa nhà** hiện tên và mô tả trên một dòng, không bị ngắt từng chữ.
- [ ] **Thêm tòa nhà**: chỉ có Mã, Tên, Mô tả. Tạo mã `K5` → xuất hiện trong danh sách.
- [ ] Tạo lại mã `K5` → lỗi dưới ô Mã.
- [ ] Tòa K1 (còn người ở): nút **Ngừng hoạt động** bị khóa.

### 26.3. Danh sách phòng (FR-22)

- [ ] Bộ lọc có Tòa nhà, Giới tính, Sức chứa, Tầng, Tình trạng. Không còn lọc Loại phòng.
- [ ] Ô phòng hiện mã `K1-101` và `6 chỗ`. Rê chuột thấy đơn giá và tiền cọc.
- [ ] Lọc Sức chứa = 8 → chỉ còn phòng 8 chỗ. Lọc Tình trạng = Còn chỗ → không còn phòng hết chỗ.
- [ ] Đổi sang **Danh sách**: có cột Sức chứa và Đơn giá.
- [ ] Bấm một phòng: thấy đơn giá, tiền cọc, danh sách giường kèm tên và MSSV người ở. Không có nút bảo trì giường, không có mục "Cấp sẵn trong phòng".

### 26.4. Thêm và sửa phòng (FR-24, FR-25)

- [ ] **Thêm phòng**: Sức chứa chỉ có 4, 6, 8 chỗ; có ô Đơn giá và Tiền cọc (mặc định 500.000).
- [ ] Tạo phòng `501`, tầng 5, Nam, 8 chỗ, đơn giá `300.000` → báo tạo với 8 giường. Bấm vào thấy đủ 8 giường trống và đúng giá.
- [ ] Tạo lại số phòng `501` cùng tòa → lỗi dưới ô Số phòng.
- [ ] Sửa phòng có người ở: Giới tính và Sức chứa bị khóa, vẫn đổi được đơn giá.
- [ ] Sửa phòng `501` thành 4 chỗ → cảnh báo tạo lại giường; lưu xong còn 4 giường.
- [ ] Chuyển phòng `501` sang **Đang bảo trì** → ô phòng màu xám, ghi "Đang bảo trì".

### 26.5. Màn cũ vẫn chạy

- [ ] `2021600086` / `Student@123` (sv002, chưa có chỗ) → **Đăng ký chỗ ở** vẫn chọn được, loại phòng hiện "Phòng 6 chỗ". Màn này được viết lại ở M4.

**Lỗi phát hiện:** _(chưa có)_

---

## 27. v2 · M4 — Nộp đơn công khai, tra cứu, duyệt đơn

Chạy dữ liệu giả như mục 24. ⚠️ Dữ liệu giả **mất khi tải lại trang (F5)**: các bước 27.2 → 27.4 phải làm liền, chỉ bấm trong app, không gõ địa chỉ mới lên thanh trình duyệt. Mục 4, 5 phía trên không cần test nữa.

### 27.1. Lối vào

- [ ] Màn đăng nhập có nút **Đăng ký ở ký túc xá** và link **Tra cứu tiến độ**. Bấm nút → mở `/apply`, không bắt đăng nhập.
- [ ] Mở `/portal/apply` → trang 404.

### 27.2. Nộp đơn (FR-30, UC-01)

- [ ] Bấm **Tiếp tục chọn phòng** khi chưa nhập gì → báo thiếu mã sinh viên, họ tên, giới tính, số điện thoại, email.
- [ ] Nhập MSSV `2021609999`, họ tên `Phạm Thị Thu`, giới tính **Nữ**, SĐT `0912345678`, email `thu.pham@gmail.com` → sang bước 2.
- [ ] Chỉ thấy phòng nữ (tòa K2), xếp tầng thấp trước. Phòng đầu tiên (K2-102) gắn nhãn **Gợi ý**.
- [ ] Giường "Đã có người" và "Đã có người đăng ký" (vd K2-205 giường 03) không bấm được.
- [ ] Chọn **K2-205 giường 04** (giường nhận đơn cuối của phòng) → Tiếp tục → tích xác nhận → **Gửi đơn đăng ký** → báo giường vừa có người khác đăng ký, quay lại bước 2, giường 04 đổi sang "Đã có người đăng ký". *(Dữ liệu giả cố ý tạo người tranh chỗ ở phòng này.)*
- [ ] Chọn K2-102 giường 06 → Tiếp tục → chọn **6 tháng**: tổng = 320.000 × 6 + 500.000 = **2.420.000 đ**. Chưa tích xác nhận thì nút gửi bị khóa.
- [ ] Tích xác nhận → gửi → thấy mã đơn, trạng thái **Chờ duyệt**. Bấm **Tra cứu tiến độ đơn** → "Đơn đang chờ cán bộ duyệt".
- [ ] Bấm logo để về `/apply`, nộp lại với MSSV `2021609999` → báo đã có đơn, quay về bước 1, lỗi dưới ô Mã sinh viên.
- [ ] Thu cửa sổ còn ~390px: form không cuộn ngang.

### 27.3. Duyệt đơn (FR-31, FR-32, FR-33, UC-02)

Từ màn đăng nhập (bấm **Đăng nhập** ở góc phải), vào `staff@dorm.local` / `Staff@123` → **Duyệt đơn đăng ký**.

- [ ] Hàng chờ có đơn của Phạm Thị Thu. Không còn nút "Lập đơn cho sinh viên", không còn lọc loại phòng.
- [ ] Đơn **Phạm Phương Linh** (2021600076): cảnh báo giường 01 đã có người nhận, nút **Duyệt đơn** bị khóa. Phòng K2-101 hết giường → đổi phòng ở ô Phòng, chọn giường → có nhãn "Khác lựa chọn của sinh viên" → duyệt → thông báo thành công.
- [ ] Đơn **Vũ Minh Châu** (2021600078): bấm duyệt → báo giường vừa có người nhận, nút duyệt khóa lại. Chọn giường khác (đổi phòng nếu được nhắc) → duyệt được. *(Dữ liệu giả cố ý tạo tranh chỗ lúc duyệt.)*
- [ ] Một đơn bất kỳ → **Từ chối**, lý do dưới 10 ký tự bị chặn; lý do đủ → đơn sang tab **Đã từ chối**, hiện lý do.
- [ ] Đơn Phạm Thị Thu → duyệt → thông báo có **Tài khoản 2021609999**, email `thu.pham@gmail.com`, 2 hóa đơn (500.000 đ + 1.920.000 đ).
- [ ] **Hợp đồng** tab Tất cả: không có đơn chờ hay bị từ chối; có cột Gói thuê, không còn Loại phòng.
- [ ] **Dashboard**: không còn thẻ "Chỗ trống theo loại phòng"; số đơn chờ trên menu giảm sau mỗi lần xử lý.

### 27.4. Sinh viên vừa được duyệt

- [ ] Đăng xuất, đăng nhập `thu.pham@gmail.com` / `2021609999` → bị chuyển sang Đổi mật khẩu.

### 27.5. Tra cứu và cổng sinh viên chưa có chỗ

- [ ] `/apply/status`, MSSV `2021600074`, email `sv2021600074@sv.edu.vn` → **Đơn bị từ chối** kèm lý do, nút Nộp đơn mới.
- [ ] Cùng MSSV, email sai → "Không tìm thấy đơn đăng ký…".
- [ ] MSSV `2021600001`, email `sv2021600001@sv.edu.vn` → **Đơn đã được duyệt**, có thời hạn, nút Đăng nhập.
- [ ] `sv006@dorm.local` / `Student@123` → Trang chủ: thẻ "Đơn đăng ký đang chờ duyệt", không có nút hủy.
- [ ] `sv005@dorm.local` → thẻ bị từ chối kèm lý do, nút **Nộp đơn mới** mở `/apply`.
- [ ] `sv007@dorm.local` → "Bạn chưa có chỗ ở", ghi hợp đồng cũ đã kết thúc ngày nào.

**Lỗi phát hiện:** _(chưa có)_

---

## 28. v2 · M5 — Hợp đồng, thanh lý, hoàn cọc, chỗ ở của sinh viên

Chạy dữ liệu giả như mục 24. ⚠️ Dữ liệu giả **mất khi tải lại trang (F5)**: các bước 28.2 → 28.4 phải làm liền, chỉ bấm trong app. Mục 8, 20 phía trên không cần test nữa.

Dữ liệu dựng sẵn: hai hợp đồng **đã quá hạn 5 ngày** chưa thanh lý — `HD-2026-0010` (Trần Phương Linh, tài khoản `sv009`, còn nợ) và `HD-2026-0011` (Lê Quốc Bảo, đã trả hết). Hai hợp đồng năm trước **chờ hoàn cọc**: `HD-2025-0001` (sv007) và `HD-2025-0003`.

### 28.1. Danh sách hợp đồng (SCR-32)

`staff@dorm.local` / `Staff@123` → **Hợp đồng**.

- [ ] Năm tab: **Đang hiệu lực** (mặc định), **Hết hạn** (số 2, nền vàng), **Chờ hoàn cọc** (số 2, nền vàng), **Đã chấm dứt**, **Tất cả**. Không còn tab "Sắp hết hạn".
- [ ] Cột: Mã hợp đồng, Sinh viên, Chỗ ở (`K1-101 · Giường 01`), Gói thuê, Thời hạn, Tiền phòng cả kỳ, Tiền cọc (kèm nhãn **Đang giữ cọc**), Công nợ, Trạng thái.
- [ ] Hợp đồng còn ≤ 30 ngày ghi "còn N ngày" màu vàng (vd `HD-2026-0004` còn 20 ngày).
- [ ] Lọc **Mọi gói thuê** → 6 tháng: chỉ còn hợp đồng 6 tháng. Lọc tòa, tìm theo mã hợp đồng hoạt động.
- [ ] Mở `/admin/contracts?tab=refund` → vào thẳng tab Chờ hoàn cọc. *(Link từ Dashboard sang đây đã bỏ ở M9.)*

### 28.2. Thanh lý bị chặn vì còn nợ (FR-34, BR-04)

- [ ] Tab **Hết hạn** → 2 dòng, ghi "quá hạn 5 ngày, chưa thanh lý".
- [ ] Mở `HD-2026-0010` → cảnh báo "đã hết hạn 5 ngày, sinh viên vẫn giữ giường"; chân drawer có nút **Thanh lý hợp đồng**, không có nút hoàn cọc, không còn ô sửa điều khoản.
- [ ] Bấm **Thanh lý hợp đồng** → hộp thoại **không có ô nhập** nào, ghi rõ: không hoàn tác, kiểm kê tài sản + thu chìa khóa, giường trả về trống, cọc hoàn tại văn phòng.
- [ ] Bấm **Thanh lý hợp đồng** trong hộp thoại → báo "Còn 2 hóa đơn chưa thanh toán…" (tiền phòng cả kỳ của sinh viên + điện nước của phòng K2-101), liệt kê mã hóa đơn + số tiền. Hợp đồng vẫn Hết hạn. Bấm Hủy.

### 28.3. Thanh lý → hoàn cọc (FR-34, FR-35, BR-08)

- [ ] Đóng drawer, mở `HD-2026-0011` → **Thanh lý hợp đồng** → xác nhận → thông báo thành công. Drawer đổi sang **Đã chấm dứt** + nhãn **Chờ hoàn cọc**, có dòng "Thanh lý ngày" là hôm nay; nút Thanh lý biến mất, hiện nút **Xác nhận đã hoàn cọc**.
- [ ] Tab **Chờ hoàn cọc** tăng lên 3, tab Hết hạn giảm còn 1.
- [ ] Vào **Phòng** → K1-101: giường 06 đã trống.
- [ ] Quay lại mở `HD-2026-0011` → **Xác nhận đã hoàn cọc** → hộp thoại hỏi lại, nêu 500.000 đ, không có ô nhập số tiền → **Đã hoàn cọc**.
- [ ] Nhãn đổi **Đã hoàn cọc**; dòng Tiền cọc ghi giờ xác nhận + "Lê Thị Nhân Viên"; Lịch sử có mục **Hoàn cọc**; hết nút hoàn cọc. Tab Chờ hoàn cọc về 2.
- [ ] Tab **Chờ hoàn cọc** → mở `HD-2025-0001` (sv007) → **Xác nhận đã hoàn cọc** → hợp đồng rời khỏi tab này.

### 28.4. Cổng sinh viên

Đăng xuất (menu tài khoản góc phải), đăng nhập lại — không F5.

- [ ] `sv007@dorm.local` / `Student@123` → Trang chủ "Bạn chưa có chỗ ở", nhãn xanh **Đã nhận lại cọc ngày …** (vừa xác nhận ở 28.3).
- [ ] **Chỗ ở & hợp đồng** (sv007): bảng Lịch sử lưu trú có cột Tiền cọc, dòng "Trả phòng dd/mm/yyyy"; không còn lý do chấm dứt.
- [ ] `sv009@dorm.local` / `Student@123` → Trang chủ: thẻ công nợ đỏ, thẻ **Hợp đồng đã hết hạn ngày …**; thẻ Hợp đồng ghi "Quá hạn 5 ngày", trạng thái **Hết hạn**. Không còn "Loại phòng", "Có sẵn trong phòng".
- [ ] **Chỗ ở & hợp đồng** (sv009): có Gói thuê, Thời hạn, Đơn giá, Tiền phòng cả kỳ, Tiền cọc ("Hoàn lại tại văn phòng sau khi trả phòng"). Không còn Điều khoản, "Phòng đã có sẵn". Header ghi **Phòng K2-101**.
- [ ] `sv004@dorm.local` → cảnh báo "còn 20 ngày", ghi rõ không gia hạn, muốn ở kỳ sau thì nộp đơn mới sau khi trả phòng.
- [ ] `sv001@dorm.local` → **Hồ sơ cá nhân**: Chỗ ở hiện tại ghi `K1-101 · Giường 01`, dưới là Tòa K1.
- [ ] Thu cửa sổ còn ~390px ở Trang chủ và Chỗ ở & hợp đồng (sv001): không cuộn ngang.

**Lỗi phát hiện:** _(chưa có)_

---

## 29. v2 · M6 — Chỉ số điện nước, chốt & phát hành

Chạy dữ liệu giả như mục 24. ⚠️ Dữ liệu giả **mất khi tải lại trang (F5)**: các bước 29.2 → 29.5 làm liền, chỉ bấm trong app. Mục 14, 15 phía trên không cần test nữa.

Dữ liệu dựng sẵn: 2 tháng trước đã chốt (có hóa đơn điện nước). Tháng này Tòa K1 đã nhập đủ chưa chốt; Tòa K2 mới nhập 5 phòng, còn **K2-206, K2-207, K2-208** có người mà chưa nhập. Đơn giá mẫu 3.000 đ/kWh, 15.000 đ/m³.

### 29.1. Màn hình (FR-40)

`staff@dorm.local` / `Staff@123` → **Tài chính → Chỉ số điện nước**.

- [ ] Mặc định tháng hiện tại, Tòa K1. Đầu lưới có 2 ô đơn giá **Điện 3.000 đ/kWh**, **Nước 15.000 đ/m³**.
- [ ] Cột **Tiền cả phòng** ghi tổng của phòng và dòng nhỏ "≈ … đ/người". Rê chuột vào biểu tượng máy tính → công thức điện, nước, "một hóa đơn".
- [ ] Phòng trống ghi "Phòng trống", ô bị khóa, cột tiền ghi "Không lập hóa đơn".
- [ ] Ở màn 1366px thấy đủ tới cột Trạng thái và nút lịch sử, không phải cuộn ngang.
- [ ] Menu **Hệ thống** không còn "Danh mục loại phí"; mở `/admin/fee-types` → trang 404.

### 29.2. Nhập và lưu

- [ ] Chọn **Tòa K2** → K2-206, 207, 208 ghi **Chưa nhập**; thanh dưới ghi "3 phòng có người chưa nhập". Ô chỉ số cũ đã tự điền (nền xám) bằng chỉ số mới tháng trước.
- [ ] K2-206: nhập chỉ số điện mới **nhỏ hơn** chỉ số cũ → ô đỏ "Nhỏ hơn chỉ số cũ", dòng **Lỗi**.
- [ ] Sửa thành lớn hơn, nhập chỉ số nước mới → dòng **Chưa lưu**, nút **Lưu 1 phòng**. Nút **Chốt & phát hành** bị khóa, rê chuột thấy "Lưu các thay đổi trước khi chốt".
- [ ] Bấm **Lưu 1 phòng** → "Đã lưu 1 phòng", dòng **Đã lưu**.
- [ ] Đổi tháng hoặc tòa khi đang sửa dở → hỏi "Bỏ các thay đổi chưa lưu?".

### 29.3. Đổi đơn giá (D4)

- [ ] Sửa đơn giá điện thành **3.500** → dòng vàng "Đơn giá đã đổi — bấm Lưu…", cả 6 phòng đã nhập chưa chốt chuyển **Chưa lưu**, nút **Lưu 6 phòng**.
- [ ] Lưu → tiền cả phòng tính theo 3.500. Ô đơn giá vẫn là 3.500.
- [ ] Xoá trống ô đơn giá nước rồi bấm Lưu → báo "Nhập đơn giá nước", không gửi gì.

### 29.4. Chốt & phát hành (FR-41)

- [ ] Bấm **Chốt & phát hành (6)** → hộp thoại ghi "Tạo 6 hóa đơn, mỗi phòng một hóa đơn, tổng …, hạn nộp 7 ngày", có cảnh báo vàng "2 phòng có người chưa nhập chỉ số: K2-207, K2-208".
- [ ] Xác nhận → "Đã phát hành 6 hóa đơn điện nước", ghi số sinh viên nhận email.
- [ ] 6 phòng chuyển **Đã phát hành**, ô chỉ số bị khóa. Thanh dưới còn "2 phòng có người chưa nhập".
- [ ] Nhập K2-207 → Lưu → **Chốt & phát hành (1)** → chỉ phát hành thêm 1 hóa đơn, 6 phòng cũ không bị phát hành lần hai.
- [ ] Chọn tháng trước → thông báo xanh "… đã chốt", ô chỉ số và đơn giá bị khóa, không có thanh lưu.

### 29.5. Lịch sử phòng và hóa đơn

- [ ] Bấm biểu tượng đồng hồ ở dòng K2-206 → drawer "Lịch sử điện nước phòng K2-206": 3 tháng, mới nhất trên cùng, mỗi tháng có chỉ số, đơn giá, tiền cả phòng, số người, trạng thái.
- [ ] **Hóa đơn**: không còn nút "Lập hóa đơn hàng loạt", "Tạo hóa đơn lẻ".
- [ ] Tìm `INV-UTIL-K2-206` → 1 dòng, cột Sinh viên ghi **Cả phòng**, loại **Điện nước**. Mở chi tiết không lỗi. *(Màn Hóa đơn làm lại ở M7 nên cách hiển thị còn kiểu cũ.)*

**Lỗi phát hiện:** _(chưa có)_

---

## 30. v2 · M7 — Hóa đơn, thu tiền, phiếu thu

Chạy dữ liệu giả như mục 24. ⚠️ Dữ liệu giả **mất khi tải lại trang (F5)**: làm liền 30.1 → 30.4, chỉ bấm trong app. Mục 16, 17, 18 phía trên không cần test nữa.

Dữ liệu dựng sẵn: mọi sinh viên đã nộp cọc; một số chưa nộp **tiền phòng cả kỳ**, trong đó có sv001 (`2021600001`, 1.920.000 đ). Hóa đơn điện nước tháng trước còn vài phòng chưa nộp, vd `INV-UTIL-K1-104-…`, `INV-UTIL-K2-206-…`.

### 30.1. Danh sách (FR-50)

`staff@dorm.local` / `Staff@123` → **Tài chính → Hóa đơn**.

- [ ] 3 thẻ **Phải thu / Đã thu / Chưa thu**; Phải thu = Đã thu + Chưa thu. Không còn thẻ Quá hạn, nút Lập hàng loạt, Tạo lẻ, Hủy.
- [ ] Ở 1366px thấy đủ cột Số tiền, Hạn nộp, Trạng thái và nút **Thu tiền** mà không phải cuộn ngang.
- [ ] Hóa đơn điện nước ghi **Cả phòng K…-…**; hóa đơn cá nhân ghi họ tên, dưới là MSSV · phòng.
- [ ] Hạn nộp đã qua mà chưa thu thì ngày tô đỏ (không có trạng thái "Quá hạn" riêng). Đã thu thì dưới trạng thái ghi tên người nộp và ngày.
- [ ] Bộ lọc Cá nhân / Cả phòng, Loại (3 loại), Trạng thái (2 trạng thái), Tòa đều lọc đúng. Bấm "… hóa đơn — xem ngay" ở thẻ Chưa thu → lọc Chưa thanh toán.

### 30.2. Thu tiền mặt hóa đơn cá nhân (FR-52, UC-06)

- [ ] Tìm `2021600001` → dòng **Tiền phòng cả kỳ** chưa thanh toán → **Thu tiền**.
- [ ] Modal: số tiền cố định (không có ô nhập số tiền, không có "thu một phần"), không có ô chọn người nộp. Nút ghi "Xác nhận đã thu 1.920.000 đ".
- [ ] Xác nhận → modal đổi thành **biên lai**: mã `PAY-2026-…`, số tiền, hóa đơn, người nộp Nguyễn Văn An, hình thức Tiền mặt, người thu Lê Thị Nhân Viên, thời gian. Có nút **In biên lai** (bản in chỉ có biên lai).
- [ ] **Xong** → dòng chuyển Đã thanh toán, mất nút Thu tiền.
- [ ] Mở **Thu tiền** một hóa đơn khác ngay sau đó → modal là form mới, không còn biên lai cũ.

### 30.3. Xác nhận VietQR hóa đơn điện nước (FR-54, D5)

- [ ] Lọc Cả phòng + Chưa thanh toán → **Thu tiền** một hóa đơn điện nước → modal có ô **Người nộp (đại diện cả phòng)**, danh sách là người đang ở phòng.
- [ ] Chọn **Đã nhận chuyển khoản VietQR** → hiện nội dung chuyển khoản `HAUI INVUTIL… P<phòng>` (sao chép được) và ô **Mã giao dịch ngân hàng** ghi "Không bắt buộc".
- [ ] Bấm xác nhận khi chưa chọn người nộp → báo "Chọn bạn đã nộp tiền".
- [ ] Chọn người nộp, nhập mã `ft26test01` → biên lai ghi mã `FT26TEST01` (tự viết hoa), "nộp cho cả phòng".
- [ ] Thu một hóa đơn điện nước khác bằng VietQR với cùng mã `FT26TEST01` → báo lỗi tại ô "đã được ghi nhận trước đó", không tạo phiếu. Xoá mã đi → xác nhận được.

### 30.4. Chi tiết hóa đơn và phiếu thu (FR-51)

- [ ] Mở hóa đơn điện nước vừa thu: thẻ **Chỉ số điện nước** (chỉ số, tiêu thụ, đơn giá, thành tiền, số người chốt lúc phát hành), thẻ **Đang ở phòng**, khung **Thanh toán** là biên lai + **In biên lai**.
- [ ] Mở một hóa đơn chưa thu: khung Thanh toán ghi nội dung chuyển khoản cần dò và nút **Thu tiền**. Hóa đơn cá nhân có link sang hợp đồng.
- [ ] **Tài chính → Thanh toán**: tiêu đề **Phiếu thu**, 3 thẻ Đã thu / Tiền mặt / Chuyển khoản VietQR (Đã thu = hai thẻ kia cộng lại). Không còn Đang xử lý, Đối soát, Hoàn tiền.
- [ ] Tìm `FT26TEST01` → 1 phiếu. Bấm mã phiếu → drawer biên lai, nút **In** và **Hóa đơn**.
- [ ] **Hợp đồng** → mở `HD-2026-0001` → bảng hóa đơn của hợp đồng có số tiền, mã hóa đơn bấm sang được trang chi tiết.

> Cổng sinh viên (hóa đơn, VNPay thử) làm lại ở M8 — mục này chỉ cần các màn đó mở được, không lỗi.

**Lỗi phát hiện:** _(chưa có)_

---

## 31. v2 · M8 — Cổng sinh viên: hóa đơn, VietQR, chuông

Chạy dữ liệu giả như mục 24. Cần mạng để thấy ảnh QR (lấy từ `img.vietqr.io`); không có mạng thì khối QR báo "Không tải được ảnh QR" và vẫn có thông tin chuyển khoản tay. Mục 21 phía trên không cần test nữa.

Dữ liệu dựng sẵn: `sv009@dorm.local` / `Student@123` (phòng K2-101) còn nợ **tiền phòng cả kỳ** và phòng còn nợ **điện nước tháng trước**. Tài khoản nhận tiền là số mẫu (Vietcombank `0011001234567`, KY TUC XA HAUI) — **đừng chuyển tiền thật**.

### 31.1. Trang chủ và chuông (FR-41, D3)

- [ ] Đăng nhập sv009 → header có **chuông** với số 1. Chuông đứng yên, không rung.
- [ ] Thẻ công nợ ghi số nợ của bạn và thêm "phòng còn … tiền điện nước".
- [ ] Bấm chuông → "Hóa đơn phòng chưa nộp": Điện nước tháng …, số tiền, hạn, "một bạn nộp cho cả phòng". Bấm vào → sang **Hóa đơn**, tab **Của phòng**, đúng hóa đơn đó.
- [ ] Bảng "Hóa đơn gần đây" ở trang chủ có cột Hóa đơn (ghi "Của bạn" / "Của phòng"), Nội dung, Số tiền; bấm **Chi tiết** mở đúng hóa đơn.
- [ ] Sinh viên chưa có chỗ ở (`sv002@dorm.local`) không có chuông.

### 31.2. Hóa đơn của phòng (FR-62)

- [ ] Hai thẻ đầu trang: **Bạn cần nộp** và **Phòng cần nộp (một bạn đại diện)**.
- [ ] Ba tab **Của tôi / Của phòng / Lịch sử nộp tiền**; hai tab đầu có số hóa đơn chưa nộp.
- [ ] Hóa đơn điện nước chưa nộp: số tiền cả phòng, hạn nộp (đỏ nếu đã qua), bảng Điện / Nước (tiêu thụ, chỉ số, đơn giá, thành tiền), dòng "tham khảo ≈ …/người", khung xanh "Một bạn nộp đủ cho cả phòng".
- [ ] Hóa đơn điện nước tháng trước nữa (đã nộp): dòng **Đại diện nộp: <tên>**, biên lai bên dưới, không có QR. Trong danh sách trái cũng ghi "Đại diện: <tên>".

### 31.3. VietQR (FR-53)

- [ ] Hóa đơn chưa nộp có khối **Chuyển khoản bằng mã VietQR**: ảnh QR, số tiền, nội dung, số tài khoản, chủ tài khoản; sao chép được nội dung và số tài khoản.
- [ ] Nội dung hóa đơn phòng dạng `HAUI INVUTILK2101<yyyymm> P101`; tiền phòng của bạn dạng `HAUI INV2026xxxx 2021600010` (mã bỏ dấu `-`, kèm MSSV).
- [ ] Quét QR bằng app ngân hàng (không bấm chuyển): app tự điền đúng số tiền và nội dung.
- [ ] Ghi chú: hóa đơn chuyển Đã thanh toán khi cán bộ xác nhận. Không còn nút VNPay; mở `/portal/payment-result` → 404.

### 31.4. Lịch sử và điện nước phòng (FR-63, FR-42)

- [ ] Tab **Lịch sử nộp tiền**: các lần nộp của bạn và của phòng (kể cả bạn cùng phòng nộp). Bấm một dòng → biên lai.
- [ ] **Chỗ ở & hợp đồng** → thẻ **Điện nước của phòng**: các tháng đã chốt, mới nhất trên cùng, điện, nước, tiền cả phòng, tham khảo mỗi người.
- [ ] Đăng xuất, vào `staff@dorm.local` → Hóa đơn → thu hóa đơn điện nước K2-101 (VietQR, chọn người nộp). Đăng xuất, vào lại sv009 → chuông mất số, hóa đơn chuyển Đã thanh toán, ghi đúng người đại diện.
- [ ] Thu cửa sổ còn ~390px ở màn Hóa đơn: không cuộn ngang, ảnh QR vừa màn.

**Lỗi phát hiện:** _(chưa có)_

---

## 32. v2 · M9 — Dashboard

Chạy dữ liệu giả như mục 24. Mục 11 phía trên không cần test nữa.

### 32.1. Staff (FR-70, FR-71)

`staff@dorm.local` / `Staff@123` → **Dashboard**.

- [ ] 7 thẻ: Tổng số giường (kèm số bảo trì), Đang có người ở, Còn trống, Tỷ lệ lấp đầy (thanh tiến độ, rê vào biểu tượng ⓘ thấy cách tính), Sinh viên đang nội trú, Đơn đăng ký chờ duyệt, Công nợ chưa thu.
- [ ] Tổng số giường = Đang có người ở + Còn trống + số bảo trì (dữ liệu mẫu: 112 = 71 + 39 + 2).
- [ ] Thẻ Công nợ chưa thu ghi tách "Tiền phòng … · điện nước …"; bấm **Xem hóa đơn** → màn Hóa đơn lọc Chưa thanh toán.
- [ ] Thẻ Đơn chờ duyệt có link **Duyệt đơn**.
- [ ] **Lấp đầy theo tòa**: biểu đồ thanh chồng (đã có người / còn trống / bảo trì, rê chuột thấy số từng loại) và bảng Tòa · Phòng · Giường · Đã có người · Còn trống · Bảo trì · Lấp đầy. Chỉ có Tòa K1, K2 (K3, K4 ngừng hoạt động).
- [ ] **Không** có khối Doanh thu. Không còn thẻ "Hợp đồng sắp hết hạn", "Hóa đơn quá hạn", khối "Cần xử lý".

### 32.2. Admin (FR-72)

`admin@dorm.local` / `Admin@123` → **Dashboard**.

- [ ] Có thêm khối **Doanh thu theo tháng**: cột chồng xanh dương (tiền phòng trọn gói) và xanh ngọc (điện nước); rê chuột vào cột thấy từng khoản và tổng.
- [ ] Dòng chú giải ghi tổng cả năm của từng nhóm; bảng bên dưới có từng tháng và dòng **Cả năm**. Tháng không thu gì vẫn có dòng 0 đ.
- [ ] Không tính tiền cọc: tổng doanh thu nhỏ hơn tổng các phiếu thu ở màn Phiếu thu (phần chênh là tiền cọc).
- [ ] Chọn **Năm 2025** → biểu đồ đổi sang năm 2025 (chỉ có tháng 8).
- [ ] Thu một hóa đơn ở màn Hóa đơn rồi quay lại Dashboard → **Làm mới dữ liệu** → tháng hiện tại tăng đúng số vừa thu (trừ khi là tiền cọc), công nợ giảm.
- [ ] Thu cửa sổ còn ~390px: không cuộn ngang.

**Lỗi phát hiện:** _(chưa có)_

---

## 33. v2 · M10 — Sinh viên và Excel

Chạy dữ liệu giả như mục 24. Cần Microsoft Excel (hoặc LibreOffice / Google Sheets) để mở và sửa file.

### 33.1. Danh sách và chi tiết (FR-10, FR-11)

`staff@dorm.local` / `Staff@123` → **Sinh viên**.

- [ ] Cột: MSSV, Họ và tên (dưới là giới tính · SĐT), Lớp · Khoa, Chỗ ở (`K1-101 · Giường 01` hoặc "Không ở KTX"), Tài khoản (Đã có / Chưa có), Công nợ.
- [ ] Lọc Giới tính, Khoa, Tài khoản (Đã có / Chưa có), Trạng thái hồ sơ (Đang hoạt động / Đã vô hiệu hóa) đều đúng; nút ↻ xóa lọc.
- [ ] Bấm dòng `2021600001` → drawer: Hồ sơ (kể cả liên hệ khẩn cấp), Chỗ ở hiện tại (link hợp đồng sang màn Hợp đồng), Hóa đơn chưa trả (link sang hóa đơn), Lịch sử đơn và hợp đồng.
- [ ] Nút **Vô hiệu hóa** bị khóa, rê chuột thấy "Sinh viên còn hợp đồng ở ký túc xá — thanh lý trước". Với sinh viên không ở, không nợ (vd lọc "Chưa có tài khoản" rồi chọn một bạn) thì vô hiệu hóa được và hồ sơ sang trạng thái Đã vô hiệu hóa.

### 33.2. Thêm, sửa, đặt lại mật khẩu (FR-12, FR-13, FR-06)

- [ ] **Thêm sinh viên**: MSSV phải đúng 10 chữ số; SĐT 10 số bắt đầu 0; nhập MSSV đã có → lỗi ngay dưới ô "Mã số sinh viên đã tồn tại". Khoa gợi ý theo danh sách. Có 3 ô liên hệ khẩn cấp.
- [ ] Sửa một sinh viên, đổi MSSV sang mã của bạn khác → báo trùng; đổi sang mã mới chưa ai dùng → lưu được.
- [ ] Drawer `2021600001` → **Đặt lại mật khẩu** → xác nhận → hiện mật khẩu tạm một lần (Staff làm được). Đăng xuất, vào `sv001@dorm.local` với mật khẩu tạm → bị chuyển sang Đổi mật khẩu.
- [ ] Sinh viên chưa có tài khoản không có nút Đặt lại mật khẩu.

### 33.3. Nhập sinh viên từ Excel (FR-12b)

- [ ] **Nhập từ Excel** → **Tải file mẫu** → mở `mau-nhap-sinh-vien.xlsx`: trang "Sinh viên" chỉ có dòng tiêu đề, cột Giới tính chọn được Nam/Nữ, cột Khoa có danh sách; trang "Hướng dẫn".
- [ ] Điền 4 dòng: (2) MSSV mới đúng; (3) MSSV `2021600001` đã có; (4) SĐT `12345`; (5) MSSV mới, SĐT gõ thành số `912000003` (Excel nuốt số 0). Lưu file.
- [ ] Kéo file vào → "Xem trước: 4 dòng" → **Nhập 4 dòng** → "Đã nhập 2 sinh viên, 2 dòng lỗi", bảng lỗi chỉ đúng **dòng 3** (MSSV đã tồn tại) và **dòng 4** (Số điện thoại).
- [ ] Tìm MSSV dòng 2 và 5 → có trong danh sách, **Chưa có** tài khoản; SĐT dòng 5 là `0912000003`.
- [ ] Chọn một file Excel bất kỳ không đúng mẫu → báo "File thiếu cột bắt buộc…", nút Nhập bị khóa. Chọn file không phải .xlsx → báo chỉ nhận .xlsx.

### 33.4. Excel chỉ số điện nước (FR-40)

- [ ] **Chỉ số điện nước** → Tòa K2, tháng hiện tại → **Xuất Excel** → file `chi-so-K2-<yyyy-mm>.xlsx`: dòng 1 ghi tòa và tháng, mỗi phòng một dòng, số cũ điền sẵn, ô số mới cần nhập tô vàng; phòng đã chốt / phòng trống có ghi chú.
- [ ] Điền số mới cho K2-206, gõ chữ `abc` vào ô Điện mới của K2-207 → lưu → **Nhập Excel** → "Đã điền 1 phòng vào bảng, 1 dòng bỏ qua" kèm lý do K2-207.
- [ ] K2-206 trong lưới hiện số mới, trạng thái **Chưa lưu** — chưa gửi gì lên; bấm **Lưu 1 phòng** mới lưu.
- [ ] Nhập file của tòa khác hoặc tháng khác → báo "File không khớp tòa / tháng đang mở", lưới không đổi.

**Lỗi phát hiện:** _(chưa có)_

---

## 34. v2 · M10b — Sửa lỗi đợt soát tổng + làm đẹp giao diện

Chạy dữ liệu giả như mục 24. Thử ở cửa sổ rộng 1366px và ở chế độ điện thoại (DevTools → 390px).

### 34.1. Các lỗi đã sửa

- [ ] **Sửa sinh viên**: mở Sửa bạn A, đóng, mở Sửa bạn B → form là dữ liệu của B, không lẫn của A. Gõ vào ô Khoa → gợi ý hiện, trang không trắng.
- [ ] **Chỉ số điện nước**: phòng X nhập đủ, phòng Y chỉ nhập số điện → **Lưu** → số đã gõ ở Y vẫn còn.
- [ ] Excel chỉ số: gõ `1234.5` vào ô số mới → dòng đó bị bỏ qua kèm lý do (không thành 12345).
- [ ] Cổng sinh viên `sv001`: bấm chuông → chọn một hóa đơn → chuông đóng, mở đúng hóa đơn đó; bấm hóa đơn khác trong chuông → đổi đúng.
- [ ] Thu tiền một hóa đơn → phiếu thu ghi đúng **giờ và ngày trên máy** (bản cũ ghi giờ UTC, thu trước 7:00 sáng bị lùi một ngày).
- [ ] Đổi mật khẩu xong → về màn Đăng nhập; đăng nhập lại bằng mật khẩu mới được.
- [ ] Đăng nhập ở 2 tab, đăng xuất ở tab 1 → tab 2 tự về màn Đăng nhập.
- [ ] Đổi tên tòa → ô chọn tòa ở màn Phòng và drawer hợp đồng hiện tên mới. Phòng bảo trì → Duyệt đơn vào phòng đó bị chặn với thông báo rõ.

### 34.2. Giao diện

- [ ] **Đăng nhập** (≥768px): nửa trái xanh, logo cạnh tên "Ký túc xá HaUI", ba dòng Sinh viên / Cán bộ / Tài khoản, chân trang ghi phiên bản. Không có chấm xanh nhấp nháy.
- [ ] Chữ xanh (link, menu đang chọn) đậm hơn bản cũ; nhãn trạng thái vàng ("Chưa thanh toán", "Chờ duyệt") đọc rõ, không bị nhạt.
- [ ] **Thẻ số liệu** (Dashboard, Hóa đơn, Phiếu thu): biểu tượng nhỏ cạnh nhãn, không còn ô vuông nền màu. Ở 390px thẻ xếp 2 thẻ một hàng, số không tràn.
- [ ] **Trang chủ sinh viên** `sv009`: thẻ **Việc cần làm (3)** — công nợ, điện nước của phòng, hợp đồng hết hạn; việc gấp (đỏ) lên trước, nút đầu tiên màu xanh đặc. `sv003` (không nợ, phòng đã nộp điện nước, hợp đồng còn hạn) → một dòng xanh "Bạn không có khoản nào cần nộp…".
- [ ] **Hợp đồng** ở 1366px: thấy đủ cột tới Trạng thái, không cuộn ngang; cột Chỗ ở hai dòng (`K1-101` / `Giường 01`), thời hạn một dòng, dưới là gói thuê + "còn N ngày".
- [ ] **Hóa đơn** ở 390px: ô tìm kiếm cả dòng, các ô lọc 2 ô một hàng. Cột Trạng thái: tên người nộp và ngày nộp nằm hai dòng riêng.
- [ ] **Phòng** ở 390px: bộ lọc 2 cột thẳng hàng, nút Sơ đồ / Danh sách chiếm cả dòng. Chữ "Còn N chỗ" trên ô phòng xanh đậm, đọc rõ.
- [ ] Mở/đóng menu, drawer, modal: chuyển động mượt, không "nảy".

**Lỗi phát hiện:** _(chưa có)_

---

## 35. v2 · M11 — Thử trọn luồng 3 vai trò + tổng nghiệm thu

Chạy dữ liệu giả: `npm run dev`, mở địa chỉ ở dòng `Local:` (thường `http://localhost:5173`; các mục trên ghi `5174` là cổng của máy chạy test tự động).

> ⚠️ **Làm liền một mạch trong cùng một tab, không F5.** Dữ liệu giả về ban đầu khi tải lại trang (phiên đăng nhập thì vẫn giữ).
> Đổi tài khoản bằng menu tên ở góc phải trên → **Đăng xuất**.

### 35.1. Khách: nộp đơn và tra cứu

- [ ] Màn Đăng nhập → **Đăng ký ở ký túc xá**. Bước 1: MSSV `2021607777`, họ tên `Trần Văn Hùng`, **Nam**, SĐT `0987001122`, email `hung.tran@gmail.com` → **Tiếp tục chọn phòng**.
- [ ] Bước 2: chỉ có phòng nam, phòng đầu gắn nhãn **Gợi ý**. Chọn một giường **Trống** ở một phòng **K1 đã có người ở** (vd. K1-103) → **Tiếp tục**.
- [ ] Bước 3: chọn **12 tháng** → tổng = giá tháng × 12 + 500.000 đ. Tích ô xác nhận → **Gửi đơn đăng ký** → hiện mã đơn `HD-…`. Ghi lại mã này.
- [ ] **Tra cứu tiến độ đơn** (hoặc `/apply/status`) bằng `2021607777` + `hung.tran@gmail.com` → **Chờ duyệt**.

### 35.2. Cán bộ: duyệt và chốt điện nước

- [ ] Đăng nhập `staff@dorm.local` / `Staff@123` → **Duyệt đơn đăng ký** → chọn **Trần Văn Hùng** → thấy đúng phòng, giường đã chọn → **Duyệt đơn** → xác nhận.
- [ ] Thông báo **Đã duyệt đơn** ghi tài khoản `2021607777`, email, và **2 hóa đơn** (cọc + tiền phòng cả kỳ).
- [ ] **Chỉ số điện nước** → Tòa K1, tháng hiện tại → **Chốt & phát hành** → xác nhận → "Đã phát hành N hóa đơn điện nước" → bấm **OK**. Cả bảng chuyển "Đã phát hành", không sửa được.

### 35.3. Sinh viên: đăng nhập lần đầu

- [ ] Đăng xuất → đăng nhập `2021607777` / `2021607777` → bị chuyển sang **Đổi mật khẩu**, không vào được trang khác.
- [ ] Đổi sang `Hung@2026` → vào **Trang chủ**. Thẻ **Việc cần làm** có "Công nợ cần thanh toán" và "Điện nước của phòng"; chuông góc trên có số.
- [ ] **Hóa đơn** → tab **Của tôi** có Tiền cọc + Tiền phòng cả kỳ, chọn một hóa đơn thấy khối **VietQR** (ảnh QR cần mạng) với nội dung `HAUI INV… 2021607777`.
- [ ] Tab **Của phòng** có hóa đơn `INV-UTIL-K1-<phòng>-<năm tháng>` vừa chốt.
- [ ] **Chỗ ở** hiện đúng phòng, giường, bạn cùng phòng, hợp đồng 12 tháng, tiền cọc 500.000 đ "Hoàn lại tại văn phòng sau khi trả phòng".

### 35.4. Cán bộ: thanh lý bị chặn → thu tiền → thanh lý → hoàn cọc

- [ ] Đăng xuất → `staff@dorm.local` → **Hợp đồng** → tìm mã đơn ở 35.1 → mở → **Thanh lý hợp đồng** → xác nhận → bị chặn, liệt kê **3 hóa đơn** chưa trả (2 của bạn + điện nước của phòng).
- [ ] **Hóa đơn** → tìm `2021607777` → **Thu tiền** lần lượt 2 hóa đơn → mỗi lần hiện **phiếu thu** (mã `PAY-…`, người nộp, người thu, nút In biên lai).
- [ ] Tìm mã hóa đơn điện nước của phòng → **Thu tiền** → chọn **Người nộp** = Trần Văn Hùng → phiếu thu ghi "nộp cho cả phòng".
- [ ] **Hợp đồng** → mở lại → **Thanh lý hợp đồng** → thành công: **Đã chấm dứt** + **Chờ hoàn cọc**.
- [ ] **Xác nhận đã hoàn cọc** → hộp thoại nêu 500.000 đ, không có ô nhập → xác nhận → nhãn **Đã hoàn cọc** kèm "Lê Thị Nhân Viên" và thời điểm.

### 35.5. Sinh viên và quản trị: kết quả cuối

- [ ] Đăng xuất → `2021607777` / `Hung@2026` → Trang chủ: **Bạn chưa có chỗ ở** + **Đã nhận lại cọc ngày …**.
- [ ] Đăng xuất → `admin@dorm.local` / `Admin@123` → **Phiếu thu**: tìm `2021607777` thấy các phiếu vừa thu. **Dashboard** có biểu đồ **Doanh thu**; đăng nhập Staff thì không có phần doanh thu.

### 35.6. Tổng nghiệm thu

- [ ] Đã chạy các mục 24–34 (mỗi mục một mốc), lỗi ghi ở mục **Lỗi phát hiện** của từng mục.
- [ ] Màn hình hẹp (DevTools → 390px): Trang chủ SV, Hóa đơn SV, Đăng nhập, Nộp đơn, Hóa đơn (cán bộ) không cuộn ngang.
- [ ] Không còn dấu vết v1: menu không có Loại phòng, Loại phí, Nhu yếu phẩm, Yêu cầu; `/register`, `/portal/shop`, `/admin/room-types` ra trang 404.

**Lỗi phát hiện:** _(chưa có)_

---

## 36. Sửa lỗi trước khi nối backend (11/11/2026)

Nhánh `fix/pre-integration`. Dữ liệu giả, mở trang mới (F5) trước mỗi phần. Tài khoản cán bộ `staff@dorm.local` / `Staff@123`.

### 36.1. Phòng bảo trì còn người vẫn thu điện nước (FR-40, FR-41)

- [ ] **Phòng** → Tòa K1 → bấm phòng **K1-101** (đang có người) → **Sửa** → ô Trạng thái ghi "Người đang ở vẫn ở tiếp và vẫn được ghi điện nước" → chọn **Đang bảo trì** → **Lưu** → thành công.
- [ ] **Chỉ số điện nước** → Tháng hiện tại, Tòa K1 → dòng **K1-101 vẫn còn**, dưới tên phòng có chữ vàng **Đang bảo trì**, nhập và lưu được như phòng khác.
- [ ] **Chốt & phát hành** → xác nhận → **Hóa đơn** → tìm `K1-101` → có hóa đơn điện nước tháng này của K1-101.
- [ ] Phòng **đang bảo trì mà trống** (không có người ở) thì **không** có dòng trong lưới.

### 36.2. Khóa giới tính sinh viên đang ở hoặc có đơn chờ (BR-01)

- [ ] **Sinh viên** → bấm **Nguyễn Văn An** (`2021600001`, đang ở K1-101) → **Sửa** → ô **Giới tính bị khóa**, dòng dưới ghi "Đang ở hoặc có đơn chờ duyệt — thanh lý / từ chối đơn trước khi đổi giới tính". Sửa SĐT rồi **Lưu** vẫn thành công.
- [ ] Bấm **Phạm Phương Linh** (`2021600076`, có đơn chờ duyệt) → **Sửa** → ô Giới tính cũng bị khóa.
- [ ] Bấm một sinh viên cột **Chỗ ở** trống và không có đơn chờ → **Sửa** → ô Giới tính mở, đổi được và lưu thành công.

### 36.3. MSSV đúng 10 chữ số ở nộp đơn và tra cứu

- [ ] Đăng xuất → **Đăng ký ở ký túc xá** → ô Mã sinh viên gõ `SV12345` → báo **"Mã sinh viên gồm đúng 10 chữ số"**; ô không nhận quá 10 ký tự.
- [ ] Gõ `2021607777` → hết báo lỗi, đi tiếp sang bước chọn phòng được.
- [ ] **Tra cứu tiến độ đơn** → MSSV `12345` + email bất kỳ → **Tra cứu** → báo cùng lỗi, không gửi yêu cầu.

### 36.4. Tài liệu bàn giao backend

- [ ] `docs/API.md` lên **2.6**, nhật ký phiên bản liệt kê các trường mới (`totalDebt`, `history`, `monthYear`, giá ở tra cứu đơn, profile, `PUT /buildings` nhận một phần, `GENDER_CHANGE_NOT_ALLOWED`).
- [ ] `docs/16-YEU-CAU-API-BACKEND.md` lên **2.1**, **không còn** mục "Danh mục loại phòng".

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
