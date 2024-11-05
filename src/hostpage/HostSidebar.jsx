import React, { useState } from 'react';
import { Layout, Button } from 'antd';
import Sidebar from '../components/Sidebar';
import Dashboard from './Dashboard'; 
import Booking from './Booking';
import Room from './Room'; 
import Promotion from './Promotion'; 
import Payment from './Payment'; 
import Setting from './Setting';
import CustomHeader from '../components/Header';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import '../App.css';

const { Sider, Header, Content } = Layout;

const HostSidebar = ({ user }) => {
  const [selectedMenuItem, setSelectedMenuItem] = useState('1');
  const [collapsed, setCollapsed] = useState(false); 

  const handleMenuItemClick = (key) => {
    setSelectedMenuItem(key);
  };

  return (
    <Layout>
      <Sider theme='light' trigger={null} collapsible collapsed={collapsed} className='sider'>
        <Sidebar selectedMenuItem={selectedMenuItem} onMenuItemClick={handleMenuItemClick} role="host" />
        <Button
          type='text'
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          className='triger-btn'
        />
      </Sider>
      <Layout>
        <Header className='header'>
          <CustomHeader />
        </Header>
        <Content className='content'>
          {selectedMenuItem === '1' && <Dashboard user={user} />}
          {selectedMenuItem === '2' && <Booking user={user} />}
          {selectedMenuItem === '3' && <Room user={user} />}
          {selectedMenuItem === '4' && <Promotion user={user} />}
          {selectedMenuItem === '5' && <Payment user={user} />}
          {selectedMenuItem === '6' && <Setting user={user} />} 
        </Content>
      </Layout>
    </Layout>
  );
};

export default HostSidebar;
