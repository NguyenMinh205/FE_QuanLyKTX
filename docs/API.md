# API Reference

**Project:** HaUI Dormitory Management System (HaUI DMS)
**Version:** 2.0 (streamlined HaUI edition)
**Base URL:** `/api`
**Auth:** JWT Bearer token (`Authorization: Bearer <token>`)
**Audience:** Frontend and backend developers

> ⚠️ **This is the contract between frontend and backend.** The frontend v2 mock data follows this file, and the backend implements it when it moves to v2. Any change is agreed and written here first.
>
> **Requirements come from** the HaUI SRS v2.0 and data schema in the backend repo (`docs/EDIT_DOCS_DAC_TA_YEU_CAU.md`, `docs/EDIT_DOCS_DATA_SCHEMA.md`). FR-xx and BR-xx below refer to those documents. FR-35 and BR-08 (deposit refund) are additions described in §12.
>
> **Backend status (09/11/2026):** the backend still implements v1.2. The full v1 contract is on branch `backup/v1-full`. §13 lists what v2 removes.

---

## 1. Conventions

### 1.1 Response envelope

```json
// success
{ "code": "OK", "message": "Success", "data": { } }

// error
{ "code": "VALIDATION_ERROR", "message": "Dữ liệu không hợp lệ", "data": null }
```

- HTTP status reflects the outcome: `200/201` success, `400` validation, `401` unauthenticated, `403` forbidden, `404` not found, `409` conflict, `422` business-rule violation, `500` server error.
- `code` is a stable machine-readable string. `message` is **Vietnamese** and shown to the user as-is.
- Field-level errors go in `data`, so the frontend can attach them to the right input:

```json
{ "code": "VALIDATION_ERROR", "message": "Dữ liệu không hợp lệ",
  "data": { "errors": [ { "field": "studentCode", "message": "Mã số sinh viên đã tồn tại" } ] } }
```

### 1.2 Pagination

List endpoints accept `?page=1&limit=20` and respond with:

```json
{ "code": "OK", "message": "Success", "data": { "items": [ ], "total": 132, "page": 1, "limit": 20 } }
```

> ⚠️ The frontend treats **any** `data` containing an array named `items` as a paginated list. Detail responses must not use a field called `items`.

Extra aggregates sit next to the pagination fields, for example `summary`.

### 1.3 Data rules

| Topic | Rule |
|---|---|
| Identifiers | Every document is serialized with `id` (string), never `_id` |
| Money | Integer VND |
| Enums | Lowercase |
| Dates | ISO 8601. Date-only values are `YYYY-MM-DD` |
| Month | `monthYear` is `YYYY-MM`, for example `2026-10` |

**Enums**

| Field | Values |
|---|---|
| `role` | `admin`, `staff`, `student` |
| `gender` | `male`, `female` |
| `room.status` | `active`, `maintenance` |
| `bed.status` | `available`, `occupied`, `maintenance` |
| `room.capacity` | `4`, `6`, `8` |
| `contract.status` | `pending`, `active`, `expired`, `terminated`, `rejected` |
| `contract.term` | `6_months`, `12_months` |
| `invoice.type` | `room_semester`, `deposit`, `utility` |
| `invoice.status` | `unpaid`, `paid` |
| `payment.method` | `cash`, `vietqr` |

### 1.4 Roles

| Role | Access |
|---|---|
| `public` | No token. Only the endpoints in §5 and login |
| `admin` | Everything except paying by VietQR |
| `staff` | Operations. Cannot manage accounts or see revenue |
| `student` | Own data, plus the invoices of their current room |

Every endpoint re-checks the role on the server. Frontend guards are UX only.

**Own-data rule.** For endpoints a `student` may call, identity comes from the **JWT**, never from a query or body parameter.

**Forced password change (FR-01, BR-06).** While `mustChangePassword` is `true`, every endpoint except `GET /auth/me`, `POST /auth/logout` and `PATCH /auth/change-password` returns `403 MUST_CHANGE_PASSWORD`.

### 1.5 Shared objects

Referenced by name in the sections below.

```jsonc
// StudentRef
{ "id": "…", "studentCode": "2021601234", "fullName": "Nguyễn Văn An", "gender": "male" }

// RoomRef
{ "id": "…", "buildingId": "…", "buildingCode": "K1", "buildingName": "Tòa K1",
  "roomNumber": "302", "floor": 3, "gender": "male", "capacity": 6 }
```

---

