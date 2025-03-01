import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Typography, Divider, Card, Descriptions } from 'antd';
import { getTransaction } from '../api/api';

const { Title } = Typography;

const TransactionDetail = () => {
  const { transactionid } = useParams();
  const navigate = useNavigate();
  const [transactionDetail, setTransactionDetail] = useState(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const transaction = await getTransaction();
        const transactionData = transaction.data?.formattedTransactions || [];
        const detail = transactionData.find((t) => t.transactionId === transactionid);
        setTransactionDetail(detail);
      } catch (error) {
        console.error('Error fetching transaction details:', error);
      }
    };
    fetchTransaction();
  }, [transactionid]);

  if (!transactionDetail) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
        <Typography.Text>Loading transaction details...</Typography.Text>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1, padding: '24px' }}>
        <Card 
          style={{ 
            padding: '24px', 
            borderRadius: '8px', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
            maxHeight: '80vh', 
            overflowY: 'auto' 
          }}
        >
          <Button type="link" onClick={() => navigate('/admin/transaction')}>
            ← Back to Transaction History
          </Button>

          <Divider />

          <Title level={4}>Transaction Detail</Title>

          <Descriptions column={1} bordered>
            <Descriptions.Item label="Transaction ID">{transactionDetail.transactionId}</Descriptions.Item>
            <Descriptions.Item label="Transaction Date">{new Date(transactionDetail.transactionDate).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="Customer Name">{transactionDetail.customerName}</Descriptions.Item>
            <Descriptions.Item label="Customer Email">{transactionDetail.customerEmail}</Descriptions.Item>
            <Descriptions.Item label="Check-in Date">{new Date(transactionDetail.checkInDate).toLocaleDateString()}</Descriptions.Item>
            <Descriptions.Item label="Check-out Date">{new Date(transactionDetail.checkOutDate).toLocaleDateString()}</Descriptions.Item>
            <Descriptions.Item label="Payment Method">
              {transactionDetail.paymentMethod === 50 ? 'Pay 50%' : 'Pay All'}
            </Descriptions.Item>
            <Descriptions.Item label="Amount Paid">{transactionDetail.amount}VND</Descriptions.Item>
            <Descriptions.Item label="Admin Fee">{transactionDetail.adminFee}VND</Descriptions.Item>
            <Descriptions.Item label="Host Amount">{transactionDetail.hostAmount}VND</Descriptions.Item>
            {/* <Descriptions.Item label="Host Name">{transactionDetail.hostName || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Host Email">{transactionDetail.hostEmail || 'N/A'}</Descriptions.Item> */}
          </Descriptions>
        </Card>
      </div>
    </div>
  );
};

export default TransactionDetail;