import React, { useEffect, useState, useRef } from 'react';
import { Typography, Spin, message, Row, Col, Card, Radio, Select } from 'antd';
import { Line } from 'react-chartjs-2';
// import { GoogleMap, Marker } from '@react-google-maps/api';
import { getTotalCustomers, getTotalUsers, getTotalHosts, getAllHotel, getBookings, getTransaction } from '../api/api';
import moment from 'moment';
import 'chart.js/auto';

const { Option } = Select;

const Dashboard = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalHosts, setTotalHosts] = useState(0);
  const [incomeData, setIncomeData] = useState({ labels: [], datasets: [] });
  const [adminFeeData, setAdminFeeData] = useState({ labels: [], datasets: [] });
  const [hotels, setHotels] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [viewType, setViewType] = useState("1 month");  
  const [adminViewType, setAdminViewType] = useState("1 month");
  const mapRef = useRef(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const customers = await getTotalCustomers();
      const users = await getTotalUsers();
      const hosts = await getTotalHosts();
      const allhotel = await getAllHotel();
      const transactionData = await getTransaction();
      
      setTotalCustomers(customers);
      setTotalUsers(users);
      setTotalHosts(hosts);
      setHotels(allhotel);
      setTransactions(transactionData.data?.formattedTransactions || []);
    } catch (error) {
      message.error('Failed to load admin dashboard data.');
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateChart = () => {
    const today = moment();
    const currentMonth = today.format('YYYY-MM');
    const labels =
      viewType === '1 month'
        ? Array.from({ length: 30 }, (_, i) =>
            today.clone().subtract(i, 'days').format('YYYY-MM-DD')
          ).reverse()
        : Array.from({ length: 12 }, (_, i) =>
            today.clone().subtract(i, 'months').format('YYYY-MM')
          ).reverse();

    const allIncomeData = hotels.map((hotel) => {
      const incomeCounts = labels.reduce((acc, label) => {
        acc[label] = 0;
        return acc;
      }, {});

      const hotelTransactions = transactions.filter(
        (transaction) =>
          transaction.roomId?.hotel?._id === hotel._id &&
          transaction.status === 'paid'
      );

      hotelTransactions.forEach((transaction) => {
        const transactionDate = moment(transaction.transactionDate);
        const key = viewType === '1 month'
          ? transactionDate.format('YYYY-MM-DD')
          : transactionDate.format('YYYY-MM');
        if (incomeCounts[key] !== undefined) {
          incomeCounts[key] += transaction.amount;
        }
      });

      return {
        label: `Hotel ${hotel.name}`,
        data: labels.map((label) => incomeCounts[label] || 0),
        fill: false,
        borderColor: '#' + Math.floor(Math.random() * 16777215).toString(16),
        tension: 0.3,
        ownerName: hotel.owner?.name,
      };
    });

    setIncomeData({ labels, datasets: allIncomeData });

    const adminFeeLabels = Array.from({ length: today.daysInMonth() }, (_, i) =>
      today.clone().date(i + 1).format('YYYY-MM-DD')
    );
    
    // Initialize datasets for adminFee with default values
    const adminFeeCounts = adminFeeLabels.reduce((acc, label) => {
      acc[label] = 0;
      return acc;
    }, {});
    
    transactions.forEach((transaction) => {
      const transactionDate = moment(transaction.transactionDate).format('YYYY-MM-DD');
      if (adminFeeCounts[transactionDate] !== undefined) {
        adminFeeCounts[transactionDate] += transaction.adminFee || 0;
      }
    });
    
    const currentMonthData = adminFeeLabels.map((label) => {
      const isFutureDate = moment(label).isAfter(today, 'day');
      return isFutureDate ? null : adminFeeCounts[label] || 0;
    });
    
    // Generate labels for the previous month
    const previousMonth = today.clone().subtract(1, 'month');
    const previousMonthLabels = Array.from({ length: previousMonth.daysInMonth() }, (_, i) =>
      previousMonth.clone().date(i + 1).format('YYYY-MM-DD')
    );
    
    // Initialize datasets for previous month's adminFee
    const previousMonthFeeCounts = previousMonthLabels.reduce((acc, label) => {
      acc[label] = 0;
      return acc;
    }, {});
    
    transactions.forEach((transaction) => {
      const transactionDate = moment(transaction.transactionDate).format('YYYY-MM-DD');
      if (previousMonthFeeCounts[transactionDate] !== undefined) {
        previousMonthFeeCounts[transactionDate] += transaction.adminFee || 0;
      }
    });
    
    const previousMonthData = previousMonthLabels.map((label) => {
      return previousMonthFeeCounts[label] || 0;
    });
    
    // Generate dataset for the chart
    const adminFeeDataSets = [
      {
        label: 'Admin Fee (Current Month)',
        data: currentMonthData,
        fill: false,
        borderColor: '#ff0000', // Red for the current month
        tension: 0.3,
        pointHoverBackgroundColor: '#ff0000',
        pointHoverBorderColor: '#ff0000',
        labels: adminFeeLabels, // Attach current month labels
      },
      {
        label: 'Admin Fee (Previous Month)',
        data: previousMonthData,
        fill: false,
        borderColor: '#0000ff', // Blue for the previous month
        tension: 0.3,
        pointHoverBackgroundColor: '#0000ff',
        pointHoverBorderColor: '#0000ff',
        labels: previousMonthLabels, // Attach previous month labels
      },
    ];
    
    // Update state with the generated dataset
    setAdminFeeData({
      labels: adminFeeLabels,
      datasets: adminFeeDataSets,
    });    
  };

  const initializeMap = (hotels) => {
    if (!window.google || !mapRef.current) {
      console.error("Google Maps API chưa được tải hoặc mapRef chưa khởi tạo.");
      return;
    }
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 16.047079, lng: 108.206230 },
      zoom: 5,
    });

    hotels.forEach((hotel) => {
      const { lat, Lng } = hotel.location || {};
      if (lat && Lng) {
        new window.google.maps.Marker({
          position: { lat: lat, lng: Lng },
          map,
          title: hotel.name,
        });
      } else {
        console.warn(`Skipping hotel "${hotel.name}" due to missing coordinates.`);
      }
    });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!loading && hotels.length > 0) {
      updateChart();
    }
  }, [viewType, hotels, transactions]);

  useEffect(() => {
    if (!loading && mapRef.current && hotels.length > 0) {
      initializeMap(hotels);
    }
  }, [loading, hotels]);

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

          <Row gutter={16} style={{ marginBottom: '16px' }}>
            <Col span={24}>
              <Card
                title="Admin Fee Overview"
                // extra={
                //   <Select value={adminViewType} onChange={(value) => setAdminViewType(value)}>
                //     <Option value="1 month">1 Month</Option>
                //     <Option value="1 year">1 Year</Option>
                //   </Select>
                // }
                bordered={false}
              >
                <Line
                  data={adminFeeData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: { beginAtZero: true, title: { display: true, text: 'Admin Fee' } },
                      x: {
                        title: { display: true, text: adminViewType === '1 month' ? 'Date' : 'Month' },
                        ticks: { autoSkip: true, maxTicksLimit: adminViewType === '1 month' ? 10 : 12 },
                      },
                    },
                    plugins: {
                      tooltip: {
                        callbacks: {
                          title: (tooltipItems) => {
                            // Show the exact date (customLabel) as the title
                            if (tooltipItems[0]) {
                              const dataset = tooltipItems[0].dataset;
                              const index = tooltipItems[0].dataIndex;
                              return dataset.labels ? dataset.labels[index] : '';
                            }
                            return '';
                          },
                          label: (tooltipItem) => {
                            const dataset = tooltipItem.dataset;
                            const value = tooltipItem.raw;
                            return `${dataset.label}: ${value}VND`;
                          },
                        },
                      },
                    },
                  }}
                  height={400}
                />
              </Card>
            </Col>
            </Row>


          <Row gutter={16} style={{ marginBottom: '16px' }}>
            <Col span={24}>
              <Card
                title={"Income Over"}
                extra={
                  <Select value={viewType} onChange={(value) => setViewType(value)}>
                    <Option value="1 month">1 Month</Option>
                    <Option value="1 year">1 Year</Option>
                  </Select>
                }
                bordered={false}
              >
                <Line
                  data={incomeData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: { beginAtZero: true, title: { display: true, text: 'Income' } },
                      x: {
                        title: { display: true, text: viewType === '1 month' ? 'Date' : 'Month' },
                        ticks: { autoSkip: true, maxTicksLimit: viewType === '1 month' ? 10 : 12 },
                      },
                    },
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: (tooltipItem) => {
                            const dataset = tooltipItem.dataset;
                            const value = tooltipItem.raw;
                            return `${dataset.label}: ${value}VND)`;
                          },
                        },
                      },
                      legend: { display: true, position: 'top' },
                    },
                  }}
                  height={400}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Card title="Hotel Map" style={{ height: '500px' }}>
                <div
                  ref={mapRef}
                  style={{ width: '100%', height: '400px' }}
                ></div>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default Dashboard;