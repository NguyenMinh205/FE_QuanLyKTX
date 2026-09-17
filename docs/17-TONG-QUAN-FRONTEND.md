# 17 – TỔNG QUAN FRONTEND (tài liệu nắm project)

**Hệ thống:** DMS – Hệ thống quản lý ký túc xá
**Người đọc:** thành viên nhóm phụ trách Frontend — dùng để nắm toàn bộ phần FE và trả lời khi được hỏi
**Người lập:** FE Lead · **Ngày:** 16/09/2026 · **Trạng thái FE:** 31/31 màn đã code xong

> Tài liệu này **không thay** `08-THIET-KE-GIAO-DIEN.md` (thiết kế), `API.md` (hợp đồng dữ liệu) hay `02-DAC-TA-YEU-CAU.md` (đặc tả). Nó gom lại **những gì thực sự đã code** và giải thích *vì sao làm như vậy*.

---

## 1. Trả lời nhanh trong 60 giây

Mười câu này đủ dùng cho phần lớn câu hỏi mở đầu:

1. **Frontend là gì?** Ứng dụng React một trang (SPA) chạy trên trình duyệt, gồm **2 khu vực**: khu quản trị (`/admin/*`) cho nhân viên ký túc xá và cổng sinh viên (`/portal/*`).
2. **Bao nhiêu màn?** **31 màn** theo mã SCR trong tài liệu thiết kế, tương ứng **31 đường dẫn** khai báo ở [AppRoutes.jsx](src/routes/AppRoutes.jsx). Đã code xong 31/31.
3. **Công nghệ?** React 19 + Vite 8, thư viện giao diện **Ant Design 6**, định tuyến `react-router-dom` 7, gọi API bằng `axios`, ngày tháng bằng `dayjs`, biểu đồ bằng `recharts`. Không dùng Redux — trạng thái dùng chung chỉ có phiên đăng nhập, để trong React Context.
4. **Phân quyền thế nào?** 4 vai trò: `admin`, `staff`, `viewer`, `student`. Chặn ở 2 lớp: `RoleRoute` chặn theo đường dẫn, `can(user, 'action')` ẩn/hiện nút. **Đây chỉ là giao diện — backend vẫn phải kiểm tra lại.**
5. **Dữ liệu ở đâu ra?** Có **hai chế độ**: dữ liệu giả trong `src/mocks/` (mặc định) và backend thật, đổi bằng một biến môi trường `VITE_USE_MOCK`. Nhờ vậy FE làm xong trước khi BE xong mà vẫn demo được đủ luồng.
6. **Nghiệp vụ lõi?** Sinh viên **đăng ký theo phòng**, hệ thống **tự gán giường trống số nhỏ nhất** (BR-38) — không ai chọn giường. Duyệt đơn sinh ra lưu trú + hợp đồng + 2 hóa đơn (cọc, tiền phòng).
7. **Tiền bạc chạy sao?** Chỉ số điện nước → hóa đơn tháng (chia đều theo số người ở) → sinh viên thanh toán online hoặc nộp tại quầy → trả phòng thì quyết toán cọc trừ nợ.
8. **Số liệu quy mô?** 132 file mã nguồn trong `src/`, 14 nhóm chức năng, **82 endpoint** backend được gọi, 23 khóa phân quyền, 22 bộ kiểm thử tự động.
9. **Đã nối backend thật chưa?** Đã chạy được phần **xem dữ liệu** ở 7 nhóm màn (đăng nhập, dashboard, tòa nhà, loại phí, chỉ số, hóa đơn, thanh toán). Phần còn lại backend chưa có API — liệt kê đầy đủ trong `16-YEU-CAU-API-BACKEND.md`.
10. **Kiểm thử?** 22 kịch bản tự động chạy bằng Puppeteer, mỗi màn một kịch bản, cộng một bộ kiểm tra nhanh 50 điểm. Ngoài ra `15-CHECKLIST-NGHIEM-THU-FE.md` là bản checklist bấm tay để nghiệm thu.

---

## 2. Bộ công nghệ và lý do chọn

| Thư viện | Phiên bản | Dùng để làm gì | Vì sao chọn |
|---|---|---|---|
| React | 19 | Khung giao diện | Phổ biến nhất, nhiều tài liệu, cả nhóm đã biết |
| Vite | 8 | Chạy dev + đóng gói | Khởi động < 1 giây, thay đổi thấy ngay; không cấu hình phức tạp như Webpack |
| Ant Design | 6 | Bảng, form, modal, thông báo | Có sẵn ~60 thành phần chuẩn doanh nghiệp: bảng có phân trang/lọc, form có kiểm tra dữ liệu. Tự viết sẽ tốn cả tháng |
| react-router-dom | 7 | Định tuyến | Chuẩn de-facto cho SPA React |
| axios | 1.20 | Gọi HTTP | Có interceptor: gắn token và xử lý 401 ở **một chỗ** thay vì lặp ở 82 chỗ gọi API |
| dayjs | 1.11 | Ngày tháng | Nhẹ hơn moment ~10 lần, API giống hệt |
| recharts | 3 | Biểu đồ dashboard | Viết bằng React, khai báo bằng JSX thay vì thao tác DOM |

**Không dùng:** Redux / Zustand (trạng thái dùng chung chỉ có phiên đăng nhập → Context là đủ), TypeScript (nhóm chưa quen, thời gian ngắn — bù lại bằng JSDoc ở các hàm dùng chung), React Query (đã có hook `useApi` tự viết, đủ cho nhu cầu).

> **Câu hỏi hay gặp: "Sao không dùng Redux?"** → Redux giải quyết bài toán *nhiều màn cùng đọc/ghi một kho dữ liệu*. Ở đây mỗi màn tự gọi API của mình, dữ liệu không dùng chung; thứ duy nhất dùng chung là `user` đang đăng nhập. Thêm Redux chỉ làm tăng mã nguồn mà không giải quyết vấn đề nào.

---

## 3. Cấu trúc thư mục

Tổ chức theo **tính năng** (feature-based), không theo loại file. Muốn sửa màn hóa đơn thì mở đúng `src/features/fees/`, không phải lùng khắp `pages/`, `components/`, `services/`.

```
src/
├── main.jsx, App.jsx           Điểm khởi động, bọc AuthProvider + ConfigProvider (theme, tiếng Việt)
├── routes/
│   ├── AppRoutes.jsx           Khai báo toàn bộ 31 đường dẫn
│   ├── RoleRoute.jsx           Chặn đường dẫn theo vai trò (chưa đăng nhập → /login, sai vai → /403)
│   └── paths.js                Hằng đường dẫn, tránh gõ chuỗi lặp
├── layouts/
│   ├── AdminLayout.jsx         Khung khu quản trị: menu trái + thanh trên + breadcrumb
│   └── PortalLayout.jsx        Khung cổng sinh viên: menu ngang, đơn giản hơn
├── context/AuthProvider.jsx    Phiên đăng nhập: user, login, register, logout, updateUser
├── lib/
│   ├── axiosClient.js          Instance axios + interceptor token/401 + 3 hàm đọc lỗi
│   ├── authStorage.js          Nơi DUY NHẤT đọc/ghi token (local hoặc session storage)
│   ├── authApi.js              login / logout / me / register / đổi mật khẩu
│   └── env.js                  Đọc biến môi trường, quyết định dùng dữ liệu giả hay thật
├── hooks/
│   ├── useApi.js               Gọi API + 3 trạng thái tải/dữ liệu/lỗi (xem mục 7.3)
│   └── useDebounce.js          Trễ 400ms cho ô tìm kiếm, tránh gọi API mỗi lần gõ phím
├── components/                 8 thành phần dùng chung: PageHeader, DataTable, StatCard,
│                               StatusTag, MoneyText, EmptyState, ErrorBoundary, BrandLogo
├── constants/                  roles.js · statuses.js (nhãn + màu mọi trạng thái) · routes.js · app.js
├── utils/                      formatter.js (tiền, ngày, %, điện thoại) · permission.js (ma trận quyền)
├── mocks/                      mockDb.js (sinh dữ liệu) · mockApi.js (giả lập 82 endpoint) · mockHelpers.js
└── features/                   14 nhóm chức năng, mỗi nhóm có api/ pages/ components/ utils/
    ├── auth        applications   contracts    dashboard   fees
    ├── payments    portal         requests     residencies rooms
    └── students    supplies       users
```

