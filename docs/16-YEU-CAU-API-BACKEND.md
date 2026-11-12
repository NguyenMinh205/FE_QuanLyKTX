# 16 – YÊU CẦU API TỪ FRONTEND GỬI BACKEND (bản v2)

**Hệ thống:** Ký túc xá HaUI — bản tinh gọn v2
**Người đọc:** nhóm Backend
**Người lập:** FE Lead · **Cập nhật:** 12/11/2026 (bản 2.2)
**Đối chiếu:** `docs/API.md` **v2.7** ↔ repo `BE_QLKTX`

> **Tóm tắt (12/11/2026):**
> - **Backend nhóm đẩy bản cập nhật** `b8c6cc9` (nhánh `docs`). Bản này bỏ phần v1 nhưng **không theo `API.md`**: 11/51 endpoint FE gọi bị thiếu, phần còn lại khác đường dẫn hoặc dạng dữ liệu. Còn có lỗi thật (khóa giường, gắn nhầm tài khoản, lộ dữ liệu sinh viên). FE chạy với bản này thì sập ở mọi danh sách (`rawData.some is not a function`).
> - **FE đã sửa lại BE theo `API.md`** trên nhánh **`fix/v2-api-contract`** của repo BE, **chưa đẩy lên** — chờ nhóm BE xem (mục 6).
> - **Kết quả:** cả 51 endpoint khớp dạng dữ liệu với FE; trọn vòng đời một hồ sơ qua 3 vai trò chạy thông trên giao diện với BE thật (23/23 bước).
> - **Việc của nhóm BE:** review nhánh `fix/v2-api-contract` (mục 6.4), rồi gộp. Các mục 1–5 dưới đây là danh sách yêu cầu gốc, giữ để đối chiếu.
>
> Bản đối chiếu v1 (82 endpoint, kết quả nối thử 16/09/2026) nằm trong lịch sử git của file này và ở nhánh `backup/v1-full`.

---

## 0. Cách dùng tài liệu này

- **Hợp đồng là `API.md`.** Tài liệu này chỉ liệt kê *phải làm gì*, chi tiết request/response/mã lỗi xem đúng mục `API.md` ghi ở cột "§".
- **Hành vi mẫu:** `src/mocks/mockApi.js` của FE chạy đúng các luật trong hợp đồng (khóa giường, BR-04, trùng mã giao dịch, mã lỗi…). Chỗ nào `API.md` viết chưa đủ rõ, đọc hàm mock tương ứng: tên nhóm `mockAuth`, `mockUsers`, `mockStudents`, `mockRooms`, `mockPublic`, `mockContracts`, `mockFees`, `mockPayments`, `mockDashboard`, `mockPortal`.
- **Envelope và phân trang** giữ như v1 (`API.md` §1): `{ code, message, data }`, danh sách `data: { items, total, page, limit }`.
  - ⚠️ Chi tiết một bản ghi **không được** có trường tên `items`: FE coi mọi phản hồi có `items` là danh sách.
- **Ưu tiên:** **P0** chặn luồng chính (nộp đơn → duyệt → ở → trả tiền → trả phòng). **P1** thiếu thì màn vẫn mở nhưng mất một phần chức năng.

---

## 1. 51 endpoint FE gọi

### 1.1. Auth và tài khoản — `API.md` §2

| Ưu tiên | Endpoint | Vai trò | FE cần đặc biệt |
|---|---|---|---|
| P0 | `POST /auth/login` | công khai | Body `{ identifier, password }`: `identifier` là **email hoặc MSSV**. Trả `mustChangePassword` |
| P0 | `GET /auth/me` | đã đăng nhập | Kèm hồ sơ sinh viên khi là `student` |
| P0 | `PATCH /auth/change-password` | đã đăng nhập | `PASSWORD_SAME_AS_DEFAULT` khi mật khẩu mới = MSSV; `INVALID_CURRENT_PASSWORD` |
| P1 | `POST /auth/logout` | đã đăng nhập | |
| P1 | `GET /users` · `POST /users` · `PUT /users/:id` | admin | Chỉ tạo `admin`/`staff`; **không còn `viewer`** |
| P1 | `PATCH /users/:id/status` | admin | `LAST_ACTIVE_ADMIN`, `CANNOT_MODIFY_SELF` |
| P1 | `POST /users/:id/reset-password` | admin, staff | Staff chỉ reset được **tài khoản sinh viên** (`403 FORBIDDEN`) |

