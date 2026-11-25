import { useState } from 'react';
import {
  Button, Card, Select, Tag, Typography, Space, Segmented, App, Tooltip,
} from 'antd';
import {
  PlusOutlined, EditOutlined, KeyOutlined, LockOutlined, UnlockOutlined,
} from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../context/AuthContext';
import { userApi } from '../api/user.api';
import { getErrorCode, getErrorMessage } from '../../../lib/axiosClient';
import { ROLE_LABEL } from '../../../constants/roles';
import { formatDateTime } from '../../../utils/formatter';
import PageHeader from '../../../components/PageHeader';
import DataTable from '../../../components/DataTable';
import UserFormModal from '../components/UserFormModal';
import TemporaryPasswordModal from '../components/TemporaryPasswordModal';

const { Text } = Typography;

const ROLE_COLOR = { admin: 'red', manager: 'purple', staff: 'blue', student: 'green' };
const ROLE_FILTERS = ['all', 'admin', 'manager', 'staff', 'student'];

/** Quản lý tài khoản — chỉ Admin (RBAC v3.0) */
export default function UsersPage() {
  const { user: me, updateUser } = useAuth();
  const { modal, message } = App.useApp();

  const [filters, setFilters] = useState({ page: 1, limit: 20, search: '', role: 'all', isActive: undefined });
  const [formUser, setFormUser] = useState(null);
  const [tempPassword, setTempPassword] = useState(null);

  const { data, meta, loading, error, refetch } = useApi(
    () => userApi.getList({
      page: filters.page, limit: filters.limit, search: filters.search || undefined,
      role: filters.role === 'all' ? undefined : filters.role, isActive: filters.isActive,
    }),
    [filters],
  );
  const summary = meta?.summary;
  const isMe = (u) => u.id === me?.id;

  const showError = (err) => {
    const code = getErrorCode(err);
    if (code === 'LAST_ACTIVE_ADMIN' || code === 'CANNOT_MODIFY_SELF') {
      modal.warning({ title: 'Không thực hiện được', content: getErrorMessage(err) });
    } else {
      message.error(getErrorMessage(err));
    }
  };

  const confirmStatus = (u) => {
    const locking = u.isActive;
    modal.confirm({
      title: `${locking ? 'Khóa' : 'Mở khóa'} tài khoản ${u.email}?`,
      content: locking
        ? 'Người dùng sẽ không đăng nhập được nữa. Dữ liệu và lịch sử thao tác vẫn được giữ nguyên.'
        : 'Người dùng có thể đăng nhập lại bằng mật khẩu hiện tại.',
      okText: locking ? 'Khóa tài khoản' : 'Mở khóa',
      okButtonProps: locking ? { danger: true } : undefined,
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const res = await userApi.setStatus(u.id, { isActive: !u.isActive });
          message.success(res.data.message);
          refetch();
        } catch (err) {
          showError(err);
        }
      },
    });
  };

  const confirmReset = (u) => modal.confirm({
    title: `Đặt lại mật khẩu cho ${u.fullName}?`,
    content: 'Mật khẩu hiện tại hết hiệu lực ngay. Hệ thống sinh mật khẩu tạm và buộc đổi ở lần đăng nhập kế tiếp.',
    okText: 'Đặt lại mật khẩu', cancelText: 'Hủy',
    icon: <KeyOutlined style={{ color: '#FAAD14' }} />,
    onOk: async () => {
      try {
        const res = await userApi.resetPassword(u.id);
        setTempPassword({ title: 'Đã đặt lại mật khẩu', email: u.email, fullName: u.fullName, password: res.data.data.temporaryPassword });
        refetch();
      } catch (err) {
        showError(err);
      }
    },
  });

  const columns = [
    {
      title: 'Tài khoản', key: 'account', width: 225,
      render: (_, u) => (
        <>
          <Text strong>{u.fullName}</Text>{isMe(u) && <Tag color="processing" style={{ marginLeft: 6 }}>Bạn</Tag>}
          <div><Text type="secondary" style={{ fontSize: 12.5 }}>{u.email}</Text></div>
        </>
      ),
    },
    { title: 'Vai trò', dataIndex: 'role', width: 140, render: (r) => <Tag color={ROLE_COLOR[r]} style={{ margin: 0 }}>{ROLE_LABEL[r] || r}</Tag> },
    { title: 'MSSV', key: 'student', width: 112, render: (_, u) => (u.student ? <span className="mono">{u.student.studentCode}</span> : <Text type="secondary">—</Text>) },
    {
      title: 'Trạng thái', key: 'status', width: 175,
      render: (_, u) => (
        <Space size={4} wrap>
          <span
            className="haui-status"
            style={u.isActive
              ? { background: '#F0FDF4', borderColor: '#BBF7D0', color: '#14532D' }
              : { background: '#FEF2F2', borderColor: '#FECACA', color: '#991B1B' }}
          >
            <span className="haui-status-dot" style={{ background: u.isActive ? '#16A34A' : '#DC2626' }} />
            {u.isActive ? 'Đang hoạt động' : 'Đã khóa'}
          </span>
          {u.mustChangePassword && (
            <Tooltip title="Đang dùng mật khẩu tạm, sẽ bị buộc đổi khi đăng nhập">
              <span className="haui-status" style={{ background: '#FFFBEB', borderColor: '#FDE68A', color: '#92400E' }}>
                <span className="haui-status-dot" style={{ background: '#D97706' }} />
                Chờ đổi MK
              </span>
            </Tooltip>
          )}
        </Space>
      ),
    },
    { title: 'Đăng nhập gần nhất', dataIndex: 'lastLoginAt', width: 140, render: (v) => (v ? <span className="mono" style={{ fontSize: 12.5 }}>{formatDateTime(v)}</span> : <Text type="secondary">Chưa đăng nhập</Text>) },
    {
      title: 'Thao tác', key: 'actions', width: 215,
      render: (_, u) => (
        <Space size={2} wrap>
          <Button size="small" type="link" icon={<EditOutlined />} onClick={() => setFormUser(u)}>Sửa</Button>
          <Tooltip title={isMe(u) ? 'Dùng Đổi mật khẩu cho tài khoản của bạn' : null}>
            <Button size="small" type="link" icon={<KeyOutlined />} disabled={isMe(u)} onClick={() => confirmReset(u)}>Đặt lại MK</Button>
          </Tooltip>
          <Tooltip title={isMe(u) ? 'Không tự khóa tài khoản của mình' : null}>
            <Button
              size="small" type="link" danger={u.isActive} disabled={isMe(u)}
              icon={u.isActive ? <LockOutlined /> : <UnlockOutlined />}
              onClick={() => confirmStatus(u)}
            >
              {u.isActive ? 'Khóa' : 'Mở khóa'}
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumb={['Quản trị hệ thống', 'Tài khoản']}
        title="Quản lý tài khoản"
        description="Tạo tài khoản Quản trị, Trưởng ban KTX và Cán bộ quản sinh. Tài khoản sinh viên do hệ thống tự cấp khi duyệt đơn KTX."
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setFormUser({})}>Thêm tài khoản cán bộ</Button>}
      />

      <Card>
        <Segmented
          style={{ marginBottom: 16 }}
          value={filters.role}
          onChange={(v) => setFilters((f) => ({ ...f, role: v, page: 1 }))}
          options={ROLE_FILTERS.map((r) => ({
            value: r,
            label: `${r === 'all' ? 'Tất cả' : ROLE_LABEL[r]}${summary ? ` (${summary[r] ?? 0})` : ''}`,
          }))}
        />
        <DataTable
          columns={columns}
          data={data}
          meta={meta}
          loading={loading}
          error={error}
          filters={filters}
          onFiltersChange={setFilters}
          searchPlaceholder="Tìm theo họ tên, email, mã sinh viên..."
          unit="tài khoản"
          scrollX={960}
          extraFilters={(
            <Select
              allowClear placeholder="Tất cả trạng thái" style={{ width: 180 }}
              value={filters.isActive}
              onChange={(v) => setFilters((f) => ({ ...f, isActive: v, page: 1 }))}
              options={[
                { value: 'true', label: 'Đang hoạt động' },
                { value: 'false', label: `Đã khóa${summary ? ` (${summary.locked ?? 0})` : ''}` },
              ]}
            />
          )}
        />
      </Card>

      <UserFormModal
        key={formUser?.id ?? (formUser ? 'new' : 'closed')}
        open={formUser !== null}
        user={formUser?.id ? formUser : null}
        currentUserId={me?.id}
        onCancel={() => setFormUser(null)}
        onUpdated={(u) => {
          setFormUser(null);
          if (u.id === me?.id) updateUser({ fullName: u.fullName, email: u.email });
          refetch();
        }}
        onCreated={({ user, temporaryPassword }) => {
          setFormUser(null);
          setTempPassword({ title: 'Đã tạo tài khoản', email: user.email, fullName: user.fullName, password: temporaryPassword });
          refetch();
        }}
      />
      <TemporaryPasswordModal info={tempPassword} onClose={() => setTempPassword(null)} />
    </>
  );
}
