import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import AdminSidebar from './adminpage/AdminSidebar';
import HostSidebar from './hostpage/HostSidebar';
import UserPage from './userpage/Userpage';
import MaintenancePage from './components/MaintenancePage';
import ProtectedRoute from './components/ProtectedRoute'; 
import BannedPage from './components/BannedPage';
import SignUpHotelOwner from './components/SignupHotel';
import UserDetail from './adminpage/UserDetail';
import VerifyEmail from './components/VerificationEmail';

const App = () => {
  const [user, setUser] = useState(null); 

  return (
    <Router>
      <Routes>

        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup-hotel" element={<SignUpHotelOwner setUser={setUser} />} />
        <Route path="/verify-email" element={<VerifyEmail/>} />


        {/* Admin Routes */}
        <Route path="/admin/*" element={<AdminSidebar user={user}  />} />
        {/* <Route path="/admin/customer-manager/:userid" element={<UserDetail />} /> */}
        <Route path="/host/*" element={<HostSidebar user={user} />} />

        
        {/* <Route path="/host-dashboard" element={
          <ProtectedRoute user={user}>
            {maintenanceMode ? <Navigate to="/maintenance" /> : <HostSidebar user={user} />}
          </ProtectedRoute>
        } /> */}
        
        <Route path="/banned" element={<BannedPage />} />
        
      </Routes>
    </Router>
  );
};

export default App;