Mọi endpoint khác trả `403 MUST_CHANGE_PASSWORD` khi tài khoản còn cờ buộc đổi mật khẩu. FE bắt mã này và đưa người dùng về trang đổi mật khẩu.

### 1.2. Sinh viên — §3

| Ưu tiên | Endpoint | FE cần đặc biệt |
|---|---|---|
| P0 | `GET /students` · `GET /students/:id` | Lọc `gender`, `faculty`, `status`, `hasAccount`; chi tiết kèm chỗ ở hiện tại, hóa đơn chưa trả, lịch sử |
| P1 | `POST /students` · `PUT /students/:id` | MSSV đúng 10 chữ số; tạo hồ sơ **không** tạo tài khoản. Sửa MSSV/họ tên phải đồng bộ sang tài khoản. **Không đổi giới tính** khi còn hợp đồng `pending`/`active` → `422 GENDER_CHANGE_NOT_ALLOWED` (BR-01) |
| P1 | `POST /students/import` | Body JSON các dòng (FE đọc Excel), trả `{ success, errors[] }` theo **số dòng** |
| P1 | `PATCH /students/:id/deactivate` | `STUDENT_HAS_ACTIVE_CONTRACT`, `STUDENT_HAS_DEBT` |

### 1.3. Tòa nhà, phòng — §4

| Ưu tiên | Endpoint | FE cần đặc biệt |
|---|---|---|
| P0 | `GET /buildings` | Mảng thường kèm thống kê; `?includeInactive=true` |
| P1 | `POST /buildings` · `PUT /buildings/:id` | Trùng mã trả `DUPLICATE_ENTRY` (backend hiện trả `BUILDING_CODE_ALREADY_EXISTS`, FE tạm nhận cả hai). Đổi tên tòa phải hiện ở phòng và hợp đồng. Ngừng hoạt động khi còn người → `BUILDING_HAS_OCCUPANTS`. **`PUT` nhận một phần**: form sửa gửi `{ name, description }`, nút ngừng/kích hoạt chỉ gửi `{ isActive }`; không đổi `code` |
| P0 | `GET /rooms` · `GET /rooms/:id` | **Giường nhúng trong phòng**, mỗi giường có `hasPendingApplication`. Sức chứa 4/6/8 |
| P1 | `POST /rooms` · `PUT /rooms/:id` | Tạo phòng tự sinh giường. Đổi sức chứa giữ giường cũ. `ROOM_HAS_OCCUPANTS`, `ROOM_HAS_PENDING_APPLICATIONS` |

### 1.4. Nộp đơn công khai — §5 (không cần token, nên giới hạn tần suất)

| Ưu tiên | Endpoint | FE cần đặc biệt |
|---|---|---|
| P0 | `GET /public/rooms/available?gender=` | Sắp **tầng → số phòng** (BR-07); không lộ tên người ở |
| P0 | `POST /contracts/register-online` | MSSV **đúng 10 chữ số** như hồ sơ. Giá đọc từ phòng, **không** khóa giường lúc nộp. Phòng/tòa không hoạt động → `404 NOT_FOUND`. `APPLICATION_OR_CONTRACT_EXISTS`, `BED_ALREADY_REQUESTED`, `BED_ALREADY_OCCUPIED`, `GENDER_MISMATCH` |
| P0 | `GET /public/applications/status?studentCode=&email=` | Cần đủ cả hai; sai → `APPLICATION_NOT_FOUND`. Trả kèm `pricePerMonth`, `totalRoomFee`, `depositAmount` (thiếu thì trang hiện "NaN đ") |

### 1.5. Hợp đồng — §6

