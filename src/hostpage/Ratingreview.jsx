import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Table, Button, Input, Space, Modal, Form, Input as AntInput, Popconfirm, Popover, Rate, Card, Divider, Typography, Carousel, message} from 'antd';
import { EditOutlined, PlusOutlined, DeleteOutlined, EllipsisOutlined } from '@ant-design/icons';
import { getRatingByRoomId } from '../api/api';
import './Image.css';

const { Title } = Typography;

const RatingReview = () => {
  const { roomid } = useParams();
  console.log(roomid);
  const navigate = useNavigate();
  const [reviewData, setReviewData] = useState([]);
  const [isMediaModalVisible, setIsMediaModalVisible] = useState(false);
  const [currentMedia, setCurrentMedia] = useState([]); 
  const [userData, setUserData] = useState({}); 
  const [isModalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedReview, setSelectedReview] = useState(null);
  const [popoverVisible, setPopoverVisible] = useState({});

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviews = await getRatingByRoomId(roomid);
        console.log(reviews);
        setReviewData(reviews);

      } catch (error) {
        console.error('Error fetching booking:', error);
      }
    };
    fetchReviews();
  }, [roomid]);


  // const handleDeleteReview = async (id) => {
  //   await deleteReview(user, id);
  //   const updatedData = reviewData.filter((item) => item.reviewId !== id);
  //   setReviewData(updatedData);
  //   setPopoverVisible((prev) => ({ ...prev, [id]: false }));
  // };

  // const handleModalCancel = () => {
  //   setModalVisible(false);
  //   setSelectedReview(null);
  // };


  // const menu = (record) => (
  //   <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
  //     <Button
  //       type="link"
  //       icon={<EditOutlined />}
  //       onClick={() => handleEditReview(record)}
  //       style={{ padding: 0, textAlign: 'left' }}
  //     >
  //       Edit
  //     </Button>
  //     <Popconfirm
  //       title="Are you sure you want to delete this review?"
  //       onConfirm={() => handleDeleteReview(record.reviewId)}
  //       okText="Yes"
  //       cancelText="No"
  //     >
  //       <Button type="link" icon={<DeleteOutlined />} style={{ color: 'red', padding: 0, textAlign: 'left' }}>
  //         Delete
  //       </Button>
  //     </Popconfirm>
  //   </div>
  // );

  const handleMediaClick = (media) => {
    setCurrentMedia(media);
    setIsMediaModalVisible(true);
  };
  
  const handleMediaModalClose = () => {
    setIsMediaModalVisible(false);
    setCurrentMedia([]);
  };

  const handleDeleteMediaConfirm = (mediaUrl) => {
    Modal.confirm({
      title: 'Xóa ảnh',
      content: 'Bạn có chắc chắn muốn xóa ảnh này?',
      okText: 'OK',
      cancelText: 'Hủy',
      onOk: () => handleDeleteMedia(mediaUrl),
    });
  };
  
  const handleDeleteMedia = async (mediaUrl) => {
    try {
      // Gọi API để xóa ảnh
      await deleteMedia(selectedReview, mediaUrl);
  
      // Cập nhật state để loại bỏ ảnh đã xóa
      setCurrentMedia((prev) => prev.filter((item) => item !== mediaUrl));
    } catch (error) {
      console.error('Error deleting media:', error);
      message.failed(error);
    }
  };


  const columns = [
    {
        title: 'User',
        dataIndex: ['user', 'name'],
        key: 'userName',
    },
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
              onClick={() => handleMediaClick(record.media)}
            />
          ) : (
            <span>No media</span>
          )}
        </div>
      ),
    },
    { title: 'Rating', dataIndex: 'rating', key: 'rating', render: (rating) => <Rate disabled value={rating} /> },
    { title: 'Comment', dataIndex: 'comment', key: 'comment' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1, padding: '24px' }}>
        <Card style={{ padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Button type="link" onClick={() => navigate('/host/room')}>
            ← Back to Room Manager
          </Button>

          <Divider />
          
          <Title level={4}>Review And Rating</Title>

          <Table
            dataSource={reviewData}
            columns={columns}
            pagination={{ pageSize: 10 }}
          />
        </Card>
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
              </div>
            );
          })}
        </Carousel>
        {/* <Button type="primary" 
        // onClick={handleAddMediaClick} 
        style={{ marginTop: 16 }}>
          Thêm ảnh
        </Button> */}
        </Modal>
      </div>
    </div>
  );
};

export default RatingReview;
