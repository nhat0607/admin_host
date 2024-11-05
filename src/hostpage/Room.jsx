import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Modal, Form, Input as AntInput, Select, Popconfirm, Popover } from 'antd';
import { EditOutlined, PlusOutlined, DeleteOutlined, EllipsisOutlined } from '@ant-design/icons';
import { getRoomsByHotelId, addRoom, updateRoom, deleteRoom } from '../api/api'; 
import './Components.css';

const { Option } = Select;

const Room = ({ user }) => {
  const [roomData, setRoomData] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [popoverVisible, setPopoverVisible] = useState({});

  useEffect(() => {
    const fetchRooms = async () => {
      if (user && user.hotelId) {
        const rooms = await getRoomsByHotelId(user);
        setRoomData(rooms);
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
        <Button type="link" icon={<DeleteOutlined />} style={{ color: 'red', padding: 0, textAlign: 'left' }}>
          Delete
        </Button>
      </Popconfirm>
    </div>
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

  const filteredRoomData = roomData.filter(room => 
    room.quantity > 0 || (room.available === 0 && room.status === 'ROO')
  );

  return (
    <div className="table-container">
      <div className="table-header">
        <h3>Room List</h3>
        <Space>
          <Input.Search placeholder="Search rooms..." style={{ width: 200 }} />
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
          <Form.Item label="Type" name="type" rules={[{ required: true, message: 'Please enter room type' }]}>
            <AntInput />
          </Form.Item>
          <Form.Item label="Price" name="price" rules={[{ required: true, message: 'Please enter price' }]}>
            <AntInput type="number" />
          </Form.Item>
          <Form.Item label="Capacity" name="capacity" rules={[{ required: true, message: 'Please enter capacity' }]}>
            <AntInput type="number" />
          </Form.Item>
          <Form.Item label="Quantity" name="quantity" rules={[{ required: true, message: 'Please enter quantity' }]}>
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