| Ưu tiên | Endpoint | FE cần đặc biệt |
|---|---|---|
| P0 | `GET /contracts` · `GET /contracts/:id` | `status` nhận **danh sách** (`active,expired,terminated`); `expired` **tính lúc đọc**; `meta.summary` đếm theo trạng thái + `awaitingDepositRefund`. Mỗi hợp đồng có **`totalDebt`** (nợ cá nhân chưa trả); chi tiết có **`history`** dựng từ các mốc ngày của hợp đồng |
| P0 | `PATCH /contracts/:id/approve` | Body `{ roomId?, bedNumber? }` để đổi giường. Khóa giường **nguyên tử** (BR-05) → tạo/dùng lại tài khoản → email → 2 hóa đơn hạn 7 ngày. `ROOM_NOT_AVAILABLE` khi phòng bảo trì / tòa ngừng |
| P0 | `PATCH /contracts/:id/reject` | Bắt buộc lý do; trạng thái **`rejected`** |
| P0 | `PATCH /contracts/:id/terminate` | `OUTSTANDING_INVOICES` kèm **danh sách hóa đơn** chưa trả, gồm cả hóa đơn điện nước của phòng (BR-04) |
| P1 | `PATCH /contracts/:id/deposit-refund` | Chỉ `terminated`, một lần: `CONTRACT_NOT_TERMINATED`, `DEPOSIT_ALREADY_REFUNDED`. Ghi người + thời điểm |

### 1.6. Điện nước, hóa đơn, thanh toán — §7, §8

| Ưu tiên | Endpoint | FE cần đặc biệt |
|---|---|---|
| P0 | `GET /utility-readings/sheet?buildingId=&monthYear=` | Một lưới cho một tòa + tháng; chỉ số cũ lấy từ tháng trước. Gồm phòng `active` **và phòng bảo trì còn người ở**; `room.status` có trong từng dòng |
| P0 | `POST /utility-readings/bulk` | Lưu nhiều phòng; lỗi theo từng phòng, phòng đúng vẫn lưu |
| P0 | `POST /utility-readings/publish` | **1 hóa đơn / phòng có người / tháng**, mã `INV-UTIL-K1-302-202611` (có mã tòa). Bỏ phòng trống. `NOTHING_TO_PUBLISH` |
| P1 | `GET /utility-readings/history?roomId=` | 12 tháng gần nhất |
| P0 | `GET /invoices` · `GET /invoices/:id` | 3 loại, 2 trạng thái, `scope`; `summary` tổng/đã thu/chưa thu; chi tiết hóa đơn cá nhân kèm `contractCode`. Hóa đơn điện nước có **`monthYear`** (cả ở danh sách và cổng SV) |
| P0 | `POST /payments/cash` · `POST /payments/vietqr/confirm` | Thu đủ một lần. Hóa đơn phòng bắt buộc `payerStudentId` là người đang ở phòng (`PAYER_NOT_IN_ROOM`). `INVOICE_ALREADY_PAID`, `DUPLICATE_TRANSACTION_CODE` |
| P1 | `GET /payments` | Lọc hình thức, loại, khoảng ngày; `summary` theo hình thức |

### 1.7. Cổng sinh viên — §9

| Ưu tiên | Endpoint | FE cần đặc biệt |
|---|---|---|
| P0 | `GET /portal/profile` · `GET /portal/my-residence` | Profile trả **thẳng** object sinh viên (không bọc `{ student }`). `debtSummary` **chỉ tính nợ cá nhân** |
| P0 | `GET /portal/my-invoices?scope=personal\|room` · `GET /portal/my-invoices/:id` | Hóa đơn phòng đã trả có tên người nộp |
| P0 | `GET /portal/my-invoices/:id/vietqr` | `{ bankBin, accountNumber, accountName, amount, transferContent }`; nội dung **không có dấu `-`** |
| P1 | `GET /portal/my-contracts` · `GET /portal/my-payments` · `GET /portal/my-room/utility-history` | Lịch sử điện nước chỉ trả các tháng **đã chốt** |

### 1.8. Dashboard — §10

