import React, { useState } from 'react';
import { Modal, Switch, message, Button, Card, Row, Col, Typography } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { backupData, restoreData } from '../api/api';

const { Text } = Typography;

const SystemManagement = ({ setMaintenanceMode }) => {
  const [isLoadingBackup, setIsLoadingBackup] = useState(false);
  const [isLoadingRestore, setIsLoadingRestore] = useState(false);

  const confirmAction = (action, actionName) => {
    Modal.confirm({
      title: `Are you sure you want to ${actionName}?`,
      content: `This action cannot be undone. Proceed with ${actionName}?`,
      okText: 'Yes',
      cancelText: 'No',
      onOk: action,
    });
  };

  const handleBackup = async () => {
    setIsLoadingBackup(true);
    try {
      const result = await backupData();
      console.log('Backup successful:', result);
      message.success(result.message);
    } catch (error) {
      console.error('Backup failed:', error);
      message.error('Backup failed');
    } finally {
      setIsLoadingBackup(false);
    }
  };

  const handleRestore = async () => {
    setIsLoadingRestore(true);
    try {
      const result = await restoreData();
      console.log('Restore successful:', result);
      message.success(result.message);
    } catch (error) {
      console.error('Restore failed:', error);
      message.error('Restore failed');
    } finally {
      setIsLoadingRestore(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>System Management</h2>

      <Card style={{ margin: 24 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Text strong style={{ fontSize: '16px' }}>Backup Data</Text>
            <p style={{ fontSize: '14px', color: 'gray' }}>
              Save all current system data for future recovery.
            </p>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              loading={isLoadingBackup}
              onClick={() => confirmAction(handleBackup, 'backup data')}
            >
              Backup
            </Button>
          </Col>
        </Row>
      </Card>

      <Card style={{ margin: 24 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Text strong style={{ fontSize: '16px' }}>Restore Data</Text>
            <p style={{ fontSize: '14px', color: 'gray' }}>
              Recover system data from the latest backup.
            </p>
          </Col>
          <Col>
            <Button
              type="dashed"
              icon={<DownloadOutlined />}
              loading={isLoadingRestore}
              onClick={() => confirmAction(handleRestore, 'restore data')}
            >
              Restore
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default SystemManagement;
