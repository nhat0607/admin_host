import React, { useEffect, useState } from 'react';
import { Typography, Spin, message, Row, Col, Card } from 'antd';
import { FaCalendarAlt, FaBed, FaMoneyBillWave } from 'react-icons/fa';
import { Doughnut, Bar } from 'react-chartjs-2';
import { getBookingsByHotelId, getRoomTypeByBookingId, getTotalAndAvailableRooms } from '../api/api';
import moment from 'moment';
import 'chart.js/auto';

const Dashboard = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [totalBookings, setTotalBookings] = useState(0);
  const [bookingsThisMonth, setBookingsThisMonth] = useState(0);
  const [bookingsThisWeek, setBookingsThisWeek] = useState(0);
  const [totalRooms, setTotalRooms] = useState(0);
  const [availableRooms, setAvailableRooms] = useState(0);
  const [roomData, setRoomData] = useState({ labels: [], datasets: [] });
  const [incomeData, setIncomeData] = useState({ labels: [], datasets: [] });
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [weeklyIncome, setWeeklyIncome] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const bookings = await getBookingsByHotelId(user);
        const { totalRooms, availableRooms } = await getTotalAndAvailableRooms(user);

        setTotalBookings(bookings.length);

        const currentMonth = moment().month();
        const currentWeek = moment().week();
        
        const bookingsThisMonth = bookings.filter(booking =>
          moment(booking.checkInDate).month() === currentMonth
        ).length;

        const bookingsThisWeek = bookings.filter(booking =>
          moment(booking.checkInDate).week() === currentWeek
        ).length;

        setBookingsThisMonth(bookingsThisMonth);
        setBookingsThisWeek(bookingsThisWeek);
        setTotalRooms(totalRooms);
        setAvailableRooms(availableRooms);

        const roomTypeCounts = {};
        for (const booking of bookings) {
          const roomType = await getRoomTypeByBookingId(user, booking.id);
          if (roomType) {
            roomTypeCounts[roomType] = (roomTypeCounts[roomType] || 0) + 1;
          }
        }

        const labels = Object.keys(roomTypeCounts); 
        const data = Object.values(roomTypeCounts); 

        setRoomData({
          labels: labels,
          datasets: [
            {
              label: 'Room Popularity',
              data: data,
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
              hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
            }
          ]
        });

        const incomeCounts = {};
        const dailyIncomeCounts = {};
        const today = moment();

        for (let i = 0; i < 30; i++) {
          const day = today.clone().subtract(i, 'days').format('YYYY-MM-DD');
          incomeCounts[day] = 0;
          dailyIncomeCounts[day] = day; 
        }

        bookings.forEach(booking => {
          const checkInDate = moment(booking.checkInDate).format('YYYY-MM-DD');
          const checkInMonth = moment(booking.checkInDate).format('MMMM YYYY');
          
          if (incomeCounts[checkInDate] !== undefined) {
            incomeCounts[checkInDate] += booking.totalPrice;
          }
          
          if (checkInMonth === moment().format('MMMM YYYY')) {
            setMonthlyIncome(prev => prev + booking.totalPrice);
          }

          const startOfWeek = moment().startOf('week').format('YYYY-MM-DD');
          const endOfWeek = moment().endOf('week').format('YYYY-MM-DD');
          if (moment(checkInDate).isBetween(startOfWeek, endOfWeek, null, '[]')) {
            setWeeklyIncome(prev => prev + booking.totalPrice);
          }
        });

        const incomeLabels = Object.keys(dailyIncomeCounts).reverse();
        const dailyIncomeValues = incomeLabels.map(label => incomeCounts[label] || 0);

        setIncomeData({
          labels: incomeLabels,
          datasets: [{
            label: 'Daily Income',
            data: dailyIncomeValues,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        });

      } catch (error) {
        message.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);


  return (
    <div>
      <Typography.Title level={2} style={{ textAlign: 'left', marginBottom: '20px' }}>
        Dashboard
      </Typography.Title>
      {loading ? (
        <Spin size="large" />
      ) : (
        <>
          <Row gutter={16} style={{ marginBottom: '16px' }}>
            <Col span={8}>
              <Card
                title="Total Booking"
                bordered={false}
                style={{ height: '100%', position: 'relative' }}
              >
                <p>Total: {totalBookings}</p>
                <p>This Month: {bookingsThisMonth}</p>
                <p>This Week: {bookingsThisWeek}</p>
                <FaCalendarAlt
                  style={{
                    position: 'absolute',
                    bottom: 10,
                    right: 10,
                    fontSize: '24px',
                    color: '#1890ff',
                  }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card
                title="Total Rooms"
                bordered={false}
                style={{ height: '100%', position: 'relative' }}
              >
                <p>Total Rooms: {totalRooms}</p>
                <p>Available Rooms: {availableRooms}</p>
                <FaBed
                  style={{
                    position: 'absolute',
                    bottom: 10,
                    right: 10,
                    fontSize: '24px',
                    color: '#52c41a',
                  }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card
                title="Income"
                bordered={false}
                style={{ height: '100%', position: 'relative' }}
              >
                <p>Monthly Income: {monthlyIncome}</p>
                <p>Weekly Income: {weeklyIncome}</p>
                <FaMoneyBillWave
                  style={{
                    position: 'absolute',
                    bottom: 10,
                    right: 10,
                    fontSize: '24px',
                    color: '#f5222d',
                  }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={16}>
              <Card title="Daily Income Over Last 30 Days" bordered={false} style={{ height: '100%' }}>
                <Bar
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
            <Col span={8}>
              <Card title="Room Type Popularity" bordered={false} style={{ height: '100%' }}>
                <Doughnut
                  data={roomData}
                  options={{
                    cutout: '60%',
                    layout: {
                      padding: {
                        bottom: 30,
                      },
                    },
                    plugins: {
                      legend: {
                        display: true,
                        position: 'bottom', 
                        labels: {
                          generateLabels: (chart) => {
                            const data = chart.data;
                            return data.labels.map((label, i) => {
                              const value = data.datasets[0].data[i];
                              const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                              const percentage = total > 0 ? ((value / total) * 100).toFixed(2) : 0;

                              return {
                                text: `${label}: ${value} (${percentage}%)`,
                                fillStyle: data.datasets[0].backgroundColor[i],
                                hidden: false,
                                index: i,
                              };
                            });
                          },
                          color: '#000',
                          font: {
                            size: 12,
                            weight: 'bold',
                          },
                          boxWidth: 20, 
                          padding: 20, 
                        },
                      },
                      tooltip: {
                        callbacks: {
                          label: (tooltipItem) => {
                            const value = tooltipItem.raw;
                            const total = tooltipItem.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(2);
                            return `${tooltipItem.label}: ${value} (${percentage}%)`;
                          },
                        },
                      },
                    },
                    elements: {
                      arc: {
                        borderWidth: 5,
                      },
                    },
                  }}
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