**Quy ước trong mỗi feature:**

| Thư mục | Chứa gì | Ví dụ |
|---|---|---|
| `api/` | Toàn bộ lời gọi HTTP của feature, **một file duy nhất** | `fee.api.js` |
| `pages/` | Màn hình gắn với một đường dẫn | `InvoicesPage.jsx` |
| `components/` | Mảnh giao diện chỉ dùng trong feature đó | `RecordPaymentModal.jsx` |
| `utils/` | Hàm chuyển dữ liệu backend → dữ liệu hiển thị, **không có JSX** | `invoiceView.js` |

> **Vì sao tách `utils/*View.js`?** Backend trả dữ liệu thô (`status: 'partial'`, `amount: 243750`); màn hình cần nhãn, màu, tiền định dạng, cột bảng. Nhốt phần biến đổi này vào file riêng giúp file màn hình chỉ còn phần bố cục, và phần logic đó **kiểm thử được mà không cần dựng giao diện**.

---

## 4. Danh sách 31 màn

Ký hiệu vai trò: **A** = admin · **S** = staff (nhân viên) · **V** = viewer (chỉ xem) · **SV** = sinh viên.

### 4.1. Màn chung (5)

| SCR | Màn hình | Đường dẫn | Vai trò | File chính | API gọi |
|---|---|---|---|---|---|
| 01 | Đăng nhập | `/login` | Công khai | `features/auth/pages/LoginPage.jsx` | `POST /auth/login` |
| 02 | Đăng ký tài khoản sinh viên | `/register` | Công khai | `features/auth/pages/RegisterPage.jsx` | `POST /auth/register` |
| 03 | Đổi mật khẩu | `/admin/change-password`, `/portal/change-password` | Tất cả | `features/auth/pages/ChangePasswordPage.jsx` | `PATCH /auth/change-password` |
| 04 | Không có quyền | `/403` | Tất cả | `features/auth/pages/ForbiddenPage.jsx` | — |
| 05 | Không tìm thấy trang | `*` | Tất cả | `features/auth/pages/NotFoundPage.jsx` | — |

### 4.2. Khu quản trị (17)

| SCR | Màn hình | Đường dẫn | Vai trò | File chính | API gọi |
|---|---|---|---|---|---|
| 10 | Dashboard | `/admin/dashboard` | A S V | `features/dashboard/pages/DashboardPage.jsx`, `components/OccupancyChart.jsx` | `GET /dashboard/summary`, `/dashboard/occupancy`, `/contracts/expiring` |
| 11 | Quản lý sinh viên | `/admin/students` | A S V | `features/students/pages/StudentsPage.jsx`, `components/StudentFormModal.jsx` | `GET/POST/PUT /students`, `PATCH /students/:id/deactivate` |
| 21 | Tòa nhà | `/admin/buildings` | A S V | `features/rooms/pages/BuildingsPage.jsx`, `components/BuildingFormModal.jsx` | `GET/POST/PUT /buildings` |
| 22 | Loại phòng | `/admin/room-types` | A ghi · S V xem | `features/rooms/pages/RoomTypesPage.jsx`, `components/RoomTypeCard.jsx`, `RoomTypeFormDrawer.jsx` | `GET/POST/PUT /room-types` |
| 23 | Phòng — sơ đồ tầng | `/admin/rooms` | A S V | `features/rooms/pages/RoomsPage.jsx`, `components/FloorMap.jsx`, `RoomTile.jsx`, `RoomDetailPanel.jsx`, `RoomFormModal.jsx` | `GET /rooms`, `/rooms/:id`, `/buildings`, `/room-types`, `POST/PUT /rooms`, `PATCH /beds/:id/status` |
| 31 | Duyệt đơn đăng ký | `/admin/applications` | A S V | `features/applications/pages/ApplicationsPage.jsx`, `components/ApplicationDetail.jsx`, `BedPreview.jsx`, `CreateApplicationModal.jsx`, `RejectApplicationModal.jsx` | `GET /applications`, `/applications/:id`, `POST /applications`, `PATCH /applications/:id/approve` hoặc `/reject`, `GET /rooms/available`, `/students` |
| 32 | Hợp đồng | `/admin/contracts` | A S V | `features/contracts/pages/ContractsPage.jsx`, `components/ContractDetailDrawer.jsx`, `TerminateContractModal.jsx` | `GET /contracts`, `/contracts/:id`, `/contracts/expiring`, `PUT /contracts/:id`, `PATCH /contracts/:id/terminate` |
| 41 | Yêu cầu gia hạn / trả phòng | `/admin/requests` | A S V | `features/requests/pages/RequestsPage.jsx`, `components/RequestDetail.jsx`, `SettlementBreakdown.jsx`, `RejectRequestModal.jsx` | `GET /requests`, `/requests/:id`, `PATCH /requests/:id/approve` hoặc `/reject` |
| 51 | Nhập chỉ số điện nước | `/admin/utility-readings` | A S V | `features/fees/pages/UtilityReadingsPage.jsx`, `components/readings/MeterCell.jsx`, `ReadingShareCell.jsx`, `ReadingSaveBar.jsx` | `GET/POST/PUT /utility-readings`, `GET /rooms`, `/buildings`, `/fee-types` |
| 52 | Danh sách hóa đơn | `/admin/invoices` | A S V | `features/fees/pages/InvoicesPage.jsx` | `GET /invoices`, `/buildings` |
| 53 | Lập hóa đơn hàng loạt | *(modal trong SCR-52)* | A S | `features/fees/components/invoices/GenerateInvoicesModal.jsx` | `GET /invoices/generation-preview`, `POST /invoices/generate` |
| 54 | Chi tiết hóa đơn | `/admin/invoices/:id` | A S V | `features/fees/pages/InvoiceDetailPage.jsx` | `GET /invoices/:id`, `PATCH /invoices/:id/cancel` |
| 55 | Ghi nhận thanh toán | *(modal trong SCR-52/54)* | A S | `features/fees/components/invoices/RecordPaymentModal.jsx` | `POST /payments/offline` |
| 56 | Lịch sử thanh toán | `/admin/payments` | A S V | `features/payments/pages/PaymentsPage.jsx`, `components/PaymentDetailDrawer.jsx` | `GET /payments`, `POST /payments/:id/reconcile` |
| 71 | Nhu yếu phẩm (2 tab) | `/admin/supplies` | A S V | `features/supplies/pages/SuppliesPage.jsx`, `components/SupplyOrdersTab.jsx`, `SupplyItemsTab.jsx`, `SupplyOrderDrawer.jsx`, `SupplyItemFormModal.jsx`, `CancelOrderModal.jsx` | `GET /supply-orders`, `/supply-orders/:id`, `/supply-items`, `POST/PUT /supply-items`, `PATCH /supply-orders/:id/deliver` hoặc `/cancel` |
| 81 | Tài khoản | `/admin/users` | **A** | `features/users/pages/UsersPage.jsx`, `components/UserFormModal.jsx`, `TemporaryPasswordModal.jsx` | `GET/POST/PUT /users`, `PATCH /users/:id/status`, `POST /users/:id/reset-password`, `GET /students` |
| 82 | Danh mục loại phí | `/admin/fee-types` | **A** | `features/fees/pages/FeeTypesPage.jsx`, `components/FeeTypeFormModal.jsx` | `GET/POST/PUT /fee-types` |

