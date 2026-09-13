# 11 – KẾ HOẠCH KIỂM THỬ

**Hệ thống:** DMS – Hệ thống quản lý ký túc xá
**Phiên bản:** v2.1 (đăng ký theo phòng · nhu yếu phẩm)
**Người phụ trách:** BA chủ trì + toàn nhóm

> Mọi test case phải truy vết về một `FR-xx` trong `02-DAC-TA-YEU-CAU.md` hoặc một `BR-xx` trong `03-PHAN-TICH-NGHIEP-VU.md`.
> Mã lỗi xem `API.md` mục 13, định dạng response xem `API.md` mục 1.1.

---

## 1. Mục tiêu và phạm vi

### 1.1. Mục tiêu

1. Xác nhận 100% yêu cầu ưu tiên **Must (M)** hoạt động đúng.
2. Xác nhận các quy tắc nghiệp vụ `BR-xx` được thực thi ở tầng service.
3. Loại bỏ toàn bộ lỗi mức **Critical/High** trước khi bàn giao.
4. Xác nhận không có lỗ hổng phân quyền, đặc biệt là **IDOR** ở cổng sinh viên.

### 1.2. Phạm vi

**Trong phạm vi:** kiểm thử chức năng 10 module · phân quyền RBAC · tích hợp cổng thanh toán sandbox · giao diện máy tính trên Chrome/Edge/Firefox · hiệu năng cơ bản (NFR-01, NFR-02).

**Làm sau (không chặn bàn giao):** giao diện điện thoại — chỉ kiểm tra không vỡ ở 360px (TC-145).

**Ngoài phạm vi:** test tải cao (> 100 người đồng thời) · penetration testing chuyên sâu · trình duyệt cũ (IE, Safari < 15) · khả năng phục hồi sau sự cố hạ tầng.

---

## 2. Chiến lược kiểm thử

### 2.1. Các cấp độ

```mermaid
flowchart TB
    L1["**Unit test** (Jest)<br/>~10 test cho 3 hàm tính tiền:<br/>chia đều điện nước · tiền theo ngày · quyết toán cọc"]
    L2["**Test API** (Postman, thủ công)<br/>~15 luồng trọng yếu<br/>lưu thành collection dùng lại"]
    L3["**System test** (thủ công)<br/>87 test case theo mục 4<br/>BA chủ trì"]
    L4["**UAT**<br/>3 kịch bản người dùng thực tế<br/>cả nhóm + GVHD"]

    L1 --> L2 --> L3 --> L4

    style L1 fill:#e3f2fd
    style L2 fill:#e8f5e9
    style L3 fill:#fff3e0
    style L4 fill:#fce4ec
```

### 2.2. Ưu tiên theo rủi ro

| Mức | Module | Sai thì hậu quả gì | Cách test |
|-----|--------|---------------------|-----------|
| 🔴 **Rất cao** | Đăng ký lưu trú (chiếm giường) | 2 sinh viên một giường, hỏng dữ liệu | System + **test đồng thời (TC-42)** |
| 🔴 **Rất cao** | Thanh toán (webhook) | Sai tiền, mất tiền, ghi nhận 2 lần | Unit + **test chữ ký/trùng lặp bằng Postman** |
| 🔴 **Rất cao** | Phân quyền cổng sinh viên | Lộ dữ liệu cá nhân | System test toàn bộ endpoint `/api/portal/*` |
| 🟠 **Cao** | Hóa đơn & chỉ số điện nước | Sai công nợ, thất thu | Unit + System |
| 🟠 **Cao** | Quyết toán tiền cọc | Không đối soát được sổ sách | System |
| 🟡 **Trung bình** | Sinh viên, cơ sở vật chất | CRUD thông thường | System |
| 🟢 **Thấp** | Dashboard | Chỉ đọc, sai không hỏng dữ liệu | System |

### 2.3. Môi trường & tài khoản

| Môi trường | Dùng cho |
|------------|----------|
| Local | Unit test, test API bằng Postman, test trong lúc phát triển |
| Staging | System test (toàn bộ test case mục 4) |
| Production | UAT cuối cùng + smoke test |

| Vai trò | Tài khoản | Mật khẩu | Dùng để test |
|---------|-----------|----------|--------------|
| admin | `admin@dorm.local` | `Admin@123` | Toàn quyền |
| staff | `staff@dorm.local` | `Staff@123` | Nghiệp vụ hằng ngày |
| viewer | `viewer@dorm.local` | `Viewer@123` | Kiểm tra chỉ đọc |
| student A | `sv001@dorm.local` | `Student@123` | Đang lưu trú, có công nợ |
| student B | `sv002@dorm.local` | `Student@123` | Chưa lưu trú — dùng test **nộp đơn đăng ký** |
| student D | `sv004@dorm.local` | `Student@123` | Đang ở phòng **Chất lượng cao** (được cấp sẵn đệm) — dùng test cửa hàng |
| student C | `sv003@dorm.local` | `Student@123` | **Dùng để test IDOR** (truy cập dữ liệu của A) |

> Dữ liệu seed tối thiểu: 2 tòa nhà · **ít nhất 4 loại phòng** (có cả Tiêu chuẩn và Chất lượng cao) · 20 phòng (10 nam + 10 nữ) · giường tự sinh · 40 sinh viên · hợp đồng đủ 3 trạng thái · **đơn đăng ký đủ 4 trạng thái** · **ít nhất một phòng chỉ còn đúng 1 chỗ** (cho TC-42) · 6 sản phẩm nhu yếu phẩm · **đơn nhu yếu phẩm đủ 4 trạng thái**.

---

## 3. Tiêu chí vào/ra

### 3.1. Bắt đầu kiểm thử hệ thống khi

