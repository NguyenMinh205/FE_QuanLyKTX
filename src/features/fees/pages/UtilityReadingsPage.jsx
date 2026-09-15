import { useEffect, useMemo, useState } from 'react';
import {
  Card, Select, Table, Tag, Typography, Progress, Alert, Tooltip, App, Space,
} from 'antd';
import {
  ThunderboltOutlined, ExperimentOutlined, InfoCircleOutlined, CheckSquareOutlined,
} from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../context/AuthContext';
import { can } from '../../../utils/permission';
import { feeApi } from '../api/fee.api';
import { roomApi } from '../../rooms/api/room.api';
import { getErrorMessage } from '../../../lib/axiosClient';
import { formatCurrency } from '../../../utils/formatter';
import PageHeader from '../../../components/PageHeader';
import MeterCell from '../components/readings/MeterCell';
import ReadingShareCell from '../components/readings/ReadingShareCell';
import ReadingSaveBar from '../components/readings/ReadingSaveBar';
import {
  METER_FIELDS, READING_STATUS, buildRow, currentPeriod, itemsOf, periodLabel, periodOptions, previousPeriod,
} from '../utils/readingSheet';

const { Text } = Typography;

const ELECTRIC_BG = '#EEF4FF';
const WATER_BG = '#EFF8F1';

/** Backend hiện tại populate `buildingId` thành object và trả `occupiedBeds`/`totalBeds` — nhận cả hai dạng */
const normalizeRoom = (r) => ({
  ...r,
  buildingCode: r.buildingCode ?? r.buildingId?.code,
  occupied: r.occupied ?? r.occupiedBeds ?? 0,
  capacity: r.capacity ?? r.totalBeds,
});
/** Backend hiện tại populate `roomId` thành object phòng */
const normalizeReading = (u) => ({ ...u, roomId: u.roomId?.id ?? u.roomId?._id ?? u.roomId });

/** Phòng + chỉ số kỳ này + chỉ số kỳ trước của một tòa, gộp một lần tải */
const loadSheet = (buildingId, period) => (buildingId
  ? Promise.all([
    roomApi.getRooms({ buildingId, limit: 100 }),
    feeApi.getUtilityReadings({ buildingId, billingPeriod: period, limit: 100 }),
    feeApi.getUtilityReadings({ buildingId, billingPeriod: previousPeriod(period), limit: 100 }),
  ]).then(([rooms, current, previous]) => ({
    data: {
      data: {
        rooms: itemsOf(rooms.data.data)
          .filter((r) => r.status !== 'inactive')
          .map(normalizeRoom)
          .sort((a, b) => String(a.roomNumber).localeCompare(String(b.roomNumber), 'vi', { numeric: true })),
        current: itemsOf(current.data.data).map(normalizeReading),
        previous: itemsOf(previous.data.data).map(normalizeReading),
      },
    },
  }))
  : Promise.resolve({ data: { data: null } }));

