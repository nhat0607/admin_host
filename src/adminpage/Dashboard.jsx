import React, { useEffect, useState } from 'react';
import { Typography, Spin, message, Row, Col, Card } from 'antd';
import { Line } from 'react-chartjs-2';
import { getTotalCustomers, getTotalUsers, getTotalHosts, getBookingsByHotelId, getHotelByHost, getHost } from '../api/api';
import moment from 'moment';
import 'chart.js/auto';

const Dashboard = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalHosts, setTotalHosts] = useState(0);
  const [incomeData, setIncomeData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const customers = await getTotalCustomers();
        const users = await getTotalUsers();
        const hosts = await getTotalHosts();

        setTotalCustomers(customers);
        setTotalUsers(users);
        setTotalHosts(hosts);

        const hotel = await getHotelByHost(user); 
        if (hotel && hotel.id) {
          const bookings = await getBookingsByHotelId(user); 
          const incomeCounts = Array(30).fill(0);
          const today = moment();

          bookings.forEach(booking => {
            const checkInDate = moment(booking.checkInDate);
            const daysAgo = today.diff(checkInDate, 'days');
            if (daysAgo >= 0 && daysAgo < 30) {
              incomeCounts[daysAgo] += booking.totalPrice; 
            }
          });

          const labels = Array.from({ length: 30 }, (_, i) => today.clone().subtract(i, 'days').format('YYYY-MM-DD')).reverse();
          const dataset = {
            label: hotel.name, 
            data: incomeCounts.reverse(), 
            fill: false,
            borderColor: '#' + Math.floor(Math.random() * 16777215).toString(16), 
            tension: 0.1,
          };

          setIncomeData({ labels, datasets: [dataset] }); 

        } else {
          message.warning('No associated hotel found for this user.');
        }
      } catch (error) {
        message.error('Failed to load admin dashboard data.');
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

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
              <Card title="Total Customers" bordered={false} style={{ height: '100%', position: 'relative' }}>
                <Typography.Title level={3} style={{ textAlign: 'center' }}>{totalCustomers}</Typography.Title>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Total Users" bordered={false} style={{ height: '100%', position: 'relative' }}>
                <Typography.Title level={3} style={{ textAlign: 'center' }}>{totalUsers}</Typography.Title>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Total Hosts" bordered={false} style={{ height: '100%', position: 'relative' }}>
                <Typography.Title level={3} style={{ textAlign: 'center' }}>{totalHosts}</Typography.Title>
              </Card>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Card title="Income Over Last 30 Days" bordered={false} style={{ height: '100%' }}>
                <Line
                  data={incomeData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Income',
                        },
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Date',
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