| # | Tiêu chí |
|---|----------|
| 1 | Toàn bộ chức năng ưu tiên `M` đã cài đặt và merge vào `main` |
| 2 | Hệ thống deploy được lên staging và chạy ổn định |
| 3 | Dữ liệu seed đã nạp đầy đủ |
| 4 | 6 tài khoản kiểm thử sẵn sàng |

### 3.2. Kết thúc kiểm thử khi

| # | Tiêu chí |
|---|----------|
| 1 | 100% test case ưu tiên **Rất cao** và **Cao** đã thực thi |
| 2 | ≥ 95% tổng số test case đã thực thi |
| 3 | Tỷ lệ đạt ≥ 95% |
| 4 | **0 lỗi Critical, 0 lỗi High** còn mở |
| 5 | Lỗi Medium còn mở ≤ 5, đã ghi nhận và chấp nhận |
| 6 | Checklist bảo mật (`07` mục 6) đạt đủ |
| 7 | Biên bản UAT được nhóm ký xác nhận |

### 3.3. Phân loại mức độ lỗi

| Mức | Định nghĩa | Ví dụ | Hạn sửa |
|-----|------------|-------|---------|
| **Critical** | Hỏng dữ liệu, lộ dữ liệu, hệ thống không dùng được | 2 SV một giường; SV xem được hóa đơn người khác | Ngay lập tức |
| **High** | Chức năng chính hỏng, không có cách khắc phục tạm | Không kích hoạt được hợp đồng; tính sai tiền | Trong 1 ngày |
| **Medium** | Lỗi nhưng có cách khắc phục tạm | Bộ lọc sai; xuất CSV thiếu cột | Trong 3 ngày |
| **Low** | Giao diện, chính tả | Lệch căn lề | Nếu còn thời gian |

---

## 4. Test case

**Ký hiệu kết quả:** ✅ Đạt · ❌ Không đạt · ⏸ Chưa test

### 4.1. Xác thực & phân quyền (12)

| ID | Tiêu đề | Các bước | Kết quả mong đợi | Truy vết | Ưu tiên | KQ |
|----|---------|----------|------------------|----------|---------|-----|
| TC-01 | Đăng nhập thành công | Nhập `staff@dorm.local` + mật khẩu đúng | Trả `code: "OK"` kèm token và user; chuyển tới `/admin/dashboard` | FR-01 | Cao | ⏸ |
| TC-02 | Sinh viên đăng nhập | Nhập `sv001@dorm.local` + mật khẩu | Chuyển tới `/portal/home`, **không** vào được khu quản trị | FR-01 | Cao | ⏸ |
| TC-03 | Sai mật khẩu | Nhập mật khẩu sai | `401 UNAUTHORIZED`, thông báo chung "Email hoặc mật khẩu không đúng" — **không** nói rõ trường nào sai | FR-01 | Cao | ⏸ |
| TC-04 | Giới hạn tần suất đăng nhập | Gọi `/api/auth/login` liên tục quá ngưỡng | Trả `429` | FR-05 | TB | ⏸ |
| TC-05 | Chưa đăng nhập mà gõ URL quản trị | Đăng xuất rồi gõ `/admin/students` | Chuyển về `/login` | FR-04 | Cao | ⏸ |
| TC-06 | Viewer không thấy nút thao tác | Đăng nhập viewer, mở danh sách sinh viên | Không có nút "Thêm", "Sửa", "Vô hiệu hóa" | FR-04 | Cao | ⏸ |
| TC-07 | **Viewer gọi API ghi bị chặn** | Dùng token viewer gọi `POST /api/students` bằng Postman | `403 FORBIDDEN` | FR-04 | **Rất cao** | ⏸ |
| TC-08 | **Student gọi API quản trị bị chặn** | Dùng token student gọi `GET /api/students` | `403 FORBIDDEN` | FR-04 | **Rất cao** | ⏸ |
| TC-09 | Staff không quản lý được tài khoản | Dùng token staff gọi `GET /api/users` | `403 FORBIDDEN` | FR-06 | Cao | ⏸ |
| TC-10 | Đặt lại mật khẩu hộ người dùng | Staff gọi `POST /api/users/:id/reset-password` | Trả mật khẩu tạm **một lần**, `mustChangePassword: true`; mật khẩu cũ không dùng được nữa | FR-09 | Cao | ⏸ |
| TC-11 | **Buộc đổi mật khẩu tạm** | Đăng nhập bằng mật khẩu tạm rồi gọi API nghiệp vụ bất kỳ | Bị chặn, buộc chuyển sang màn hình đổi mật khẩu | BR-85 | Cao | ⏸ |
| TC-12 | **Staff không reset được mật khẩu admin** | Staff gọi reset-password trên tài khoản admin | `403` — chặn leo thang đặc quyền | BR-84 | **Rất cao** | ⏸ |

### 4.2. Quản lý sinh viên (7)

| ID | Tiêu đề | Các bước | Kết quả mong đợi | Truy vết | Ưu tiên | KQ |
|----|---------|----------|------------------|----------|---------|-----|
| TC-20 | Thêm sinh viên hợp lệ | Nhập đủ trường bắt buộc gồm **giới tính** | Tạo thành công, hiện trong danh sách | FR-10 | Cao | ⏸ |
| TC-21 | Trùng mã số sinh viên | Nhập `studentCode` đã tồn tại | `409 DUPLICATE_ENTRY`, lỗi hiện ngay tại ô MSSV | FR-11, BR-11 | Cao | ⏸ |
| TC-22 | Thiếu giới tính | Bỏ trống giới tính | Chặn submit — giới tính bắt buộc vì cần cho BR-06 | BR-12 | Cao | ⏸ |
| TC-23 | Sai định dạng số điện thoại | Nhập `123abc` | Báo lỗi định dạng | BR-15 | TB | ⏸ |
| TC-24 | Tìm kiếm và phân trang | Gõ từ khóa, chuyển trang 2 | Kết quả đúng; response có `{ items, total, page, limit }` | FR-15, FR-90 | Cao | ⏸ |
| TC-25 | **Vô hiệu hóa SV còn hợp đồng** | Chọn SV đang lưu trú | `422 STUDENT_HAS_ACTIVE_CONTRACT`, không thay đổi | FR-14, BR-13 | **Cao** | ⏸ |
| TC-26 | **Vô hiệu hóa SV còn công nợ** | Chọn SV đã trả phòng nhưng còn nợ | `422 STUDENT_HAS_DEBT` | FR-14, BR-14 | **Cao** | ⏸ |

