import { Empty, Button } from 'antd';

/** Trạng thái rỗng có nút hành động */
export default function EmptyState({ description = 'Chưa có dữ liệu', actionText, onAction }) {
  return (
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={description}>
      {actionText && <Button type="primary" onClick={onAction}>{actionText}</Button>}
    </Empty>
  );
}