### 4.3. Cổng sinh viên (9)

| SCR | Màn hình | Đường dẫn | File chính | API gọi |
|---|---|---|---|---|
| 61 | Trang chủ (3 trạng thái) | `/portal/home` | `features/portal/pages/PortalHomePage.jsx`, `components/home/ResidentHome.jsx`, `NoResidenceHome.jsx` | `GET /portal/my-residence`, `/portal/my-invoices`, `/portal/my-applications`, `/portal/profile`, `/portal/supply-items` |
| 62 | Đăng ký chỗ ở (3 bước) | `/portal/apply` | `features/portal/pages/ApplyPage.jsx`, `components/apply/RoomTypeStep.jsx`, `RoomStep.jsx`, `ConfirmStep.jsx` | `GET /room-types`, `/rooms/available`, `/portal/profile`, `POST /portal/my-applications` |
| 63 | Chỗ ở & hợp đồng | `/portal/my-residence` | `features/portal/pages/MyResidencePage.jsx` | `GET /portal/my-residence`, `/portal/my-contracts` |
| 64 | Hóa đơn của tôi | `/portal/my-invoices` | `features/portal/pages/MyInvoicesPage.jsx`, `components/invoices/MyInvoiceDetail.jsx` | `GET /portal/my-invoices`, `/portal/my-invoices/:id`, `POST /payments/online/checkout` |
| 65 | Kết quả thanh toán | `/portal/payment-result` | `features/portal/pages/PaymentResultPage.jsx` | `GET /portal/my-payments?transactionRef=` |
| 66 | Yêu cầu của tôi | `/portal/my-requests` | `features/portal/pages/MyRequestsPage.jsx`, `components/requests/CreateRequestModal.jsx` | `GET/POST /portal/my-requests`, `DELETE /portal/my-requests/:id`, `GET /portal/my-residence` |
| 67 | Mua sắm | `/portal/shop` | `features/portal/pages/ShopPage.jsx`, `components/shop/CartCard.jsx` | `GET /portal/supply-items`, `/portal/my-residence`, `POST /portal/my-supply-orders` |
| 68 | Đơn hàng của tôi | `/portal/my-orders` | `features/portal/pages/MyOrdersPage.jsx` | `GET /portal/my-supply-orders`, `PATCH /portal/my-supply-orders/:id/cancel` |
| 69 | Hồ sơ cá nhân (chỉ đọc) | `/portal/profile` | `features/portal/pages/ProfilePage.jsx` | `GET /portal/profile`, `/portal/my-residence` |

> **Vì sao sinh viên không sửa được hồ sơ?** Hồ sơ là dữ liệu hành chính do ban quản lý giữ (FR-86). Sinh viên muốn sửa thì báo văn phòng — tránh việc tự đổi tên/mã số làm lệch hợp đồng đã ký.

---

## 5. Logic triển khai — điểm cần giải thích được ở từng màn

Cột bên phải là **thứ đáng nói khi bị hỏi "màn này có gì khó?"**.

### 5.1. Đăng nhập, đăng ký, mật khẩu

| Màn | Điểm đáng nói |
|---|---|
| SCR-01 Đăng nhập | Ô **"Ghi nhớ đăng nhập"** quyết định lưu phiên ở `localStorage` (giữ 7 ngày theo hạn JWT) hay `sessionStorage` (đóng trình duyệt là mất). Toàn bộ việc đọc/ghi token gom vào `authStorage.js` — không nơi nào khác được đọc thẳng `localStorage`, nếu không sẽ bỏ sót phiên nằm ở `sessionStorage`. Đăng nhập bằng mật khẩu tạm (`mustChangePassword = true`) thì **bị đẩy cưỡng bức** sang màn đổi mật khẩu (BR-85). |
| SCR-02 Đăng ký | Tài khoản **gắn vào hồ sơ sinh viên ban quản lý đã có**, không tạo hồ sơ mới (FR-80/81). Ba lỗi đối chiếu hồ sơ (`STUDENT_NOT_FOUND`, `STUDENT_INFO_MISMATCH`, `STUDENT_ALREADY_HAS_ACCOUNT`) hiện **ngay dưới ô Mã số sinh viên** thay vì báo đỏ chung, để sinh viên biết phải sửa ô nào. Đăng ký xong backend trả luôn token → vào thẳng cổng, không bắt đăng nhập lại. |
| SCR-03 Đổi mật khẩu | Luật mật khẩu BR-81 (≥ 8 ký tự, có cả chữ và số) kiểm ở FE trước khi gửi. Đổi xong gọi `updateUser({ mustChangePassword: false })` để gỡ trạng thái ép đổi mà không phải đăng nhập lại. |

### 5.2. Cơ sở vật chất

| Màn | Điểm đáng nói |
|---|---|
| SCR-22 Loại phòng | Chỉ **admin** sửa được, vì loại phòng giữ **giá thuê và tiền cọc** — đây là quyết định tài chính (khóa quyền `roomType:manage`). Staff/viewer vẫn xem để tra cứu. |
| SCR-23 Phòng | Hiển thị **sơ đồ tầng**: mỗi phòng là một ô, màu theo tỷ lệ lấp đầy (trống / còn chỗ / đầy / bảo trì); chọn ô thì mở bảng chi tiết bên phải kèm danh sách giường. Giường **không tạo tay** — tạo phòng là hệ thống tự sinh đủ số giường theo sức chứa của loại phòng. Thao tác duy nhất trên giường là bật/tắt **bảo trì**. |

### 5.3. Đăng ký ở → hợp đồng

| Màn | Điểm đáng nói |
|---|---|
| SCR-31 Duyệt đơn | Bố cục **hai cột**: trái danh sách đơn, phải chi tiết. Trước khi duyệt, khung xem trước cho thấy đúng giường sẽ được gán = **giường trống số nhỏ nhất trong phòng** (BR-38) — nhân viên không chọn giường, tránh cãi nhau về chỗ đẹp. Nếu trong lúc đang xem có người khác duyệt trước làm hết chỗ, backend trả `ROOM_FULL` và màn hình hiện hướng dẫn đổi phòng thay vì báo lỗi kỹ thuật. Duyệt một đơn là sinh ra **lưu trú + hợp đồng + 2 hóa đơn** (cọc, tiền phòng kỳ đầu). |
| SCR-32 Hợp đồng | Có tab **"Sắp hết hạn"** dùng chung nguồn dữ liệu với thẻ cảnh báo ở dashboard (≤ 30 ngày, BR-29). Chấm dứt hợp đồng phải nhập lý do; hợp đồng đã chấm dứt thì khóa mọi nút. |
| SCR-41 Yêu cầu | Hai loại yêu cầu dùng chung một màn: **gia hạn** và **trả phòng**. Với trả phòng, khối **Quyết toán** tính sẵn: tiền cọc − nợ còn lại + hoàn tiền phòng những ngày chưa ở (BR-31, BR-75/76/77); ra số dương thì hoàn cho sinh viên, số âm thì sinh viên nộp thêm. Duyệt xong hệ thống **hủy các đơn nhu yếu phẩm chưa thanh toán** của sinh viên đó (BR-97). |

