# 17 – TỔNG QUAN FRONTEND (tài liệu nắm project)

**Hệ thống:** Ký túc xá HaUI — bản tinh gọn v2
**Người đọc:** thành viên nhóm phụ trách Frontend — dùng để nắm toàn bộ phần FE và trả lời khi được hỏi
**Người lập:** FE Lead · **Cập nhật:** 10/11/2026 (bản 2.0) · **Trạng thái FE:** đủ 21 màn v2, chạy trên dữ liệu giả

> Tài liệu này gom lại **những gì thực sự đã code** ở bản v2 và giải thích *vì sao làm như vậy*. Hợp đồng dữ liệu ở `API.md` (v2.6), mô tả đề tài ở `MO-TA-DE-TAI.md`. Các tài liệu `01`–`14`, `PRD.md`, `DATA-SCHEMA.md` mô tả **bản v1** (đăng ký theo loại phòng, nhu yếu phẩm, VNPay…) — chỉ dùng để tra lịch sử.

---

## 1. Trả lời nhanh trong 60 giây

1. **Frontend là gì?** Ứng dụng React một trang (SPA), gồm **3 khu vực**: trang công khai (đăng nhập, nộp đơn, tra cứu đơn), khu quản trị `/admin/*` cho cán bộ ký túc xá, cổng sinh viên `/portal/*`.
2. **Bao nhiêu màn?** **21 màn** (6 chung/công khai · 11 quản trị · 4 cổng sinh viên), khai báo ở [AppRoutes.jsx](../src/routes/AppRoutes.jsx).
3. **Công nghệ?** React 19 + Vite 8, **Ant Design 6**, `react-router-dom` 7, `axios`, `dayjs`, `recharts` (biểu đồ), `exceljs` (đọc/ghi Excel, chỉ tải khi bấm nút). Không dùng Redux.
4. **Phân quyền?** **3 vai trò**: `admin`, `staff`, `student`. Chặn 2 lớp: `RoleRoute` theo đường dẫn, `can(user, 'action')` ẩn/hiện nút. **Chỉ là giao diện — backend phải kiểm lại.**
5. **Sinh viên có tài khoản thế nào?** **Không tự đăng ký.** Nộp đơn công khai (không cần tài khoản) → cán bộ duyệt → hệ thống cấp tài khoản **MSSV / mật khẩu = MSSV** và buộc đổi mật khẩu lần đầu (BR-06).
6. **Nghiệp vụ lõi?** Sinh viên **tự chọn phòng và giường**, gói **6 hoặc 12 tháng**, thu **trọn gói** khi duyệt (tiền cọc + tiền phòng cả kỳ). Điện nước: **một hóa đơn mỗi phòng mỗi tháng**, một bạn nộp đại diện cả phòng (BR-03).
7. **Thanh toán?** Chỉ **tiền mặt** và **chuyển khoản VietQR**; cán bộ xác nhận đã nhận tiền. Không có cổng thanh toán online, không thu một phần.
8. **Rời ký túc xá?** Sinh viên đến văn phòng; cán bộ **thanh lý** (bị chặn nếu còn hóa đơn chưa trả — BR-04), rồi **xác nhận đã hoàn cọc** (FR-35). Không có gia hạn.
9. **Dữ liệu ở đâu ra?** Hai chế độ: **dữ liệu giả** trong `src/mocks/` (đang dùng) và backend thật, đổi bằng biến `VITE_USE_MOCK`. Backend nhóm **chưa lên v2**, nên toàn bộ v2 hiện chạy trên dữ liệu giả — đây là chủ đích.
10. **Kiểm thử?** 12 bộ kiểm thử tự động (Puppeteer), **377 bước**, gồm một bộ chạy trọn vòng đời một hồ sơ qua cả 3 vai trò; cộng checklist bấm tay `15-CHECKLIST-NGHIEM-THU-FE.md` mục 24–35.

---

## 2. Bộ công nghệ và lý do chọn

| Thư viện | Phiên bản | Dùng để làm gì | Vì sao chọn |
|---|---|---|---|
| React | 19 | Khung giao diện | Phổ biến nhất, nhiều tài liệu, cả nhóm đã biết |
| Vite | 8 | Chạy dev + đóng gói | Khởi động < 1 giây, sửa là thấy ngay |
| Ant Design | 6 | Bảng, form, modal, thông báo | ~60 thành phần chuẩn quản trị: bảng phân trang/lọc, form có kiểm tra dữ liệu |
| react-router-dom | 7 | Định tuyến | Chuẩn cho SPA React |
| axios | 1.20 | Gọi HTTP | Interceptor gắn token, xử lý 401/403 ở **một chỗ** |
| dayjs | 1.11 | Ngày tháng | Nhẹ, API giống moment |
| recharts | 3 | Biểu đồ Dashboard | Khai báo bằng JSX |
| exceljs | 4.4 | Nhập sinh viên, xuất/nhập chỉ số điện nước | Đọc/ghi `.xlsx` ngay trên trình duyệt; **tải động** (chunk riêng ~930 kB) nên không làm nặng lần tải đầu |