### 4.3. Tòa nhà, loại phòng, phòng & giường (10)

| ID | Tiêu đề | Các bước | Kết quả mong đợi | Truy vết | Ưu tiên | KQ |
|----|---------|----------|------------------|----------|---------|-----|
| TC-30 | **Tạo phòng tự sinh giường** | Tạo phòng B203, loại "Tiêu chuẩn · 6 người", `gender: "female"` | Tạo thành công; có **đúng 6 giường** `B203-01…06`, tất cả `available`; `capacity = 6` | FR-21, FR-22, BR-04 | **Cao** | ⏸ |
| TC-31 | **Tạo phòng thiếu giới tính** | Bỏ trống `gender` | `400 VALIDATION_ERROR` — trường bắt buộc | FR-29 | **Cao** | ⏸ |
| TC-32 | Trùng số phòng trong cùng tòa | Nhập số phòng đã có | `409 DUPLICATE_ENTRY` | BR-02 | Cao | ⏸ |
| TC-33 | Trùng số phòng ở tòa khác | Phòng `101` ở tòa B trong khi tòa A đã có `101` | **Thành công** — chỉ duy nhất trong phạm vi tòa | BR-02 | TB | ⏸ |
| TC-34 | Trùng loại phòng | Tạo thêm "Tiêu chuẩn · 6 người" khi đã có | `409 DUPLICATE_ENTRY` | BR-10 | Cao | ⏸ |
| TC-35 | **Đổi sức chứa loại phòng đã được dùng** | Loại "Tiêu chuẩn · 6 người" đang có phòng; đổi sức chứa thành 8 | `422 ROOM_TYPE_IN_USE`, không đổi | FR-24, BR-09 | **Cao** | ⏸ |
| TC-36 | **Chuyển giường đang có người sang bảo trì** | Chọn giường `occupied` | `422 BED_OCCUPIED`, không đổi trạng thái | FR-27, BR-08 | **Cao** | ⏸ |
| TC-37 | **Giường bảo trì không tính là chỗ trống** | Phòng 6 giường: 4 có người, 1 bảo trì, 1 trống. Gọi `GET /api/rooms/available` | Phòng có `availableSlots = 1` (**không phải 2**) | FR-28, BR-05 | **Cao** | ⏸ |
| TC-38 | Đổi loại phòng của phòng đang có người | Sửa `roomTypeId` của phòng có 1 người ở | `422 ROOM_HAS_OCCUPANTS` | FR-24, BR-09 | Cao | ⏸ |
| TC-39 | Giá hợp đồng chốt tại lúc duyệt | Duyệt đơn (giá loại phòng 320 000 đ), rồi đổi giá loại phòng thành 350 000 đ | `Contract.monthlyPrice` vẫn 320 000 đ; đơn duyệt **sau** khi đổi giá nhận 350 000 đ | FR-24, BR-27 | Cao | ⏸ |

### 4.4. Đơn đăng ký, lưu trú & hợp đồng (17) — trọng tâm

