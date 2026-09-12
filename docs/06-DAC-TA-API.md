# 06 – ĐẶC TẢ API (API CONTRACT)

**Hệ thống:** DMS-KTX
**Phiên bản API:** v1
**Base URL:** `http://localhost:5000/api/v1` (dev) · `https://<domain>/api/v1` (production)

> ⚠️ **Đang áp dụng v1-lite:** bỏ `/auth/refresh` (dùng 1 token hạn 7 ngày), bỏ toàn bộ endpoint ZaloPay, và thay `GET /payments/vnpay/ipn` bằng `POST /payments/vnpay/verify` (frontend gửi tham số Return URL lên để backend xác thực chữ ký). Xem [`14` mục 4.10, 4.11](14-PHIEN-BAN-DON-GIAN-HOA.md).

> ⚠️ **Đây là HỢP ĐỒNG giữa Frontend và Backend.** Mọi thay đổi phải được thống nhất và cập nhật tài liệu này **trước khi** code. Frontend dựa vào tài liệu này để viết mock API và làm trước khi backend hoàn thành.

---

## 1. Quy ước chung

### 1.1. Header bắt buộc

| Header | Giá trị | Áp dụng |
|--------|---------|---------|
| `Content-Type` | `application/json` | Mọi request có body |
| `Authorization` | `Bearer <access_token>` | Mọi endpoint trừ nhóm công khai |

**Endpoint công khai (không cần token):** `POST /auth/login`, `POST /auth/register`, `POST /payments/vnpay/verify`, `GET /health`

### 1.2. Tham số truy vấn dùng chung cho danh sách

| Tham số | Kiểu | Mặc định | Mô tả |
|---------|------|----------|-------|
| `page` | number | `1` | Trang hiện tại (bắt đầu từ 1) |
| `limit` | number | `20` | Số bản ghi mỗi trang (tối đa 100) |
| `search` | string | – | Từ khóa tìm kiếm |
| `sortBy` | string | tùy endpoint | Trường sắp xếp |
| `sortOrder` | `asc` \| `desc` | `desc` | Chiều sắp xếp |

### 1.3. Cấu trúc response

Xem `05-KIEN-TRUC-HE-THONG.md` mục 4. Tóm tắt:
```json
{ "success": true, "message": "...", "data": {}, "meta": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 } }
```

### 1.4. Ký hiệu quyền trong bảng

`A` = Admin · `S` = Staff · `V` = Viewer · `ST` = Student · `P` = Public (không cần đăng nhập)

---

## 2. Nhóm Xác thực – `/auth`

| Method | Endpoint | Quyền | Mô tả | FR |
|--------|----------|-------|-------|-----|
| POST | `/auth/login` | P | Đăng nhập | FR-01 |
| POST | `/auth/register` | P | Sinh viên tự đăng ký tài khoản | FR-85 |
| POST | `/auth/logout` | A S V ST | Đăng xuất (client xóa token) | FR-02 |
| GET | `/auth/me` | A S V ST | Lấy thông tin người dùng hiện tại | – |
| PATCH | `/auth/change-password` | A S V ST | Đổi mật khẩu | FR-07 |
| POST | `/users/:id/reset-password` | A S | Đặt lại mật khẩu hộ người dùng quên mật khẩu | FR-09 |

> ⚠️ **Bất biến về số giường:** mọi API trả thống kê giường phải thỏa `totalBeds = occupied + reserved + available + maintenance`. Trường `reserved` (giường đang bị đơn chờ duyệt giữ chỗ) rất dễ bị quên, dẫn đến số liệu dashboard không cộng đúng.

### POST `/users/:id/reset-password`

**Quyền:** Admin, Staff (Staff không được reset mật khẩu tài khoản Admin).

**Request:** `{}` (không cần body)

**Response 200:**
```json
{
  "success": true,
  "message": "Đã đặt lại mật khẩu. Vui lòng trao mật khẩu tạm cho người dùng.",
  "data": {
    "userId": 25,
    "email": "sv2024001@sv.edu.vn",
    "temporaryPassword": "Ktx7Rm2qPz",
    "mustChangePassword": true
  }
}
```
> `temporaryPassword` **chỉ trả về một lần duy nhất** trong response này và **không bao giờ được ghi vào log**. Ở lần đăng nhập kế tiếp, `/auth/login` trả thêm `user.mustChangePassword = true`; frontend phải chuyển thẳng người dùng sang màn hình đổi mật khẩu và chặn mọi điều hướng khác cho tới khi đổi xong (BR-18).

### POST `/auth/login`

**Request:**
```json
{ "username": "admin@ktx.edu.vn", "password": "Admin@123" }
```
> `username` nhận email hoặc MSSV (dành cho sinh viên).

