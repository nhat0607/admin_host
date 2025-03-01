import React, { useState, useEffect } from 'react';
import { Layout, Button } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { Route, Routes } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import CustomHeader from '../components/Header';
import Dashboard from './Dashboard';
import AccountManagement from './AccountManagement';
import SystemManagement from './SystemManagement';
import PendingAccounts from './PendingAccounts';
import UserDetail from './UserDetail';
import TransactionHistory from './TransactionHistory';
import TransactionDetail from './TransactionDetail';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import '../App.css';

const { Sider, Header, Content } = Layout;

const AdminSidebar = ({ user, maintenanceMode, setMaintenanceMode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate(); // Initialize navigate function
  const location = useLocation(); // Get the current location

  // Automatically set selectedMenuItem based on the current route
  const [selectedMenuItem, setSelectedMenuItem] = useState('1');

  useEffect(() => {
    // Update selected menu item based on the current path
    if (location.pathname === '/admin/dashboard') {
      setSelectedMenuItem('1');
    } else if (location.pathname === '/admin/transaction') {
      setSelectedMenuItem('2');
    } else if (location.pathname === '/admin/customer-manager') {
      setSelectedMenuItem('3');
    } else if (location.pathname === '/admin/pending-accounts') {
      setSelectedMenuItem('4');
    } else if (location.pathname === '/admin/system-management') {
      setSelectedMenuItem('5');
    }
  }, [location.pathname]); // Runs every time the path changes

  const handleMenuItemClick = (key) => {
    // Navigate based on menu item selection
    switch (key) {
      case '1':
        navigate('/admin/dashboard');
        break;
      case '2':
        navigate('/admin/transaction');
        break;
      case '3':
        navigate('/admin/customer-manager');
        break;
      case '4':
        navigate('/admin/pending-accounts');
        break;
      case '5':
        navigate('/admin/system-management');
      default:
        break;
    }
  };

  return (
    <Layout>
      <Sider theme="light" trigger={null} collapsible collapsed={collapsed} className="sider">
        <Sidebar onMenuItemClick={handleMenuItemClick} selectedMenuItem={selectedMenuItem} role="admin" />
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          className="trigger-btn"
        />
      </Sider>

      <Layout>
        <Header className="header">
          <CustomHeader />
        </Header>
        <Content style={{ padding: '24px'}}>
        <Routes>
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/transaction" element={<TransactionHistory user={user} />} />
            <Route path="/customer-manager" element={<AccountManagement user={user} />} />
            <Route path="/pending-accounts" element={<PendingAccounts user={user} />} />
            <Route path="/system-management" element={<SystemManagement setMaintenanceMode={setMaintenanceMode} user={user} />} />        
            <Route path="/customer-manager/:userid" element={<UserDetail />} />
            <Route path="/transaction-detail/:transactionid" element={<TransactionDetail />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminSidebar;