| ID | Tiêu đề | Các bước | Kết quả mong đợi | Truy vết | Ưu tiên | KQ |
|----|---------|----------|------------------|----------|---------|-----|
| TC-40 | Sinh viên nộp đơn thành công | SV B chọn loại phòng → phòng còn chỗ → ngày → nộp | Tạo `Application` `pending`; **không giường nào đổi trạng thái** | FR-30, BR-34 | **Rất cao** | ⏸ |
| TC-41 | **Sinh viên chỉ thấy phòng khớp giới tính** | SV nam gọi `GET /api/rooms/available?gender=female` | Chỉ trả phòng **nam** — tham số `gender` bị bỏ qua | FR-28, BR-06 | **Rất cao** | ⏸ |
| TC-42 | **Tranh chấp chỗ cuối cùng** | Phòng còn đúng 1 giường trống; 2 đơn khác nhau cùng nhắm phòng đó; 2 Staff ở 2 trình duyệt bấm "Duyệt" gần như đồng thời | 1 đơn `approved`; đơn kia nhận `409 ROOM_FULL` và **vẫn `pending`**. **Tuyệt đối không** có 2 Residency `active` trên cùng một giường | BR-20 | **Rất cao** | ⏸ |
| TC-43 | Giới tính không khớp khi nộp đơn | SV nam gửi `POST /api/portal/my-applications` với `roomId` của phòng nữ | `422 GENDER_MISMATCH` | FR-29, BR-06 | **Rất cao** | ⏸ |
| TC-44 | **Bẫy: đổi sang phòng khác giới tính khi duyệt** | Đơn của SV nữ; Staff chọn một phòng **nam** cùng loại rồi bấm duyệt | `422 GENDER_MISMATCH`. ⚠️ Lọt lỗi nếu code chỉ kiểm tra giới tính lúc nộp đơn | BR-06, BR-35 | **Rất cao** | ⏸ |
| TC-45 | **SV đang có hợp đồng nộp đơn mới** | SV A (đang lưu trú) nộp đơn | `422 STUDENT_HAS_ACTIVE_CONTRACT` | FR-32, BR-21 | **Rất cao** | ⏸ |
| TC-46 | **Duyệt đơn: tự gán giường số nhỏ nhất + 2 hóa đơn** | Phòng có giường 01, 02 đã có người, 03–06 trống. Duyệt đơn | Gán **giường 03**; `Residency` `active`; `Contract` `active` với giá và tiền cọc lấy từ loại phòng; trả **mảng 2 hóa đơn**: `deposit` (`billingPeriod: null`) và `monthly` | FR-31, FR-34, BR-20, BR-25 | **Rất cao** | ⏸ |
| TC-47 | Duyệt muộn không sinh hóa đơn quá hạn | Đơn có `startDate` 01/09, duyệt ngày 20/09 | Hạn hai hóa đơn là **27/09**, không phải 08/09 | BR-26 | Cao | ⏸ |
| TC-48 | Chấm dứt hợp đồng trước hạn | Staff chấm dứt hợp đồng `active` | `Contract` → `terminated`, `Residency` → `closed`, `Bed` → `available` | FR-38 | Cao | ⏸ |
| TC-49 | Cảnh báo hợp đồng sắp hết hạn | Tạo hợp đồng hết hạn sau 20 ngày, mở dashboard | Hợp đồng xuất hiện trong danh sách sắp hết hạn | FR-37, BR-29 | Cao | ⏸ |
| TC-50 | Job tự cho hợp đồng hết hạn | Sửa `endDate` về hôm qua, chạy job | `Contract` → `expired`, `Residency` → `closed`, `Bed` → `available` | FR-36, BR-28 | Cao | ⏸ |
| TC-51 | Nộp hai đơn cùng lúc | SV B đã có đơn `pending`, nộp đơn thứ hai | `409 DUPLICATE_PENDING_APPLICATION` | FR-30, BR-33 | Cao | ⏸ |
| TC-52 | Đổi sang phòng khác loại khi duyệt | Đơn "Tiêu chuẩn · 6 người"; Staff chọn phòng "Chất lượng cao · 4 người" | `422 ROOM_TYPE_MISMATCH` | FR-33, BR-35 | Cao | ⏸ |
| TC-53 | **Lỗi giữa chừng phải trả giường** | Tạm sửa `contractService.createFromApplication` để ném lỗi, rồi duyệt đơn | Duyệt thất bại; giường **vẫn `available`**; không có `Residency` mồ côi; đơn vẫn `pending`. Nhớ hoàn tác đoạn sửa | BR-36 | **Cao** | ⏸ |
| TC-54 | API không nhận mã giường | Gửi thêm `bedId` của giường 06 trong body khi duyệt | `bedId` bị bỏ qua; hệ thống vẫn gán giường trống số nhỏ nhất | BR-38 | Cao | ⏸ |
| TC-55 | Từ chối đơn với lý do quá ngắn | Nhập lý do "không" | Chặn — tối thiểu 10 ký tự | FR-33, BR-37 | TB | ⏸ |
| TC-56 | Hủy đơn | SV hủy đơn `pending` của mình; sau đó thử hủy một đơn đã `approved` | Lần 1 → `cancelled`; lần 2 → `422 APPLICATION_NOT_PENDING` | FR-33, BR-37 | TB | ⏸ |

### 4.5. Chỉ số điện nước & hóa đơn (13)

| ID | Tiêu đề | Các bước | Kết quả mong đợi | Truy vết | Ưu tiên | KQ |
|----|---------|----------|------------------|----------|---------|-----|
| TC-60 | Nhập chỉ số điện nước | Nhập CS điện đầu 1250 → cuối 1610 | Tính đúng 360 kWh × 2 500 = 900 000 đ | FR-59 | Cao | ⏸ |
| TC-61 | **Chỉ số cuối nhỏ hơn chỉ số đầu** | Nhập đầu 1610, cuối 1250 | `422 INVALID_METER_READING`, chặn lưu | BR-50 | **Cao** | ⏸ |
| TC-62 | Chỉ số đầu kỳ tự điền | Mở kỳ mới cho phòng đã có kỳ trước | Chỉ số đầu = chỉ số cuối kỳ trước | BR-51 | TB | ⏸ |
| TC-63 | **Sửa chỉ số đã lập hóa đơn** | Sửa bản ghi có `isInvoiced: true` | `422 READING_ALREADY_INVOICED` | BR-53 | Cao | ⏸ |
| TC-64 | Đơn giá chốt trên bản ghi | Sau khi lập hóa đơn, đổi đơn giá điện trong `FeeType` | Hóa đơn cũ **không** đổi số tiền | BR-52 | Cao | ⏸ |
| TC-65 | **Lập hóa đơn hàng loạt** | Chọn kỳ, xác nhận | Tạo đúng số hóa đơn = số SV đang ở; mỗi hóa đơn có 3 dòng: phòng + điện + nước | FR-47 | **Rất cao** | ⏸ |
| TC-66 | **Chia đều điện nước — chia hết** | Phòng 6 SV, tiền điện 900 000 đ | Mỗi SV 150 000 đ; tổng đúng 900 000 đ | BR-54 | **Rất cao** | ⏸ |
| TC-67 | **Chia đều điện nước — có dư** | Phòng 7 SV, tiền nước 576 000 đ | 6 SV × 82 285 đ + 1 SV × 82 290 đ = **đúng 576 000 đ** | BR-54 | **Rất cao** | ⏸ |
| TC-68 | Bỏ qua phòng chưa nhập chỉ số | 2 phòng chưa nhập, chạy lập hóa đơn | 2 phòng nằm trong danh sách `skipped`; các phòng khác vẫn lập bình thường | FR-47 | Cao | ⏸ |
| TC-69 | Phòng không có sinh viên | Phòng trống hoàn toàn trong kỳ | Không lập hóa đơn điện nước cho phòng đó | BR-55 | TB | ⏸ |
| TC-70 | **Không thất thu điện nước kỳ đầu** | SV được xếp giường ngày 05/10. Cuối tháng 10 chạy lập hóa đơn kỳ 2026-10 | SV **không bị bỏ qua**: hệ thống **bổ sung** dòng điện + nước vào hóa đơn `monthly` đã có, `updated` tăng 1. ⚠️ Nếu SV biến mất khỏi đợt lập ⇒ đang dính lỗi gộp hóa đơn cọc | BR-25, BR-48 | **Rất cao** | ⏸ |
| TC-71 | **Hủy hóa đơn đã có thanh toán** | Chọn hóa đơn `partial`, bấm hủy | `422 INVOICE_HAS_PAYMENT` | FR-58, BR-46 | **Cao** | ⏸ |
| TC-72 | Job đánh dấu hóa đơn quá hạn | Hóa đơn `unpaid` có `dueDate` hôm qua; hóa đơn `partial` có `dueDate` hôm qua; hóa đơn `paid` có `dueDate` hôm qua. Chạy job | Hai hóa đơn đầu → `overdue`; hóa đơn `paid` giữ nguyên. Chạy job lần 2 không đổi gì thêm | FR-57, BR-56 | Cao | ⏸ |

