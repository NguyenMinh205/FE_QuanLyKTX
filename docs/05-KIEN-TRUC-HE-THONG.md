# 05 – KIẾN TRÚC HỆ THỐNG & CÔNG NGHỆ

**Hệ thống:** DMS-KTX
**Phiên bản:** v1.2 (áp dụng v1-lite)

> ⚠️ **Tài liệu này đã được đơn giản hóa.** Tech stack và cấu trúc thư mục dưới đây là bản **v1-lite** — xem lý do và hướng dẫn cụ thể tại [`14-PHIEN-BAN-DON-GIAN-HOA.md`](14-PHIEN-BAN-DON-GIAN-HOA.md).

---

## 1. Tổng quan kiến trúc

Hệ thống theo mô hình **Client–Server tách rời (decoupled SPA + REST API)**:

```mermaid
flowchart TB
    subgraph Browser["Trình duyệt người dùng"]
        SPA["React SPA (Vite build)<br/>Router · State · UI Components"]
    end

    subgraph Server["Máy chủ ứng dụng (Node.js)"]
        direction TB
        MW["Middleware<br/>CORS · Helmet · RateLimit<br/>Auth JWT · RBAC · ErrorHandler"]
        RT["Routes / Controllers<br/>Nhận HTTP, gọi Service, trả JSON"]
        SVC["Services<br/>Toàn bộ nghiệp vụ, transaction,<br/>quy tắc BR-xx, gọi Prisma trực tiếp"]
        JOB["1 Cron Job hằng ngày<br/>(4 tác vụ)"]
    end

    subgraph Storage["Lưu trữ"]
        PG[("PostgreSQL hoặc MySQL")]
    end

    subgraph External["Bên thứ ba"]
        VNP["VNPay Sandbox"]
    end

    SPA -->|"REST/JSON + Bearer JWT"| MW
    MW --> RT --> SVC --> PG
    JOB --> SVC
    SVC -->|"Tạo URL thanh toán"| VNP
    VNP -->|"Chuyển hướng về Return URL"| SPA
    SPA -->|"Gửi tham số để xác thực chữ ký"| MW
```

> Sơ đồ đã áp dụng **v1-lite**: bỏ tầng Repository, bỏ ZaloPay, gộp 6 cron job thành 1, và nhận kết quả thanh toán qua **Return URL có xác thực chữ ký** thay vì IPN (xem `14` mục 4.10).

### 1.1. Lý do chọn kiến trúc này

| Tiêu chí | Lý do |
|----------|-------|
| **Tách FE/BE** | Hai nhóm làm song song, chỉ cần thống nhất hợp đồng API. Giảm phụ thuộc tiến độ (xem rủi ro R1, R2 ở `01`). |
| **Monolith 2 tầng (không microservices)** | Quy mô đồ án nhỏ, microservices sẽ làm phức tạp deploy và debug mà không mang lại lợi ích. Dùng **Controller → Service** (Service gọi Prisma trực tiếp), bỏ tầng Repository vì Prisma đã là một lớp trừu tượng truy cập dữ liệu rồi — thêm Repository chỉ tạo ra mã trung chuyển. |
| **REST thay vì GraphQL** | Team chưa quen GraphQL; REST đơn giản, dễ test bằng Postman, dễ trình bày trong báo cáo. |
| **JWT stateless** | Không cần lưu session ở server, đơn giản hóa deploy. |
| **CSDL quan hệ** | Dữ liệu có tính quan hệ cao (tòa–phòng–giường–hợp đồng–hóa đơn), cần ràng buộc toàn vẹn và transaction — NoSQL không phù hợp. |

---

## 2. Công nghệ sử dụng (Tech Stack)

### 2.1. Frontend

