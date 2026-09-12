import { Alert } from 'antd';
import PageHeader from './PageHeader';

/**
 * Trang tạm cho các màn hình chưa làm.
 * Khi làm màn hình thật, thay component này trong routes/AppRoutes.jsx.
 */
export default function PlaceholderPage({ title, module, apiGroup }) {
  return (
    <>
      <PageHeader title={title} />
      <Alert
        type="warning"
        showIcon
        message="Màn hình chưa được cài đặt"
        description={
          <span>
            Module <b>{module}</b> — nhóm API <code>{apiGroup}</code>.
            Xem mô tả màn hình tại <code>08-THIET-KE-GIAO-DIEN.md</code>,
            endpoint tại <code>API.md</code>, và mẫu code tại{' '}
            <code>14-PHIEN-BAN-DON-GIAN-HOA.md</code> mục 15.
          </span>
        }
      />
    </>
  );
}