**Không dùng:** Redux / Zustand (thứ dùng chung duy nhất là người đang đăng nhập → Context đủ), TypeScript (nhóm chưa quen; bù bằng JSDoc ở hàm dùng chung), React Query (hook `useApi` tự viết đủ dùng), thư viện animation / font / bộ icon riêng (giữ giao diện tĩnh, nhẹ).

> **"Sao không dùng Redux?"** → Redux giải bài toán *nhiều màn cùng đọc/ghi một kho dữ liệu*. Ở đây mỗi màn tự gọi API của mình; thứ duy nhất dùng chung là `user`.

---

## 3. Cấu trúc thư mục

Tổ chức theo **tính năng**: sửa màn hóa đơn thì mở `src/features/fees/`.

```
src/
├── main.jsx, App.jsx           Khởi động; bọc ConfigProvider (theme, tiếng Việt) + AuthProvider
├── routes/                     AppRoutes (21 màn) · RoleRoute (chặn theo vai trò + buộc đổi MK) · paths.js
├── layouts/                    AdminLayout (menu trái) · PortalLayout (menu ngang + thanh tab dưới trên điện thoại)
├── context/                    AuthContext + AuthProvider: user, login, logout, updateUser
├── lib/                        axiosClient (token, 401/403, đọc lỗi) · authStorage · authApi · env
├── hooks/                      useApi (gọi API + 3 trạng thái) · useDebounce
├── components/                 8 thành phần dùng chung: PageHeader, DataTable, StatCard, StatusTag,
│                               MoneyText, EmptyState, ErrorBoundary, BrandLogo
├── constants/                  roles.js · statuses.js (nhãn + màu mọi trạng thái) · app.js (thông tin liên hệ)
├── theme/tokens.js             MỘT nguồn màu: theme antd + biến CSS (index.css), đã đo tương phản AA
├── utils/                      formatter · permission (ma trận quyền) · excel (tải exceljs động)
├── mocks/                      mockDb (dựng dữ liệu) · mockApi (giả lập 51 endpoint, thực thi luật) · mockHelpers
└── features/                   11 nhóm chức năng, mỗi nhóm có api/ pages/ components/ utils/
    ├── apply         nộp đơn công khai, tra cứu        ├── applications  duyệt đơn
    ├── auth          đăng nhập, đổi MK, 403, 404       ├── contracts     hợp đồng, thanh lý, hoàn cọc
    ├── rooms         tòa nhà, phòng, sơ đồ tầng        ├── fees          chỉ số điện nước, hóa đơn
    ├── payments      phiếu thu                         ├── dashboard     KPI, lấp đầy, doanh thu
    ├── students      sinh viên, nhập Excel             ├── users         tài khoản cán bộ
    └── portal        cổng sinh viên
```

| Thư mục trong feature | Chứa gì | Ví dụ |
|---|---|---|
| `api/` | Mọi lời gọi HTTP của feature, **một file** | `fee.api.js` |
| `pages/` | Màn gắn với một đường dẫn | `InvoicesPage.jsx` |
| `components/` | Mảnh giao diện chỉ dùng trong feature | `CollectPaymentModal.jsx` |
| `utils/` | Biến dữ liệu thô → dữ liệu hiển thị, **không JSX** | `readingSheet.js`, `invoiceView.js` |

---

## 4. Danh sách 21 màn

Vai trò: **A** = admin · **S** = staff · **SV** = sinh viên.

### 4.1. Chung và công khai (6)

| Màn | Đường dẫn | Ai vào | File chính | API |
|---|---|---|---|---|
| Đăng nhập | `/login` | Công khai | `auth/pages/LoginPage.jsx` | `POST /auth/login` |
| Nộp đơn ở KTX (3 bước) | `/apply` | Công khai | `apply/pages/PublicApplyPage.jsx`, `components/BedPicker.jsx` | `GET /public/rooms/available`, `POST /contracts/register-online` |
| Tra cứu đơn | `/apply/status` | Công khai | `apply/pages/ApplicationStatusPage.jsx` | `GET /public/applications/status` |
| Đổi mật khẩu | `/admin/change-password`, `/portal/change-password` | Mọi vai trò | `auth/pages/ChangePasswordPage.jsx` | `PATCH /auth/change-password` |
| Không có quyền | `/403` | — | `auth/pages/ForbiddenPage.jsx` | — |
| Không tìm thấy | `*` | — | `auth/pages/NotFoundPage.jsx` | — |

### 4.2. Khu quản trị (11)

