import React, { useEffect, useState } from 'react';
import { Typography, Spin, message, Row, Col, Card, Radio } from 'antd';
import { Line } from 'react-chartjs-2';
import { getTotalCustomers, getTotalUsers, getTotalHosts, getBookingsByHotelId, getHost } from '../api/api';
import moment from 'moment';
import 'chart.js/auto';

const Dashboard = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalHosts, setTotalHosts] = useState(0);
  const [incomeData, setIncomeData] = useState({ labels: [], datasets: [] });
  const [viewType, setViewType] = useState('month'); // default to 1 month view

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const customers = await getTotalCustomers();
        const users = await getTotalUsers();
        const hosts = await getTotalHosts();

        setTotalCustomers(customers);
        setTotalUsers(users);
        setTotalHosts(hosts);

        const hostArray = await getHost(user);
        const filteredHostArray = hostArray.filter(host => host.status !== 'Ban'); 
        let allIncomeData = [];

        const today = moment();

        // Set labels based on viewType
        const labels = viewType === 'month'
          ? Array.from({ length: 30 }, (_, i) =>
              today.clone().subtract(i, 'days').format('YYYY-MM-DD')
            ).reverse()
          : Array.from({ length: 12 }, (_, i) =>
              today.clone().subtract(i, 'months').format('YYYY-MM')
            ).reverse();

        for (const host of filteredHostArray) {
          if (host.hotelId) { 
            const bookings = await getBookingsByHotelId(host);
            const incomeCounts = Array(labels.length).fill(0);

            bookings.forEach(booking => {
              const checkInDate = moment(booking.checkInDate);
              
              if (viewType === 'month') {
                const daysAgo = today.diff(checkInDate, 'days');
                if (daysAgo >= 0 && daysAgo < 30) {
                  incomeCounts[29 - daysAgo] += booking.totalPrice;
                }
              } else if (viewType === 'year') {
                const monthsAgo = today.diff(checkInDate, 'months');
                if (monthsAgo >= 0 && monthsAgo < 12) {
                  incomeCounts[11 - monthsAgo] += booking.totalPrice;
                }
              }
            });

            const dataset = {
              label: `Hotel ${host.hotelId}`, 
              data: incomeCounts, 
              fill: false,
              borderColor: '#' + Math.floor(Math.random() * 16777215).toString(16), 
              tension: 0.1,
            };

            allIncomeData.push(dataset);
          }
        }
        setIncomeData({ labels, datasets: allIncomeData });

      } catch (error) {
        message.error('Failed to load admin dashboard data.');
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, viewType]);

  return (
    <div>
      <Typography.Title level={2} style={{ textAlign: 'left', marginBottom: '20px' }}>
        Admin Dashboard
      </Typography.Title>
      
      {loading ? (
        <Spin size="large" />
      ) : (
        <>
          <Row gutter={16} style={{ marginBottom: '16px' }}>
            <Col span={8}>
              <Card title="Total Customers" bordered={false}>
                <Typography.Title level={3} style={{ textAlign: 'center' }}>{totalCustomers}</Typography.Title>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Total Users" bordered={false}>
                <Typography.Title level={3} style={{ textAlign: 'center' }}>{totalUsers}</Typography.Title>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Total Hosts" bordered={false}>
                <Typography.Title level={3} style={{ textAlign: 'center' }}>{totalHosts}</Typography.Title>
              </Card>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Card 
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Income Over Selected Period</span>
                    <Radio.Group
                      value={viewType}
                      onChange={(e) => setViewType(e.target.value)}
                    >
                      <Radio.Button value="month">1 Month</Radio.Button>
                      <Radio.Button value="year">1 Year</Radio.Button>
                    </Radio.Group>
                  </div>
                }
                bordered={false}
              >
                <Line
                  data={incomeData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Income' },
                      },
                      x: {
                        title: { display: true, text: viewType === 'month' ? 'Date' : 'Month' },
                        ticks: {
                          autoSkip: true,
                          maxTicksLimit: viewType === 'month' ? 10 : 12,
                          stepSize: 3,
                        },
                      },
                    },
                  }}
                  height={400}
                />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );  
};

export default Dashboard;
