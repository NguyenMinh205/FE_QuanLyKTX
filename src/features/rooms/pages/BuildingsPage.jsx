import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button, Card, Table, Tag, Typography, Segmented, Progress, Space, Tooltip, Alert, Select, App,
} from 'antd';
import {
  PlusOutlined, EditOutlined, StopOutlined, CheckCircleOutlined, AppstoreOutlined,
} from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../context/AuthContext';
import { can } from '../../../utils/permission';
import { roomApi } from '../api/room.api';
import { CAMPUS_OPTIONS } from '../../../constants/statuses';
import { getErrorMessage } from '../../../lib/axiosClient';
import { formatPercent } from '../../../utils/formatter';
import PageHeader from '../../../components/PageHeader';
import StatusTag from '../../../components/StatusTag';
import BuildingFormModal from '../components/BuildingFormModal';

const { Text } = Typography;

const rateOf = (s) => {
  const usable = (s?.totalSlots ?? 0) - (s?.maintenanceSlots ?? 0);
  return usable > 0 ? (s.occupiedSlots ?? 0) / usable : 0;
};

/** Tòa nhà 3 Cơ sở (Manager CRUD, Staff chỉ xem) */
export default function BuildingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { modal, message } = App.useApp();
  const canEdit = can(user, 'building:create');

  const [status, setStatus] = useState('active');
  const [campus, setCampus] = useState(undefined);
  const [formBuilding, setFormBuilding] = useState(null);

  const { data, loading, error, refetch } = useApi(
    () => roomApi.getBuildings({ includeInactive: true, campus }),
    [campus],
  );
  const all = data || [];
  const shown = all.filter((b) => (status === 'all' ? true : status === 'active' ? b.isActive : !b.isActive));
  const inactiveCount = all.filter((b) => !b.isActive).length;

  const toggleActive = (b) => {
    const deactivating = b.isActive;
    modal.confirm({
      title: deactivating ? `Ngừng hoạt động ${b.name}?` : `Kích hoạt lại ${b.name}?`,
      content: deactivating
        ? 'Tòa nhà và các phòng bên trong sẽ ẩn khỏi cổng đăng ký. Lịch sử hợp đồng, hóa đơn vẫn được giữ nguyên.'
        : 'Tòa nhà hiện lại trên sơ đồ phòng và tiếp nhận đơn đăng ký mới.',
      okText: deactivating ? 'Ngừng hoạt động' : 'Kích hoạt lại',
      okButtonProps: deactivating ? { danger: true } : undefined,
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const res = await roomApi.updateBuilding(b.id, { isActive: !b.isActive });
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
      title: 'Tòa nhà', key: 'name', width: 250,
      render: (_, b) => (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{
            width: 44, height: 40, borderRadius: 8, display: 'grid', placeItems: 'center', fontWeight: 700, flexShrink: 0,
            background: b.isActive ? 'var(--brand-soft)' : 'var(--layout-bg)', color: b.isActive ? 'var(--brand)' : 'var(--text-tertiary)',
          }}>{b.code}</span>
          <div style={{ minWidth: 0 }}>
            <Text strong>{b.name}</Text>
            <div><Text type="secondary" style={{ fontSize: 12 }}>{b.totalFloors} tầng{b.description ? ` · ${b.description}` : ''}</Text></div>
          </div>
        </div>
      ),
    },
    {
      title: 'Cơ sở', key: 'campus', width: 170,
      render: (_, b) => (
        <>
          <StatusTag type="campus" value={b.campus} />
          {b.campusAddress && <div><Text type="secondary" style={{ fontSize: 11 }}>{b.campusAddress}</Text></div>}
        </>
      ),
    },
    { title: 'Số phòng', key: 'rooms', width: 90, align: 'center', render: (_, b) => b.stats?.totalRooms ?? 0 },
    {
      title: 'Sức chứa (chỗ)', key: 'slots', width: 175,
      render: (_, b) => {
        const s = b.stats;
        if (!s) return '—';
        return (
          <>
            <Text>{s.occupiedSlots}/{s.totalSlots} đang giữ chỗ</Text>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {s.availableSlots} trống{s.maintenanceSlots ? ` · ${s.maintenanceSlots} bảo trì` : ''}
              </Text>
            </div>
          </>
        );
      },
    },
    {
      title: 'Tỷ lệ lấp đầy', key: 'rate', width: 155,
      render: (_, b) => (b.stats?.totalSlots
        ? (
          <Tooltip title="Đang giữ chỗ / (tổng sức chứa − bảo trì)">
            <Progress percent={Math.round(rateOf(b.stats) * 100)} size="small" format={() => formatPercent(rateOf(b.stats) * 100)} />
          </Tooltip>
        )
        : <Text type="secondary">Chưa có phòng</Text>),
    },
    {
      title: 'Trạng thái', dataIndex: 'isActive', width: 140,
      render: (v) => (v ? <Tag color="success" style={{ margin: 0 }}>Đang hoạt động</Tag> : <Tag style={{ margin: 0 }}>Ngừng hoạt động</Tag>),
    },
    {
      title: 'Thao tác', key: 'actions', width: canEdit ? 250 : 120, fixed: 'right',
      render: (_, b) => {
        const occupied = b.stats?.occupiedSlots ?? 0;
        return (
          <Space size={4} wrap>
            {b.isActive && (
              <Button size="small" type="link" icon={<AppstoreOutlined />} onClick={() => navigate(`/admin/rooms?buildingId=${b.id}`)}>Sơ đồ phòng</Button>
            )}
            {canEdit && <Button size="small" type="link" icon={<EditOutlined />} onClick={() => setFormBuilding(b)}>Sửa</Button>}
            {canEdit && b.isActive && (
              <Tooltip title={occupied > 0 ? `Còn ${occupied} sinh viên đang ở/giữ chỗ` : null}>
                <Button size="small" type="link" danger icon={<StopOutlined />} disabled={occupied > 0} onClick={() => toggleActive(b)}>Ngừng</Button>
              </Tooltip>
            )}
            {canEdit && !b.isActive && (
              <Button size="small" type="link" icon={<CheckCircleOutlined />} onClick={() => toggleActive(b)}>Kích hoạt</Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumb={['Cơ sở vật chất', 'Tòa nhà (3 Cơ sở)']}
        title="Quản lý Tòa nhà (3 Cơ sở HaUI)"
        description="Danh mục tòa nhà tại CS1 (A14–A15), CS2 (B12–B14) và CS3 Ninh Bình (C15–C17)."
        extra={canEdit && <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormBuilding({})}>Thêm tòa nhà</Button>}
      />

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <Space wrap>
            <Segmented
              value={status}
              onChange={setStatus}
              options={[
                { value: 'active', label: `Đang hoạt động (${all.length - inactiveCount})` },
                { value: 'inactive', label: `Ngừng hoạt động (${inactiveCount})` },
                { value: 'all', label: `Tất cả (${all.length})` },
              ]}
            />
            <Select
              allowClear placeholder="Lọc theo cơ sở" style={{ width: 200 }}
              value={campus} onChange={setCampus} options={CAMPUS_OPTIONS}
            />
          </Space>
          <Text type="secondary" style={{ fontSize: 13, alignSelf: 'center' }}>
            {canEdit ? 'Chỉ Trưởng ban KTX được thêm/sửa cấu hình tòa nhà' : 'Chế độ chỉ xem (Cán bộ quản sinh)'}
          </Text>
        </div>
        {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}
        <Table
          rowKey="id" columns={columns} dataSource={shown} loading={loading && !data}
          pagination={false} scroll={{ x: 1120 }}
          locale={{ emptyText: status === 'inactive' ? 'Không có tòa nào ngừng hoạt động' : 'Chưa có tòa nhà nào' }}
        />
      </Card>

      <BuildingFormModal
        key={formBuilding?.id ?? (formBuilding ? 'new' : 'closed')}
        open={formBuilding !== null}
        building={formBuilding?.id ? formBuilding : null}
        onCancel={() => setFormBuilding(null)}
        onSaved={() => { setFormBuilding(null); refetch(); }}
      />
    </>
  );
}
