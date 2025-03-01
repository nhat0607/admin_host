import React, { useState, useEffect } from 'react';
import { Table, message, Button, Input, Space, Modal, Form, Input as AntInput, Select, Popconfirm, Popover, Dropdown, Menu, Slider, DatePicker, Calendar, Badge, Upload, Carousel  } from 'antd';
import { EditOutlined, PlusOutlined, DeleteOutlined, EllipsisOutlined, FilterOutlined, CalendarOutlined, UploadOutlined } from '@ant-design/icons';
import { getRoomsByHotelId, addRoom, updateRoom, deleteMedia, addMedia, updateBookDates, updateRoomAvailableDate } from '../api/api';
import DateSelection from "../components/DateSection"; 
import './Components.css';
import './Image.css';
import { useNavigate } from 'react-router-dom';


const { Option } = Select;

const Room = ({ user }) => {
  const [roomData, setRoomData] = useState([]);
  const [amenitiesList, setAmenities] = useState([]); // State để lưu danh sách amenities
  const [isModalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [popoverVisible, setPopoverVisible] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [isMediaModalVisible, setIsMediaModalVisible] = useState(false);
  const [currentMedia, setCurrentMedia] = useState([]);
  const navigate = useNavigate();
  const currentDate = new Date();
  // const [amenitiesList, setamenitiesList] = usestate([]);

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

  const fetchRooms = async () => {
    if (!user) {
      message.error('User information is missing.');
      return;
    }

    try {
      const rooms = await getRoomsByHotelId(user.hotelId);
      if (rooms && rooms.length) {
        const sortedRooms = rooms.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRoomData(sortedRooms);

        // Update price filters dynamically
        const maxPriceInData = sortedRooms.reduce((max, room) => Math.max(max, room.price), 0);
        setMaxPrice(maxPriceInData);
        setFilters(prev => ({ ...prev, price: [0, maxPriceInData] }));
      } else {
        message.info('No rooms found.');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      message.error('Failed to fetch rooms. Please try again later.');
    }
  };


  const fetchAmenities = async () => {
    try {
      const response = await fetch('/amenities.json'); // Ensure this path is correct
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setAmenities(data.amenities || []);
      } else {
        console.error('Failed to fetch amenities:', response.statusText);
        message.error('Failed to fetch amenities.');
      }
    } catch (error) {
      console.error('Error fetching amenities:', error);
      message.error('An error occurred while fetching amenities.');
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchAmenities();
  }, []);

  const handleAddRoom = () => {
    setIsEditMode(false); // Đặt chế độ Add
    setSelectedRoom(null);
    setModalVisible(true);
    form.resetFields();
  };

  const handleEditRoom = (record) => {
    setIsEditMode(true); // Đặt chế độ Edit
    setSelectedRoom(record);
    setModalVisible(true);
  
    // Bỏ qua `availableDates` trong chế độ Edit
    const { availableDates, ...formValues } = record;
    form.setFieldsValue(formValues);
  };
  

  // const handleDeleteRoom = async (id) => {
  //   await deleteRoom(user, id);
  //   const updatedData = roomData.filter((item) => item.id !== id); 
  //   setRoomData(updatedData);
  //   setPopoverVisible((prev) => ({ ...prev, [id]: false })); 
  // };

  const handleModalCancel = () => {
    setModalVisible(false);
    setSelectedRoom(null);
    fetchRooms();
  };

  const handleFormSubmit = async (values) => {
    try {
      const { files, startDate, endDate, amenities, ...rest } = values;
  
      // Format values for submission
      const formattedValues = {
        ...rest,
        startDate: startDate?.format('YYYY-MM-DD'),
        endDate: endDate?.format('YYYY-MM-DD'),
        files: files?.length > 0 ? files.map((file) => file.originFileObj) : [],
        amenities, // Directly use the selected amenities (array of strings)
      };
  
      console.log('Submitting:', formattedValues);
  
      if (selectedRoom) {
        // Edit room
        const editValues = {
          ...formattedValues,
          availableDates: selectedRoom.availableDates, // Keep existing dates
        };
        const updatedRoom = await updateRoom(user, selectedRoom._id, editValues);
        message.success(updatedRoom.message);
        // Update roomData state with the edited room
        setRoomData((prevData) =>
          prevData.map((room) =>
            room._id === selectedRoom._id ? { ...room, ...editValues } : room
          )
        );
      } else {
        // Add new room
        const newRoom = await addRoom(user, formattedValues);
        message.success(newRoom.message);
        setRoomData((prevData) => [...prevData, newRoom]);
      }
  
      handleModalCancel();
    } catch (error) {
      console.error('Error during form submission:', error);
      message.error(error.message || 'Failed to submit the form.');
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
      {/* <Popconfirm
        title="Are you sure you want to delete this room?"
        onConfirm={() => handleDeleteRoom(record.id)}
        okText="Yes"
        cancelText="No"
      >
        <Button className="btn_content" type="link" icon={<DeleteOutlined />} style={{ color: 'red', padding: 0, textAlign: 'left' }}>
          Delete
        </Button>
      </Popconfirm> */}
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


  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [bookDate, setBookDates] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [startDateSelect, setStartDateSelect] = useState(null);
  const [endDateSelect, setEndDateSelect] = useState(null);
  // const [calendarValue, setCalendarValue] = useState(moment()); // Initial calendar date


  const onDateSelect = (date) => {
    if (!startDateSelect || (startDateSelect && endDateSelect)) {
      // setCalendarValue(date);
      setStartDateSelect(date);
      setEndDateSelect(null);
    } else {
      if (date.isAfter(startDateSelect)) {
        setEndDateSelect(date);
      } else {
        setStartDateSelect(date);
      }
    }
  };

  // const dateCellRender = (date) => {
  //   if (date <= endDateSelect && date >= startDateSelect)) {
  //     return <div style={{ backgroundColor: '#bae7ff', borderRadius: '50%', padding: '4px' }}></div>;
  //   }
  //   if (date.isSame(startDateSelect, 'day') || date.isSame(endDate, 'day')) {
  //     return <div style={{ backgroundColor: '#1890ff', borderRadius: '50%', color: 'white', padding: '4px' }}>{date.date()}</div>;
  //   }
  //   return date.date();
  // };

  const handleCalendarOpen = (record, availableDates, bookDates) => {
    setSelectedRoom(record);
    setSelectedDates(
      availableDates.map(({ startDate, endDate }) => {
        const adjustedEndDate = new Date(endDate); // Convert endDate to Date object
        adjustedEndDate.setDate(adjustedEndDate.getDate() + 1); // Increase endDate by 1 day
        return {
          startDate: new Date(startDate), // Keep startDate as-is
          endDate: adjustedEndDate, // Use the adjusted endDate
        };
      })
    );
    setBookDates(
      bookDates.map(({ startDate, endDate }) => {
        const formattedStartDate = new Date(startDate).toISOString().split("T")[0]; 
        const tempEndDate = new Date(endDate); 
        tempEndDate.setDate(tempEndDate.getDate() - 1); 
        const formattedEndDate = tempEndDate.toISOString().split("T")[0]; 
    
        return {
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        };
      })
    );
    setIsCalendarVisible(true);
  };

  const handleCalendarClose = () => {
    setIsCalendarVisible(false);
    setSelectedDates([]);
    setBookDates([]);
    setSelectedRoom(null);
    setStartDateSelect(null);
    setEndDateSelect(null);
  };
 
  const expiredDates = selectedDates.map(({ startDate, endDate }) => {
    if (endDate < currentDate) {
      return { startDate, endDate };
    } else if (startDate <= currentDate && currentDate <= endDate) {
      const adjustedEndDate = new Date(currentDate);
      adjustedEndDate.setDate(adjustedEndDate.getDate() ); 
      return { startDate, endDate: adjustedEndDate };
    } else {
      return { };
    }
  });
  // console.log(currentDate);
  // console.log(expiredDates);
  console.log(bookDate);
  const dateCellRender = (date) => {
    const isAvailable = selectedDates.some(({ startDate, endDate }) => {
      return date >= startDate && date <= endDate;
    });
  
    const isBooked = bookDate.some(({ startDate, endDate }) => {
      const dates = new Date(date.$d).toISOString().split("T")[0];
      return dates >= startDate && dates <= endDate;
    });
  
    const isExpired = expiredDates.some(({ startDate, endDate }) => {
      return date >= startDate && date <= endDate;
    });
  
    const isInRange = date >= startDateSelect && date <= endDateSelect; // Kiểm tra nằm trong range được chọn
    const isStartOrEnd =
      date.isSame(startDateSelect, "day") || date.isSame(endDateSelect, "day"); // Kiểm tra ngày bắt đầu/kết thúc
  
    let className = "calendar-cell";
  
    if (isBooked) {
      className += " booked";
    } else if (isExpired) {
      className += " expired";
    } else if (isAvailable) {
      className += " available";
    }
  
    if (isInRange) {
      className += " in-range";
    }
  
    if (isStartOrEnd) {
      className += " start-or-end";
    }
  
    return <div className={className}>{date.date()}</div>;
  };

  const handleMediaClick = (record, media) => {
    setCurrentMedia(media);
    setSelectedRoom(record);
    setIsMediaModalVisible(true);
  };

//   useEffect(() => {
//     console.log('Current Media:', currentMedia);
// }, [currentMedia]);

// useEffect(() => {
//     console.log('Selected Room:', selectedRoom);
// }, [selectedRoom]);
  
  const handleMediaModalClose = () => {
    setIsMediaModalVisible(false);
    setSelectedRoom(null);
    setCurrentMedia([]);
    fetchRooms();
  };

  const handleDeleteMediaConfirm = (mediaUrl) => {
    Modal.confirm({
      title: 'Delete Picture',
      content: 'Are you sure that you want to delete this picture?',
      okText: 'OK',
      cancelText: 'NO',
      onOk: () => handleDeleteMedia(mediaUrl),
    });
  };
  
  const handleDeleteMedia = async (mediaUrl) => {
    try {
      // Lấy tên file từ mediaUrl
      const fileName = mediaUrl.split('/').pop(); // Hoặc sử dụng cách khác nếu cần
  
      console.log('File name to delete:', fileName);
      console.log('Selected Room ID:', selectedRoom._id);
  
      // Gọi API để xóa ảnh chỉ truyền tên file
      const test = await deleteMedia(selectedRoom._id, fileName);
      message.success(test.message);
      // Cập nhật state để loại bỏ ảnh đã xóa
      setCurrentMedia((prev) => prev.filter((item) => item !== mediaUrl));
    } catch (error) {
      console.error('Error deleting media:', error.message);
      message.error(error.message);
    }
  };

  const handleUploadMedia = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
        const response = await addMedia(selectedRoom._id, [file]); 
        const updatedMedia = response.data.media; 
        setCurrentMedia(updatedMedia); 
        message.success(response.data.message);
    } catch (error) {
        console.error('Error uploading file:', error);
        message.error(error.message);
    } finally {
        event.target.value = ''; 
    }
  };


  const handleAddBooking = async () => {
    if (!startDateSelect || !endDateSelect) {
      message.error('Please select both a start and an end date.');
      return;
    }
  
    if (!selectedRoom) {
      message.error('No room selected!');
      return;
    }
  
    const roomId = selectedRoom._id;
    const checkInDate = startDateSelect.format('YYYY-MM-DD');
    const checkOutDate = endDateSelect.format('YYYY-MM-DD');
  
    const result = await updateBookDates(roomId, checkInDate, checkOutDate);
  
    if (result.success) {
      message.success(result.message);
      
      const checkOutDate2 = new Date(endDateSelect); // Convert to Date object
      checkOutDate2.setDate(checkOutDate2.getDate() - 1);
      // Thêm khoảng thời gian mới vào bookDates
      setBookDates((prevBookDates) => [
        ...prevBookDates,
        { startDate: checkInDate, endDate: checkOutDate2.toISOString().split('T')[0] },
      ]);
  
      // Reset range được chọn
      setStartDateSelect(null);
      setEndDateSelect(null);
    } else {
      message.error(`Failed to add booking`);
    }
  
    // (Optional) Cập nhật lại danh sách phòng (nếu cần)
    fetchRooms();
  };
  


  const handleAddDate = async () => {
    if (!startDateSelect || !endDateSelect) {
      alert('Please select both a start and an end date.');
      return;
    }
  
    if (!selectedRoom) {
      alert('No room selected!');
      return;
    }
  
    const roomId = selectedRoom._id;
    const checkInDate = startDateSelect.format('YYYY-MM-DD');
    const checkOutDate = endDateSelect.format('YYYY-MM-DD');
  
    const result = await updateRoomAvailableDate(roomId, checkInDate, checkOutDate);
  
    if (result.success) {
      message.success(result.message);
      const checkOutDate2 = new Date(endDateSelect); // Convert to Date object
      // checkOutDate2.setDate(checkOutDate2.getDate() + 1);
      // Thêm khoảng thời gian mới vào selectedDates
      setSelectedDates((prevSelectedDates) => [
        ...prevSelectedDates,
        { startDate: new Date(checkInDate), endDate: checkOutDate2 },
      ]);
  
      // Reset range được chọn
      setStartDateSelect(null);
      setEndDateSelect(null);
    } else {
      message.error(`Failed to add available date: ${result.message}`);
    }
  
    // (Optional) Cập nhật lại danh sách phòng (nếu cần)
    fetchRooms();
  };

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

      {/* <Menu.Item key="status">
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
      </Menu.Item> */}

      <Menu.Item key="filter-buttons">
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Button onClick={handleResetFilter} >Reset</Button>
          <Button type="primary" onClick={applyFilters}>Apply Filter</Button>
        </div>
      </Menu.Item>
    </Menu>
  );

  const columns = [
    { title: 'Room ID', dataIndex: 'roomNumber', key: 'roomNumber' },
    {
      title: 'Media',
      key: 'media',
      render: (_, record) => (
        <div>
          {record.media && record.media.length > 0 ? (
            <img
              src={`http://localhost:5000${record.media[0]}`}  // Thêm localhost:5000 vào đường dẫn
              alt="media"
              className="room-image"  // Thêm class cho hình ảnh
              onClick={() => handleMediaClick(record, record.media)}
            />
          ) : (
            <span>No media</span>
          )}
        </div>
      ),
    },
    { title: 'Capacity', dataIndex: 'capacity', key: 'capacity' },
    { title: 'Type', dataIndex: 'roomType', key: 'roomType' },
    { title: 'Price', dataIndex: 'price', key: 'price' },
    {
      title: 'Available',
      key: 'available',
      render: (_, record) => (
        <Button
          type="link"
          icon={<CalendarOutlined />}
          onClick={() => handleCalendarOpen(record, record.availableDates, record.bookDates)}
        />
      ),
    },
    // { title: 'Status', dataIndex: 'status', key: 'status' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Popover
          content={menu(record)}
          trigger="click"
          visible={popoverVisible[record.id]}
          onVisibleChange={(visible) => setPopoverVisible((prev) => ({ ...prev, [record._id]: visible }))}
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
        onRow={(record) => ({
          onDoubleClick: () => {
            console.log("Double-clicked record:", record._id);
            navigate(`/host/ratingreviews/${record._id}`);
          } 
        })}
      />
      <Modal
        visible={isMediaModalVisible}
        footer={null}
        onCancel={handleMediaModalClose}
        width={800}
      >
        <Carousel
          autoplay
          dots
          arrows
          effect="fade"
          autoplaySpeed={5000}
        >
          {currentMedia.map((item, index) => {
            const mediaUrl = `http://localhost:5000${item}`;
            const isVideo = item.endsWith('.mp4') || item.endsWith('.webm');
            return (
              <div key={index} style={{ position: 'relative', textAlign: 'center' }}>
                {isVideo ? (
                  <video src={mediaUrl} controls className="modal-video" />
                ) : (
                  <img src={mediaUrl} alt={`media-${index}`} className="modal-image" />
                )}
                <div
                  className="delete-overlay"
                  onClick={() => handleDeleteMediaConfirm(item)}
                >
                  <DeleteOutlined style={{ fontSize: 24, color: 'red' }} />
                </div>
              </div>
            );
          })}
        </Carousel>
        {/* <Button type="primary" 
        // onClick={handleAddMediaClick} 
        style={{ marginTop: 16 }}>
          Thêm ảnh
        </Button> */}

        <Button
          icon={<PlusOutlined />}
          style={{ marginTop: 16 }}
          onClick={() => document.getElementById('upload-media-input').click()}
        >
          Thêm ảnh
        </Button>
        <input
          id="upload-media-input"
          type="file"
          accept="image/*,video/*"
          style={{ display: 'none' }}
          onChange={handleUploadMedia}
        />
      </Modal>
      <Modal
        title={`Available Dates for Room: ${selectedRoom?.roomNumber || ''}`}
        open={isCalendarVisible}
        onCancel={handleCalendarClose}
        style={{ height: '400px', top: '20%' }}
        footer={null}
      >
        <Calendar
          onSelect={onDateSelect}
          dateCellRender={dateCellRender}
          fullscreen={false}
        />
        <div style={{ marginTop: '20px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <button 
            onClick={handleAddBooking} 
            disabled={!startDateSelect || !endDateSelect}
            style={{
              backgroundColor: startDateSelect && endDateSelect ? '#1890ff' : '#d9d9d9',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: startDateSelect && endDateSelect ? 'pointer' : 'not-allowed',
            }}
          >
            Add Booking
          </button>
          <button 
            onClick={handleAddDate} 
            disabled={!startDateSelect || !endDateSelect}
            style={{
              backgroundColor: startDateSelect && endDateSelect ? '#b7eb8f' : '#d9d9d9',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: startDateSelect && endDateSelect ? 'pointer' : 'not-allowed',
            }}
          >
            Add Dates
          </button>
        </div>
      </Modal>
      
      <Modal
        title={selectedRoom ? 'Edit Room' : 'Add Room'}
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
      >
        <Form form={form} onFinish={handleFormSubmit} layout="vertical">
          <Form.Item
            label="Room Number"
            name="roomNumber"
            rules={[
              { required: true, message: 'Please enter room number' },
            ]}
          >
            <AntInput />
          </Form.Item>

          {/* Room Type */}
          <Form.Item
            label="Type"
            name="roomType"
            rules={[{ required: true, message: 'Please enter room type' }]}
          >
            <AntInput />
          </Form.Item>

          {/* Price */}
          <Form.Item
            label="Price"
            name="price"
            rules={[
              { required: true, message: 'Please enter price' },
              { type: 'number', min: 1, message: 'Price must be greater than 0' },
            ]}
            getValueFromEvent={(e) => Number(e.target.value)} // Convert to number
          >
            <AntInput type="number" />
          </Form.Item>

          {/* Capacity */}
          <Form.Item
            label="Capacity"
            name="capacity"
            rules={[
              { required: true, message: 'Please enter capacity' },
              { type: 'number', min: 1, message: 'Capacity must be greater than 0' },
            ]}
            getValueFromEvent={(e) => Number(e.target.value)} // Convert to number
          >
            <AntInput type="number" />
          </Form.Item>

          {/* Amenities */}
          <Form.Item
            label="Amenities"
            name="amenities"
            rules={[{ required: true, message: 'Please select at least one amenity' }]}
          >
            <Select
              mode="multiple"
              placeholder="Select amenities"
              options={amenitiesList.map((amenity) => ({ value: amenity, label: amenity }))}
            />
          </Form.Item>

          {/* Start Date and End Date */}
          {!isEditMode && (
            <>
              <Form.Item
                label="Upload Images/Videos"
                name="files"
                valuePropName="fileList"
                getValueFromEvent={(e) => Array.isArray(e) ? e : e && e.fileList}
                rules={[
                  { required: true, message: 'Please select at least one image' },
                ]}
              >
                <Upload
                  listType="picture"
                  beforeUpload={() => false} // Prevent auto-upload
                  accept="image/*,video/*"
                >
                  <Button icon={<UploadOutlined />}>Click to Upload</Button>
                </Upload>
              </Form.Item>

              <Form.Item
                label="Start Date"
                name="startDate"
                rules={[{ required: true, message: 'Please select a start date' }]}
              >
                <DatePicker format="YYYY-MM-DD" />
              </Form.Item>

              <Form.Item
                label="End Date"
                name="endDate"
                rules={[{ required: true, message: 'Please select an end date' }]}
              >
                <DatePicker format="YYYY-MM-DD" />
              </Form.Item>
            </>
          )}

          {/* Submit Button */}
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
