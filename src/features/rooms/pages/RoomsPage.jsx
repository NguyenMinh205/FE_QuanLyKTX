import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Button, Card, Select, Segmented, Row, Col, Skeleton, Alert, Typography, Table, Drawer, Grid, Space,
} from 'antd';
import {
  PlusOutlined, AppstoreOutlined, UnorderedListOutlined, InfoCircleOutlined,
} from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../context/AuthContext';
import { can } from '../../../utils/permission';
import { roomApi } from '../api/room.api';
import { GENDER } from '../../../constants/statuses';
import PageHeader from '../../../components/PageHeader';
import EmptyState from '../../../components/EmptyState';
import StatusTag from '../../../components/StatusTag';
import FloorMap from '../components/FloorMap';
import RoomDetailPanel from '../components/RoomDetailPanel';
import RoomFormModal from '../components/RoomFormModal';
import {
  FILL_LEVEL, LEGEND_LEVELS, fillLevelOf, slotTextOf, roomLabelOf,
} from '../utils/roomStatus';

const { Text } = Typography;
const { useBreakpoint } = Grid;

const AVAILABILITY_OPTIONS = [
  { value: 'has_slot', label: 'Còn chỗ' },
  { value: 'full', label: 'Hết chỗ' },
  { value: 'has_maintenance', label: 'Có giường bảo trì' },
];

const EMPTY_PAGE = Promise.resolve({ data: { data: { items: [], total: 0, page: 1, limit: 200 } } });