### 5.4. Tiền: chỉ số → hóa đơn → thanh toán

| Màn | Điểm đáng nói |
|---|---|
| SCR-51 Chỉ số điện nước | Làm giống **bảng tính**: mỗi dòng một phòng, cột chỉ số cũ (khóa, lấy từ kỳ trước), cột chỉ số mới (nhập), cột tiêu thụ và thành tiền **tự tính ngay khi gõ**, cột chia đều hiển thị "N người → x đ/người". Thanh lưu ở cuối đếm "đang sửa N phòng" và chỉ gửi những dòng có thay đổi. Chỉ số mới nhỏ hơn chỉ số cũ thì báo đỏ tại chỗ, không cho lưu (BR-50). Phòng đã lập hóa đơn tháng đó thì khóa, không cho sửa (BR-53). |
| SCR-52/53 Hóa đơn | Bốn thẻ tổng (phải thu / đã thu / còn nợ / quá hạn) lấy từ `summary` do backend trả — **không tự cộng ở FE** vì danh sách chỉ có một trang. Modal lập hàng loạt gọi **`GET /invoices/generation-preview`** (một endpoint chỉ đọc) để xem trước số hóa đơn và tổng tiền; nút xác nhận bị khóa đến khi tích ô "Tôi đã kiểm tra chỉ số điện nước". Phòng chưa có chỉ số được liệt kê kèm link "Nhập ngay". |
| SCR-54 Chi tiết hóa đơn | Ba thẻ tổng / đã trả / còn lại, bảng dòng phí (dòng điện nước ghi rõ "chia đều N người"), và **dòng thời gian lịch sử thanh toán**. Nút "Hủy hóa đơn" bị **vô hiệu hóa kèm tooltip giải thích** khi hóa đơn đã có thanh toán thành công (BR-46) — vô hiệu hóa kèm lý do tốt hơn là cho bấm rồi mới báo lỗi. |
| SCR-55 Ghi nhận thanh toán | Số tiền mặc định = số còn lại. Nhập vượt số còn lại → lỗi đỏ ngay dưới ô **và khóa nút** (BR-44). Chọn hình thức "Chuyển khoản" thì **bắt buộc nhập mã giao dịch** để đối chiếu sao kê. Nút ghi rõ số tiền: "Xác nhận thu 243.750 đ" — chống bấm nhầm. |
| SCR-56 Lịch sử thanh toán | Lọc theo khoảng ngày, hình thức, trạng thái. Giao dịch online treo ở `pending` có nút **"Đối soát"** hỏi lại cổng thanh toán; quá 15 phút không có kết quả thì chuyển `expired` (BR-64). |

### 5.5. Nhu yếu phẩm

| Màn | Điểm đáng nói |
|---|---|
| SCR-71 Quản trị (2 tab) | Tab **Đơn hàng**: 6 thẻ đếm theo trạng thái; nút "Giao hàng" chỉ bật khi **hóa đơn của đơn đã thanh toán** (BR-95) — chưa trả tiền thì không được nhận hàng. Hủy đơn bắt buộc nhập lý do ≥ 5 ký tự và hủy luôn hóa đơn kèm theo. Tab **Danh mục**: thêm/sửa sản phẩm; ngừng bán thay vì xóa, để giữ lịch sử đơn cũ. |
| SCR-67 Mua sắm (SV) | Cửa hàng **ẩn sẵn những món loại phòng đã được cấp** (phòng có điều hòa thì không bán quạt) và món ngừng bán. Giỏ hàng giữ trong `sessionStorage` — **không có API giỏ hàng**, giỏ chỉ sống trong phiên làm việc. Mỗi món 1–5 cái (BR-91). Tổng tiền ở FE **chỉ để xem**; khi đặt hàng FE chỉ gửi `{ mã sản phẩm, số lượng }` và **server tự tính tiền theo giá hiện hành** (BR-92) — không bao giờ tin giá do trình duyệt gửi lên. |
| SCR-68 Đơn của tôi | Sinh viên tự hủy được đơn khi chưa thanh toán; đơn đã trả tiền thì chỉ chờ nhận hàng. |

### 5.6. Cổng sinh viên

| Màn | Điểm đáng nói |
|---|---|
| SCR-61 Trang chủ | **Ba trạng thái khác hẳn nhau** trong cùng một đường dẫn: (1) chưa có chỗ ở và chưa nộp đơn → nút lớn "Đăng ký chỗ ở"; (2) đã nộp đơn, đang chờ duyệt → thẻ theo dõi đơn, cho phép hủy; (3) đang ở → phòng, hợp đồng, hóa đơn cần thanh toán, cảnh báo hợp đồng sắp hết hạn. Việc chọn trạng thái nằm ở `utils/homeView.js` để file màn hình không phải gánh chuỗi `if` lồng nhau. |
| SCR-62 Đăng ký chỗ ở | Ba bước: **chọn loại phòng → chọn phòng còn chỗ → xác nhận**. Danh sách phòng đã lọc sẵn theo **giới tính** của sinh viên; **không có bước chọn giường** (BR-38). Bước xác nhận cho xem trước tiền cọc + tiền phòng kỳ đầu để sinh viên biết phải nộp bao nhiêu. |
| SCR-64 Hóa đơn của tôi | Danh sách và chi tiết **nằm cùng một màn** (trái/phải) vì sinh viên thường chỉ có vài hóa đơn. Bấm "Thanh toán" là chuyển hẳn sang trang của cổng thanh toán. |
| SCR-65 Kết quả thanh toán | Màn khó nhất của cổng SV: khi sinh viên quay về, **webhook của cổng có thể chưa kịp về backend**. Màn hình hiện "Đang kiểm tra giao dịch" và hỏi lại tối đa **5 lần, cách nhau 2 giây**. Nguyên tắc: **chưa biết kết quả thì không bao giờ báo thất bại** — báo nhầm "thất bại" trong khi tiền đã trừ là lỗi nghiêm trọng nhất có thể mắc. Hết 5 lần vẫn chưa rõ thì hiện "Giao dịch đang được xử lý, xem lại sau ít phút". |
| SCR-66 Yêu cầu của tôi | Sinh viên gửi yêu cầu **gia hạn** hoặc **trả phòng**; ngày gia hạn mặc định tính sẵn theo BR-72. Yêu cầu còn chờ duyệt thì tự hủy được, đã duyệt thì không. |

---

## 6. Các luồng chạy chính

Sáu luồng dưới đây là "xương sống" — nắm được sáu luồng này là trả lời được hầu hết câu hỏi nghiệp vụ.

### 6.1. Đăng nhập và phân quyền

```
Người dùng nhập email + mật khẩu
   |
   +- POST /auth/login  ->  { token, user{ role, mustChangePassword } }
        |
        +- authStorage.save(token, user, remember)   <- localStorage hay sessionStorage
        +- mustChangePassword = true -> ép sang /.../change-password  (BR-85)
        +- ngược lại: role = student -> /portal/home
                      role khác      -> /admin/dashboard

Mọi request sau đó:
   axios tự gắn  Authorization: Bearer <token>
   backend trả 401 -> xóa phiên, quay về /login
   (token hạn 7 ngày, phiên bản 1 không có refresh token)
```

### 6.2. Sinh viên vào ở — luồng dài nhất, đi qua 5 màn

