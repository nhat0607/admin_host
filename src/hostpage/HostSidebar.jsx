import React, { useState, useEffect } from 'react';
import { Layout, Button } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { Route, Routes } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Dashboard from './Dashboard'; 
import Booking from './Booking';
import Room from './Room'; 
import Promotion from './Promotion'; 
import Payment from './Payment'; 
import Setting from './Setting';
import RatingReview from './Ratingreview';
import BookingDetail from './BookingDetail';
import CustomHeader from '../components/Header';
import TransactionHistory from './TransactionHistoryHost';
import TransactionDetail from './TransactionDetailHost';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import '../App.css';

const { Sider, Header, Content } = Layout;

const HostSidebar = ({ user }) => {
  const [selectedMenuItem, setSelectedMenuItem] = useState('1');
  const [collapsed, setCollapsed] = useState(false); 
  const navigate = useNavigate(); // Initialize navigate function
  const location = useLocation(); // Get the current location

  useEffect(() => {
    // Update selected menu item based on the current path
    if (location.pathname === '/host/dashboard') {
      setSelectedMenuItem('1');
    } else if (location.pathname === '/host/booking') {
      setSelectedMenuItem('2');
    } else if (location.pathname === '/host/room') {
      setSelectedMenuItem('3');
    } else if (location.pathname === '/host/transactions') {
      setSelectedMenuItem('4');
    // } else if (location.pathname === '/host/ratingreviews') {
    //   setSelectedMenuItem('5');
    // } else if (location.pathname === '/host/payment') {
    //   setSelectedMenuItem('6');
    } else if (location.pathname === '/host/setting') {
      setSelectedMenuItem('7');
    }
  }, [location.pathname]); // Runs every time the path changes

  const handleMenuItemClick = (key) => {
    // Navigate based on menu item selection
    switch (key) {
      case '1':
        navigate('/host/dashboard');
        break;
      case '2':
        navigate('/host/booking');
        break;
      case '3':
        navigate('/host/room');
        break;
      case '4':
        navigate('/host/transactions');
        break;
      // case '5':
      //   navigate('/host/ratingreviews');
      //   break;
      // case '6':
      //   navigate('/host/payment');
      //   break;
      case '7':
        navigate('/host/setting');
        break;
      default:
        break;
    }
  };

  return (
    <Layout>
      <Sider theme='light' trigger={null} collapsible collapsed={collapsed} className='sider'>
        <Sidebar selectedMenuItem={selectedMenuItem} onMenuItemClick={handleMenuItemClick} role="host" />
        <Button
          type='text'
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          className='trigger-btn'
        />
      </Sider>
      <Layout>
        <Header className='header'>
          <CustomHeader />
        </Header>
        <Content className='content'>
          <Routes>
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/booking" element={<Booking user={user} />} />
            <Route path="/room" element={<Room user={user} />} />
            <Route path="/transactions" element={<TransactionHistory user={user} />} />
            <Route path="/payment" element={<Payment user={user} />} />
            <Route path="/setting" element={<Setting user={user} />} />
            <Route path="/ratingreviews/:roomid" element={<RatingReview />} />
            <Route path="/booking-manager/:bookingid" element={<BookingDetail />} />
            <Route path="/transaction-detail/:transactionid" element={<TransactionDetail />} />

          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default HostSidebar;
