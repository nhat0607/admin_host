import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Input, Space, Modal, Form, Input as AntInput, Popconfirm, Popover, Select, Menu, Dropdown } from 'antd';
import { EditOutlined, PlusOutlined, DeleteOutlined, EllipsisOutlined, FilterOutlined } from '@ant-design/icons';
import { getCustomers, addCustomer, updateCustomer, getTransaction } from '../api/api'; 
import '../hostpage/Components.css';
import './styles/Pending.css'

const { Option } = Select;

const TransactionHistory = ({ user }) => {
  const [dataSource, setDataSource] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    role: null,
  });

  const [tempFilters, setTempFilters] = useState({
    role: null,
  });
  const [filterVisible, setFilterVisible] = useState(false);

  // Fetch customer data
  const fetchTransactions = async () => {
    const transaction = await getTransaction();
    const transactionHistory = transaction.data?.formattedTransactions || [];
    console.log(transactionHistory);
    setDataSource(transactionHistory);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

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


  const columns = [
    { title: 'Id', dataIndex: 'transactionId', key: 'transactionId' },
    { title: 'User Name', dataIndex: 'customerName', key: 'customerName' },
    { title: 'Hotel', key: 'hotel', render: (record) => record.roomId?.hotel?.name || 'N/A' },
    { title: 'Dates', key: 'dates',         
      render: (record) => {
        const checkInDate = new Date(record.checkInDate).toLocaleDateString('en-GB'); 
        const checkOutDate = new Date(record.checkOutDate).toLocaleDateString('en-GB');
        return `${checkInDate} - ${checkOutDate}`;
      },
    },
    { title: 'Amount', dataIndex: 'amount', key: 'amount' }
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
        <h3>Transaction History</h3>
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
        </Space>
      </div>
      <Table 
        dataSource={filteredData} 
        columns={columns} 
        pagination={{ pageSize: 10 }}         
        onRow={(record) => ({
          onDoubleClick: () => {
            console.log("Double-clicked record:", record.transactionId); // This will log the clicked record data
            navigate(`/admin/transaction-detail/${record.transactionId}`);
          }
        })}        
      />
    </div>
  );
};

export default TransactionHistory;