| Màn | Đường dẫn | Ai | File chính | API |
|---|---|---|---|---|
| Dashboard | `/admin/dashboard` | A S | `dashboard/pages/DashboardPage.jsx`, `OccupancyChart`, `RevenueChart` | `GET /dashboard/summary`, `/occupancy`, `/revenue` (chỉ A) |
| Sinh viên | `/admin/students` | A S | `students/pages/StudentsPage.jsx`, `StudentDetailDrawer`, `StudentFormModal`, `ImportStudentsModal` | `GET/POST/PUT /students`, `POST /students/import`, `PATCH /students/:id/deactivate`, `POST /users/:id/reset-password` |
| Tòa nhà | `/admin/buildings` | A S | `rooms/pages/BuildingsPage.jsx` | `GET/POST/PUT /buildings` |
| Phòng — sơ đồ tầng | `/admin/rooms` | A S | `rooms/pages/RoomsPage.jsx`, `FloorMap`, `RoomTile`, `RoomDetailPanel`, `RoomFormModal` | `GET/POST/PUT /rooms`, `GET /rooms/:id` |
| Duyệt đơn | `/admin/applications` | A S | `applications/pages/ApplicationsPage.jsx`, `ApplicationDetail`, `RejectApplicationModal` | `GET /contracts?status=pending`, `PATCH /contracts/:id/approve` · `/reject` |
| Hợp đồng | `/admin/contracts` | A S | `contracts/pages/ContractsPage.jsx`, `ContractDetailDrawer` | `GET /contracts`, `PATCH /contracts/:id/terminate` · `/deposit-refund` |
| Chỉ số điện nước | `/admin/utility-readings` | A S | `fees/pages/UtilityReadingsPage.jsx`, `readings/*` | `GET /utility-readings/sheet`, `POST /utility-readings/bulk` · `/publish`, `GET /utility-readings/history` |
| Hóa đơn | `/admin/invoices` | A S | `fees/pages/InvoicesPage.jsx`, `CollectPaymentModal` | `GET /invoices`, `POST /payments/cash` · `/payments/vietqr/confirm` |
| Chi tiết hóa đơn | `/admin/invoices/:id` | A S | `fees/pages/InvoiceDetailPage.jsx`, `payments/components/PaymentReceipt.jsx` | `GET /invoices/:id` |
| Phiếu thu | `/admin/payments` | A S | `payments/pages/PaymentsPage.jsx` | `GET /payments` |
| Tài khoản cán bộ | `/admin/users` | **A** | `users/pages/UsersPage.jsx`, `UserFormModal`, `TemporaryPasswordModal` | `GET/POST/PUT /users`, `PATCH /users/:id/status`, `POST /users/:id/reset-password` |

### 4.3. Cổng sinh viên (4)

| Màn | Đường dẫn | File chính | API |
|---|---|---|---|
| Trang chủ | `/portal/home` | `portal/pages/PortalHomePage.jsx`, `home/ResidentHome`, `home/NoResidenceHome`, `home/TodoCard` | `GET /portal/profile`, `/portal/my-residence`, `/portal/my-invoices` |
| Chỗ ở & hợp đồng | `/portal/my-residence` | `portal/pages/MyResidencePage.jsx`, `RoomUtilityHistoryCard` | `GET /portal/my-residence`, `/portal/my-contracts`, `/portal/my-room/utility-history` |
| Hóa đơn & thanh toán | `/portal/my-invoices` | `portal/pages/MyInvoicesPage.jsx`, `invoices/MyInvoiceDetail`, `VietQrPanel`, `MyPaymentsList` | `GET /portal/my-invoices?scope=personal\|room`, `/portal/my-invoices/:id/vietqr`, `/portal/my-payments` |
| Hồ sơ (chỉ đọc) | `/portal/profile` | `portal/pages/ProfilePage.jsx` | `GET /portal/profile`, `/portal/my-residence` |

Chuông thông báo ở thanh trên cổng sinh viên (`RoomInvoiceBell`) đếm hóa đơn điện nước **chưa trả của phòng mình**.

---

## 5. Logic triển khai — điểm cần giải thích được

### 5.1. Đăng nhập và mật khẩu
- Một ô "Email hoặc mã sinh viên" (FR-01). Ô "Ghi nhớ" chọn `localStorage` (giữ phiên) hay `sessionStorage` (đóng trình duyệt là hết).
- Tài khoản có `mustChangePassword` bị `RoleRoute` khóa mọi trang khác cho tới khi đổi; nếu backend trả `403 MUST_CHANGE_PASSWORD`, `axiosClient` cũng đưa về trang đổi mật khẩu.
- Mật khẩu mới ≥ 8 ký tự, có chữ và số, **không được trùng MSSV** (vì mật khẩu khởi tạo là MSSV).
- Đăng xuất ở một tab thì tab khác tự về màn đăng nhập (nghe sự kiện `storage`).