| Ưu tiên | Endpoint | FE cần đặc biệt |
|---|---|---|
| P1 | `GET /dashboard/summary` · `GET /dashboard/occupancy` | Chỉ tính tòa đang hoạt động; giường trong phòng bảo trì tính là bảo trì |
| P1 | `GET /dashboard/revenue?year=` | **Chỉ admin** (staff → `403 FORBIDDEN`); tách tiền phòng / điện nước theo tháng |

---

## 2. Gỡ khỏi backend (bản v1.2 còn, v2 không dùng) — `API.md` §13

| Gỡ | Thay bằng |
|---|---|
| `POST /auth/register`, vai trò `viewer` | Tài khoản cấp khi duyệt đơn |
| `/room-types`, `/beds/:id/status`, `/rooms/available` | Trường trên phòng, `/public/rooms/available` |
| `/applications`, `/portal/my-applications`, `/residencies` | `contracts` (thêm trạng thái `pending`, `rejected`) |
| `PUT /contracts/:id`, `?expiringInDays=` | Không có |
| `/requests`, `/portal/my-requests` (gia hạn, xin trả phòng) | Trả phòng làm tại văn phòng |
| `/fee-types`, `POST`/`PUT /utility-readings` | Loại hóa đơn cố định, đơn giá trên lưới, `/utility-readings/bulk` |
| `POST /invoices`, `/invoices/generate`, `/generation-preview`, `/invoices/:id/cancel` | Hóa đơn chỉ sinh từ duyệt đơn và chốt điện nước |
| `/payments/offline`, `/payments/online/*`, `/reconcile`, webhook VNPay | `/payments/cash`, `/payments/vietqr/confirm` |
| `/supply-items`, `/supply-orders`, `/portal/supply-*` | Không có |
| Cron (hết hạn hợp đồng, hết hạn giao dịch) | `expired` tính lúc đọc |

---

## 3. Bổ sung schema và điểm cần chốt

### 3.1. Trường cần thêm — `API.md` §12

| Collection | Thêm | Vì sao |
|---|---|---|
| `contracts` | `isDepositRefunded` (mặc định `false`), `depositRefundedAt`, `depositRefundedBy` | FR-35, BR-08 (hoàn cọc — phần bổ sung ngoài SRS) |
| `contracts` | Trạng thái `rejected`; `startDate`/`endDate` được để trống khi `pending`; `terminatedAt`; `reviewedAt` | FR-33, lịch sử, tab Chờ hoàn cọc |
| `users` | `studentCode` (unique, sparse) | Đăng nhập bằng MSSV (FR-01), FR-32 |
| `invoices` | Người nộp hóa đơn điện nước (`studentId` hoặc `payerStudentId`) | FR-41, FR-62 |

### 3.2. Lỗi trong tài liệu yêu cầu v2 (repo backend, `EDIT_DOCS_*`)

1. `EDIT_DOCS_DATA_SCHEMA` §4.3 sinh mã `INV-UTIL-${roomNumber}-…` **không có mã tòa**. Phòng 302 của K1 và K2 cùng tháng sẽ trùng unique index, nên lần chốt thứ hai lỗi. Dùng dạng `INV-UTIL-K1-302-202610` như FR-41.
2. Cùng đoạn đó có `occupants.length || 1`: phòng trống vẫn sinh hóa đơn mà không ai trả. Phải bỏ phòng trống khi chốt.
3. `users` không có `studentCode`, trong khi FR-01 đăng nhập bằng MSSV và FR-32 yêu cầu lưu (xem 3.1).
4. FR-51 cần danh sách thành viên trên hóa đơn phòng, nhưng `invoices` không lưu. Thành viên đổi sau khi chốt thì mất danh sách cũ.
5. Bỏ Cron nhưng vẫn có trạng thái `expired`: tính khi đọc (FE và mock đang làm vậy).
6. Tài liệu ghi "7 collection" nhưng liệt kê 8. `isBilled` còn mô tả "hóa đơn cá nhân" của bản cũ.
7. Nội dung chuyển khoản FR-53 có dấu `-` thì app ngân hàng có thể lược bỏ. Bỏ dấu khi sinh nội dung.
8. SV đã được duyệt rồi bỏ không ở, chưa đóng tiền: BR-04 chặn thanh lý mà hóa đơn không hủy được, nên giường bị giữ mãi. **Cần quy định cách xử lý.**
9. Ở tiếp kỳ sau: không có gia hạn, và UC-01 3a chặn nộp đơn khi còn hợp đồng `active` (kể cả đã quá hạn). SV phải thanh lý rồi mới nộp đơn mới, và giường cũ có thể bị người khác lấy mất. **Cần giảng viên xác nhận** đây là ý đồ.
10. Báo cáo chương 2 kết luận "30 FR, 10 NFR" nhưng bảng thực tế có 39 FR (chưa tính FR-54b) và 11 NFR.

