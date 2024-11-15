import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Modal, Form, Input as AntInput, Popconfirm, Popover, Select, Slider, Menu, DatePicker, Dropdown } from 'antd';
import { EditOutlined, PlusOutlined, DeleteOutlined, EllipsisOutlined, FilterOutlined } from '@ant-design/icons';
import { getBookingsByHotelId, addBooking, updateBooking, deleteBooking, getUserById, getRoomsByHotelId, updateRoom } from '../api/api';
import DateSelection from "../components/DateSection"; 
import './Components.css';
import moment from 'moment';

const { Option } = Select;

const Booking = ({ user }) => {
  const [dataSource, setDataSource] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [popoverVisible, setPopoverVisible] = useState({});
  const [userDetails, setUserDetails] = useState(null);
  const [isUserModalVisible, setUserModalVisible] = useState(false);
  const [calculatedTotalPrice, setCalculatedTotalPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500);  
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [currentTime, setCurrentTime] = useState(moment('2024-11-28')); 


  const [filters, setFilters] = useState({
    totalPrice: [0, 500],
    checkInDate: null,
    checkOutDate: null,
    status: null,
  });
  const [tempFilters, setTempFilters] = useState({
    totalPrice: [0, 500],
    checkInDate: null,
    checkOutDate: null,
    status: null,
  });
  const [filterVisible, setFilterVisible] = useState(false);

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
        setAllRooms(rooms);
        const maxPriceInData = bookingsWithDetails.reduce((max, booking) => Math.max(max, booking.totalPrice), 0);
        setMaxPrice(maxPriceInData);
                
        setFilters((prevFilters) => ({ ...prevFilters, totalPrice: [0, maxPriceInData] }));
        setTempFilters((prevTempFilters) => ({ ...prevTempFilters, totalPrice: [0, maxPriceInData] })); 
      }
    };

    fetchBookings();
  }, [user]);
  
  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     setCurrentTime(moment()); 
  //   }, 86400000); 
  //   return () => clearInterval(intervalId); 
  // }, []);

  

  // const updateRoomAvailability = async (roomId, num) => {
  //   const updatedRooms = [...rooms]; 
  //   const roomIndex = updatedRooms.findIndex(room => room.id === roomId);
    
  //   if (roomIndex !== -1) {
  //     const room = updatedRooms[roomIndex];
  //     room.available += num; 
  //     console.log("Updated room availability:", room.available);
  
  //     setRooms(updatedRooms);
  
  //     await updateRoom(user, roomId, { available: room.available });
  //   }
  // };
  
  // useEffect(() => {
  //   const checkAndUpdateBookingStatus = async () => {
  //     const updatedData = await Promise.all(
  //       dataSource.map(async (booking) => {
  //         const checkIn = moment(booking.checkInDate);
  //         const checkOut = moment(booking.checkOutDate);
  
  //         let statusChanged = false;
  
  //         if (currentTime.isSameOrAfter(checkIn) && currentTime.isBefore(checkOut)) {
  //           if (booking.status !== 'confirmed') {
  //             booking.status = 'confirmed';
  //             statusChanged = true;
  //           }
  //         } else if (currentTime.isAfter(checkOut) && booking.status === 'confirmed') {
  //           const room = rooms.find(room => room.id === booking.roomId);
  //           if (room) {
  //             await updateRoomAvailability(booking.roomId, 1); 
  //           }
  //           booking.status = 'completed';
  //           statusChanged = true;
  //         }
  
  //         if (statusChanged) {
  //           await updateBooking(user, booking.id, { ...booking, status: booking.status });
  //         }
  
  //         return booking;
  //       })
  //     );
  
  //     if (updatedData.some((booking, index) => booking.status !== dataSource[index]?.status)) {
  //       setDataSource(updatedData);
  //     }
  //   };
  
  //   checkAndUpdateBookingStatus();
  // }, [currentTime, rooms, user]);
  

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
    setCheckInDate(null);
    setCheckOutDate(null);
  };

  const handleEditBooking = (record) => {
    setSelectedBooking(record);
    setModalVisible(true);
    form.setFieldsValue(record);
    setPopoverVisible((prev) => ({ ...prev, [record.id]: false }));

    const initialTotalPrice = calculateTotalPrice(record.roomId, record.checkInDate, record.checkOutDate);
    setCalculatedTotalPrice(initialTotalPrice);
    setCheckInDate(record.checkInDate ? moment(record.checkInDate).toDate() : null);
    setCheckOutDate(record.checkOutDate ? moment(record.checkOutDate).toDate() : null);
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
    if (!selectedBooking) { 
      const roomToUpdate = rooms.find((room) => room.id === values.roomId);
      if (roomToUpdate && roomToUpdate.available > 0) {
        updateRoomAvailability(values.roomId, -1); 
      }
    }

    values.totalPrice = calculatedTotalPrice;
    values.status = selectedBooking ? values.status : 'pending';

    if (selectedBooking) {
      await updateBooking(user, selectedBooking.id, values);
      const updatedData = dataSource.map((item) =>
        item.id === selectedBooking.id ? { ...item, ...values } : item
      );
      setDataSource(updatedData);
    } else {
      const newBooking = await addBooking(user, values);
      setDataSource([newBooking, ...dataSource]); 
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


  const handleResetFilter = () => {
    setTempFilters({
      totalPrice: [0, maxPrice],
      checkInDate: null,
      checkOutDate: null,
      status: null,
    });
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setFilterVisible(false);
  };

  const filteredBookingData = dataSource.filter((booking) => {
    const { totalPrice, checkInDate, checkOutDate, status, roomType } = filters;
 
    return (
       (totalPrice ? booking.totalPrice >= totalPrice[0] && booking.totalPrice <= totalPrice[1] : true) &&
       (checkInDate ? moment(booking.checkInDate).isSameOrAfter(moment(checkInDate)) : true) &&
       (checkOutDate ? moment(booking.checkOutDate).isSameOrBefore(moment(checkOutDate)) : true) &&
       (status ? booking.status === status : true) &&
       (roomType ? booking.roomType === roomType : true)
    );
  });
 

  const filterMenu = (
    <Menu>
      <div className="filter-title">Filter Bookings</div>
  
      <Menu.Item key="roomType">
        <div className="filter-section">
          <div className="filter-label">Room Type</div>
          <Select
            value={tempFilters.roomType}
            onChange={(value) => setTempFilters({ ...tempFilters, roomType: value })}
            placeholder="Select Room Type"
            style={{ width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            {allRooms.map((room) => (
              <Option key={room.id} value={room.type}>
                {room.type}
              </Option>
            ))}
          </Select>
        </div>
      </Menu.Item>
  
      <Menu.Item key="totalPrice">
        <div className="filter-section">
          <div className="filter-label">Total Price Range</div>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <div>{tempFilters.totalPrice[0]}</div>
            <Slider
              range
              value={tempFilters.totalPrice}
              onChange={(value) => setTempFilters({ ...tempFilters, totalPrice: value })}
              min={0}
              max={maxPrice}
              style={{ flex: 1, margin: '0 10px' }}
              onClick={(e) => e.stopPropagation()}
            />
            <div>{tempFilters.totalPrice[1]}</div>
          </div>
        </div>
      </Menu.Item>
  
      <Menu.Item key="checkInDate">
        <div className="filter-section">
          <div className="filter-label">Check-In Date</div>
          <AntInput
            type="date"
            value={tempFilters.checkInDate ? tempFilters.checkInDate.toISOString().split('T')[0] : ''}
            onChange={(e) => setTempFilters({ ...tempFilters, checkInDate: e.target.value ? new Date(e.target.value) : null })}
            style={{ width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </Menu.Item>
  
      <Menu.Item key="checkOutDate">
        <div className="filter-section">
          <div className="filter-label">Check-Out Date</div>
          <AntInput
            type="date"
            value={tempFilters.checkOutDate ? tempFilters.checkOutDate.toISOString().split('T')[0] : ''}
            onChange={(e) => setTempFilters({ ...tempFilters, checkOutDate: e.target.value ? new Date(e.target.value) : null })}
            style={{ width: '100%' }}
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
            <Option value="confirmed">Confirmed</Option>
            <Option value="pending">Pending</Option>
            <Option value="canceled">Canceled</Option>
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
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddBooking}>
            Add Booking
          </Button>
        </Space>
      </div>
      <Table 
        dataSource={filteredBookingData}  
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
                  {room.type}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Check-In Date" name="checkInDate" rules={[{ required: true, message: 'Please select a check-in date' }]}>
            <AntInput
              type="date"
              value={checkInDate ? moment(checkInDate).format('YYYY-MM-DD') : ''}
              onChange={(e) => setCheckInDate(e.target.value ? moment(e.target.value) : null)}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label="Check-Out Date" name="checkOutDate" rules={[{ required: true, message: 'Please select a check-out date' }]}>
            <AntInput
              type="date"
              value={checkOutDate ? moment(checkOutDate).format('YYYY-MM-DD') : ''}
              onChange={(e) => setCheckOutDate(e.target.value ? moment(e.target.value) : null)}
              style={{ width: '100%' }}
            />
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