## 2. Auth and accounts

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/auth/login` | public | Log in with email or student code |
| POST | `/auth/logout` | authenticated | Client clears the token |
| GET | `/auth/me` | authenticated | Current user, with student profile when `student` |
| PATCH | `/auth/change-password` | authenticated | Change own password |
| GET | `/users` | admin | `?search=&role=&isActive=&page=&limit=`. Search covers email, name, student code |
| POST | `/users` | admin | Create a staff or admin account |
| PUT | `/users/:id` | admin | Update `{ email, fullName, role }` |
| PATCH | `/users/:id/status` | admin | Lock or unlock, `{ isActive }` |
| POST | `/users/:id/reset-password` | admin, staff | Issue a temporary password |

There is **no** registration endpoint (FR-02). Student accounts are only created by approving an application (§6).

**POST `/auth/login`** (FR-01)
```json
// request: identifier is an email or a student code
{ "identifier": "2021601234", "password": "••••••••" }
// response
{ "code": "OK", "message": "Đăng nhập thành công",
  "data": { "token": "eyJhbGciOi…", "expiresIn": 604800,
            "user": { "id": "…", "email": "an@gmail.com", "fullName": "Nguyễn Văn An", "role": "student",
                      "studentId": "…", "studentCode": "2021601234", "mustChangePassword": true } } }
```

| Error | HTTP | When |
|---|---|---|
| `INVALID_CREDENTIALS` | 401 | Unknown identifier or wrong password, same message for both: "Tài khoản hoặc mật khẩu không chính xác" |
| `ACCOUNT_LOCKED` | 403 | `isActive` is `false` |

**PATCH `/auth/change-password`** (FR-05)
```json
{ "oldPassword": "2021601234", "newPassword": "Moi12345" }
```
Success sets `mustChangePassword` to `false`. New password: at least 8 characters, with letters and digits.

| Error | HTTP | When |
|---|---|---|
| `INVALID_CURRENT_PASSWORD` | 400 | Old password is wrong |
| `PASSWORD_SAME_AS_DEFAULT` | 400 | New password equals the student code (UC-04) |

**POST `/users`**
```json
// request: role is admin or staff, students get accounts through approval
{ "email": "canbo1@haui.edu.vn", "fullName": "Lê Thị Nhân Viên", "role": "staff" }
// response 201
{ "code": "OK", "message": "Đã tạo tài khoản", "data": { "user": { }, "temporaryPassword": "Ktx7Rm2qPz" } }
```

**User item:** `{ id, email, fullName, role, isActive, mustChangePassword, lastLoginAt, createdAt, student: StudentRef | null }`. The list adds `summary: { total, active, locked }`.

**POST `/users/:id/reset-password`** (FR-06)
```json
{ "code": "OK", "message": "Đã đặt lại mật khẩu", "data": { "temporaryPassword": "Ktx7Rm2qPz", "mustChangePassword": true } }
```
`temporaryPassword` is returned once and never logged.

| Error | HTTP | When |
|---|---|---|
| `FORBIDDEN` | 403 | Staff resetting anyone other than a student |
| `CANNOT_MODIFY_SELF` | 422 | Locking, demoting or resetting your own account |
| `LAST_ACTIVE_ADMIN` | 422 | Would leave no active admin |
| `DUPLICATE_ENTRY` | 409 | Email already used, field error on `email` |

---

## 3. Students

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/students` | admin, staff | `?search=&gender=&faculty=&status=&hasAccount=&page=&limit=` (FR-10). Search covers student code, name, phone |
| GET | `/students/:id` | admin, staff | Detail (FR-11) |
| POST | `/students` | admin, staff | Create a profile only, no account (FR-12) |
| POST | `/students/import` | admin, staff | Bulk import (FR-12b) |
| PUT | `/students/:id` | admin, staff | Update (FR-13) |
| PATCH | `/students/:id/deactivate` | admin, staff | Deactivate (FR-14) |

**Student body:** `{ studentCode, fullName, gender, phone, email?, dob?, faculty?, className?, emergencyContact?: { name, phone, relationship } }`. `phone` matches `/^0\d{9}$/`.

**List item:** Student fields, plus `userId`, `hasAccount`, `status`, `totalDebt`, and `residence: { buildingCode, roomNumber, bedNumber } | null`.

**Detail:** List item, plus `currentContract: Contract | null`, `contracts: Contract[]`, `unpaidInvoices: Invoice[]`.

**POST `/students/import`**: the frontend reads the Excel file and sends JSON, so the server handles no upload.
```json
// request, at most 1000 rows, `row` is the Excel row number used in the report
{ "rows": [ { "row": 2, "studentCode": "2021601234", "fullName": "Nguyễn Văn An", "gender": "male", "phone": "0912345678" } ] }
// response: valid rows are saved even when other rows fail
{ "code": "OK", "message": "Đã nhập 1 sinh viên, 1 dòng lỗi",
  "data": { "successCount": 1, "errorCount": 1,
            "errors": [ { "row": 3, "studentCode": "2021601234", "field": "studentCode", "message": "Mã số sinh viên đã tồn tại" } ] } }
```

