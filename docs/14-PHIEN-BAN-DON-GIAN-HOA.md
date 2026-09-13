# 14 – PHIÊN BẢN ĐƠN GIẢN HÓA (v1-lite)

**Hệ thống:** DMS-KTX
**Phiên bản:** v2.0 (MongoDB + Mongoose)
**Ngày ban hành:** 12/09/2026
**Trạng thái:** ✅ **Đang áp dụng** — thay thế các lựa chọn kỹ thuật tương ứng trong `03`, `DATA-SCHEMA.md`, `ARCHITECTURE.md`, `API.md`, `09`, `11`, `13`

> 🎯 **Nhóm đã chọn BẬC B (mức nhẹ nhàng, dành cho người mới bắt đầu).** Đọc **mục 2** để nắm 21 thay đổi nền, rồi đọc **mục 13** để biết 10 thay đổi hạ thêm một bậc. Nếu chỉ có thời gian đọc một phần, đọc **mục 15 — mẫu code một module hoàn chỉnh** — đó là thứ dùng được ngay.

**Mục lục nhanh:** 1 lý do · 2 bảng 21 thay đổi · 3 công nghệ · 4 cách làm từng thay đổi · 5 CSDL · 6 cấu trúc thư mục · 7 lộ trình · 8 kiểm thử · 9 thang cắt giảm · 10 cách viết vào báo cáo · **13 Bậc B** · **14 lộ trình tự học** · **15 mẫu code** · 16 việc cần làm ngay

---

## 1. Vì sao có tài liệu này

Sau khi rà soát bộ tài liệu thiết kế, nhóm nhận thấy **khối lượng kỹ thuật vượt quá năng lực và quỹ thời gian thực tế**. Thay vì cắt chức năng (làm hỏng giá trị của đề tài), nhóm chọn **giữ nguyên toàn bộ chức năng nhưng đổi cách cài đặt sang phương án đơn giản hơn**.

### 1.1. Nguyên tắc đơn giản hóa

| # | Nguyên tắc | Diễn giải |
|---|------------|-----------|
| 1 | **Không cắt chức năng** | Toàn bộ 8 module, 85 yêu cầu `FR-xx` giữ nguyên. Người dùng cuối không thấy khác biệt nào. |
| 2 | **Không đánh đổi tính đúng đắn** | Mọi quy tắc nghiệp vụ `BR-xx` vẫn được thực thi. Phương án mới phải **đúng**, chỉ được phép kém "chuyên nghiệp" hơn, không được phép sai. |
| 3 | **Ưu tiên thứ nhóm đã biết** | Bỏ thư viện/kỹ thuật phải học mới, nếu có cách làm bằng kiến thức sẵn có mà vẫn đạt kết quả. |
| 4 | **Ít khái niệm hơn > ít dòng code hơn** | Một hook tự viết 30 dòng dễ hiểu hơn một thư viện 0 dòng nhưng phải học 5 khái niệm mới. |
| 5 | **Nêu rõ đánh đổi** | Mỗi thay đổi ghi rõ mất gì, để viết vào phần "Hạn chế" của báo cáo một cách trung thực. |

### 1.2. Kết quả

| Chỉ số | Thiết kế gốc | Bậc A (v1-lite) | **Bậc B (nhẹ nhàng)** |
|--------|--------------|-----------------|------------------------|
| Chức năng (`FR-xx`) | 85 | 85 | **85 — giữ nguyên** |
| Quy tắc nghiệp vụ (`BR-xx`) | 71 | 71 | **71 — giữ nguyên** |
| Màn hình / route | 43 | 43 | **32** (form gộp vào modal) |
| Thư viện phải học | 13 | 6 | **6** |
| Bảng CSDL | 15 | 13 | **13** |
| Tầng kiến trúc backend | 3 | 2 | **2** (controller gộp vào route) |
| Số file backend / module | 3 | 3 | **2** |
| Cron job | 6 | 1 | **1** |
| Repository Git | 2 | 2 | **2** (tài liệu chỉ ở repo FE) |
| Nhánh Git chính | main + develop | main + develop | **chỉ main** |
| Khối lượng | ~206 MD | ~155 MD | **~120 MD** |
| Test case thủ công | 128 | 65 | **50** |

**Bậc B là mức đang áp dụng.** Mục 2–12 mô tả Bậc A; mục 13 mô tả phần hạ thêm của Bậc B.

> 📌 **Cách dùng tài liệu này:** khi tài liệu này và tài liệu khác nói khác nhau về **cách cài đặt**, lấy theo tài liệu này. Về **chức năng và nghiệp vụ**, `02` và `03` vẫn là chuẩn.

---

## 2. Bảng tổng hợp 21 thay đổi

| # | Hạng mục | Phương án cũ (khó) | Phương án mới (dễ) | Tiết kiệm |
|---|----------|--------------------|--------------------|-----------|
| **Kiến trúc backend** |
| 1 | Phân tầng | Controller → Service → Repository | **Controller → Service** (Service gọi Mongoose trực tiếp) | 5 MD |
| 2 | Chống xếp trùng giường | `SELECT ... FOR UPDATE` + partial unique index | **`UPDATE ... WHERE status='available'` rồi kiểm tra số dòng bị ảnh hưởng** | 4 MD |
| 3 | Kiểm tra dữ liệu đầu vào | Zod schema cho từng endpoint | **Hàm `validate()` tự viết ~25 dòng** | 2 MD |
| 4 | Tác vụ nền | 6 cron job riêng | **1 cron job chạy 4 việc + suy diễn trạng thái khi đọc** | 2 MD |
| 5 | Nhật ký hệ thống | Bảng `audit_log` + màn hình tra cứu | **Ghi ra file log bằng `console.log` có định dạng** | 2 MD |
| 6 | Cấu hình hệ thống | Bảng `system_config` + màn hình | **File hằng số `config/settings.js`** | 2 MD |
| **Xác thực** |
| 7 | Phiên đăng nhập | Access token 60 phút + refresh token + thu hồi | **1 JWT hạn 7 ngày** | 3 MD |
| 8 | Chống dò mật khẩu | Đếm lần sai + khóa 15 phút + cột `locked_until` | **Chỉ dùng `express-rate-limit`** | 1 MD |
| **Frontend** |
| 9 | Quản lý dữ liệu server | TanStack Query | **Hook `useApi` tự viết ~35 dòng** | 3 MD |
| 10 | Quản lý state đăng nhập | Zustand | **React Context (1 file)** | 1 MD |
| 11 | Form & kiểm tra dữ liệu | React Hook Form + Zod | **`Form` của Ant Design (có sẵn `rules`)** | 3 MD |
| 12 | Chạy trước khi có API | MSW mock server | **Mảng dữ liệu giả trong file `api/*.js` + cờ env** | 2 MD |
| **Thanh toán** |
| 13 | Cổng thanh toán | VNPay + ZaloPay | **Chỉ VNPay** | 2 MD |
| 14 | Nhận kết quả giao dịch | IPN (server-to-server) + ngrok | **Xác thực chữ ký tại Return URL** + nút đối soát thủ công | 3 MD |
| **Xuất dữ liệu** |
| 15 | Xuất Excel | Thư viện `exceljs` | **Xuất CSV (~8 dòng code)** | 1.5 MD |
| 16 | Xuất PDF hợp đồng/hóa đơn | `pdfmake` / `puppeteer` | **In bằng trình duyệt (`window.print()` + CSS `@media print`)** | 2 MD |
| 17 | Nhập hàng loạt | Import Excel có báo lỗi từng dòng | **Bỏ hẳn khỏi phạm vi v1** — dữ liệu nhập tay hoặc qua script seed (`PRD.md` §3) | 1.5 MD |
| **Chất lượng & vận hành** |
| 18 | Tài liệu API | Swagger/OpenAPI sinh từ code | **Postman collection chia sẻ trong nhóm** | 1.5 MD |
| 19 | Kiểm thử tự động | Jest + Supertest, độ phủ 60% | **~10 unit test cho các hàm tính tiền** | 3 MD |
| 20 | Kiểm thử thủ công | 128 test case | **65 test case trọng tâm** | 2 MD |
| 21 | CI | GitHub Actions | **Chạy `npm run lint` tay trước khi mở PR** | 0.5 MD |
| | | | **Tổng tiết kiệm** | **~48 MD** |

---

## 3. Công nghệ sau khi đơn giản hóa

### 3.1. Frontend — còn 3 thư viện chính

| Hạng mục | Dùng gì | Ghi chú |
|----------|---------|---------|
| UI | **React 19 + Vite** | Đã có sẵn |
| Định tuyến | **React Router 7** | Bắt buộc |
| Thư viện giao diện | **Ant Design 6** | Giữ lại — đây là thứ **tiết kiệm nhiều thời gian nhất**. Table, Form, DatePicker, Modal, Select đều có sẵn. Hỗ trợ React 19 sẵn |
| Gọi API | **Axios** | Cấu hình 1 lần trong `api/axiosClient.js` |
| Biểu đồ | **Recharts 3** | Chỉ dùng ở 1–2 biểu đồ dashboard |
| Ngày tháng | **Day.js** | Đi kèm Ant Design, không cần cài thêm |
| Quản lý dữ liệu | ~~TanStack Query~~ → **hook `useApi` tự viết** | Xem mục 4.1 |
| State đăng nhập | ~~Zustand~~ → **React Context** | Xem mục 4.2 |
| Form | ~~React Hook Form + Zod~~ → **Ant Design Form** | Xem mục 4.3 |
| Mock API | ~~MSW~~ → **dữ liệu giả trong file api** | Xem mục 4.4 |

**Lệnh cài đặt frontend (đầy đủ):**
```bash
npm install react-router-dom axios antd @ant-design/icons dayjs recharts
```

**Phiên bản đã cài và kiểm chứng build thành công (12/09/2026):**

| Gói | Phiên bản | Vai trò |
|-----|-----------|---------|
| `react`, `react-dom` | 19.2.8 | Có sẵn |
| `vite` | 8.3.0 | Có sẵn |
| `antd` | **6.6.3** | Toàn bộ giao diện: Table, Form, Modal, DatePicker, Select… |
| `@ant-design/icons` | 6.3.4 | Bộ biểu tượng |
| `react-router-dom` | 7.18.3 | Điều hướng trang |
| `axios` | 1.20.0 | Gọi API |
| `dayjs` | 1.11.23 | Ngày tháng (antd dùng chung) |
| `recharts` | 3.10.1 | Biểu đồ dashboard |

> ✅ Đã chạy `npm run build` với cả 7 gói — build thành công, không lỗi tương thích. Đây là bộ **đầy đủ**, không cần cài gì thêm cho toàn bộ frontend.

### 3.1.1. ⚠️ Hai điểm khác biệt của Ant Design 6 so với v5

Tài liệu thiết kế ban đầu viết theo **antd 5**; thực tế nhóm cài **antd 6**. Gần như toàn bộ API giống nhau (`Table`, `Form`, `Input`, `Select`, `DatePicker`, `Input.Search` đều còn nguyên), chỉ có **2 chỗ** cần nhớ:

**(1) `destroyOnClose` đã đổi tên thành `destroyOnHidden`**

```jsx
<Modal destroyOnClose />    {/* ❌ vẫn chạy nhưng cảnh báo deprecated */}
<Modal destroyOnHidden />   {/* ✅ dùng cái này */}
```

**(2) Dùng `App.useApp()` thay cho `message` / `Modal.confirm` gọi trực tiếp**

Gọi trực tiếp `message.success(...)` vẫn chạy, nhưng thông báo **nằm ngoài cây React** nên không nhận được theme và locale tiếng Việt. Cách đúng:

```jsx
// main.jsx — bọc App của antd MỘT LẦN ở ngoài cùng
import { ConfigProvider, App as AntApp } from 'antd';
import viVN from 'antd/locale/vi_VN';

<ConfigProvider locale={viVN}>
  <AntApp>
    <AuthProvider>
      <BrowserRouter><App /></BrowserRouter>
    </AuthProvider>
  </AntApp>
</ConfigProvider>
```

