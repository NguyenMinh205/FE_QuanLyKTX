/**
 * Dữ liệu giả để frontend chạy được khi backend chưa xong.
 * Bật/tắt bằng VITE_USE_MOCK trong .env
 *
 * ⚠️ BẮT BUỘC: đúng envelope { code, message, data } và phân trang
 * { items, total, page, limit } như API.md, để khi nối API thật
 * không phải sửa lại màn hình.
 */

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

const ok = (data) => ({ data: { code: 'OK', message: 'Success', data } });

const page = (items, total, p, limit) => ok({ items, total, page: Number(p), limit: Number(limit) });

// ----------------------------------------------------------- tài khoản mẫu
const MOCK_ACCOUNTS = [
  { email: 'admin@dorm.local',  password: 'Admin@123',   id: '1', fullName: 'Nguyễn Văn Quản Trị', role: 'admin',   studentId: null },
  { email: 'staff@dorm.local',  password: 'Staff@123',   id: '2', fullName: 'Lê Thị Nhân Viên',    role: 'staff',   studentId: null },
  { email: 'viewer@dorm.local', password: 'Viewer@123',  id: '3', fullName: 'Trần Văn Người Xem',  role: 'viewer',  studentId: null },
  { email: 'sv001@dorm.local',  password: 'Student@123', id: '4', fullName: 'Trần Thị B',          role: 'student', studentId: '12' },
];

export const mockLogin = async ({ email, password }) => {
  await delay(400);
  const found = MOCK_ACCOUNTS.find((a) => a.email === email && a.password === password);

  if (!found) {
    // Giả lập đúng dạng lỗi của axios để code xử lý lỗi chạy như thật
    const error = new Error('Đăng nhập thất bại');
    error.response = {
      status: 401,
      data: { code: 'UNAUTHORIZED', message: 'Email hoặc mật khẩu không đúng', data: null },
    };
    throw error;
  }

  return ok({
    token: 'mock-token-' + found.role,
    expiresIn: 604800,
    user: {
      id: found.id,
      email: found.email,
      fullName: found.fullName,
      role: found.role,
      studentId: found.studentId,
      mustChangePassword: false,
    },
  });
};

// ----------------------------------------------------------- sinh viên mẫu
const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Đặng', 'Bùi'];
const TEN_NAM = ['Văn An', 'Minh Quân', 'Hoàng Long', 'Đức Anh', 'Quốc Bảo', 'Tiến Đạt'];
const TEN_NU = ['Thị Bình', 'Ngọc Ánh', 'Thu Hà', 'Phương Linh', 'Khánh Vy', 'Minh Châu'];
const KHOA = ['Công nghệ thông tin', 'Kinh tế', 'Cơ khí', 'Điện - Điện tử'];

export const MOCK_STUDENTS = Array.from({ length: 47 }, (_, i) => {
  const isMale = i % 2 === 0;
  const ho = HO[i % HO.length];
  const ten = isMale ? TEN_NAM[i % TEN_NAM.length] : TEN_NU[i % TEN_NU.length];
  const dangO = i % 3 !== 0;

  return {
    id: String(i + 1),
    studentCode: `SV2026${String(i + 1).padStart(3, '0')}`,
    fullName: `${ho} ${ten}`,
    gender: isMale ? 'male' : 'female',
    dob: `200${5 - (i % 3)}-0${(i % 9) + 1}-1${i % 9}`,
    phone: `09${String(10000000 + i * 137).slice(0, 8)}`,
    email: `sv2026${String(i + 1).padStart(3, '0')}@sv.edu.vn`,
    className: `${['CNTT', 'KT', 'CK', 'DT'][i % 4]}2026${['A', 'B', 'C'][i % 3]}`,
    faculty: KHOA[i % KHOA.length],
    status: 'active',
    residence: dangO
      ? {
          buildingName: isMale ? 'Tòa A' : 'Tòa B',
          roomNumber: String(301 + (i % 12)),
          bedCode: `${isMale ? 'A' : 'B'}-${301 + (i % 12)}-0${(i % 8) + 1}`,
          contractCode: `HD-2026-${String(i + 1).padStart(5, '0')}`,
          endDate: '2027-06-30',
        }
      : null,
    totalDebt: dangO && i % 4 === 0 ? 646000 : 0,
  };
});

export const mockStudentList = async (params = {}) => {
  await delay();
  const { page: p = 1, limit = 20, search = '', gender, faculty } = params;

  let rows = [...MOCK_STUDENTS];

  if (search) {
    const kw = search.toLowerCase().trim();
    rows = rows.filter(
      (s) =>
        s.fullName.toLowerCase().includes(kw) ||
        s.studentCode.toLowerCase().includes(kw) ||
        (s.phone || '').includes(kw),
    );
  }
  if (gender) rows = rows.filter((s) => s.gender === gender);
  if (faculty) rows = rows.filter((s) => s.faculty === faculty);

  const total = rows.length;
  const start = (p - 1) * limit;

  return page(rows.slice(start, start + limit), total, p, limit);
};

// ----------------------------------------------------------- dashboard mẫu
export const mockDashboardSummary = async () => {
  await delay();
  return ok({
    occupancy: {
      total: 200, occupied: 178, available: 20, maintenance: 2,
      rate: 0.899,
    },
    residents: { activeStudents: 178, activeContracts: 178, pendingContracts: 4, expiringIn30Days: 23 },
    finance: { totalDebt: 48620000, overdueInvoiceCount: 27, overdueAmount: 12480000 },
    pendingRequests: { renewal: 3, checkout: 2 },
  });
};