| Hạng mục | Lựa chọn | Phiên bản | Lý do |
|----------|----------|-----------|-------|
| Thư viện UI | **React** | 19.x | Yêu cầu đề tài |
| Công cụ build | **Vite** | 8.x | Khởi động nhanh, HMR tốt (đã có sẵn trong repo) |
| Ngôn ngữ | **JavaScript (JSX)** | ES2022 | Team quen thuộc; **không** dùng TypeScript ở v1 |
| Định tuyến | **React Router** | 7.x | Chuẩn de-facto cho SPA |
| Gọi API | **Axios** | 1.x | Interceptor tiện cho việc gắn JWT và xử lý lỗi tập trung |
| Thư viện UI components | **Ant Design** | **6.x** | Có sẵn Table (sort/filter/pagination), Form **kèm validation**, DatePicker, Modal — tiết kiệm nhiều thời gian nhất. Hỗ trợ React 19 sẵn, **không** cần gói vá thêm |
| Biểu đồ | **Recharts** | **3.x** | API đơn giản, chỉ dùng ở 1–2 biểu đồ dashboard |
| Định dạng ngày | **Day.js** | 1.x | Nhẹ, đi kèm Ant Design |
| Lint | **ESLint** | 10.x | Đã có sẵn |
| ~~Quản lý state server~~ | ~~TanStack Query~~ → **hook `useApi` tự viết** | – | Ít khái niệm phải học hơn — xem `14` mục 4.1 |
| ~~Quản lý state client~~ | ~~Zustand~~ → **React Context** | – | Chỉ cần cho trạng thái đăng nhập — xem `14` mục 4.2 |
| ~~Form & validation~~ | ~~React Hook Form + Zod~~ → **Ant Design Form** | – | Đã có sẵn `rules`, không cần thư viện thêm — xem `14` mục 4.3 |
| ~~Mock API~~ | ~~MSW~~ → **dữ liệu giả trong file `api/*.js`** | – | Xem `14` mục 4.4 |

**Cài đặt (đã chạy và kiểm chứng build thành công ngày 12/09/2026):**
```bash
npm install react-router-dom axios antd @ant-design/icons dayjs recharts
```

| Gói | Phiên bản đã cài | Ghi chú |
|-----|------------------|---------|
| `react` / `react-dom` | 19.2.8 | Có sẵn trong repo |
| `vite` | 8.3.0 | Có sẵn trong repo |
| `antd` | **6.6.3** | Tài liệu ban đầu ghi 5.x — đã chuyển sang 6.x, xem `14` mục 3.1 để biết 2 điểm khác biệt |
| `@ant-design/icons` | 6.3.4 | |
| `react-router-dom` | 7.18.3 | |
| `axios` | 1.20.0 | |
| `dayjs` | 1.11.23 | Ant Design dùng chung |
| `recharts` | 3.10.1 | Hỗ trợ React 19 |

### 2.2. Backend

| Hạng mục | Lựa chọn | Phiên bản | Lý do |
|----------|----------|-----------|-------|
| Runtime | **Node.js** | 20 LTS | Yêu cầu đề tài; bản LTS ổn định |
| Framework | **Express** | 4.x | Đơn giản, tài liệu nhiều, phù hợp trình độ nhóm |
| ORM | **Prisma** | 5.x | Giữ lại — viết schema dễ hơn SQL tay nhiều, migration tự động |
| CSDL | **PostgreSQL** *hoặc* **MySQL 8** | 15+ / 8+ | ⭐ Sau khi bỏ partial unique index (`14` mục 4.6), **hai hệ chạy như nhau** — chọn cái nào cài dễ hơn |
| Xác thực | **jsonwebtoken** + **bcrypt** | – | 1 token hạn 7 ngày, **không** dùng refresh token (`14` mục 4.11) |
| Bảo mật | **helmet**, **cors**, **express-rate-limit** | – | Mỗi cái 1 dòng cấu hình |
| Cron | **node-cron** | – | **1 job duy nhất** chạy 4 việc (`14` mục 4.9) |
| ~~Validation~~ | ~~Zod~~ → **hàm `validate()` tự viết ~25 dòng** | – | `14` mục 4.5 |
| ~~Logging~~ | ~~Pino~~ → **`console.log` có tiền tố** | – | `14` mục 4.13 |
| ~~Tài liệu API~~ | ~~Swagger~~ → **Postman collection** | – | Chia sẻ trong nhóm |
| ~~Xuất Excel~~ | ~~exceljs~~ → **CSV tự ghép chuỗi** | – | `14` mục 4.7 |
| ~~Xuất PDF~~ | ~~pdfmake~~ → **`window.print()` + CSS in** | – | `14` mục 4.8 |
| ~~Kiểm thử~~ | ~~Jest + Supertest 60% phủ~~ → **~10 unit test hàm tính tiền** | – | `14` mục 8.1 |