### 5.2. Nộp đơn công khai và duyệt đơn
- **3 bước:** thông tin → phòng & giường → gói thuê. Chọn giới tính trước, chỉ hiện phòng cùng giới (BR-01), xếp **tầng thấp → số phòng nhỏ**, phòng đầu gắn nhãn "Gợi ý" (BR-07) nhưng không ép.
- Mỗi giường một trạng thái: Trống · Đã có người · **Đã có người đăng ký** (đơn chờ duyệt đang giữ) · Bảo trì. Chỉ chọn được giường Trống.
- Tổng tiền tính sẵn: giá tháng × 6 hoặc 12 + tiền cọc (BR-02). Giá luôn do server đọc từ phòng.
- **Tranh giường lúc nộp:** người đến sau nhận `409`, form quay lại bước chọn giường và tải lại danh sách.
- **Duyệt:** cán bộ thấy giường sinh viên chọn; nếu giường đó đã bị chiếm thì nút Duyệt khóa và phải chọn giường khác (cùng phòng hoặc phòng khác). Duyệt sinh **tài khoản + 2 hóa đơn** (cọc, tiền phòng cả kỳ, hạn 7 ngày); sinh viên cũ quay lại thì dùng lại tài khoản cũ. Từ chối bắt buộc nhập lý do.
- **Tranh giường lúc duyệt:** server khóa giường bằng một lệnh nguyên tử (BR-05); người chậm hơn nhận `409 BED_ALREADY_OCCUPIED`.

### 5.3. Hợp đồng, thanh lý, hoàn cọc
- Tab: Đang hiệu lực · Hết hạn · Chờ hoàn cọc · Đã chấm dứt · Tất cả. Trạng thái **`expired` suy ra lúc đọc** (ngày kết thúc đã qua mà chưa thanh lý) vì v2 không có tác vụ chạy ngầm.
- **Thanh lý** áp dụng cho hợp đồng còn hiệu lực hoặc đã hết hạn; còn hóa đơn chưa trả (kể cả điện nước của phòng) thì bị chặn và **liệt kê từng hóa đơn** (BR-04). Thanh lý xong giường trống lại.
- **Hoàn cọc** (FR-35, BR-08) chỉ sau khi thanh lý, hoàn đủ, xác nhận **một chiều** có hộp thoại hỏi lại, ghi người và thời điểm xác nhận. Không tạo phiếu thu nên không tính vào doanh thu.

### 5.4. Tiền: chỉ số → hóa đơn → thu tiền
- **Chỉ số điện nước:** bảng lưới theo tòa + tháng; chỉ số cũ tự điền từ tháng trước; 2 ô đơn giá điện/nước ở đầu bảng, lưu vào từng bản ghi. Lưu nhiều phòng một lần, số đang gõ dở của phòng khác được giữ.
- **Chốt & phát hành** tạo **một hóa đơn mỗi phòng có người** (mã `INV-UTIL-K1-302-202611`), bỏ phòng trống, khóa chỉ số tháng đó. Nút chỉ bật khi không còn thay đổi chưa lưu — tránh phát hành theo số cũ trong lúc màn hình đang hiện số mới.
- **Excel chỉ số:** xuất file có mã tòa + tháng ở dòng 1; nhập lại **chỉ điền vào lưới**, cán bộ xem rồi mới bấm Lưu. File khác tòa/tháng bị từ chối.
- **Hóa đơn:** 3 loại (cọc, tiền phòng cả kỳ, điện nước), 2 trạng thái (`unpaid`/`paid`), 2 phạm vi (cá nhân / cả phòng). Quá hạn chỉ là chữ đỏ cạnh ngày, không phải trạng thái.
- **Thu tiền:** thu đủ một lần, tiền mặt hoặc VietQR. Hóa đơn phòng bắt chọn **người nộp đại diện** trong phòng (D5); mã giao dịch ngân hàng không bắt buộc nhưng không được trùng. Thu xong hiện **phiếu thu in được**.

### 5.5. Cổng sinh viên
- **Trang chủ** gom công nợ cá nhân, điện nước của phòng và hạn hợp đồng thành một thẻ **"Việc cần làm"**, việc gấp lên trước.
- **Hóa đơn** chia 2 tab "Của tôi" / "Của phòng" + lịch sử nộp tiền. Hóa đơn chưa trả có khối **VietQR**: ảnh QR lấy từ `img.vietqr.io` đúng số tiền; nội dung chuyển khoản dạng `HAUI INV20260020 2021600010` (bỏ dấu `-` vì app ngân hàng hay lược).
- Hóa đơn phòng đã trả ghi "Đã thanh toán bởi …".
- **Chỗ ở** hiện phòng, bạn cùng phòng, hợp đồng, trạng thái tiền cọc, lịch sử lưu trú và lịch sử điện nước của phòng. Không có thao tác trả phòng online (D1).

### 5.6. Cơ sở vật chất, sinh viên, tài khoản
- **Phòng:** sức chứa 4/6/8; phòng có người không đổi được giới tính/sức chứa; giảm sức chứa mà mất giường đang có đơn chờ thì bị chặn. Bảo trì ở **cấp phòng**: chỉ chặn nhận đơn mới, người đang ở vẫn ở tiếp và phòng vẫn có dòng trong lưới điện nước.
- **Tòa nhà:** ngừng hoạt động bị chặn khi còn người ở.
- **Sinh viên:** MSSV đúng 10 chữ số, cả ở form nộp đơn công khai. Không đổi được giới tính khi còn đơn chờ hoặc đang ở (BR-01). Vô hiệu hóa bị chặn khi còn hợp đồng hoặc còn nợ.
  - **Đặt lại mật khẩu** từ drawer sinh viên: Staff làm được, nhưng chỉ cho tài khoản sinh viên.
  - **Nhập Excel:** có file mẫu; dòng lỗi được báo đúng số dòng, các dòng đúng vẫn nhập.