**Response 200:**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 604800,
    "user": {
      "id": 1,
      "email": "admin@ktx.edu.vn",
      "fullName": "Nguyễn Văn Quản Trị",
      "role": "ADMIN",
      "studentId": null,
      "studentCode": null,
      "mustChangePassword": false
    }
  }
}
```
> v1-lite: chỉ **một** token, hạn 7 ngày (604800 giây), không có refresh token. Hết hạn thì người dùng đăng nhập lại.

**Lỗi:** `401 INVALID_CREDENTIALS` · `403 ACCOUNT_INACTIVE` (tài khoản bị Admin khóa) · `429` (vượt giới hạn tần suất — v1-lite chỉ dùng `express-rate-limit`, không đếm số lần sai theo tài khoản)

### POST `/auth/register`

**Request:**
```json
{
  "studentCode": "SV2024001",
  "email": "sv2024001@sv.edu.vn",
  "fullName": "Trần Thị B",
  "password": "Student@123",
  "phone": "0912345678"
}
```
**Response 201:** giống `/auth/login`, kèm `data.user.linkStatus` = `"LINKED"` (đã khớp hồ sơ) hoặc `"PENDING_LINK"` (FR-86).

**Lỗi:** `409 EMAIL_EXISTS` · `409 STUDENT_CODE_EXISTS` (đã có tài khoản cho MSSV này)

---

## 3. Nhóm Người dùng – `/users`

| Method | Endpoint | Quyền | Mô tả | FR |
|--------|----------|-------|-------|-----|
| GET | `/users` | A | Danh sách tài khoản, lọc `role`, `isActive` | FR-06 |
| POST | `/users` | A | Tạo tài khoản (Staff/Viewer/Admin) | FR-06 |
| GET | `/users/:id` | A | Chi tiết tài khoản | FR-06 |
| PATCH | `/users/:id` | A | Cập nhật thông tin, vai trò | FR-06 |
| PATCH | `/users/:id/status` | A | Khóa/mở khóa tài khoản | FR-06 |
| PATCH | `/users/:id/link-student` | A S | Liên kết tài khoản với hồ sơ sinh viên | FR-86 |

---

## 4. Nhóm Sinh viên – `/students`

| Method | Endpoint | Quyền | Mô tả | FR |
|--------|----------|-------|-------|-----|
| GET | `/students` | A S V | Danh sách có phân trang, tìm kiếm, lọc | FR-15, FR-16 |
| POST | `/students` | A S | Thêm hồ sơ sinh viên | FR-10 |
| GET | `/students/:id` | A S V | Chi tiết hồ sơ | FR-12 |
| PATCH | `/students/:id` | A S | Cập nhật hồ sơ | FR-13 |
| PATCH | `/students/:id/status` | A S | Vô hiệu hóa / kích hoạt lại | FR-14 |
| GET | `/students/:id/contracts` | A S V | Lịch sử hợp đồng của sinh viên | FR-40 |
| GET | `/students/:id/invoices` | A S V | Danh sách hóa đơn của sinh viên | – |
| GET | `/students/:id/debt` | A S V | Tổng công nợ hiện tại | – |
| GET | `/students/export` | A S V | Xuất **CSV** theo bộ lọc hiện tại | FR-18 |

> v1-lite: bỏ `POST /students/import` (FR-17 ưu tiên `C`); dữ liệu nhập tay hoặc qua script seed.

### GET `/students`

**Query:** `page`, `limit`, `search` (tên/MSSV/SĐT/email), `residenceStatus` (`RESIDING`\|`NOT_RESIDING`\|`LEFT`), `buildingId`, `roomId`, `gender`, `faculty`, `isActive`, `sortBy`, `sortOrder`

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 12,
      "studentCode": "SV2024001",
      "fullName": "Trần Thị B",
      "gender": "FEMALE",
      "dateOfBirth": "2005-03-14",
      "phone": "0912345678",
      "email": "sv2024001@sv.edu.vn",
      "className": "CNTT2024A",
      "faculty": "Công nghệ thông tin",
      "isActive": true,
      "residence": {
        "buildingCode": "B2",
        "roomNumber": "301",
        "bedLabel": "A3",
        "contractCode": "HD-2026-00042",
        "endDate": "2027-06-30"
      },
      "totalDebt": 646000
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 137, "totalPages": 7 }
}
```
> `residence` = `null` nếu sinh viên chưa/không còn lưu trú.

### POST `/students`

**Request:**
```json
{
  "studentCode": "SV2024001",
  "fullName": "Trần Thị B",
  "dateOfBirth": "2005-03-14",
  "gender": "FEMALE",
  "idCardNumber": "001305000123",
  "phone": "0912345678",
  "email": "sv2024001@sv.edu.vn",
  "className": "CNTT2024A",
  "faculty": "Công nghệ thông tin",
  "courseYear": "K19",
  "hometown": "Hà Nội",
  "emergencyContactName": "Trần Văn A",
  "emergencyContactPhone": "0987654321"
}
```
**Response 201:** trả về đối tượng sinh viên vừa tạo.
**Lỗi:** `409 STUDENT_CODE_EXISTS` (BR-11) · `400` validation

### PATCH `/students/:id/status`
**Request:** `{ "isActive": false }`
**Lỗi:** `422 STUDENT_HAS_ACTIVE_CONTRACT` (BR-13) · `422 STUDENT_HAS_DEBT` (BR-14)

---

## 5. Nhóm Cơ sở vật chất

### 5.1. Tòa nhà – `/buildings`

| Method | Endpoint | Quyền | Mô tả | FR |
|--------|----------|-------|-------|-----|
| GET | `/buildings` | A S V ST | Danh sách tòa nhà kèm thống kê giường | FR-20 |
| POST | `/buildings` | A S | Thêm tòa nhà | FR-20 |
| GET | `/buildings/:id` | A S V ST | Chi tiết | FR-20 |
| PATCH | `/buildings/:id` | A S | Cập nhật | FR-20 |
| DELETE | `/buildings/:id` | A | Ngừng hoạt động (soft delete) | FR-25 |
| GET | `/buildings/:id/map` | A S V | Sơ đồ phòng của tòa | FR-26 |