| Error | HTTP | When |
|---|---|---|
| `DUPLICATE_ENTRY` | 409 | Student code already exists, field error on `studentCode` |
| `STUDENT_HAS_ACTIVE_CONTRACT` | 422 | Deactivating a student with an `active` contract |
| `STUDENT_HAS_DEBT` | 422 | Deactivating a student with an unpaid invoice |

---

## 4. Buildings and rooms

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/buildings` | admin, staff | Plain array sorted by `code`, with stats. `?includeInactive=true` adds inactive buildings |
| POST | `/buildings` | admin, staff | `{ code, name, description? }` |
| PUT | `/buildings/:id` | admin, staff | `{ code, name, description, isActive }` |
| GET | `/rooms` | admin, staff | `?buildingId=&floor=&gender=&capacity=&status=&availability=has_slot\|full&page=&limit=` (FR-22) |
| GET | `/rooms/:id` | admin, staff | Detail with beds |
| POST | `/rooms` | admin, staff | Create, beds generated automatically (FR-24) |
| PUT | `/rooms/:id` | admin, staff | Update (FR-25) |

Beds are embedded in the room. There is no bed endpoint and no room type endpoint.

**Building:** `{ id, code, name, description, isActive, stats: { totalRooms, totalBeds, occupiedBeds, availableBeds, maintenanceBeds } }`.

**Room body:** `{ buildingId, roomNumber, floor, gender, capacity, pricePerMonth, depositAmount }`. `PUT` also accepts `status`. `buildingId` cannot change after creation.

**Room:**
```json
{ "id": "…", "buildingId": "…", "buildingCode": "K1", "buildingName": "Tòa K1", "roomNumber": "302", "floor": 3,
  "gender": "male", "capacity": 6, "pricePerMonth": 320000, "depositAmount": 500000, "status": "active",
  "occupied": 4, "availableSlots": 2, "maintenanceBeds": 0 }
```

**GET `/rooms/:id`** adds `beds`:
```json
"beds": [ { "bedNumber": 1, "status": "occupied", "occupant": { "studentCode": "2021601234", "fullName": "Nguyễn Văn An", "className": "KTPM01-K16" } },
          { "bedNumber": 2, "status": "available", "occupant": null } ]
```

| Error | HTTP | When |
|---|---|---|
| `DUPLICATE_ENTRY` | 409 | Building code taken, or room number taken in that building |
| `BUILDING_HAS_OCCUPANTS` | 422 | Deactivating a building with residents (FR-21) |
| `ROOM_HAS_OCCUPANTS` | 422 | Changing `gender` or `capacity` of an occupied room (FR-25) |

---

## 5. Public application portal

No token. These endpoints should be rate limited.

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/public/rooms/available` | public | Rooms with free beds (FR-23) |
| POST | `/contracts/register-online` | public | Submit an application (FR-30) |
| GET | `/public/applications/status` | public | Track an application (FR-33) |

**GET `/public/rooms/available`**: `?gender=male&buildingId=&limit=`. `gender` is required. Also used by staff to pick another bed when approving.

```json
{ "code": "OK", "message": "Success", "data": { "items": [
  { "id": "…", "buildingId": "…", "buildingCode": "K1", "buildingName": "Tòa K1", "roomNumber": "101", "floor": 1,
    "gender": "male", "capacity": 6, "pricePerMonth": 320000, "depositAmount": 500000, "availableSlots": 2,
    "beds": [ { "bedNumber": 1, "status": "occupied", "hasPendingApplication": false },
              { "bedNumber": 2, "status": "available", "hasPendingApplication": true },
              { "bedNumber": 3, "status": "available", "hasPendingApplication": false } ] }
], "total": 1, "page": 1, "limit": 100 } }
```

- Sorted by the stack rule (BR-07): `floor` ascending, then `roomNumber` ascending numerically. The frontend renders in this order and does not re-sort.
- Only `active` rooms in `active` buildings with at least one selectable bed. A bed is selectable when `status` is `available` and `hasPendingApplication` is `false`. `availableSlots` counts selectable beds.
- Never includes occupant names.