- **Tài khoản:** chỉ Admin vào. Chỉ tạo admin/staff (tài khoản sinh viên chỉ sinh ra khi duyệt đơn). Không khóa được admin cuối cùng, không tự khóa chính mình. Mật khẩu tạm hiện **một lần**.

---

## 6. Các luồng chạy chính

### 6.1. Vòng đời một hồ sơ (bộ kiểm thử M11 chạy đúng chuỗi này)

```
Khách   /apply: thông tin → chọn phòng + giường → gói 12 tháng → gửi        ─► đơn `pending`, giường "Đã có người đăng ký"
Khách   /apply/status bằng MSSV + email                                     ─► "Chờ duyệt"
Staff   Duyệt đơn                                                           ─► hợp đồng `active` + tài khoản MSSV/MSSV + 2 hóa đơn
Staff   Chỉ số điện nước → Chốt & phát hành                                 ─► 1 hóa đơn điện nước cho phòng
SV      Đăng nhập MSSV/MSSV → bị buộc đổi mật khẩu → trang chủ               ─► "Việc cần làm": công nợ + điện nước phòng
SV      Hóa đơn của tôi → mã VietQR                                          (chuyển khoản ngoài hệ thống)
Staff   Hợp đồng → Thanh lý                                                 ─► bị chặn, liệt kê hóa đơn chưa trả (BR-04)
Staff   Hóa đơn → Thu tiền ×3 (hóa đơn phòng: chọn SV làm người nộp)          ─► 3 phiếu thu
Staff   Hợp đồng → Thanh lý → Xác nhận đã hoàn cọc                          ─► `terminated`, giường trống, ghi người xác nhận
SV      Đăng nhập bằng mật khẩu mới                                         ─► "Chưa có chỗ ở" + "Đã nhận lại cọc ngày …"
Admin   Phiếu thu, Dashboard                                                ─► thấy các khoản vừa thu, có doanh thu
```

### 6.2. Phân quyền khi vào một trang

```
Chưa đăng nhập ──► /login (giữ lại trang định vào, kể cả ?query)
Đã đăng nhập, mustChangePassword ──► trang đổi mật khẩu của vai trò đó
Sai vai trò (vd. sinh viên vào /admin) ──► /403
Staff vào /admin/users ──► /403 (chỉ Admin)
```

---

## 7. Cơ chế dùng chung

### 7.1. Phiên đăng nhập
`AuthProvider` giữ đúng một trạng thái dùng chung là `user`. Mọi đọc/ghi phiên đi qua `lib/authStorage.js` (đọc thẳng `localStorage` ở nơi khác sẽ bỏ sót phiên trong `sessionStorage`).

### 7.2. Gọi API — `lib/axiosClient.js`
| Việc | Cách làm |
|---|---|
| Gắn token | Interceptor request thêm `Authorization: Bearer …` |
| `401` | Xóa phiên, về `/login` |
| `403 MUST_CHANGE_PASSWORD` | Đặt cờ buộc đổi mật khẩu, về trang đổi mật khẩu |
| Đọc lỗi | `getErrorMessage` (câu tiếng Việt), `getErrorCode` (mã ổn định), `getFieldErrors` (lỗi từng ô đổ vào form) — màn hình xử lý theo **mã lỗi**, không so chuỗi |
| Mất mạng | "Không kết nối được máy chủ" |

Envelope thống nhất với backend: `{ code, message, data }`; danh sách là `data: { items, total, page, limit, summary? }`.

### 7.3. Hook `useApi`
```js
const { data, meta, loading, error, refetch } = useApi(() => invoiceApi.getInvoices(filters), [filters]);
```
Lo hộ ba trạng thái, so phụ thuộc bằng nội dung (truyền thẳng object `filters` không gọi API vô hạn), tách `items` → `data` và phần còn lại → `meta`, bỏ kết quả về muộn của lần gọi cũ.
⚠️ Hook coi **mọi phản hồi có mảng `items` là danh sách** — chi tiết đừng trả trường tên `items`.

### 7.4. Phân quyền — hai lớp
`RoleRoute allowed={[...]}` chặn đường dẫn; `can(user, 'contract:terminate')` ẩn nút. Ma trận ở `utils/permission.js`: **12 khóa quyền**. **Không phải biện pháp bảo mật** — backend kiểm lại mọi endpoint.