/** SCR-23 Phòng — sơ đồ tầng + khung chi tiết (docs/08 mục 6.3) */
export default function RoomsPage() {
  const { user } = useAuth();
  const screens = useBreakpoint();
  const canCreate = can(user, 'room:create');
  const canEdit = can(user, 'room:update');
  const canManageBeds = can(user, 'bed:update');

  // Màn Tòa nhà mở sẵn đúng tòa qua ?buildingId=
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({ buildingId: searchParams.get('buildingId') || undefined, roomTypeId: undefined, floor: undefined, availability: undefined });
  const [view, setView] = useState('map');
  const [selectedId, setSelectedId] = useState(null);
  const [formRoom, setFormRoom] = useState(null); // null = đóng · {} = thêm · room = sửa
  const [detailVersion, setDetailVersion] = useState(0);

  const { data: buildings } = useApi(() => roomApi.getBuildings(), []);
  const { data: roomTypes } = useApi(() => roomApi.getRoomTypes(), []);
  // Tòa trong URL không còn hoạt động thì quay về tòa đầu tiên
  const buildingId = (buildings?.some((b) => b.id === filters.buildingId) ? filters.buildingId : null) ?? buildings?.[0]?.id;

  const { data: rooms, loading, error, refetch } = useApi(
    () => (buildingId
      ? roomApi.getRooms({ buildingId, roomTypeId: filters.roomTypeId, availability: filters.availability, limit: 200 })
      : EMPTY_PAGE),
    [buildingId, filters.roomTypeId, filters.availability],
  );

  // Lọc tầng ở phía giao diện để danh sách tầng trong ô chọn không bị thu hẹp theo chính nó
  const allRooms = rooms || [];
  const floorOptions = [...new Set(allRooms.map((r) => r.floor))].sort((a, b) => a - b).map((f) => ({ value: f, label: `Tầng ${f}` }));
  const shown = filters.floor ? allRooms.filter((r) => r.floor === filters.floor) : allRooms;

  const setFilter = (patch) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    if ('buildingId' in patch) setSelectedId(null);
  };

  const afterRoomSaved = () => {
    setFormRoom(null);
    refetch();
    setDetailVersion((v) => v + 1);
  };

  const panel = selectedId && (
    <RoomDetailPanel
      roomId={selectedId}
      version={detailVersion}
      canManageBeds={canManageBeds}
      canEditRoom={canEdit}
      onClose={() => setSelectedId(null)}
      onEdit={(room) => setFormRoom(room)}
      onChanged={refetch}
      bordered={!!screens.xl}
    />
  );

  const columns = [
    { title: 'Phòng', key: 'room', width: 100, render: (_, r) => <Text strong>{roomLabelOf(r)}</Text> },
    { title: 'Tầng', dataIndex: 'floor', width: 70, align: 'center' },
    { title: 'Loại phòng', dataIndex: 'roomTypeName', width: 190 },
    { title: 'Giới tính', dataIndex: 'gender', width: 90, render: (g) => GENDER[g]?.label },
    { title: 'Đang ở', key: 'occ', width: 90, align: 'center', render: (_, r) => `${r.occupied}/${r.capacity}` },
    { title: 'Chỗ trống', dataIndex: 'availableSlots', width: 100, align: 'center' },
    { title: 'Bảo trì', dataIndex: 'maintenanceBeds', width: 80, align: 'center', render: (n) => (n ? <Text type="danger">{n}</Text> : 0) },
    {
      title: 'Tình trạng', key: 'fill', width: 190,
      render: (_, r) => (r.status === 'inactive'
        ? <StatusTag type="roomStatus" value="inactive" />
        : <span style={{ color: FILL_LEVEL[fillLevelOf(r)].color, fontWeight: 500 }}>{slotTextOf(r)}</span>),
    },
    { title: '', key: 'action', width: 70, fixed: 'right', render: (_, r) => <a onClick={() => setSelectedId(r.id)}>Xem</a> },
  ];

  return (
    <>
      <PageHeader
        breadcrumb={['Cơ sở vật chất', 'Phòng']}
        title="Quản lý phòng"
        description="Sơ đồ tầng, tình trạng giường và thông tin từng phòng"
        extra={canCreate && <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormRoom({})}>Thêm phòng</Button>}
      />

      <Card styles={{ body: { padding: 16 } }} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
          <FilterField label="Tòa nhà">
            <Select
              style={{ width: 180 }}
              value={buildingId}
              loading={!buildings}
              options={(buildings || []).map((b) => ({ value: b.id, label: b.name }))}
              onChange={(v) => setFilter({ buildingId: v, floor: undefined })}
            />
          </FilterField>
          <FilterField label="Loại phòng">
            <Select
              style={{ width: 200 }} allowClear placeholder="Tất cả loại phòng" value={filters.roomTypeId}
              options={(roomTypes || []).map((t) => ({ value: t.id, label: t.name }))}
              onChange={(v) => setFilter({ roomTypeId: v })}
            />
          </FilterField>
          <FilterField label="Tầng">
            <Select style={{ width: 140 }} allowClear placeholder="Tất cả các tầng" value={filters.floor} options={floorOptions} onChange={(v) => setFilter({ floor: v })} />
          </FilterField>
          <FilterField label="Tình trạng">
            <Select style={{ width: 180 }} allowClear placeholder="Tất cả tình trạng" value={filters.availability} options={AVAILABILITY_OPTIONS} onChange={(v) => setFilter({ availability: v })} />
          </FilterField>
          <div style={{ marginLeft: 'auto' }}>
            <Segmented
              value={view}
              onChange={setView}
              options={[
                { value: 'map', label: 'Sơ đồ', icon: <AppstoreOutlined /> },
                { value: 'list', label: 'Danh sách', icon: <UnorderedListOutlined /> },
              ]}
            />
          </div>
        </div>
      </Card>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Space size={8} wrap>
          {LEGEND_LEVELS.map((key) => (
            <span key={key} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999,
              background: '#fff', border: `1px solid ${FILL_LEVEL[key].border}`, fontSize: 13,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: FILL_LEVEL[key].color }} />
              {FILL_LEVEL[key].label} <Text type="secondary" style={{ fontSize: 12 }}>({FILL_LEVEL[key].hint})</Text>
            </span>
          ))}
        </Space>
        <Text type="secondary" style={{ fontSize: 13 }}><InfoCircleOutlined /> Nhấp vào phòng để xem danh sách giường</Text>
      </div>

      <Row gutter={16} wrap={false}>
        <Col flex="auto" style={{ minWidth: 0 }}>
          {error && <Alert type="error" showIcon title={error} />}
          {!error && loading && <Card><Skeleton active paragraph={{ rows: 6 }} /></Card>}
          {!error && !loading && shown.length === 0 && (
            <Card>
              <EmptyState
                description="Không có phòng phù hợp bộ lọc"
                actionText={canCreate ? 'Thêm phòng' : undefined}
                onAction={() => setFormRoom({})}
              />
            </Card>
          )}
          {!error && !loading && shown.length > 0 && view === 'map' && (
            <FloorMap rooms={shown} selectedId={selectedId} onSelect={setSelectedId} />
          )}
          {!error && !loading && shown.length > 0 && view === 'list' && (
            <Card styles={{ body: { padding: 0 } }}>
              <Table
                rowKey="id"
                columns={columns}
                dataSource={shown}
                size="middle"
                scroll={{ x: 980 }}
                pagination={{ pageSize: 20, showSizeChanger: false, showTotal: (t) => `Tổng ${t} phòng` }}
                onRow={(r) => ({ onClick: () => setSelectedId(r.id), style: { cursor: 'pointer' } })}
                rowClassName={(r) => (r.id === selectedId ? 'ant-table-row-selected' : '')}
              />
            </Card>
          )}
        </Col>

        {screens.xl && selectedId && <Col flex="400px">{panel}</Col>}
      </Row>

      {!screens.xl && (
        <Drawer open={!!selectedId} onClose={() => setSelectedId(null)} size={440} closable={false} styles={{ body: { padding: 0 } }}>
          {panel}
        </Drawer>
      )}

      <RoomFormModal
        open={formRoom !== null}
        room={formRoom?.id ? formRoom : null}
        buildings={buildings || []}
        roomTypes={roomTypes || []}
        defaultBuildingId={buildingId}
        onCancel={() => setFormRoom(null)}
        onSaved={afterRoomSaved}
      />
    </>
  );
}

function FilterField({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: '#8C8C8C', marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  );
}
