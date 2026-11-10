import { useEffect, useMemo, useState } from 'react';
import {
  Card, Select, Table, Tag, Typography, Progress, Alert, Tooltip, App, Space, InputNumber, Button,
} from 'antd';
import {
  ThunderboltOutlined, ExperimentOutlined, CheckSquareOutlined, HistoryOutlined, InfoCircleOutlined,
} from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../context/AuthContext';
import { can } from '../../../utils/permission';
import { feeApi } from '../api/fee.api';
import { roomApi } from '../../rooms/api/room.api';
import { getErrorCode, getErrorMessage } from '../../../lib/axiosClient';
import PageHeader from '../../../components/PageHeader';
import MeterCell from '../components/readings/MeterCell';
import ReadingAmountCell from '../components/readings/ReadingAmountCell';
import ReadingSaveBar from '../components/readings/ReadingSaveBar';
import RoomUtilityHistoryDrawer from '../components/readings/RoomUtilityHistoryDrawer';
import {
  METER_FIELDS, READING_STATUS, buildRow, currentPeriod, periodLabel, periodOptions,
} from '../utils/readingSheet';

const { Text } = Typography;

const ELECTRIC_BG = '#EEF4FF';
const WATER_BG = '#EFF8F1';

const isPrice = (v) => Number.isInteger(v) && v > 0;
const priceFormatter = (v) => (v === undefined || v === null || v === '' ? '' : Number(v).toLocaleString('vi-VN'));
const priceParser = (v) => (v ? v.replace(/\D/g, '') : '');

