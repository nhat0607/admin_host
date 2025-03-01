import React, { useEffect, useState } from 'react';
import { Typography, Spin, message, Row, Col, Card, Select } from 'antd';
import { FaCalendarAlt, FaBed, FaMoneyBillWave } from 'react-icons/fa';
import { Doughnut, Bar } from 'react-chartjs-2';
import { getBookingsByHotelId, getHotelByHost, getTransactionbyHost } from '../api/api';
import moment from 'moment';
import 'chart.js/auto';

const Dashboard = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [bookingsThisMonth, setBookingsThisMonth] = useState(0);
  const [bookingsThisWeek, setBookingsThisWeek] = useState(0);
  const [totalRooms, setTotalRooms] = useState(0);
  const [availableRooms, setAvailableRooms] = useState(0);
  const [roomData, setRoomData] = useState(null);
  const [incomeData, setIncomeData] = useState({ labels: [], datasets: [] });
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [weeklyIncome, setWeeklyIncome] = useState(0);
  const [view, setView] = useState("1 month");
  const [viewCircle, setViewCircle] = useState("1 week");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log(user);
        const hotel = await getHotelByHost(user._id);
        console.log(hotel);
        const hotelId = hotel[0]._id;
        const transactionData = await getTransactionbyHost();
        const totalBalance = transactionData.data?.balance;
        setTotalBalance(totalBalance);
        const transactionHost = transactionData.data?.transactions || []
        console.log(transactionHost);
        localStorage.setItem('hotelId', hotelId);
        const bookings = await getBookingsByHotelId(user);
        console.log(bookings);
        // const { totalRooms, availableRooms } = await getTotalAndAvailableRooms(user);

        setTotalBookings(transactionHost.length);

        const bookingsThisMonth = transactionHost.filter(transaction =>
          moment(transaction.transactionDate).isSame(moment(), 'month')
        ).length;

        const bookingsThisWeek = transactionHost.filter(transaction =>
          moment(transaction.transactionDate).isSame(moment(), 'week')
        ).length;

        setBookingsThisMonth(bookingsThisMonth);
        setBookingsThisWeek(bookingsThisWeek);
        // setTotalRooms(totalRooms);
        // setAvailableRooms(availableRooms);

        let filteredBookings;

        switch (viewCircle) {
          case '1 week':
            filteredBookings = transactionHost.filter(transaction =>
              moment(transaction.transactionDate).isSame(moment(), 'week')
            );
            break;
          case '1 month':
            filteredBookings = transactionHost.filter(transaction =>
              moment(transaction.transactionDate).isSame(moment(), 'month')
            );
            break;
          case '1 year':
            filteredBookings = transactionHost.filter(transaction =>
              moment(transaction.transactionDate).isSame(moment(), 'year')
            );
            break;
          default:
            filteredBookings = transactionHost; 
        }
        console.log(filteredBookings);
        const roomTypeCounts = {};
        for (const transaction of filteredBookings) {
          const roomType = transaction.roomId?.roomType;
          if (roomType) {
            roomTypeCounts[roomType] = (roomTypeCounts[roomType] || 0) + 1;
          }
        }
    
        const labels = Object.keys(roomTypeCounts);
        const data = Object.values(roomTypeCounts);
        if (data.length === 0) {
          setRoomData(null); 
        } else {
          setRoomData({
            labels: labels,
            datasets: [
              {
                label: `Room Popularity (${viewCircle})`,
                data: data,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
              },
            ],
          });
        }

        let incomeCounts = {};
        let labelsForChart = [];

        if (view === "1 month") {
          // Last 30 days data
          const today = moment();
          labelsForChart = Array.from({ length: 30 }, (_, i) =>
            today.clone().subtract(i, 'days').format('YYYY-MM-DD')
          ).reverse();

          incomeCounts = labelsForChart.reduce((acc, date) => ({ ...acc, [date]: 0 }), {});
          
          transactionHost.forEach(transaction => {
            const transactionDate = moment(transaction.transactionDate).format('YYYY-MM-DD');
            if (incomeCounts[transactionDate] !== undefined) {
              incomeCounts[transactionDate] += transaction.hostAmount;
            }
          });
          
        } else if (view === "1 year") {
          // Last 12 months data
          const today = moment();
          labelsForChart = Array.from({ length: 12 }, (_, i) =>
            today.clone().subtract(i, 'months').format('MMMM YYYY')
          ).reverse();

          incomeCounts = labelsForChart.reduce((acc, month) => ({ ...acc, [month]: 0 }), {});

          transactionHost.forEach(transaction => {
            const transactionMonth = moment(transaction.transactionDate).format('MMMM YYYY');
            if (incomeCounts[transactionMonth] !== undefined) {
              incomeCounts[transactionMonth] += transaction.hostAmount;
            }
          });
        }

        const incomeValues = labelsForChart.map(label => incomeCounts[label] || 0);
        // console.log(incomeValues);

        setIncomeData({
          labels: labelsForChart,
          datasets: [{
            label: view === "1 month" ? 'Daily Income' : 'Monthly Income',
            data: incomeValues,
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
  }, [user, view, viewCircle]);


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
            {/* Total Booking Card */}
            <Col span={8}>
              <Card
                title="Total Booking"
                bordered={false}
                style={{
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  position: 'relative',
                }}
              >
                <div>
                  <p style={{ fontSize: '36px', margin: 0, fontWeight: 'bold', color: '#06b3c4' }}>
                    {totalBookings}
                  </p>
                  <FaCalendarAlt
                    style={{
                      fontSize: '24px',
                      color: '#06b3c4',
                      marginTop: '8px',
                    }}
                  />
                </div>
              </Card>
            </Col>

            {/* Total Balance Card */}
            <Col span={8}>
              <Card
                title="Total Balance"
                bordered={false}
                style={{
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  position: 'relative',
                }}
              >
                <div>
                  <p style={{ fontSize: '36px', margin: 0, fontWeight: 'bold', color: '#52c41a' }}>
                    {totalBalance.toLocaleString()}
                  </p>
                  <FaMoneyBillWave
                    style={{
                      fontSize: '24px',
                      color: '#52c41a',
                      marginTop: '8px',
                    }}
                  />
                </div>
              </Card>
            </Col>

            {/* <Col span={8}>
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
            </Col> */}
          </Row>

          <Row gutter={16}>
          <Col span={16}>
              <Card
                title="Income Over"
                extra={
                  <Select defaultValue="1 month" onChange={value => setView(value)}>
                    <Option value="1 month">1 Month</Option>
                    <Option value="1 year">1 Year</Option>
                  </Select>
                }
                bordered={false}
                style={{ height: '100%' }}
              >
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
                          text: view === "1 month" ? 'Date' : 'Month',
                        },
                      },
                    },
                  }}
                  height={400}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card
                title="Room Type Popularity"
                extra={
                  <Select defaultValue="1 week" onChange={(value) => setViewCircle(value)}>
                    <Option value="1 week">1 Week</Option>
                    <Option value="1 month">1 Month</Option>
                    <Option value="1 year">1 Year</Option>
                  </Select>
                }
                bordered={false}
                style={{ height: '100%' }}
              >
                {roomData && roomData.datasets && roomData.datasets[0].data.length > 0 ? (
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
                          borderWidth: '0',
                        },
                      },
                    }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <p style={{ fontSize: '16px', color: '#888' }}>No Data</p>
                  </div>
                )}
              </Card>
            </Col>

          </Row>
        </>
      )}
    </div>
  );
};

export default Dashboard;