**GET `/buildings` – Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 2, "code": "B2", "name": "Tòa B2 - Nữ",
      "totalFloors": 5, "genderPolicy": "FEMALE", "isActive": true,
      "stats": { "totalRooms": 20, "totalBeds": 140, "occupied": 118, "reserved": 0, "available": 18, "maintenance": 4, "occupancyRate": 86.76 }
    }
  ]
}
```

**GET `/buildings/:id/map` – Response (FR-26):**
```json
{
  "success": true,
  "data": {
    "buildingId": 2, "buildingCode": "B2",
    "floors": [
      {
        "floorNumber": 3,
        "rooms": [
          { "id": 45, "roomNumber": "301", "capacity": 8, "occupied": 6, "available": 2, "maintenance": 0, "status": "ACTIVE", "pricePerMonth": 400000, "fillLevel": "PARTIAL" }
        ]
      }
    ]
  }
}
```
> `fillLevel`: `EMPTY` \| `PARTIAL` \| `FULL` \| `MAINTENANCE` — dùng để tô màu ô phòng.

### 5.2. Phòng – `/rooms`

| Method | Endpoint | Quyền | Mô tả | FR |
|--------|----------|-------|-------|-----|
| GET | `/rooms` | A S V ST | Danh sách phòng, lọc `buildingId`, `floorNumber`, `roomType`, `status`, `hasAvailableBed` | FR-21 |
| POST | `/rooms` | A S | Thêm phòng | FR-21 |
| GET | `/rooms/:id` | A S V ST | Chi tiết phòng kèm danh sách giường và người ở | FR-21 |
| PATCH | `/rooms/:id` | A S | Cập nhật | FR-21 |
| DELETE | `/rooms/:id` | A | Ngừng hoạt động | FR-25 |
| POST | `/rooms/:id/generate-beds` | A S | Sinh nhanh giường theo sức chứa | FR-23 |
| GET | `/rooms/:id/residents` | A S V | Danh sách sinh viên đang ở trong phòng | – |

**POST `/rooms` – Request:**
```json
{ "buildingId": 2, "roomNumber": "301", "floorNumber": 3, "roomType": "STANDARD_8", "gender": "FEMALE", "capacity": 8, "pricePerMonth": 400000, "description": "Phòng có điều hòa, ban công" }
```
**Lỗi:** `409` trùng số phòng trong tòa (BR-02) · `422 ROOM_CAPACITY_EXCEEDED` khi giảm capacity dưới số giường hiện có (BR-09) · `422 GENDER_MISMATCH` khi `gender` không khớp `building.gender_policy` (tòa `MALE`/`FEMALE`) — với tòa `MIXED` thì `gender` tự do nhưng **bắt buộc** phải có (BR-17)

**POST `/rooms/:id/generate-beds` – Request:**
```json
{ "prefix": "A", "startNumber": 1, "count": 8 }
```
**Response 201:** `{ "created": 8, "beds": [ { "id": 301, "bedLabel": "A1", "status": "AVAILABLE" } ] }`

### 5.3. Giường – `/beds`

| Method | Endpoint | Quyền | Mô tả | FR |
|--------|----------|-------|-------|-----|
| GET | `/beds` | A S V | Danh sách giường, lọc `roomId`, `status` | FR-22 |
| GET | `/beds/available` | A S V ST | **Tra cứu giường trống** (có bộ lọc) | FR-28 |
| POST | `/beds` | A S | Thêm giường | FR-22 |
| PATCH | `/beds/:id` | A S | Cập nhật ký hiệu/ghi chú | FR-22 |
| PATCH | `/beds/:id/status` | A S | Đổi trạng thái (bảo trì / khả dụng) | FR-27 |
| DELETE | `/beds/:id` | A | Xóa giường chưa từng sử dụng | FR-25 |

**GET `/beds/available` – Query:** `buildingId`, `roomType`, `gender`, `minPrice`, `maxPrice`, `page`, `limit`

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "bedId": 312, "bedLabel": "A5",
      "room": { "id": 45, "roomNumber": "301", "floorNumber": 3, "roomType": "STANDARD_8", "gender": "FEMALE", "capacity": 8, "currentOccupancy": 6, "pricePerMonth": 400000 },
      "building": { "id": 2, "code": "B2", "name": "Tòa B2 - Nữ", "genderPolicy": "FEMALE" }
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 18, "totalPages": 1 }
}
```

**PATCH `/beds/:id/status` – Request:** `{ "status": "MAINTENANCE", "note": "Hỏng khung giường" }`
**Lỗi:** `422` nếu giường đang `OCCUPIED` (BR-08)

---

## 6. Nhóm Hợp đồng – `/contracts`

| Method | Endpoint | Quyền | Mô tả | FR |
|--------|----------|-------|-------|-----|
| GET | `/contracts` | A S V | Danh sách hợp đồng có lọc | FR-36 |
| POST | `/contracts` | A S | Nhân viên tạo hợp đồng trực tiếp | FR-31 |
| GET | `/contracts/:id` | A S V | Chi tiết hợp đồng | FR-36 |
| POST | `/contracts/:id/approve` | A S | Duyệt đơn đăng ký | FR-35 |
| POST | `/contracts/:id/reject` | A S | Từ chối đơn (bắt buộc lý do) | FR-35 |
| POST | `/contracts/:id/terminate` | A S | Chấm dứt trước hạn | FR-39 |
| POST | `/contracts/:id/transfer-bed` | A S | Chuyển phòng/giường | FR-29 |
| GET | `/contracts/expiring` | A S | Hợp đồng sắp hết hạn | FR-38 |
| ~~GET~~ | ~~`/contracts/:id/pdf`~~ | – | v1-lite: in bằng trình duyệt ở phía frontend (`14` mục 4.8) | FR-41 |

### GET `/contracts`

