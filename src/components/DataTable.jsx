import { Table, Input, Alert, Space } from 'antd';

/**
 * Bảng danh sách dùng chung cho MỌI màn hình danh sách.
 * Gom sẵn: ô tìm kiếm · phân trang phía server · trạng thái đang tải / lỗi / rỗng.
 *
 * Dùng kèm hook useApi — xem mẫu ở StudentsPage.
 *
 * @example
 * const [filters, setFilters] = useState({ page: 1, limit: 20, search: '' });
 * const { data, meta, loading, error } = useApi(() => studentApi.getList(filters), [filters]);
 *
 * <DataTable
 *   columns={columns}
 *   data={data}
 *   meta={meta}
 *   loading={loading}
 *   error={error}
 *   filters={filters}
 *   onFiltersChange={setFilters}
 *   searchPlaceholder="Tìm theo tên, mã số..."
 *   extraFilters={<Select ... />}
 *   unit="sinh viên"
 * />
 */
export default function DataTable({
  columns,
  data,
  meta,
  loading,
  error,
  filters,
  onFiltersChange,
  searchPlaceholder = 'Tìm kiếm...',
  extraFilters = null,
  unit = 'bản ghi',
  rowKey = 'id',
  scrollX = 1000,
  showSearch = true,
}) {
  if (error) return <Alert type="error" title={error} showIcon />;

  // Đổi bộ lọc thì luôn quay về trang 1, nếu không người dùng sẽ thấy trang trống
  const changeFilter = (patch) => onFiltersChange({ ...filters, ...patch, page: 1 });

  return (
    <>
      {(showSearch || extraFilters) && (
        <Space wrap style={{ marginBottom: 16 }}>
          {showSearch && (
            <Input.Search
              placeholder={searchPlaceholder}
              allowClear
              style={{ width: 320 }}
              defaultValue={filters?.search}
              onSearch={(value) => changeFilter({ search: value })}
            />
          )}
          {extraFilters}
        </Space>
      )}

      <Table
        rowKey={rowKey}
        columns={columns}
        dataSource={data || []}
        loading={loading}
        scroll={{ x: scrollX }}
        locale={{ emptyText: loading ? ' ' : 'Không có dữ liệu phù hợp' }}
        pagination={{
          current: meta?.page,
          pageSize: meta?.limit,
          total: meta?.total,
          showSizeChanger: false,
          showTotal: (total) => `Tổng ${total} ${unit}`,
          onChange: (page) => onFiltersChange({ ...filters, page }),
        }}
      />
    </>
  );
}
