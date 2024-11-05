import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Modal, Form, Input as AntInput, Popconfirm, Popover, Select } from 'antd';
import { EditOutlined, PlusOutlined, DeleteOutlined, EllipsisOutlined } from '@ant-design/icons';
import { getCustomers, addCustomer, updateCustomer, deleteCustomer } from '../api/api'; 
import '../hostpage/Components.css';

const { Option } = Select;

const Customers = ({ user }) => {
  const [dataSource, setDataSource] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [popoverVisible, setPopoverVisible] = useState({});

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

  const handleDeleteCustomer = async (id) => {
    if (user.role === 'admin') {
      await deleteCustomer(user, id); 
      const updatedData = dataSource.filter((item) => item.id !== id);
      setDataSource(updatedData);
      setPopoverVisible((prev) => ({ ...prev, [id]: false })); 
    } else {
      alert("You do not have permission to delete customers.");
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setSelectedCustomer(null);
  };

  const handleFormSubmit = async (values) => {
    const role = values.role === "customer" ? "user" : values.role; 
  
    const customerData = {
      ...values,
      role: role, 
    };
  
    if (selectedCustomer) {
      const updatedCustomer = await updateCustomer(selectedCustomer.id, customerData);
      const updatedData = dataSource.map((item) =>
        item.id === updatedCustomer.id ? updatedCustomer : item
      );
      setDataSource(updatedData);
    } else {
      const newCustomer = await addCustomer(user, customerData); // Include user to maintain permission checks
      setDataSource([...dataSource, newCustomer]);
    }
    handleModalCancel();
  };

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
        title="Are you sure you want to delete this customer?"
        onConfirm={() => handleDeleteCustomer(record.id)} // Changed from userId to id
        okText="Yes"
        cancelText="No"
      >
        <Button 
          type="link" 
          icon={<DeleteOutlined />} 
          style={{ color: 'red', padding: 0, textAlign: 'left' }} 
          disabled={user.role !== 'admin'}
        >
          Delete
        </Button>
      </Popconfirm>
    </div>
  );

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' }, // Changed from userId to id
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (role === 'user' ? 'User' : role === 'host' ? 'Host' : 'Unknown'),
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

  return (
    <div className="table-container">
      <div className="table-header">
        <h3>Customer List</h3>
        <Space>
          <Input.Search placeholder="Search customers..." style={{ width: 200 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCustomer}>
            Add Customer
          </Button>
        </Space>
      </div>
      <Table dataSource={dataSource} columns={columns} pagination={{ pageSize: 10 }} 
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