### 7.5. Trạng thái, định dạng, màu
- `constants/statuses.js` là nguồn duy nhất của nhãn + màu trạng thái (hợp đồng, hóa đơn, phòng, giường, hình thức thanh toán).
- `utils/formatter.js`: tiền `1.920.000 đ`, ngày `DD/MM/YYYY`, giá trị rỗng hiện `—`.
- `theme/tokens.js`: một nguồn màu cho theme antd và biến CSS. Mọi màu chữ đạt **WCAG AA ≥ 4.5:1** (xanh chính `#1263D6`; chữ trạng thái xanh/vàng/đỏ dùng bản đậm).
- Quy ước hình ảnh: hiệu ứng đứng yên, mỗi lúc chỉ một thứ chuyển động.
- Thành phần dùng chung: `PageHeader`, `DataTable` (tìm kiếm + phân trang server + tải/lỗi/rỗng; thanh lọc xếp lưới 2 cột trên điện thoại), `StatCard`, `StatusTag`, `MoneyText`, `EmptyState`, `ErrorBoundary`, `BrandLogo`.

---

## 8. Lớp dữ liệu giả

**Vì sao có:** backend làm sau; FE không chờ được. `src/mocks/` giả lập **đủ 51 endpoint** theo đúng `API.md`, kể cả mã lỗi và luật nghiệp vụ (khóa giường, BR-04, trùng mã giao dịch…). Mỗi hàm trong `*.api.js`:

```js
getInvoices: (params) => (USE_MOCK ? mockFees.getInvoices(params) : axiosClient.get('/invoices', { params })),
```

**Dữ liệu dựng sẵn:**
- **4 tòa:** K1, K2 hoạt động; K3, K4 ngừng hoạt động.
- **Phòng và giường:** 20 phòng (4/6/8 chỗ), 112 giường (71 có người, 2 bảo trì).
- **Sinh viên và hợp đồng:** 90 sinh viên. Hợp đồng: 69 hiệu lực, 2 hết hạn chưa thanh lý, 5 đơn chờ duyệt, 1 bị từ chối, 3 đã chấm dứt.
- **Tiền:** 180 hóa đơn, 162 phiếu thu, chỉ số điện nước 3 tháng gần nhất.

Ngày tháng tính theo **ngày chạy**, nên "còn N ngày", "quá hạn" luôn có dữ liệu để xem.

| Tình huống cài sẵn | Tài khoản / chỗ xem |
|---|---|
| Hợp đồng hết hạn, còn nợ → thanh lý bị chặn | `sv009`, tab Hết hạn |
| Hợp đồng sắp hết hạn | `sv004` |
| Đơn chờ duyệt mà giường đã có người | Duyệt đơn (đơn của `sv006`) |
| Phòng "tranh chỗ": nhiều đơn, một giường | Màn nộp đơn + Duyệt đơn |
| Vừa được cấp tài khoản, buộc đổi MK | `2021600005` / `2021600005` |
| Mật khẩu tạm | `doimk@dorm.local` |
| Sinh viên không có việc gì cần làm | `sv003` |

> ⚠️ Dữ liệu giả nằm trong bộ nhớ tab trình duyệt: **tải lại trang là về trạng thái ban đầu** (phiên đăng nhập vẫn giữ). Demo luồng dài thì đừng F5 giữa chừng.
> ⚠️ Sửa file trong `src/mocks/` khi `npm run dev` đang chạy có thể làm Vite nạp hai bản module → dữ liệu lệch. Sửa mock xong thì khởi động lại `npm run dev`.

---

## 9. Backend

- Backend nhóm (`BE_QLKTX`) đang ở API **v1.x**. Từ mốc M1 của v2, FE **không chạy đúng với backend hiện tại** cho tới khi backend lên v2 — đã thống nhất từ đầu.
- Việc backend cần làm: **`16-YEU-CAU-API-BACKEND.md`** (51 endpoint, phần bỏ đi của v1, các điểm cần bổ sung vào schema).
- Khi backend xong: đặt `VITE_USE_MOCK=false`, chạy FE đúng cổng `5173` (backend chỉ cho phép CORS từ địa chỉ này), chạy lại checklist mục 24–35 với dữ liệu thật.

---

## 10. Quy tắc nghiệp vụ thể hiện trên giao diện

FE **kiểm trước để người dùng biết sớm**, backend **kiểm lại để đảm bảo đúng**. Mã BR-01…08 theo SRS v2; FR-35/BR-08 là phần bổ sung (hoàn cọc).

| Mã | Luật | Trên màn hình |
|---|---|---|
| BR-01 | Phòng chia theo giới tính tuyệt đối | Nộp đơn chỉ hiện phòng cùng giới; duyệt sang phòng khác giới bị chặn; sửa giới tính SV đang giữ giường bị chặn |
| BR-02 | Thu trọn gói 6 hoặc 12 tháng khi duyệt | Tổng tiền tính sẵn ở bước 3; duyệt sinh hóa đơn tiền phòng cả kỳ |
| BR-03 | 1 hóa đơn điện nước / phòng / tháng, một người nộp đại diện | Chốt & phát hành; ô Người nộp khi thu; "≈ … đ/người" chỉ để tham khảo |
| BR-04 | Còn hóa đơn `unpaid` (cá nhân hoặc của phòng) thì không thanh lý | Hộp thoại thanh lý liệt kê hóa đơn còn nợ |
| BR-05 | Khóa giường bằng lệnh nguyên tử | `409` → tải lại giường, chọn giường khác |
| BR-06 | Tài khoản cấp khi duyệt, MSSV/MSSV, buộc đổi lần đầu | Thông báo sau duyệt; điều hướng cưỡng bức; cấm mật khẩu mới trùng MSSV |
| BR-07 | Gợi ý tầng thấp → số phòng nhỏ | Thứ tự phòng ở bước 2, nhãn "Gợi ý" |
| BR-08 | Hoàn cọc sau thanh lý, xác nhận một chiều | Tab Chờ hoàn cọc, nút Xác nhận đã hoàn cọc |

