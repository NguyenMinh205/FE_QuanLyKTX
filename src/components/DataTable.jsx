import { Table, Input, Alert } from 'antd';

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
 *   onRow={(r) => ({ onClick: () => open(r.id) })}   // tùy chọn: bấm cả hàng
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
  onRow,
  rowClassName,
}) {
  if (error) return <Alert type="error" title={error} showIcon />;
  // ⚠️ antd Table sập ("rawData.some is not a function") nếu dataSource không phải mảng — gặp khi backend trả danh
  // sách sai định dạng. Báo rõ thay vì làm sập cả màn.
  if (data != null && !Array.isArray(data)) {
    return <Alert type="error" showIcon title="Máy chủ trả danh sách sai định dạng" description="Cần mảng (API.md mục 1.2). Báo nhóm backend kèm đường dẫn của màn này." />;
  }

  // Đổi bộ lọc thì luôn quay về trang 1, nếu không người dùng sẽ thấy trang trống
  const changeFilter = (patch) => onFiltersChange({ ...filters, ...patch, page: 1 });

  return (
    <>
      {(showSearch || extraFilters) && (
        // Thanh lọc: ở điện thoại xếp lưới 2 cột (index.css `.table-toolbar`) — Space wrap cũ đẩy mỗi ô một dòng, rất dài
        <div className="table-toolbar">
          {showSearch && (
            <Input.Search
              className="table-toolbar-search"
              placeholder={searchPlaceholder}
              allowClear
              style={{ width: 280, maxWidth: '100%' }}
              defaultValue={filters?.search}
              onSearch={(value) => changeFilter({ search: value })}
            />
          )}
          {extraFilters}
        </div>
      )}

      <Table
        rowKey={rowKey}
        onRow={onRow}
        rowClassName={rowClassName}
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
