import { useState } from 'react';
import {
  Button, Select, Tag, Typography, Alert, Tooltip, Space, App,
} from 'antd';
import { PlusOutlined, EditOutlined, PictureOutlined, ReloadOutlined } from '@ant-design/icons';
import { useApi } from '../../../hooks/useApi';
import { supplyApi } from '../api/supply.api';
import { getErrorMessage } from '../../../lib/axiosClient';
import { SUPPLY_CATEGORY } from '../../../constants/statuses';
import { formatCurrency } from '../../../utils/formatter';
import DataTable from '../../../components/DataTable';
import SupplyItemFormModal from './SupplyItemFormModal';
import { CATEGORY_OPTIONS } from '../utils/supplyView';

const { Text } = Typography;

const EMPTY_FILTERS = { page: 1, limit: 10, search: '', category: undefined, isActive: undefined };

const Thumb = ({ item }) => (item.imageUrl
  ? <img src={item.imageUrl} alt={item.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />
  : (
    <span style={{ width: 48, height: 48, borderRadius: 6, background: '#F5F5F5', display: 'grid', placeItems: 'center', color: '#BFBFBF' }}>
      <PictureOutlined />
    </span>
  ));

/** SCR-71 tab Danh mục sản phẩm (FR-100) */
export default function SupplyItemsTab({ canManage }) {
  const { modal, message } = App.useApp();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [tableKey, setTableKey] = useState(0);
  const [formItem, setFormItem] = useState(null); // null = đóng · {} = thêm · item = sửa

  const { data, meta, loading, error, refetch } = useApi(
    () => supplyApi.getItems({ ...filters, search: filters.search || undefined }),
    [filters],
  );

  const setFilter = (patch) => setFilters((f) => ({ ...f, ...patch, page: 1 }));
  const resetFilters = () => { setFilters(EMPTY_FILTERS); setTableKey((k) => k + 1); };
  const hasFilter = filters.search || filters.category || filters.isActive !== undefined;

  const toggleActive = (item) => {
    const stopping = item.isActive;
    modal.confirm({
      title: stopping ? `Ngừng bán ${item.name}?` : `Bán lại ${item.name}?`,
      content: stopping
        ? 'Sản phẩm không còn hiện trong cửa hàng của sinh viên. Đơn hàng đã đặt vẫn giữ nguyên.'
        : 'Sản phẩm hiện lại trong cửa hàng của sinh viên (trừ loại phòng đã được cấp sẵn).',
      okText: stopping ? 'Ngừng bán' : 'Bán lại',
      okButtonProps: stopping ? { danger: true } : undefined,
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const res = await supplyApi.updateItem(item.id, { isActive: !item.isActive });
          message.success(res.data.message);
        } catch (err) {
          modal.warning({ title: 'Không đổi được trạng thái', content: getErrorMessage(err) });
        }
        refetch();
      },
    });
  };

  const columns = [
    { title: 'Ảnh', key: 'image', width: 70, render: (_, it) => <Thumb item={it} /> },
    {
      title: 'Tên sản phẩm', key: 'name',
      render: (_, it) => (
        <>
          <Text strong={it.isActive} type={it.isActive ? undefined : 'secondary'}>{it.name}</Text>
          {it.description && <div><Text type="secondary" style={{ fontSize: 12 }}>{it.description}</Text></div>}
        </>
      ),
    },
    { title: 'Nhóm', dataIndex: 'category', width: 150, render: (v) => SUPPLY_CATEGORY[v]?.label ?? v },
    { title: 'Đơn vị', dataIndex: 'unit', width: 90 },
    { title: 'Giá', dataIndex: 'price', width: 130, align: 'right', render: (v) => <Text strong>{formatCurrency(v)}</Text> },
    {
      title: 'Loại phòng cấp sẵn', key: 'included', width: 260,
      render: (_, it) => (it.includedRoomTypeNames?.length
        ? <Space size={4} wrap>{it.includedRoomTypeNames.map((n) => <Tag key={n} color="orange" style={{ margin: 0 }}>{n}</Tag>)}</Space>
        : <Text type="secondary">Không</Text>),
    },
    {
      title: 'Trạng thái', dataIndex: 'isActive', width: 120,
      render: (v) => (v ? <Tag color="success" style={{ margin: 0 }}>Đang bán</Tag> : <Tag style={{ margin: 0 }}>Ngừng bán</Tag>),
    },
    ...(canManage ? [{
      title: 'Thao tác', key: 'actions', width: 175, fixed: 'right',
      render: (_, it) => (
        <span style={{ display: 'inline-flex', gap: 2 }}>
          <Button size="small" type="link" icon={<EditOutlined />} onClick={() => setFormItem(it)}>Sửa</Button>
          <Button size="small" type="link" danger={it.isActive} onClick={() => toggleActive(it)}>{it.isActive ? 'Ngừng bán' : 'Bán lại'}</Button>
        </span>
      ),
    }] : []),
  ];

  return (
    <>
      <DataTable
        key={tableKey}
        columns={columns}
        data={data}
        meta={meta}
        loading={loading}
        error={error}
        filters={filters}
        onFiltersChange={setFilters}
        searchPlaceholder="Tìm theo tên sản phẩm…"
        unit="sản phẩm"
        scrollX={1150}
        extraFilters={(
          <>
            <Select
              aria-label="Nhóm sản phẩm" placeholder="Mọi nhóm" allowClear style={{ width: 180 }}
              value={filters.category} onChange={(v) => setFilter({ category: v })} options={CATEGORY_OPTIONS}
            />
            <Select
              aria-label="Trạng thái bán" placeholder="Mọi trạng thái" allowClear style={{ width: 160 }}
              value={filters.isActive} onChange={(v) => setFilter({ isActive: v })}
              options={[{ value: true, label: 'Đang bán' }, { value: false, label: 'Ngừng bán' }]}
            />
            <Tooltip title="Xóa bộ lọc">
              <Button icon={<ReloadOutlined />} onClick={resetFilters} disabled={!hasFilter} aria-label="Xóa bộ lọc" />
            </Tooltip>
            {canManage && <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormItem({})}>Thêm sản phẩm</Button>}
          </>
        )}
      />
      <Alert
        type="info" showIcon
        title="Sản phẩm được cấp sẵn cho loại phòng nào sẽ tự ẩn khỏi cửa hàng của sinh viên ở loại phòng đó"
      />

      {canManage && (
        <SupplyItemFormModal
          key={formItem?.id ?? (formItem ? 'new' : 'closed')}
          open={formItem !== null}
          item={formItem?.id ? formItem : null}
          onCancel={() => setFormItem(null)}
          onSaved={() => { setFormItem(null); refetch(); }}
        />
      )}
    </>
  );
}