### 3.3. Năm chỗ SRS bỏ ngỏ — FE đã làm theo phương án này

| # | Câu hỏi | FE đã làm |
|---|---|---|
| D1 | SV xin trả phòng thế nào? | Không có thao tác online; đến văn phòng, cán bộ thanh lý |
| D2 | Đơn bị từ chối mang trạng thái gì? | `rejected` |
| D3 | Chuông thông báo lấy dữ liệu đâu? | Hóa đơn điện nước chưa trả của phòng — không cần collection mới |
| D4 | Đơn giá điện nước để đâu? | Gửi kèm mỗi lần lưu lưới (`electricityUnitPrice`, `waterUnitPrice`), lưu vào từng bản ghi |
| D5 | Ai là người nộp khi trả VietQR? | Cán bộ chọn thành viên phòng khi xác nhận (`payerStudentId`) |

---

## 4. Thứ tự đề xuất

1. **Auth + Sinh viên + Tòa/Phòng (giường nhúng)** — nền cho mọi màn; đăng nhập bằng MSSV, cờ buộc đổi mật khẩu.
2. **Nộp đơn công khai + Duyệt/Từ chối** — luồng chính; chú ý khóa giường nguyên tử và tạo tài khoản + 2 hóa đơn.
3. **Hóa đơn + Thu tiền + Cổng SV (hóa đơn, VietQR)** — sinh viên trả được tiền.
4. **Chỉ số điện nước (lưới, lưu, chốt)** — hóa đơn phòng.
5. **Thanh lý + Hoàn cọc** — khép vòng đời.
6. **Dashboard, Excel nhập sinh viên, lịch sử** — P1.

---

## 5. Cách FE nghiệm thu khi backend xong

1. Backend báo phần đã xong; FE đặt `VITE_USE_MOCK=false`, chạy đúng cổng `5173` (CORS).
2. Chạy checklist `15-CHECKLIST-NGHIEM-THU-FE.md` mục 24–35 với dữ liệu thật, đặc biệt **mục 35 (trọn luồng 3 vai trò)**.
3. Lỗi ghi theo **endpoint + mã lỗi nhận được + mã lỗi mong đợi** và cập nhật vào tài liệu này.
4. ⚠️ Test có ghi dữ liệu thì dùng CSDL riêng, **không ghi vào cụm Atlas dùng chung** của nhóm.

---

## 6. Kết quả nối backend ngày 12/11/2026

### 6.1. Bản `b8c6cc9` của nhóm BE lệch hợp đồng thế nào

| Nhóm | Lệch chính |
|---|---|
| Chung | Danh sách trả `{ data, pagination }` thay vì `{ items, total, page, limit }` (§1.2), nên bảng antd ở FE sập. Không chặn `MUST_CHANGE_PASSWORD`. Id sai dạng trả 400 thay vì 404 |
| Thiếu hẳn | Tra cứu đơn, hoàn cọc, lưới / chốt cả tòa / lịch sử điện nước, cổng SV: hồ sơ, chỗ ở, lịch sử hợp đồng, chi tiết hóa đơn, lịch sử điện nước phòng |
| Khác đường dẫn | `POST` thay `PATCH` (duyệt / từ chối / thanh lý), `/students/import-excel`, `/students/:id/status`, `/dashboard/kpi`, `/payments/bank-transfer/confirm`, `/payments/vietqr/:invoiceId` |
| Khác mô hình | Không có trạng thái `rejected` (từ chối thành `terminated`). Thanh lý gộp luôn hoàn cọc và tạo phiếu `refund` (trái BR-08). Hóa đơn không có `scope`, `monthYear`, người nộp |