/** SCR-51 Chỉ số điện nước — FR-40 nhập theo tòa + tháng, FR-41 chốt & phát hành, FR-42 lịch sử phòng */
export default function UtilityReadingsPage() {
  const { user } = useAuth();
  const { modal, message } = App.useApp();
  const canEdit = can(user, 'utilityReading:record');

  const [monthYear, setMonthYear] = useState(currentPeriod);
  const [buildingId, setBuildingId] = useState(null);
  const [drafts, setDrafts] = useState({});             // roomId → { field: value }
  const [serverErrors, setServerErrors] = useState({}); // roomId → thông báo lỗi lần lưu trước
  const [priceDraft, setPriceDraft] = useState(null);   // null = dùng đơn giá mặc định của lưới (D4)
  const [priceErrors, setPriceErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [historyRow, setHistoryRow] = useState(null);

  const { data: buildings } = useApi(() => roomApi.getBuildings(), []);
  const activeBuildingId = (buildingId && buildings?.some((b) => b.id === buildingId) ? buildingId : null) ?? buildings?.[0]?.id ?? null;
  const building = buildings?.find((b) => b.id === activeBuildingId);

  const { data: sheet, loading, error, refetch } = useApi(
    () => (activeBuildingId ? feeApi.getUtilitySheet({ buildingId: activeBuildingId, monthYear }) : Promise.resolve({ data: { data: null } })),
    [activeBuildingId, monthYear],
  );
  const ready = sheet && sheet.buildingId === activeBuildingId && sheet.monthYear === monthYear;

  const defaults = ready ? sheet.defaultUnitPrices : { electricity: 0, water: 0 };
  const prices = priceDraft ?? defaults;
  const priceDirty = !!priceDraft && (priceDraft.electricity !== defaults.electricity || priceDraft.water !== defaults.water);

  const rows = useMemo(() => (ready ? sheet.rows : []).map((sheetRow) => buildRow({
    // Lưới chỉ có một tòa: ghép mã tòa để hiện "K1-101" như các màn khác
    sheetRow: { ...sheetRow, room: { ...sheetRow.room, buildingCode: building?.code } },
    draft: drafts[sheetRow.room.id],
    prices,
    priceDirty,
    serverError: serverErrors[sheetRow.room.id],
  })), [ready, sheet, building, drafts, prices, priceDirty, serverErrors]);

  const counts = useMemo(() => {
    const by = (s) => rows.filter((r) => r.status === s).length;
    const occupiedRows = rows.filter((r) => r.occupants > 0);
    return {
      error: by('error'), incomplete: by('incomplete'), unsaved: by('unsaved'),
      empty: rows.filter((r) => r.status === 'empty' && r.occupants > 0).length,
      dirty: rows.filter((r) => r.dirty).length + (priceDirty ? 1 : 0),
      required: occupiedRows.length,
      recorded: occupiedRows.filter((r) => r.reading).length,
      billed: by('billed'),
      publishable: rows.filter((r) => r.publishable).length,
    };
  }, [rows, priceDirty]);
  const editable = rows.some((r) => !r.billed && !r.skipped);
  const allBilled = rows.length > 0 && counts.billed > 0 && !editable;

  // Rời trang khi còn thay đổi chưa lưu → trình duyệt hỏi lại
  useEffect(() => {
    if (!counts.dirty) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [counts.dirty]);

  const resetDrafts = () => { setDrafts({}); setServerErrors({}); setPriceDraft(null); setPriceErrors({}); };

  /** Đổi tháng / tòa khi đang có bản nháp → hỏi trước khi bỏ */
  const guard = (apply) => {
    if (!counts.dirty) { resetDrafts(); apply(); return; }
    modal.confirm({
      title: 'Bỏ các thay đổi chưa lưu?',
      content: 'Chỉ số hoặc đơn giá đã sửa nhưng chưa lưu sẽ mất.',
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
  const setPrice = (key, value) => {
    setPriceDraft((prev) => ({ ...(prev ?? defaults), [key]: value === null ? null : Math.trunc(value) }));
    setPriceErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSave = async () => {
    const nextPriceErrors = {};
    if (!isPrice(prices.electricity)) nextPriceErrors.electricity = 'Nhập đơn giá điện';
    if (!isPrice(prices.water)) nextPriceErrors.water = 'Nhập đơn giá nước';
    if (Object.keys(nextPriceErrors).length) { setPriceErrors(nextPriceErrors); message.error('Nhập đơn giá điện nước trước khi lưu'); return; }

    const toSave = rows.filter((r) => r.status === 'unsaved');
    setSaving(true);
    try {
      const res = await feeApi.saveUtilityBulk({
        buildingId: activeBuildingId, monthYear,
        electricityUnitPrice: prices.electricity, waterUnitPrice: prices.water,
        rows: toSave.map((r) => ({ roomId: r.room.id, ...Object.fromEntries(METER_FIELDS.map((f) => [f, r.values[f]])) })),
      });
      const { savedCount, errors = [] } = res.data.data;
      const failed = Object.fromEntries(errors.map((e) => [e.roomId, e.message]));
      // Phòng đã lưu bỏ bản nháp; phòng lỗi giữ bản nháp để sửa tiếp
      setDrafts((prev) => Object.fromEntries(Object.entries(prev).filter(([id]) => failed[id])));
      setServerErrors(failed);
      setPriceDraft(null);
      if (savedCount) message.success(res.data.message);
      if (errors.length) message.error(`${errors.length} phòng chưa lưu được — xem dòng báo lỗi`);
      refetch();
    } catch (err) {
      const fieldErrors = err.response?.data?.data?.errors || [];
      const byField = Object.fromEntries(fieldErrors.map((e) => [e.field === 'electricityUnitPrice' ? 'electricity' : e.field === 'waterUnitPrice' ? 'water' : e.field, e.message]));
      setPriceErrors({ electricity: byField.electricity, water: byField.water });
      message.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const doPublish = async () => {
    setPublishing(true);
    try {
      const res = await feeApi.publishUtility({ buildingId: activeBuildingId, monthYear });
      const { publishedCount, notifiedCount, skipped = [] } = res.data.data;
      modal.success({
        title: res.data.message,
        content: (
          <>
            <p style={{ margin: '0 0 6px' }}>{publishedCount} phòng · {notifiedCount} sinh viên nhận email và thấy hóa đơn ở Cổng sinh viên. Hạn nộp 7 ngày.</p>
            {skipped.length > 0 && <p style={{ margin: 0 }}>Bỏ qua: {skipped.map((x) => `${x.roomNumber} (${x.reason})`).join(', ')}</p>}
          </>
        ),
      });
    } catch (err) {
      if (getErrorCode(err) === 'NOTHING_TO_PUBLISH') message.warning(getErrorMessage(err));
      else modal.error({ title: 'Chưa phát hành được', content: getErrorMessage(err) });
    } finally {
      setPublishing(false);
      refetch();
    }
  };

  const confirmPublish = () => {
    const ready = rows.filter((r) => r.publishable);
    const missing = rows.filter((r) => r.occupants > 0 && !r.reading);
    const emptyWithReading = rows.filter((r) => r.reading && !r.billed && r.occupants === 0);
    const total = ready.reduce((t, r) => t + (r.total ?? 0), 0);
    modal.confirm({
      title: `Chốt & phát hành điện nước ${periodLabel(monthYear).toLowerCase()} — ${building?.name}?`,
      width: 520,
      content: (
        <>
          <p style={{ margin: '0 0 8px' }}>
            Tạo <b>{ready.length} hóa đơn</b>, mỗi phòng một hóa đơn, tổng <b>{total.toLocaleString('vi-VN')} đ</b>, hạn nộp 7 ngày.
            Sau khi chốt, chỉ số các phòng này bị khóa, không sửa được nữa.
          </p>
          {missing.length > 0 && (
            <Alert
              type="warning" showIcon style={{ marginBottom: 8 }}
              title={`${missing.length} phòng có người chưa nhập chỉ số: ${missing.map((r) => r.roomLabel).join(', ')}`}
              description="Các phòng này chưa có hóa đơn lần này. Nhập sau rồi chốt lại — phòng đã chốt không bị phát hành lần hai."
            />
          )}
          {emptyWithReading.length > 0 && (
            <Text type="secondary">Phòng không còn người ở sẽ bị bỏ qua: {emptyWithReading.map((r) => r.roomLabel).join(', ')}.</Text>
          )}
        </>
      ),
      okText: 'Chốt & phát hành',
      cancelText: 'Hủy',
      onOk: doPublish,
    });
  };

  const meterColumn = (field, title, bg) => ({
    title, key: field, width: 104, onHeaderCell: () => ({ style: { background: bg } }),
    render: (_, r, index) => {
      const next = rows[index + 1];
      return (
        <MeterCell
          id={`reading-${r.room.id}-${field}`}
          nextId={next ? `reading-${next.room.id}-${field}` : null}
          label={`${title} ${field.startsWith('electricity') ? 'điện' : 'nước'} phòng ${r.roomLabel}`}
          value={r.values[field]}
          onChange={(v) => setValue(r.room.id, field, v)}
          disabled={!canEdit || r.billed || r.skipped || saving || publishing}
          error={r.errors[field]}
          warning={r.warnings[field]}
          prefilled={field.endsWith('OldIndex') && !r.reading && !!r.previous}
        />
      );
    },
  });

  const usageColumn = (key, bg) => ({
    title: 'Tiêu thụ', key, width: 84, align: 'right', onHeaderCell: () => ({ style: { background: bg } }),
    render: (_, r) => (r[key] === null
      ? <Text type="secondary">—</Text>
      : <Text strong style={{ color: r.dirty ? '#1677FF' : undefined, fontVariantNumeric: 'tabular-nums' }}>{r[key].toLocaleString('vi-VN')}</Text>),
  });

  const columns = [
    {
      title: 'Phòng', key: 'room', width: 90,
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
        meterColumn('electricityOldIndex', 'Chỉ số cũ', ELECTRIC_BG),
        meterColumn('electricityNewIndex', 'Chỉ số mới', ELECTRIC_BG),
        usageColumn('electricityUsage', ELECTRIC_BG),
      ],
    },
    {
      title: <Space size={6} style={{ color: '#389E0D' }}><ExperimentOutlined />NƯỚC (m³)</Space>,
      onHeaderCell: () => ({ style: { background: WATER_BG, textAlign: 'center' } }),
      children: [
        meterColumn('waterOldIndex', 'Chỉ số cũ', WATER_BG),
        meterColumn('waterNewIndex', 'Chỉ số mới', WATER_BG),
        usageColumn('waterUsage', WATER_BG),
      ],
    },
    { title: 'Tiền cả phòng', key: 'amount', width: 150, align: 'right', render: (_, r) => <ReadingAmountCell row={r} /> },
    {
      title: 'Trạng thái', key: 'status', width: 130, align: 'center',
      render: (_, r) => {
        const tag = <Tag color={READING_STATUS[r.status].color} style={{ margin: 0 }}>{READING_STATUS[r.status].label}</Tag>;
        return r.serverError
          ? <Tooltip title={r.serverError}>{tag}<Text type="danger" style={{ display: 'block', fontSize: 12, lineHeight: 1.3, marginTop: 4 }}>{r.serverError}</Text></Tooltip>
          : tag;
      },
    },
    {
      title: '', key: 'history', width: 52, align: 'center',
      render: (_, r) => (
        <Tooltip title="Lịch sử 12 tháng">
          <Button type="text" size="small" icon={<HistoryOutlined />} aria-label={`Lịch sử điện nước phòng ${r.roomLabel}`} onClick={() => setHistoryRow(r)} />
        </Tooltip>
      ),
    },
  ];

  const pct = counts.required ? Math.round((counts.recorded / counts.required) * 100) : 0;
  const priceInput = (key, label, unit) => (
    <Space size={6} align="start">
      <Text style={{ lineHeight: '32px' }}>{label}</Text>
      <div>
        <InputNumber
          aria-label={`Đơn giá ${label.toLowerCase()}`} style={{ width: 110 }} value={prices[key]} min={0} max={1000000} precision={0} controls={false}
          formatter={priceFormatter} parser={priceParser} onChange={(v) => setPrice(key, v)}
          disabled={!canEdit || !editable || saving || publishing} status={priceErrors[key] ? 'error' : undefined}
        />
        {priceErrors[key] && <Text type="danger" style={{ display: 'block', fontSize: 12 }}>{priceErrors[key]}</Text>}
      </div>
      <Text type="secondary" style={{ lineHeight: '32px' }}>đ/{unit}</Text>
    </Space>
  );

  return (
    <>
      <PageHeader
        breadcrumb={['Tài chính', 'Chỉ số điện nước']}
        title="Chỉ số điện nước"
        description="Nhập theo tòa và tháng, chỉ số cũ tự lấy từ tháng trước. Chốt & phát hành tạo một hóa đơn cho mỗi phòng có người."
      />

      <Card styles={{ body: { padding: '12px 16px' } }} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <Space>
            <Text>Tháng:</Text>
            <Select
              aria-label="Tháng" style={{ width: 160 }} value={monthYear} options={periodOptions(12)}
              onChange={(v) => guard(() => setMonthYear(v))}
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
          {ready && (
            <Space size={16} wrap align="start">
              {priceInput('electricity', 'Điện', 'kWh')}
              {priceInput('water', 'Nước', 'm³')}
              <Tooltip title="Không có bảng giá riêng: đơn giá tự điền theo lần nhập gần nhất của tòa. Lưu lần này thì mọi phòng chưa chốt dùng giá này; phòng đã phát hành giữ giá lúc chốt.">
                <InfoCircleOutlined style={{ color: '#1677FF', lineHeight: '32px', marginTop: 9 }} aria-label="Giải thích đơn giá" />
              </Tooltip>
            </Space>
          )}
        </div>
        {priceDirty && counts.publishable + counts.unsaved > 0 && (
          <Text type="warning" style={{ display: 'block', marginTop: 8, fontSize: 13 }}>
            Đơn giá đã đổi — bấm Lưu để tính lại tiền cho các phòng đã nhập nhưng chưa chốt.
          </Text>
        )}
      </Card>

      {rows.length > 0 && (
        <Card styles={{ body: { padding: '12px 16px' } }} style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <Space><CheckSquareOutlined style={{ color: '#1677FF' }} /><Text strong>Tiến độ · {periodLabel(monthYear)}</Text></Space>
            <Text strong>
              Đã nhập {counts.recorded}/{counts.required} phòng có người <Text type="secondary">({pct}%)</Text>
              {counts.billed > 0 && <Text type="secondary"> · đã phát hành {counts.billed}</Text>}
            </Text>
          </div>
          <Progress percent={pct} showInfo={false} style={{ margin: 0 }} aria-label="Tiến độ nhập chỉ số" />
        </Card>
      )}

      {allBilled && (
        <Alert
          type="info" showIcon style={{ marginBottom: 16 }}
          title={`${periodLabel(monthYear)} của ${building?.name ?? 'tòa này'} đã chốt`}
          description="Hóa đơn điện nước đã phát hành, chỉ số đã khóa và chỉ xem được."
        />
      )}
      {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}

      <Card styles={{ body: { padding: 0 } }}>
        <Table
          rowKey="key" columns={columns} dataSource={rows} loading={loading && !ready}
          pagination={false} size="middle" bordered={false} scroll={{ x: 1090 }}
          rowClassName={(r) => `reading-row-${r.status}`}
          onRow={(r) => ({ style: { background: r.status === 'error' ? '#FFF6F6' : ['unsaved', 'incomplete'].includes(r.status) ? '#F5F9FF' : undefined } })}
          locale={{ emptyText: activeBuildingId ? 'Tòa này chưa có phòng nào đang dùng' : 'Chưa có tòa nhà nào đang hoạt động' }}
          footer={rows.length ? () => <Text type="secondary">{rows.length} phòng của {building?.name} · Enter để xuống phòng kế tiếp cùng cột</Text> : undefined}
        />
      </Card>

      {canEdit && editable && (
        <ReadingSaveBar
          counts={counts} saving={saving} publishing={publishing}
          onReset={resetDrafts} onSave={handleSave} onPublish={confirmPublish}
        />
      )}

      <RoomUtilityHistoryDrawer room={historyRow?.room} roomLabel={historyRow?.roomLabel} onClose={() => setHistoryRow(null)} />
    </>
  );
}
