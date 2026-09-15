import { Button, Space, Typography } from 'antd';
import { SaveOutlined, ExclamationCircleFilled, CheckCircleFilled } from '@ant-design/icons';

const { Text } = Typography;

/** Thanh lưu dính đáy màn: tóm tắt lỗi / chưa nhập + Hủy thay đổi + Lưu N phòng */
export default function ReadingSaveBar({ counts, saving, onReset, onSave }) {
  const { error, empty, incomplete, unsaved, dirty, required } = counts;
  const problems = [error && `${error} phòng có lỗi`, incomplete && `${incomplete} phòng nhập dở`, empty && `${empty} phòng chưa nhập`].filter(Boolean);

  return (
    <div
      role="region"
      aria-label="Lưu chỉ số"
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
          {problems.length ? problems.join(', ') : required ? `Đã nhập đủ ${required} phòng có người ở` : 'Chưa có phòng nào có người ở — không cần nhập'}
        </Text>
      </Space>
      <Space>
        <Button onClick={onReset} disabled={!dirty || saving}>Hủy thay đổi</Button>
        <Button type="primary" icon={<SaveOutlined />} onClick={onSave} disabled={!unsaved} loading={saving}>
          {unsaved ? `Lưu ${unsaved} phòng` : 'Lưu'}
        </Button>
      </Space>
    </div>
  );
}