### 4.6. Thanh toán (10)

| ID | Tiêu đề | Các bước | Kết quả mong đợi | Truy vết | Ưu tiên | KQ |
|----|---------|----------|------------------|----------|---------|-----|
| TC-80 | Ghi nhận thanh toán đủ | Hóa đơn 646 000 đ, ghi nhận 646 000 đ | `paidAmount = 646000`, trạng thái → `paid` | FR-51 | **Rất cao** | ⏸ |
| TC-81 | **Thanh toán một phần** | Hóa đơn 646 000 đ, ghi nhận 400 000 đ | Còn nợ 246 000 đ, trạng thái → `partial` | FR-50, BR-43 | **Rất cao** | ⏸ |
| TC-82 | **Thanh toán vượt số còn nợ** | Còn nợ 246 000 đ, nhập 500 000 đ | `422 PAYMENT_EXCEEDS_REMAINING` | BR-44 | **Rất cao** | ⏸ |
| TC-83 | Thanh toán hóa đơn đã trả đủ | Chọn hóa đơn `paid`, ghi nhận thêm | `422 INVOICE_ALREADY_PAID` | BR-45 | Cao | ⏸ |
| TC-84 | Tạo phiên thanh toán VNPay | SV bấm thanh toán 246 000 đ | Nhận `redirectUrl` + `transactionRef`; tạo `Payment` `pending` | FR-52, FR-53 | **Rất cao** | ⏸ |
| TC-85 | **Thanh toán thành công qua sandbox** | Vào URL, nhập thẻ test, xác nhận | Webhook về → `Payment` `success` → hóa đơn `paid` | FR-54 | **Rất cao** | ⏸ |
| TC-86 | **Webhook chữ ký sai** | Gọi webhook bằng Postman với chữ ký bịa | `400 GATEWAY_SIGNATURE_INVALID`, hóa đơn **không** đổi, có log cảnh báo. ⭐ Test được ngay trên localhost | BR-61 | **Rất cao** | ⏸ |
| TC-87 | **Webhook gửi trùng (idempotent)** | Gọi lại đúng webhook đã thành công lần 2 | Xác nhận nhưng **chỉ 1** bản ghi `Payment`; `paidAmount` **không** bị cộng đôi | FR-55, BR-62 | **Rất cao** | ⏸ |
| TC-88 | **Webhook số tiền không khớp** | Gọi webhook với số tiền khác số đã tạo | Hóa đơn không đổi, giao dịch được đánh dấu cần đối soát | BR-63 | **Rất cao** | ⏸ |
| TC-89 | SV đóng trình duyệt giữa chừng | Thanh toán xong nhưng không quay lại. Staff bấm "Đối soát" | Giao dịch từ `pending` chuyển đúng sang `success`, hóa đơn cập nhật | FR-56 | Cao | ⏸ |

### 4.7. Gia hạn, trả phòng & quyết toán cọc (11)

| ID | Tiêu đề | Các bước | Kết quả mong đợi | Truy vết | Ưu tiên | KQ |
|----|---------|----------|------------------|----------|---------|-----|
| TC-100 | Gửi yêu cầu gia hạn | SV có hợp đồng `active`, gửi yêu cầu | Tạo `Request` `pending` | FR-60 | Cao | ⏸ |
| TC-101 | **Gửi 2 yêu cầu cùng loại** | Gửi tiếp yêu cầu gia hạn thứ 2 | `409 DUPLICATE_PENDING_REQUEST` | FR-62, BR-71 | **Cao** | ⏸ |
| TC-102 | SV chưa có hợp đồng gửi yêu cầu | SV B (chưa lưu trú) gửi yêu cầu | `422 CONTRACT_NOT_ACTIVE` | BR-70 | Cao | ⏸ |
| TC-103 | SV tự hủy yêu cầu | Hủy `Request` đang `pending` của chính mình | Thành công, `Request` → `cancelled` | FR-67, BR-79 | TB | ⏸ |
| TC-104 | Từ chối không nhập lý do | Staff bấm từ chối, để trống `reviewNote` | Chặn — bắt buộc nhập lý do | FR-64, BR-78 | TB | ⏸ |
| TC-105 | **Duyệt gia hạn** | Staff duyệt | `endDate` dời đúng, sinh hóa đơn `monthly` kỳ gia hạn, **không** thu lại tiền cọc | FR-65, BR-73 | **Rất cao** | ⏸ |
| TC-106 | **Duyệt trả phòng khi còn nợ** | Staff duyệt, không gửi `forceConfirm` | `422 STUDENT_HAS_DEBT` kèm số tiền còn nợ | FR-69, BR-75 | **Rất cao** | ⏸ |
| TC-107 | **Duyệt trả phòng có xác nhận** | Gửi lại với `forceConfirm: true` | `Contract` → `terminated`, `Residency` → `closed`, `Bed` → `available`, sinh hóa đơn `settlement` | FR-66, BR-74 | **Rất cao** | ⏸ |
| TC-108 | **Quyết toán tiền cọc** | Cọc 500 000 đ, công nợ 246 000 đ | Hoàn 254 000 đ; **có bản ghi `Payment` loại `refund`** ghi rõ người thực hiện và thời điểm | FR-68, BR-76, BR-77 | **Rất cao** | ⏸ |
| TC-109 | Công nợ lớn hơn cọc | Cọc 500 000 đ, công nợ 700 000 đ | Hoàn 0 đ; hóa đơn `settlement` ghi SV còn nợ 200 000 đ | BR-76 | Cao | ⏸ |
| TC-110 | **Trả phòng khi còn đơn nhu yếu phẩm chưa thanh toán** | Cọc 500 000 đ; nợ tiền phòng 246 000 đ; thêm một đơn nhu yếu phẩm 160 000 đ `pending_payment`. Duyệt trả phòng | Đơn và hóa đơn `supplies` → `cancelled`; công nợ chốt **246 000 đ** (không phải 406 000 đ); hoàn **254 000 đ**; response có `cancelledSupplyOrders: 1` | FR-66, FR-106, BR-97 | **Rất cao** | ⏸ |

