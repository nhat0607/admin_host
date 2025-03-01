import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Modal, Form, Input as AntInput, Select, Popconfirm, Popover } from 'antd';
import { EditOutlined, PlusOutlined, DeleteOutlined, EllipsisOutlined } from '@ant-design/icons';
import { getOrderByHotelId } from '../api/api';
import './Components.css';

const { Option } = Select;


const Payment = ({ user }) => {
  const [dataSource, setDataSource] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [popoverVisible, setPopoverVisible] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        const orders = await getOrderByHotelId(user);
        console.log(orders);
        // setRoomData(rooms);
      }
    };
    fetchOrders();
  }, [user]);

  const handleAddPayment = () => {
    setSelectedPayment(null);
    setModalVisible(true);
    form.resetFields();
    setIsPaid(false);
  };

  const handleEditPayment = (record) => {
    setSelectedPayment(record);
    setModalVisible(true);
    form.setFieldsValue(record);
    setIsPaid(record.status === 'Paid');
  };

  const handleDeletePayment = (key) => {
    const updatedData = dataSource.filter((item) => item.key !== key);
    setDataSource(updatedData);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setSelectedPayment(null);
  };

  const handleStatusChange = (value) => {
    setIsPaid(value === 'Paid');
    if (value === 'Due') {
      form.setFieldsValue({ method: 'Unknown', paymentDate: null });
    }
  };

  const handleFormSubmit = (values) => {
    if (selectedPayment) {
      const updatedData = dataSource.map((item) =>
        item.key === selectedPayment.key ? { ...item, ...values } : item
      );
      setDataSource(updatedData);
    } else {
      const newPayment = {
        key: Date.now().toString(),
        ...values,
      };
      setDataSource([...dataSource, newPayment]);
    }
    handleModalCancel();
  };

  const menu = (record) => (
    <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
      <Button
        type="link"
        icon={<EditOutlined />}
        onClick={() => handleEditPayment(record)}
        style={{ padding: 0, textAlign: 'left' }}
      >
        Edit
      </Button>
      <Popconfirm
        title="Are you sure you want to delete this payment?"
        onConfirm={() => handleDeletePayment(record.key)}
        okText="Yes"
        cancelText="No"
      >
        <Button type="link" icon={<DeleteOutlined />} style={{ color: 'red', padding: 0, textAlign: 'left' }}>
          Delete
        </Button>
      </Popconfirm>
    </div>
  );

  const columns = [
    { title: 'Booking ID', dataIndex: 'bookingId', key: 'bookingId' },
    { title: 'Price', dataIndex: 'price', key: 'price' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'Payment Method', dataIndex: 'method', key: 'method' },
    { title: 'Payment Date', dataIndex: 'paymentDate', key: 'paymentDate' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Popover
          content={menu(record)}
          trigger="click"
          visible={popoverVisible[record.key]}
          onVisibleChange={(visible) =>
            setPopoverVisible((prev) => ({ ...prev, [record.key]: visible }))
          }
        >
          <Button type="text" icon={<EllipsisOutlined rotate={90} />} />
        </Popover>
      ),
    },
  ];

  return (
    <div className="table-container">
      <div className="table-header">
        <h3>Payment List</h3>
        <Space>
          <Input.Search placeholder="Search payments..." style={{ width: 200 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddPayment}>
            Add Payment
          </Button>
        </Space>
      </div>
      <Table dataSource={dataSource} columns={columns} pagination={false} />

      <Modal
        title={selectedPayment ? 'Edit Payment' : 'Add Payment'}
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
      >
        <Form form={form} onFinish={handleFormSubmit} layout="vertical">
          <Form.Item label="Booking ID" name="bookingId" rules={[{ required: true, message: 'Please enter booking ID' }]}>
            <AntInput />
          </Form.Item>
          <Form.Item label="Price" name="price" rules={[{ required: true, message: 'Please enter room price' }]}>
            <AntInput type="number" />
          </Form.Item>
          <Form.Item label="Status" name="status" rules={[{ required: true, message: 'Please select booking status' }]}>
            <Select onChange={handleStatusChange}>
              <Option value="Paid">Paid</Option>
              <Option value="Due">Due</Option>
            </Select>
          </Form.Item>

          {isPaid && (
            <>
              <Form.Item label="Payment Method" name="method" rules={[{ required: true, message: 'Please select payment method' }]}>
                <Select>
                  <Option value="Credit Card">Credit Card</Option>
                  <Option value="Cash">Cash</Option>
                  <Option value="Bank Transfer">Bank Transfer</Option>
                </Select>
              </Form.Item>
              <Form.Item label="Payment Date" name="paymentDate" rules={[{ required: true, message: 'Please enter payment date' }]}>
                <AntInput type="date" />
              </Form.Item>
            </>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit">
              {selectedPayment ? 'Save Changes' : 'Add Payment'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Payment;
