import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Modal, Form, Input as AntInput, Select, Popconfirm, Popover, Dropdown, Menu, Slider } from 'antd';
import { EditOutlined, PlusOutlined, DeleteOutlined, EllipsisOutlined, FilterOutlined } from '@ant-design/icons';
import { getRoomsByHotelId, addRoom, updateRoom, deleteRoom } from '../api/api';
import DateSelection from "../components/DateSection"; 
import './Components.css';

const { Option } = Select;

const Room = ({ user }) => {
  const [roomData, setRoomData] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [popoverVisible, setPopoverVisible] = useState({});
  const [filters, setFilters] = useState({
    price: [0, 500],  
    capacity: null,
    status: null,
  });
  const [tempFilters, setTempFilters] = useState({
    price: [0, 500],
    capacity: null,
    status: null,
  });
  const [filterVisible, setFilterVisible] = useState(false);
  const [maxPrice, setMaxPrice] = useState(500); 


  useEffect(() => {
    const fetchRooms = async () => {
      if (user && user.hotelId) {
        const rooms = await getRoomsByHotelId(user);
        setRoomData(rooms);

        const maxPriceInData = rooms.reduce((max, room) => Math.max(max, room.price), 0);
        setMaxPrice(maxPriceInData);
        
        setFilters((prevFilters) => ({ ...prevFilters, price: [0, maxPriceInData] }));
        setTempFilters((prevTempFilters) => ({ ...prevTempFilters, price: [0, maxPriceInData] }));
      }
    };
    fetchRooms();
  }, [user]);

  const handleAddRoom = () => {
    setSelectedRoom(null);
    setModalVisible(true);
    form.resetFields();
  };

  const handleEditRoom = (record) => {
    setSelectedRoom(record);
    setModalVisible(true);
    form.setFieldsValue(record);
    setPopoverVisible((prev) => ({ ...prev, [record.id]: false }));
  };

  const handleDeleteRoom = async (id) => {
    await deleteRoom(user, id);
    const updatedData = roomData.filter((item) => item.id !== id); 
    setRoomData(updatedData);
    setPopoverVisible((prev) => ({ ...prev, [id]: false })); 
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setSelectedRoom(null);
  };

  const handleFormSubmit = async (values) => {
    try {
      if (values.quantity === 0) {
        values.status = 'ROO';
      }
  
      if (selectedRoom) {
        const updatedRoom = await updateRoom(user, selectedRoom.id, values);
        const updatedData = roomData.map((item) =>
          item.id === selectedRoom.id ? { ...item, ...updatedRoom } : item
        );
        setRoomData(updatedData);
      } else {
        const newRoom = await addRoom(user, values);
        setRoomData([...roomData, newRoom]);
      }
      handleModalCancel();
    } catch (error) {
      alert(error.message); 
    }
  };

  const menu = (record) => (
    <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
      <Button
        className="btn_content"
        type="link"
        icon={<EditOutlined />}
        onClick={() => handleEditRoom(record)}
        style={{ padding: 0, textAlign: 'left' }}
      >
        Edit
      </Button>
      <Popconfirm
        title="Are you sure you want to delete this room?"
        onConfirm={() => handleDeleteRoom(record.id)}
        okText="Yes"
        cancelText="No"
      >
        <Button className="btn_content" type="link" icon={<DeleteOutlined />} style={{ color: 'red', padding: 0, textAlign: 'left' }}>
          Delete
        </Button>
      </Popconfirm>
    </div>
  );

  const handleResetFilter = () => {
    setTempFilters({
      price: [0, maxPrice], 
      capacity: null,
      status: null,
    });
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setFilterVisible(false);
  };

  const filteredRoomData = roomData.filter((room) => {
    const { price, capacity, status } = filters;
    return (
      (price ? room.price >= price[0] && room.price <= price[1] : true) &&
      (capacity ? room.capacity === capacity : true) &&
      (status ? room.status === status : true)
    );
  });

  const filterMenu = (
    <Menu>
      <div className="filter-title">Filter Rooms</div>

      <Menu.Item key="price">
        <div className="filter-section">
          <div className="filter-label">Price Range</div>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <div>{tempFilters.price[0]}</div>
            <Slider
              range
              value={tempFilters.price}
              onChange={(value) => setTempFilters({ ...tempFilters, price: value })}
              min={0}
              max={maxPrice}  
              style={{ flex: 1, margin: '0 10px' }}
              onClick={(e) => e.stopPropagation()}
            />
            <div>{tempFilters.price[1]}</div>
          </div>
        </div>
      </Menu.Item>

      <Menu.Item key="capacity">
        <div className="filter-section">
          <div className="filter-label">Capacity</div>
          <Input
            value={tempFilters.capacity}
            onChange={(e) => setTempFilters({ ...tempFilters, capacity: parseInt(e.target.value) || null })}
            placeholder="Enter Capacity"
            style={{ width: '100%' }}
            type="number"
            onClick={(e) => e.stopPropagation()}
          />
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
            <Option value="Allow">Allow</Option>
            <Option value="Hidden">Hidden</Option>
            <Option value="ROO">ROO</Option>
          </Select>
        </div>
      </Menu.Item>

      <Menu.Item key="filter-buttons">
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Button onClick={handleResetFilter} >Reset</Button>
          <Button type="primary" onClick={applyFilters}>Apply Filter</Button>
        </div>
      </Menu.Item>
    </Menu>
  );

  const columns = [
    { title: 'Room ID', dataIndex: 'id', key: 'id' },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Price', dataIndex: 'price', key: 'price' },
    { title: 'Capacity', dataIndex: 'capacity', key: 'capacity' },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Available', dataIndex: 'available', key: 'available' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Popover
          content={menu(record)}
          trigger="click"
          visible={popoverVisible[record.id]}
          onVisibleChange={(visible) => setPopoverVisible((prev) => ({ ...prev, [record.id]: visible }))}
        >
          <Button type="text" icon={<EllipsisOutlined rotate={90} />} />
        </Popover>
      ),
    },
  ];

  return (
    <div className="table-container">
      <div className="table-header">
        <h3>Room List</h3>
        <Space>
          <Input.Search placeholder="Search rooms..." style={{ width: 200 }} />
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
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRoom}>
            Add Room
          </Button>
        </Space>
      </div>
      <Table 
        dataSource={filteredRoomData} 
        columns={columns} 
        pagination={{ pageSize: 10 }} 
      />

      <Modal
        title={selectedRoom ? 'Edit Room' : 'Add Room'}
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
      >
        <Form form={form} onFinish={handleFormSubmit} layout="vertical">
          <Form.Item label="Type" name="type" rules={[{ required: true, message: 'Please enter room type' }]} >
            <AntInput />
          </Form.Item>
          <Form.Item label="Price" name="price" rules={[{ required: true, message: 'Please enter price' }]} >
            <AntInput type="number" />
          </Form.Item>
          <Form.Item label="Capacity" name="capacity" rules={[{ required: true, message: 'Please enter capacity' }]} >
            <AntInput type="number" />
          </Form.Item>
          <Form.Item label="Quantity" name="quantity" rules={[{ required: true, message: 'Please enter quantity' }]} >
            <AntInput type="number" />
          </Form.Item>
          <Form.Item label="Available" name="available">
            <AntInput type="number" disabled /> 
          </Form.Item>
          <Form.Item label="Status" name="status" rules={[{ required: true, message: 'Please select room status' }]}>
            <Select>
              <Option value="Allow">Allow</Option> 
              <Option value="Hidden">Hidden</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {selectedRoom ? 'Save Changes' : 'Add Room'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Room;