**Lỗi thật trong bản đó:**
- **Khóa giường sai.** Điều kiện `{'beds.bedNumber': n, 'beds.status': 'available'}` thiếu `$elemMatch`, nên khớp khi phòng có *bất kỳ* giường trống nào. Hậu quả: có thể xếp hai người một giường.
- **Gắn nhầm tài khoản.** Duyệt đơn mà email sinh viên trùng một tài khoản có sẵn (kể cả cán bộ) thì gắn sinh viên vào tài khoản đó.
- **Cron trả giường quá sớm.** Cron đổi hợp đồng quá hạn sang `expired` và trả giường trước khi thanh lý, nên bỏ qua kiểm nợ BR-04.
- **Hóa đơn quá hạn lọt khỏi kiểm nợ.** Cron đổi hóa đơn sang `overdue` (ngoài enum), nên mọi chỗ kiểm nợ (lọc `unpaid`) bỏ sót.
- **Lộ dữ liệu.** Sinh viên xem được hóa đơn và hợp đồng của người khác (không kiểm quyền sở hữu).
- **Đổi giới tính phòng không có tác dụng.** Đổi giới tính phòng bị bỏ qua im lặng; đổi sức chứa thì sinh lại toàn bộ giường, xóa trạng thái bảo trì.

### 6.2. Đã sửa trên nhánh `fix/v2-api-contract` (repo BE, chưa đẩy)

- **Tầng route / service** của 8 module viết lại theo `API.md` v2.7. Dạng dữ liệu trả ra gom một chỗ ở `src/shared/views.js` (StudentRef, RoomRef, Contract, Invoice, Payment).
- **Hạ tầng giữ nguyên:** xác thực JWT, envelope, error-handler. Phần sửa thêm:
  - chặn `403 MUST_CHANGE_PASSWORD`;
  - id sai dạng trả `404`;
  - trùng khóa trả lỗi theo trường;
  - mã chứng từ tăng dần (`HD-2026-0001`), có thử lại khi trùng.
- **Model:**
  - ngày chỉ có ngày lưu chuỗi `YYYY-MM-DD` (giờ Việt Nam);
  - Contract thêm `rejected`, `isDepositRefunded`, `terminatedAt`, `reviewedAt`;
  - Invoice thêm `scope`, `monthYear`, `payerStudentId`;
  - User thêm `studentCode` để đăng nhập bằng MSSV;
  - Student thêm `citizenId`, `address`.
- **Đã sửa mọi lỗi ở 6.1.** Khóa giường dùng `$elemMatch`. Duyệt đơn tự hoàn tác nếu bước sau lỗi, vì CSDL không chạy replica set nên không có transaction.
- **Cron:** bỏ cả ba job cũ; `expired` tính lúc đọc.
- **Dữ liệu mẫu `seed.js`:**
  - dựng đủ tình huống, cùng bộ tài khoản với dữ liệu giả của FE;
  - **từ chối chạy vào cụm Atlas** nếu không đặt `SEED_ALLOW_REMOTE=true`.
- **Bỏ** các file controller / validation (Joi) cũ. Validate nằm trong service để trả đúng câu lỗi theo trường như FE cần.
- **Không còn:**
  - **gửi email:** BE chưa có dịch vụ mail. Duyệt đơn trả `emailSent: false`, màn duyệt nhắc cán bộ tự báo sinh viên;
  - **Redis cache:** bỏ cache ở các service vì dữ liệu nhỏ và cache cũ từng gây sai số.

### 6.3. Đã kiểm

