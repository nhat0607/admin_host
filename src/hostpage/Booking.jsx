import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Modal, Form, Input as AntInput, Popconfirm, Popover, Select, Slider, Menu, DatePicker, Dropdown, Tag  } from 'antd';
import { EditOutlined, PlusOutlined, DeleteOutlined, EllipsisOutlined, FilterOutlined, ConsoleSqlOutlined } from '@ant-design/icons';
import { getBookingsByHotelId,  getRoomsByHotelId } from '../api/api';
import DateSelection from "../components/DateSection"; 
import { useNavigate } from 'react-router-dom';
import './Components.css';
import './Booking.css';
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
  const navigate = useNavigate();
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
        if (bookings.length > 0) {
          console.log(bookings.createdAt); // Truy cập khi dữ liệu đã sẵn sàng
      }
        // Kết hợp thông tin chi tiết với bookings
        const bookingsWithDetails = bookings.map((booking) => {
          console.log(booking.createdAt);
          console.log(booking.paymentMethod);
          const userName = booking.user?.name || 'Unknown';
          const roomNumber = booking.room?.roomNumber || 'Unknown';
  
          const formatDate = (date) => {
            const d = new Date(date);
            return d.toLocaleDateString('en-GB');
          };
          const checkInDate = formatDate(booking.checkInDate);
          const checkOutDate = formatDate(booking.checkOutDate);
  
          return {
            ...booking,
            userName,  
            roomNumber,  
            checkInDate,  
            checkOutDate,  
          };
        });
        
        // Sắp xếp theo createAt từ mới nhất đến cũ nhất
        const sortedBookings = bookingsWithDetails.sort((a, b) => {
          const dateA = new Date(a.createdAt); 
          const dateB = new Date(b.createdAt);
          return dateB - dateA; 
        });
  
        setDataSource(sortedBookings);
        console.log(sortedBookings);
        setRooms(rooms);
        setAllRooms(rooms);
      }
    };
  
    fetchBookings();
  }, [user]);


  const showUserDetails = async (booking) => {
    const userDetails = booking.user;  
    setUserDetails(userDetails);
    setUserModalVisible(true);
  };

  const menu = (record) => (
    <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
      <Button
        type="link"
        icon={<EditOutlined />}
        // onClick={() => handleEditBooking(record)}
        style={{ padding: 0, textAlign: 'left' }}
      >
        Edit
      </Button>
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
    const { checkInDate, checkOutDate, status, roomType } = filters;
 
    return (
       (checkInDate ? moment(booking.checkInDate).isSameOrAfter(moment(checkInDate)) : true) &&
       (checkOutDate ? moment(booking.checkOutDate).isSameOrBefore(moment(checkOutDate)) : true) &&
       (status ? booking.status === status : true) 
      //  && (roomType ? booking.roomType === roomType : true)
    );
  });
  
  const filterMenu = (
    <Menu>
      <div className="filter-title">Filter Bookings</div>
  
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
              <Option value="booked">Booked</Option>
              <Option value="completed">Completed</Option>
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
    // { title: 'Booking ID', dataIndex: '_id', key: '_id' },
    {
      title: 'Name',
      dataIndex: 'userName',
      key: 'userName',
      render: (text, record) => (
        <Button type="link" onClick={() => showUserDetails(record)}>
          {text}
        </Button>
      ),
    },
    {
      title: 'Room ID',
      dataIndex: 'roomNumber',
      key: 'roomNumber',
    },
    { title: 'Check-in Date', dataIndex: 'checkInDate', key: 'checkInDate' },
    { title: 'Check-out Date', dataIndex: 'checkOutDate', key: 'checkOutDate' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        // Map trạng thái sang màu sắc
        const statusColors = {
          CANCELLED: 'red',
          BOOKED: 'yellow',
          COMPLETED: 'green',
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
    // {
    //   title: 'Action',
    //   key: 'action',
    //   render: (_, record) => (
    //     <Popover
    //       content={menu(record)}
    //       trigger="click"
    //       visible={popoverVisible[record.id]}
    //       onVisibleChange={(visible) =>
    //         setPopoverVisible((prev) => ({ ...prev, [record._id]: visible }))
    //       }
    //     >
    //       <Button type="text" icon={<EllipsisOutlined rotate={90} />} />
    //     </Popover>
    //   ),
    // },
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
          {/* <Button type="primary" icon={<PlusOutlined />} onClick={handleAddBooking}>
            Add Booking
          </Button> */}
        </Space>
      </div>
      <Table 
        dataSource={dataSource} 
        columns={columns} 
        pagination={{ pageSize: 10 }} 
        onRow={(record) => ({
          onDoubleClick: () => {
            console.log("Double-clicked record:", record._id);
            navigate(`/host/booking-manager/${record._id}`);
          }
        })}
      />

      <Modal
        title={<span className="modal-title">User Details</span>}
        visible={isUserModalVisible}
        onCancel={() => setUserModalVisible(false)}
        footer={null}
        className="custom-modal"
      >
        {userDetails && (
          <>
            <p className="modal-paragraph"><strong>Name:</strong> {userDetails.name}</p>
            <p className="modal-paragraph"><strong>Email:</strong> {userDetails.email}</p>
            <p className="modal-paragraph"><strong>Phone Number:</strong> {userDetails.phonenumber}</p>
            <p className="modal-paragraph"><strong>Country:</strong> {userDetails.country}</p>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Booking;
