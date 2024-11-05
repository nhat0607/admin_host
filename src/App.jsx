import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import AdminSidebar from './adminpage/AdminSidebar';
import HostSidebar from './hostpage/HostSidebar';
import UserPage from './userpage/Userpage';
import MaintenancePage from './components/MaintenancePage';
import { getMaintenanceMode } from './api/api';
import ProtectedRoute from './components/ProtectedRoute'; 
const App = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [user, setUser] = useState(null); 

  useEffect(() => {
    const fetchMaintenanceMode = async () => {
      try {
        const savedMaintenanceMode = await getMaintenanceMode();
        setMaintenanceMode(savedMaintenanceMode);
      } catch (error) {
        console.error("Failed to fetch maintenance mode:", error);
      }
    };

    fetchMaintenanceMode();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setUser={setUser} />} />

        <Route path="/admin-dashboard" element={
          <ProtectedRoute user={user}>
            <AdminSidebar user={user} maintenanceMode={maintenanceMode} setMaintenanceMode={setMaintenanceMode} />
          </ProtectedRoute>
        } />
        
        <Route path="/host-dashboard" element={
          <ProtectedRoute user={user}>
            {maintenanceMode ? <Navigate to="/maintenance" /> : <HostSidebar user={user} />}
          </ProtectedRoute>
        } />

        <Route path="/user-dashboard" element={
          <ProtectedRoute user={user}>
            {maintenanceMode ? <Navigate to="/maintenance" /> : <UserPage user={user} />}
          </ProtectedRoute>
        } />
        
        <Route path="/maintenance" element={<MaintenancePage />} />
      </Routes>
    </Router>
  );
};

export default App;