### 4.8. Cổng sinh viên — trọng tâm bảo mật (10)

| ID | Tiêu đề | Các bước | Kết quả mong đợi | Truy vết | Ưu tiên | KQ |
|----|---------|----------|------------------|----------|---------|-----|
| TC-120 | Xem thông tin cư trú | SV A mở "Chỗ ở của tôi" | Hiện đúng tòa/phòng/giường/hợp đồng + tóm tắt công nợ của SV A | FR-82 | Cao | ⏸ |
| TC-121 | **IDOR: xem hóa đơn người khác** | SV C gọi `GET /api/portal/my-invoices/<id của SV A>` | `403 FORBIDDEN` | FR-85, BR-86 | **Rất cao** | ⏸ |
| TC-122 | **IDOR: thanh toán hóa đơn người khác** | SV C gọi checkout với `invoiceId` của SV A | `403 FORBIDDEN` | FR-85 | **Rất cao** | ⏸ |
| TC-123 | **IDOR: hủy yêu cầu người khác** | SV C gọi `DELETE /api/portal/my-requests/<id của SV B>` | `403 FORBIDDEN` | FR-85 | **Rất cao** | ⏸ |
| TC-124 | **Truyền studentId giả trong query** | SV C gọi `GET /api/portal/my-invoices?studentId=<A>` | Chỉ trả hóa đơn của SV C — tham số bị **bỏ qua hoàn toàn** | BR-86 | **Rất cao** | ⏸ |
| TC-125 | Không lộ dữ liệu nhạy cảm | SV xem thông tin phòng mình | Không trả SĐT người liên hệ khẩn cấp của SV khác | FR-93 | **Cao** | ⏸ |
| TC-126 | Hồ sơ cá nhân chỉ đọc | SV mở trang hồ sơ | Không có nút Sửa; mọi ô ở chế độ chỉ đọc | FR-86 | Cao | ⏸ |
| TC-127 | Xem loại phòng và vào luồng đăng ký | SV B (chưa lưu trú) mở trang chủ; SV A (đang lưu trú) gõ thẳng `/portal/apply` | SV B thấy lời mời đăng ký + loại phòng còn chỗ (chỉ đếm phòng khớp giới tính); SV A bị đưa về trang chủ | FR-83 | Cao | ⏸ |
| TC-128 | Xem lịch sử thanh toán | SV mở lịch sử | Chỉ hiện giao dịch của chính mình | FR-84 | Cao | ⏸ |
| TC-129 | **IDOR: hủy đơn đăng ký / đơn hàng của người khác** | SV C gọi `DELETE /api/portal/my-applications/<id của SV B>` và `PATCH /api/portal/my-supply-orders/<id của SV A>/cancel` | Cả hai `403 FORBIDDEN`, dữ liệu không đổi | FR-85, BR-86 | **Rất cao** | ⏸ |

### 4.9. Dashboard & phi chức năng (9)

| ID | Tiêu đề | Cách kiểm tra | Tiêu chí đạt | Truy vết | KQ |
|----|---------|---------------|--------------|----------|-----|
| TC-140 | Số liệu dashboard khớp thực tế | Đối chiếu với truy vấn `mongosh` trực tiếp | Các con số khớp | FR-70 | ⏸ |
| TC-141 | **Bất biến số giường** | Kiểm tra `GET /api/dashboard/occupancy` | `total = occupied + available + maintenance` | FR-70 | ⏸ |
| TC-142 | Viewer không thấy nút thao tác trên dashboard | Đăng nhập viewer | Chỉ hiển thị số liệu | FR-04 | ⏸ |
| TC-143 | Hiệu năng API danh sách | Postman đo `GET /api/students?limit=50` | < 500 ms | NFR-01 | ⏸ |
| TC-144 | Hiệu năng dashboard | Đo `GET /api/dashboard/summary` | < 2 giây | NFR-02 | ⏸ |
| TC-145 | Giao diện máy tính (+ không vỡ ở 360px) | Mở mọi màn hình ở 1280×800; mở cổng SV ở 360px | 1280px: trang không cuộn ngang, bảng dài cuộn trong khung. 360px: không vỡ bố cục (bản mobile hoàn chỉnh làm sau) | NFR-09 | ⏸ |
| TC-146 | Tương thích trình duyệt | Chạy luồng chính trên Chrome, Edge, Firefox | Hoạt động giống nhau | NFR-12 | ⏸ |
| TC-147 | Giao diện tiếng Việt | Rà toàn bộ màn hình và thông báo | Không còn chuỗi tiếng Anh lọt ra giao diện | NFR-20 | ⏸ |
| TC-148 | Lỗi 500 không lộ stack trace | Gây lỗi chủ ý | Response chỉ có `{ code, message }`, không có stack | NFR-18 | ⏸ |