```
SCR-02  Sinh viên đăng ký tài khoản         -> khớp hồ sơ ban quản lý đã có
SCR-61  Trang chủ: "Chưa có chỗ ở"          -> bấm Đăng ký chỗ ở
SCR-62  Chọn loại phòng -> chọn phòng -> xác nhận
            POST /portal/my-applications     (chỉ gửi roomId, KHÔNG gửi bedId)
SCR-31  Nhân viên mở đơn, xem trước giường sẽ gán (giường trống nhỏ nhất - BR-38)
            PATCH /applications/:id/approve
               +- gán giường (nguyên tử: hai người duyệt cùng lúc thì người sau nhận ROOM_FULL)
               +- tạo lưu trú (đang ở)
               +- tạo hợp đồng (đang hiệu lực)
               +- tạo 2 hóa đơn: tiền cọc + tiền phòng tháng đầu (thu đủ một tháng - BR-32)
SCR-61  Trang chủ sinh viên đổi sang trạng thái "Đang ở" + hiện 2 hóa đơn cần thanh toán
```

### 6.3. Chốt tiền hàng tháng

```
Đầu tháng:
SCR-51  Nhân viên nhập chỉ số điện nước từng phòng
            (chỉ số mới - chỉ số cũ) x đơn giá = tiền điện nước của phòng
            chia đều cho số người đang ở (BR-52)
SCR-53  Lập hóa đơn hàng loạt cho tháng
            GET  /invoices/generation-preview   <- xem trước, KHÔNG ghi gì
            POST /invoices/generate             <- chốt
            mỗi sinh viên: 1 hóa đơn gồm tiền phòng + phần điện nước của mình
            sinh viên đã có hóa đơn tháng đó -> cộng thêm dòng vào hóa đơn cũ (BR-48)
SCR-64  Sinh viên thấy hóa đơn trong cổng và thanh toán
```

### 6.4. Thanh toán — hai đường

```
(a) Online — sinh viên tự trả
SCR-64  Bấm "Thanh toán"
   +- POST /payments/online/checkout -> { redirectUrl, transactionRef }
        FE nhớ transactionRef rồi chuyển hẳn sang trang cổng thanh toán
        -- sinh viên trả tiền --
        cổng gọi webhook về backend        (có thể chậm vài giây)
        cổng chuyển trình duyệt về /portal/payment-result
SCR-65  GET /portal/my-payments?transactionRef=...   (tối đa 5 lần, cách 2 giây)
           success  -> tích xanh + số tiền + mã giao dịch + mã hóa đơn
           failed   -> dấu X + "Bạn chưa bị trừ tiền" + nút Thử lại
           chưa rõ  -> "Đang xử lý"  (KHÔNG báo thất bại)

(b) Tại quầy — nhân viên thu hộ
SCR-52 hoặc SCR-54  bấm "Thu tiền" -> mở SCR-55
   +- POST /payments/offline { invoiceId, amount, method, paidAt, bankReference? }
        amount <= số còn lại (BR-44) · chuyển khoản thì bắt buộc mã giao dịch
        backend cộng dồn các thanh toán thành công -> cập nhật trạng thái hóa đơn (BR-43)
```

### 6.5. Mua nhu yếu phẩm

```
SCR-67  Sinh viên chọn món (1-5 cái mỗi loại - BR-91), giỏ hàng nằm trong sessionStorage
   +- POST /portal/my-supply-orders  [{ supplyItemId, quantity }]   <- KHÔNG gửi giá
        backend tính tiền theo giá hiện hành (BR-92), tạo 1 hóa đơn loại "nhu yếu phẩm"
SCR-64  Sinh viên thanh toán hóa đơn đó
SCR-71  Hóa đơn chuyển "đã thanh toán" -> đơn hàng mới bật nút "Giao hàng" (BR-95)
        Nhân viên giao tại văn phòng -> đơn chuyển "đã giao"
```

### 6.6. Trả phòng và quyết toán cọc

```
SCR-66  Sinh viên gửi yêu cầu trả phòng (chọn ngày dự kiến trả)
SCR-41  Nhân viên mở yêu cầu, xem khối Quyết toán tính sẵn:

              tiền cọc
            - các hóa đơn còn nợ
            + hoàn tiền phòng những ngày chưa ở  (tính theo ngày - BR-75/76/77)
            ------------------------------------
            = số dương -> hoàn cho sinh viên
              số âm    -> sinh viên nộp thêm

        PATCH /requests/:id/approve
            +- tạo hóa đơn quyết toán
            +- hủy các đơn nhu yếu phẩm chưa thanh toán (BR-97)
            +- đóng lưu trú, chấm dứt hợp đồng
            +- trả giường về trạng thái trống -> phòng lại nhận được đơn đăng ký mới
```

---

## 7. Cơ chế dùng chung — phần "khung xương" của FE

### 7.1. Phiên đăng nhập

- `AuthProvider` bọc toàn ứng dụng, giữ đúng **một** trạng thái dùng chung: `user`.
- Cung cấp `login`, `register`, `logout`, `updateUser`, `isAuthenticated`.
- Phiên lưu ở `localStorage` hoặc `sessionStorage` tùy ô "Ghi nhớ đăng nhập"; **mọi** thao tác đọc/ghi đi qua `lib/authStorage.js`.
- Phiên hỏng hoặc từ phiên bản cũ (ví dụ vai trò viết hoa `ADMIN`) bị **xóa ngay khi khởi động** — nếu không, người dùng kẹt ở trang 403 mà không có nút đăng xuất.

### 7.2. Gọi API

`lib/axiosClient.js` là **cửa duy nhất** ra backend:

| Việc | Cách làm | Vì sao gom một chỗ |
|---|---|---|
| Gắn token | Interceptor request thêm `Authorization: Bearer …` | 82 chỗ gọi API không phải tự nhớ |
| Token hết hạn | Interceptor response: gặp `401` → xóa phiên, chuyển `/login` | Xử lý ở một chỗ, không lặp `if (err.status === 401)` khắp nơi |
| Đọc lỗi | `getErrorMessage` (câu tiếng Việt), `getErrorCode` (mã ổn định như `ROOM_FULL`), `getFieldErrors` (lỗi từng ô để đổ vào form antd) | Màn hình xử lý theo **mã lỗi**, không so sánh chuỗi tiếng Việt |
| Mất mạng | `ERR_NETWORK` → "Không kết nối được máy chủ" | Người dùng hiểu được, không thấy "Network Error" |

**Quy ước envelope** (thống nhất với backend, `API.md` mục 1.1):

```
{ "code": "OK", "message": "…", "data": … }           ← chi tiết: data là object
{ "code": "OK", "data": { "items": [...], "total": 120, "page": 1, "limit": 20 } }   ← danh sách
```

### 7.3. Hook `useApi` — trái tim của mọi màn danh sách

```js
const { data, meta, loading, error, refetch } = useApi(
  () => invoiceApi.getList(filters),
  [filters],
);
```

Bốn điều hook này lo hộ:

1. **Ba trạng thái** đang tải / có dữ liệu / lỗi — màn hình chỉ việc `if (loading) … if (error) …`.
2. **So sánh phụ thuộc bằng nội dung** (`JSON.stringify(deps)`) chứ không bằng tham chiếu — nhờ vậy truyền thẳng object `filters` mà không bị gọi API vô hạn. Đây là lỗi kinh điển của `useEffect` và được xử lý một lần ở đây.
3. **Tự tách danh sách và phân trang**: `data` là mảng `items`, `meta` giữ `total`, `page`, `limit` và cả trường phụ như `summary`.
4. **Hủy kết quả cũ**: đổi bộ lọc liên tục thì phản hồi về muộn của lần gọi cũ bị bỏ, không ghi đè dữ liệu mới.

