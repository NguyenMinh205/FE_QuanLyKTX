import { useState } from 'react';
import { Table, Button, Input, Space, Tag, Alert, App } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../utils/permission';
import { studentApi } from '../../api/studentApi';
import { getErrorMessage } from '../../api/axiosClient';
import { GENDER } from '../../constants/statuses';
import PageHeader from '../../components/common/PageHeader';
import MoneyText from '../../components/common/MoneyText';
import StudentFormModal from './StudentFormModal';

/**
 * Màn hình mẫu (SCR-11). 8 module còn lại sao chép cấu trúc này.
 * Xem docs/14 mục 15.6 để biết cách nhân bản.
 */
export default function StudentListPage() {
  const { user } = useAuth();
  const { message, modal } = App.useApp();

  const [filters, setFilters] = useState({ page: 1, limit: 20, search: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data, meta, loading, error, refetch } = useApi(
    () => studentApi.getList(filters),
    [filters],
  );

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (record) => { setEditing(record); setModalOpen(true); };

  const handleDeactivate = (record) => {
    modal.confirm({
      title: 'Xác nhận vô hiệu hóa',
      content: `Vô hiệu hóa sinh viên ${record.fullName} (${record.studentCode})? Hồ sơ sẽ không còn hiển thị trong danh sách đang hoạt động.`,
      okText: 'Vô hiệu hóa',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await studentApi.deactivate(record.id);
          message.success('Đã vô hiệu hóa sinh viên');
          refetch();
        } catch (err) {
          message.error(getErrorMessage(err, 'Không thể vô hiệu hóa sinh viên'));
        }
      },
    });
  };

  const columns = [
    { title: 'MSSV', dataIndex: 'studentCode', width: 120, fixed: 'left' },
    { title: 'Họ và tên', dataIndex: 'fullName', width: 180 },
    {
      title: 'Giới tính', dataIndex: 'gender', width: 100,
      render: (g) => GENDER[g]?.label || '—',
    },
    { title: 'Lớp', dataIndex: 'className', width: 120 },
    { title: 'Khoa', dataIndex: 'faculty', width: 180, responsive: ['lg'] },
    {
      title: 'Chỗ ở', dataIndex: 'residence', width: 150,
      render: (r) => (r
        ? <Tag color="blue">{`${r.buildingCode}-${r.roomNumber}-${r.bedLabel}`}</Tag>
        : <span style={{ color: '#8C8C8C' }}>—</span>),
    },
    {
      title: 'Công nợ', dataIndex: 'totalDebt', width: 130, align: 'right',
      render: (v) => <MoneyText value={v} danger />,
    },
    {
      title: 'Thao tác', key: 'action', width: 160, fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          {can(user, 'student:update') && <a onClick={() => openEdit(record)}>Sửa</a>}
          {can(user, 'student:delete') && (
            <a style={{ color: '#FF4D4F' }} onClick={() => handleDeactivate(record)}>Vô hiệu hóa</a>
          )}
        </Space>
      ),
    },
  ];

  if (error) return <Alert type="error" message={error} showIcon />;

  return (
    <>
      <PageHeader
        title="Quản lý sinh viên"
        description="Danh sách hồ sơ sinh viên đang hoạt động"
        extra={can(user, 'student:create')
          ? <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>Thêm sinh viên</Button>
          : null}
      />

      <Input.Search
        placeholder="Tìm theo họ tên, mã số sinh viên, số điện thoại..."
        allowClear
        style={{ maxWidth: 400, marginBottom: 16 }}
        onSearch={(value) => setFilters({ ...filters, search: value, page: 1 })}
      />

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data || []}
        loading={loading}
        scroll={{ x: 1000 }}
        pagination={{
          current: meta?.page,
          pageSize: meta?.limit,
          total: meta?.total,
          showSizeChanger: false,
          showTotal: (total) => `Tổng ${total} sinh viên`,
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
