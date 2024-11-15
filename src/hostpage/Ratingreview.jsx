import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Modal, Form, Input as AntInput, Popconfirm, Popover, Rate } from 'antd';
import { EditOutlined, PlusOutlined, DeleteOutlined, EllipsisOutlined } from '@ant-design/icons';
import { getRatingByHotelId, addReview, updateReview, deleteReview, getUserById } from '../api/api';

const RatingReview = ({ user }) => {
  const [reviewData, setReviewData] = useState([]);
  const [userData, setUserData] = useState({}); 
  const [isModalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedReview, setSelectedReview] = useState(null);
  const [popoverVisible, setPopoverVisible] = useState({});

  useEffect(() => {
    const fetchReviews = async () => {
      if (user && user.hotelId) {
        const reviews = await getRatingByHotelId(user);
        setReviewData(reviews);

        const userPromises = reviews.map((review) => getUserById(review.userId));  
        const users = await Promise.all(userPromises);


        const usersById = users.reduce((acc, user) => {
          acc[user.userId] = user;  
          return acc;
        }, {});
        setUserData(usersById);
      }
    };
    fetchReviews();
  }, [user]);

  const handleAddReview = () => {
    setSelectedReview(null);
    setModalVisible(true);
    form.resetFields();
  };

  const handleEditReview = (record) => {
    setSelectedReview(record);
    setModalVisible(true);
    form.setFieldsValue(record);
    setPopoverVisible((prev) => ({ ...prev, [record.reviewId]: false }));
  };

  const handleDeleteReview = async (id) => {
    await deleteReview(user, id);
    const updatedData = reviewData.filter((item) => item.reviewId !== id);
    setReviewData(updatedData);
    setPopoverVisible((prev) => ({ ...prev, [id]: false }));
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setSelectedReview(null);
  };

  const handleFormSubmit = async (values) => {
    try {
      if (selectedReview) {
        const updatedReview = await updateReview(user, selectedReview.reviewId, values);
        const updatedData = reviewData.map((item) =>
          item.reviewId === selectedReview.reviewId ? { ...item, ...updatedReview } : item
        );
        setReviewData(updatedData);
      } else {
        const newReview = await addReview(user, values);
        setReviewData([...reviewData, newReview]);
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
        onClick={() => handleEditReview(record)}
        style={{ padding: 0, textAlign: 'left' }}
      >
        Edit
      </Button>
      <Popconfirm
        title="Are you sure you want to delete this review?"
        onConfirm={() => handleDeleteReview(record.reviewId)}
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
    { title: 'Review ID', dataIndex: 'reviewId', key: 'reviewId' },
    {
        title: 'User',
        key: 'user',
        render: (_, record) => {
          const user = userData[record.userId]; 
          return user ? user.name : 'Loading...'; 
        },
    },
    { title: 'Rating', dataIndex: 'rating', key: 'rating', render: (rating) => <Rate disabled value={rating} /> },
    { title: 'Comment', dataIndex: 'comment', key: 'comment' },

    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Popover
          content={menu(record)}
          trigger="click"
          visible={popoverVisible[record.reviewId]}
          onVisibleChange={(visible) => setPopoverVisible((prev) => ({ ...prev, [record.reviewId]: visible }))}
        >
          <Button type="text" icon={<EllipsisOutlined rotate={90} />} />
        </Popover>
      ),
    },
  ];

  return (
    <div className="table-container">
      <div className="table-header">
        <h3>Rating & Review List</h3>
        <Space>
          <Input.Search placeholder="Search reviews..." style={{ width: 200 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddReview}>
            Add Review
          </Button>
        </Space>
      </div>
      <Table dataSource={reviewData} columns={columns} pagination={{ pageSize: 10 }} />

      <Modal
        title={selectedReview ? 'Edit Review' : 'Add Review'}
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
      >
        <Form form={form} onFinish={handleFormSubmit} layout="vertical">
          <Form.Item
            label="Rating"
            name="rating"
            rules={[{ required: true, message: 'Please select a rating' }]}
          >
            <Rate />
          </Form.Item>
          <Form.Item
            label="Comment"
            name="comment"
            rules={[{ required: true, message: 'Please enter a comment' }]}
          >
            <AntInput.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {selectedReview ? 'Save Changes' : 'Add Review'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RatingReview;