### 4.10. Nhu yếu phẩm (12)

| ID | Tiêu đề | Các bước | Kết quả mong đợi | Truy vết | Ưu tiên | KQ |
|----|---------|----------|------------------|----------|---------|-----|
| TC-150 | Cửa hàng ẩn đồ đã cấp sẵn | SV D (phòng Chất lượng cao, được cấp đệm) mở "Mua sắm" | Không có "Đệm mút" trong danh sách mua; "Đệm mút" nằm trong mục đã có trong phòng. SV A (phòng Tiêu chuẩn) vẫn thấy "Đệm mút" | FR-101, BR-90 | Cao | ⏸ |
| TC-151 | Đặt món đã cấp sẵn qua API | SV D gọi `POST /api/portal/my-supply-orders` với `supplyItemId` của "Đệm mút" | `422 SUPPLY_ALREADY_INCLUDED` | FR-102, BR-90 | Cao | ⏸ |
| TC-152 | **Gửi giá giả** | Body kèm `"price": 1000, "totalAmount": 1000` cho món giá 120 000 đ | Các trường giá bị bỏ qua; `totalAmount` = 120 000 đ | FR-102, BR-92 | **Rất cao** | ⏸ |
| TC-153 | Đặt hàng sinh hóa đơn riêng | Đặt 2 món tổng 160 000 đ | Đơn `pending_payment` + **1** hóa đơn `type: "supplies"`, `billingPeriod: null`, hạn = hôm nay + 3 ngày | FR-102, BR-94 | Cao | ⏸ |
| TC-154 | Vượt số lượng | Đặt một món số lượng 6 | Chặn — tối đa 5 | BR-93 | TB | ⏸ |
| TC-155 | SV chưa có hợp đồng đặt hàng | SV B đặt hàng | `422 CONTRACT_NOT_ACTIVE` | BR-91 | Cao | ⏸ |
| TC-156 | **Thanh toán xong chuyển "chờ nhận" đúng một lần** | Thanh toán hóa đơn `supplies` qua VNPay; gửi lại **cùng** webhook thành công lần 2 | Đơn `ready`; lần 2 không lỗi, không tạo thêm `Payment`, không đổi gì | FR-103, BR-95 | **Rất cao** | ⏸ |
| TC-157 | Thu tiền tại quầy cũng chuyển "chờ nhận" | Staff ghi nhận thanh toán tiền mặt đủ cho hóa đơn `supplies` | Đơn tự chuyển `ready` | FR-103 | Cao | ⏸ |
| TC-158 | Giao hàng | Giao một đơn `ready`; thử giao một đơn `pending_payment` | Lần 1 → `delivered`, lưu người giao; lần 2 → `422 INVALID_ORDER_STATUS` | FR-104, BR-96 | Cao | ⏸ |
| TC-159 | Hủy đơn | Hủy đơn `pending_payment`; thử hủy đơn `ready` | Lần 1 → đơn và hóa đơn `cancelled`; lần 2 → `422 ORDER_NOT_CANCELLABLE` | FR-105, BR-96 | Cao | ⏸ |
| TC-160 | **Job tự hủy đơn quá hạn** | Đơn `pending_payment` có hóa đơn hạn hôm qua, chưa thanh toán. Chạy job | Đơn và hóa đơn → `cancelled`; hóa đơn **không** chuyển `overdue`; công nợ SV **không** tính khoản này | FR-106, BR-97 | **Rất cao** | ⏸ |
| TC-161 | Đổi giá sản phẩm không đổi đơn cũ | Đặt đơn, rồi đổi giá sản phẩm | Đơn cũ giữ `unitPrice` cũ | BR-92 | TB | ⏸ |

**Tổng: 111 test case.**

---

## 5. Kịch bản UAT

### UAT-01: Vòng đời trọn vẹn một sinh viên (35 phút)

| # | Vai | Thao tác | Kiểm chứng |
|---|-----|----------|------------|
| 1 | Staff | Thêm hồ sơ SV mới, giới tính **nữ** | Hiện trong danh sách |
| 2 | Staff | Tạo phòng loại "Tiêu chuẩn · 6 người", `gender: female` | Phòng có **6 giường tự sinh** `available` |
| 3 | Student | Đăng ký tài khoản, đăng nhập | Trang chủ hiện lời mời "Đăng ký chỗ ở" |
| 4 | Student | Đăng ký chỗ ở: chọn loại → chọn phòng vừa tạo → nộp đơn | Đơn `pending`; trang chủ hiện "Đơn đang chờ duyệt"; **giường vẫn trống** |
| 5 | Staff | Thử đổi đơn sang một phòng **nam** cùng loại rồi duyệt | Bị chặn `GENDER_MISMATCH` ✅ |
| 6 | Staff | Duyệt với phòng ban đầu | Giường **01** được gán; hợp đồng `active` + **2 hóa đơn** (cọc, tiền phòng) |
| 7 | Student | Xem "Chỗ ở & hợp đồng", thanh toán hóa đơn tiền cọc qua VNPay | Đúng phòng/giường; hóa đơn → `paid` |
| 8 | Student | Mua "Vỏ gối" ở Mua sắm, thanh toán | Đơn → "Chờ nhận hàng" |
| 9 | Staff | Xác nhận đã giao | Đơn → "Đã giao" |
| 10 | Student | Đặt thêm "Chăn mỏng" nhưng **không** thanh toán | Đơn "Chờ thanh toán" |
| 11 | Staff | Nhập chỉ số điện nước, lập hóa đơn kỳ | SV **được bổ sung** dòng điện/nước vào hóa đơn tháng đã có |
| 12 | Student | Thanh toán một phần (50%) hóa đơn tháng, gửi yêu cầu trả phòng | Hóa đơn `partial`; `Request` `pending` |
| 13 | Staff | Duyệt trả phòng (còn nợ → phải xác nhận `forceConfirm`) | Đơn "Chăn mỏng" **tự hủy**; hợp đồng `terminated`; giường `available`; **hóa đơn `settlement` + `Payment` refund** |
| 14 | Admin | Mở dashboard | Giường trống tăng 1, SV đang ở giảm 1 |

