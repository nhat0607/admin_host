import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Typography, Divider, Table, Input, Card, Modal, Form, message, Select } from 'antd';
import { getBooking, updateGuest } from '../api/api';
import moment from 'moment';

const { Title } = Typography;
const { Option } = Select;

const BookingDetail = () => {
  const { bookingid } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [guests, setGuests] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const bookingData = await getBooking(bookingid);
        setBooking(bookingData);
        setGuests(bookingData.guests || []);
      } catch (error) {
        console.error('Error fetching booking:', error);
      }
    };
    fetchBooking();
  }, [bookingid]);

  if (!booking) return <div>Loading...</div>;

  const handleAddGuest = async (values) => {
    if (booking.status !== 'completed') {
      message.warning('Guests can only be added to completed bookings.');
      return;
    }

    if (guests.length >= booking.room?.capacity) {
      message.warning('Guest capacity reached!');
      return;
    }

    try {
      const updatedBooking = await updateGuest(bookingid, {
        guests: [...guests, { ...values }],
      });
      setGuests(updatedBooking.guests);
      message.success('Guest added successfully!');
      form.resetFields();
      setIsModalVisible(false);
    } catch (error) {
      message.error('Failed to add guest.');
      console.error('Error adding guest:', error);
    }
  };

  const columns = [
    {
      title: 'Guest Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'CCCD',
      dataIndex: 'CCCD',
      key: 'CCCD',
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
    },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', overflowY: 'auto' }}>
      <div style={{ flex: 1, padding: '24px' }}>
        <Card style={{ padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Button type="link" onClick={() => navigate('/host/booking')}>
            ← Back to Booking Manager
          </Button>

          <Divider />

          <Title level={4}>Booking Detail</Title>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', paddingInlineStart: '20px' }}>
            <div className="form-field">
              <span className="form-label">ID:</span>
              <Input className="form-value" value={booking._id} readOnly />
            </div>
            <div className="form-field">
              <span className="form-label">Name:</span>
              <Input className="form-value" value={booking.user?.name} readOnly />
            </div>
            <div className="form-field">
              <span className="form-label">Email:</span>
              <Input className="form-value" value={booking.user?.email} readOnly />
            </div>
            <div className="form-field">
              <span className="form-label">Room Number:</span>
              <Input className="form-value" value={booking.room?.roomNumber} readOnly />
            </div>
            <div className="form-field">
              <span className="form-label">Check In Date:</span>
              <Input
                className="form-value"
                value={moment(booking.checkInDate).format('DD/MM/YYYY')}
                readOnly
              />
            </div>
            <div className="form-field">
              <span className="form-label">Check Out Date:</span>
              <Input
                className="form-value"
                value={moment(booking.checkOutDate).format('DD/MM/YYYY')}
                readOnly
              />
            </div>
            <div className="form-field">
              <span className="form-label">Status:</span>
              <Input className="form-value" value={booking.status} readOnly />
            </div>
          </div>

          <Divider />

          <Title level={4}>Person Information</Title>
          <Button type="primary" onClick={() => setIsModalVisible(true)}>
            Add Guest
          </Button>
          <Table
            className="information-table"
            columns={columns}
            dataSource={guests.map((guest, index) => ({
              key: index,
              name: guest.name,
              CCCD: guest.CCCD,
              gender: guest.gender,
            }))}
            pagination={false}
            bordered
            style={{ marginTop: '16px' }}
            locale={{ emptyText: 'No guests available' }}
          />
        </Card>
      </div>

      <Modal
        title="Add Guest"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleAddGuest}>
          <Form.Item
            label="Guest Name"
            name="name"
            rules={[{ required: true, message: 'Please enter the guest name' }]}
          >
            <Input placeholder="Enter guest name" />
          </Form.Item>
          <Form.Item
            label="CCCD"
            name="CCCD"
            rules={[{ required: true, message: 'Please enter CCCD' }]}
          >
            <Input placeholder="Enter CCCD" />
          </Form.Item>
          <Form.Item
            label="Gender"
            name="gender"
            rules={[{ required: true, message: 'Please select gender' }]}
          >
            <Select placeholder="Select gender">
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BookingDetail;
