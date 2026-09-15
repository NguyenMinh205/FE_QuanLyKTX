import { useState } from 'react';
import {
  Modal, Form, Select, DatePicker, Input, Alert, Typography, App,
} from 'antd';
import dayjs from 'dayjs';
import { useApi } from '../../../hooks/useApi';
import { useDebounce } from '../../../hooks/useDebounce';
import { applicationApi } from '../api/application.api';
import { studentApi } from '../../students/api/student.api';
import { roomApi } from '../../rooms/api/room.api';
import { getErrorCode, getErrorMessage, getFieldErrors } from '../../../lib/axiosClient';
import { GENDER } from '../../../constants/statuses';
import { formatCurrency } from '../../../utils/formatter';
import { roomTextOf } from '../utils/applicationView';

const { Text } = Typography;
const EMPTY_LIST = Promise.resolve({ data: { data: { items: [], total: 0, page: 1, limit: 10 } } });
const API_DATE = 'YYYY-MM-DD';
/** Lỗi thuộc về sinh viên được chọn — hiện ngay dưới ô Sinh viên */
const STUDENT_ERRORS = ['DUPLICATE_PENDING_APPLICATION', 'STUDENT_HAS_ACTIVE_CONTRACT'];
const ROOM_ERRORS = ['ROOM_FULL', 'GENDER_MISMATCH', 'ROOM_TYPE_MISMATCH'];

/** Mặc định: từ hôm nay tới hết năm học (30/6) */
const defaultPeriod = () => {
  const today = dayjs().startOf('day');
  const endYear = today.month() >= 6 ? today.year() + 1 : today.year();
  return [today, dayjs(`${endYear}-06-30`)];
};

/**
 * Lập đơn hộ sinh viên đến đăng ký trực tiếp — POST /api/applications.
 * Đơn lập hộ vẫn vào hàng chờ duyệt như đơn sinh viên tự nộp, không giữ chỗ (BR-34).
 */