Một số chú thích trong code còn dẫn mã BR-27…85 — đó là đánh số của tài liệu `03-PHAN-TICH-NGHIEP-VU.md` bản v1 (mật khẩu tạm, admin cuối cùng, chỉ số cũ tự điền), SRS v2 không đánh số lại các luật này.

---

## 11. Kiểm thử

| Loại | Công cụ | Phạm vi |
|---|---|---|
| Kiểm tra mã | `npm run lint` | 0 lỗi |
| Đóng gói | `npm run build` | Build được |
| Đầu-cuối | Puppeteer, chạy trên dữ liệu giả (kịch bản ngoài repo) | 12 bộ, **377 bước**: m1–m10 theo từng mốc, `review` (các lỗi đợt soát tổng), **m11 trọn vòng đời một hồ sơ qua 3 vai trò** |
| Tương phản / mẫu thiết kế | Bộ dò Impeccable trên `/login`, `/apply` | Không còn phát hiện |
| Nghiệm thu tay | `15-CHECKLIST-NGHIEM-THU-FE.md` mục 24–35 | Mỗi mốc một mục, ghi rõ tài khoản và dữ liệu để bấm |

Bốn điểm luôn kiểm ở mọi màn: trạng thái **trống**, **lỗi**, **đang tải**, và **màn 390px** (không cuộn ngang).

---

## 12. Quyết định đã chốt (không đề xuất lại nếu không có yêu cầu)

| # | Câu hỏi SRS bỏ ngỏ | Đã chọn | Phương án không chọn |
|---|---|---|---|
| D1 | Sinh viên xin trả phòng thế nào? | Không có thao tác online; đến văn phòng, cán bộ thanh lý | Nút "Xin trả phòng" + trường `checkoutRequestedAt` |
| D2 | Đơn bị từ chối mang trạng thái gì? | Thêm `rejected` | Dùng `terminated` + lý do |
| D3 | Chuông thông báo lấy dữ liệu đâu? | Suy ra từ hóa đơn điện nước chưa trả của phòng | Collection `notifications` |
| D4 | Đơn giá điện nước để đâu? | 2 ô ở đầu bảng chỉ số, lưu vào từng bản ghi | Collection `settings` + màn cấu hình |
| D5 | Ai là người nộp khi trả bằng VietQR? | Cán bộ chọn thành viên phòng khi xác nhận | SV tự bấm "Tôi đã chuyển khoản" |

**Mặc định đã áp dụng:**
- Admin làm được mọi nghiệp vụ (theo RBAC).
- Staff không xem doanh thu.
- Staff chỉ đặt lại mật khẩu cho sinh viên.
- Duyệt đơn và Hợp đồng là hai màn riêng, cùng gọi `/contracts`.
- Không có khái niệm "quá hạn" là trạng thái.
- Bảo trì ở cấp phòng, không ở cấp giường.
- Sinh viên cũ muốn ở tiếp thì nộp đơn mới sau khi thanh lý.

**Cố ý chưa làm:**
- Rời màn Chỉ số điện nước bằng menu khi còn số chưa lưu: không hỏi lại. Muốn hỏi thì cần `useBlocker`, tức phải chuyển cả app sang data router.
- Hàng trong bảng bấm được bằng chuột nhưng không Tab tới được. Mở chi tiết vẫn có link/nút riêng.
- Thanh Lưu/Chốt ở màn chỉ số trên điện thoại che khoảng 1/3 màn, vì nhập chỉ số là việc làm trên máy tính.

---

## 13. Số liệu nên nhớ

| Hạng mục | Số |
|---|---|
| Màn hình | **21** (6 chung/công khai · 11 quản trị · 4 cổng SV) |
| Nhóm chức năng (`src/features/`) | 11 |
| File mã nguồn `src/` (`.js`, `.jsx`) | 109 (~10.400 dòng) |
| Endpoint backend được gọi | **51** (v1: 82) |
| Vai trò | 3 |
| Khóa phân quyền | 12 |
| Tài khoản mẫu (dữ liệu giả) | 14 |
| Bộ kiểm thử tự động / số bước | 12 / 377 |

---

## 14. Câu hỏi hay gặp khi bảo vệ

