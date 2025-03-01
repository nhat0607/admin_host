import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Modal, Form, Input as AntInput, Popconfirm, Popover } from 'antd';
import { EditOutlined, PlusOutlined, DeleteOutlined, EllipsisOutlined } from '@ant-design/icons';


const Promotion = ({ user }) => {
  const [promotionData, setPromotionData] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [popoverVisible, setPopoverVisible] = useState({});

  // useEffect(() => {
  //   const fetchPromotions = async () => {
  //     if (user && user.hotelId) {
  //       const promotions = await getPromotionsByHotelId(user);
  //       setPromotionData(promotions);
  //     }
  //   };
  //   fetchPromotions();
  // }, [user]);

  const handleAddPromotion = () => {
    setSelectedPromotion(null);
    setModalVisible(true);
    form.resetFields();
  };

  const handleEditPromotion = (record) => {
    setSelectedPromotion(record);
    setModalVisible(true);
    form.setFieldsValue(record);
    setPopoverVisible((prev) => ({ ...prev, [record.promotionId]: false }));
  };

  // const handleDeletePromotion = async (id) => {
  //   await deletePromotion(user, id);
  //   const updatedData = promotionData.filter((item) => item.promotionId !== id); 
  //   setPromotionData(updatedData);
  //   setPopoverVisible((prev) => ({ ...prev, [id]: false })); 
  // };

  const handleModalCancel = () => {
    setModalVisible(false);
    setSelectedPromotion(null);
  };

  // const handleFormSubmit = async (values) => {
  //   try {
  //     if (selectedPromotion) {
  //       const updatedPromotion = await updatePromotion(user, selectedPromotion.promotionId, values);
  //       const updatedData = promotionData.map((item) =>
  //         item.promotionId === selectedPromotion.promotionId ? { ...item, ...updatedPromotion } : item
  //       );
  //       setPromotionData(updatedData);
  //     } else {
  //       const newPromotion = await addPromotion(user, values);
  //       setPromotionData([...promotionData, newPromotion]);
  //     }
  //     handleModalCancel();
  //   } catch (error) {
  //     alert(error.message); 
  //   }
  // };

  const menu = (record) => (
    <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
      <Button
        type="link"
        icon={<EditOutlined />}
        onClick={() => handleEditPromotion(record)}
        style={{ padding: 0, textAlign: 'left' }}
      >
        Edit
      </Button>
      {/* <Popconfirm
        title="Are you sure you want to delete this promotion?"
        onConfirm={() => handleDeletePromotion(record.promotionId)}
        okText="Yes"
        cancelText="No"
      >
        <Button type="link" icon={<DeleteOutlined />} style={{ color: 'red', padding: 0, textAlign: 'left' }}>
          Delete
        </Button>
      </Popconfirm> */}
    </div>
  );

  const columns = [
    { title: 'Promotion ID', dataIndex: 'promotionId', key: 'promotionId' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Start Date', dataIndex: 'startDate', key: 'startDate' },
    { title: 'End Date', dataIndex: 'endDate', key: 'endDate' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Popover
          content={menu(record)}
          trigger="click"
          visible={popoverVisible[record.promotionId]}
          onVisibleChange={(visible) => setPopoverVisible((prev) => ({ ...prev, [record.promotionId]: visible }))}
        >
          <Button type="text" icon={<EllipsisOutlined rotate={90} />} />
        </Popover>
      ),
    },
  ];

  return (
    <div className="table-container">
      <div className="table-header">
        <h3>Promotion List</h3>
        <Space>
          <Input.Search placeholder="Search promotions..." style={{ width: 200 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddPromotion}>
            Add Promotion
          </Button>
        </Space>
      </div>
      <Table 
        dataSource={promotionData} 
        columns={columns} 
        pagination={{ pageSize: 10 }} 
      />

      {/* <Modal
        title={selectedPromotion ? 'Edit Promotion' : 'Add Promotion'}
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
      >
        <Form form={form} onFinish={handleFormSubmit} layout="vertical">
          <Form.Item label="Description" name="description" rules={[{ required: true, message: 'Please enter promotion description' }]}>
            <AntInput />
          </Form.Item>
          <Form.Item label="Start Date" name="startDate" rules={[{ required: true, message: 'Please select start date' }]}>
            <AntInput type="date" />
          </Form.Item>
          <Form.Item label="End Date" name="endDate" rules={[{ required: true, message: 'Please select end date' }]}>
            <AntInput type="date" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {selectedPromotion ? 'Save Changes' : 'Add Promotion'}
            </Button>
          </Form.Item>
        </Form>
      </Modal> */}
    </div>
  );
};

export default Promotion;