**POST `/contracts/register-online`**
```json
// request
{ "studentCode": "2021601234", "fullName": "Nguyễn Văn An", "gender": "male", "phone": "0912345678",
  "email": "an@gmail.com", "dob": "2003-05-20", "faculty": "CNTT", "className": "KTPM01-K16",
  "emergencyContact": { "name": "Nguyễn Văn Ba", "phone": "0987654321", "relationship": "Bố" },
  "roomId": "…", "bedNumber": 3, "term": "6_months" }
// response 201
{ "code": "OK", "message": "Đã gửi đơn đăng ký. Vui lòng theo dõi email để nhận kết quả xét duyệt",
  "data": { "contractCode": "HD-2026-0012", "status": "pending", "room": { }, "bedNumber": 3, "term": "6_months",
            "pricePerMonth": 320000, "totalRoomFee": 1920000, "depositAmount": 500000 } }
```

- `email` is required here, because the account is delivered by email.
- A new student code creates a `Student` with no `userId`. An existing student code with no `pending` or `active` contract reuses that record and refreshes it from the form, which is how a former resident returns.
- Prices are read from the room, never from the client. The bed is **not** locked here (BR-05 locks at approval). `startDate` and `endDate` stay empty until approval.

| Error | HTTP | When |
|---|---|---|
| `APPLICATION_OR_CONTRACT_EXISTS` | 409 | This student code has a `pending` or `active` contract (UC-01 3a) |
| `BED_ALREADY_REQUESTED` | 409 | Another pending application holds this bed (UC-01 6a). The form returns to bed selection |
| `BED_ALREADY_OCCUPIED` | 409 | The bed was taken or went into maintenance |
| `GENDER_MISMATCH` | 422 | Student gender differs from room gender (BR-01) |

**GET `/public/applications/status`**: `?studentCode=&email=`, both required.
```json
{ "code": "OK", "message": "Success",
  "data": { "contractCode": "HD-2026-0012", "status": "pending", "submittedAt": "2026-11-09T08:00:00Z", "room": { },
            "bedNumber": 3, "term": "6_months", "startDate": null, "endDate": null, "rejectionReason": null } }
```
Returns the most recent application for that pair. No match returns `404 APPLICATION_NOT_FOUND`, with the same message whether the code or the email was wrong.

---

## 6. Contracts

A contract carries the application and the stay in one document.

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/contracts` | admin, staff | `?status=&buildingId=&roomId=&term=&isDepositRefunded=&search=&page=&limit=` (FR-31) |
| GET | `/contracts/:id` | admin, staff | Detail |
| PATCH | `/contracts/:id/approve` | admin, staff | Approve (FR-32) |
| PATCH | `/contracts/:id/reject` | admin, staff | Reject (FR-33) |
| PATCH | `/contracts/:id/terminate` | admin, staff | Check out (FR-34) |
| PATCH | `/contracts/:id/deposit-refund` | admin, staff | Confirm the deposit was returned (FR-35) |

**Contract:**
```json
{ "id": "…", "contractCode": "HD-2026-0012", "status": "active", "term": "6_months",
  "startDate": "2026-11-09", "endDate": "2027-05-09",
  "pricePerMonth": 320000, "totalRoomFee": 1920000, "depositAmount": 500000,
  "student": { }, "room": { }, "bedNumber": 3,
  "rejectionReason": null, "approvedByName": "Lê Thị Nhân Viên", "terminatedAt": null,
  "isDepositRefunded": false, "depositRefundedAt": null, "depositRefundedByName": null,
  "createdAt": "2026-11-09T08:00:00Z" }
```

- `student` is `StudentRef`, `room` is `RoomRef`.
- `status` is `expired` when an `active` contract is past `endDate`. There is no scheduled job, so the server derives it when reading. The bed stays occupied until checkout.
- `GET /contracts` adds `summary: { pending, active, expired, terminated, rejected, awaitingDepositRefund }`. `awaitingDepositRefund` counts `terminated` contracts with `isDepositRefunded: false`.
- `GET /contracts/:id` adds `student` with the full profile (phone, email, dob, faculty, className, emergencyContact), and `invoices: Invoice[]`.

**PATCH `/contracts/:id/approve`**
```json
// request: empty body keeps the room and bed the student chose
{ "roomId": "…", "bedNumber": 4 }
// response
{ "code": "OK", "message": "Đã duyệt đơn",
  "data": { "contract": { },
            "account": { "studentCode": "2021601234", "email": "an@gmail.com", "isNew": true },
            "emailSent": true,
            "invoices": [ { "id": "…", "invoiceCode": "INV-2026-0089", "type": "deposit", "amount": 500000, "dueDate": "2026-11-16" },
                          { "id": "…", "invoiceCode": "INV-2026-0090", "type": "room_semester", "amount": 1920000, "dueDate": "2026-11-16" } ] } }