### UAT-02: Nghiệp vụ hằng tháng của nhân viên (20 phút)

| # | Thao tác | Kiểm chứng |
|---|----------|------------|
| 1 | Nhập chỉ số điện nước toàn bộ phòng của một tòa | Lưu thành công |
| 2 | Chạy lập hóa đơn kỳ | Xem trước cảnh báo phòng thiếu chỉ số |
| 3 | Xử lý phòng thiếu, chạy lại | Tạo đủ hóa đơn |
| 4 | Kiểm tra ngẫu nhiên 3 hóa đơn | Số tiền khớp công thức tính tay; **tổng các phần chia = tổng phòng** |
| 5 | Ghi nhận thanh toán tiền mặt cho 5 SV | Trạng thái cập nhật đúng |
| 6 | Xử lý 3 yêu cầu gia hạn | Hợp đồng dời hạn, sinh hóa đơn kỳ mới, **không thu lại cọc** |
| 7 | Xuất CSV danh sách sinh viên | File tải về mở đúng bằng Excel, tiếng Việt không lỗi font |

### UAT-03: Kiểm tra phân quyền (15 phút)

| # | Thao tác | Kiểm chứng |
|---|----------|------------|
| 1 | Đăng nhập viewer, thử mọi chức năng | Chỉ xem được |
| 2 | Dùng token viewer gọi API ghi bằng Postman | `403` |
| 3 | Đăng nhập SV C, thử truy cập dữ liệu SV A qua URL và API | `403` ở mọi trường hợp |
| 3b | Đăng nhập SV nam, gọi `GET /api/rooms/available?gender=female` | Chỉ nhận phòng nam |
| 3c | Đăng nhập staff, thử sửa giá một loại phòng | Nút sửa không hiện; gọi API trực tiếp → `403` |
| 4 | Đăng nhập staff, thử vào `/admin/users` | Chuyển về trang 403 |
| 5 | Đăng xuất, gõ URL trang quản trị | Chuyển về `/login` |

---

## 6. Mẫu báo cáo kết quả

| Module | Tổng TC | Đã chạy | Đạt | Không đạt | Tỷ lệ đạt |
|--------|---------|---------|-----|-----------|-----------|
| Xác thực & phân quyền | 12 | | | | |
| Quản lý sinh viên | 7 | | | | |
| Tòa nhà, loại phòng, phòng, giường | 10 | | | | |
| Đơn đăng ký, lưu trú & hợp đồng | 17 | | | | |
| Chỉ số điện nước & hóa đơn | 13 | | | | |
| Thanh toán | 10 | | | | |
| Gia hạn, trả phòng, cọc | 11 | | | | |
| Cổng sinh viên | 10 | | | | |
| Dashboard & phi chức năng | 9 | | | | |
| Nhu yếu phẩm | 12 | | | | |
| **Tổng** | **111** | | | | |

**Bảng theo dõi lỗi**

| ID lỗi | Test case | Mô tả | Mức độ | Người phát hiện | Người sửa | Trạng thái | Ngày đóng |
|--------|-----------|-------|--------|------------------|-----------|------------|-----------|
| BUG-01 | | | | | | Mở / Đang sửa / Đã sửa / Đã xác minh | |

> **Không được cắt** dù thiếu thời gian: TC-42 (tranh chấp chỗ cuối), TC-44 (đổi sang phòng khác giới tính), TC-70 (thất thu điện nước), TC-86/87/88 (bảo mật webhook), TC-108 và TC-110 (quyết toán cọc, không trừ hàng chưa nhận), TC-121→124 và TC-129 (IDOR), TC-152 (giá giả), TC-156 (webhook lặp với đơn hàng), TC-160 (tự hủy đơn quá hạn). Đây là **16 test** bảo vệ những lỗi nghiêm trọng nhất.

---

## 7. Lịch sử phiên bản

| Phiên bản | Ngày | Nội dung |
|-----------|------|----------|
| v1.0 | 11/09/2026 | Khởi tạo, 122 test case (PostgreSQL) |
| v1.1 | 12/09/2026 | Thêm 7 test case sau rà soát chéo |
| v1.2 | 12/09/2026 | Rút xuống 65 test case trọng tâm |
| **v2.1** | **13/09/2026** | **Đăng ký theo phòng + nhu yếu phẩm.** Viết lại 4.3 (giường tự sinh, loại phòng, chỗ trống không tính giường bảo trì) và 4.4 (đơn đăng ký, tự gán giường, tranh chấp chỗ cuối, đổi phòng khác giới tính khi duyệt, bù trừ khi lỗi, duyệt muộn). Thêm TC-110 (trả phòng hủy đơn hàng chưa trả), TC-129 (IDOR đơn đăng ký/đơn hàng), mục 4.10 Nhu yếu phẩm (12 test). TC-145 chuyển sang ưu tiên máy tính. Thêm TC-72 (job hóa đơn quá hạn — FR-57 trước đó không có test). Viết lại UAT-01. Danh sách "không được cắt" 11 → 16. **Tổng: 111 test case.** |
| v2.0 | 12/09/2026 | **Viết lại theo stack MongoDB và phạm vi v2.** Bỏ test SV tự nộp đơn, chuyển phòng, giường giữ chỗ (đều ngoài phạm vi). Thêm test giới tính phòng (TC-43, TC-44), chỉ số điện nước (TC-60→64), quyết toán cọc (TC-108, TC-109), bảo mật webhook (TC-86→88). Enum chữ thường, mã lỗi theo `API.md`, tài khoản test dùng email. **Tổng: 88 test case.** |
