import { Alert } from 'antd';
import PageHeader from '../components/common/PageHeader';

/**
 * Trang tạm cho các màn hình chưa làm.
 * Khi làm màn hình thật, thay component này trong AppRoutes.jsx.
 */
export default function PlaceholderPage({ title, taskId, screenId }) {
  return (
    <>
      <PageHeader title={title} />
      <Alert
        type="warning"
        showIcon
        message="Màn hình chưa được cài đặt"
        description={
          <span>
            Công việc <b>{taskId}</b> — màn hình <b>{screenId}</b>.
            Xem mô tả tại <code>docs/08-THIET-KE-GIAO-DIEN.md</code> và
            mẫu code tại <code>docs/14</code> mục 15.
          </span>
        }
      />
    </>
  );
}