```

Server steps: lock the bed with one atomic conditional update (BR-05) → set `active`, `startDate` to today and `endDate` by `term` → create the account (`mustChangePassword: true`, password is the student code), or keep the existing one for a returning student → send the email → create two invoices due in 7 days.

Prices come from the final room when `roomId` is sent. A failed email does not roll back the approval: the response returns `emailSent: false` and the screen warns the staff.

| Error | HTTP | When |
|---|---|---|
| `CONTRACT_NOT_PENDING` | 409 | Already processed |
| `BED_ALREADY_OCCUPIED` | 409 | Lost the race for this bed (UC-02 4a). The screen reloads and staff pick another bed |
| `GENDER_MISMATCH` | 422 | The replacement room has the wrong gender |
| `EMAIL_ALREADY_USED` | 409 | The application email belongs to another account |

**PATCH `/contracts/:id/reject`**: `{ "reason": "Hồ sơ thiếu thông tin" }`. `reason` is required. Sets `rejected`, stores `rejectionReason`, sends the email, and does not touch the bed.

**PATCH `/contracts/:id/terminate`**: no body. Allowed on `active` and `expired`. Frees the bed, sets `terminated` and `terminatedAt`.

```json
{ "code": "OUTSTANDING_INVOICES", "message": "Sinh viên hoặc phòng còn hóa đơn chưa thanh toán, không thể thanh lý hợp đồng",
  "data": { "invoices": [ { "id": "…", "invoiceCode": "INV-UTIL-K1-302-202610", "type": "utility", "amount": 450000 } ] } }
```

| Error | HTTP | When |
|---|---|---|
| `OUTSTANDING_INVOICES` | 422 | BR-04: an unpaid personal invoice or room utility invoice |
| `CONTRACT_NOT_TERMINABLE` | 409 | Status is not `active` or `expired` |

**PATCH `/contracts/:id/deposit-refund`** (FR-35, BR-08): no body. The office hands the deposit back, then staff confirm. Sets `isDepositRefunded: true`, `depositRefundedAt`, `depositRefundedBy`, returns the contract. One-way. No amount is sent, because BR-04 guarantees the student has no debt, so the full `depositAmount` is returned. No `Payment` is created, so revenue is unaffected.

| Error | HTTP | When |
|---|---|---|
| `CONTRACT_NOT_TERMINATED` | 409 | Status is not `terminated` |
| `DEPOSIT_ALREADY_REFUNDED` | 409 | Already confirmed |

---

## 7. Utility readings

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/utility-readings/sheet` | admin, staff | `?buildingId=&monthYear=`. One grid for one building and month (FR-40) |
| POST | `/utility-readings/bulk` | admin, staff | Save the grid or an Excel import (FR-40) |
| POST | `/utility-readings/publish` | admin, staff | Close the month and issue invoices (FR-41) |
| GET | `/utility-readings/history` | admin, staff | `?roomId=&limit=12`, newest first (FR-42) |

**Reading:**
```json
{ "id": "…", "roomId": "…", "monthYear": "2026-10",
  "electricity": { "oldIndex": 1200, "newIndex": 1350, "usage": 150, "unitPrice": 3000, "amount": 450000 },
  "water": { "oldIndex": 300, "newIndex": 312, "usage": 12, "unitPrice": 15000, "amount": 180000 },
  "totalAmount": 630000, "occupantsCount": 6, "perStudentAmount": 105000, "isBilled": false, "recordedByName": "Lê Thị Nhân Viên" }
```

**GET `/utility-readings/sheet`**
```json
{ "code": "OK", "message": "Success",
  "data": { "buildingId": "…", "monthYear": "2026-10",
            "defaultUnitPrices": { "electricity": 3000, "water": 15000 },
            "rows": [ { "room": { "id": "…", "roomNumber": "302", "floor": 3, "capacity": 6, "occupied": 6 },
                        "previous": { "electricityNewIndex": 1200, "waterNewIndex": 300 },
                        "reading": null } ] } }
```

- `rows` is a plain array sorted like §5, one row per `active` room. `previous` is `null` when there is no earlier reading.
- `defaultUnitPrices` comes from the most recent readings of the building, or `0` when none exist. There is no price catalogue: prices are entered on the grid and stored on each reading.

**POST `/utility-readings/bulk`**
```json
// request
{ "buildingId": "…", "monthYear": "2026-10", "electricityUnitPrice": 3000, "waterUnitPrice": 15000,
  "rows": [ { "roomId": "…", "electricityOldIndex": 1200, "electricityNewIndex": 1350, "waterOldIndex": 300, "waterNewIndex": 312 } ] }
// response: valid rows are saved even when other rows fail
{ "code": "OK", "message": "Đã lưu 1 phòng, 1 phòng lỗi",
  "data": { "savedCount": 1, "errors": [ { "roomId": "…", "message": "Chỉ số mới không được nhỏ hơn chỉ số cũ" } ] } }
```
Creates or updates the single reading of that room and month. Rejected per row: new index below old index, or a reading that is already billed. `monthYear` cannot be in the future.