**Query:** `page`, `limit`, `search` (mã HĐ/tên SV/MSSV), `status`, `buildingId`, `roomId`, `startDateFrom`, `startDateTo`, `endDateFrom`, `endDateTo`, `expiringInDays`

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 42, "contractCode": "HD-2026-00042", "status": "ACTIVE",
      "student": { "id": 12, "studentCode": "SV2024001", "fullName": "Trần Thị B", "gender": "FEMALE" },
      "bed": { "id": 312, "bedLabel": "A3", "roomNumber": "301", "buildingCode": "B2" },
      "startDate": "2026-09-01", "endDate": "2027-06-30", "actualEndDate": null,
      "monthlyPrice": 400000, "depositAmount": 500000,
      "daysUntilExpiry": 292, "isExpiringSoon": false,
      "totalDebt": 646000,
      "approvedBy": { "id": 2, "fullName": "Lê Văn Nhân Viên" },
      "approvedAt": "2026-08-28T09:15:00+07:00",
      "createdAt": "2026-08-27T14:02:11+07:00"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 95, "totalPages": 5 }
}
```

### POST `/contracts` (nhân viên tạo trực tiếp)

**Request:**
```json
{
  "studentId": 12,
  "bedId": 312,
  "startDate": "2026-09-01",
  "endDate": "2027-06-30",
  "depositAmount": 500000,
  "note": "Đăng ký tại quầy",
  "autoApprove": true
}
```
> `autoApprove: true` → tạo thẳng ở trạng thái `ACTIVE` và sinh hóa đơn kỳ đầu ngay.

**Response 201:**
```json
{
  "success": true,
  "message": "Tạo hợp đồng thành công",
  "data": {
    "contract": { "id": 43, "contractCode": "HD-2026-00043", "status": "ACTIVE" },
    "invoices": [
      { "id": 201, "invoiceCode": "INV-202609-00201", "invoiceType": "DEPOSIT", "periodMonth": null, "totalAmount": 500000, "dueDate": "2026-09-08" },
      { "id": 202, "invoiceCode": "INV-202609-00202", "invoiceType": "MONTHLY", "periodMonth": 9, "periodYear": 2026, "totalAmount": 400000, "dueDate": "2026-09-08" }
    ]
  }
}
```
> ⚠️ Trả về **mảng 2 hóa đơn**, không phải 1. Tiền cọc (`DEPOSIT`, `periodMonth = null`) phải tách khỏi tiền phòng tháng đầu (`MONTHLY`) theo BR-25 — nếu gộp, đợt lập hóa đơn cuối kỳ sẽ bỏ qua sinh viên này và thất thu tiền điện nước của kỳ đó.
**Lỗi:** `409 BED_NOT_AVAILABLE` (BR-20) · `422 STUDENT_HAS_ACTIVE_CONTRACT` (BR-21) · `422 GENDER_MISMATCH` (BR-06) · `422` thời hạn không hợp lệ (BR-23, BR-24)

### POST `/contracts/:id/approve`

**Request:** `{ "note": "Đã kiểm tra hồ sơ" }`
**Response 200:** giống POST `/contracts` (trả về hợp đồng + **mảng 2 hóa đơn** kỳ đầu vừa sinh).
**Lỗi:** `422 CONTRACT_NOT_PENDING` · `409 BED_NOT_AVAILABLE` (giường đã bị chiếm trong lúc chờ)

### POST `/contracts/:id/reject`
**Request:** `{ "reason": "Hồ sơ thiếu giấy tờ xác nhận sinh viên" }`
**Lỗi:** `400` nếu `reason` rỗng

### POST `/contracts/:id/terminate`
**Request:**
```json
{ "actualEndDate": "2026-12-15", "reason": "Sinh viên chuyển trường", "forceConfirm": false }
```
**Response 200 – biên bản thanh lý:**
```json
{
  "success": true,
  "data": {
    "contract": { "id": 42, "status": "TERMINATED", "actualEndDate": "2026-12-15" },
    "settlement": {
      "totalInvoiced": 3230000,
      "totalPaid": 2584000,
      "proRatedLastPeriod": 193548,
      "remainingDebt": 839548,
      "depositAmount": 500000,
      "refundAmount": 0,
      "studentStillOwes": 339548
    }
  }
}
```
**Lỗi:** `422 STUDENT_HAS_DEBT` khi còn nợ và `forceConfirm = false` (BR-76)

### POST `/contracts/:id/transfer-bed`
**Request:** `{ "toBedId": 520, "transferDate": "2026-11-01", "reason": "Sinh viên xin chuyển gần bạn cùng lớp" }`
**Lỗi:** `409 BED_NOT_AVAILABLE` · `422 GENDER_MISMATCH`

### GET `/contracts/expiring`
**Query:** `days` (mặc định 30), `buildingId`
**Response:** danh sách hợp đồng có `daysUntilExpiry` tăng dần.

---

## 7. Nhóm Danh mục phí – `/fee-types`

| Method | Endpoint | Quyền | Mô tả | FR |
|--------|----------|-------|-------|-----|
| GET | `/fee-types` | A S V | Danh sách loại phí | FR-55 |
| POST | `/fee-types` | A | Thêm loại phí | FR-55 |
| PATCH | `/fee-types/:id` | A | Cập nhật | FR-55 |
| DELETE | `/fee-types/:id` | A | Ngừng sử dụng | FR-55 |

---

## 8. Nhóm Chỉ số điện nước – `/utility-readings`

| Method | Endpoint | Quyền | Mô tả | FR |
|--------|----------|-------|-------|-----|
| GET | `/utility-readings` | A S V | Danh sách chỉ số, lọc `periodMonth`, `periodYear`, `buildingId`, `isInvoiced` | FR-56 |
| POST | `/utility-readings` | A S | Nhập chỉ số cho một phòng | FR-56 |
| POST | `/utility-readings/bulk` | A S | Nhập hàng loạt theo tòa | FR-56 |
| PATCH | `/utility-readings/:id` | A S | Sửa chỉ số (chỉ khi chưa lập hóa đơn) | FR-56 |
| GET | `/utility-readings/template` | A S | Lấy khung nhập kỳ mới (tự điền chỉ số đầu = cuối kỳ trước) | BR-50 |

**POST `/utility-readings` – Request:**
```json
{
  "roomId": 45, "periodMonth": 10, "periodYear": 2026,
  "electricityStart": 1250, "electricityEnd": 1610,
  "waterStart": 85, "waterEnd": 133
}
```
**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 88, "roomId": 45, "periodMonth": 10, "periodYear": 2026,
    "electricityConsumption": 360, "electricityAmount": 900000,
    "waterConsumption": 48, "waterAmount": 576000,
    "isInvoiced": false
  }
}
```
**Lỗi:** `422` chỉ số cuối < chỉ số đầu (BR-49) · `409` đã tồn tại chỉ số cho phòng/kỳ này · `422` đã lập hóa đơn, không cho sửa

---

## 9. Nhóm Hóa đơn – `/invoices`

| Method | Endpoint | Quyền | Mô tả | FR |
|--------|----------|-------|-------|-----|
| GET | `/invoices` | A S V | Danh sách hóa đơn có lọc | FR-58 |
| POST | `/invoices` | A S | Tạo hóa đơn thủ công | FR-58 |
| POST | `/invoices/generate-period` | A S | **Lập hóa đơn hàng loạt theo kỳ** | FR-59 |
| GET | `/invoices/:id` | A S V | Chi tiết hóa đơn kèm dòng phí và lịch sử thanh toán | FR-70 |
| PATCH | `/invoices/:id` | A S | Sửa hóa đơn (chỉ khi chưa thanh toán) | – |
| POST | `/invoices/:id/cancel` | A S | Hủy hóa đơn | FR-69 |
| ~~GET~~ | ~~`/invoices/:id/pdf`~~ | – | v1-lite: in bằng trình duyệt ở phía frontend, không cần API (`14` mục 4.8) | FR-71 |
| GET | `/invoices/export` | A S V | Xuất CSV theo bộ lọc | FR-81 |