> ⚠️ **Bẫy cần nhớ:** hook coi **mọi phản hồi có mảng `items` là danh sách phân trang**. Backend hiện trả chi tiết hóa đơn kèm trường `items` (tên cũ của `lineItems`) nên chi tiết hóa đơn từng hiện trắng trang. Đã xử lý bằng cách bỏ hẳn trường `items` trong hàm `normalizeInvoice`.

### 7.4. Phân quyền — hai lớp

```
Lớp 1 — đường dẫn:  RoleRoute allowed={[...]}   chưa đăng nhập → /login · sai vai trò → /403
Lớp 2 — nút bấm:    can(user, 'invoice:cancel') → ẩn/vô hiệu hóa nút
```

`utils/permission.js` giữ ma trận **23 khóa quyền**, ví dụ `student:create`, `invoice:cancel`, `payment:record`, `roomType:manage` (chỉ admin), `user:manage` (chỉ admin), `feeType:manage` (chỉ admin).

> **Câu hỏi hay gặp: "Phân quyền ở FE có an toàn không?"** → **Không, và không được coi là biện pháp bảo mật.** Người dùng sửa được mọi thứ trong trình duyệt. Đây chỉ là trải nghiệm: không hiện nút mà bấm vào sẽ bị từ chối. **Backend bắt buộc kiểm tra lại quyền ở mọi endpoint** — ghi rõ trong `07-PHAN-QUYEN-BAO-MAT.md`.

### 7.5. Trạng thái và định dạng

- `constants/statuses.js` là **nguồn duy nhất** định nghĩa nhãn tiếng Việt + màu cho mọi trạng thái (đơn, hợp đồng, lưu trú, hóa đơn, thanh toán, yêu cầu, đơn hàng, phòng, giường). Không nơi nào được viết chuỗi `'Đã thanh toán'` trực tiếp. Muốn đổi nhãn thì sửa một chỗ.
- `utils/formatter.js`: `formatCurrency` (243.750 đ), `formatDate` (DD/MM/YYYY), `formatDateTime`, `formatPeriod` ("Tháng 9/2026"), `formatPhone`, `formatPercent`. Giá trị rỗng luôn hiện `—` thay vì "null" hay ô trắng.
- Thành phần dùng chung: `PageHeader` (tiêu đề + nút chính), `DataTable` (bảng có phân trang chuẩn), `StatCard` (thẻ chỉ số), `StatusTag` (tag màu theo trạng thái), `MoneyText`, `EmptyState`, `ErrorBoundary` (màn trắng do lỗi JS được thay bằng thông báo và nút tải lại).

---

## 8. Lớp dữ liệu giả — vì sao có và hoạt động ra sao

**Vấn đề:** backend làm song song và chậm hơn; nếu FE chờ API mới code được thì cả hai cùng đứng.

**Cách giải:** `src/mocks/` giả lập **toàn bộ 82 endpoint**, trả **đúng** định dạng ghi trong `API.md`. Mỗi file `*.api.js` có dạng:

```js
getList: (params) => (USE_MOCK ? mockFees.getInvoices(params) : axiosClient.get('/invoices', { params })),
```

Chuyển chế độ bằng một biến môi trường, **không sửa một dòng mã màn hình nào**:

```bash
VITE_USE_MOCK=true    # dữ liệu giả (mặc định)
VITE_USE_MOCK=false   # gọi backend thật tại VITE_API_BASE_URL
```

Dữ liệu giả không phải vài dòng cho có — `mockDb.js` **dựng cả một ký túc xá thu nhỏ**: 6 loại phòng, 3 tòa nhà (một tòa đang cải tạo để thử trạng thái ngừng hoạt động), 20 phòng với giường sinh tự động, 90 sinh viên, 70 người đã được xếp chỗ, kèm hợp đồng, chỉ số điện nước, hóa đơn, thanh toán và đơn hàng. `mockApi.js` **thực thi cả luật nghiệp vụ**: gán giường nhỏ nhất, báo `ROOM_FULL`, tính tiền theo ngày, cộng dồn thanh toán, chặn hủy hóa đơn đã trả tiền.

Có cả những tình huống khó dựng bằng tay được cài sẵn để demo:

| Tình huống cài sẵn | Dùng để làm gì |
|---|---|
| Một phòng nữ đã đầy nhưng vẫn còn đơn chờ | Xem lỗi `ROOM_FULL` và hướng dẫn đổi phòng |
| Một phòng "tranh chỗ" — hai đơn, một chỗ trống | Xem tình huống hai nhân viên duyệt cùng lúc |
| Thanh toán online trả kết quả sau 5 giây | Xem màn "Đang kiểm tra giao dịch" của SCR-65 |
| Hợp đồng còn 12 ngày | Xem cảnh báo sắp hết hạn (BR-29) |
| 13 tài khoản mẫu (`admin`, `staff`, `viewer`, `sv001`–`sv007`, …) | Mỗi vai trò một trải nghiệm khác nhau |

> **Giới hạn phải nói rõ khi demo:** dữ liệu giả nằm trong bộ nhớ trình duyệt. Tải lại trang là **về trạng thái ban đầu** (trừ hai thứ cố ý giữ lại: giao dịch online đang chờ và tài khoản vừa đăng ký, để demo được luồng quay về từ cổng thanh toán).

---

## 9. Nối với backend thật

### 9.1. Cách chạy

```bash
# Backend (repo riêng) chạy ở cổng 5000
# Frontend phải chạy đúng cổng 5173 vì backend chỉ cho phép CORS từ địa chỉ này
VITE_USE_MOCK=false VITE_API_BASE_URL=http://localhost:5000/api npm run dev -- --port 5173
```

### 9.2. Hiện trạng (16/09/2026)

| Nhóm màn | Với backend thật |
|---|---|
| Đăng nhập, Dashboard, Tòa nhà, Loại phí, Chỉ số điện nước, Hóa đơn (danh sách + chi tiết), Thanh toán | ✅ **xem được dữ liệu thật** |
| Loại phòng, Phòng, Đơn đăng ký, Hợp đồng, Yêu cầu, Tài khoản, Nhu yếu phẩm, toàn bộ cổng sinh viên | ❌ backend chưa có API — màn hiện đúng trạng thái lỗi/trống, không vỡ giao diện |

Toàn bộ khác biệt và việc backend cần làm nằm ở **`16-YEU-CAU-API-BACKEND.md`**: 82 endpoint FE gọi, trong đó **10 dùng được ngay, 41 có nhưng lệch, 34 chưa có**.

### 9.3. Lớp chuyển đổi dữ liệu (adapter)

Backend đang chạy theo API **v1.1**, FE làm theo **v1.2**. Thay vì sửa mã 31 màn để chiều một bản API sẽ phải đổi, FE đặt **hàm chuẩn hóa ở tầng đọc dữ liệu**:

| Hàm | Ở đâu | Xử lý gì |
|---|---|---|
| `normalizeSummary` | `dashboard.api.js` | Đổi tên trường của dashboard, tính lại tỷ lệ lấp đầy |
| `normalizeFeeType` | `fee.api.js` | `amount` → `defaultAmount`, mã phí viết hoa → viết thường |
| `normalizeReading` | `fee.api.js` | Gỡ populate `roomId`, bù trường tiêu thụ/thành tiền |
| `normalizeInvoice` | `fee.api.js` | **Bỏ trường `items` cũ** (xem bẫy ở mục 7.3), đổi `items` → `lineItems` |
| `normalizePayment` | `payment.api.js` | Trường phẳng, sinh mã giao dịch khi backend không trả |
| `normalizeRoom`, `normalizeOrder` | `room.api.js`, `supply.api.js` | Bù trường v1.2 còn thiếu |