**Cài đặt:** `npm install express cors helmet dotenv bcrypt jsonwebtoken @prisma/client node-cron express-rate-limit`

### 2.3. Hạ tầng & công cụ

| Hạng mục | Lựa chọn | Ghi chú |
|----------|----------|---------|
| Quản lý mã nguồn | **GitHub** (2 repo: `dms-ktx-frontend`, `dms-ktx-backend`) | Hoặc 1 monorepo, xem mục 5 |
| Quản lý công việc | **GitHub Projects** / Trello / Jira miễn phí | Xem `09` |
| Deploy Frontend | **Vercel** hoặc **Netlify** (gói miễn phí) | Build tĩnh, tự deploy từ nhánh `main` |
| Deploy Backend | **Render** / **Railway** (gói miễn phí) | Có hỗ trợ Node + PostgreSQL |
| CSDL môi trường thật | **Neon** / **Supabase** / PostgreSQL của Render | Gói miễn phí đủ dùng cho demo |
| CI | **GitHub Actions** | Chạy lint + test trên mỗi PR |
| Test API | **Postman** (có collection chia sẻ cho cả nhóm) | |
| Vẽ sơ đồ | **Mermaid** (nhúng trực tiếp trong Markdown) / draw.io | Sơ đồ trong bộ tài liệu này dùng Mermaid |

---

## 3. Cấu trúc thư mục

### 3.1. Frontend (`dms-ktx-frontend`)

```
src/
├── main.jsx                     # Điểm vào, gắn Router + Providers
├── App.jsx                      # Khai báo toàn bộ route
│
├── api/                         # Tầng giao tiếp API (KHÔNG chứa logic UI)
│   ├── axiosClient.js           # Cấu hình axios, interceptor gắn JWT, xử lý 401
│   ├── authApi.js
│   ├── studentApi.js
│   ├── buildingApi.js
│   ├── roomApi.js
│   ├── bedApi.js
│   ├── contractApi.js
│   ├── invoiceApi.js
│   ├── paymentApi.js
│   ├── requestApi.js
│   ├── dashboardApi.js
│   └── portalApi.js
│
├── context/
│   └── AuthContext.jsx          # ⭐ Trạng thái đăng nhập (thay Zustand) — `14` mục 4.2
│
├── hooks/
│   ├── useApi.js                # ⭐ Gọi API + loading/error (thay TanStack Query) — `14` mục 4.1
│   └── useDebounce.js
│
├── components/                  # Component tái sử dụng, KHÔNG gắn với nghiệp vụ cụ thể
│   ├── common/                  # StatusTag, MoneyText, ConfirmModal, EmptyState, PageHeader
│   └── layout/                  # AdminLayout, PortalLayout
│
├── pages/                       # Tổ chức phẳng theo module (mỗi module 1 thư mục)
│   ├── auth/                    # LoginPage, RegisterPage, ChangePasswordPage
│   ├── students/                # StudentListPage, StudentFormPage, StudentDetailPage
│   ├── facilities/              # buildings, rooms, beds
│   ├── contracts/
│   ├── invoices/
│   ├── payments/
│   ├── requests/
│   ├── dashboard/
│   └── portal/                  # Toàn bộ màn hình của cổng sinh viên
│
├── routes/
│   ├── AppRoutes.jsx
│   └── RoleRoute.jsx            # Chặn theo đăng nhập + vai trò (gộp ProtectedRoute vào đây)
├── constants/
│   ├── roles.js
│   ├── statuses.js              # Nhãn tiếng Việt + màu sắc cho mọi enum
│   └── routes.js
├── mocks/
│   └── mockData.js              # ⭐ Dữ liệu giả khi BE chưa xong — `14` mục 4.4
└── utils/
    ├── formatter.js             # formatCurrency, formatDate, formatPhone
    └── permission.js            # can(user, action) — dùng chung ma trận RBAC
```

**Quy tắc phân chia:**
- `components/` = không biết gì về nghiệp vụ. `pages/` = biết nghiệp vụ.
- Mỗi trang trong `pages/` lo bố cục + gọi `useApi(...)`; **không** đặt logic tính toán nghiệp vụ ở đây.
- **Không** gọi `axios` trực tiếp trong component — luôn đi qua `api/*.js`.
- Cấu trúc phẳng 1 tầng (`pages/<module>/`), **không** lồng `features/<x>/{pages,components,hooks}` như bản đầu — ít thư mục, dễ tìm file hơn.

