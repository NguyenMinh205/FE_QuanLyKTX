import { useState } from 'react';
import {
  Card, Button, Tag, Typography, Divider, Skeleton, Alert, Modal, Input, Space, App,
} from 'antd';
import { CloseOutlined, EditOutlined, ToolOutlined } from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { roomApi } from '../api/room.api';
import { getErrorMessage } from '../../../lib/axiosClient';
import { formatCurrency } from '../../../utils/formatter';
import { GENDER } from '../../../constants/statuses';
import StatusTag from '../../../components/StatusTag';
import { bedLabelOf, roomLabelOf } from '../utils/roomStatus';

const { Text } = Typography;

const BED_STYLE = {
  occupied:    { bg: '#FAFAFA', border: '#F0F0F0', badgeBg: '#F0F0F0', badgeColor: '#595959' },
  available:   { bg: '#F6FFED', border: '#B7EB8F', badgeBg: '#52C41A', badgeColor: '#fff' },
  maintenance: { bg: '#FFF1F0', border: '#FFA39E', badgeBg: '#FF4D4F', badgeColor: '#fff' },
};

/** Một hàng giường. KHÔNG có nút xếp người vào giường — giường do hệ thống gán khi duyệt đơn (BR-38) */
function BedRow({ bed, canManage, onMaintain, onReopen }) {
  const s = BED_STYLE[bed.status];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
      background: s.bg, border: `1px solid ${s.border}`, borderRadius: 8,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 6, display: 'grid', placeItems: 'center', flexShrink: 0,
        background: s.badgeBg, color: s.badgeColor, fontWeight: 600, fontSize: 13,
      }}>
        {bedLabelOf(bed)}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {bed.status === 'occupied' && (
          <>
            <Text strong ellipsis style={{ display: 'block' }}>{bed.occupant?.studentName}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {bed.occupant?.studentCode}{bed.occupant?.className ? ` · ${bed.occupant.className}` : ''}
            </Text>
          </>
        )}
        {bed.status === 'available' && (
          <>
            <Text strong style={{ color: '#389E0D' }}>Trống</Text>
            <div><Text type="secondary" style={{ fontSize: 12 }}>Sẵn sàng — tự gán khi duyệt đơn đăng ký</Text></div>
          </>
        )}
        {bed.status === 'maintenance' && (
          <>
            <Text strong style={{ color: '#CF1322' }}><ToolOutlined /> Bảo trì</Text>
            <div><Text type="secondary" style={{ fontSize: 12 }}>{bed.note || 'Không có ghi chú'}</Text></div>
          </>
        )}
      </div>

      {canManage && bed.status === 'available' && <Button size="small" onClick={() => onMaintain(bed)}>Bảo trì</Button>}
      {canManage && bed.status === 'maintenance' && <Button size="small" type="link" onClick={() => onReopen(bed)}>Mở lại</Button>}
    </div>
  );
}

/**
 * Khung chi tiết phòng bên phải sơ đồ — SCR-23.
 * @param version tăng lên để buộc tải lại (VD sau khi sửa phòng ở modal)
 */
