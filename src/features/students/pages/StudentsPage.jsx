import { useState } from 'react';
import {
  Button, Tag, Select, App, Card, Typography, Tooltip,
} from 'antd';
import { PlusOutlined, FileExcelOutlined, ReloadOutlined } from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../context/AuthContext';
import { can } from '../../../utils/permission';
import { studentApi } from '../api/student.api';
import { userApi } from '../../users/api/user.api';
import { getErrorMessage } from '../../../lib/axiosClient';
import { GENDER, GENDER_OPTIONS } from '../../../constants/statuses';
import { FACULTY_OPTIONS } from '../../../constants/app';
import PageHeader from '../../../components/PageHeader';
import DataTable from '../../../components/DataTable';
import MoneyText from '../../../components/MoneyText';
import StudentFormModal from '../components/StudentFormModal';
import StudentDetailDrawer from '../components/StudentDetailDrawer';
import ImportStudentsModal from '../components/ImportStudentsModal';
import TemporaryPasswordModal from '../../users/components/TemporaryPasswordModal';
import { residenceTextOf } from '../utils/studentView';

const { Text } = Typography;

const EMPTY_FILTERS = { page: 1, limit: 20, search: '', status: 'active', gender: undefined, faculty: undefined, hasAccount: undefined };

/** SCR-11 Sinh viên (FR-10 → FR-14, FR-12b) — danh sách, chi tiết, thêm/sửa, nhập Excel, đặt lại mật khẩu */
export default function StudentsPage() {
  const { user } = useAuth();
  const { message, modal } = App.useApp();

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [tableKey, setTableKey] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [detailVersion, setDetailVersion] = useState(0);
  const [importOpen, setImportOpen] = useState(false);
  const [tempPassword, setTempPassword] = useState(null);

  const { data, meta, loading, error, refetch } = useApi(() => studentApi.getList({ ...filters, search: filters.search || undefined }), [filters]);

  const setFilter = (patch) => setFilters((f) => ({ ...f, ...patch, page: 1 }));
  const resetFilters = () => { setFilters(EMPTY_FILTERS); setTableKey((k) => k + 1); };
  const hasFilter = filters.search || filters.gender || filters.faculty || filters.hasAccount !== undefined || filters.status !== 'active';
  const reloadAll = () => { refetch(); setDetailVersion((v) => v + 1); };

  const openAdd = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (s) => { setEditing(s); setFormOpen(true); };

  const confirmDeactivate = (s) => modal.confirm({
    title: `Vô hiệu hóa ${s.fullName} (${s.studentCode})?`,
    content: 'Hồ sơ ẩn khỏi danh sách đang hoạt động. Không làm được khi sinh viên còn hợp đồng, đơn chờ duyệt hoặc còn nợ (FR-14).',
    okText: 'Vô hiệu hóa', okButtonProps: { danger: true }, cancelText: 'Hủy',
    onOk: async () => {
      try {
        const res = await studentApi.deactivate(s.id);
        message.success(res.data.message);
        setOpenId(null);
        refetch();
      } catch (err) {
        modal.warning({ title: 'Không vô hiệu hóa được', content: getErrorMessage(err) });
      }
    },
  });

  // FR-06: Staff đặt lại được cho sinh viên — nút nằm ở đây vì Staff không vào được màn Tài khoản
  const confirmReset = (s) => modal.confirm({
    title: `Đặt lại mật khẩu cho ${s.fullName}?`,
    content: 'Mật khẩu hiện tại hết hiệu lực ngay. Hệ thống sinh mật khẩu tạm để bạn trao trực tiếp cho sinh viên; sinh viên phải đổi ở lần đăng nhập kế tiếp.',
    okText: 'Đặt lại mật khẩu', cancelText: 'Hủy',
    onOk: async () => {
      try {
        const res = await userApi.resetPassword(s.userId);
        setTempPassword({ title: 'Đã đặt lại mật khẩu', email: s.email, fullName: s.fullName, password: res.data.data.temporaryPassword });
      } catch (err) {
        modal.warning({ title: 'Không đặt lại được', content: getErrorMessage(err) });
      }
    },
  });

  const columns = [
    { title: 'MSSV', dataIndex: 'studentCode', width: 125, fixed: 'left', render: (v) => <a style={{ fontWeight: 500 }}>{v}</a> },
    {
      title: 'Họ và tên', key: 'name', width: 210,
      render: (_, s) => <><div>{s.fullName}</div><Text type="secondary" style={{ fontSize: 12 }}>{GENDER[s.gender]?.label} · {s.phone}</Text></>,
    },
    {
      title: 'Lớp · Khoa', key: 'class', width: 200,
      render: (_, s) => <><div>{s.className || '—'}</div><Text type="secondary" style={{ fontSize: 12 }}>{s.faculty || ''}</Text></>,
    },
    {
      title: 'Chỗ ở', dataIndex: 'residence', width: 160,
      render: (r) => (r ? <Tag color="blue" style={{ margin: 0 }}>{residenceTextOf(r)}</Tag> : <Text type="secondary">Không ở KTX</Text>),
    },
    {
      title: 'Tài khoản', dataIndex: 'hasAccount', width: 110,
      render: (v) => (v ? <Tag color="success" style={{ margin: 0 }}>Đã có</Tag> : <Tag style={{ margin: 0 }}>Chưa có</Tag>),
    },
    { title: 'Công nợ', dataIndex: 'totalDebt', width: 130, align: 'right', render: (v) => <MoneyText value={v} danger /> },
  ];

  return (
    <>
      <PageHeader
        breadcrumb={['Sinh viên']}
        title="Quản lý sinh viên"
        description="Hồ sơ sinh viên, chỗ ở hiện tại và công nợ. Tài khoản đăng nhập được cấp khi duyệt đơn ở ký túc xá."
        extra={can(user, 'student:create') && (
          <>
            <Button icon={<FileExcelOutlined />} onClick={() => setImportOpen(true)}>Nhập từ Excel</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>Thêm sinh viên</Button>
          </>
        )}
      />

      <Card>
        <DataTable
          key={tableKey}
          columns={columns}
          data={data}
          meta={meta}
          loading={loading}
          error={error}
          filters={filters}
          onFiltersChange={setFilters}
          searchPlaceholder="Tìm MSSV, họ tên, số điện thoại…"
          unit="sinh viên"
          scrollX={950}
          onRow={(s) => ({ onClick: () => setOpenId(s.id), style: { cursor: 'pointer' } })}
          rowClassName={(s) => (s.id === openId ? 'ant-table-row-selected' : '')}
          extraFilters={(
            <>
              <Select aria-label="Giới tính" allowClear placeholder="Giới tính" style={{ width: 120 }} options={GENDER_OPTIONS}
                value={filters.gender} onChange={(v) => setFilter({ gender: v })} />
              <Select aria-label="Khoa" allowClear placeholder="Mọi khoa" style={{ width: 190 }} options={FACULTY_OPTIONS}
                value={filters.faculty} onChange={(v) => setFilter({ faculty: v })} />
              <Select aria-label="Tài khoản" allowClear placeholder="Tài khoản" style={{ width: 150 }}
                options={[{ value: 'true', label: 'Đã có tài khoản' }, { value: 'false', label: 'Chưa có tài khoản' }]}
                value={filters.hasAccount} onChange={(v) => setFilter({ hasAccount: v })} />
              <Select aria-label="Trạng thái hồ sơ" style={{ width: 170 }}
                options={[{ value: 'active', label: 'Đang hoạt động' }, { value: 'inactive', label: 'Đã vô hiệu hóa' }]}
                value={filters.status} onChange={(v) => setFilter({ status: v })} />
              <Tooltip title="Xóa bộ lọc">
                <Button icon={<ReloadOutlined />} onClick={resetFilters} disabled={!hasFilter} aria-label="Xóa bộ lọc" />
              </Tooltip>
            </>
          )}
        />
        <Text type="secondary" style={{ fontSize: 12 }}>Bấm một dòng để xem hồ sơ, hợp đồng và hóa đơn chưa trả.</Text>
      </Card>

      <StudentDetailDrawer
        studentId={openId}
        version={detailVersion}
        onClose={() => setOpenId(null)}
        canEdit={can(user, 'student:update')}
        canReset={can(user, 'student:resetPassword')}
        canDeactivate={can(user, 'student:delete')}
        onEdit={openEdit}
        onReset={confirmReset}
        onDeactivate={confirmDeactivate}
      />
      <StudentFormModal
        open={formOpen}
        student={editing}
        onCancel={() => setFormOpen(false)}
        onSaved={() => { setFormOpen(false); reloadAll(); }}
      />
      <ImportStudentsModal open={importOpen} onClose={(changed) => { setImportOpen(false); if (changed) refetch(); }} />
      <TemporaryPasswordModal info={tempPassword} onClose={() => setTempPassword(null)} />
    </>
  );
}
