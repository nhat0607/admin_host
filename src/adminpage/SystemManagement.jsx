import React, { useState, useEffect } from 'react';
import { Switch, message } from 'antd';
import { getMaintenanceMode, updateMaintenanceMode } from '../api/api'; // Adjust the import based on your file structure

const SystemManagement = ({ setMaintenanceMode }) => {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  useEffect(() => {
    const fetchMaintenanceMode = async () => {
      try {
        const savedMaintenanceMode = await getMaintenanceMode();
        setIsMaintenanceMode(savedMaintenanceMode);
        setMaintenanceMode(savedMaintenanceMode); 
      } catch (error) {
        console.error("Failed to fetch maintenance mode:", error);
        message.error("Failed to fetch maintenance mode");
      }
    };

    fetchMaintenanceMode();
  }, [setMaintenanceMode]);

  const toggleMaintenanceMode = async (checked) => {
    setIsMaintenanceMode(checked);
    setMaintenanceMode(checked);

    try {
      await updateMaintenanceMode(checked);
      message.success(`Maintenance mode ${checked ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error("Failed to update maintenance mode:", error);
      message.error("Failed to update maintenance mode");
    }
  };

  return (
    <div>
      <h2>System Management</h2>
      <p>Maintenance Mode:</p>
      <Switch checked={isMaintenanceMode} onChange={toggleMaintenanceMode} />
    </div>
  );
};

export default SystemManagement;