**POST `/utility-readings/publish`**: `{ "buildingId": "…", "monthYear": "2026-10" }`
```json
{ "code": "OK", "message": "Đã phát hành 18 hóa đơn điện nước",
  "data": { "publishedCount": 18, "notifiedCount": 96,
            "skipped": [ { "roomId": "…", "roomNumber": "305", "reason": "Phòng không có người ở" } ] } }
```

- Covers each reading with `isBilled: false` in that building and month. Rooms with no resident are skipped, never billed.
- Each room gets **one** invoice of `type: utility` due in 7 days, code `INV-UTIL-<buildingCode>-<roomNumber>-<YYYYMM>`, so the same room number in two buildings cannot collide. Then `isBilled: true`, and the reading is locked.
- `occupantsCount` and `perStudentAmount` are fixed at this moment. `perStudentAmount` is `Math.round(totalAmount / occupantsCount)`, advisory only (BR-03).
- All current residents get an email and see the invoice in the portal.
- Nothing eligible returns `422 NOTHING_TO_PUBLISH`.

---

## 8. Invoices and payments

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/invoices` | admin, staff | `?status=&type=&scope=personal\|room&buildingId=&search=&page=&limit=` (FR-50). Search covers invoice code, student code, room number |
| GET | `/invoices/:id` | admin, staff | Detail (FR-51) |
| POST | `/payments/cash` | admin, staff | Collect cash (FR-52) |
| POST | `/payments/vietqr/confirm` | admin, staff | Confirm a bank transfer (FR-54) |
| GET | `/payments` | admin, staff | `?method=&type=&from=&to=&search=&page=&limit=` |

Invoices are created only by approval (§6) and publishing (§7). They cannot be created by hand, cancelled or partly paid.

**Invoice:**
```json
{ "id": "…", "invoiceCode": "INV-UTIL-K1-302-202610", "type": "utility", "scope": "room", "amount": 630000,
  "description": "Tiền điện nước Phòng 302 - Tháng 10/2026 (6 người)", "dueDate": "2026-11-16", "status": "paid", "paidAt": "2026-11-12T03:00:00Z",
  "student": null, "room": { }, "contractId": null, "utilityReadingId": "…",
  "payer": { "id": "…", "studentCode": "2021601234", "fullName": "Nguyễn Văn An" } }
```

- `scope` is `personal` for `room_semester` and `deposit`, `room` for `utility`.
- `student` is `StudentRef` on personal invoices, `null` on room invoices. `room` is `RoomRef`. `payer` is `null` until paid.
- The list adds `summary: { totalAmount, paidAmount, unpaidAmount, unpaidCount }`.

**GET `/invoices/:id`** adds `payments: Payment[]`, and for utility invoices `reading: Reading` and `members: [ { id, studentCode, fullName } ]`. Members are the room's current residents.

**POST `/payments/cash`**
```json
// request: payerStudentId is required on utility invoices and ignored on personal ones
{ "invoiceId": "…", "payerStudentId": "…", "note": "" }
// response 201, the payment is the receipt
{ "code": "OK", "message": "Đã xác nhận thu tiền", "data": { "payment": { }, "invoice": { } } }
```

**POST `/payments/vietqr/confirm`**: same as cash, plus optional `transactionCode`.

Always the full invoice `amount`. On utility invoices the payer settles the whole room (BR-03).

**Payment:**
```json
{ "id": "…", "paymentCode": "PAY-2026-0045", "invoiceId": "…", "invoiceCode": "INV-2026-0089", "invoiceType": "deposit",
  "amount": 500000, "method": "cash", "transactionCode": null, "note": "", "paidAt": "2026-11-12T03:00:00Z",
  "collectedByName": "Lê Thị Nhân Viên", "payer": { }, "room": { } }
