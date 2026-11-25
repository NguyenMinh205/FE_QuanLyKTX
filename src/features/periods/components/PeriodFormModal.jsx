import { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker, Row, Col, Alert, App } from 'antd';
import dayjs from 'dayjs';
import { periodApi } from '../api/period.api';
import {
  CAMPUS_SCOPE_OPTIONS, TARGET_COHORT_OPTIONS, CONTRACT_TERM_OPTIONS, PERIOD_STATUS_OPTIONS,
} from '../../../constants/statuses';
import { FACULTY_OPTIONS } from '../../../constants/app';
import { getErrorMessage, getFieldErrors } from '../../../lib/axiosClient';

export default function PeriodFormModal({ open, period, onCancel, onSaved }) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const isEdit = !!period;

  useEffect(() => {
    if (!open) return;
    if (isEdit) {
      form.setFieldsValue({
        ...period,
        range: [dayjs(period.startDate), dayjs(period.endDate)],
      });
    } else {
      form.setFieldsValue({
        code: '',
        name: '',
        academicYearStart: dayjs().year(),
        campus: 'cs1',
        targetCohort: 'returning',
        allowedFaculties: [],
        excludedFaculties: [],
        allowedTerms: ['5_months', '10_months'],
        range: [dayjs(), dayjs().add(30, 'day')],
        paymentDeadlineDays: 7,
        status: 'open',
        description: '',
      });
    }
  }, [open, period, isEdit, form]);

  const handleSubmit = async (values) => {
    setSaving(true);
    setError(null);
    const payload = {
      code: values.code.trim().toUpperCase(),
      name: values.name.trim(),
      academicYearStart: Number(values.academicYearStart),
      campus: values.campus,
      targetCohort: values.targetCohort,
      allowedFaculties: values.allowedFaculties || [],
      excludedFaculties: values.excludedFaculties || [],
      allowedTerms: values.allowedTerms,
      startDate: values.range[0].format('YYYY-MM-DD'),
      endDate: values.range[1].format('YYYY-MM-DD'),
      paymentDeadlineDays: Number(values.paymentDeadlineDays || 7),
      status: values.status,
      description: values.description?.trim() || '',
    };
    try {
      const res = isEdit
        ? await periodApi.update(period.id, payload)
        : await periodApi.create(payload);
      message.success(res.data.message);
      onSaved();
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (fieldErrors) form.setFields(fieldErrors.map((e) => ({ name: e.field, errors: [e.message] })));
      else setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={isEdit ? `Chỉnh sửa đợt ${period.code}` : 'Tạo đợt đăng ký KTX mới'}
      okText={isEdit ? 'Lưu thay đổi' : 'Tạo đợt đăng ký'}
      cancelText="Hủy"
      confirmLoading={saving}
      onOk={() => form.submit()}
      onCancel={onCancel}
      destroyOnHidden
      width={700}
    >
      {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 12 }} />}
      <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 8 }}>
        <Row gutter={16}>
          <Col xs={24} md={9}>
            <Form.Item
              name="code" label="Mã đợt"
              normalize={(v) => (v || '').toUpperCase()}
              rules={[{ required: true, message: 'Nhập mã đợt' }, { pattern: /^[A-Z0-9_-]{3,40}$/, message: 'Chữ hoa, số, - hoặc _ (3–40 ký tự)' }]}
            >
              <Input placeholder="VD: DOT-2026-CS3-TSV" disabled={isEdit} />
            </Form.Item>
          </Col>
          <Col xs={24} md={15}>
            <Form.Item name="name" label="Tên đợt đăng ký" rules={[{ required: true, whitespace: true, message: 'Nhập tên đợt' }]}>
              <Input placeholder="VD: Đợt đăng ký KTX Tân SV K21 — Cơ sở 3 Ninh Bình" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item name="academicYearStart" label="Năm bắt đầu năm học" rules={[{ required: true, message: 'Nhập năm học' }]}>
              <InputNumber min={2020} max={2100} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="campus" label="Phạm vi cơ sở" rules={[{ required: true }]}>
              <Select options={CAMPUS_SCOPE_OPTIONS} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="targetCohort" label="Đối tượng SV" rules={[{ required: true }]}>
              <Select options={TARGET_COHORT_OPTIONS} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name="range" label="Khung ngày mở → đóng cổng" rules={[{ required: true, message: 'Chọn thời gian mở đợt' }]}>
              <DatePicker.RangePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={12} md={6}>
            <Form.Item name="paymentDeadlineDays" label="Hạn đóng phí (ngày)" rules={[{ required: true }]}>
              <InputNumber min={1} max={30} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={12} md={6}>
            <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
              <Select options={PERIOD_STATUS_OPTIONS} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="allowedTerms" label="Gói kỳ hạn áp dụng" rules={[{ required: true, message: 'Chọn ít nhất 1 gói kỳ hạn' }]}>
          <Select mode="multiple" options={CONTRACT_TERM_OPTIONS} placeholder="Chọn các gói kỳ hạn hợp lệ" />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name="allowedFaculties" label="Chỉ tiếp nhận Khoa/Ngành (bỏ trống = tất cả)">
              <Select mode="tags" options={FACULTY_OPTIONS} placeholder="VD: Ngoại ngữ, Công nghệ Hóa..." />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="excludedFaculties" label="Loại trừ Khoa/Ngành">
              <Select mode="tags" options={FACULTY_OPTIONS} placeholder="Các ngành không thuộc đợt này" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="description" label="Mô tả / Hướng dẫn" style={{ marginBottom: 0 }}>
          <Input.TextArea rows={2} maxLength={500} placeholder="Thông tin hiển thị cho sinh viên trên trang công khai" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
