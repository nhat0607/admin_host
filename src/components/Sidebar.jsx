import React from 'react';
import { Flex, Menu } from 'antd';
import { FaLeaf } from 'react-icons/fa6';
import { AppstoreOutlined, UserOutlined, SettingOutlined, CalendarOutlined, HomeOutlined, DollarCircleOutlined, TagOutlined } from '@ant-design/icons'; // Import the TagOutlined icon

const Sidebar = ({ selectedMenuItem, onMenuItemClick, role }) => {
  const hostItems = [
    {
      key: '1',
      icon: <AppstoreOutlined />,
      label: 'Dashboard',
      onClick: () => onMenuItemClick('1'),
    },
    {
      key: '2',
      icon: <CalendarOutlined />,
      label: 'Booking',
      onClick: () => onMenuItemClick('2'),
    },
    {
      key: '3',
      icon: <HomeOutlined />,
      label: 'Room',
      onClick: () => onMenuItemClick('3'),
    },
    {
      key: '4',
      icon: <TagOutlined />,
      label: 'Promotions', 
      onClick: () => onMenuItemClick('4'),
    },
    {
      key: '5',
      icon: <DollarCircleOutlined />,
      label: 'Payment',
      onClick: () => onMenuItemClick('5'),
    },
    {
      key: '6',
      icon: <SettingOutlined />,
      label: 'Setting',
      onClick: () => onMenuItemClick('6'),
    },
  ];

  const adminItems = [
    {
      key: '1',
      icon: <AppstoreOutlined />,
      label: 'Dashboard',
      onClick: () => onMenuItemClick('1'),
    },
    {
      key: '2',
      icon: <UserOutlined />,
      label: 'Accounts',
      onClick: () => onMenuItemClick('2'),
    },
    {
      key: '3',
      icon: <SettingOutlined />,
      label: 'System Setting',
      onClick: () => onMenuItemClick('3'),
    },
  ];

  return (
    <>     
      <Flex align="center" justify="center"> 
          <div className="logo">
            <FaLeaf />
          </div>
      </Flex>
      
      <Menu
        mode="inline"
        selectedKeys={[selectedMenuItem]}
        items={role === 'admin' ? adminItems : hostItems}
      />
    </>
  );
};

export default Sidebar;
