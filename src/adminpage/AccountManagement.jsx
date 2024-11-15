import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Input, Space, Modal, Form, Input as AntInput, Popconfirm, Popover, Select, Menu, Dropdown } from 'antd';
import { EditOutlined, PlusOutlined, DeleteOutlined, EllipsisOutlined, FilterOutlined } from '@ant-design/icons';
import { getCustomers, addCustomer, updateCustomer } from '../api/api'; 
import '../hostpage/Components.css';

const { Option } = Select;

const Customers = ({ user }) => {
  const [dataSource, setDataSource] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [popoverVisible, setPopoverVisible] = useState({});
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    role: null,
    status: null,
  });
  
  const [tempFilters, setTempFilters] = useState({
    role: null,
    status: null,
  });
  const [filterVisible, setFilterVisible] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      const customers = await getCustomers();
      setDataSource(customers.filter((customer) => customer.role !== 'admin'));
    };
    fetchCustomers();
  }, []);

  const handleAddCustomer = () => {
    if (user.role === 'admin') {
      setSelectedCustomer(null);
      setModalVisible(true);
      form.resetFields();
    } else {
      alert("You do not have permission to add customers.");
    }
  };

  const handleEditCustomer = (record) => {
    if (user.role === 'admin') {
      setSelectedCustomer(record);
      setModalVisible(true);
      form.setFieldsValue(record);
      setPopoverVisible((prev) => ({ ...prev, [record.id]: false }));
    } else {
      alert("You do not have permission to edit customers.");
    }
  };

  const handleToggleStatus = async (record) => {
    if (user.role === 'admin') {
      const updatedStatus = record.status === 'Active' ? 'Ban' : 'Active';
      console.log(record.id);
      const updatedCustomer = await updateCustomer(user, record.id, { ...record, status: updatedStatus });
      const updatedData = dataSource.map((item) =>
        item.id === updatedCustomer.id ? updatedCustomer : item
      );
      setDataSource(updatedData);
      setPopoverVisible((prev) => ({ ...prev, [record.id]: false })); 
    } else {
      alert("You do not have permission to change customer status.");
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setSelectedCustomer(null);
  };

  const handleFormSubmit = async (values) => {
    const role = values.role === "customer" ? "user" : values.role;
    const status = values.status || 'Active';

    const customerData = {
      ...values,
      role: role,
      status: status,
    };

    if (selectedCustomer) {
      const updatedCustomer = await updateCustomer(user, selectedCustomer.id, customerData);
      const updatedData = dataSource.map((item) =>
        item.id === updatedCustomer.id ? updatedCustomer : item
      );
      setDataSource(updatedData);
    } else {
      const newCustomer = await addCustomer(user, customerData);
      setDataSource([...dataSource, newCustomer]);
    }
    handleModalCancel();
  };

  const handleResetFilter = () => {
    setTempFilters({
      role: null,
      status: null,
    });
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setFilterVisible(false);
  };

  const filteredData = dataSource.filter((item) => {
    const { role, status } = filters;
    return (
      (role ? item.role === role : true) &&
      (status ? item.status === status : true)
    );
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
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (role === 'user' ? 'User' : role === 'host' ? 'Host' : 'Unknown'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (status === 'Active' ? 'Active' : 'Banned'),
    },
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
            <Option value="user">User</Option>
            <Option value="host">Host</Option>
          </Select>
        </div>
      </Menu.Item>
  
      <Menu.Item key="status">
        <div className="filter-section">
          <div className="filter-label">Status</div>
          <Select
            value={tempFilters.status}
            onChange={(value) => setTempFilters({ ...tempFilters, status: value })}
            placeholder="Select Status"
            style={{ width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <Option value="Active">Active</Option>
            <Option value="Ban">Ban</Option>
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
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCustomer}>
            Add Customer
          </Button>
        </Space>
      </div>
      <Table 
        dataSource={filteredData} 
        columns={columns} 
        pagination={{ pageSize: 10 }}         
        onRow={(record) => ({
          onDoubleClick: () => navigate(`/admin/customer-manager/${record.id}`)
        })}        
      />

      <Modal
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
              <Option value="customer">User</Option>
              <Option value="host">Host</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Status" name="status" initialValue="Active">
            <Select>
              <Option value="Active">Active</Option>
              <Option value="Ban">Ban</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {selectedCustomer ? 'Save Changes' : 'Add Customer'}
            </Button>
          </Form.Item>
        </Form> 
      </Modal>
    </div>
  );
};

export default Customers;