**Phạm vi**
1. *Sao bỏ nhu yếu phẩm, gia hạn, VNPay so với bản đầu?* — SRS v2 của HaUI tinh gọn: chỉ giữ vòng đời lưu trú + tiền phòng + điện nước. Bản v1 đầy đủ vẫn giữ ở nhánh `backup/v1-full`.
2. *Sao sinh viên không tự đăng ký tài khoản?* — FR-02/BR-06: tài khoản chỉ sinh ra khi đơn được duyệt, tránh tài khoản rác và mạo danh MSSV.

**Kiến trúc và dữ liệu**
3. *Vì sao chia thư mục theo tính năng?* — Sửa một màn thì mọi thứ liên quan nằm một chỗ.
4. *Chưa có backend v2 thì làm sao code xong?* — Lớp dữ liệu giả đúng `API.md`, đổi sang backend thật bằng một biến môi trường (mục 8).
5. *Sao biết định dạng khớp backend?* — `API.md` là hợp đồng chung, có nhật ký phiên bản (đang 2.6); FE cần đổi gì thì sửa `API.md` trước.
6. *Xử lý lỗi API thế nào?* — Theo **mã lỗi** ổn định (`OUTSTANDING_INVOICES`, `BED_ALREADY_OCCUPIED`…), không so chuỗi tiếng Việt.

**Bảo mật**
7. *Phân quyền FE có an toàn không?* — Không; chỉ là trải nghiệm. Backend kiểm lại mọi endpoint.
8. *Giá tiền có bị sửa từ trình duyệt?* — Không. Form chỉ gửi mã phòng, số giường, gói; server tự đọc giá.
9. *Token để ở đâu?* — `localStorage`/`sessionStorage` tùy "Ghi nhớ". An toàn hơn là cookie `HttpOnly` — biết hạn chế và ghi lại.

**Nghiệp vụ**
10. *Hai người chọn cùng một giường thì sao?* — Lúc nộp: giường đã có đơn chờ hiện "Đã có người đăng ký", không chọn được; trùng trong lúc điền thì nhận `409` và chọn lại. Lúc duyệt: khóa giường nguyên tử (BR-05), người sau nhận `409`.
11. *Tiền điện nước tính sao?* — (số mới − số cũ) × đơn giá cho điện và nước, cộng lại thành **một hóa đơn của phòng**; mức "≈ … đ/người" chỉ để tham khảo, một bạn nộp đại diện.
12. *Sinh viên chuyển khoản thì hệ thống biết thế nào?* — Không tự biết (chưa có webhook ngân hàng). Cán bộ đối chiếu sao kê rồi bấm xác nhận VietQR, chọn người nộp (D5). Nội dung chuyển khoản có mã hóa đơn để dễ đối chiếu.
13. *Trả phòng thì tiền cọc xử lý ra sao?* — Phải hết nợ mới thanh lý (BR-04), nên hoàn đủ cọc tại văn phòng; cán bộ xác nhận một chiều (BR-08). Hư hỏng tài sản xử lý ngoài hệ thống.
14. *Muốn ở tiếp kỳ sau?* — Không có gia hạn: thanh lý rồi nộp đơn mới bằng MSSV cũ (tài khoản cũ được dùng lại).

**Chỗ khó**
15. *Màn nào khó nhất?* — Chỉ số điện nước. Đó là bảng lưới sửa trực tiếp nhiều phòng: phải giữ số đang gõ dở khi lưu một phần, khóa nút chốt khi còn thay đổi chưa lưu, và nhập Excel chỉ điền vào lưới chứ không lưu thẳng.
16. *Bug đáng nhớ?* — Hai lỗi.
    - Form Sửa sinh viên mở lần hai còn mang dữ liệu của sinh viên trước. Sửa bằng `resetFields()` trước khi đổ dữ liệu mới.
    - Giờ thu tiền ghi theo UTC, nên thu trước 7 giờ sáng bị lùi một ngày. Sửa bằng giờ địa phương có múi giờ.
17. *Làm sao biết mọi màn đều chạy?* — 377 bước kiểm thử tự động, gồm một bộ chạy trọn vòng đời qua 3 vai trò, cộng checklist bấm tay.

---

## 15. Đọc thêm

| Cần gì | Mở |
|---|---|
| Hợp đồng API v2 | `API.md` |
| Mô tả đề tài (bản nộp) | `MO-TA-DE-TAI.md` |
| Việc backend cần làm | `16-YEU-CAU-API-BACKEND.md` |
| Checklist bấm thử | `15-CHECKLIST-NGHIEM-THU-FE.md` mục 24–35 |
| Yêu cầu gốc v2 (SRS, schema) | repo backend: `docs/EDIT_DOCS_DAC_TA_YEU_CAU.md`, `docs/EDIT_DOCS_DATA_SCHEMA.md` |

---

## Lịch sử phiên bản

| Phiên bản | Ngày | Người | Nội dung |
|---|---|---|---|
| 2.0 | 10/11/2026 | FE Lead | Viết lại theo bản tinh gọn HaUI v2: 21 màn, 51 endpoint, 3 vai trò, quyết định D1–D5 |
| 1.0 | 16/09/2026 | FE Lead | Bản đầu — 31 màn của v1 (giữ ở nhánh `backup/v1-full`) |
