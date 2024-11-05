import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Modal, Form, Input as AntInput, Popconfirm, Popover, Select } from 'antd';
import { EditOutlined, PlusOutlined, DeleteOutlined, EllipsisOutlined } from '@ant-design/icons';
import { getBookingsByHotelId, addBooking, updateBooking, deleteBooking, getUserById, getRoomsByHotelId } from '../api/api';
import './Components.css';
import moment from 'moment';

const { Option } = Select;

const Booking = ({ user }) => {
  const [dataSource, setDataSource] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [popoverVisible, setPopoverVisible] = useState({});
  const [userDetails, setUserDetails] = useState(null);
  const [isUserModalVisible, setUserModalVisible] = useState(false);
  const [calculatedTotalPrice, setCalculatedTotalPrice] = useState(0);

  useEffect(() => {
    const fetchBookings = async () => {
      if (user) {
        const bookings = await getBookingsByHotelId(user);
        const rooms = await getRoomsByHotelId(user);
        
        const availableRooms = rooms.filter(room => room.status !== 'Hidden' && room.status !== 'ROO');

        const bookingsWithDetails = await Promise.all(
          bookings.map(async (booking) => {
            const userDetail = await getUserById(booking.userId);
            const roomDetail = availableRooms.find((room) => room.id === booking.roomId);
            return {
              ...booking,
              userName: userDetail?.name || 'Unknown',
              roomType: roomDetail?.type || 'Unknown',
            };
          })
        );

        setDataSource(bookingsWithDetails);
        setRooms(availableRooms); 
      }
    };

    fetchBookings();
  }, [user]);

  const calculateTotalPrice = (roomId, checkInDate, checkOutDate) => {
    if (!roomId || !checkInDate || !checkOutDate) return 0;

    const room = rooms.find((room) => room.id === roomId);
    if (!room) return 0;

    const checkIn = moment(checkInDate);
    const checkOut = moment(checkOutDate);
    const numDays = checkOut.diff(checkIn, 'days');

    if (numDays <= 0) return 0;

    return numDays * room.price;
  };

  const handleAddBooking = () => {
    setSelectedBooking(null);
    setModalVisible(true);
    form.resetFields();
    setCalculatedTotalPrice(0);
  };

  const handleEditBooking = (record) => {
    setSelectedBooking(record);
    setModalVisible(true);
    form.setFieldsValue(record);
    setPopoverVisible((prev) => ({ ...prev, [record.id]: false }));

    const initialTotalPrice = calculateTotalPrice(record.roomId, record.checkInDate, record.checkOutDate);
    setCalculatedTotalPrice(initialTotalPrice);
  };

  const handleDeleteBooking = async (key) => {
    await deleteBooking(user, key);
    const updatedData = dataSource.filter((item) => item.id !== key);
    setDataSource(updatedData);
    setPopoverVisible((prev) => ({ ...prev, [key]: false }));
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setSelectedBooking(null);
  };

  const handleFormSubmit = async (values) => {
    values.totalPrice = calculatedTotalPrice;

    if (selectedBooking) {
      await updateBooking(user, selectedBooking.id, values);
      const updatedData = dataSource.map((item) =>
        item.id === selectedBooking.id ? { ...item, ...values } : item
      );
      setDataSource(updatedData);
    } else {
      const newBooking = await addBooking(user, values);
      setDataSource([...dataSource, newBooking]);
    }
    handleModalCancel();
  };

  const handleFieldChange = (changedValues, allValues) => {
    const { roomId, checkInDate, checkOutDate } = allValues;
    const newTotalPrice = calculateTotalPrice(roomId, checkInDate, checkOutDate);
    setCalculatedTotalPrice(newTotalPrice);
  };

  const showUserDetails = async (userId) => {
    const userDetails = await getUserById(userId);
    setUserDetails(userDetails);
    setUserModalVisible(true);
  };

  const menu = (record) => (
    <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
      <Button
        type="link"
        icon={<EditOutlined />}
        onClick={() => handleEditBooking(record)}
        style={{ padding: 0, textAlign: 'left' }}
      >
        Edit
      </Button>
      <Popconfirm
        title="Are you sure you want to delete this booking?"
        onConfirm={() => handleDeleteBooking(record.id)}
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
    { title: 'Booking ID', dataIndex: 'id', key: 'id' },
    {
      title: 'Name',
      dataIndex: 'userName',
      key: 'userName',
      render: (text, record) => (
        <Button type="link" onClick={() => showUserDetails(record.userId)}>
          {text}
        </Button>
      ),
    },
    {
      title: 'Room Type',
      dataIndex: 'roomType',
      key: 'roomType',
    },
    { title: 'Total Price', dataIndex: 'totalPrice', key: 'totalPrice' },
    { title: 'Check-in Date', dataIndex: 'checkInDate', key: 'checkInDate' },
    { title: 'Check-out Date', dataIndex: 'checkOutDate', key: 'checkOutDate' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Popover
          content={menu(record)}
          trigger="click"
          visible={popoverVisible[record.id]}
          onVisibleChange={(visible) =>
            setPopoverVisible((prev) => ({ ...prev, [record.id]: visible }))
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
        <h3>Booking List</h3>
        <Space>
          <Input.Search placeholder="Search bookings..." style={{ width: 200 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddBooking}>
            Add Booking
          </Button>
        </Space>
      </div>
      <Table 
        dataSource={dataSource} 
        columns={columns} 
        pagination={{ pageSize: 10 }} 
      />

      <Modal
        title={selectedBooking ? 'Edit Booking' : 'Add Booking'}
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
      >
        <Form form={form} onFinish={handleFormSubmit} layout="vertical" onValuesChange={handleFieldChange}>
          <Form.Item label="User ID" name="userId" rules={[{ required: true, message: 'Please enter user ID' }]}>
            <AntInput />
          </Form.Item>
          <Form.Item label="Room" name="roomId" rules={[{ required: true, message: 'Please select a room' }]}>
            <Select placeholder="Select a room">
              {rooms.map((room) => (
                <Option key={room.id} value={room.id}>
                  {room.type} (Room ID: {room.id})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Check-in Date" name="checkInDate" rules={[{ required: true, message: 'Please select check-in date' }]}>
            <AntInput type="date" />
          </Form.Item>
          <Form.Item label="Check-out Date" name="checkOutDate" rules={[{ required: true, message: 'Please select check-out date' }]}>
            <AntInput type="date" />
          </Form.Item>
          <Form.Item label="Total Price" name="totalPrice">
            <AntInput value={calculatedTotalPrice} disabled />
          </Form.Item>
          <Form.Item label="Status" name="status" rules={[{ required: true, message: 'Please select booking status' }]}>
            <Select placeholder="Select status">
              <Option value="confirmed">Confirmed</Option>
              <Option value="pending">Pending</Option>
              <Option value="canceled">Canceled</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {selectedBooking ? 'Save Changes' : 'Add Booking'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="User Details"
        visible={isUserModalVisible}
        onCancel={() => setUserModalVisible(false)}
        footer={null}
      >
        {userDetails && (
          <>
            <p><strong>Name:</strong> {userDetails.name}</p>
            <p><strong>Email:</strong> {userDetails.email}</p>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Booking;