### GET `/invoices`
**Query:** `page`, `limit`, `search`, `studentId`, `status`, `invoiceType`, `periodMonth`, `periodYear`, `buildingId`, `dueDateFrom`, `dueDateTo`, `isOverdue`

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 201, "invoiceCode": "INV-202610-00201",
      "student": { "id": 12, "studentCode": "SV2024001", "fullName": "Trần Thị B" },
      "room": { "roomNumber": "301", "buildingCode": "B2" },
      "invoiceType": "MONTHLY", "periodMonth": 10, "periodYear": 2026,
      "totalAmount": 646000, "paidAmount": 0, "remainingAmount": 646000,
      "issueDate": "2026-11-01", "dueDate": "2026-11-10",
      "status": "UNPAID", "daysOverdue": 0
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 95, "totalPages": 5 }
}
```

### POST `/invoices` (tạo thủ công)
```json
{
  "studentId": 12,
  "contractId": 42,
  "invoiceType": "OTHER",
  "periodMonth": 10,
  "periodYear": 2026,
  "dueDate": "2026-11-10",
  "note": "Phí làm lại thẻ ra vào",
  "items": [
    { "feeTypeId": 6, "description": "Phí làm lại thẻ ra vào", "quantity": 1, "unitPrice": 50000 }
  ]
}
```
**Response 201:** hóa đơn đầy đủ với `totalAmount` đã tính (BR-41).

### POST `/invoices/generate-period` (UC-04)
**Request:**
```json
{ "periodMonth": 10, "periodYear": 2026, "buildingIds": [1, 2], "dueDate": "2026-11-10", "includeRoomFee": true, "includeUtility": true }
```
**Response 200:**
```json
{
  "success": true,
  "message": "Đã lập 118 hóa đơn cho kỳ 10/2026",
  "data": {
    "createdCount": 118,
    "totalAmount": 76228000,
    "updatedCount": 3,
    "skipped": [
      { "roomId": 51, "roomNumber": "405", "reason": "Chưa nhập chỉ số điện nước" },
      { "roomId": 52, "roomNumber": "406", "reason": "Không có sinh viên đang ở" },
      { "studentId": 40, "studentCode": "SV2024040", "reason": "Đã có đủ tiền phòng + điện + nước của kỳ này" }
    ],
    "updated": [
      { "studentId": 33, "studentCode": "SV2024033", "invoiceId": 202, "addedItems": ["ELECTRICITY", "WATER"], "reason": "Đã có hóa đơn tiền phòng tháng đầu, bổ sung dòng điện nước" }
    ]
  }
}
```

### GET `/invoices/:id`
```json
{
  "success": true,
  "data": {
    "id": 201, "invoiceCode": "INV-202610-00201", "status": "PARTIALLY_PAID",
    "student": { "id": 12, "studentCode": "SV2024001", "fullName": "Trần Thị B", "phone": "0912345678" },
    "contract": { "id": 42, "contractCode": "HD-2026-00042" },
    "residence": { "buildingCode": "B2", "roomNumber": "301", "bedLabel": "A3" },
    "invoiceType": "MONTHLY", "periodMonth": 10, "periodYear": 2026,
    "issueDate": "2026-11-01", "dueDate": "2026-11-10",
    "totalAmount": 646000, "paidAmount": 400000, "remainingAmount": 246000,
    "items": [
      { "id": 501, "feeType": { "code": "ROOM_FEE", "name": "Tiền phòng" }, "description": "Tiền phòng tháng 10/2026", "quantity": 1, "unitPrice": 400000, "amount": 400000 },
      { "id": 502, "feeType": { "code": "ELECTRICITY", "name": "Tiền điện" }, "description": "Tiền điện tháng 10/2026 (60 kWh/người)", "quantity": 60, "unitPrice": 2500, "amount": 150000 },
      { "id": 503, "feeType": { "code": "WATER", "name": "Tiền nước" }, "description": "Tiền nước tháng 10/2026 (8 m³/người)", "quantity": 8, "unitPrice": 12000, "amount": 96000 }
    ],
    "payments": [
      { "id": 701, "transactionRef": "PAY20261105ABC123", "amount": 400000, "method": "ONLINE", "gateway": "VNPAY", "status": "SUCCESS", "paidAt": "2026-11-05T10:23:45+07:00" }
    ]
  }
}
```

### POST `/invoices/:id/cancel`
**Request:** `{ "reason": "Lập nhầm kỳ" }`
**Lỗi:** `422 INVOICE_HAS_PAYMENT` (BR-47)

---

## 10. Nhóm Thanh toán – `/payments`

| Method | Endpoint | Quyền | Mô tả | FR |
|--------|----------|-------|-------|-----|
| GET | `/payments` | A S V | Danh sách giao dịch | FR-67 |
| POST | `/payments/manual` | A S | Ghi nhận thanh toán thủ công | FR-63 |
| GET | `/payments/:ref` | A S V ST | Tra cứu giao dịch theo `transactionRef` | – |
| POST | `/payments/:id/reconcile` | A S | Đối soát lại giao dịch với VNPay (dùng khi SV đóng trình duyệt giữa chừng) | FR-67 |
| POST | `/payments/vnpay/verify` | P | **Xác thực chữ ký kết quả từ Return URL và ghi nhận thanh toán** | FR-65 |

### POST `/payments/manual`
**Request:**
```json
{
  "invoiceId": 201,
  "amount": 246000,
  "method": "CASH",
  "paidAt": "2026-11-08T14:30:00+07:00",
  "note": "Thu tiền mặt tại văn phòng, phiếu thu số 0123"
}
```
**Response 201:**
```json
{
  "success": true,
  "message": "Ghi nhận thanh toán thành công",
  "data": {
    "payment": { "id": 702, "transactionRef": "MAN20261108XYZ789", "amount": 246000, "status": "SUCCESS" },
    "invoice": { "id": 201, "totalAmount": 646000, "paidAmount": 646000, "remainingAmount": 0, "status": "PAID" }
  }
}
```
**Lỗi:** `422 PAYMENT_EXCEEDS_REMAINING` (BR-44) · `422 INVOICE_ALREADY_PAID` (BR-46)

### POST `/payments/vnpay/verify` (v1-lite — thay cho IPN)

Sau khi thanh toán, VNPay chuyển hướng trình duyệt về `Return URL` kèm các tham số `vnp_*`. Frontend lấy **nguyên toàn bộ** query string đó gửi lên endpoint này; backend xác thực chữ ký HMAC rồi mới ghi nhận.

**Request:** toàn bộ tham số `vnp_*` nhận được ở Return URL
```json
{
  "vnp_TxnRef": "PAY20261108DEF456",
  "vnp_Amount": "24600000",
  "vnp_ResponseCode": "00",
  "vnp_TransactionNo": "14523698",
  "vnp_BankCode": "NCB",
  "vnp_PayDate": "20261108143210",
  "vnp_SecureHash": "a3f5c2..."
}
```

**Response 200 — thành công:**
```json
{
  "success": true,
  "message": "Thanh toán thành công",
  "data": {
    "payment": { "transactionRef": "PAY20261108DEF456", "amount": 246000, "status": "SUCCESS", "paidAt": "2026-11-08T14:32:10+07:00" },
    "invoice": { "id": 201, "totalAmount": 646000, "paidAmount": 646000, "remainingAmount": 0, "status": "PAID" },
    "alreadyConfirmed": false
  }
}
```

**Các trường hợp xử lý:**

| Tình huống | Kết quả | Quy tắc |
|-----------|---------|---------|
| Chữ ký hợp lệ, `vnp_ResponseCode = "00"` | Ghi nhận thanh toán, cập nhật hóa đơn | FR-65 |
| Chữ ký sai | `400 INVALID_SIGNATURE`, **không** cập nhật gì, ghi log cảnh báo | BR-57 |
| Giao dịch đã `SUCCESS` từ trước | `200` với `alreadyConfirmed: true`, **không** ghi nhận lần hai | BR-56 |
| Số tiền không khớp | `422 AMOUNT_MISMATCH`, giao dịch → `NEEDS_RECONCILIATION` | BR-58 |
| `vnp_TxnRef` không tồn tại | `404 NOT_FOUND` | – |
| `vnp_ResponseCode ≠ "00"` | Giao dịch → `FAILED`, hóa đơn giữ nguyên | – |

> ⚠️ **Đánh đổi đã biết:** nếu sinh viên đóng trình duyệt ngay sau khi thanh toán, endpoint này không được gọi và giao dịch ở lại trạng thái `PENDING` dù tiền đã trừ. Nhân viên xử lý bằng `POST /payments/:id/reconcile`. Ở hệ thống chạy thật nên bổ sung IPN — ghi vào phần "Hạn chế" của báo cáo.

---

## 11. Nhóm Yêu cầu – `/requests`

| Method | Endpoint | Quyền | Mô tả | FR |
|--------|----------|-------|-------|-----|
| GET | `/requests` | A S V | Danh sách yêu cầu, lọc `requestType`, `status` | FR-48 |
| GET | `/requests/:id` | A S V | Chi tiết yêu cầu kèm công nợ của sinh viên | FR-48 |
| POST | `/requests/:id/approve` | A S | Duyệt yêu cầu | FR-49, FR-50, FR-51 |
| POST | `/requests/:id/reject` | A S | Từ chối (bắt buộc lý do) | FR-49 |

### GET `/requests/:id`
```json
{
  "success": true,
  "data": {
    "id": 15, "requestType": "CHECKOUT", "status": "PENDING",
    "student": { "id": 12, "studentCode": "SV2024001", "fullName": "Trần Thị B" },
    "contract": { "id": 42, "contractCode": "HD-2026-00042", "endDate": "2027-06-30" },
    "residence": { "buildingCode": "B2", "roomNumber": "301", "bedLabel": "A3" },
    "expectedCheckoutDate": "2026-12-15",
    "newEndDate": null,
    "reason": "Em chuyển ra ngoài ở cùng gia đình",
    "debtSummary": { "totalDebt": 246000, "overdueInvoices": 0, "depositAmount": 500000, "estimatedRefund": 254000 },
    "createdAt": "2026-12-01T08:12:00+07:00"
  }
}
```

### POST `/requests/:id/approve`
**Request (trả phòng):** `{ "actualCheckoutDate": "2026-12-15", "forceConfirm": true, "note": "Đã thu đủ công nợ" }`
**Request (gia hạn):** `{ "approvedEndDate": "2027-12-31", "note": "" }`

**Response 200 (trả phòng):** trả về `contract`, `settlement` (như POST `/contracts/:id/terminate`).
**Response 200 (gia hạn):** trả về `contract` với `endDate` mới và mảng `generatedInvoices`.

**Lỗi:** `422 STUDENT_HAS_DEBT` khi `forceConfirm = false` (BR-76)

---

## 12. Nhóm Dashboard & Báo cáo

| Method | Endpoint | Quyền | Mô tả | FR |
|--------|----------|-------|-------|-----|
| GET | `/dashboard/summary` | A S V | Các thẻ chỉ số tổng quan | FR-75, FR-76, FR-77 |
| GET | `/dashboard/occupancy-by-building` | A S V | Tỷ lệ lấp đầy theo tòa | FR-79 |
| GET | `/dashboard/revenue-chart` | A S V | Doanh thu theo tháng | FR-79 |
| GET | `/dashboard/expiring-contracts` | A S | Hợp đồng sắp hết hạn | FR-78 |
| GET | `/dashboard/top-debtors` | A S V | Top sinh viên nợ nhiều nhất | FR-77 |
| GET | `/dashboard/pending-tasks` | A S | Việc chờ xử lý (đơn, yêu cầu) | – |
| GET | `/reports/available-beds` | A S V | Báo cáo giường trống | FR-80 |
| GET | `/reports/debt` | A S V | Báo cáo công nợ | FR-81 |
| GET | `/reports/revenue` | A S V | Báo cáo doanh thu theo kỳ | FR-82 |

### GET `/dashboard/summary`
**Query:** `buildingId` (tùy chọn)
```json
{
  "success": true,
  "data": {
    "facility": { "totalBuildings": 3, "totalRooms": 60, "totalBeds": 420, "occupiedBeds": 358, "reservedBeds": 5, "availableBeds": 45, "maintenanceBeds": 12, "occupancyRate": 87.75 },
    "residents": { "activeStudents": 358, "activeContracts": 358, "pendingContracts": 5, "expiringIn30Days": 23 },
    "finance": { "totalDebt": 48620000, "overdueInvoiceCount": 27, "overdueAmount": 12480000, "currentMonthRevenue": 68450000, "currentMonthTarget": 76228000 },
    "pendingTasks": { "pendingApplications": 5, "pendingExtendRequests": 3, "pendingCheckoutRequests": 2 }
  }
}
```

### GET `/dashboard/revenue-chart`
**Query:** `months` (mặc định 12)
```json
{
  "success": true,
  "data": [
    { "period": "2026-01", "revenue": 65200000, "invoiced": 71000000, "transactionCount": 312 },
    { "period": "2026-02", "revenue": 68900000, "invoiced": 71500000, "transactionCount": 328 }
  ]
}
```

### Báo cáo xuất file
Mọi endpoint `/reports/*` nhận thêm query `format=json|csv`. Khi `format=csv`, response trả file văn bản với header:
```
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="bao-cao-giuong-trong-20261101.csv"
```
> v1-lite dùng **CSV** thay Excel (`14` mục 4.7). Nội dung file **bắt buộc** bắt đầu bằng BOM `﻿`, nếu không Excel sẽ hiển thị tiếng Việt thành ký tự lỗi.

---

## 13. Nhóm Cổng sinh viên – `/portal`

> **Nguyên tắc bảo mật tuyệt đối (FR-89, BR-85):** mọi endpoint dưới đây lấy `studentId` từ **JWT**, tuyệt đối không nhận từ query/body của client. Nếu client cố truyền `studentId` khác, server bỏ qua tham số đó.

| Method | Endpoint | Quyền | Mô tả | FR |
|--------|----------|-------|-------|-----|
| GET | `/portal/profile` | ST | Hồ sơ cá nhân (chỉ đọc) | FR-90 |
| GET | `/portal/my-residence` | ST | Thông tin cư trú hiện tại | FR-87 |
| GET | `/portal/my-roommates` | ST | Danh sách bạn cùng phòng | FR-87 |
| GET | `/portal/available-beds` | ST | Tra cứu giường trống | FR-88 |
| GET | `/portal/my-contracts` | ST | Hợp đồng hiện tại + lịch sử | FR-91 |
| POST | `/portal/applications` | ST | Nộp đơn đăng ký lưu trú | FR-30 |
| DELETE | `/portal/applications/:id` | ST | Tự hủy đơn khi còn chờ duyệt | – |
| GET | `/portal/my-invoices` | ST | Danh sách hóa đơn của mình | FR-70 |
| GET | `/portal/my-invoices/:id` | ST | Chi tiết hóa đơn | FR-70 |
| POST | `/portal/my-invoices/:id/pay` | ST | Khởi tạo thanh toán online | FR-64 |
| GET | `/portal/my-payments` | ST | Lịch sử thanh toán | FR-91 |
| GET | `/portal/my-requests` | ST | Danh sách yêu cầu đã gửi | FR-53 |
| POST | `/portal/my-requests` | ST | Gửi yêu cầu gia hạn / trả phòng | FR-45, FR-46 |
| DELETE | `/portal/my-requests/:id` | ST | Tự hủy yêu cầu còn chờ xử lý | BR-78 |

### GET `/portal/my-residence`
```json
{
  "success": true,
  "data": {
    "hasResidence": true,
    "contract": { "id": 42, "contractCode": "HD-2026-00042", "status": "ACTIVE", "startDate": "2026-09-01", "endDate": "2027-06-30", "daysUntilExpiry": 292, "isExpiringSoon": false, "monthlyPrice": 400000, "depositAmount": 500000 },
    "building": { "code": "B2", "name": "Tòa B2 - Nữ" },
    "room": { "roomNumber": "301", "floorNumber": 3, "roomType": "STANDARD_8", "capacity": 8, "currentOccupancy": 6 },
    "bed": { "bedLabel": "A3" },
    "debtSummary": { "totalDebt": 246000, "unpaidInvoiceCount": 1, "overdueInvoiceCount": 0, "nearestDueDate": "2026-11-10" }
  }
}
```
> Khi sinh viên chưa lưu trú: `{ "hasResidence": false, "pendingApplication": { ... } | null }`

### POST `/portal/applications` (UC-02)
**Request:**
```json
{ "bedId": 312, "startDate": "2026-09-01", "endDate": "2027-06-30", "note": "Em muốn ở gần bạn cùng lớp" }
```
**Response 201:**
```json
{
  "success": true,
  "message": "Nộp đơn thành công. Vui lòng chờ nhân viên duyệt.",
  "data": { "contractId": 43, "contractCode": "HD-2026-00043", "status": "PENDING", "bed": { "bedLabel": "A5", "roomNumber": "301", "buildingCode": "B2" }, "estimatedFirstInvoice": { "deposit": 500000, "firstMonthRoomFee": 400000, "total": 900000 } }
}
```
**Lỗi:** `409 BED_NOT_AVAILABLE` · `422 STUDENT_HAS_ACTIVE_CONTRACT` · `422 GENDER_MISMATCH` · `422` ngày không hợp lệ

### POST `/portal/my-invoices/:id/pay` (UC-05)
**Request:** `{ "gateway": "VNPAY", "amount": 246000 }`
> v1-lite chỉ hỗ trợ `gateway = "VNPAY"`. Giá trị khác trả `422`.
**Response 200:**
```json
{
  "success": true,
  "data": {
    "transactionRef": "PAY20261108DEF456",
    "amount": 246000,
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=24600000&...",
    "expiresAt": "2026-11-08T14:45:00+07:00"
  }
}
```
**Lỗi:** `403 FORBIDDEN_RESOURCE` (hóa đơn không thuộc sinh viên này) · `422 INVOICE_ALREADY_PAID` · `422 PAYMENT_EXCEEDS_REMAINING`

### POST `/portal/my-requests`
**Request (gia hạn):**
```json
{ "requestType": "EXTEND", "newEndDate": "2027-12-31", "reason": "Em tiếp tục học kỳ sau" }
```
**Request (trả phòng):**
```json
{ "requestType": "CHECKOUT", "expectedCheckoutDate": "2026-12-15", "reason": "Em chuyển ra ngoài ở" }
```
**Lỗi:** `409 DUPLICATE_PENDING_REQUEST` (BR-71) · `422 CONTRACT_NOT_ACTIVE` (BR-70) · `422` ngày không hợp lệ (BR-72, BR-73)

---

## 14. Endpoint hệ thống

| Method | Endpoint | Quyền | Mô tả |
|--------|----------|-------|-------|
| GET | `/health` | P | Kiểm tra sức khỏe hệ thống (uptime, kết nối DB) |
| GET | `/system-configs` | A | Danh sách cấu hình hệ thống |
| PATCH | `/system-configs/:key` | A | Cập nhật một cấu hình |
| GET | `/audit-logs` | A | Nhật ký hệ thống, lọc `userId`, `entityType`, `action`, khoảng thời gian |

---

## 15. Bảng tổng hợp toàn bộ endpoint

| # | Method | Endpoint | A | S | V | ST |
|---|--------|----------|---|---|---|-----|
| 1 | POST | `/auth/login` | ✓ | ✓ | ✓ | ✓ |
| 2 | POST | `/auth/register` | – | – | – | Public |
| 4 | POST | `/auth/logout` | ✓ | ✓ | ✓ | ✓ |
| 5 | GET | `/auth/me` | ✓ | ✓ | ✓ | ✓ |
| 6 | PATCH | `/auth/change-password` | ✓ | ✓ | ✓ | ✓ |
| 7 | GET | `/users` | ✓ | ✗ | ✗ | ✗ |
| 8 | POST | `/users` | ✓ | ✗ | ✗ | ✗ |
| 9 | PATCH | `/users/:id` | ✓ | ✗ | ✗ | ✗ |
| 10 | PATCH | `/users/:id/status` | ✓ | ✗ | ✗ | ✗ |
| 11 | GET | `/students` | ✓ | ✓ | ✓ | ✗ |
| 12 | POST | `/students` | ✓ | ✓ | ✗ | ✗ |
| 13 | GET | `/students/:id` | ✓ | ✓ | ✓ | ✗ |
| 14 | PATCH | `/students/:id` | ✓ | ✓ | ✗ | ✗ |
| 15 | PATCH | `/students/:id/status` | ✓ | ✓ | ✗ | ✗ |
| 16 | GET | `/students/export` (CSV) | ✓ | ✓ | ✓ | ✗ |
| 17 | GET | `/buildings` | ✓ | ✓ | ✓ | ✓ |
| 18 | POST/PATCH | `/buildings` | ✓ | ✓ | ✗ | ✗ |
| 19 | DELETE | `/buildings/:id` | ✓ | ✗ | ✗ | ✗ |
| 20 | GET | `/buildings/:id/map` | ✓ | ✓ | ✓ | ✗ |
| 21 | GET | `/rooms` | ✓ | ✓ | ✓ | ✓ |
| 22 | POST/PATCH | `/rooms` | ✓ | ✓ | ✗ | ✗ |
| 23 | POST | `/rooms/:id/generate-beds` | ✓ | ✓ | ✗ | ✗ |
| 24 | GET | `/beds/available` | ✓ | ✓ | ✓ | ✓ |
| 25 | PATCH | `/beds/:id/status` | ✓ | ✓ | ✗ | ✗ |
| 26 | GET | `/contracts` | ✓ | ✓ | ✓ | ✗ |
| 27 | POST | `/contracts` | ✓ | ✓ | ✗ | ✗ |
| 28 | POST | `/contracts/:id/approve` | ✓ | ✓ | ✗ | ✗ |
| 29 | POST | `/contracts/:id/reject` | ✓ | ✓ | ✗ | ✗ |
| 30 | POST | `/contracts/:id/terminate` | ✓ | ✓ | ✗ | ✗ |
| 31 | POST | `/contracts/:id/transfer-bed` | ✓ | ✓ | ✗ | ✗ |
| 32 | GET | `/contracts/expiring` | ✓ | ✓ | ✗ | ✗ |
| 33 | GET/POST | `/fee-types` | ✓ | GET | GET | ✗ |
| 34 | GET/POST | `/utility-readings` | ✓ | ✓ | GET | ✗ |
| 35 | GET | `/invoices` | ✓ | ✓ | ✓ | ✗ |
| 36 | POST | `/invoices` | ✓ | ✓ | ✗ | ✗ |
| 37 | POST | `/invoices/generate-period` | ✓ | ✓ | ✗ | ✗ |
| 38 | POST | `/invoices/:id/cancel` | ✓ | ✓ | ✗ | ✗ |
| 39 | GET | `/payments` | ✓ | ✓ | ✓ | ✗ |
| 40 | POST | `/payments/manual` | ✓ | ✓ | ✗ | ✗ |
| 41 | POST | `/payments/vnpay/verify` | – | – | – | Public |
| 42 | GET | `/requests` | ✓ | ✓ | ✓ | ✗ |
| 43 | POST | `/requests/:id/approve` | ✓ | ✓ | ✗ | ✗ |
| 44 | POST | `/requests/:id/reject` | ✓ | ✓ | ✗ | ✗ |
| 45 | GET | `/dashboard/*` | ✓ | ✓ | ✓ | ✗ |
| 46 | GET | `/reports/*` | ✓ | ✓ | ✓ | ✗ |
| 47 | GET | `/portal/*` | ✗ | ✗ | ✗ | ✓ |
| 48 | POST | `/portal/applications` | ✗ | ✗ | ✗ | ✓ |
| 49 | POST | `/portal/my-invoices/:id/pay` | ✗ | ✗ | ✗ | ✓ |
| 50 | POST | `/portal/my-requests` | ✗ | ✗ | ✗ | ✓ |
| 51 | GET/PATCH | `/system-configs` | ✓ | ✗ | ✗ | ✗ |
| 52 | GET | `/audit-logs` | ✓ | ✗ | ✗ | ✗ |
| 53 | GET | `/health` | – | – | – | Public |

---

## 16. Ghi chú cho Frontend khi backend chưa sẵn sàng

1. Tạo file `src/mocks/handlers.js` dùng **MSW**, mô phỏng đúng các response mẫu trong tài liệu này.
2. Bật/tắt mock bằng biến `VITE_USE_MOCK` trong `.env`.
3. **Quan trọng:** mock phải trả đúng cấu trúc `{ success, message, data, meta }` để khi chuyển sang API thật không phải sửa component.
4. Mock cả trường hợp lỗi (`409 BED_NOT_AVAILABLE`, `422 STUDENT_HAS_DEBT`…) để test luồng xử lý lỗi trên giao diện.

---

## 17. Lịch sử phiên bản

| Phiên bản | Ngày | Người thực hiện | Nội dung thay đổi |
|-----------|------|------------------|-------------------|
| v1.0 | 11/09/2026 | Cả nhóm | Chốt hợp đồng API v1: 53 nhóm endpoint |
| v1.2 | 12/09/2026 | BE Lead, FE Lead | **Áp dụng v1-lite:** bỏ `/auth/refresh` (1 token hạn 7 ngày); bỏ ZaloPay; thay IPN bằng `POST /payments/vnpay/verify` xác thực chữ ký từ Return URL; báo cáo xuất CSV thay Excel. Xem `14` |
| v1.1 | 12/09/2026 | BE Lead, FE Lead | Rà soát chéo: thêm `POST /users/:id/reset-password` (FR-09); `/contracts` và `/contracts/:id/approve` trả **mảng 2 hóa đơn** thay vì 1; `generate-period` thêm `updated[]`; thêm `reservedBeds` vào dashboard (sửa lỗi cộng không khớp); thêm `room.gender` vào request/response; sửa mâu thuẫn quyền xem doanh thu (A S V, khớp với `07`) |