| Kiểm | Kết quả |
|---|---|
| So dạng dữ liệu BE với mock FE, mọi endpoint GET theo 3 vai trò | Khớp hết. Chỉ thiếu vài trường nội bộ của mock mà FE không đọc |
| Quyền | Staff bị chặn doanh thu / tài khoản. Sinh viên bị chặn `/invoices` và hóa đơn người khác. Tài khoản bị buộc đổi mật khẩu bị chặn mọi chỗ |
| Trọn vòng đời trên giao diện, BE thật | 23/23 bước: nộp đơn → tra cứu → duyệt → chốt điện nước → SV đăng nhập lần đầu → thanh lý bị chặn → thu tiền → thanh lý → hoàn cọc → SV thấy đã nhận cọc → doanh thu |
| Mở mọi màn theo 3 vai trò, BE thật | Không màn nào lỗi, không request nào 4xx/5xx ngoài ý muốn |

**Chưa kiểm:**
- Chạy trên cụm Atlas dùng chung (mới chạy MongoDB cục bộ).
- Nhiều người thao tác cùng lúc (chỉ kiểm logic điều kiện, chưa bắn tải).
- Bản build production của BE.

### 6.4. Nhóm BE cần làm

1. Review nhánh `fix/v2-api-contract` (nhánh này chưa có trên remote — FE Lead đẩy khi nhóm sẵn sàng). Thay đổi lớn nhất: `src/shared/views.js`, `contracts/contract.service.js`, `fees/fee.service.js`, `scripts/seed.js`.
2. Quyết có giữ Redis cache không. Nếu giữ thì phải xóa cache ở MỌI chỗ ghi.
3. Thêm dịch vụ gửi email (gửi tài khoản khi duyệt đơn), rồi trả `emailSent: true`.
4. Điền tài khoản nhận tiền thật cho VietQR: `.env` → `VIETQR_BANK_BIN`, `VIETQR_ACCOUNT_NUMBER`, `VIETQR_ACCOUNT_NAME`.

### 6.5. Chạy thử trên máy (CSDL cục bộ, không đụng Atlas)

```bash
# 1. MongoDB cục bộ cổng 27018
mongod --port 27018 --dbpath <thư mục dữ liệu>
# 2. Dữ liệu mẫu (xóa sạch CSDL test rồi dựng lại)
MONGODB_URI=mongodb://127.0.0.1:27018/dms_ktx_test node src/scripts/seed.js
# 3. Backend
MONGODB_URI=mongodb://127.0.0.1:27018/dms_ktx_test ENABLE_REDIS=false node src/server.js
# 4. Frontend (đúng cổng 5173 vì CORS)
VITE_USE_MOCK=false npm run dev
```

---

## Lịch sử phiên bản

| Phiên bản | Ngày | Nội dung |
|---|---|---|
| 2.2 | 12/11/2026 | Mục 6: đối chiếu bản BE `b8c6cc9`, FE sửa lại BE theo `API.md` v2.7 trên nhánh `fix/v2-api-contract`, kết quả kiểm |
| 2.1 | 11/11/2026 | Soát trước khi nối backend, theo `API.md` v2.6: thêm các trường màn hình đang đọc (`totalDebt`, `history`, `monthYear`, giá ở tra cứu đơn, shape profile), `PUT /buildings` nhận một phần, MSSV 10 số ở nộp đơn, `GENDER_CHANGE_NOT_ALLOWED`, lưới điện nước gồm phòng bảo trì còn người. Bỏ mục 11 "Danh mục loại phòng" còn sót từ v1. Backend `main` vẫn `ba70bd9` |
| 2.0 | 10/11/2026 | Viết lại cho bản HaUI v2: 51 endpoint theo `API.md` v2.5, danh sách gỡ bỏ, bổ sung schema, D1–D5. Đối chiếu backend `main` `ba70bd9`: chưa có endpoint v2 |
| 1.11 | 16/09/2026 | (v1) Kết quả nối thử bản backend `c1a24e1` — xem lịch sử git |
| 1.0 | 15/09/2026 | (v1) Bản bàn giao đầu: 82 endpoint theo `API.md` v1.2.8 |
