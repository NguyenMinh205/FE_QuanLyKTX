import { useState } from 'react';
import { Button, Segmented, Row, Col, Card, Skeleton, Alert, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../context/AuthContext';
import { can } from '../../../utils/permission';
import { roomApi } from '../api/room.api';
import PageHeader from '../../../components/PageHeader';
import EmptyState from '../../../components/EmptyState';
import RoomTypeCard from '../components/RoomTypeCard';
import RoomTypeFormDrawer from '../components/RoomTypeFormDrawer';

const { Text } = Typography;

/** SCR-22 Loại phòng — docs/08 mục 6.2 */
export default function RoomTypesPage() {
  const { user } = useAuth();
  const canManage = can(user, 'roomType:manage');

  const [tier, setTier] = useState('all');
  // null = đóng drawer · { } = thêm mới · roomType = sửa
  const [editing, setEditing] = useState(null);

  const { data, loading, error, refetch } = useApi(() => roomApi.getRoomTypes({ withAvailability: true }), []);
  const all = data || [];
  const count = (t) => all.filter((x) => x.tier === t).length;
  const shown = tier === 'all' ? all : all.filter((x) => x.tier === tier);

  const tabLabel = (label, n) => <span>{label} <Text type="secondary">({n})</Text></span>;

  return (
    <>
      <PageHeader
        breadcrumb={['Cơ sở vật chất', 'Loại phòng']}
        title="Loại phòng"
        description="Cấu hình hạng phòng, sức chứa, giá và đồ dùng cấp sẵn"
        extra={canManage && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setEditing({})}>Thêm loại phòng</Button>
        )}
      />

      <Segmented
        value={tier}
        onChange={setTier}
        style={{ marginBottom: 16 }}
        options={[
          { value: 'all', label: tabLabel('Tất cả', all.length) },
          { value: 'standard', label: tabLabel('Tiêu chuẩn', count('standard')) },
          { value: 'premium', label: tabLabel('Chất lượng cao', count('premium')) },
        ]}
      />

      {error && <Alert type="error" showIcon title={error} />}

      {!error && loading && (
        <Row gutter={[16, 16]}>
          {[1, 2, 3].map((k) => <Col key={k} xs={24} md={12} xl={8}><Card><Skeleton active /></Card></Col>)}
        </Row>
      )}

      {!error && !loading && shown.length === 0 && (
        <Card>
          <EmptyState
            description="Chưa có loại phòng nào"
            actionText={canManage ? 'Thêm loại phòng' : undefined}
            onAction={() => setEditing({})}
          />
        </Card>
      )}

      {!error && !loading && shown.length > 0 && (
        <Row gutter={[16, 16]}>
          {shown.map((t) => (
            <Col key={t.id} xs={24} md={12} xl={8}>
              <RoomTypeCard roomType={t} canEdit={canManage} onEdit={() => setEditing(t)} />
            </Col>
          ))}
        </Row>
      )}

      <RoomTypeFormDrawer
        open={editing !== null}
        roomType={editing?.id ? editing : null}
        onClose={() => setEditing(null)}
        onSaved={() => { setEditing(null); refetch(); }}
      />
    </>
  );
}
