import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button, Card, Table, Tag, Typography, Segmented, Progress, Space, Tooltip, Alert, App,
} from 'antd';
import {
  PlusOutlined, EditOutlined, StopOutlined, CheckCircleOutlined, AppstoreOutlined,
} from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../context/AuthContext';
import { can } from '../../../utils/permission';
import { roomApi } from '../api/room.api';
import { getErrorMessage } from '../../../lib/axiosClient';
import { formatPercent } from '../../../utils/formatter';
import PageHeader from '../../../components/PageHeader';
import BuildingFormModal from '../components/BuildingFormModal';

const { Text } = Typography;

/** Tỷ lệ lấp đầy theo docs: đã ở / (tổng giường − bảo trì) */
const rateOf = (s) => {
  const usable = (s?.totalBeds ?? 0) - (s?.maintenanceBeds ?? 0);
  return usable > 0 ? (s.occupiedBeds ?? 0) / usable : 0;
};

/** SCR-21 Tòa nhà — danh sách + thêm/sửa/ngừng hoạt động (FR-20, FR-25). Không có xóa (BR-07) */
export default function BuildingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { modal, message } = App.useApp();
  const canEdit = can(user, 'building:create');

  const [status, setStatus] = useState('active');
  const [formBuilding, setFormBuilding] = useState(null); // null = đóng · {} = thêm · building = sửa

  const { data, loading, error, refetch } = useApi(() => roomApi.getBuildings({ includeInactive: true }), []);
  const all = data || [];
  const shown = all.filter((b) => (status === 'all' ? true : status === 'active' ? b.isActive : !b.isActive));
  const inactiveCount = all.filter((b) => !b.isActive).length;

  const toggleActive = (b) => {
    const deactivating = b.isActive;
    modal.confirm({
      title: deactivating ? `Ngừng hoạt động ${b.name}?` : `Kích hoạt lại ${b.name}?`,
      content: deactivating
        ? 'Tòa và các phòng trong tòa bị ẩn khỏi sơ đồ phòng, đăng ký chỗ ở và dashboard. Dữ liệu cũ (hợp đồng, hóa đơn) vẫn giữ nguyên. Không xóa được tòa đã có dữ liệu.'
        : 'Tòa hiện lại ở sơ đồ phòng; phòng đang hoạt động trong tòa nhận đơn đăng ký trở lại.',
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
      title: 'Tòa nhà', key: 'name',
      render: (_, b) => (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{
            width: 40, height: 40, borderRadius: 8, display: 'grid', placeItems: 'center', fontWeight: 700, flexShrink: 0,
            background: b.isActive ? '#E6F4FF' : '#F5F5F5', color: b.isActive ? '#1677FF' : '#8C8C8C',
          }}>{b.code}</span>
          <div style={{ minWidth: 0 }}>
            <Text strong>{b.name}</Text>
            <div><Text type="secondary" style={{ fontSize: 13 }}>{[b.address, b.description].filter(Boolean).join(' · ') || '—'}</Text></div>
          </div>
        </div>
      ),
    },
    { title: 'Số phòng', key: 'rooms', width: 100, align: 'center', render: (_, b) => b.stats?.totalRooms ?? '—' },
    {
      title: 'Giường', key: 'beds', width: 200,
      render: (_, b) => {
        const s = b.stats;
        if (!s) return '—';
        return (
          <>
            <Text>{s.occupiedBeds}/{s.totalBeds} đang ở</Text>
            <div><Text type="secondary" style={{ fontSize: 12 }}>{s.availableBeds} trống{s.maintenanceBeds ? ` · ${s.maintenanceBeds} bảo trì` : ''}</Text></div>
          </>
        );
      },
    },
    {
      title: 'Tỷ lệ lấp đầy', key: 'rate', width: 180,
      render: (_, b) => (b.stats?.totalBeds
        ? <Tooltip title="Đã ở / (tổng giường − bảo trì)"><Progress percent={Math.round(rateOf(b.stats) * 100)} size="small" format={() => formatPercent(rateOf(b.stats) * 100)} /></Tooltip>
        : <Text type="secondary">Chưa có giường</Text>),
    },
    {
      title: 'Trạng thái', dataIndex: 'isActive', width: 150,
      render: (v) => (v ? <Tag color="success" style={{ margin: 0 }}>Đang hoạt động</Tag> : <Tag style={{ margin: 0 }}>Ngừng hoạt động</Tag>),
    },
    {
      title: 'Thao tác', key: 'actions', width: canEdit ? 330 : 120, fixed: 'right',
      render: (_, b) => {
        const occupied = b.stats?.occupiedBeds ?? 0;
        return (
          <Space size={4} wrap>
            {b.isActive && (
              <Button size="small" type="link" icon={<AppstoreOutlined />} onClick={() => navigate(`/admin/rooms?buildingId=${b.id}`)}>Xem sơ đồ</Button>
            )}
            {canEdit && <Button size="small" type="link" icon={<EditOutlined />} onClick={() => setFormBuilding(b)}>Sửa</Button>}
            {canEdit && b.isActive && (
              <Tooltip title={occupied > 0 ? `Còn ${occupied} sinh viên đang ở — không ngừng hoạt động được` : null}>
                <Button size="small" type="link" danger icon={<StopOutlined />} disabled={occupied > 0} onClick={() => toggleActive(b)}>Ngừng hoạt động</Button>
              </Tooltip>
            )}
            {canEdit && !b.isActive && (
              <Button size="small" type="link" icon={<CheckCircleOutlined />} onClick={() => toggleActive(b)}>Kích hoạt lại</Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumb={['Cơ sở vật chất', 'Tòa nhà']}
        title="Tòa nhà"
        description="Danh mục tòa nhà ký túc xá — phòng và giường quản lý ở màn Phòng"
        extra={canEdit && <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormBuilding({})}>Thêm tòa nhà</Button>}
      />

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <Segmented
            value={status}
            onChange={setStatus}
            options={[
              { value: 'active', label: `Đang hoạt động (${all.length - inactiveCount})` },
              { value: 'inactive', label: `Ngừng hoạt động (${inactiveCount})` },
              { value: 'all', label: `Tất cả (${all.length})` },
            ]}
          />
          <Text type="secondary" style={{ fontSize: 13, alignSelf: 'center' }}>Tòa đã có dữ liệu không xóa được, chỉ ngừng hoạt động (FR-25)</Text>
        </div>
        {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}
        <Table
          rowKey="id" columns={columns} dataSource={shown} loading={loading && !data}
          pagination={false} scroll={{ x: 1000 }}
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