### 3.2. Backend (`dms-ktx-backend`)

```
src/
├── server.js                    # Khởi động HTTP server
├── app.js                       # Cấu hình Express, gắn middleware và routes
│
├── config/
│   ├── env.js                   # Đọc & kiểm tra biến môi trường (fail-fast)
│   ├── database.js              # Khởi tạo Prisma Client
│   ├── settings.js              # ⭐ Hằng số hệ thống (thay bảng system_config) — `14` mục 4.12
│   └── constants.js             # Enum, mã lỗi dùng chung
│
├── middlewares/
│   ├── auth.middleware.js       # authenticate (JWT) + authorize (RBAC) — gộp 1 file
│   └── error.middleware.js      # Bắt lỗi tập trung, chuẩn hóa response
│
├── routes/                      # 15 file router, gom ở index.js với prefix /api/v1
│   ├── index.js
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── student.routes.js
│   ├── building.routes.js
│   ├── room.routes.js
│   ├── bed.routes.js
│   ├── contract.routes.js
│   ├── feeType.routes.js
│   ├── utilityReading.routes.js
│   ├── invoice.routes.js
│   ├── payment.routes.js
│   ├── request.routes.js
│   ├── dashboard.routes.js
│   ├── report.routes.js
│   └── portal.routes.js         # Toàn bộ endpoint cho sinh viên
│
├── controllers/                 # CHỈ nhận request, gọi service, trả response
│   └── *.controller.js
│
├── services/                    # ⭐ TOÀN BỘ nghiệp vụ + gọi Prisma trực tiếp
│   ├── auth.service.js
│   ├── student.service.js
│   ├── bed.service.js           # changeStatus() — nơi duy nhất đổi trạng thái giường
│   ├── contract.service.js      # createApplication(), approve(), terminate(), transfer()
│   ├── invoice.service.js       # generatePeriodInvoices(), recalculate()
│   ├── payment.service.js       # createOnlinePayment(), confirmPayment(), recordManual()
│   ├── request.service.js
│   ├── dashboard.service.js
│   └── report.service.js
│
├── gateways/
│   └── vnpay.js                 # createPaymentUrl() + verifySignature()
│
├── jobs/
│   └── dailyJob.js              # ⭐ 1 file duy nhất, 4 tác vụ — `14` mục 4.9
│
└── utils/
    ├── ApiError.js              # Lớp lỗi chuẩn có statusCode + errorCode
    ├── ApiResponse.js           # Chuẩn hóa response thành công
    ├── asyncHandler.js          # Bọc controller async, tự forward lỗi
    ├── validate.js              # ⭐ Kiểm tra dữ liệu đầu vào (thay Zod) — `14` mục 4.5
    ├── csv.js                   # ⭐ Xuất CSV (thay exceljs) — `14` mục 4.7
    ├── codeGenerator.js         # Sinh contract_code, invoice_code, transaction_ref
    ├── money.js                 # Chia đều, tính theo ngày, làm tròn an toàn
    └── logger.js                # logAction() ghi nhật ký ra console

prisma/
├── schema.prisma                # 13 bảng (đã bỏ audit_log, system_config)
├── migrations/                  # Các file migration sinh tự động
└── seed.js                      # Dữ liệu khởi tạo

tests/
└── money.test.js                # ~10 unit test cho 3 hàm tính tiền — `14` mục 8.1
```

**Đã bỏ so với bản đầu:** `repositories/`, `validators/`, `docs/swagger.js`, `gateways/zalopay.gateway.js`, `middlewares/{rbac,validate,requestId,rateLimit}.middleware.js` (gộp lại), và 5 file cron job riêng lẻ.

**Quy tắc phân tầng (NFR-14):**

| Tầng | Được phép làm | KHÔNG được làm |
|------|---------------|----------------|
| Controller | Đọc `req`, gọi **1** hàm service, trả `res` | Viết `if` nghiệp vụ, gọi `prisma` trực tiếp |
| Service | Nghiệp vụ, transaction, gọi `prisma` trực tiếp | Đụng vào `req`/`res` |

> Chỉ còn **2 tầng**. Tầng `Repository` đã bỏ (`14` mục 4.1) — Prisma Client đóng luôn vai trò đó.

---

## 4. Quy ước API và xử lý lỗi