> **Giá trị của cách làm này:** khi backend sửa xong, phần lớn adapter **xóa đi là chạy** — không phải đụng vào màn hình.

### 9.4. Một quyết định đáng kể: endpoint xem trước chỉ đọc

Màn **Lập hóa đơn hàng loạt** (SCR-53) cần xem trước "sẽ tạo bao nhiêu hóa đơn, tổng bao nhiêu tiền". Cách thường thấy là gọi `POST /invoices/generate` kèm cờ `dryRun: true`. Nhưng **nếu backend quên xử lý cờ đó, chỉ mở modal xem thử là đã tạo thật hàng trăm hóa đơn trên cơ sở dữ liệu**.

Vì vậy FE tách hẳn thành **`GET /invoices/generation-preview`**: đã là `GET` thì dù backend có làm sai cũng không ghi được gì. Đây là ví dụ điển hình của **thiết kế an toàn theo mặc định** — nên dùng để trả lời câu hỏi "có quyết định kỹ thuật nào em tự đưa ra không?".

---

## 10. Quy tắc nghiệp vụ được thực thi ở FE

FE **kiểm tra trước để người dùng biết sớm**, backend **kiểm tra lại để đảm bảo đúng**. Danh sách đầy đủ ở `03-PHAN-TICH-NGHIEP-VU.md`; dưới đây là những luật nhìn thấy được trên giao diện.

| Mã | Luật | Thể hiện trên màn hình |
|---|---|---|
| BR-05 | Chỗ trống = số giường `available`, không phải sức chứa trừ số người | Ô phòng trên sơ đồ tầng, danh sách phòng ở màn đăng ký |
| BR-22 | Thời hạn tối thiểu 1 tháng, ngày kết thúc sau ngày bắt đầu | Ô chọn ngày ở đơn đăng ký |
| BR-27 | Giá thuê và cọc **chốt tại thời điểm duyệt đơn** | Đổi giá loại phòng không làm đổi hợp đồng cũ |
| BR-29 | Hợp đồng sắp hết hạn = còn ≤ 30 ngày | Thẻ cảnh báo ở dashboard + tab ở màn hợp đồng |
| BR-31 | Tiền phòng **kỳ cuối** (trả phòng sớm) tính **theo ngày ở thực tế** | Khối quyết toán ở màn Yêu cầu |
| BR-32 | Tiền phòng **tháng đầu thu đủ một tháng**, kể cả khi vào ở giữa tháng (cố ý bất đối xứng với BR-31) | Bước xác nhận đăng ký |
| BR-38 | Gán **giường trống số nhỏ nhất**, người dùng không chọn giường | Khung xem trước giường ở màn duyệt đơn |
| BR-43 | Số đã trả = tổng các thanh toán **thành công** | Ba thẻ ở chi tiết hóa đơn |
| BR-44 | Thanh toán không vượt quá số còn lại | Lỗi đỏ + khóa nút ngay khi gõ số tiền |
| BR-46 | Hóa đơn đã có thanh toán thành công thì không hủy được | Nút "Hủy hóa đơn" mờ kèm tooltip giải thích |
| BR-48 | Sinh viên đã có hóa đơn tháng đó thì **cộng dòng vào hóa đơn cũ** | Ghi rõ trong khung xem trước lập hàng loạt |
| BR-50 | Chỉ số mới ≥ chỉ số cũ | Ô nhập báo đỏ tại chỗ, chặn lưu |
| BR-52 | Tiền điện nước chia đều cho số người đang ở | Cột "chia đều N người" ở màn chỉ số và dòng phí hóa đơn |
| BR-53 | Đã lập hóa đơn thì khóa chỉ số tháng đó | Dòng bị khóa kèm lý do |
| BR-64 | Giao dịch online quá 15 phút → hết hạn | Nút "Đối soát" ở lịch sử thanh toán |
| BR-72 | Ngày gia hạn mặc định tính từ ngày kết thúc hợp đồng | Điền sẵn trong modal gửi yêu cầu |
| BR-75/76/77 | Quyết toán = cọc − nợ + hoàn tiền phòng chưa ở | Khối Quyết toán ở màn yêu cầu |
| BR-79 | Sinh viên chỉ hủy được yêu cầu của mình, khi còn chờ duyệt | Nút hủy chỉ hiện với yêu cầu `pending` |
| BR-81 | Mật khẩu ≥ 8 ký tự, có cả chữ và số | Màn đổi mật khẩu, màn đăng ký |
| BR-83 | Không được vô hiệu hóa admin cuối cùng | Nút khóa tài khoản bị chặn kèm giải thích |
| BR-85 | Mật khẩu tạm → ép đổi trước khi làm việc | Điều hướng cưỡng bức sau đăng nhập |
| BR-91 | Mỗi sản phẩm 1–5 cái | Bộ tăng/giảm số lượng ở cửa hàng |
| BR-92 | **Giá do server quyết**, FE chỉ gửi mã + số lượng | Đơn hàng nhu yếu phẩm |
| BR-95 | Chưa thanh toán thì chưa được nhận hàng | Nút "Giao hàng" chỉ bật khi hóa đơn đã trả |
| BR-97 | Trả phòng thì hủy đơn nhu yếu phẩm chưa trả tiền | Cảnh báo trong khối quyết toán |

---

## 11. Kiểm thử

| Loại | Công cụ | Phạm vi |
|---|---|---|
| Kiểm tra mã nguồn | ESLint (`npm run lint`) | 0 lỗi, 0 cảnh báo trước mỗi lần commit |
| Đóng gói | `npm run build` | Phải build được, không lỗi |
| Kiểm thử đầu-cuối | Puppeteer (kịch bản riêng ngoài repo) | **22 bộ**, mỗi màn một bộ: đăng nhập theo từng vai trò, thao tác, kiểm tra nội dung hiện đúng |
| Kiểm tra nhanh | Bộ 50 điểm | Chạy lại sau mỗi thay đổi lớn để phát hiện hỏng dây chuyền |
| Chụp màn hình đối chiếu | Puppeteer | So với bản thiết kế trong `design/` |
| Với backend thật | Puppeteer, **chỉ đọc** | Xác nhận màn nào đã nối được; **không tạo/sửa/xóa** trên cơ sở dữ liệu dùng chung |
| Nghiệm thu thủ công | `15-CHECKLIST-NGHIEM-THU-FE.md` | 23 mục, mỗi mục một màn, ghi rõ tài khoản + dữ liệu để bấm thử |

Bốn điểm luôn kiểm ở mọi màn: **trạng thái trống** (chưa có dữ liệu), **trạng thái lỗi** (API hỏng), **trạng thái đang tải**, và **màn hình hẹp 400px** (không cuộn ngang).

---

## 12. Lệch so với bản thiết kế — và lý do

| Chỗ lệch | Lý do |
|---|---|
| Không có màn "Tra cứu giường trống", "Tạo hợp đồng thủ công", "Báo cáo", "Cấu hình" | Bản `14-PHIEN-BAN-DON-GIAN-HOA.md` đã bỏ để kịp tiến độ; giường tự gán nên hai màn đầu vô nghĩa |
| SCR-53 và SCR-55 là **modal**, không phải trang riêng | Thiết kế ghi rõ; đỡ một lần chuyển trang giữa lúc đang thao tác tiền bạc |
| SCR-64 gộp danh sách + chi tiết trên một màn | Sinh viên thường chỉ có 2–5 hóa đơn, tách trang là thừa |
| Xem trước lập hóa đơn dùng `GET` riêng thay vì `POST … dryRun` | An toàn dữ liệu — xem mục 9.4 |
| Giỏ hàng lưu ở trình duyệt, không có API | Không có endpoint giỏ hàng trong `API.md`; giỏ chỉ cần sống trong phiên |
| Một số nhãn dài hơn thiết kế (ví dụ "Backend chưa trả số tổng hợp") | Bản thiết kế viết cho dữ liệu đầy đủ; khi backend thiếu dữ liệu phải nói đúng lý do thay vì hiện "Không có dữ liệu" gây hiểu nhầm |