```

`GET /payments` adds `summary: { totalAmount, cashAmount, vietqrAmount }`.

| Error | HTTP | When |
|---|---|---|
| `INVOICE_ALREADY_PAID` | 409 | Already paid |
| `PAYER_NOT_IN_ROOM` | 422 | `payerStudentId` is missing or not a resident of the invoice's room |
| `DUPLICATE_TRANSACTION_CODE` | 409 | `transactionCode` already recorded, field error on `transactionCode` |

---

## 9. Student portal

Every endpoint is `student` only and identifies the student from the JWT.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/portal/profile` | Own profile (FR-60) |
| GET | `/portal/my-residence` | Current stay (FR-60, FR-61) |
| GET | `/portal/my-contracts` | All own contracts, newest first, as `Contract[]`. Includes deposit status |
| GET | `/portal/my-invoices` | `?scope=personal\|room&status=&page=&limit=` (FR-62) |
| GET | `/portal/my-invoices/:id` | Detail, same shape as §8 |
| GET | `/portal/my-invoices/:id/vietqr` | QR payload (FR-53) |
| GET | `/portal/my-payments` | `?page=&limit=`. Own personal payments and room payments, as `Payment[]` (FR-63) |
| GET | `/portal/my-room/utility-history` | `?limit=12`, newest first, as `Reading[]` (FR-42) |

Room invoices are limited to the room the student currently lives in. The portal bell has no endpoint: it counts `GET /portal/my-invoices?scope=room&status=unpaid`.

**GET `/portal/my-residence`**
```json
{ "code": "OK", "message": "Success",
  "data": { "hasResidence": true, "contract": { },
            "roommates": [ { "studentCode": "2021601235", "fullName": "Trần Văn Bình" } ],
            "debtSummary": { "totalDebt": 630000, "unpaidInvoiceCount": 1 } } }
```
With no `active` or `expired` contract: `{ "hasResidence": false, "contract": null, "roommates": [], "debtSummary": { "totalDebt": 0, "unpaidInvoiceCount": 0 } }`. Roommates expose only name and student code (FR-60).

**GET `/portal/my-invoices/:id/vietqr`**
```json
{ "code": "OK", "message": "Success",
  "data": { "bankBin": "970436", "accountNumber": "0011001234567", "accountName": "KY TUC XA HAUI",
            "amount": 630000, "transferContent": "HAUI INVUTILK1302202610 P302" } }
```

- The server builds `transferContent` with the invoice code stripped of `-`, because banking apps may drop it: personal `HAUI <code> <studentCode>`, room `HAUI <code> P<roomNumber>`.
- A paid invoice returns `409 INVOICE_ALREADY_PAID`. The student's transfer does not change the invoice: it stays `unpaid` until staff confirm in §8.

---

## 10. Dashboard

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/dashboard/summary` | admin, staff | KPI cards (FR-70) |
| GET | `/dashboard/occupancy` | admin, staff | By building (FR-71) |
| GET | `/dashboard/revenue` | admin | `?year=2026` (FR-72) |

**GET `/dashboard/summary`**
```json
{ "code": "OK", "message": "Success",
  "data": { "occupancy": { "total": 480, "occupied": 352, "available": 120, "maintenance": 8 },
            "activeStudents": 352, "pendingApplications": 14,
            "finance": { "totalDebt": 12500000, "roomDebt": 9600000, "utilityDebt": 2900000 } } }
