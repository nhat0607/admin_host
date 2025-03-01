import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Input, Space, Modal, Form, Input as AntInput, Popconfirm, Popover, Select, Menu, Dropdown } from 'antd';
import { EditOutlined, PlusOutlined, DeleteOutlined, EllipsisOutlined, FilterOutlined } from '@ant-design/icons';
import { getCustomers, addCustomer, updateCustomer } from '../api/api'; 
import '../hostpage/Components.css';
import './styles/Pending.css'

const { Option } = Select;

const PendingAccounts = ({ user }) => {
  const [dataSource, setDataSource] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [popoverVisible, setPopoverVisible] = useState({});
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    role: null,
  });

  const [tempFilters, setTempFilters] = useState({
    role: null,
  });
  const [filterVisible, setFilterVisible] = useState(false);

  // Fetch customer data
  const fetchCustomers = async () => {
    const customers = await getCustomers();
    // console.log(user.token);
    console.log(customers);
    setDataSource(customers.filter((customer) => customer.role === 'hotelOwner' && customer.statusaccount === 'pending'));
  };

  // Call fetchCustomers when component mounts
  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAcceptCustomer = async (record) => {
    try {
      // Logic to accept the customer's account
      console.log(`Accepting customer with id: ${record._id}`);
      await updateCustomer(user, record._id, { statusaccount: 'active' });
      await fetchCustomers();
    } catch (error) {
      console.error('Error accepting customer:', error);
    }
  };

  const handleDeclineCustomer = async (record) => {
    try {
      // Logic to decline the customer's account
      console.log(`Declining customer with id: ${record._id}`);
      await updateCustomer(user, record._id, { statusaccount: 'declined' });
      await fetchCustomers();
    } catch (error) {
      console.error('Error declining customer:', error);
    }
  };


  const handleModalCancel = () => {
    setModalVisible(false);
    setSelectedCustomer(null);
  };

// const handleFormSubmit = async (values) => {
//   const role = values.role;
//   const status = values.status || 'Active';

//   const customerData = {
//     ...values,
//     role,
//     status,
//   };

//   try {
//     if (selectedCustomer) {
//       const updatedCustomer = await updateCustomer(user, selectedCustomer._id, customerData);
//       await fetchCustomers();
//     } else {
//       const newCustomer = await addCustomer(user, customerData);
//       await fetchCustomers();
//     }
//   } catch (error) {
//     console.error('Error saving customer data:', error);
//   }
  
//   handleModalCancel(); // Đóng modal
// };

  const handleResetFilter = () => {
    setTempFilters({
      role: null,
    });
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setFilterVisible(false);
  };

  const filteredData = dataSource.filter((item) => {
    const { role } = filters;
    return role ? item.role === role : true;
  });

  const menu = (record) => (
    <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
      <Button
        type="link"
        icon={<EditOutlined />}
        onClick={() => handleEditCustomer(record)}
        style={{ padding: 0, textAlign: 'left' }}
        disabled={user.role !== 'admin'}
      >
        Edit
      </Button>
      <Popconfirm
        title={`Are you sure you want to ${record.status === 'Active' ? 'Ban' : 'Unban'} this customer?`}
        onConfirm={() => handleToggleStatus(record)}
        okText="Yes"
        cancelText="No"
      >
        <Button 
          type="link" 
          icon={<DeleteOutlined />} 
          style={{ color: record.status === 'Active' ? 'red' : 'green', padding: 0, textAlign: 'left' }} 
          disabled={user.role !== 'admin'}
        >
          {record.status === 'Active' ? 'Ban' : 'Unban'}
        </Button>
      </Popconfirm>
    </div>
  );

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        if (role === 'customer') return 'Customer';
        if (role === 'hotelOwner') return 'Hotel Owner';
        if (role === 'admin') return 'Admin';
        return 'Unknown';
      },
    },
    {
      title: 'Status',
      dataIndex: 'statusaccount',
      key: 'statusaccount',
      render: (status) => {
        // Map trạng thái sang màu sắc
        const statusColors = {
          ACTIVE: 'green',
          PENDING: 'orange',
          BAN: 'red',
        };
    
        // Định dạng trạng thái: in hoa và thêm màu
        const upperCaseStatus = status?.toUpperCase();
        const color = statusColors[upperCaseStatus] || 'black';
    
        return (
          <span style={{ color, fontWeight: '600' }}>
            {upperCaseStatus}
          </span>
        );
      },
    },
    {
        title: 'Action',
        key: 'action',
        render: (_, record) => (
          <Space>
            <Button type="primary" className='btn-accept' onClick={() => handleAcceptCustomer(record)}>
              Accept
            </Button>
            <Button type="danger" className='btn-decline' onClick={() => handleDeclineCustomer(record)}>
              Decline
            </Button>
          </Space>
        ),
    },
  ];

  const filterMenu = (
    <Menu>
      <div className="filter-title">Filter Customers</div>
  
      <Menu.Item key="role">
        <div className="filter-section">
          <div className="filter-label">Role</div>
          <Select
            value={tempFilters.role}
            onChange={(value) => setTempFilters({ ...tempFilters, role: value })}
            placeholder="Select Role"
            style={{ width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <Option value="customer">Customer</Option>
            <Option value="hotelOwner">Hotel Owner</Option>
          </Select>
        </div>
      </Menu.Item>
  
      <Menu.Item key="filter-buttons">
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Button onClick={handleResetFilter}>Reset</Button>
          <Button type="primary" onClick={applyFilters}>Apply Filter</Button>
        </div>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="table-container">
      <div className="table-header">
        <h3>Customer List</h3>
        <Space>
          <Input.Search placeholder="Search customers..." style={{ width: 200 }} />
          <Dropdown   
            overlay={filterMenu}
            visible={filterVisible}
            onVisibleChange={(visible) => setFilterVisible(visible)}
            trigger={['click']}
            overlayStyle={{ zIndex: 1050 }}
            dropdownRender={(menu) => (
              <div onMouseDown={(e) => e.stopPropagation()}>{menu}</div>
            )}
          >
            <Button type="primary" icon={<FilterOutlined />}>
              Filter
            </Button>
          </Dropdown>
          {/* <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCustomer}>
            Add Customer
          </Button> */}
        </Space>
      </div>
      <Table 
        dataSource={filteredData} 
        columns={columns} 
        pagination={{ pageSize: 10 }}         
        onRow={(record) => ({
          onDoubleClick: () => {
            console.log("Double-clicked record:", record._id); // This will log the clicked record data
            navigate(`/admin/customer-manager/${record._id}`);
          }
        })}        
      />


      {/* <Modal
        title={selectedCustomer ? 'Edit Customer' : 'Add Customer'}
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
      >
        <Form form={form} onFinish={handleFormSubmit} layout="vertical">
          <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please enter customer name' }]}>
            <AntInput />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ type: 'email', message: 'Please enter a valid email address' }]}>
            <AntInput type="email" />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please enter password' }]}>
            <AntInput.Password />
          </Form.Item>
          <Form.Item label="Role" name="role" rules={[{ required: true, message: 'Please select a role' }]}>
            <Select>
              <Option value="customer">Customer</Option>
              <Option value="hotelOwner">Hotel Owner</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {selectedCustomer ? 'Save Changes' : 'Add Customer'}
            </Button>
          </Form.Item>
        </Form> 
      </Modal> */}
    </div>
  );
};

export default PendingAccounts;