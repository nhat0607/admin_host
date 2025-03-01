import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Typography, Divider, Table, Input, Card, Rate } from 'antd';
import { getCustomers, getBookingsByUser, getHotelByHost, getCustomerTransactions } from '../api/api';

const { Title } = Typography;

const UserDetail = () => {
  const { userid } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [hotel, setHotel] = useState(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const customers = await getCustomers();
        const customerData = customers.find((customer) => String(customer._id) === String(userid));
        setCustomer(customerData);

        if (customerData.role === 'customer') {
          const userBookings = await getBookingsByUser(customerData._id);
          const sortedBookings = userBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setBookings(sortedBookings);
        } else {
          const userHotel = await getHotelByHost(customerData._id);
          setHotel(userHotel[0]);
        }
      } catch (error) {
        console.error('Error fetching customer or bookings:', error);
      }
    };
    fetchCustomer();
  }, [userid]);

  if (!customer) return <div>Loading...</div>;

  const columns = [
    {
      title: 'Hotel Name',
      dataIndex: ['room', 'hotel', 'name'],
      key: 'hotelName',
    },
    {
      title: 'Room Number',
      dataIndex: ['room', 'roomNumber'],
      key: 'roomNumber',
    },
    {
      title: 'Check-In Date',
      dataIndex: 'checkInDate',
      key: 'checkInDate',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Check-Out Date',
      dataIndex: 'checkOutDate',
      key: 'checkOutDate',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusColors = {
          CANCELLED: 'red',
          BOOKED: 'yellow',
          COMPLETED: 'green',
        };
        const upperCaseStatus = status?.toUpperCase();
        const color = statusColors[upperCaseStatus] || 'black';
        return <span style={{ color, fontWeight: '600' }}>{upperCaseStatus}</span>;
      },
    },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1, padding: '24px' }}>
        <Card style={{ padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Button type="link" onClick={() => navigate('/admin/customer-manager')}>
            ← Back to Customer Manager
          </Button>

          <Divider />

          <Title level={4}>User Detail</Title>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', paddingInlineStart: '20px' }}>
            <div className="form-field">
              <span className="form-label">ID:</span>
              <Input className="form-value" value={customer._id} readOnly />
            </div>
            <div className="form-field">
              <span className="form-label">Name:</span>
              <Input className="form-value" value={customer.name} readOnly />
            </div>
            <div className="form-field">
              <span className="form-label">Email:</span>
              <Input className="form-value" value={customer.email} readOnly />
            </div>
            <div className="form-field">
              <span className="form-label">Email Status:</span>
              <br /> {/* Thêm dòng trống sau nhãn */}
              <span
                style={{
                  color: customer.statusemail === 'verify' ? 'green' : 'red',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  paddingLeft: 7,
                }}
              >
                {customer.statusemail}
              </span>
            </div>
            <div className="form-field">
              <span className="form-label">Phone Number:</span>
              <Input className="form-value" value={customer.phonenumber} readOnly />
            </div>
            <div className="form-field">
              <span className="form-label">Country:</span>
              <Input className="form-value" value={customer.country} readOnly />
            </div>
          </div>

          <Divider />

          <Title level={4}>{customer.role === 'customer' ? 'Booking History' : 'Hotel Information'}</Title>

          {customer.role === 'customer' ? (
            bookings.length > 0 ? (
              <Table
                className="booking-table"
                columns={columns}
                dataSource={bookings}
                pagination={false}
                bordered
                scroll={{ y: 180 }}
                rowKey="_id"
                style={{ width: '100%' }}
              />
            ) : (
              <div style={{ textAlign: 'center', marginTop: '20px', fontWeight: '500' }}>
                No booking history available
              </div>
            )
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '0 20px' }}>
              <div className="form-field">
                <span className="form-label">Hotel ID:</span>
                <Input className="form-value" value={hotel?.hotelId || 'N/A'} readOnly />
              </div>
              <div className="form-field">
                <span className="form-label">Hotel Name:</span>
                <Input className="form-value" value={hotel?.name || 'N/A'} readOnly />
              </div>
              <div className="form-field">
                <span className="form-label">Location:</span>
                <Input
                  className="form-value"
                  value={`${hotel?.location?.city || ''}, ${hotel?.location?.country || ''}` || 'N/A'}
                  readOnly
                />
              </div>
              <div className="form-field">
                <span className="form-label">Amenities:</span>
                <Input className="form-value" value={hotel?.amenities?.join(', ') || 'N/A'} readOnly />
              </div>
              <div className="form-field">
                <span className="form-label">Rating:</span>
                <Rate disabled value={hotel?.rating || 0} />
              </div>
            </div>
          )}        
          </Card>
      </div>
    </div>
  );
};

export default UserDetail;
