import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { getHotelByHost, updateHotelByHost } from '../api/api';
import './Setting.css';

const Setting = ({ user }) => {
  const [form] = Form.useForm();
  const [logo, setLogo] = useState(null);
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);

  if (!user) {
    return <div>Access denied: You must be logged in to view this page.</div>;
  }

  useEffect(() => {
    const fetchHotelData = async () => {
      try {
        const hotel = await getHotelByHost(user);
        if (hotel) {
          form.setFieldsValue({
            hotelName: hotel.name,
            hotelAddress: `${hotel.location.address}, ${hotel.location.city}, ${hotel.location.country}`, // Sử dụng trường mới
          });
          setLatitude(hotel.location.latitude);
          setLongitude(hotel.location.longitude);
        }
      } catch (error) {
        message.error('Failed to load hotel information');
      }
    };
    fetchHotelData();
  }, [form, user]);

  const handleLogoUpload = (file) => {
    setLogo(file);
    return false;
  };

  const handleSubmit = async (values) => {
    try {
      const [address, city, country] = values.hotelAddress.split(',').map(part => part.trim()); 

      await updateHotelByHost(user, {
        name: values.hotelName,
        location: {
          address: address || '', 
          city: city || '',
          country: country || '',
          latitude,
          longitude,
        },
      });
      message.success('Hotel information updated successfully!');
    } catch (error) {
      message.error('Failed to update hotel information.');
    }
  };

  return (
    <div className="Setting-page">
      <div className="Setting-container">
        <div className="sidebar">
          <h2>Setting</h2>
          <ul>
            <li className="active">General</li>
            <li>Email</li>
          </ul>
        </div>

        <div className="content">
          <h3>General Setting</h3>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label="Hotel Name"
              name="hotelName"
              rules={[{ required: true, message: 'Please input your hotel name!' }]}
            >
              <Input placeholder="Enter hotel name" />
            </Form.Item>

            <Form.Item label="Hotel Image" name="logo">
              <Upload beforeUpload={handleLogoUpload} listType="picture">
                <Button icon={<UploadOutlined />}>Upload Image</Button>
              </Upload>
            </Form.Item>

            <Form.Item
              label="Hotel Address (Address, City, Country)"
              name="hotelAddress" 
              rules={[{ required: true, message: 'Please input your hotel address!' }]}
            >
              <Input placeholder="Enter hotel address, city, country" />
            </Form.Item>
            <Form.Item
              label="Main Site"
              name="mainSite"
              rules={[{ type: 'url', message: 'Please enter a valid URL!' }]}
            >
              <Input placeholder="Enter main site URL" />
            </Form.Item>

            <Form.Item
              label="Facebook"
              name="facebook"
              rules={[{ type: 'url', message: 'Please enter a valid Facebook URL!' }]}
            >
              <Input placeholder="Enter Facebook URL" />
            </Form.Item>

            <Form.Item
              label="Instagram"
              name="instagram"
              rules={[{ type: 'url', message: 'Please enter a valid Instagram URL!' }]}
            >
              <Input placeholder="Enter Instagram URL" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save Setting
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Setting;