/** SCR-51 Nhập chỉ số điện nước — UC-03, FR-59, BR-50→53. Admin/Staff nhập, Viewer chỉ xem */
export default function UtilityReadingsPage() {
  const { user } = useAuth();
  const { modal, message } = App.useApp();
  const canEdit = can(user, 'utilityReading:record');

  const [period, setPeriod] = useState(currentPeriod());
  const [buildingId, setBuildingId] = useState(null);
  const [drafts, setDrafts] = useState({});           // roomId → { field: value }
  const [serverErrors, setServerErrors] = useState({}); // roomId → thông báo lỗi lần lưu trước
  const [saving, setSaving] = useState(false);

  const { data: buildings } = useApi(() => roomApi.getBuildings(), []);
  const { data: feeTypes } = useApi(() => feeApi.getFeeTypes(), []);
  const activeBuildingId = buildingId ?? buildings?.[0]?.id ?? null;
  const building = buildings?.find((b) => b.id === activeBuildingId);

  const { data: sheet, loading, error, refetch } = useApi(() => loadSheet(activeBuildingId, period), [activeBuildingId, period]);

  const prices = useMemo(() => ({
    electricity: feeTypes?.find((t) => t.code === 'electricity')?.defaultAmount ?? 0,
    water: feeTypes?.find((t) => t.code === 'water')?.defaultAmount ?? 0,
  }), [feeTypes]);

  const rows = useMemo(() => (sheet?.rooms || []).map((room) => buildRow({
    room,
    saved: sheet.current.find((u) => u.roomId === room.id),
    previous: sheet.previous.find((u) => u.roomId === room.id),
    draft: drafts[room.id],
    prices,
    serverError: serverErrors[room.id],
  })), [sheet, drafts, prices, serverErrors]);

  const counts = useMemo(() => {
    const by = (s) => rows.filter((r) => r.status === s).length;
    const required = rows.filter((r) => r.occupants > 0 || r.saved).length;
    return {
      error: by('error'), empty: by('empty'), incomplete: by('incomplete'), unsaved: by('unsaved'),
      dirty: rows.filter((r) => r.dirty).length,
      required,
      recorded: rows.filter((r) => (r.occupants > 0 || r.saved) && r.saved).length,
    };
  }, [rows]);
  const allInvoiced = rows.some((r) => r.invoiced) && rows.every((r) => r.invoiced || (!r.saved && r.skipped));

  // Rời trang khi còn thay đổi chưa lưu → trình duyệt hỏi lại
  useEffect(() => {
    if (!counts.dirty) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [counts.dirty]);

  const resetDrafts = () => { setDrafts({}); setServerErrors({}); };

  /** Đổi kỳ / tòa khi đang có bản nháp → hỏi trước khi bỏ */
  const guard = (apply) => {
    if (!counts.dirty) { apply(); return; }
    modal.confirm({
      title: 'Bỏ các thay đổi chưa lưu?',
      content: `${counts.dirty} phòng đã sửa nhưng chưa lưu sẽ mất.`,
      okText: 'Bỏ thay đổi',
      okButtonProps: { danger: true },
      cancelText: 'Ở lại',
      onOk: () => { resetDrafts(); apply(); },
    });
  };

  const setValue = (roomId, field, value) => {
    setDrafts((prev) => ({ ...prev, [roomId]: { ...prev[roomId], [field]: value } }));
    setServerErrors((prev) => (prev[roomId] ? { ...prev, [roomId]: undefined } : prev));
  };

  const handleSave = async () => {
    const toSave = rows.filter((r) => r.status === 'unsaved');
    setSaving(true);
    const failed = {};
    const savedIds = [];
    // Lưu lần lượt từng phòng: một phòng lỗi không chặn các phòng khác
    for (const r of toSave) {
      const values = Object.fromEntries(METER_FIELDS.map((f) => [f, r.values[f]]));
      try {
        if (r.saved) await feeApi.updateUtilityReading(r.saved.id, values);
        else await feeApi.saveUtilityReading({ roomId: r.room.id, billingPeriod: period, ...values });
        savedIds.push(r.room.id);
      } catch (err) {
        failed[r.room.id] = getErrorMessage(err);
      }
    }
    setDrafts((prev) => Object.fromEntries(Object.entries(prev).filter(([id]) => !savedIds.includes(id))));
    setServerErrors(failed);
    setSaving(false);
    if (savedIds.length) message.success(`Đã lưu chỉ số ${savedIds.length} phòng`);
    if (Object.keys(failed).length) message.error(`${Object.keys(failed).length} phòng chưa lưu được — xem dòng báo lỗi`);
    refetch();
  };

  const meterColumn = (field, title, bg, rowsRef) => ({
    title, key: field, width: 116, onHeaderCell: () => ({ style: { background: bg } }),
    render: (_, r, index) => {
      const next = rowsRef[index + 1];
      return (
        <MeterCell
          id={`reading-${r.room.id}-${field}`}
          nextId={next ? `reading-${next.room.id}-${field}` : null}
          label={`${title} ${field.startsWith('electricity') ? 'điện' : 'nước'} phòng ${r.roomLabel}`}
          value={r.values[field]}
          onChange={(v) => setValue(r.room.id, field, v)}
          disabled={!canEdit || r.invoiced || r.skipped || saving}
          error={r.errors[field]}
          warning={r.warnings[field]}
          prefilled={field.endsWith('Start') && !r.saved && !!r.previous}
        />
      );
    },
  });

  const consumptionColumn = (key, bg) => ({
    title: 'Tiêu thụ', key, width: 84, align: 'right', onHeaderCell: () => ({ style: { background: bg } }),
    render: (_, r) => (r[key] === null
      ? <Text type="secondary">—</Text>
      : <Text strong style={{ color: r.dirty ? '#1677FF' : undefined, fontVariantNumeric: 'tabular-nums' }}>{r[key].toLocaleString('vi-VN')}</Text>),
  });

  const columns = [
    {
      title: 'Phòng', key: 'room', width: 84,
      render: (_, r) => <Text strong style={{ fontSize: 15 }} type={r.skipped ? 'secondary' : undefined}>{r.roomLabel}</Text>,
    },
    {
      title: 'Người ở', key: 'occupants', width: 80, align: 'center',
      render: (_, r) => (
        <Tooltip title={`${r.occupants} người đang ở / ${r.room.capacity ?? '—'} giường`}>
          <span style={{
            display: 'inline-grid', placeItems: 'center', minWidth: 30, height: 30, borderRadius: 15, padding: '0 8px',
            background: r.occupants ? '#F0F0F0' : '#FAFAFA', color: r.occupants ? undefined : '#BFBFBF', fontWeight: 600,
          }}>{r.occupants}</span>
        </Tooltip>
      ),
    },
    {
      title: <Space size={6} style={{ color: '#1677FF' }}><ThunderboltOutlined />ĐIỆN (kWh)</Space>,
      onHeaderCell: () => ({ style: { background: ELECTRIC_BG, textAlign: 'center' } }),
      children: [
        meterColumn('electricityStart', 'Chỉ số cũ', ELECTRIC_BG, rows),
        meterColumn('electricityEnd', 'Chỉ số mới', ELECTRIC_BG, rows),
        consumptionColumn('electricityConsumption', ELECTRIC_BG),
      ],
    },
    {
      title: <Space size={6} style={{ color: '#389E0D' }}><ExperimentOutlined />NƯỚC (m³)</Space>,
      onHeaderCell: () => ({ style: { background: WATER_BG, textAlign: 'center' } }),
      children: [
        meterColumn('waterStart', 'Chỉ số cũ', WATER_BG, rows),
        meterColumn('waterEnd', 'Chỉ số mới', WATER_BG, rows),
        consumptionColumn('waterConsumption', WATER_BG),
      ],
    },
    { title: 'Tiền mỗi người', key: 'share', width: 170, align: 'right', render: (_, r) => <ReadingShareCell row={r} /> },
    {
      title: 'Trạng thái', key: 'status', width: 120, align: 'center',
      render: (_, r) => {
        const tag = <Tag color={READING_STATUS[r.status].color} style={{ margin: 0 }}>{READING_STATUS[r.status].label}</Tag>;
        return r.serverError
          ? <Tooltip title={r.serverError}>{tag}<Text type="danger" style={{ display: 'block', fontSize: 12, lineHeight: 1.3, marginTop: 4 }}>{r.serverError}</Text></Tooltip>
          : tag;
      },
    },
  ];

  const pct = counts.required ? Math.round((counts.recorded / counts.required) * 100) : 0;

  return (
    <>
      <PageHeader
        breadcrumb={['Tài chính', 'Chỉ số điện nước']}
        title="Nhập chỉ số điện nước"
        description="Chỉ số cũ tự lấy từ kỳ trước. Tiền điện nước chia đều cho số người đang ở trong phòng."
      />

      <Card styles={{ body: { padding: '12px 16px' } }} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <Space>
            <Text>Kỳ:</Text>
            <Select
              aria-label="Kỳ" style={{ width: 160 }} value={period} options={periodOptions(12)}
              onChange={(v) => guard(() => setPeriod(v))}
            />
          </Space>
          <Space>
            <Text>Tòa nhà:</Text>
            <Select
              aria-label="Tòa nhà" style={{ minWidth: 160, maxWidth: 280 }} popupMatchSelectWidth={false} value={activeBuildingId} loading={!buildings}
              options={(buildings || []).map((b) => ({ value: b.id, label: b.name }))}
              onChange={(v) => guard(() => setBuildingId(v))}
            />
          </Space>
          <div style={{ flex: 1 }} />
          <Tooltip title="Đơn giá hiện tại trong danh mục loại phí. Phòng đã lưu dùng đơn giá chốt lúc nhập (BR-52).">
            <span style={{ background: '#F5F7FA', borderRadius: 8, padding: '6px 12px', display: 'inline-flex', gap: 8, alignItems: 'center' }}>
              <InfoCircleOutlined style={{ color: '#1677FF' }} />
              <Text>Đơn giá: Điện {formatCurrency(prices.electricity)}/kWh · Nước {formatCurrency(prices.water)}/m³</Text>
            </span>
          </Tooltip>
        </div>
      </Card>

      {!!rows.length && (
        <Card styles={{ body: { padding: '12px 16px' } }} style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <Space><CheckSquareOutlined style={{ color: '#1677FF' }} /><Text strong>Tiến độ ghi điện nước · {periodLabel(period)}</Text></Space>
            <Text strong>Đã nhập {counts.recorded}/{counts.required} phòng <Text type="secondary">({pct}%)</Text></Text>
          </div>
          <Progress percent={pct} showInfo={false} style={{ margin: 0 }} aria-label="Tiến độ ghi điện nước" />
        </Card>
      )}

      {allInvoiced && (
        <Alert
          type="info" showIcon style={{ marginBottom: 16 }}
          title={`${periodLabel(period)} của ${building?.name ?? 'tòa này'} đã lập hóa đơn`}
          description="Chỉ số đã khóa, chỉ xem được (BR-53). Cần sửa thì hủy hóa đơn của kỳ trước."
        />
      )}
      {!canEdit && !allInvoiced && <Alert type="info" showIcon style={{ marginBottom: 16 }} title="Bạn chỉ có quyền xem chỉ số điện nước" />}
      {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}

      <Card styles={{ body: { padding: 0 } }}>
        <Table
          rowKey="key" columns={columns} dataSource={rows} loading={loading && !sheet}
          pagination={false} size="middle" bordered={false} scroll={{ x: 1100 }}
          rowClassName={(r) => `reading-row-${r.status}`}
          onRow={(r) => ({ style: { background: r.status === 'error' ? '#FFF6F6' : ['unsaved', 'incomplete'].includes(r.status) ? '#F5F9FF' : undefined } })}
          locale={{ emptyText: activeBuildingId ? 'Tòa này chưa có phòng nào' : 'Chưa có tòa nhà nào đang hoạt động' }}
          footer={rows.length ? () => <Text type="secondary">{rows.length} phòng của {building?.name} · Enter để xuống phòng kế tiếp cùng cột</Text> : undefined}
        />
      </Card>

      {canEdit && !allInvoiced && rows.length > 0 && (
        <ReadingSaveBar counts={counts} saving={saving} onReset={resetDrafts} onSave={handleSave} />
      )}
    </>
  );
}
