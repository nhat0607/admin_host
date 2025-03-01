import React from 'react';
import { Avatar, Typography, Dropdown, Menu } from 'antd';
import { BellOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Search from 'antd/es/input/Search';
import '../App.css'

const CustomHeader = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('hotelId');
    navigate('/login'); 
  };

  const menu = (
    <Menu style={{ width: '150px' }}>  
      <Menu.Item key="logout" onClick={handleLogout} icon={<LogoutOutlined />}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography.Title level={3} type='secondary'></Typography.Title>
      <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
            <Avatar icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
          </Dropdown>
          <BellOutlined className='header-icon' />
        </div>
      </div>
    </div>
  );
};

export default CustomHeader;
