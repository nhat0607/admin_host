import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Typography, Divider, Table, Input, Card } from 'antd';
import { getCustomers } from '../api/api'; // Assuming getCustomers fetches all customer data

const { Title } = Typography;

const UserDetail = () => {
  const { userid } = useParams(); // Get the user ID from route parameters
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const customers = await getCustomers(); // Fetch all customers
        const customerData = customers.find((customer) => String(customer.id) === String(userid)); 
        setCustomer(customerData);
      } catch (error) {
        console.error("Error fetching customer:", error); 
      }
    };

    fetchCustomer();
  }, [userid]);

  if (!customer) return <div>Loading...</div>; // Add a loading state

  // Table columns for booking IDs
  const columns = [
    {
      title: 'Booking ID',
      dataIndex: 'bookingId',
      key: 'bookingId',
    },
  ];

  const bookingData = customer.bookingIds
    ? customer.bookingIds.map((id) => ({ key: id, bookingId: id }))
    : [];

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1, padding: '24px' }}>
        <Card style={{ padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Button type="link" onClick={() => navigate('/admin/customer-manager')}>
            ← Back to Customer Manager
          </Button>

          <Divider />

          {/* User Detail Section */}
          <Title level={4}>User Detail</Title>

          {/* CSS Grid Layout for User Detail */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-field">
              <span className="form-label">ID:</span>
              <Input className="form-value" value={customer.id} readOnly />
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
              <span className="form-label">Password:</span>
              <Input className="form-value" value={customer.password} readOnly />
            </div>
          </div>

          <Divider />

          {/* Conditional Section */}
          <Title level={4}>
            {customer.role === 'user' ? 'Booking History' : 'Hotel Information'}
          </Title>

          {customer.role === 'user' ? (
            <Table
              className="booking-table"
              columns={columns}
              dataSource={bookingData}
              pagination={false}
              bordered
              scroll={{ y: 180 }} // Set a fixed height for vertical scrolling
            />
          ) : (
            <div className="form-field">
              <span className="form-label">Hotel ID:</span>
              <Input className="form-value" value={customer.hotelId || 'N/A'} readOnly />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default UserDetail;