export default function RoomDetailPanel({ roomId, version, canManageBeds, canEditRoom, onClose, onEdit, onChanged, bordered = true }) {
  const { message, modal } = App.useApp();
  const { data: room, loading, error, refetch } = useApi(() => roomApi.getRoomById(roomId), [roomId, version]);
  const [maintainBed, setMaintainBed] = useState(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const changeBed = async (bed, status, bedNote) => {
    setSaving(true);
    try {
      const res = await roomApi.setBedStatus(bed.id, { status, note: bedNote });
      message.success(res.data.message);
      setMaintainBed(null);
      refetch();
      onChanged();
    } catch (err) {
      message.error(getErrorMessage(err));
      refetch();
    } finally {
      setSaving(false);
    }
  };

  const openMaintain = (bed) => { setNote(''); setMaintainBed(bed); };
  const confirmReopen = (bed) => modal.confirm({
    title: `Mở lại giường ${bedLabelOf(bed)}?`,
    content: 'Giường sẽ chuyển sang trống và có thể được gán khi duyệt đơn đăng ký.',
    okText: 'Mở lại', cancelText: 'Hủy',
    onOk: () => changeBed(bed, 'available'),
  });

  const counts = room?.beds?.reduce((acc, b) => ({ ...acc, [b.status]: (acc[b.status] || 0) + 1 }), {}) || {};
  const included = room ? [...room.amenities, ...room.includedSupplies] : [];

  return (
    <Card
      variant={bordered ? 'outlined' : 'borderless'}
      style={{ position: 'sticky', top: 96 }}
      styles={{ body: { padding: 0 } }}
    >
      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <Text strong style={{ fontSize: 16 }}>
            {room ? `Phòng ${roomLabelOf(room)} · Tầng ${room.floor} · ${room.buildingName}` : 'Chi tiết phòng'}
          </Text>
          {room && (
            <Space size={6} wrap style={{ marginTop: 8, display: 'flex' }}>
              <StatusTag type="roomTier" value={room.tier} />
              <Tag style={{ margin: 0 }}>{room.roomTypeName}</Tag>
              <Tag color={room.gender === 'female' ? 'magenta' : 'blue'} style={{ margin: 0 }}>{GENDER[room.gender]?.label}</Tag>
              {room.status === 'inactive' && <StatusTag type="roomStatus" value="inactive" />}
            </Space>
          )}
        </div>
        <Button type="text" icon={<CloseOutlined />} onClick={onClose} aria-label="Đóng chi tiết phòng" />
      </div>

      <Divider style={{ margin: 0 }} />

      <div style={{ padding: 20 }}>
        {error && <Alert type="error" showIcon title={error} />}
        {!error && (loading || !room) && <Skeleton active paragraph={{ rows: 8 }} />}

        {!error && !loading && room && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Text type="secondary">Đơn giá thuê</Text>
              <Text strong style={{ color: '#1677FF', fontSize: 16 }}>{formatCurrency(room.pricePerMonth)}/người/tháng</Text>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            <div style={{ marginBottom: 12 }}>
              <Text strong>Giường</Text>{' '}
              <Text type="secondary">
                ({counts.occupied || 0}/{room.capacity} đang ở · {counts.available || 0} trống · {counts.maintenance || 0} bảo trì)
              </Text>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {room.beds.map((bed) => (
                <BedRow key={bed.id} bed={bed} canManage={canManageBeds} onMaintain={openMaintain} onReopen={confirmReopen} />
              ))}
            </div>

            <Divider style={{ margin: '20px 0 16px' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text strong>Cấp sẵn trong phòng</Text>
              <Text type="secondary">{included.length} hạng mục</Text>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {room.amenities.map((a) => <Tag key={a} variant="outlined" style={{ margin: 0 }}>{a}</Tag>)}
              {room.includedSupplies.map((s) => <Tag key={s} color="blue" variant="outlined" style={{ margin: 0 }}>{s}</Tag>)}
              {included.length === 0 && <Text type="secondary">Chưa khai báo</Text>}
            </div>
          </>
        )}
      </div>

      {canEditRoom && room && (
        <>
          <Divider style={{ margin: 0 }} />
          <div style={{ padding: '12px 20px' }}>
            <Button type="link" icon={<EditOutlined />} style={{ paddingInline: 0 }} onClick={() => onEdit(room)}>Sửa phòng</Button>
          </div>
        </>
      )}

      <Modal
        open={!!maintainBed}
        title={maintainBed ? `Chuyển giường ${bedLabelOf(maintainBed)} sang bảo trì` : ''}
        okText="Chuyển bảo trì"
        cancelText="Hủy"
        confirmLoading={saving}
        onOk={() => changeBed(maintainBed, 'maintenance', note.trim())}
        onCancel={() => setMaintainBed(null)}
        destroyOnHidden
      >
        <Text type="secondary">Giường bảo trì không được tính là chỗ trống và sẽ không được gán cho sinh viên.</Text>
        <Input.TextArea
          style={{ marginTop: 12 }}
          rows={3}
          maxLength={200}
          showCount
          placeholder="Ghi chú tình trạng, VD: Khung giường hỏng, chờ sửa"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </Modal>
    </Card>
  );
}