---

## 13. Số liệu nên nhớ

| Hạng mục | Số |
|---|---|
| Màn hình | **31** (17 quản trị · 9 cổng sinh viên · 5 chung) |
| Đường dẫn khai báo | 31 |
| Nhóm chức năng (`src/features/`) | 14 |
| File mã nguồn trong `src/` | 132 |
| Endpoint backend được gọi | **82** |
| Khóa phân quyền | 23 |
| Vai trò | 4 (admin · staff · viewer · student) |
| Bộ kiểm thử tự động | 22 |
| Tài khoản mẫu ở chế độ dữ liệu giả | 13 |
| Mục checklist nghiệm thu | 23 |

---

## 14. Câu hỏi hay gặp khi bảo vệ — và câu trả lời ngắn

**Kiến trúc**

1. *Vì sao chia thư mục theo tính năng?* — Sửa một màn thì mọi thứ liên quan nằm trong một thư mục; chia theo loại file thì sửa một màn phải mở 4 thư mục khác nhau.
2. *Vì sao không dùng Redux?* — Trạng thái dùng chung duy nhất là người đang đăng nhập; Context đủ. Xem mục 2.
3. *Vì sao không dùng TypeScript?* — Nhóm chưa quen, thời gian ngắn, ưu tiên làm xong 31 màn. Bù lại: JSDoc ở các hàm dùng chung và ESLint bật nghiêm.
4. *Tách `utils/*View.js` để làm gì?* — Tách phần biến đổi dữ liệu khỏi phần bố cục, để logic kiểm thử được và file màn hình đọc được.

**Dữ liệu và API**

5. *Không có backend thì làm sao code được 31 màn?* — Lớp dữ liệu giả trả đúng định dạng đã thống nhất trong `API.md`; đổi sang backend thật bằng một biến môi trường (mục 8).
6. *Sao biết định dạng khớp backend?* — `API.md` là hợp đồng chung hai bên cùng sửa; mỗi lần FE cần thêm trường thì cập nhật `API.md` rồi báo BE, có bảng lịch sử phiên bản đến 1.2.18.
7. *Backend trả sai định dạng thì sao?* — Có lớp adapter (mục 9.3); backend sửa xong thì xóa adapter, không đụng vào màn hình.
8. *Xử lý lỗi API thế nào?* — Ba hàm `getErrorMessage` / `getErrorCode` / `getFieldErrors`; màn hình xử lý theo **mã lỗi** chứ không so sánh chuỗi tiếng Việt.

**Bảo mật**

9. *Phân quyền FE có an toàn không?* — Không; chỉ là trải nghiệm, backend phải kiểm lại. Xem mục 7.4.
10. *Token để ở đâu, có an toàn không?* — `localStorage` hoặc `sessionStorage` tùy ô "Ghi nhớ". Cách an toàn hơn là cookie `HttpOnly`, nhưng phiên bản 1 dùng JWT 7 ngày không refresh token theo đặc tả FR-08. Biết hạn chế và ghi lại là đủ.
11. *Giá tiền có bị sửa từ trình duyệt được không?* — Không. Đơn hàng chỉ gửi mã sản phẩm và số lượng, server tự tính (BR-92).

**Nghiệp vụ**

12. *Vì sao sinh viên không được chọn giường?* — BR-38: hệ thống gán giường trống số nhỏ nhất. Tránh tranh chấp chỗ đẹp và tránh tình huống hai người chọn cùng một giường.
13. *Hai nhân viên duyệt cùng lúc một phòng còn một chỗ thì sao?* — Backend gán giường **nguyên tử**; người sau nhận `ROOM_FULL` và màn hình hướng dẫn chuyển phòng.
14. *Tiền điện nước tính sao?* — (chỉ số mới − chỉ số cũ) × đơn giá, chia đều cho số người đang ở phòng (BR-52).
15. *Sinh viên vào ở giữa tháng thì tính tiền thế nào?* — **Thu đủ một tháng** (BR-32). Ngược lại, trả phòng sớm thì **hoàn theo số ngày chưa ở** (BR-31). Đây là bất đối xứng **có chủ ý**, ghi rõ trong nội quy để tránh khiếu nại.
16. *Trả phòng thì tiền cọc xử lý ra sao?* — Cọc − nợ + hoàn tiền phòng những ngày chưa ở; dương thì hoàn, âm thì nộp thêm (mục 6.6).
17. *Đã thanh toán rồi có hủy hóa đơn được không?* — Không (BR-46); nút bị vô hiệu hóa kèm lý do.

**Chỗ khó**

18. *Màn nào khó nhất?* — SCR-65 Kết quả thanh toán: webhook về chậm nên phải hỏi lại 5 lần cách 2 giây, và **tuyệt đối không báo thất bại khi chưa biết kết quả**.
19. *Có bug nào đáng nhớ không?* — Chi tiết hóa đơn hiện trắng trang với backend thật: hook `useApi` thấy trường `items` nên tưởng là danh sách phân trang. Sửa bằng cách bỏ trường `items` cũ ở lớp chuẩn hóa (mục 7.3).
20. *Có quyết định kỹ thuật nào tự đưa ra không?* — Đổi xem trước lập hóa đơn từ `POST … dryRun` sang `GET /invoices/generation-preview`, để việc chỉ xem không bao giờ ghi được dữ liệu (mục 9.4).
21. *Làm sao biết 31 màn đều chạy?* — 22 bộ kiểm thử tự động + checklist nghiệm thu 23 mục + đối chiếu ảnh chụp với bản thiết kế.
22. *Còn thiếu gì?* — 34 endpoint backend chưa có (chủ yếu cổng sinh viên và nhu yếu phẩm), liệt kê đầy đủ kèm mức ưu tiên trong `16-YEU-CAU-API-BACKEND.md`.

---

## 15. Đọc thêm

| Cần gì | Mở tài liệu |
|---|---|
| Đặc tả chức năng (mã FR) | `02-DAC-TA-YEU-CAU.md` |
| Luật nghiệp vụ (mã BR) | `03-PHAN-TICH-NGHIEP-VU.md` |
| Phân quyền chi tiết | `07-PHAN-QUYEN-BAO-MAT.md` |
| Thiết kế màn hình (mã SCR) | `08-THIET-KE-GIAO-DIEN.md` |
| Hợp đồng API | `API.md` · cấu trúc dữ liệu: `DATA-SCHEMA.md` |
| Việc backend cần làm | `16-YEU-CAU-API-BACKEND.md` |
| Checklist bấm thử từng màn | `15-CHECKLIST-NGHIEM-THU-FE.md` |
| Phạm vi đã cắt giảm | `14-PHIEN-BAN-DON-GIAN-HOA.md` |

---

## Lịch sử phiên bản

| Phiên bản | Ngày | Người | Nội dung |
|---|---|---|---|
| 1.0 | 16/09/2026 | FE Lead | Bản đầu — tổng quan frontend sau khi hoàn thành 31/31 màn |