### 4.1. Cấu trúc response chuẩn

**Thành công:**
```json
{
  "success": true,
  "message": "Lấy danh sách sinh viên thành công",
  "data": { },
  "meta": { "page": 1, "limit": 20, "total": 137, "totalPages": 7 }
}
```

**Thất bại:**
```json
{
  "success": false,
  "message": "Giường này đã có người đăng ký",
  "errorCode": "BED_NOT_AVAILABLE",
  "errors": [
    { "field": "bedId", "message": "Giường không còn trống" }
  ],
  "requestId": "req_a1b2c3d4"
}
```

### 4.2. Mã trạng thái HTTP sử dụng

| Mã | Khi nào dùng |
|----|--------------|
| `200` | Lấy/cập nhật thành công |
| `201` | Tạo mới thành công |
| `204` | Xóa thành công, không có nội dung trả về |
| `400` | Dữ liệu đầu vào sai định dạng |
| `401` | Chưa đăng nhập hoặc token hết hạn |
| `403` | Đã đăng nhập nhưng không đủ quyền (RBAC, hoặc truy cập dữ liệu người khác) |
| `404` | Không tìm thấy tài nguyên |
| `409` | Xung đột trạng thái (giường đã bị chiếm, mã trùng) |
| `422` | Vi phạm quy tắc nghiệp vụ (BR-xx) |
| `429` | Vượt quá giới hạn tần suất |
| `500` | Lỗi hệ thống không lường trước |

### 4.3. Danh mục mã lỗi nghiệp vụ (`errorCode`)

| errorCode | HTTP | Thông báo tiếng Việt |
|-----------|------|----------------------|
| `INVALID_CREDENTIALS` | 401 | Email hoặc mật khẩu không đúng |
| `ACCOUNT_LOCKED` | 403 | Tài khoản đã bị khóa |
| `TOKEN_EXPIRED` | 401 | Phiên đăng nhập đã hết hạn |
| `FORBIDDEN_RESOURCE` | 403 | Bạn không có quyền truy cập dữ liệu này |
| `STUDENT_CODE_EXISTS` | 409 | Mã số sinh viên đã tồn tại |
| `BED_NOT_AVAILABLE` | 409 | Giường không còn trống |
| `STUDENT_HAS_ACTIVE_CONTRACT` | 422 | Sinh viên đã có hợp đồng đang hiệu lực |
| `GENDER_MISMATCH` | 422 | Giới tính không phù hợp với tòa nhà |
| `ROOM_CAPACITY_EXCEEDED` | 422 | Số giường vượt quá sức chứa của phòng |
| `CONTRACT_NOT_ACTIVE` | 422 | Hợp đồng không ở trạng thái hiệu lực |
| `INVOICE_ALREADY_PAID` | 422 | Hóa đơn đã được thanh toán đủ |
| `PAYMENT_EXCEEDS_REMAINING` | 422 | Số tiền thanh toán vượt quá số còn nợ |
| `INVOICE_HAS_PAYMENT` | 422 | Hóa đơn đã phát sinh thanh toán, không thể hủy |
| `DUPLICATE_PENDING_REQUEST` | 409 | Bạn đã có một yêu cầu cùng loại đang chờ xử lý |
| `STUDENT_HAS_DEBT` | 422 | Sinh viên còn công nợ chưa thanh toán |
| `INVALID_SIGNATURE` | 400 | Chữ ký giao dịch không hợp lệ |
| `RESOURCE_IN_USE` | 422 | Không thể xóa vì dữ liệu đang được sử dụng |

---

## 5. Tổ chức repository

**Phương án khuyến nghị: 2 repository riêng biệt**

| Repo | Nội dung | Deploy tới |
|------|----------|-----------|
| `dms-ktx-frontend` | Toàn bộ mã React (repo hiện tại `FE_QuanLyKTX`) | Vercel |
| `dms-ktx-backend` | Mã Node.js + Prisma + migration | Render |

**Lý do:** deploy độc lập, CI riêng, lịch sử commit rõ ràng theo vai trò thành viên.

**Tài liệu để ở đâu?** Thư mục `docs/` của repo frontend (repo này) là bản gốc; backend tham chiếu qua link. Hoặc tạo repo `dms-ktx-docs` riêng nếu muốn cả nhóm cùng sửa mà không đụng mã nguồn.

