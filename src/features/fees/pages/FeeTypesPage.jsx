import { useState } from 'react';
import {
  Button, Card, Table, Tag, Typography, Segmented, Space, Tooltip, Alert, App,
} from 'antd';
import {
  PlusOutlined, EditOutlined, StopOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../context/AuthContext';
import { can } from '../../../utils/permission';
import { feeApi } from '../api/fee.api';
import { getErrorMessage } from '../../../lib/axiosClient';
import { formatDateTime } from '../../../utils/formatter';
import PageHeader from '../../../components/PageHeader';
import FeeTypeFormModal from '../components/FeeTypeFormModal';
import { isSystemFee, priceTextOf, sortFeeTypes } from '../utils/feeTypeView';

const { Text } = Typography;

/** SCR-82 Danh mục loại phí — chỉ Admin (FR-45). Không có xóa: hóa đơn cũ tham chiếu loại phí */
export default function FeeTypesPage() {
  const { user } = useAuth();
  const { modal, message } = App.useApp();
  const canEdit = can(user, 'feeType:manage');

  const [status, setStatus] = useState('active');
  const [formFeeType, setFormFeeType] = useState(null); // null = đóng · {} = thêm · feeType = sửa

  const { data, loading, error, refetch } = useApi(() => feeApi.getFeeTypes({ includeInactive: true }), []);
  const all = sortFeeTypes(data || []);
  const shown = all.filter((t) => (status === 'all' ? true : status === 'active' ? t.isActive : !t.isActive));
  const inactiveCount = all.filter((t) => !t.isActive).length;

  const toggleActive = (t) => {
    const deactivating = t.isActive;
    modal.confirm({
      title: deactivating ? `Ngừng sử dụng ${t.name}?` : `Dùng lại ${t.name}?`,
      content: deactivating
        ? 'Loại phí không còn chọn được khi lập hóa đơn mới. Hóa đơn đã lập có dòng phí này vẫn giữ nguyên.'
        : 'Loại phí chọn được trở lại khi lập hóa đơn.',
      okText: deactivating ? 'Ngừng sử dụng' : 'Dùng lại',
      okButtonProps: deactivating ? { danger: true } : undefined,
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const res = await feeApi.updateFeeType(t.id, { isActive: !t.isActive });
          message.success(res.data.message);
        } catch (err) {
          modal.warning({ title: 'Không thực hiện được', content: getErrorMessage(err) });
        }
        refetch();
      },
    });
  };

  const columns = [
    {
      title: 'Mã', dataIndex: 'code', width: 150,
      render: (code, t) => (
        <>
          <Text code style={{ marginInlineEnd: 0 }}>{code}</Text>
          {isSystemFee(t) && <div><Text type="secondary" style={{ fontSize: 12 }}>Hệ thống</Text></div>}
        </>
      ),
    },
    { title: 'Tên loại phí', dataIndex: 'name', render: (v, t) => <Text strong={t.isActive} type={t.isActive ? undefined : 'secondary'}>{v}</Text> },
    { title: 'Đơn vị', dataIndex: 'unit', width: 100 },
    {
      title: 'Đơn giá mặc định', key: 'price', width: 230,
      render: (_, t) => {
        const { main, hint } = priceTextOf(t);
        return main
          ? <><Text strong>{main}</Text><div><Text type="secondary" style={{ fontSize: 12 }}>{hint}</Text></div></>
          : <Text type="secondary">{hint}</Text>;
      },
    },
    {
      title: 'Kỳ thu', dataIndex: 'isRecurring', width: 120,
      render: (v) => (v ? <Tag color="blue" style={{ margin: 0 }}>Hằng tháng</Tag> : <Tag style={{ margin: 0 }}>Một lần</Tag>),
    },
    { title: 'Cập nhật', dataIndex: 'updatedAt', width: 150, render: (v) => <Text type="secondary">{formatDateTime(v)}</Text> },
    {
      title: 'Trạng thái', dataIndex: 'isActive', width: 130,
      render: (v) => (v ? <Tag color="success" style={{ margin: 0 }}>Đang dùng</Tag> : <Tag style={{ margin: 0 }}>Ngừng dùng</Tag>),
    },
    ...(canEdit ? [{
      title: 'Thao tác', key: 'actions', width: 230, fixed: 'right',
      render: (_, t) => (
        <Space size={4} wrap>
          <Button size="small" type="link" icon={<EditOutlined />} onClick={() => setFormFeeType(t)}>Sửa</Button>
          {t.isActive && (
            <Tooltip title={isSystemFee(t) ? 'Loại phí hệ thống dùng khi lập hóa đơn — không ngừng sử dụng được' : null}>
              <Button size="small" type="link" danger icon={<StopOutlined />} disabled={isSystemFee(t)} onClick={() => toggleActive(t)}>Ngừng dùng</Button>
            </Tooltip>
          )}
          {!t.isActive && (
            <Button size="small" type="link" icon={<CheckCircleOutlined />} onClick={() => toggleActive(t)}>Dùng lại</Button>
          )}
        </Space>
      ),
    }] : []),
  ];

  return (
    <>
      <PageHeader
        breadcrumb={['Hệ thống', 'Danh mục loại phí']}
        title="Danh mục loại phí"
        description="Mã, tên, đơn vị và đơn giá mặc định của các khoản thu trên hóa đơn"
        extra={canEdit && <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormFeeType({})}>Thêm loại phí</Button>}
      />

      <Alert
        type="info" showIcon style={{ marginBottom: 16 }}
        title="Chỉ tiền điện và tiền nước dùng đơn giá ở đây"
        description="Tiền phòng và tiền cọc lấy từ hợp đồng, nhu yếu phẩm lấy từ đơn hàng. Đổi đơn giá điện nước chỉ áp dụng cho chỉ số nhập từ nay — chỉ số và hóa đơn đã lập giữ giá cũ."
      />

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <Segmented
            value={status}
            onChange={setStatus}
            options={[
              { value: 'active', label: `Đang dùng (${all.length - inactiveCount})` },
              { value: 'inactive', label: `Ngừng dùng (${inactiveCount})` },
              { value: 'all', label: `Tất cả (${all.length})` },
            ]}
          />
          <Text type="secondary" style={{ fontSize: 13, alignSelf: 'center' }}>Loại phí không xóa được vì hóa đơn cũ tham chiếu tới — chỉ ngừng sử dụng</Text>
        </div>
        {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}
        <Table
          rowKey="id" columns={columns} dataSource={shown} loading={loading && !data}
          pagination={false} scroll={{ x: 1100 }}
          locale={{ emptyText: status === 'inactive' ? 'Không có loại phí nào ngừng sử dụng' : 'Chưa có loại phí nào' }}
        />
      </Card>

      <FeeTypeFormModal
        key={formFeeType?.id ?? (formFeeType ? 'new' : 'closed')}
        open={formFeeType !== null}
        feeType={formFeeType?.id ? formFeeType : null}
        onCancel={() => setFormFeeType(null)}
        onSaved={() => { setFormFeeType(null); refetch(); }}
      />
    </>
  );
}
