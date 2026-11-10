import { Button, Space, Tooltip, Typography } from 'antd';
import {
  SaveOutlined, ExclamationCircleFilled, CheckCircleFilled, LockOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

/**
 * Thanh dính đáy màn: tóm tắt + Hủy thay đổi + Lưu N phòng + Chốt & phát hành.
 * Chốt chỉ bấm được khi không còn gì chưa lưu — tránh phát hành hóa đơn theo số cũ trong khi màn hình đang hiện số mới.
 */
export default function ReadingSaveBar({ counts, saving, publishing, onReset, onSave, onPublish }) {
  const { error, empty, incomplete, unsaved, dirty, required, publishable } = counts;
  const problems = [error && `${error} phòng có lỗi`, incomplete && `${incomplete} phòng nhập dở`, empty && `${empty} phòng có người chưa nhập`].filter(Boolean);
  const busy = saving || publishing;
  const publishBlock = unsaved || dirty ? 'Lưu các thay đổi trước khi chốt'
    : !publishable ? 'Chưa có phòng nào đã lưu chỉ số mà chưa phát hành' : null;

  return (
    <div
      role="region"
      aria-label="Lưu và chốt chỉ số"
      style={{
        position: 'sticky', bottom: 16, zIndex: 20, marginTop: 16,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        background: '#fff', border: '1px solid #f0f0f0', borderRadius: 10, padding: '12px 16px',
        boxShadow: '0 6px 24px rgba(0,0,0,0.10)',
      }}
    >
      <Space size={8}>
        {problems.length
          ? <ExclamationCircleFilled style={{ color: error ? '#FF4D4F' : '#FAAD14', fontSize: 18 }} />
          : <CheckCircleFilled style={{ color: '#52C41A', fontSize: 18 }} />}
        <Text type={error ? 'danger' : undefined} strong={!!error}>
          {problems.length ? problems.join(', ') : required ? `Đã nhập đủ ${required} phòng có người ở` : 'Không có phòng nào có người ở'}
        </Text>
      </Space>
      <Space wrap>
        <Button onClick={onReset} disabled={!dirty || busy}>Hủy thay đổi</Button>
        <Button icon={<SaveOutlined />} onClick={onSave} disabled={!unsaved || publishing} loading={saving}>
          {unsaved ? `Lưu ${unsaved} phòng` : 'Lưu'}
        </Button>
        <Tooltip title={publishBlock}>
          <Button type="primary" icon={<LockOutlined />} onClick={onPublish} disabled={!!publishBlock || saving} loading={publishing}>
            {publishable ? `Chốt & phát hành (${publishable})` : 'Chốt & phát hành'}
          </Button>
        </Tooltip>
      </Space>
    </div>
  );
}
