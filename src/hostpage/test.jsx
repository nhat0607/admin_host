import React, { useEffect, useState, useRef } from 'react';
import { Typography, Spin, message, Row, Col, Card, Radio, Select } from 'antd';
import { Line } from 'react-chartjs-2';
// import { GoogleMap, Marker } from '@react-google-maps/api';
import { getTotalCustomers, getTotalUsers, getTotalHosts, getAllHotel, getBookings } from '../api/api';
import moment from 'moment';
import 'chart.js/auto';

const Dashboard = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(5); // Initialize zoom level
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalHosts, setTotalHosts] = useState(0);
  const [incomeData, setIncomeData] = useState({ labels: [], datasets: [] });
  const [hotels, setHotels] = useState([]); // Lưu thông tin khách sạn
  const [viewType, setViewType] = useState("1 month"); // default to 1 month view
  const mapRef = useRef(null); // Ref for the map

  const mapContainerStyle = {
    width: '100%',
    height: '400px',
  };

  const center = {
    lat: 16.047079, // Center of Vietnam
    lng: 108.206230,
  };

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

        const allhotel = await getAllHotel();
        console.log(allhotel);
        // console.log(filteredHostArray);
        // const hostArray = await getHost(user);
        // const filteredHostArray = hostArray.filter(host => host.status !== 'Ban'); 
        let allIncomeData = [];
        initializeMap(allhotel);
        const today = moment();

        // Set labels based on viewType
        const labels = viewType === '1 month'
          ? Array.from({ length: 30 }, (_, i) =>
              today.clone().subtract(i, 'days').format('YYYY-MM-DD')
            ).reverse()
          : Array.from({ length: 12 }, (_, i) =>
              today.clone().subtract(i, 'months').format('YYYY-MM')
            ).reverse();

        for (const hotel of allhotel) {
          const bookings = await getBookings(hotel._id);
          const incomeCounts = Array(labels.length).fill(0);

          bookings.forEach(booking => {
            const checkInDate = moment(booking.checkInDate);
              
            if (viewType === '1 month') {
              const daysAgo = today.diff(checkInDate, 'days');
              if (daysAgo >= 0 && daysAgo < 30) {
                incomeCounts[29 - daysAgo] += booking.totalPrice;
              }
            } else if (viewType === '1 year') {
              const monthsAgo = today.diff(checkInDate, 'months');
              if (monthsAgo >= 0 && monthsAgo < 12) {
                incomeCounts[11 - monthsAgo] += booking.totalPrice;
              }
            }
          });

          const dataset = {
            label: `Hotel ${hotel.name}`, 
            data: incomeCounts, 
            fill: false,
            borderColor: '#' + Math.floor(Math.random() * 16777215).toString(16), 
            tension: 0.3,
            ownerName: hotel.owner?.name, 
          };

          allIncomeData.push(dataset);       
        }
        setHotels(allhotel);
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


  const initializeMap = (hotel) => {
    if (!mapRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 10.762622, lng: 106.660172 }, // Default center
        zoom: 12,
    });

    locations.forEach((hotel) => {
        new window.google.maps.Marker({
            position: { lat: hotel.location?.latitude, lng: hotel.location?.longitude },
            map,
            title: hotel.name,
        });
    });
};

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
                title={"Income Over"}
                extra= {
                  <Select defaultValue="1 month" onChange={(value) => setViewType(value)}>
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
                      y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Income' },
                      },
                      x: {
                        title: { display: true, text: viewType === '1 month' ? 'Date' : 'Month' },
                        ticks: {
                          autoSkip: true,
                          maxTicksLimit: viewType === '1 month' ? 10 : 12,
                          stepSize: 3,
                        },
                      },
                    },
                    plugins: {
                      tooltip: {
                        enabled: true, 
                        callbacks: {
                          label: (tooltipItem) => {
                            const dataset = tooltipItem.dataset;
                            const value = tooltipItem.raw;
                            const ownerName = dataset.ownerName; 
                            return `${dataset.label}: $${value} (Owner: ${ownerName})`;
                          },
                        },
                      },
                      legend: {
                        display: true,
                        position: 'top',
                      },
                    },
                  }}
                  height={400}
                />
              </Card>
            </Col>
            <Col span={24}>
              <Card title="Hotel Map" style={{ height: '500px' }}>
                {/* Map container */}
                <div
                  ref={mapRef}
                  style={{ width: '100%', height: '100%' }}
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