```
`occupancy` must satisfy `total = occupied + available + maintenance`. `roomDebt` covers unpaid `room_semester`, `utilityDebt` unpaid `utility`. Deposits are excluded.

**GET `/dashboard/occupancy`**: plain array of `{ buildingId, buildingCode, buildingName, totalRooms, totalBeds, occupied, available, maintenance }`.

**GET `/dashboard/revenue`**: plain array, one entry per month that has payments, oldest first: `{ month: "2026-10", roomRevenue, utilityRevenue, total }`. Grouped by `paidAt`. Deposits are excluded, since they are returned later.

---

## 11. Error codes

| Code | HTTP | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Body or query failed validation |
| `INVALID_CURRENT_PASSWORD` | 400 | Wrong current password |
| `PASSWORD_SAME_AS_DEFAULT` | 400 | New password equals the student code |
| `UNAUTHORIZED` | 401 | Missing or invalid JWT |
| `TOKEN_EXPIRED` | 401 | JWT expired |
| `INVALID_CREDENTIALS` | 401 | Wrong identifier or password |
| `ACCOUNT_LOCKED` | 403 | Account is locked |
| `FORBIDDEN` | 403 | Role not allowed, or another student's data |
| `MUST_CHANGE_PASSWORD` | 403 | Password change required first |
| `NOT_FOUND` | 404 | Resource does not exist |
| `APPLICATION_NOT_FOUND` | 404 | Public lookup found nothing |
| `DUPLICATE_ENTRY` | 409 | Unique value already used |
| `EMAIL_ALREADY_USED` | 409 | Application email belongs to another account |
| `APPLICATION_OR_CONTRACT_EXISTS` | 409 | Student has a `pending` or `active` contract |
| `BED_ALREADY_REQUESTED` | 409 | Bed is held by another pending application |
| `BED_ALREADY_OCCUPIED` | 409 | Bed is no longer available |
| `CONTRACT_NOT_PENDING` | 409 | Application already processed |
| `CONTRACT_NOT_TERMINABLE` | 409 | Contract is not `active` or `expired` |
| `CONTRACT_NOT_TERMINATED` | 409 | Deposit refund requires `terminated` |
| `DEPOSIT_ALREADY_REFUNDED` | 409 | Deposit already confirmed |
| `INVOICE_ALREADY_PAID` | 409 | Invoice already paid |
| `DUPLICATE_TRANSACTION_CODE` | 409 | Bank reference already recorded |
| `GENDER_MISMATCH` | 422 | Student and room gender differ |
| `STUDENT_HAS_ACTIVE_CONTRACT` | 422 | Student still has an `active` contract |
| `STUDENT_HAS_DEBT` | 422 | Student still owes money |
| `CANNOT_MODIFY_SELF` | 422 | Action on your own account |
| `LAST_ACTIVE_ADMIN` | 422 | Would leave no active admin |
| `BUILDING_HAS_OCCUPANTS` | 422 | Building still has residents |
| `ROOM_HAS_OCCUPANTS` | 422 | Room still has residents |
| `OUTSTANDING_INVOICES` | 422 | BR-04 blocks checkout |
| `NOTHING_TO_PUBLISH` | 422 | No reading ready to bill |
| `PAYER_NOT_IN_ROOM` | 422 | Payer is not a resident of the room |
| `INTERNAL_ERROR` | 500 | Unhandled server error |

---

## 12. Additions the backend schema needs

These are required by this contract and are not yet in `EDIT_DOCS_DATA_SCHEMA.md`.

| Collection | Change | Why |
|---|---|---|
| `contracts` | `isDepositRefunded` (Boolean, default `false`), `depositRefundedAt` (Date), `depositRefundedBy` (ref `User`) | FR-35, BR-08 |
| `contracts` | Add `rejected` to `status` | FR-33, keeps rejected applications out of `terminated` |
| `contracts` | `startDate`, `endDate` optional while `pending` | Set at approval |
| `contracts` | `terminatedAt` (Date) | Shown in history and the deposit tab |
| `users` | `studentCode` (String, unique, sparse) | FR-01 login, FR-32 |
| `invoices` | Store the payer of a utility invoice, in `studentId` as the schema suggests or a dedicated `payerStudentId` | FR-41, FR-62 |

**FR-35 (added).** After a contract is terminated, the student collects the deposit at the office and staff confirm it in the system. The student can see whether the deposit has been returned.

**BR-08 (added).** A deposit refund can only be confirmed on a `terminated` contract, once per contract, for the full `depositAmount`. It is not revenue.

**Fixes to apply in the schema document:** the sample in §4.3 builds the code without the building and bills rooms with no residents (`occupants.length || 1`). §7 above is the intended behaviour.

---

## 13. Removed from v1.2

| Removed | Replaced by |
|---|---|
| `POST /auth/register` | Account created at approval |
| `/room-types`, `/beds/:id/status`, `/rooms/available` | Fields on the room, `/public/rooms/available` |
| `/applications`, `/portal/my-applications` | `/contracts?status=pending`, `/contracts/register-online`, `/public/applications/status` |
| `/residencies` | `contracts` |
| `PUT /contracts/:id`, `?expiringInDays=` | None |
| `/requests`, `/portal/my-requests` | Checkout is handled at the office (`PATCH /contracts/:id/terminate`) |
| `/fee-types` | Fixed invoice types, unit prices on the reading grid |
| `POST` and `PUT /utility-readings` | `/utility-readings/bulk` |
| `POST /invoices`, `/invoices/generate`, `/invoices/generation-preview`, `/invoices/:id/cancel` | `/utility-readings/publish`, approval |
| `/payments/offline`, `/payments/online/*`, `/payments/:id/reconcile`, gateway webhooks | `/payments/cash`, `/payments/vietqr/confirm` |
| `/supply-items`, `/supply-orders`, `/portal/supply-items`, `/portal/my-supply-orders` | None |

Optional later: a SePay or Casso webhook for FR-54b would call the same logic as `/payments/vietqr/confirm`.

---

## 14. Change log

| Version | Date | Change |
|---|---|---|
| **2.0** | **09/11/2026** | Rewritten for the streamlined HaUI edition. Three roles, public application portal, one contract document, embedded beds, 6 or 12 month terms, one utility invoice per room, cash and VietQR only, deposit refund confirmation. The v1.2 change history is on branch `backup/v1-full`. |