```jsx
// Trong component bất kỳ — lấy message và modal từ hook
import { App } from 'antd';

export default function StudentListPage() {
  const { message, modal } = App.useApp();     // ⭐ thay vì import { message, Modal } rồi gọi thẳng

  const handleDelete = (record) => {
    modal.confirm({
      title: 'Xác nhận vô hiệu hóa',
      content: `Vô hiệu hóa sinh viên ${record.fullName}?`,
      okText: 'Vô hiệu hóa', cancelText: 'Hủy',
      onOk: async () => {
        await studentApi.deactivate(record.id);
        message.success('Đã vô hiệu hóa');
        refetch();
      },
    });
  };
}
```

> 📌 Mẫu code ở **mục 15** đã viết theo cách gọi trực tiếp cho dễ đọc. Khi code thật, đổi sang `App.useApp()` như trên — chỉ thay 2 dòng đầu của mỗi component có dùng `message` hoặc `Modal.confirm`.

### 3.2. Backend — còn 6 thư viện chính

| Hạng mục | Dùng gì | Ghi chú |
|----------|---------|---------|
| Runtime | **Node.js 20 LTS** | |
| Framework | **Express 4** | |
| ORM | **Mongoose 5** | Giữ lại — viết schema dễ hơn SQL tay rất nhiều, migration tự động |
| CSDL | **MongoDB 7+** | Mongoose tự tạo collection và index từ schema — không cần viết migration. Chạy được trên `mongod` thường vì v1 không dùng transaction (mục 4.6) |
| Xác thực | **jsonwebtoken + bcrypt** | |
| Bảo mật | **cors, helmet, express-rate-limit** | Mỗi cái 1 dòng cấu hình |
| Cron | **node-cron** | Chỉ 1 job |
| Validation | ~~Zod~~ → **hàm tự viết** | Xem mục 4.5 |
| Tài liệu API | ~~Swagger~~ → **Postman** | |
| Xuất file | ~~exceljs~~ → **tự ghép chuỗi CSV** | Xem mục 4.7 |
| Log | ~~Pino~~ → **`console.log` có tiền tố** | |

**Lệnh cài đặt backend (đầy đủ):**
```bash
npm install express cors helmet dotenv bcrypt jsonwebtoken @mongoose/client node-cron express-rate-limit
npm install -D mongoose nodemon
```

---

## 4. Cách làm cụ thể từng thay đổi

### 4.1. Thay TanStack Query bằng hook `useApi`

**Tạo file `src/hooks/useApi.js` — viết một lần, dùng cả dự án:**

```js
import { useState, useEffect, useCallback } from 'react';

/**
 * Gọi API và quản lý 3 trạng thái: đang tải / có dữ liệu / lỗi.
 * @param apiFunc  hàm gọi API, ví dụ: () => studentApi.getList(filters)
 * @param deps     mảng phụ thuộc, đổi thì gọi lại (giống useEffect)
 */
export function useApi(apiFunc, deps = []) {
  const [data, setData]         = useState(null);
  const [meta, setMeta]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFunc();
      setData(res.data.data);
      setMeta(res.data.meta ?? null);
    } catch (err) {
      setError(err.response?.data?.message || 'Không kết nối được máy chủ');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { fetchData(); }, [fetchData]);

  // refetch: gọi lại sau khi thêm/sửa/xóa thành công
  return { data, meta, loading, error, refetch: fetchData };
}
```

**Dùng trong màn hình:**
```jsx
export default function StudentListPage() {
  const [filters, setFilters] = useState({ page: 1, limit: 20, search: '' });

  const { data: students, meta, loading, error, refetch } = useApi(
    () => studentApi.getList(filters),
    [filters]                       // filters đổi → tự gọi lại API
  );

  const handleDelete = async (id) => {
    await studentApi.deactivate(id);
    message.success('Đã vô hiệu hóa sinh viên');
    refetch();                      // tải lại danh sách
  };

  if (error) return <Alert type="error" message={error} />;

  return (
    <Table
      dataSource={students}
      loading={loading}
      rowKey="id"
      pagination={{
        current: meta?.page,
        total: meta?.total,
        pageSize: meta?.limit,
        onChange: (page) => setFilters({ ...filters, page }),
      }}
      columns={columns}
    />
  );
}
```

**Đánh đổi:** không có bộ nhớ đệm tự động — chuyển trang rồi quay lại sẽ gọi API lần nữa. Với quy mô đồ án, điều này **không ảnh hưởng gì**.

### 4.2. Thay Zustand bằng React Context

**`src/context/AuthContext.jsx`:**

```jsx
import { createContext, useContext, useState } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { token, user: u } = res.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

Bọc ở `main.jsx`: `<AuthProvider><App /></AuthProvider>`. Dùng ở bất kỳ đâu: `const { user, logout } = useAuth();`

### 4.3. Thay React Hook Form + Zod bằng Form của Ant Design

Ant Design Form đã có sẵn cơ chế kiểm tra dữ liệu qua thuộc tính `rules` — **không cần thư viện nào thêm**:

```jsx
<Form form={form} layout="vertical" onFinish={handleSubmit}>
  <Form.Item
    name="studentCode"
    label="Mã số sinh viên"
    rules={[
      { required: true, message: 'Vui lòng nhập MSSV' },
      { pattern: /^[A-Za-z0-9]{6,20}$/, message: 'MSSV gồm 6–20 ký tự chữ và số' },
    ]}
  >
    <Input placeholder="VD: SV2024001" />
  </Form.Item>

  <Form.Item
    name="phone"
    label="Số điện thoại"
    rules={[{ pattern: /^0\d{9}$/, message: 'SĐT gồm 10 số, bắt đầu bằng 0' }]}
  >
    <Input />
  </Form.Item>

  <Form.Item
    name="dateOfBirth"
    label="Ngày sinh"
    rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
  >
    <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
  </Form.Item>

  <Button type="primary" htmlType="submit" loading={submitting}>Lưu</Button>
</Form>
```

**Hiển thị lỗi từ backend vào đúng ô nhập:**
```js
catch (err) {
  const errors = err.response?.data?.errors;   // [{ field, message }]
  if (errors) {
    form.setFields(errors.map(e => ({ name: e.field, errors: [e.message] })));
  } else {
    message.error(err.response?.data?.message || 'Có lỗi xảy ra');
  }
}
```

### 4.4. Thay MSW bằng dữ liệu giả trong file API

Đã cài xong trong repo — đây là đúng code đang chạy.

```js
// src/features/students/api/student.api.js
import axiosClient from '../../../lib/axiosClient';
import { mockStudents } from '../../../mocks/mockApi';
import { USE_MOCK } from '../../../lib/env';

export const studentApi = {
  getList: (params) => (USE_MOCK ? mockStudents.getList(params) : axiosClient.get('/students', { params })),
  create:  (data)   => (USE_MOCK ? mockStudents.create(data)    : axiosClient.post('/students', data)),
};
```

```js
// src/mocks/mockHelpers.js — bọc đúng envelope của API.md §1.1
export const ok = (data, message = 'Success') => ({ data: { code: 'OK', message, data } });

export const paginate = (rows, { page = 1, limit = 20 } = {}) =>
  ok({ items: rows.slice((page - 1) * limit, page * limit), total: rows.length, page, limit });

// Ném lỗi giống hệt axios để màn hình xử lý lỗi y như khi nối backend thật
export const fail = (status, code, message, extra = null) => {
  const err = new Error(message);
  err.response = { status, data: { code, message, data: extra } };
  throw err;
};
```

| File | Vai trò |
|------|---------|
| `src/mocks/mockDb.js` | Dữ liệu mẫu nhất quán: tòa, loại phòng, phòng, giường, sinh viên, đơn đăng ký, hợp đồng, hóa đơn, sản phẩm, đơn hàng |
| `src/mocks/mockApi.js` | Mỗi hàm tương ứng một endpoint trong `API.md`, **ném đúng lỗi nghiệp vụ** (`ROOM_FULL`, `GENDER_MISMATCH`, `SUPPLY_ALREADY_INCLUDED`…) |
| `src/lib/env.js` | Công tắc `USE_MOCK` — mặc định **bật**, đặt `VITE_USE_MOCK=false` để nối backend thật |

> ⚠️ **Bắt buộc:** dữ liệu giả phải trả **đúng envelope** `{ code, message, data }` và danh sách phải có `{ items, total, page, limit }` như `API.md` §1.1–1.2. Nếu lệch, khi nối API thật sẽ phải sửa lại toàn bộ màn hình. *(Bản v2.1 của mục này ghi `{ success, data, meta }` — sai, đã sửa.)*

### 4.5. Thay Zod bằng hàm `validate()` tự viết

**`src/utils/validate.js` (backend):**

```js
import { ApiError } from './ApiError.js';

/**
 * rules ví dụ:
 * { studentCode: { required: true, maxLength: 20 },
 *   phone:       { pattern: /^0\d{9}$/, message: 'SĐT không hợp lệ' },
 *   capacity:    { required: true, type: 'number', min: 1, max: 20 } }
 */