export default function CreateApplicationModal({ open, roomTypes, onCancel, onCreated }) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [keyword, setKeyword] = useState('');
  const [student, setStudent] = useState(null);
  const [roomsReload, setRoomsReload] = useState(0);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const debounced = useDebounce(keyword, 300);

  const roomTypeId = Form.useWatch('roomTypeId', form);

  const { data: studentRows, loading: studentsLoading } = useApi(
    () => (open ? studentApi.getList({ search: debounced || undefined, limit: 10 }) : EMPTY_LIST),
    [open, debounced],
  );
  const { data: roomRows, loading: roomsLoading } = useApi(
    () => (open && student && roomTypeId
      ? roomApi.getAvailableRooms({ roomTypeId, gender: student.gender, limit: 100 })
      : EMPTY_LIST),
    [open, student?.id, roomTypeId, roomsReload],
  );
  const rooms = (roomRows || []).filter((r) => r.gender === student?.gender && r.roomTypeId === roomTypeId);

  // Giữ sinh viên đang chọn trong danh sách kể cả khi từ khóa tìm kiếm đổi
  const studentList = [...(studentRows || [])];
  if (student && !studentList.some((s) => s.id === student.id)) studentList.unshift(student);
  const studentOptions = studentList.map((s) => ({
    value: s.id,
    disabled: !!s.residence,
    label: `${s.studentCode} · ${s.fullName} · ${GENDER[s.gender]?.label}${s.residence ? ` — đang ở ${s.residence.bedCode}` : ''}`,
  }));

  const reset = () => {
    form.resetFields();
    setKeyword('');
    setStudent(null);
    setFormError(null);
  };

  const handleCancel = () => { reset(); onCancel(); };

  const handleValuesChange = (changed) => {
    setFormError(null);
    if ('studentId' in changed) {
      setStudent(studentList.find((s) => s.id === changed.studentId) || null);
      form.setFieldValue('roomId', undefined);
    }
    if ('roomTypeId' in changed) form.setFieldValue('roomId', undefined);
  };

  const handleSubmit = async ({ studentId, roomId, period, note }) => {
    setSaving(true);
    try {
      const res = await applicationApi.create({
        studentId, roomId, note: note?.trim() || '',
        startDate: period[0].format(API_DATE), endDate: period[1].format(API_DATE),
      });
      const created = res.data.data;
      message.success(`Đã lập đơn ${created.applicationCode} cho ${created.student?.fullName ?? 'sinh viên'}`);
      reset();
      onCreated(created);
    } catch (err) {
      const code = getErrorCode(err);
      const fieldErrors = getFieldErrors(err);
      if (fieldErrors) {
        form.setFields(fieldErrors.map((e) => ({ name: e.field, errors: [e.message] })));
      } else if (STUDENT_ERRORS.includes(code)) {
        form.setFields([{ name: 'studentId', errors: [getErrorMessage(err)] }]);
      } else if (ROOM_ERRORS.includes(code)) {
        form.setFields([{ name: 'roomId', value: undefined, errors: [getErrorMessage(err)] }]);
        setRoomsReload((n) => n + 1);
      } else {
        setFormError(getErrorMessage(err));
      }
    } finally {
      setSaving(false);
    }
  };

  const typeOptions = (roomTypes || [])
    .filter((t) => t.isActive)
    .map((t) => ({ value: t.id, label: `${t.name} · ${formatCurrency(t.pricePerMonth)}/người/tháng` }));

  return (
    <Modal
      open={open}
      title="Lập đơn cho sinh viên"
      okText="Lập đơn"
      cancelText="Hủy"
      confirmLoading={saving}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      destroyOnHidden
      width={600}
    >
      <Text type="secondary">Dùng khi sinh viên đến đăng ký trực tiếp. Đơn sẽ vào hàng chờ duyệt, chưa giữ chỗ.</Text>
      {formError && <Alert type="error" showIcon title={formError} style={{ marginTop: 12 }} />}

      <Form
        form={form} layout="vertical" style={{ marginTop: 16 }}
        initialValues={{ period: defaultPeriod() }}
        onValuesChange={handleValuesChange}
        onFinish={handleSubmit}
      >
        <Form.Item name="studentId" label="Sinh viên" rules={[{ required: true, message: 'Chọn sinh viên' }]}
          extra="Tìm theo mã sinh viên, họ tên hoặc số điện thoại. Sinh viên đang ở ký túc xá không chọn được.">
          <Select
            showSearch={{ filterOption: false, onSearch: setKeyword }}
            placeholder="Nhập mã hoặc tên sinh viên"
            options={studentOptions}
            loading={studentsLoading}
            notFoundContent={studentsLoading ? 'Đang tìm...' : 'Không tìm thấy sinh viên'}
          />
        </Form.Item>

        <Form.Item name="roomTypeId" label="Loại phòng" rules={[{ required: true, message: 'Chọn loại phòng' }]}>
          <Select placeholder="Chọn loại phòng" options={typeOptions} />
        </Form.Item>

        <Form.Item
          name="roomId" label="Phòng" rules={[{ required: true, message: 'Chọn phòng' }]}
          extra={student ? `Chỉ hiện phòng ${GENDER[student.gender]?.label.toLowerCase()} còn giường trống` : undefined}
        >
          <Select
            placeholder={!student || !roomTypeId ? 'Chọn sinh viên và loại phòng trước' : 'Chọn phòng'}
            disabled={!student || !roomTypeId}
            loading={roomsLoading}
            notFoundContent="Không còn phòng phù hợp có chỗ trống"
            options={rooms.map((r) => ({
              value: r.id,
              label: `${roomTextOf(r)} — ${r.buildingName}, tầng ${r.floor} — còn ${r.availableSlots} chỗ`,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="period" label="Thời gian ở" rules={[{ required: true, message: 'Chọn thời gian ở' }]}
        >
          <DatePicker.RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder={['Ngày bắt đầu', 'Ngày kết thúc']} />
        </Form.Item>

        <Form.Item name="note" label="Ghi chú">
          <Input.TextArea rows={2} maxLength={300} showCount placeholder="VD: Sinh viên đến đăng ký trực tiếp tại văn phòng" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
