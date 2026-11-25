import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Button, Card, Select, Segmented, Row, Col, Skeleton, Alert, Typography, Table, Drawer, Grid,
  Space, Popover, Tag, Badge,
} from 'antd';
import {
  PlusOutlined, AppstoreOutlined, UnorderedListOutlined, InfoCircleOutlined, FilterOutlined,
} from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../context/AuthContext';
import { can } from '../../../utils/permission';
import { roomApi } from '../api/room.api';
import {
  CAMPUS_OPTIONS, GENDER, GENDER_OPTIONS, ROOM_CAPACITY_OPTIONS, ROOM_TIER, ROOM_TIER_OPTIONS,
} from '../../../constants/statuses';
import { formatCurrency } from '../../../utils/formatter';
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
];
const AVAILABILITY_LABEL = { has_slot: 'Còn chỗ', full: 'Hết chỗ' };
const ROOM_GENDER_FILTER_OPTIONS = [
  ...GENDER_OPTIONS,
  { value: 'empty', label: 'Trống (chưa gán)' },
];

const MAP_PAGE_SIZE = 100;
const EMPTY_PAGE = Promise.resolve({ data: { data: { items: [], total: 0, page: 1, limit: MAP_PAGE_SIZE } } });

/** Quản lý phòng theo 3 Cơ sở & Sơ đồ tầng — Thanh lọc 1 dòng gọn gàng + Popover bộ lọc phụ */
export default function RoomsPage() {
  const { user } = useAuth();
  const screens = useBreakpoint();
  const canCreate = can(user, 'room:create');
  const canEdit = can(user, 'room:update');

  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    campus: undefined,
    buildingId: searchParams.get('buildingId') || undefined,
    gender: undefined,
    roomTier: undefined,
    capacity: undefined,
    floor: undefined,
    availability: undefined,
  });
  const [view, setView] = useState('map');
  const [selectedId, setSelectedId] = useState(null);
  const [formRoom, setFormRoom] = useState(null);
  const [detailVersion, setDetailVersion] = useState(0);

  const { data: buildings } = useApi(() => roomApi.getBuildings({ campus: filters.campus }), [filters.campus]);
  const buildingId = (buildings?.some((b) => b.id === filters.buildingId) ? filters.buildingId : null) ?? buildings?.[0]?.id;

  const { data: rooms, meta, loading, error, refetch } = useApi(
    () => (buildingId
      ? roomApi.getRooms({
        buildingId,
        gender: filters.gender,
        roomTier: filters.roomTier,
        capacity: filters.capacity,
        availability: filters.availability,
        limit: MAP_PAGE_SIZE,
      })
      : EMPTY_PAGE),
    [buildingId, filters.gender, filters.roomTier, filters.capacity, filters.availability],
  );

  const allRooms = rooms || [];
  const truncated = (meta?.total ?? 0) > allRooms.length;
  const floorOptions = [...new Set(allRooms.map((r) => r.floor))].sort((a, b) => a - b).map((f) => ({ value: f, label: `Tầng ${f}` }));
  const shown = filters.floor ? allRooms.filter((r) => r.floor === filters.floor) : allRooms;

  const setFilter = (patch) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    if ('buildingId' in patch || 'campus' in patch) setSelectedId(null);
  };

  const resetSecondaryFilters = () => setFilter({
    roomTier: undefined, gender: undefined, capacity: undefined, floor: undefined, availability: undefined,
  });

  const activeChips = [
    filters.roomTier && { key: 'roomTier', label: ROOM_TIER[filters.roomTier]?.label || filters.roomTier },
    filters.gender && { key: 'gender', label: filters.gender === 'empty' ? 'Phòng trống' : `Phòng ${GENDER[filters.gender]?.label}` },
    filters.capacity && { key: 'capacity', label: `${filters.capacity} người` },
    filters.floor && { key: 'floor', label: `Tầng ${filters.floor}` },
    filters.availability && { key: 'availability', label: AVAILABILITY_LABEL[filters.availability] },
  ].filter(Boolean);

  const afterRoomSaved = () => {
    setFormRoom(null);
    refetch();
    setDetailVersion((v) => v + 1);
  };

  const panel = selectedId && (
    <RoomDetailPanel
      roomId={selectedId}
      version={detailVersion}
      canEditRoom={canEdit}
      onClose={() => setSelectedId(null)}
      onEdit={(room) => setFormRoom(room)}
      bordered={!!screens.xl}
    />
  );

  const filterPopoverContent = (
    <div style={{ width: 290, display: 'grid', gap: 10 }}>
      <FilterRow label="Hạng phòng">
        <Select style={{ width: '100%' }} allowClear placeholder="Tất cả" value={filters.roomTier} options={ROOM_TIER_OPTIONS} onChange={(v) => setFilter({ roomTier: v })} />
      </FilterRow>
      <FilterRow label="Giới tính">
        <Select style={{ width: '100%' }} allowClear placeholder="Tất cả" value={filters.gender} options={ROOM_GENDER_FILTER_OPTIONS} onChange={(v) => setFilter({ gender: v })} />
      </FilterRow>
      <FilterRow label="Sức chứa">
        <Select style={{ width: '100%' }} allowClear placeholder="Tất cả" value={filters.capacity} options={ROOM_CAPACITY_OPTIONS} onChange={(v) => setFilter({ capacity: v })} />
      </FilterRow>
      <FilterRow label="Tầng">
        <Select style={{ width: '100%' }} allowClear placeholder="Tất cả" value={filters.floor} options={floorOptions} onChange={(v) => setFilter({ floor: v })} />
      </FilterRow>
      <FilterRow label="Tình trạng">
        <Select style={{ width: '100%' }} allowClear placeholder="Tất cả" value={filters.availability} options={AVAILABILITY_OPTIONS} onChange={(v) => setFilter({ availability: v })} />
      </FilterRow>
      {activeChips.length > 0 && (
        <Button size="small" type="link" style={{ padding: 0, textAlign: 'right' }} onClick={resetSecondaryFilters}>
          Xóa tất cả bộ lọc phụ
        </Button>
      )}
    </div>
  );

  const columns = [
    { title: 'Phòng', key: 'room', width: 105, render: (_, r) => <Text strong>{roomLabelOf(r)}</Text> },
    { title: 'Hạng phòng', dataIndex: 'roomTier', width: 135, render: (v) => <StatusTag type="roomTier" value={v} /> },
    { title: 'Tầng', dataIndex: 'floor', width: 65, align: 'center' },
    { title: 'Sức chứa', dataIndex: 'capacity', width: 95, align: 'center', render: (n) => `${n} người` },
    { title: 'Đơn giá', dataIndex: 'pricePerMonth', width: 130, align: 'right', render: formatCurrency },
    { title: 'Giới tính', dataIndex: 'gender', width: 95, render: (g) => (g ? <Tag color={g === 'female' ? 'magenta' : 'blue'} style={{ margin: 0 }}>{GENDER[g]?.label}</Tag> : <Tag style={{ margin: 0 }}>Trống</Tag>) },
    { title: 'Giữ chỗ', key: 'occ', width: 90, align: 'center', render: (_, r) => `${r.occupied ?? 0}/${r.capacity}` },
    { title: 'Còn trống', dataIndex: 'availableSlots', width: 90, align: 'center' },
    {
      title: 'Tình trạng', key: 'fill', width: 155,
      render: (_, r) => (r.status === 'maintenance'
        ? <StatusTag type="roomStatus" value="maintenance" />
        : <span style={{ color: FILL_LEVEL[fillLevelOf(r)].text, fontWeight: 500 }}>{slotTextOf(r)}</span>),
    },
    { title: '', key: 'action', width: 65, fixed: 'right', render: (_, r) => <Button type="link" size="small" style={{ padding: 0 }} onClick={() => setSelectedId(r.id)}>Xem</Button> },
  ];

  return (
    <>
      <PageHeader
        breadcrumb={['Quản lý & Hỗ trợ', 'Phòng ở']}
        title="Quản lý phòng ở"
        description="Sơ đồ tầng theo 3 Cơ sở, hạng phòng 2026–2027 và danh sách sinh viên đang cư trú."
        extra={canCreate && <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormRoom({})}>Thêm phòng</Button>}
      />

      <Card styles={{ body: { padding: '12px 16px' } }} style={{ marginBottom: 12 }}>
        <div className="room-filters" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <Select
            style={{ width: 175 }} allowClear placeholder="Tất cả 3 cơ sở"
            value={filters.campus} options={CAMPUS_OPTIONS}
            onChange={(v) => setFilter({ campus: v, buildingId: undefined, floor: undefined })}
          />
          <Select
            style={{ width: 205 }} value={buildingId} loading={!buildings}
            options={(buildings || []).map((b) => ({ value: b.id, label: `${b.code} · ${b.name}` }))}
            onChange={(v) => setFilter({ buildingId: v, floor: undefined })}
          />
          <Popover content={filterPopoverContent} title="Bộ lọc phòng nâng cao" trigger="click" placement="bottomLeft">
            <Badge count={activeChips.length} size="small">
              <Button icon={<FilterOutlined />}>Bộ lọc</Button>
            </Badge>
          </Popover>

          {activeChips.length > 0 && (
            <Space size={4} wrap>
              {activeChips.map((chip) => (
                <Tag key={chip.key} closable color="blue" style={{ margin: 0 }} onClose={() => setFilter({ [chip.key]: undefined })}>
                  {chip.label}
                </Tag>
              ))}
            </Space>
          )}

          <div className="room-filters-view" style={{ marginLeft: 'auto' }}>
            <Segmented
              value={view} onChange={setView}
              options={[
                { value: 'map', label: 'Sơ đồ', icon: <AppstoreOutlined /> },
                { value: 'list', label: 'Danh sách', icon: <UnorderedListOutlined /> },
              ]}
            />
          </div>
        </div>
      </Card>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 12, padding: '0 2px' }}>
        <Space size={14} wrap>
          {LEGEND_LEVELS.map((key) => (
            <span key={key} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: FILL_LEVEL[key].color }} />
              <span>{FILL_LEVEL[key].label}</span>
            </span>
          ))}
        </Space>
        <Text type="secondary" style={{ fontSize: 12 }}>
          <InfoCircleOutlined /> {canEdit ? 'Nhấp phòng để xem danh sách SV đang ở và chỉnh sửa' : 'Nhấp phòng để xem chi tiết & danh sách SV đang ở'}
        </Text>
      </div>

      <Row gutter={16} wrap={false}>
        <Col flex="auto" style={{ minWidth: 0 }}>
          {error && <Alert type="error" showIcon title={error} />}
          {!error && !loading && truncated && (
            <Alert type="warning" showIcon style={{ marginBottom: 12 }} title={`Sơ đồ đang hiện ${allRooms.length}/${meta.total} phòng của tòa này`} />
          )}
          {!error && loading && <Card><Skeleton active paragraph={{ rows: 6 }} /></Card>}
          {!error && !loading && shown.length === 0 && (
            <Card>
              <EmptyState
                description="Không có phòng phù hợp bộ lọc"
                actionText={activeChips.length > 0 ? 'Xóa bộ lọc phụ' : (canCreate ? 'Thêm phòng' : undefined)}
                onAction={activeChips.length > 0 ? resetSecondaryFilters : () => setFormRoom({})}
              />
            </Card>
          )}
          {!error && !loading && shown.length > 0 && view === 'map' && (
            <FloorMap rooms={shown} selectedId={selectedId} onSelect={setSelectedId} />
          )}
          {!error && !loading && shown.length > 0 && view === 'list' && (
            <Card styles={{ body: { padding: 0 } }}>
              <Table
                rowKey="id" columns={columns} dataSource={shown} size="middle" scroll={{ x: 960 }}
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
        defaultBuildingId={buildingId}
        onCancel={() => setFormRoom(null)}
        onSaved={afterRoomSaved}
      />
    </>
  );
}

function FilterRow({ label, children }) {
  return (
    <div>
      <Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>{label}</Text>
      {children}
    </div>
  );
}
