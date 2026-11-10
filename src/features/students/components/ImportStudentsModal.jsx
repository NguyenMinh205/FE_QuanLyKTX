import { useState } from 'react';
import {
  Modal, Upload, Button, Alert, Table, Typography, Space, Result,
} from 'antd';
import { InboxOutlined, DownloadOutlined, FileExcelOutlined } from '@ant-design/icons';
import { studentApi } from '../api/student.api';
import { getErrorMessage } from '../../../lib/axiosClient';
import { GENDER } from '../../../constants/statuses';
import { MAX_IMPORT_ROWS, downloadStudentTemplate, parseStudentFile } from '../utils/studentExcel';

const { Text } = Typography;

const FIELD_LABEL = {
  studentCode: 'MSSV', fullName: 'Họ và tên', gender: 'Giới tính', phone: 'Số điện thoại', email: 'Email', dob: 'Ngày sinh',
};

/**
 * FR-12b Nhập sinh viên hàng loạt: tải mẫu → chọn file → xem trước → nhập → báo cáo số thành công và từng dòng lỗi.
 * File đọc ngay ở trình duyệt; chỉ gửi JSON (API.md §3). Nhập chỉ tạo hồ sơ, không tạo tài khoản.
 */
export default function ImportStudentsModal({ open, onClose }) {
  const [file, setFile] = useState(null);
  const [parsed, setParsed] = useState(null); // { rows, missing }
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const reset = () => { setFile(null); setParsed(null); setError(null); setResult(null); };
  const close = () => { const changed = !!result?.successCount; reset(); onClose(changed); };

  const pick = async (f) => {
    reset();
    if (!/\.xlsx$/i.test(f.name)) { setError('Chỉ nhận file Excel .xlsx — dùng đúng file mẫu.'); return false; }
    setBusy(true);
    try {
      setFile(f);
      setParsed(await parseStudentFile(f));
    } catch (err) {
      setError(`Không đọc được file: ${err.message}`);
    } finally {
      setBusy(false);
    }
    return false; // không để Upload tự gửi file lên đâu cả
  };

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await studentApi.importMany({ rows: parsed.rows });
      setResult({ ...res.data.data, message: res.data.message });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const tooMany = parsed && parsed.rows.length > MAX_IMPORT_ROWS;
  const canSubmit = parsed && !parsed.missing.length && parsed.rows.length > 0 && !tooMany && !result;

  const previewColumns = [
    { title: 'Dòng', dataIndex: 'row', width: 60 },
    { title: 'MSSV', dataIndex: 'studentCode', width: 120 },
    { title: 'Họ và tên', dataIndex: 'fullName', width: 180 },
    { title: 'Giới tính', dataIndex: 'gender', width: 90, render: (g) => GENDER[g]?.label ?? (g || '—') },
    { title: 'SĐT', dataIndex: 'phone', width: 120 },
  ];
  const errorColumns = [
    { title: 'Dòng', dataIndex: 'row', width: 70 },
    { title: 'MSSV', dataIndex: 'studentCode', width: 120, render: (v) => v || '—' },
    { title: 'Cột', dataIndex: 'field', width: 120, render: (f) => FIELD_LABEL[f] ?? f },
    { title: 'Lỗi', dataIndex: 'message' },
  ];

  return (
    <Modal
      open={open}
      title={<span><FileExcelOutlined style={{ color: '#389E0D' }} /> Nhập sinh viên từ Excel</span>}
      onCancel={close}
      width={760}
      destroyOnHidden
      mask={{ closable: false }}
      footer={result ? <Button type="primary" onClick={close}>Xong</Button> : (
        <Space>
          <Button onClick={close}>Hủy</Button>
          <Button type="primary" disabled={!canSubmit} loading={busy && !!parsed} onClick={submit}>
            {parsed?.rows.length ? `Nhập ${parsed.rows.length} dòng` : 'Nhập'}
          </Button>
        </Space>
      )}
    >
      {result ? (
        <>
          <Result
            status={result.errorCount ? 'warning' : 'success'}
            title={result.message}
            subTitle={result.errorCount ? 'Các dòng dưới đây chưa được lưu. Sửa trong file rồi nhập lại — dòng đã lưu sẽ báo trùng MSSV, bỏ qua được.' : 'Hồ sơ đã có trong danh sách sinh viên.'}
            style={{ padding: '8px 0 16px' }}
          />
          {result.errorCount > 0 && (
            <Table rowKey={(e) => `${e.row}-${e.field}`} size="small" columns={errorColumns} dataSource={result.errors} pagination={{ pageSize: 8, hideOnSinglePage: true }} scroll={{ x: 560 }} />
          )}
        </>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
            <Text type="secondary">Dùng đúng file mẫu. Tối đa {MAX_IMPORT_ROWS} dòng mỗi lần; nhập chỉ tạo hồ sơ, không tạo tài khoản.</Text>
            <Button icon={<DownloadOutlined />} onClick={() => downloadStudentTemplate().catch((err) => setError(err.message))}>Tải file mẫu</Button>
          </div>
          <Upload.Dragger accept=".xlsx" multiple={false} showUploadList={false} beforeUpload={pick} disabled={busy} aria-label="Chọn file Excel">
            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
            <p className="ant-upload-text">{file ? file.name : 'Kéo file .xlsx vào đây hoặc bấm để chọn'}</p>
          </Upload.Dragger>

          {error && <Alert type="error" showIcon title={error} style={{ marginTop: 12 }} />}
          {parsed?.missing.length > 0 && (
            <Alert type="error" showIcon style={{ marginTop: 12 }} title={`File thiếu cột bắt buộc: ${parsed.missing.join(', ')}`} description="Tải file mẫu và chép dữ liệu sang đúng các cột." />
          )}
          {tooMany && <Alert type="error" showIcon style={{ marginTop: 12 }} title={`File có ${parsed.rows.length} dòng, vượt quá ${MAX_IMPORT_ROWS}. Chia thành nhiều file.`} />}
          {parsed && !parsed.missing.length && parsed.rows.length === 0 && <Alert type="warning" showIcon style={{ marginTop: 12 }} title="File không có dòng dữ liệu nào" />}
          {canSubmit && (
            <div style={{ marginTop: 12 }}>
              <Text strong>Xem trước: {parsed.rows.length} dòng</Text>
              <Table rowKey="row" size="small" columns={previewColumns} dataSource={parsed.rows.slice(0, 5)} pagination={false} scroll={{ x: 560 }} style={{ marginTop: 8 }} />
              {parsed.rows.length > 5 && <Text type="secondary" style={{ fontSize: 12 }}>… và {parsed.rows.length - 5} dòng nữa. Hệ thống kiểm tra từng dòng khi nhập.</Text>}
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