---

## 6. Biến môi trường

### 6.1. Backend – `.env`

```bash
# --- Ứng dụng ---
NODE_ENV=development
PORT=5000
API_PREFIX=/api/v1

# --- Cơ sở dữ liệu ---
DATABASE_URL="postgresql://postgres:password@localhost:5432/dms_ktx?schema=public"

# --- JWT ---
JWT_ACCESS_SECRET=doi_chuoi_nay_thanh_chuoi_ngau_nhien_dai
JWT_ACCESS_EXPIRES_IN=60m
JWT_REFRESH_SECRET=mot_chuoi_bi_mat_khac
JWT_REFRESH_EXPIRES_IN=7d

# --- Bảo mật ---
BCRYPT_SALT_ROUNDS=10
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=200

# --- Frontend URL (dùng cho redirect sau thanh toán) ---
FRONTEND_URL=http://localhost:5173

# --- VNPay Sandbox ---
VNP_TMN_CODE=
VNP_HASH_SECRET=
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:5173/portal/payment-result
VNP_IPN_URL=http://localhost:5000/api/v1/payments/vnpay/ipn

# --- ZaloPay Sandbox ---
ZLP_APP_ID=
ZLP_KEY1=
ZLP_KEY2=
ZLP_ENDPOINT=https://sb-openapi.zalopay.vn/v2/create

# --- Tác vụ nền ---
ENABLE_CRON=true
TZ=Asia/Ho_Chi_Minh
```

### 6.2. Frontend – `.env`

```bash
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_APP_NAME=Hệ thống quản lý ký túc xá
VITE_USE_MOCK=false
```

> **Bắt buộc:** `.env` phải nằm trong `.gitignore`. Commit file `.env.example` với đầy đủ khóa nhưng để trống giá trị, để thành viên mới biết cần cấu hình gì.

---

## 7. Môi trường triển khai

| Môi trường | Frontend | Backend | CSDL | Mục đích |
|------------|----------|---------|------|----------|
| **Local (dev)** | `localhost:5173` | `localhost:5000` | PostgreSQL cài máy hoặc Docker | Lập trình hằng ngày |
| **Staging** | Vercel preview (theo nhánh) | Render (nhánh `develop`) | Neon free tier | Test tích hợp, demo giữa kỳ |
| **Production (demo)** | Vercel (nhánh `main`) | Render (nhánh `main`) | Neon free tier | Bảo vệ đồ án, GVHD truy cập |

Chi tiết từng bước triển khai xem `13-LO-TRINH-TRIEN-KHAI.md`, mục 6.

---

## 8. Luồng khởi động ứng dụng

### 8.1. Backend
```
server.js
  └─ config/env.js         → đọc và kiểm tra biến môi trường (thiếu thì thoát ngay)
  └─ config/database.js    → kết nối Prisma, kiểm tra kết nối
  └─ app.js
       ├─ helmet, cors, express.json, requestId, logger
       ├─ rateLimit cho /auth/*
       ├─ routes/index.js  → gắn toàn bộ router vào /api/v1
       ├─ swagger UI tại /api-docs
       └─ error.middleware (phải đặt CUỐI CÙNG)
  └─ jobs/index.js         → khởi động cron nếu ENABLE_CRON=true
  └─ app.listen(PORT)
```

### 8.2. Frontend
```
main.jsx
  └─ <QueryClientProvider>      → cấu hình TanStack Query
       └─ <ConfigProvider locale={viVN}>  → Ant Design tiếng Việt
            └─ <BrowserRouter>
                 └─ <App />     → AppRoutes: public / protected / role-based
```

---

## 9. Lịch sử phiên bản

| Phiên bản | Ngày | Người thực hiện | Nội dung thay đổi |
|-----------|------|------------------|-------------------|
| v1.0 | 11/09/2026 | Cả nhóm | Chốt tech stack, cấu trúc thư mục, quy ước API |
| v1.2 | 12/09/2026 | Cả nhóm | **Áp dụng v1-lite:** FE còn 5 thư viện (bỏ TanStack Query, Zustand, RHF, Zod, MSW); BE còn 6 (bỏ Zod, Pino, Swagger, exceljs, pdfmake); kiến trúc còn 2 tầng; CSDL dùng PostgreSQL hoặc MySQL đều được. Chi tiết tại `14` |
