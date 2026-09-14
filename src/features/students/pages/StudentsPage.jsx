import { useState } from 'react';
import { Button, Space, Tag, Select, App, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../context/AuthContext';
import { can } from '../../../utils/permission';
import { studentApi } from '../api/student.api';
import { getErrorMessage } from '../../../lib/axiosClient';
import { GENDER, GENDER_OPTIONS } from '../../../constants/statuses';
import PageHeader from '../../../components/PageHeader';
import DataTable from '../../../components/DataTable';
import MoneyText from '../../../components/MoneyText';
import StudentFormModal from '../components/StudentFormModal';

/**
 * Màn hình mẫu cho mọi màn hình danh sách khác.
 * Quy trình nhân bản: xem 14-PHIEN-BAN-DON-GIAN-HOA.md mục 15.7.
 */
export default function StudentsPage() {
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
      content: `Vô hiệu hóa sinh viên ${record.fullName} (${record.studentCode})?`,
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
    { title: 'MSSV', dataIndex: 'studentCode', width: 130, fixed: 'left' },
    { title: 'Họ và tên', dataIndex: 'fullName', width: 180 },
    { title: 'Giới tính', dataIndex: 'gender', width: 100, render: (g) => GENDER[g]?.label || '—' },
    { title: 'Lớp', dataIndex: 'className', width: 120 },
    { title: 'Khoa', dataIndex: 'faculty', width: 180, responsive: ['lg'] },
    {
      title: 'Chỗ ở', dataIndex: 'residence', width: 150,
      render: (r) => (r ? <Tag color="blue">{r.bedCode}</Tag> : <span style={{ color: '#8C8C8C' }}>—</span>),
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

  return (
    <>
      <PageHeader
        breadcrumb={['Sinh viên']}
        title="Quản lý sinh viên"
        description="Danh sách hồ sơ sinh viên đang hoạt động"
        extra={can(user, 'student:create')
          ? <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>Thêm sinh viên</Button>
          : null}
      />

      <Card>
        <DataTable
          columns={columns}
          data={data}
          meta={meta}
          loading={loading}
          error={error}
          filters={filters}
          onFiltersChange={setFilters}
          searchPlaceholder="Tìm theo họ tên, mã số sinh viên, số điện thoại..."
          unit="sinh viên"
          extraFilters={
            <Select
              allowClear
              placeholder="Giới tính"
              style={{ width: 140 }}
              options={GENDER_OPTIONS}
              onChange={(v) => setFilters({ ...filters, gender: v, page: 1 })}
            />
          }
        />
      </Card>

      <StudentFormModal
        open={modalOpen}
        student={editing}
        onCancel={() => setModalOpen(false)}
        onSaved={() => { setModalOpen(false); refetch(); }}
      />
    </>
  );
}