export function validate(body, rules) {
  const errors = [];

  for (const [field, rule] of Object.entries(rules)) {
    const value = body[field];
    const empty = value === undefined || value === null || value === '';

    if (rule.required && empty) {
      errors.push({ field, message: rule.message || `Trường ${field} là bắt buộc` });
      continue;
    }
    if (empty) continue;                       // không bắt buộc và bỏ trống thì bỏ qua

    if (rule.type === 'number' && isNaN(Number(value))) {
      errors.push({ field, message: `Trường ${field} phải là số` });
      continue;
    }
    if (rule.maxLength && String(value).length > rule.maxLength) {
      errors.push({ field, message: `Trường ${field} tối đa ${rule.maxLength} ký tự` });
    }
    if (rule.pattern && !rule.pattern.test(String(value))) {
      errors.push({ field, message: rule.message || `Trường ${field} sai định dạng` });
    }
    if (rule.min !== undefined && Number(value) < rule.min) {
      errors.push({ field, message: `Trường ${field} phải ≥ ${rule.min}` });
    }
    if (rule.max !== undefined && Number(value) > rule.max) {
      errors.push({ field, message: `Trường ${field} phải ≤ ${rule.max}` });
    }
  }

  if (errors.length) {
    // Lỗi theo từng trường đặt trong data.errors — frontend đọc bằng getFieldErrors() (API.md §1.1)
    throw new ApiError(400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', { errors });
  }
}
```

**Dùng ngay đầu hàm service:**
```js
export const createStudent = async (body) => {
  validate(body, {
    studentCode: { required: true, maxLength: 20 },
    fullName:    { required: true, maxLength: 150 },
    gender:      { required: true },
    phone:       { pattern: /^0\d{9}$/, message: 'Số điện thoại phải gồm 10 số, bắt đầu bằng 0' },
  });
  // ... phần còn lại
};
```

### 4.6. ⭐ Chống xếp trùng giường — cập nhật có điều kiện nguyên tử

**Đây là thay đổi quan trọng nhất.** Từ v2.2 sinh viên đăng ký theo **phòng**, hệ thống **tự gán giường** khi Staff duyệt đơn (`PRD.md` §2.10). Phương án "tìm giường trống → kiểm tra → ghi" **sai** vì có khe hở giữa lúc tìm và lúc ghi: hai Staff cùng duyệt hai đơn nhắm chỗ cuối cùng, cả hai cùng tìm thấy giường 06, cả hai cùng ghi thành công.

**Cách sai:**
```js
const bed = await Bed.findOne({ roomId, status: 'available' }).sort({ bedNumber: 1 });
if (!bed) throw new ApiError(409, 'ROOM_FULL', '...');   // ❌ khe hở nằm giữa dòng trên và dòng dưới
bed.status = 'occupied';
await bed.save();
```

**Cách đúng** — gộp "tìm" và "ghi" vào **một câu lệnh**. Một `findOneAndUpdate` trên một document là **nguyên tử** trong MongoDB, không cần transaction, không cần replica set:

```js
// modules/rooms/bed.service.js — HÀM CHIẾM GIƯỜNG DUY NHẤT của cả hệ thống
exports.claimBedInRoom = async (roomId) => {
  const bed = await Bed.findOneAndUpdate(
    { roomId, status: 'available' },          // điều kiện nằm TRONG query
    { $set: { status: 'occupied' } },
    { sort: { bedNumber: 1 }, new: true },    // lấy giường số nhỏ nhất
  );
  if (!bed) {
    throw new ApiError(409, 'ROOM_FULL', 'Phòng đã hết chỗ, vui lòng chọn phòng khác cùng loại');
  }
  return bed;
};

exports.markBedAvailable = (bedId) => Bed.findByIdAndUpdate(bedId, { status: 'available' });
```

```js
// modules/residencies/application.service.js — dùng hàm trên khi duyệt đơn
exports.approve = async (applicationId, actorId, { roomId } = {}) => {
  const app = await Application.findById(applicationId).populate('studentId');
  if (!app) throw new ApiError(404, 'NOT_FOUND', 'Không tìm thấy đơn đăng ký');
  if (app.status !== 'pending') {
    throw new ApiError(422, 'APPLICATION_NOT_PENDING', 'Đơn đăng ký đã được xử lý');
  }

  // 1. Phòng xếp: mặc định phòng sinh viên chọn; Staff đổi thì phải CÙNG LOẠI (BR-35)
  const room = await Room.findById(roomId || app.requestedRoomId).populate('roomTypeId');
  if (!room) throw new ApiError(404, 'NOT_FOUND', 'Không tìm thấy phòng');
  if (!room.roomTypeId._id.equals(app.roomTypeId)) {
    throw new ApiError(422, 'ROOM_TYPE_MISMATCH', 'Chỉ được đổi sang phòng cùng loại với đơn đăng ký');
  }

  // 2. Kiểm tra LẠI giới tính — Staff có thể vừa đổi phòng (BR-06)
  if (room.gender !== app.studentId.gender) {
    const label = room.gender === 'male' ? 'nam' : 'nữ';
    throw new ApiError(422, 'GENDER_MISMATCH', `Phòng này chỉ dành cho sinh viên ${label}`);
  }

  // 3. ⭐ GÁN GIƯỜNG — nguyên tử (BR-20). Thất bại ở đây thì CHƯA GHI GÌ CẢ.
  const bed = await bedService.claimBedInRoom(room._id);

  // 4. Các bước sau. Lỗi thì PHẢI trả giường lại (BR-36).
  try {
    const residency = await Residency.create({
      studentId: app.studentId._id, bedId: bed._id, applicationId: app._id,
      startDate: app.startDate, status: 'active', createdBy: actorId,
    });
    const contract = await Contract.create({
      contractCode: await generateContractCode(),
      applicationId: app._id, residencyId: residency._id,
      studentId: app.studentId._id, bedId: bed._id, roomTypeId: room.roomTypeId._id,
      startDate: app.startDate, endDate: app.endDate,
      monthlyPrice:  room.roomTypeId.pricePerMonth,   // chốt giá lúc duyệt (BR-27)
      depositAmount: room.roomTypeId.depositAmount,
      status: 'active',
    });
    const invoices = await invoiceService.createInitialInvoices(contract);   // HAI hóa đơn (BR-25)

    Object.assign(app, {
      status: 'approved', assignedRoomId: room._id, assignedBedId: bed._id,
      contractId: contract._id, reviewedBy: actorId, reviewedAt: new Date(),
    });
    await app.save();

    return { application: app, assigned: { roomNumber: room.roomNumber, bedCode: bed.bedCode }, contract, invoices };
  } catch (err) {
    await bedService.markBedAvailable(bed._id);   // hoàn tác
    throw err;
  }
};
```

> 💡 **Vì sao tự gán lại dễ hơn cho nhóm:** trước đây có nhiều chỗ nhận `bedId` từ client và mỗi chỗ phải tự chiếm giường đúng cách. Giờ **cả hệ thống chỉ có một hàm chiếm giường** — `claimBedInRoom` — nên chỉ cần viết đúng và kiểm thử đúng một lần.

**Lớp bảo vệ thứ hai** ở tầng CSDL — partial unique index, MongoDB hỗ trợ sẵn:

```js
// modules/residencies/residency.model.js
residencySchema.index(
  { bedId: 1 },
  { unique: true, partialFilterExpression: { status: 'active' } },
);
```

**So sánh hai phương án:**

| | Đọc-rồi-ghi | `findOneAndUpdate` có điều kiện |
|---|---|---|
| Số dòng code | ~6 | **3** |
| Cần transaction / replica set | Có (nếu muốn đúng) | **Không** |
| Chống tranh chấp | ❌ Có khe hở | ✅ |
| Dễ giải thích khi bảo vệ | Khó | **Dễ** |

> 💡 **Điểm cộng khi báo cáo:** đây là một giải pháp race condition đàng hoàng và dễ trình bày. Viết vào mục 4.4.1 của báo cáo theo mạch: *nêu vấn đề → vì sao đọc-rồi-ghi là sai → vì sao điều kiện trong query là đúng*.

**Test bắt buộc:** TC-42 (hai Staff cùng duyệt hai đơn nhắm chỗ cuối cùng) và TC-53 (lỗi giữa chừng phải trả giường) phải đạt.

### 4.7. Xuất CSV thay cho Excel

```js
// utils/csv.js
export function toCsv(rows, columns) {
  const escape = (v) => {
    const s = String(v ?? '');
    // Chặn CSV injection (xem 07 mục 5.2)
    const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const header = columns.map((c) => escape(c.title)).join(',');
  const body = rows.map((r) => columns.map((c) => escape(r[c.key])).join(',')).join('\n');
  return '﻿' + header + '\n' + body;   // BOM để Excel đọc đúng tiếng Việt
}

// controller
const csv = toCsv(students, [
  { key: 'studentCode', title: 'MSSV' },
  { key: 'fullName',    title: 'Họ tên' },
  { key: 'roomNumber',  title: 'Phòng' },
  { key: 'totalDebt',   title: 'Công nợ' },
]);
res.setHeader('Content-Type', 'text/csv; charset=utf-8');
res.setHeader('Content-Disposition', 'attachment; filename="danh-sach-sinh-vien.csv"');
res.send(csv);
```

> ⚠️ Ký tự `﻿` (BOM) ở đầu file là **bắt buộc** — thiếu nó Excel sẽ hiển thị tiếng Việt thành ký tự lỗi.

### 4.8. In PDF bằng trình duyệt

Không cần thư viện. Tạo một trang chỉ để in, thêm CSS ẩn các phần thừa, rồi gọi `window.print()`. Người dùng chọn "Lưu thành PDF" trong hộp thoại in của trình duyệt.

```css
@media print {
  .no-print, .ant-layout-sider, .ant-layout-header, .ant-btn { display: none !important; }
  .print-area { width: 100%; padding: 0; }
  @page { margin: 1.5cm; }
}
```
```jsx
<Button className="no-print" onClick={() => window.print()}>🖨 In hóa đơn</Button>
<div className="print-area">{/* nội dung hóa đơn */}</div>
```

### 4.9. Gộp các tác vụ nền thành 1 cron job

```js
// core/jobs/daily-job.js
const cron = require('node-cron');
const Contract = require('../../modules/contracts/contract.model');
const Residency = require('../../modules/residencies/residency.model');
const Bed = require('../../modules/rooms/bed.model');
const Invoice = require('../../modules/fees/invoice.model');
const Payment = require('../../modules/payments/payment.model');
const supplyOrderService = require('../../modules/supplies/supply-order.service');

async function runDailyTasks() {
  console.log('[CRON] Bắt đầu tác vụ hằng ngày', new Date().toISOString());
  const now = new Date();

  // 1. Hợp đồng hết hạn → expired, đóng Residency, giải phóng giường (BR-28)
  const expired = await Contract.find({ status: 'active', endDate: { $lt: now } });
  for (const c of expired) {
    await Contract.findByIdAndUpdate(c._id, { status: 'expired' });
    await Residency.findByIdAndUpdate(c.residencyId, { status: 'closed', endDate: now });
    await Bed.findByIdAndUpdate(c.bedId, { status: 'available' });
  }
  console.log(`[CRON] Đã cho hết hạn ${expired.length} hợp đồng`);

  // 2. Đơn nhu yếu phẩm quá hạn chưa thanh toán → hủy cả đơn và hóa đơn (BR-97)
  //    Chạy TRƯỚC bước 3, để các hóa đơn này không bị đánh dấu overdue rồi mới hủy
  const cancelledOrders = await supplyOrderService.cancelOverdue(now);
  console.log(`[CRON] Đã tự hủy ${cancelledOrders} đơn nhu yếu phẩm quá hạn`);

  // 3. Hóa đơn quá hạn → overdue (BR-56)
  const r2 = await Invoice.updateMany(
    { status: { $in: ['unpaid', 'partial'] }, dueDate: { $lt: now } },
    { status: 'overdue' },
  );
  console.log(`[CRON] Đã đánh dấu quá hạn ${r2.modifiedCount} hóa đơn`);

  // 4. Giao dịch treo quá 15 phút → expired (BR-64)
  const limit = new Date(now - 15 * 60 * 1000);
  const r3 = await Payment.updateMany(
    { status: 'pending', createdAt: { $lt: limit } },
    { status: 'expired' },
  );
  console.log(`[CRON] Đã cho hết hạn ${r3.modifiedCount} giao dịch treo`);

  // 5. Đối soát trạng thái giường với Residency thực tế
  // ... so sánh Bed.status với Residency active, ghi log nếu lệch và tự sửa

  console.log('[CRON] Hoàn tất');
}

// Chạy 00:05 mỗi ngày, chỉ trên một instance
function startJobs() {
  if (process.env.ENABLE_CRON !== 'true') return;
  cron.schedule('5 0 * * *', runDailyTasks, { timezone: 'Asia/Ho_Chi_Minh' });
}

// Cho phép chạy tay để test: npm run job
if (process.argv[2] === 'run-now') runDailyTasks().then(() => process.exit(0));

module.exports = { startJobs, runDailyTasks };
```

> 💡 Thêm `"job": "node src/core/jobs/daily-job.js run-now"` vào `package.json` để test mà không phải chờ đến nửa đêm.

### 4.10. ⭐ Thanh toán VNPay — bỏ IPN, xác thực tại Return URL

**Vì sao đổi:** IPN là lời gọi từ máy chủ VNPay đến máy chủ của ta. Khi lập trình ở máy cá nhân, VNPay **không gọi được vào `localhost`**, buộc phải dựng ngrok — thêm một công cụ, thêm một lớp trục trặc, và rất khó gỡ lỗi.

**Phương án mới:** sau khi thanh toán, VNPay chuyển hướng **trình duyệt** về `Return URL` kèm các tham số và chữ ký. Frontend lấy nguyên chuỗi tham số đó gửi về backend; backend **xác thực chữ ký HMAC** rồi mới ghi nhận.

```mermaid
sequenceDiagram
    actor SV as Sinh viên
    participant FE as Frontend
    participant API as Backend
    participant VNP as VNPay Sandbox

    SV->>FE: Bấm "Thanh toán"
    FE->>API: POST /portal/invoices/:id/pay
    API->>API: Tạo payment PENDING + ký dữ liệu
    API-->>FE: { paymentUrl, transactionRef }
    FE->>VNP: Chuyển hướng tới paymentUrl
    SV->>VNP: Nhập thẻ test, xác nhận
    VNP->>FE: Chuyển hướng về /portal/payment-result?vnp_...&vnp_SecureHash=...
    FE->>API: POST /payments/vnpay/verify (gửi nguyên query params)
    API->>API: Xác thực chữ ký HMAC (BR-61)
    API->>API: Nếu payment đã SUCCESS → bỏ qua (BR-56)
    API->>API: Ghi nhận thanh toán, cập nhật hóa đơn
    API-->>FE: Trạng thái cuối cùng
    FE-->>SV: "Thanh toán thành công"
```

```js
// controllers/payment.controller.js
export const verifyVnpayReturn = asyncHandler(async (req, res) => {
  const params = { ...req.body };                  // toàn bộ vnp_* frontend gửi lên
  const receivedHash = params.vnp_SecureHash;
  delete params.vnp_SecureHash;
  delete params.vnp_SecureHashType;

  // 1. Xác thực chữ ký — không có secret thì không giả mạo được (BR-61)
  const signData = new URLSearchParams(sortObject(params)).toString();
  const expectedHash = crypto
    .createHmac('sha512', process.env.VNP_HASH_SECRET)
    .update(Buffer.from(signData, 'utf-8'))
    .digest('hex');

  if (receivedHash !== expectedHash) {
    console.warn('[BẢO MẬT] Chữ ký VNPay không hợp lệ:', params.vnp_TxnRef);
    throw new ApiError(400, 'GATEWAY_SIGNATURE_INVALID', 'Chữ ký giao dịch không hợp lệ');
  }

  const result = await paymentService.confirmPayment({
    transactionRef: params.vnp_TxnRef,
    amount: Number(params.vnp_Amount) / 100,
    success: params.vnp_ResponseCode === '00',
    gatewayTxnId: params.vnp_TransactionNo,
    raw: params,
  });

  res.json({ code: 'OK', message: 'Success', data: result });
});
```

```js
// modules/payments/payment.service.js — phần quan trọng: idempotent (BR-62)
exports.confirmPayment = async ({ transactionRef, amount, success, gatewayTxnId, raw }) => {
  const payment = await Payment.findOne({ transactionRef });
  if (!payment) throw new ApiError(404, 'NOT_FOUND', 'Không tìm thấy giao dịch');

  // Đã xử lý rồi thì trả về luôn, KHÔNG ghi nhận lần hai (BR-62)
  if (payment.status === 'success') {
    return { alreadyConfirmed: true, payment };
  }

  // Số tiền không khớp → cần đối soát tay, không tự cập nhật (BR-63)
  if (payment.amount !== amount) {
    payment.gatewayRawResponse = raw;
    await payment.save();
    throw new ApiError(422, 'AMOUNT_MISMATCH', 'Số tiền giao dịch không khớp, cần đối soát');
  }

  payment.status = success ? 'success' : 'failed';
  payment.gatewayTransactionId = gatewayTxnId;
  payment.gatewayRawResponse = raw;
  if (success) payment.paidAt = new Date();
  await payment.save();

  if (!success) return { alreadyConfirmed: false, payment, invoice: null };

  const invoice = await recalculateInvoice(payment.invoiceId);   // BR-43
  return { alreadyConfirmed: false, payment, invoice };
};

/** Luôn TÍNH LẠI paidAmount từ các Payment thành công, không cộng dồn (BR-43) */
async function recalculateInvoice(invoiceId) {
  const invoice = await Invoice.findById(invoiceId);
  const agg = await Payment.aggregate([
    { $match: { invoiceId: invoice._id, status: 'success', type: 'payment' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  invoice.paidAmount = agg[0]?.total || 0;

  if (invoice.paidAmount >= invoice.totalAmount)  invoice.status = 'paid';
  else if (invoice.paidAmount > 0)                invoice.status = 'partial';
  else if (invoice.dueDate < new Date())          invoice.status = 'overdue';
  else                                            invoice.status = 'unpaid';

  await invoice.save();
  return invoice;
}
```

**Đánh đổi phải ghi vào báo cáo:** nếu sinh viên **đóng trình duyệt ngay sau khi thanh toán** mà chưa kịp quay về, giao dịch sẽ ở trạng thái `pending` dù tiền đã trừ. Khắc phục bằng **nút "Đối soát giao dịch"** cho nhân viên (đã có sẵn `POST /payments/:id/reconcile` — gọi API truy vấn kết quả của VNPay để cập nhật). Ở hệ thống chạy thật nên bổ sung IPN; ở phạm vi đồ án, phương án này là đủ.

> ✅ **Vẫn giữ được điểm:** cả 3 test case bảo mật quan trọng nhất — chữ ký sai (TC-103), gửi trùng (TC-104), lệch số tiền (TC-105) — đều vẫn kiểm tra được bằng cách gọi thẳng `POST /payments/vnpay/verify` bằng Postman. **Không cần ngrok.**

### 4.11. Bỏ refresh token

```js
// Đăng nhập: chỉ cấp một token
const token = jwt.sign(
  { userId: user.id, role: user.role, studentId: user.studentId },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```

```js
// api/axiosClient.js — interceptor gọn lại còn thế này
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';       // hết hạn thì đăng nhập lại
    }
    return Promise.reject(err);
  }
);
```

**Đánh đổi:** token sống 7 ngày, nếu bị lộ thì kẻ tấn công dùng được lâu hơn. Chấp nhận được ở phạm vi đồ án; ghi vào mục "Hạn chế" của báo cáo.

### 4.12. Bỏ bảng `system_config` — dùng file hằng số

```js
// config/settings.js
export const SETTINGS = {
  CONTRACT_EXPIRING_WARNING_DAYS: 30,   // BR-29
  INITIAL_INVOICE_DUE_DAYS: 7,          // BR-26: max(startDate, ngày duyệt) + 7
  INVOICE_DUE_DAY_OF_MONTH: 10,
  ELECTRICITY_PRICE: 2500,              // đ/kWh
  WATER_PRICE: 12000,                   // đ/m³
  PAYMENT_TIMEOUT_MINUTES: 15,          // BR-64
  SUPPLY_ORDER_DUE_DAYS: 3,             // BR-94
  SUPPLY_MAX_QUANTITY: 5,               // BR-93
  // Giá thuê và tiền cọc KHÔNG nằm ở đây — thuộc từng loại phòng (RoomType)
  DORMITORY_NAME: 'Ký túc xá ABC',
};
```

**Đánh đổi:** muốn đổi đơn giá điện phải sửa code và deploy lại, thay vì sửa trên giao diện. Với KTX, các giá này gần như không đổi trong một học kỳ nên không ảnh hưởng thực tế.

> ⚠️ **Ngoại lệ quan trọng:** đơn giá điện/nước tại thời điểm lập hóa đơn **vẫn phải lưu vào collection `UtilityReading`** (cột `electricity_unit_price`, `water_unit_price`). Nếu chỉ đọc từ file hằng số, khi đổi giá thì hóa đơn cũ sẽ bị tính lại sai.

### 4.13. Bỏ bảng `audit_log` — ghi log ra file

```js
// utils/logger.js
export const logAction = (userId, action, entity, entityId, extra = '') => {
  console.log(`[AUDIT] ${new Date().toISOString()} | user=${userId} | ${action} | ${entity}#${entityId} | ${extra}`);
};

// Dùng ở service
logAction(actorId, 'APPROVE', 'application', app.applicationCode, `bed=${bed.bedCode}`);
```

Trên Render, log này xem được ở tab **Logs**. Đủ để truy vết khi cần, và vẫn trình bày được trong báo cáo là "có ghi nhật ký thao tác".

---

## 5. Cơ sở dữ liệu sau đơn giản hóa — 16 collection

Chi tiết đầy đủ ở `DATA-SCHEMA.md`. Bảng dưới tóm tắt những gì đã **bỏ bớt** so với thiết kế ban đầu và những gì **thêm** ở v2.2.

| # | Collection | Trạng thái |
|---|------------|-----------|
| 1 | `User` | Giữ (bỏ trường đếm lần đăng nhập sai và khóa tạm) |
| 2 | `Student` | Giữ |
| 3 | `Building` | Giữ |
| 4 | `RoomType` | 🆕 v2.2 — hạng × sức chứa, giá, tiền cọc, đồ cấp sẵn |
| 5 | `Room` | Giữ — có `gender` (BR-06); **bỏ `pricePerBed`**, thêm `roomTypeId` |
| 6 | `Bed` | Giữ — chỉ 3 trạng thái, **tự sinh**, thêm `bedNumber` |
| 7 | `Application` | 🆕 v2.2 — đơn đăng ký, duyệt thì tự gán giường |
| 8 | `Residency` | Giữ |
| 9 | `Contract` | Giữ — **bỏ trạng thái `pending`** |
| 10 | `FeeType` | Giữ |
| 11 | `UtilityReading` | Giữ |
| 12 | `Invoice` | Giữ (nhúng `lineItems`); thêm loại `supplies` |
| 13 | `Payment` | Giữ |
| 14 | `Request` | Giữ |
| 15 | `SupplyItem` | 🆕 v2.2 — danh mục nhu yếu phẩm |
| 16 | `SupplyOrder` | 🆕 v2.2 — đơn nhu yếu phẩm |
| ~~–~~ | ~~`AuditLog`~~ | ❌ Bỏ → ghi log ra file (mục 4.13) |
| ~~–~~ | ~~`SystemConfig`~~ | ❌ Bỏ → file hằng số (mục 4.12) |
| ~~–~~ | ~~`RoomTransfer`~~ | ❌ Bỏ → chuyển phòng ngoài phạm vi v1 (`PRD.md` §3) |

**Đơn giản hóa ở tầng dữ liệu:**

- **`InvoiceItem` nhúng vào `Invoice`** thay vì tách collection riêng. MongoDB làm việc này tự nhiên; dòng phí không bao giờ được truy vấn độc lập khỏi hóa đơn.
- **Không dùng transaction** — thay bằng `findOneAndUpdate` có điều kiện (mục 4.6). Nhờ đó chạy được trên `mongod` thường, không cần replica set.
- **Partial unique index** thì vẫn dùng — MongoDB hỗ trợ sẵn bằng `partialFilterExpression`, viết ngay trong schema, không cần migration thủ công:

```js
residencySchema.index({ bedId: 1 }, { unique: true, partialFilterExpression: { status: 'active' } });
requestSchema.index({ contractId: 1, type: 1 }, { unique: true, partialFilterExpression: { status: 'pending' } });
applicationSchema.index({ studentId: 1 }, { unique: true, partialFilterExpression: { status: 'pending' } });
```

## 6. Cấu trúc thư mục sau đơn giản hóa

### 6.1. Backend — 2 tầng

```
src/
├── server.js
├── app.js
├── config/
│   ├── env.js
│   ├── database.js          # export mongoose client
│   └── settings.js          # ⭐ MỚI: hằng số thay bảng system_config
├── middlewares/
│   ├── auth.middleware.js   # authenticate + authorize (gộp 1 file)
│   └── error.middleware.js
├── routes/                  # 14 file router
├── controllers/             # mỏng: nhận req → gọi service → trả res
├── services/                # ⭐ TOÀN BỘ nghiệp vụ + gọi Mongoose trực tiếp
├── utils/
│   ├── ApiError.js
│   ├── ApiResponse.js
│   ├── asyncHandler.js
│   ├── validate.js          # ⭐ MỚI: thay Zod
│   ├── csv.js               # ⭐ MỚI: thay exceljs
│   ├── codeGenerator.js
│   └── logger.js
├── gateways/
│   └── vnpay.js             # chỉ còn VNPay
└── jobs/
    └── dailyJob.js          # ⭐ 1 file duy nhất
```
**Đã bỏ:** `repositories/`, `validators/`, `docs/swagger.js`, `gateways/zalopay.js`, 5 file job.

### 6.2. Frontend

```
src/
├── main.jsx                 # bọc <AuthProvider> + <ConfigProvider locale={viVN}>
├── App.jsx
├── api/                     # axiosClient.js + 11 file *Api.js
├── context/
│   └── AuthContext.jsx      # ⭐ MỚI: thay Zustand
├── hooks/
│   ├── useApi.js            # ⭐ MỚI: thay TanStack Query
│   └── useDebounce.js
├── components/
│   ├── common/              # StatusTag, MoneyText, ConfirmModal, EmptyState, PageHeader
│   └── layout/              # AdminLayout, PortalLayout
├── pages/                   # ⭐ Gộp phẳng theo module, bỏ cấu trúc features/ nhiều tầng
│   ├── auth/
│   ├── students/
│   ├── facilities/
│   ├── contracts/
│   ├── invoices/
│   ├── payments/
│   ├── requests/
│   ├── dashboard/
│   └── portal/
├── routes/
│   ├── AppRoutes.jsx
│   └── RoleRoute.jsx        # gộp ProtectedRoute vào đây
├── constants/
│   ├── statuses.js          # giữ nguyên — rất quan trọng
│   └── roles.js
├── mocks/
│   ├── mockDb.js            # ⭐ dữ liệu mẫu nhất quán
│   ├── mockHelpers.js       # ok / paginate / fail — đúng envelope API.md
│   └── mockApi.js           # mỗi hàm = một endpoint
└── utils/
    ├── formatter.js
    └── permission.js
```

**Đã bỏ:** cấu trúc `features/<x>/{pages,components,hooks}` 3 tầng → gộp còn `pages/<module>/`. `components/table/`, `components/form/` (dùng thẳng Ant Design).

---

## 7. Lộ trình sau đơn giản hóa

Vẫn 12 tuần, nhưng **có thêm dư địa**:

| Sprint | Tuần | Trước (MD) | Sau (MD) | Thay đổi chính |
|--------|------|------------|----------|----------------|
| S0 Chuẩn bị | 1–2 | 25 | **25** | Không đổi (tài liệu đã xong) |
| S1 Nền tảng | 3–4 | 34 | **24** | Bỏ refresh token, Repository, MSW, CI, Swagger |
| S2 Cốt lõi | 5–6 | 36 | **29** | Xếp giường đơn giản hơn nhiều (mục 4.6) |
| S3 Tài chính | 7–8 | 34 | **25** | Bỏ ZaloPay, bỏ IPN/ngrok, CSV thay Excel |
| S4 Cổng SV + BC | 9–10 | 32 | **26** | Form Ant Design, hook đơn giản |
| S5 Hoàn thiện | 11–12 | 34 | **26** | 65 test case thay 128, bỏ test tự động diện rộng |
| Dự phòng | – | 11 | **0** | Phần dư nằm luôn trong các sprint |
| **Tổng** | | **206** | **155** | **↓ 25%** |

**Bậc B hạ tiếp xuống ~120 ngày công** nhờ 10 thay đổi ở mục 13 (1 repo, 1 nhánh, gộp file, form dùng modal, làm mẫu rồi nhân bản).

| Quy mô nhóm | Năng lực (MD) | Bậc A (155 MD) | **Bậc B (120 MD)** |
|-------------|---------------|----------------|---------------------|
| 5 người | 180 | kín 72% | **kín 56% — thoải mái** |
| 5 người | 180 | kín 86% | **kín 67% — ổn** |
| 4 người | 144 | kín 108% ❌ | **kín 83% — sát nhưng làm được** |
| 3 người | 108 | không khả thi | **kín 111% ❌ — cần cắt thêm theo mục 9** |

*(Giả định mỗi người đóng góp 3 ngày công/tuần trong 12 tuần.)*

> 💡 **Với nhóm intern, hãy dành hẳn tuần 2 cho việc tự học** theo mục 14.1. Thời gian đó đã được tính vào 120 ngày công. Bỏ qua bước học để "làm cho nhanh" thường khiến Sprint 2–3 chậm gấp đôi.

---

## 8. Kiểm thử sau đơn giản hóa

### 8.1. Bỏ yêu cầu độ phủ 60%

Thay bằng: **viết unit test cho đúng 3 hàm nguy hiểm nhất**, khoảng 10 test:

| Hàm | Vì sao phải test | Số test |
|-----|------------------|---------|
| `splitUtilityCost(total, students)` | Chia đều có dư, dễ sai tổng (BR-51) | 4 |
| `calculateProRatedRent(price, days, daysInMonth)` | Tính tiền theo ngày khi trả sớm (BR-32) | 3 |
| `calculateSettlement(deposit, debt)` | Hoàn cọc, trường hợp âm (BR-54) | 3 |

```js
// tests/money.test.js
import { splitUtilityCost } from '../src/utils/money.js';

test('chia đều hết', () => {
  expect(splitUtilityCost(900000, 6)).toEqual([150000,150000,150000,150000,150000,150000]);
});

test('chia có dư — tổng phải bằng đúng số ban đầu', () => {
  const parts = splitUtilityCost(576000, 7);
  expect(parts.reduce((a,b) => a+b, 0)).toBe(576000);   // ⭐ bất biến quan trọng nhất
  expect(parts[0]).toBe(82290);                          // người đầu nhận phần dư
  expect(parts[1]).toBe(82285);
});
```

### 8.2. Danh sách test case đã rút gọn nằm ở `11`

Bản gốc có 128 test case. Việc rút gọn đã được áp thẳng vào `11-KE-HOACH-KIEM-THU.md` — hiện còn **111 test case**, giữ toàn bộ test "Rất cao"/"Cao" và bỏ bớt test "Trung bình" của CRUD thông thường. Không duy trì một danh sách rút gọn thứ hai ở đây để tránh hai bản lệch nhau.

Thiếu thời gian thì chạy theo thứ tự:
1. **16 test "không được cắt"** ở `11` mục 6 (tranh chấp chỗ cuối, đổi phòng khác giới, thất thu điện nước, bảo mật thanh toán, quyết toán cọc, IDOR, giá giả, webhook lặp, tự hủy đơn quá hạn).
2. Toàn bộ test ưu tiên **Rất cao**.
3. Toàn bộ test ưu tiên **Cao**.

---

## 9. Nếu vẫn thấy khó — cắt tiếp theo thứ tự này

Chỉ dùng khi đến cuối tuần 8 vẫn chậm tiến độ. Cắt từ trên xuống, **dừng ngay khi đủ**:

| Bậc | Cắt gì | Tiết kiệm | Ảnh hưởng tới báo cáo |
|-----|--------|-----------|------------------------|
| 1 | Sơ đồ tòa nhà trực quan (FR-26) → dùng bảng phòng thường | 2 MD | Nhẹ, chỉ kém đẹp |
| 2 | Xuất CSV các báo cáo (FR-17) | 2 MD | Ghi vào mục Hạn chế |
| 3 | Biểu đồ dashboard (FR-70) → giữ các thẻ chỉ số | 2 MD | Nhẹ |
| 4 | Nhu yếu phẩm phía quản trị → chỉ giữ tab đơn hàng, danh mục nạp bằng seed (FR-100) | 1,5 MD | Ghi vào Hạn chế |
| 5 | In PDF (FR-33, FR-71) | 1 MD | Không đáng kể |
| 6 | Vai trò Viewer → còn 3 vai trò | 2 MD | Nhẹ, RBAC vẫn chứng minh được |
| 7 | Thanh toán online (FR-64) → chỉ ghi nhận thủ công | 6 MD | **Nặng** — mất một điểm nhấn kỹ thuật lớn |

**Không bao giờ cắt:** xác thực & phân quyền · hợp đồng lưu trú · hóa đơn · cổng sinh viên cơ bản · kiểm thử · deploy.

---

## 10. Cách trình bày trong báo cáo

Đơn giản hóa **không phải điểm trừ** nếu trình bày đúng cách. Viết vào mục **3.1.4 "Lựa chọn công nghệ và lý do"** của báo cáo (xem `12` mục 1):

> *"Nhóm cân nhắc hai phương án chống tranh chấp khi xếp giường: (a) dùng MongoDB transaction để bọc bước kiểm tra và bước ghi, và (b) cập nhật có điều kiện nguyên tử bằng `findOneAndUpdate`. Cả hai đều ngăn được tình trạng hai sinh viên cùng một giường. Nhóm chọn phương án (b) vì: (1) MongoDB transaction yêu cầu cụm chạy ở chế độ replica set, buộc mọi thành viên phải cấu hình thêm và không chạy được trên bản cài mặc định; (2) thao tác cập nhật một document vốn đã là nguyên tử, nên phương án (b) đúng mà không cần thêm hạ tầng; (3) mã nguồn ngắn hơn, dễ kiểm thử và dễ bảo trì. Đánh đổi là không bọc được nhiều document trong một đơn vị nguyên tử, nhưng nghiệp vụ xếp giường chỉ cần đảm bảo nguyên tử trên đúng một document `Bed`, nên đánh đổi này không gây rủi ro."*

**Mẫu lập luận dùng lại được cho mọi lựa chọn:** *đã cân nhắc những phương án nào → chọn cái nào → vì ba lý do cụ thể → đánh đổi là gì → vì sao đánh đổi đó chấp nhận được trong bối cảnh này.*

Giảng viên đánh giá cao **lập luận có cân nhắc** hơn là dùng công nghệ phức tạp mà không giải thích được vì sao. Ngược lại, dùng TanStack Query hay `FOR UPDATE` mà không trả lời được "vì sao chọn nó" mới là điểm trừ thật.

---

## 13. BẬC B — Hạ thêm một bậc cho nhóm mới bắt đầu

> Áp dụng khi cả nhóm ở mức **intern/mới học**, chưa từng làm dự án web hoàn chỉnh. 10 thay đổi dưới đây **không cắt chức năng nào**, chỉ giảm số file phải viết và số khái niệm phải nắm.

| # | Hạng mục | Bậc A | **Bậc B** | Tiết kiệm |
|---|----------|-------|-----------|-----------|
| B1 | Repository Git | 2 repo, tài liệu nhân đôi | **2 repo, tài liệu chỉ ở repo FE** | Không bao giờ lệch tài liệu |
| B2 | Nhánh Git | `main` + `develop` + `feature/*` | **`main` + `feature/*`** (bỏ `develop`) | Bớt một lần merge mỗi tính năng |
| B3 | File backend mỗi module | route + controller + service | **route (gộp controller) + service** | ↓ 1 file × 14 module = 14 file |
| B4 | Màn hình thêm/sửa | Trang riêng + route riêng | **Modal ngay trong trang danh sách** | ↓ 11 màn hình, ↓ 11 route |
| B5 | Dữ liệu mẫu | 400 giường, 120 SV | **200 giường, 60 SV** | Seed nhanh, dễ kiểm tra bằng mắt |
| B6 | Sơ đồ tòa nhà | Vẽ lưới tùy biến | **Lưới `Card` của Ant Design** | Không phải tự vẽ CSS |
| B7 | Biểu đồ | 2 biểu đồ Recharts | **1 biểu đồ cột** + thanh `Progress` cho tỷ lệ lấp đầy | Bớt học 1 loại biểu đồ |
| B8 | Lọc/tìm kiếm | Đồng bộ với URL query string | **State thường trong component** | Bớt `useSearchParams` |
| B9 | Thứ tự làm việc | FE và BE song song từ đầu | **Làm mẫu trọn 1 module trước (mục 15), rồi nhân bản** | Học 1 lần, lặp 8 lần |
| B10 | Tài liệu phải đọc trước khi code | 7 tài liệu | **3: `02` (chức năng) · `14` mục 15 (mẫu code) · `API.md` (API của module đang làm)** | Đỡ ngợp |

### 13.1. B1 — Hai repository, tài liệu để ở một nơi

Nhóm dùng **2 repo riêng**, cả 5 thành viên đều có quyền trên cả hai:

| Repo | Nội dung | Ai làm chính |
|------|----------|--------------|
| `FE_QuanLyKTX` | Code React + **toàn bộ `docs/`** | 2 người FE |
| `BE_QuanLyKTX` | Code Node.js + Express + Mongoose | 3 người BE |

**Tài liệu chỉ nằm ở một chỗ** — thư mục `docs/` của repo FE. Repo BE **không sao chép lại**, chỉ trỏ link trong `README.md` của nó:

```markdown
# BE_QuanLyKTX — Backend Hệ thống quản lý ký túc xá

📖 **Toàn bộ tài liệu dự án nằm ở repo frontend:**
https://github.com/<tài-khoản>/FE_QuanLyKTX/tree/main/docs

Đọc trước khi code:
- [PRD.md](...) — phạm vi v1
- [ARCHITECTURE.md](...) — cấu trúc `modules/`, phân tầng, kết nối MongoDB
- [API.md](...) — hợp đồng endpoint (**sửa file này trước khi đổi API**)
- [DATA-SCHEMA.md](...) — 12 collection
- [03-PHAN-TICH-NGHIEP-VU.md](...) — 67 quy tắc BR phải cài ở tầng service
```

> ⚠️ **Tuyệt đối không sao chép `docs/` sang repo BE.** Hai bản sẽ lệch nhau chỉ sau vài ngày, và lúc đó không ai biết bản nào đúng. Một nguồn duy nhất, dù phải mở sang repo khác để đọc.

**Vì sao 2 repo mà không phải 1?**

| | 2 repo (đang dùng) | 1 repo 2 thư mục |
|---|---|---|
| Deploy | Render trỏ thẳng repo BE, Vercel trỏ repo FE — không cần cấu hình Root Directory | Phải điền Root Directory cho cả hai |
| Lịch sử commit | Tách bạch, dễ thấy ai làm gì | Trộn lẫn |
| Xung đột khi merge | Gần như không có giữa FE và BE | Hay đụng ở file gốc |
| Tài liệu | Phải nhớ docs nằm ở repo FE | Nằm giữa, ai cũng thấy |
| Clone khi vào dự án | 2 lần | 1 lần |

Cả hai đều ổn. Nhóm đã chọn 2 repo — chỉ cần **nhớ đúng một điều: tài liệu ở repo FE**.

### 13.2. B2 — Chỉ dùng nhánh `main`

```bash
git checkout main && git pull          # đầu mỗi buổi làm
git checkout -b feature/student-management
# ... code ...
git add . && git commit -m "feat(student): add student list page"
git push -u origin feature/student-management
# Mở PR trên GitHub → 1 người xem qua → Merge vào main → xóa nhánh
```

Vẫn giữ 2 quy tắc quan trọng nhất: **không push thẳng vào `main`** và **mỗi tính năng một nhánh**. Chỉ bỏ tầng `develop` ở giữa.

### 13.3. B3 — Gộp controller vào file route

Mỗi module backend chỉ còn **2 file**:

```js
// backend/src/modules/students/student.routes.js   ← route + xử lý request gộp làm một
const express = require('express');
const studentService = require('./student.service');
const { authenticate, authorize } = require('../../core/middlewares/auth.middleware');
const { asyncHandler } = require('../../core/utils/asyncHandler');

const router = express.Router();

router.get('/', authenticate, authorize('admin', 'staff', 'viewer'), asyncHandler(async (req, res) => {
  const data = await studentService.getList(req.query);          // { items, total, page, limit }
  res.json({ code: 'OK', message: 'Success', data });
}));

router.post('/', authenticate, authorize('admin', 'staff'), asyncHandler(async (req, res) => {
  const student = await studentService.create(req.body);
  res.status(201).json({ code: 'OK', message: 'Thêm sinh viên thành công', data: student });
}));

module.exports = router;
```

> Envelope luôn là `{ code, message, data }` (`API.md` §1.1). Bản đầy đủ của file này ở mục 15.3.

**Quy tắc vẫn phải giữ:** file route **chỉ** đọc `req` và trả `res`. Mọi câu `if` nghiệp vụ và mọi lời gọi `mongoose` nằm trong `services/`. Gộp file **không** có nghĩa là gộp trách nhiệm.

### 13.4. B4 — Form thêm/sửa dùng Modal, không tạo trang riêng

Thay vì 3 màn hình (danh sách / thêm mới / sửa) với 3 route, chỉ còn **1 màn hình** chứa một `Modal`:

```jsx
export default function StudentListPage() {
  const [filters, setFilters] = useState({ page: 1, limit: 20, search: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState(null);   // null = thêm mới, có giá trị = sửa

  const { data, meta, loading, refetch } = useApi(() => studentApi.getList(filters), [filters]);

  const openAdd  = ()      => { setEditing(null); setModalOpen(true); };
  const openEdit = (record) => { setEditing(record); setModalOpen(true); };

  const handleSaved = () => { setModalOpen(false); refetch(); };

  return (
    <>
      <Button type="primary" onClick={openAdd}>+ Thêm sinh viên</Button>
      <Table dataSource={data} loading={loading} rowKey="id" columns={columns(openEdit)} />
      <StudentFormModal open={modalOpen} student={editing}
                        onCancel={() => setModalOpen(false)} onSaved={handleSaved} />
    </>
  );
}
```

**Áp dụng cho:** sinh viên, tòa nhà, phòng, giường, loại phí, chỉ số điện nước, người dùng, hợp đồng (tạo mới), ghi nhận thanh toán. Các màn hình **chi tiết** (hợp đồng, hóa đơn, sinh viên) vẫn giữ trang riêng vì nội dung dài.

**Số màn hình: 43 → 32.**

### 13.5. B6 — Sơ đồ tòa nhà bằng lưới Card

Không tự vẽ. Dùng `Row`/`Col`/`Card` của Ant Design, tô màu viền theo mức lấp đầy:

```jsx
const COLOR = { EMPTY: '#52C41A', PARTIAL: '#FAAD14', FULL: '#FF4D4F', MAINTENANCE: '#8C8C8C' };

<Row gutter={[12, 12]}>
  {floor.rooms.map((room) => (
    <Col key={room.id} xs={12} sm={8} md={6} lg={4}>
      <Card size="small" hoverable onClick={() => openRoom(room.id)}
            styles={{ body: { textAlign: 'center', padding: 12 } }}
            style={{ borderTop: `4px solid ${COLOR[room.fillLevel]}` }}>
        <div style={{ fontWeight: 600 }}>{room.roomNumber}</div>
        <div>{room.occupied}/{room.capacity}</div>
      </Card>
    </Col>
  ))}
</Row>
```

Khoảng 20 dòng, tự responsive, bấm được — đủ để demo và chụp ảnh vào báo cáo.

---

## 14. Lộ trình tự học — cần biết gì trước mỗi sprint

> Dành cho thành viên chưa từng làm web hoàn chỉnh. **Không học hết rồi mới làm** — học đúng phần cần cho sprint sắp tới, rồi làm ngay.

### 14.1. Trước Sprint 1 (học trong tuần 2, ~10 giờ/người)

| # | Chủ đề | Thời lượng | Học ở đâu | Biết là đủ khi… |
|---|--------|-----------|-----------|------------------|
| 1 | JavaScript hiện đại: `async/await`, destructuring, spread, arrow function, optional chaining | 3h | javascript.info | Đọc hiểu được đoạn code ở mục 15 |
| 2 | React cơ bản: component, props, `useState`, `useEffect`, render danh sách, xử lý sự kiện | 4h | react.dev — mục "Learn React" | Tự viết được một trang hiện danh sách từ mảng |
| 3 | HTTP và REST: GET/POST/PATCH/DELETE, mã trạng thái, JSON body, header | 1h | Đọc `API.md` mục 1 + tự thử vài API công khai bằng Postman | Giải thích được 200/201/401/403/404/409/422 |
| 4 | MongoDB cơ bản: document, collection, `ObjectId`, lọc bằng `find`, tham chiếu bằng `ref` + `populate` | 2h | mongodb.com/docs/manual/tutorial/getting-started · mongoosejs.com/docs/index.html | Đọc hiểu các bảng field ở `DATA-SCHEMA.md` mục 3 |

**Người làm Backend học thêm:** Express routing + middleware (2h), Mongoose Quickstart (2h).
**Người làm Frontend học thêm:** React Router (1h), Ant Design — riêng `Table` và `Form` (2h).

### 14.2. Học đúng lúc cho từng sprint

| Sprint | Cần học trước | Thời lượng |
|--------|---------------|------------|
| S1 | JWT là gì, `localStorage`, axios interceptor | 2h |
| S2 | **Race condition** và cập nhật có điều kiện nguyên tử (`findOneAndUpdate`) — đọc `03` mục 4.1 | 2h |
| S3 | HMAC/chữ ký số ở mức khái niệm (không cần hiểu toán) | 1h |
| S4 | `useEffect` với mảng phụ thuộc, điều kiện render | 1h |
| S5 | Biến môi trường, quy trình deploy | 2h |

### 14.3. Ba thứ KHÔNG cần học ở dự án này

| Không cần học | Vì sao |
|---------------|--------|
| TypeScript | Dự án dùng JavaScript thuần |
| Redux / TanStack Query / Zustand | Đã thay bằng `useApi` + Context, 2 file tự viết |
| Docker, Kubernetes, CI/CD | Deploy bằng giao diện web của Vercel/Render |
| GraphQL, WebSocket, microservices | Ngoài phạm vi hoàn toàn |
| Viết SQL thô nâng cao | Mongoose lo phần này |

---

## 15. ⭐ Mẫu code một module hoàn chỉnh — làm 1 lần, nhân bản cho các module sau

> **Đây là phần quan trọng nhất của tài liệu.** Làm **trọn vẹn** module "Quản lý sinh viên" theo mẫu dưới đây trong Sprint 1. Tám module còn lại (tòa nhà, phòng, giường, hợp đồng, hóa đơn, thanh toán, yêu cầu, người dùng) **sao chép cấu trúc này rồi đổi tên và đổi trường** — không phải nghĩ lại từ đầu.

### 15.1. Backend — file 1/3: `backend/src/modules/students/student.model.js`

```js
const mongoose = require('mongoose');
const { GENDER, STUDENT_STATUS } = require('../../shared/constants/enums');

const studentSchema = new mongoose.Schema(
  {
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // chỉ có khi SV đã tạo tài khoản
    studentCode: { type: String, required: true, trim: true },
    fullName:    { type: String, required: true, trim: true },
    dob:         { type: Date, required: true },
    gender:      { type: String, enum: GENDER, required: true },   // bắt buộc — cần cho BR-06
    phone:       { type: String, required: true, trim: true },
    email:       { type: String, trim: true, lowercase: true },
    className:   { type: String, trim: true },
    faculty:     { type: String, trim: true },
    emergencyContact: {
      name:         { type: String },
      phone:        { type: String },
      relationship: { type: String },
    },
    status: { type: String, enum: STUDENT_STATUS, default: 'active' },
  },
  { timestamps: true },
);

studentSchema.index({ studentCode: 1 }, { unique: true });
studentSchema.index({ userId: 1 }, { unique: true, sparse: true });
studentSchema.index({ fullName: 'text' });

module.exports = mongoose.model('Student', studentSchema);
```

### 15.2. Backend — file 2/3: `backend/src/modules/students/student.service.js`

```js
const Student  = require('./student.model');
const Contract = require('../contracts/contract.model');
const Invoice  = require('../fees/invoice.model');
const Application = require('../residencies/application.model');
// ApiError(httpStatus, CODE, message, data = null) — data trả nguyên vào trường "data" của envelope
const { ApiError } = require('../../core/errors/ApiError');
const { validate } = require('../../core/utils/validate');

// ---------- LẤY DANH SÁCH (tìm kiếm, lọc, phân trang) ----------
exports.getList = async (query) => {
  const page  = Number(query.page) || 1;
  const limit = Math.min(Number(query.limit) || 20, 100);
  const skip  = (page - 1) * limit;

  const filter = { status: query.status || 'active' };

  if (query.search) {
    const kw = new RegExp(query.search.trim(), 'i');   // tìm gần đúng, không phân biệt hoa thường
    filter.$or = [{ fullName: kw }, { studentCode: kw }, { phone: kw }];
  }
  if (query.gender)  filter.gender  = query.gender;
  if (query.faculty) filter.faculty = query.faculty;

  // Đếm và lấy dữ liệu song song cho nhanh
  const [total, students] = await Promise.all([
    Student.countDocuments(filter),
    Student.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
  ]);

  // Gắn thêm chỗ ở hiện tại + công nợ (tra cứu theo lô, tránh N+1 query)
  const ids = students.map((s) => s._id);
  const contracts = await Contract.find({ studentId: { $in: ids }, status: 'active' })
    .populate({ path: 'bedId', populate: { path: 'roomId', populate: 'buildingId' } })
    .lean();

  const byStudent = new Map(contracts.map((c) => [String(c.studentId), c]));

  const items = students.map((s) => {
    const c = byStudent.get(String(s._id));
    return {
      id: s._id,
      studentCode: s.studentCode,
      fullName: s.fullName,
      gender: s.gender,
      phone: s.phone,
      className: s.className,
      faculty: s.faculty,
      status: s.status,
      residence: c ? {
        buildingName: c.bedId.roomId.buildingId.name,
        roomNumber:   c.bedId.roomId.roomNumber,
        bedCode:      c.bedId.bedCode,
        contractCode: c.contractCode,
        endDate:      c.endDate,
      } : null,
    };
  });

  return { items, total, page, limit };
};

// ---------- THÊM MỚI ----------
exports.create = async (body) => {
  validate(body, {
    studentCode: { required: true, maxLength: 20 },
    fullName:    { required: true, maxLength: 150 },
    gender:      { required: true },
    dob:         { required: true },
    phone:       { required: true, pattern: /^0\d{9}$/, message: 'Số điện thoại phải gồm 10 số, bắt đầu bằng 0' },
  });

  // BR-11: mã số sinh viên duy nhất
  const existed = await Student.findOne({ studentCode: body.studentCode });
  if (existed) {
    throw new ApiError(409, 'DUPLICATE_ENTRY', 'Mã số sinh viên đã tồn tại',
      { errors: [{ field: 'studentCode', message: 'Mã số sinh viên đã tồn tại' }] });
  }

  return Student.create(body);
};

// ---------- CẬP NHẬT ----------
exports.update = async (id, body) => {
  const student = await Student.findByIdAndUpdate(id, body, { new: true, runValidators: true });
  if (!student) throw new ApiError(404, 'NOT_FOUND', 'Không tìm thấy sinh viên');
  return student;
};

// ---------- VÔ HIỆU HÓA (BR-13, BR-14) ----------
exports.deactivate = async (id) => {
  const [openContract, pendingApplication] = await Promise.all([
    Contract.findOne({ studentId: id, status: 'active' }),
    Application.findOne({ studentId: id, status: 'pending' }),
  ]);
  if (openContract || pendingApplication) {
    throw new ApiError(422, 'STUDENT_HAS_ACTIVE_CONTRACT',
      'Sinh viên đang có hợp đồng hiệu lực hoặc đơn đăng ký chờ duyệt, không thể vô hiệu hóa');
  }

  const unpaid = await Invoice.findOne({
    studentId: id,
    status: { $in: ['unpaid', 'partial', 'overdue'] },
  });
  if (unpaid) {
    throw new ApiError(422, 'STUDENT_HAS_DEBT', 'Sinh viên còn công nợ chưa thanh toán');
  }

  return Student.findByIdAndUpdate(id, { status: 'inactive' }, { new: true });
};
```

### 15.3. Backend — file 3/3: `backend/src/modules/students/student.routes.js`

Ở Bậc B, controller gộp luôn vào file route (mục 13.3) — mỗi module chỉ còn **2 file logic**.

```js
const express = require('express');
const studentService = require('./student.service');
const { authenticate, authorize } = require('../../core/middlewares/auth.middleware');
const { asyncHandler } = require('../../core/utils/asyncHandler');

const router = express.Router();

router.get('/', authenticate, authorize('admin', 'staff', 'viewer'), asyncHandler(async (req, res) => {
  const data = await studentService.getList(req.query);
  res.json({ code: 'OK', message: 'Success', data });
}));

router.post('/', authenticate, authorize('admin', 'staff'), asyncHandler(async (req, res) => {
  const student = await studentService.create(req.body);
  res.status(201).json({ code: 'OK', message: 'Thêm sinh viên thành công', data: student });
}));

router.put('/:id', authenticate, authorize('admin', 'staff'), asyncHandler(async (req, res) => {
  const student = await studentService.update(req.params.id, req.body);
  res.json({ code: 'OK', message: 'Cập nhật thành công', data: student });
}));

router.patch('/:id/deactivate', authenticate, authorize('admin', 'staff'), asyncHandler(async (req, res) => {
  const student = await studentService.deactivate(req.params.id);
  res.json({ code: 'OK', message: 'Đã vô hiệu hóa sinh viên', data: student });
}));

module.exports = router;
```

Đăng ký một dòng trong `app.js`:
```js
app.use('/api/students', require('./modules/students/student.routes'));
```

> ⚠️ File route **chỉ** đọc `req` và trả `res`. Mọi câu `if` nghiệp vụ và mọi lời gọi Mongoose nằm trong `student.service.js`. Gộp file **không** có nghĩa là gộp trách nhiệm.

### 15.4. Frontend — file 1/3: `frontend/src/features/students/api/student.api.js`

```js
import axiosClient from '../../../lib/axiosClient';

export const studentApi = {
  getList:    (params)   => axiosClient.get('/students', { params }),
  getById:    (id)       => axiosClient.get(`/students/${id}`),
  create:     (data)     => axiosClient.post('/students', data),
  update:     (id, data) => axiosClient.put(`/students/${id}`, data),
  deactivate: (id)       => axiosClient.patch(`/students/${id}/deactivate`),
};
```

### 15.5. Frontend — file 2/3: `frontend/src/features/students/components/StudentFormModal.jsx`

> 💡 Với antd 6, đổi `import { ..., message } from 'antd'` thành `const { message } = App.useApp();` và `destroyOnClose` thành `destroyOnHidden` — xem mục 3.1.1.

```jsx
import { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, message } from 'antd';
import dayjs from 'dayjs';
import { studentApi } from '../../api/studentApi';

export default function StudentFormModal({ open, student, onCancel, onSaved }) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const isEdit = !!student;

  // Mỗi lần mở modal: đổ dữ liệu cũ (khi sửa) hoặc xóa trắng (khi thêm)
  useEffect(() => {
    if (!open) return;
    if (isEdit) {
      form.setFieldsValue({ ...student, dateOfBirth: dayjs(student.dateOfBirth) });
    } else {
      form.resetFields();
    }
  }, [open, student]);

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      const payload = { ...values, dateOfBirth: values.dateOfBirth.format('YYYY-MM-DD') };
      if (isEdit) await studentApi.update(student.id, payload);
      else        await studentApi.create(payload);

      message.success(isEdit ? 'Cập nhật thành công' : 'Thêm sinh viên thành công');
      onSaved();
    } catch (err) {
      // Lỗi theo từng trường → hiển thị ngay dưới ô nhập
      const fieldErrors = err.response?.data?.errors;
      if (fieldErrors) {
        form.setFields(fieldErrors.map((e) => ({ name: e.field, errors: [e.message] })));
      } else {
        message.error(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={isEdit ? 'Sửa thông tin sinh viên' : 'Thêm sinh viên'}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={saving}
      okText="Lưu"
      cancelText="Hủy"
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="studentCode" label="Mã số sinh viên"
          rules={[{ required: true, message: 'Vui lòng nhập MSSV' }]}>
          <Input placeholder="VD: SV2024001" disabled={isEdit} />
        </Form.Item>

        <Form.Item name="fullName" label="Họ và tên"
          rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
          <Input />
        </Form.Item>

        <Form.Item name="gender" label="Giới tính"
          rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}>
          <Select options={[{ value: 'MALE', label: 'Nam' }, { value: 'FEMALE', label: 'Nữ' }]} />
        </Form.Item>

        <Form.Item name="dateOfBirth" label="Ngày sinh"
          rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}>
          <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="phone" label="Số điện thoại"
          rules={[{ pattern: /^0\d{9}$/, message: 'SĐT gồm 10 số, bắt đầu bằng 0' }]}>
          <Input />
        </Form.Item>

        <Form.Item name="className" label="Lớp"><Input /></Form.Item>
        <Form.Item name="faculty"  label="Khoa"><Input /></Form.Item>
      </Form>
    </Modal>
  );
}
```

### 15.6. Frontend — file 3/3: `frontend/src/features/students/pages/StudentsPage.jsx`

```jsx
import { useState } from 'react';
import { Table, Button, Input, Space, Tag, Modal, message } from 'antd';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../utils/permission';
import { studentApi } from '../../api/studentApi';
import StudentFormModal from './StudentFormModal';

export default function StudentListPage() {
  const { user } = useAuth();
  const [filters, setFilters]     = useState({ page: 1, limit: 20, search: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState(null);

  const { data, meta, loading, error, refetch } = useApi(
    () => studentApi.getList(filters),
    [filters]
  );

  const handleDeactivate = (record) => {
    Modal.confirm({
      title: 'Xác nhận vô hiệu hóa',
      content: `Vô hiệu hóa sinh viên ${record.fullName} (${record.studentCode})?`,
      okText: 'Vô hiệu hóa', okButtonProps: { danger: true }, cancelText: 'Hủy',
      onOk: async () => {
        try {
          await studentApi.deactivate(record.id);
          message.success('Đã vô hiệu hóa');
          refetch();
        } catch (err) {
          message.error(err.response?.data?.message || 'Không thể vô hiệu hóa');
        }
      },
    });
  };

  const columns = [
    { title: 'MSSV',   dataIndex: 'studentCode', width: 120 },
    { title: 'Họ tên', dataIndex: 'fullName' },
    { title: 'Giới tính', dataIndex: 'gender', width: 90,
      render: (g) => (g === 'MALE' ? 'Nam' : 'Nữ') },
    { title: 'Lớp',    dataIndex: 'className', width: 130 },
    { title: 'Chỗ ở',  dataIndex: 'residence', width: 150,
      render: (r) => r ? <Tag color="blue">{`${r.buildingCode}-${r.roomNumber}-${r.bedLabel}`}</Tag>
                       : <span style={{ color: '#999' }}>—</span> },
    { title: 'Thao tác', width: 160, render: (_, record) => (
        <Space>
          {can(user, 'student:create') &&
            <a onClick={() => { setEditing(record); setModalOpen(true); }}>Sửa</a>}
          {can(user, 'student:delete') &&
            <a style={{ color: '#FF4D4F' }} onClick={() => handleDeactivate(record)}>Vô hiệu hóa</a>}
        </Space>
      ) },
  ];

  if (error) return <div style={{ color: '#FF4D4F' }}>{error}</div>;

  return (
    <>
      <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
        <Input.Search
          placeholder="Tìm theo tên, MSSV, số điện thoại..."
          allowClear style={{ width: 340 }}
          onSearch={(v) => setFilters({ ...filters, search: v, page: 1 })}
        />
        {can(user, 'student:create') && (
          <Button type="primary" onClick={() => { setEditing(null); setModalOpen(true); }}>
            + Thêm sinh viên
          </Button>
        )}
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data || []}
        loading={loading}
        pagination={{
          current: meta?.page, pageSize: meta?.limit, total: meta?.total,
          showTotal: (t) => `Tổng ${t} sinh viên`,
          onChange: (page) => setFilters({ ...filters, page }),
        }}
      />

      <StudentFormModal
        open={modalOpen}
        student={editing}
        onCancel={() => setModalOpen(false)}
        onSaved={() => { setModalOpen(false); refetch(); }}
      />
    </>
  );
}
```

### 15.7. Cách nhân bản cho các module còn lại

| Bước | Việc làm | Thời gian ước tính |
|------|----------|--------------------|
| 1 | Sao chép `student.service.js` → `building.service.js`, đổi model `Student` thành `Building` | 15 phút |
| 2 | Sửa `where` tìm kiếm và danh sách trường trong `validate()` | 15 phút |
| 3 | Thêm các quy tắc `BR-xx` riêng của module (tra `03` mục 3) | 30–60 phút |
| 4 | Sao chép `student.routes.js`, đổi tên service + thêm 1 dòng `app.use` | 10 phút |
| 5 | Sao chép `student.api.js` → `building.api.js` | 5 phút |
| 6 | Sao chép 2 file màn hình, đổi `columns` và các `Form.Item` | 45 phút |
| | **Tổng mỗi module CRUD** | **~2,5 giờ** |

Các module có nghiệp vụ phức tạp (hợp đồng, hóa đơn, thanh toán) mất nhiều hơn — phần **thêm** chính là các quy tắc `BR-xx`, còn khung sườn vẫn y hệt.

> ✅ **Kiểm chứng trước khi nhân bản:** module sinh viên phải chạy trọn vẹn — thêm được, sửa được, tìm kiếm được, phân trang đúng, vô hiệu hóa bị chặn khi còn hợp đồng. Chỉ khi đó mới sao chép. Nhân bản một khung sườn còn lỗi sẽ nhân luôn lỗi ra 8 chỗ.

### 15.8. ⭐ Checklist 6 bước thêm một màn hình frontend

Khung nền đã dựng xong, dữ liệu giả đã có đủ 8 module. Từ đây, thêm **bất kỳ** màn hình danh sách nào cũng chỉ còn 6 bước dưới đây. Ví dụ minh họa: làm màn hình **Quản lý phòng**.

---

**Bước 1 — Kiểm tra API client đã có chưa** *(2 phút)*

Mở `src/features/rooms/api/room.api.js`. Nếu hàm cần dùng đã có thì bỏ qua bước này. Nếu thiếu, thêm một dòng theo đúng khuôn:

```js
getRooms: (params) => (USE_MOCK ? mockRooms.getRooms(params) : axiosClient.get('/rooms', { params })),
```

> ⚠️ Endpoint phải khớp **chính xác** với `API.md`. Nếu `API.md` chưa có endpoint đó, cập nhật `API.md` **trước** rồi báo cho người làm backend.

---

**Bước 2 — Kiểm tra dữ liệu giả đã có chưa** *(5 phút)*

Mở `src/mocks/mockApi.js`, tìm `mockRooms`. Nếu hàm chưa có thì viết thêm, bám đúng khuôn của các hàm sẵn có:

```js
getRooms: async (q = {}) => {
  await delay();
  let rows = db.rooms.map((r) => ({ ...r, building: db.buildings.find((b) => b.id === r.buildingId) }));
  if (q.buildingId) rows = rows.filter((r) => r.buildingId === q.buildingId);
  if (q.search) rows = search(rows, q.search, ['code']);
  return paginate(rows, q);
},
```

> ⚠️ Dữ liệu giả phải trả về **đúng bao bì** `{ code, message, data }` như backend thật (`API.md` mục 1.1). Hàm `paginate()` và `ok()` trong `mockHelpers.js` đã lo việc đó — cứ dùng, đừng tự viết lại.

---

**Bước 3 — Tạo file trang** *(5 phút)*

Sao chép `src/features/students/pages/StudentsPage.jsx` sang `src/features/rooms/pages/RoomsPage.jsx`. Đổi:

- tên hàm `StudentsPage` → `RoomsPage`
- `studentApi.getList` → `roomApi.getRooms`
- đường dẫn import (số lượng `../` **không đổi** vì cùng độ sâu thư mục)

---

**Bước 4 — Sửa `columns`** *(20–40 phút)* — đây là phần tốn thời gian nhất

```jsx
const columns = [
  { title: 'Mã phòng', dataIndex: 'code', width: 120, fixed: 'left' },
  { title: 'Tòa nhà',  dataIndex: ['building', 'name'], width: 150 },
  { title: 'Sức chứa', dataIndex: 'capacity', width: 100, align: 'center' },
  { title: 'Trạng thái', dataIndex: 'status', width: 130,
    render: (v) => <StatusTag type="room" value={v} /> },
  { title: 'Thao tác', key: 'action', width: 120, fixed: 'right',
    render: (_, record) => (can(user, 'room:update') ? <a onClick={() => openEdit(record)}>Sửa</a> : null) },
];
```

Bốn quy ước bắt buộc, để 21 màn hình trông như một sản phẩm chứ không phải 21 bài tập rời rạc:

| Quy ước | Lý do |
|---------|-------|
| Trạng thái luôn dùng `<StatusTag type="..." value={...} />` | Màu và nhãn tiếng Việt lấy tập trung từ `constants/statuses.js` |
| Số tiền luôn dùng `<MoneyText value={...} />`, cột `align: 'right'` | Định dạng `646.000 đ` thống nhất; công nợ tự tô đỏ |
| Ngày tháng luôn dùng `formatDate()` từ `utils/formatter.js` | Luôn ra `DD/MM/YYYY`, không lẫn định dạng Mỹ |
| Cột đầu và cột "Thao tác" đặt `fixed: 'left'` / `fixed: 'right'` | Bảng rộng vẫn thao tác được khi cuộn ngang |

---

**Bước 5 — Sửa form trong modal** *(20–40 phút)*

Sao chép `StudentFormModal.jsx` sang `RoomFormModal.jsx`, thay các `<Form.Item>` theo trường của phòng. Ba điểm dễ sai:

```jsx
// ĐÚNG — antd 6 dùng destroyOnHidden, KHÔNG phải destroyOnClose (đã bỏ)
<Modal open={open} destroyOnHidden onCancel={onCancel} footer={null}>

// ĐÚNG — message lấy từ App.useApp() để nhận được theme và tiếng Việt
const { message } = App.useApp();   // KHÔNG import { message } from 'antd'

// ĐÚNG — lỗi từng trường do backend trả về phải đổ ngược vào form
const fieldErrors = getFieldErrors(err);
if (fieldErrors) form.setFields(fieldErrors.map((e) => ({ name: e.field, errors: [e.message] })));
else message.error(getErrorMessage(err));
```

---

**Bước 6 — Nối route và kiểm tra** *(5 phút)*

Trong `src/routes/AppRoutes.jsx`, thay dòng `PlaceholderPage` tương ứng:

```diff
- <Route path="/admin/rooms" element={<PlaceholderPage title="Quản lý phòng" module="rooms" apiGroup="/api/rooms" />} />
+ <Route path="/admin/rooms" element={<RoomsPage />} />
```

Tự kiểm tra trước khi tạo pull request:

| ☐ | Kiểm tra |
|---|----------|
| ☐ | Danh sách hiện ra, phân trang bấm sang trang 2 đúng |
| ☐ | Ô tìm kiếm lọc đúng và **quay về trang 1** |
| ☐ | Thêm mới xong, bảng tự tải lại và thấy bản ghi vừa thêm |
| ☐ | Sửa xong, giá trị trên bảng đổi theo |
| ☐ | Nhập sai dữ liệu → hiện thông báo lỗi **tiếng Việt**, không phải tiếng Anh của backend |
| ☐ | Đăng nhập bằng tài khoản `viewer` → các nút Thêm/Sửa/Xóa **biến mất** |
| ☐ | Thu nhỏ cửa sổ còn ~400px → bảng cuộn ngang được, không vỡ giao diện |
| ☐ | `npm run lint` không còn lỗi |
| ☐ | `npm run build` chạy thành công |

**Tổng thời gian một màn hình CRUD: ~1 giờ.** Màn hình có nghiệp vụ phức tạp (hóa đơn, lưu trú) lâu hơn — phần **thêm** nằm ở các quy tắc `BR-xx`, còn 6 bước trên thì không đổi.

---

### 15.9. Ba thứ đã dựng sẵn — dùng lại, đừng viết lại

| Thứ | File | Dùng khi nào |
|-----|------|--------------|
| `useApi` | `src/hooks/useApi.js` | Mọi lần gọi API để **lấy** dữ liệu. Trả về `{ data, meta, loading, error, refetch }` — không cần tự quản `useState` cho 3 trạng thái |
| `DataTable` | `src/components/DataTable.jsx` | Mọi màn hình danh sách. Đã gom sẵn ô tìm kiếm, phân trang phía server, trạng thái đang tải / lỗi / rỗng |
| `ErrorBoundary` | `src/components/ErrorBoundary.jsx` | Đã bọc sẵn ở `main.jsx`. Một màn hình lỗi sẽ không làm trắng cả ứng dụng — **không cần đụng vào** |

Gọi API để **ghi** dữ liệu (thêm/sửa/xóa) thì **không dùng** `useApi` — cứ `await` trực tiếp trong hàm xử lý sự kiện rồi gọi `refetch()`, như trong `StudentsPage.jsx`.

---

## 16. Việc cần làm ngay sau khi áp dụng tài liệu này

| # | Việc | Người | ☐ |
|---|------|-------|---|
| 1 | Cả nhóm đọc mục 2 (21 thay đổi), mục 13 (10 thay đổi Bậc B) và **mục 15 (mẫu code)** | Cả nhóm | ☐ |
| 2 | Tạo repo `BE_QuanLyKTX`, thêm README trỏ về `docs/` ở repo FE (B1) | BE Lead | ☐ |
| 3 | Bỏ nhánh `develop`, chỉ dùng `main` + `feature/*` (B2) | Lead | ☐ |
| 4 | Cài đặt dependency theo mục 3 (5 gói FE, 8 gói BE) | Lead | ☐ |
| 5 | Viết 3 file nền: `useApi.js`, `AuthContext.jsx`, `validate.js` | FE Lead + BE Lead | ☐ |
| 6 | Bỏ `audit_log`, `system_config` khỏi `các file *.model.js`; thêm `config/settings.js` | BE Lead | ☐ |
| 7 | **Làm trọn module "Quản lý sinh viên" theo mục 15 và chạy thật được** | Cả nhóm cùng làm | ☐ |
| 8 | Mỗi người tự học theo mục 14.1 trong tuần 2 | Cả nhóm | ☐ |
| 9 | Cập nhật bảng theo dõi tiến độ theo số ngày công mới (~120 MD) | PM | ☐ |
| 10 | Hai người FE đọc **mục 15.8** (checklist 6 bước) và nhận màn hình theo `09` mục 1.4 | 2 người FE | ☐ |

---

## 17. Lịch sử phiên bản

| Phiên bản | Ngày | Người thực hiện | Nội dung thay đổi |
|-----------|------|------------------|-------------------|
| v1.0 | 12/09/2026 | Cả nhóm | Ban hành phiên bản đơn giản hóa **Bậc A**: 21 thay đổi kỹ thuật, giữ nguyên 100% chức năng, giảm khối lượng 206 → 155 ngày công |
| **v2.2** | **13/09/2026** | Cả nhóm | **Đăng ký theo phòng + nhu yếu phẩm.** Mục 4.6 viết lại: một hàm `claimBedInRoom` duy nhất lấy giường trống số nhỏ nhất + `applicationService.approve` có bù trừ. Mục 4.9 cron thêm tự hủy đơn nhu yếu phẩm quá hạn (chạy trước bước đánh dấu quá hạn). Mục 4.12 bỏ tiền cọc mặc định và hạn hợp đồng `pending`. Mục 5 lên 16 collection. **Sửa 3 bẫy sẵn có:** mẫu mock ở 4.4 dùng envelope `{ success, data, meta }` sai với `API.md` và code thật; lỗi theo trường ở 4.5 và 15.2 truyền mảng trần thay vì `{ errors }` nên form không hiện được lỗi tại ô; mục 14 còn dạy SQL và "transaction" cho dự án MongoDB. |
| v2.1 | 12/09/2026 | FE Lead | Thêm mục **15.8** (checklist 6 bước thêm một màn hình frontend, kèm 9 mục tự kiểm tra trước khi tạo pull request) và mục **15.9** (ba thứ đã dựng sẵn: `useApi`, `DataTable`, `ErrorBoundary`) |
| v2.0 | 12/09/2026 | Cả nhóm | **Rà soát theo bộ tài liệu v2.0:** viết lại toàn bộ mã mẫu sang **Mongoose** (mục 4.6, 4.9, 4.10, 15); mục 15 nay có 3 file backend + 3 file frontend theo cấu trúc `features/`; mục 5 liệt kê 12 collection thay vì bảng SQL; lập luận báo cáo ở mục 10 viết lại theo MongoDB |
| v1.2 | 12/09/2026 | FE Lead | Cài đặt thật và kiểm chứng: **antd 6.6.3** (không phải 5.x như thiết kế ban đầu), recharts 3.10.1, react-router-dom 7.18.3. Đã chạy `npm run build` thành công với React 19 + Vite 8. Bổ sung mục 3.1.1 nêu 2 khác biệt của antd 6 |
| v1.1 | 12/09/2026 | Cả nhóm | Bổ sung **Bậc B** cho nhóm mới bắt đầu (mục 13): 10 thay đổi thêm — 1 repo, 1 nhánh Git, gộp controller vào route, form dùng modal, làm mẫu 1 module rồi nhân bản. Thêm **lộ trình tự học** (mục 14) và **mẫu code một module hoàn chỉnh** (mục 15). Khối lượng 155 → **120 ngày công**. Chức năng vẫn giữ nguyên 85 FR |
