import React, { useState } from 'react';
import { Layout, Button } from 'antd';
import Sidebar from '../components/Sidebar';
import CustomHeader from '../components/Header';
import Dashboard from './Dashboard';
import AccountManagement from './AccountManagement';
import SystemManagement from './SystemManagement';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import '../App.css';

const { Sider, Header, Content } = Layout;

const AdminSidebar = ({ user, maintenanceMode, setMaintenanceMode }) => {
  const [selectedMenuItem, setSelectedMenuItem] = useState('1');
  const [collapsed, setCollapsed] = useState(false); 

  const handleMenuItemClick = (key) => {
    setSelectedMenuItem(key);
  };

  return (
    <Layout>
      <Sider theme='light' trigger={null} collapsible collapsed={collapsed} className='sider'>
        <Sidebar selectedMenuItem={selectedMenuItem} onMenuItemClick={handleMenuItemClick} role="admin" />
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
        <Content style={{ padding: '24px' }}>
          {selectedMenuItem === '1' && <Dashboard user={user} />}
          {selectedMenuItem === '2' && <AccountManagement user={user} />}
          {selectedMenuItem === '3' && <SystemManagement setMaintenanceMode={setMaintenanceMode} user={user} />}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminSidebar;
