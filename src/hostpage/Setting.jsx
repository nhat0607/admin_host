import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Upload, message, Modal, Carousel } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { addMediaHotel, deleteMediaHotel, getHotelByHost, updateHotelByHost } from '../api/api';
import './Setting.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from 'react-slick'; // Import Slider

const Setting = ({ user }) => {
  // console.log(user);
  const [form] = Form.useForm();
  const [hotel, setHotelData] = useState(null);
  const [logo, setLogo] = useState(null);
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [city, setCity] = useState(''); 
  const [country, setCountry] = useState(''); 
  const [media, setMedia] = useState([]);
  const mapRef = useRef(null); // Reference for the map
  const [currentHotelMedia, setCurrentHotelMedia] = useState([]);


  if (!user) {
    return <div>Access denied: You must be logged in to view this page.</div>;
  }

  useEffect(() => {
    const fetchHotelData = async () => {
      try {
        const hotel = await getHotelByHost(user._id);
        console.log(hotel);
        if (hotel) {
          form.setFieldsValue({
            hotelName: hotel[0].name,
            hotelAddress: `${hotel[0].location.city}, ${hotel[0].location.country}`,
          });
          const lat = hotel[0].location.lat || 0;
          const lng = hotel[0].location.Lng || 0;
          setLatitude(lat);
          setLongitude(lng);
          setCity(hotel[0].location.city);
          setCountry(hotel[0].location.city);
          initializeMap(lat, lng); // Initialize map
          setHotelData(hotel);
          setCurrentHotelMedia(hotel[0].media || []); // Load media from hotel data
        }
      } catch (error) {
        message.error(`Failed to: ${error.message || error.toString()}`);
      }
      // setHotelData(hotel[0]);
    };
    fetchHotelData();
  }, [form, user]);

  const initializeMap = (lat, lng) => {
    const google = window.google; // Google Maps API
    if (!google) return;
  
    const map = new google.maps.Map(mapRef.current, {
      center: { lat, lng },
      zoom: 15,
    });
    
    const geocoder = new google.maps.Geocoder(); 

    const marker = new google.maps.Marker({
      position: { lat, lng },
      map,
      draggable: true, // Allow dragging
    });

    const getAddressFromLatLng = (lat, lng) => {
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const addressComponents = results[0].address_components;
          const city =
          addressComponents.find((comp) => comp.types.includes('locality'))?.long_name ||
          addressComponents.find((comp) => comp.types.includes('administrative_area_level_1'))?.long_name ||
          addressComponents.find((comp) => comp.types.includes('sublocality'))?.long_name ||
          '';
          const country = addressComponents.find((comp) => comp.types.includes('country'))?.long_name || '';
          const removeDiacritics = (str) => {
            return str
                .normalize('NFD') // Phân tách ký tự và dấu
                .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu
                .replace(/đ/g, 'd') // Xử lý riêng ký tự 'đ'
                .replace(/Đ/g, 'D'); // Xử lý riêng ký tự 'Đ'
          };
          
          const cityWithoutDiacritics = removeDiacritics(city);
          const countryWithoutDiacritics = removeDiacritics(country);
          
          console.log(`City: ${cityWithoutDiacritics}, Country: ${countryWithoutDiacritics}`);
            setCity(cityWithoutDiacritics);
          setCountry(countryWithoutDiacritics);
        } else {
          console.error('Geocoder failed due to:', status);
        }
      });
    };
    // Update latitude and longitude when marker is dragged
    marker.addListener('dragend', () => {
      const position = marker.getPosition();
      setLatitude(position.lat());
      setLongitude(position.lng());
      getAddressFromLatLng(position.lat(), position.lng());
    });

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Search for an address...';
    input.style.width = '300px';
    input.style.margin = '10px';
    input.style.padding = '5px';
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);
  
    // Initialize Autocomplete
    const autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);
  
    // // Add input field to the map
    // // map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(inputDiv);
  
    // // Use Geocoder for address lookup
    // // const geocoder = new google.maps.Geocoder();
  
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) {
        alert("No details available for the input: '" + place.name + "'");
        return;
      }
  
      map.setCenter(place.geometry.location);
      map.setZoom(15);
      marker.setPosition(place.geometry.location);
  
      setLatitude(place.geometry.location.lat());
      setLongitude(place.geometry.location.lng());
    });
  
    // Create a button for navigating to Google Maps
    const buttonDiv = document.createElement('div');
    buttonDiv.style.margin = '10px';
    buttonDiv.style.padding = '10px';
    buttonDiv.style.backgroundColor = '#fff';
    buttonDiv.style.border = '2px solid #ccc';
    buttonDiv.style.borderRadius = '50%';
    buttonDiv.style.cursor = 'pointer';
    buttonDiv.style.display = 'flex';
    buttonDiv.style.alignItems = 'center';
    buttonDiv.style.justifyContent = 'center';
    buttonDiv.style.width = '40px';
    buttonDiv.style.height = '40px';
    buttonDiv.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.3)';
  
    // Add an icon (Google Maps marker icon)
    buttonDiv.innerHTML = `
      <img
        src="https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi-dotless_hdpi.png"
        alt="Google Maps"
        style="width: 24px; height: 24px;"
      />
    `;
  
    // Tooltip on hover
    buttonDiv.title = 'Open in Google Maps';
  
    // Open Google Maps on click
    buttonDiv.onclick = () => {
      const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      window.open(googleMapsUrl, '_blank');
    };
  
    // Add the button to the map
    map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(buttonDiv);
  };
  

  const handleLogoUpload = (file) => {
    setLogo(file);
    return false;
  };

  const handleSubmit = async (values) => {
    try {
        const lat = latitude;
        const Lng = longitude;

        // Tạo đối tượng JSON để gửi
        const updatedData = {
            hotelId: hotel[0]._id,
            name: values.hotelName,
            location: JSON.stringify({
              city: city || '',
              country: country || '',
              lat,
              Lng,
            }),
            amenities: ['Wifi, Balcony, Pool'],
            rating: hotel[0].rating,
            rooms: hotel[0].rooms,
            owner: user._id,
            media: values.files?.map(file => ({
                name: file.name,
                type: file.type,
                size: file.size,
            })), // Nếu có media
        };

        console.log(updatedData);

        // Gửi dữ liệu qua API
        const response = await updateHotelByHost(hotel[0]._id, updatedData);

        message.success('Hotel information updated successfully!');
    } catch (error) {
        console.error(error);
        message.error('Failed to update hotel information.');
    }
};


const handleUploadHotelMedia = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const response = await addMediaHotel(hotel[0]._id, [file]); // Gửi file lên server
    const updatedMedia = response.data.media; // Nhận danh sách media đã cập nhật từ server
    setCurrentHotelMedia(updatedMedia); // Cập nhật state
    message.success(response.data.message);
  } catch (error) {
    console.error('Error uploading file:', error);
    message.error(error.message);
  } finally {
    event.target.value = ''; // Reset input
  }
};

const handleDeleteHotelMediaConfirm = (mediaUrl) => {
  Modal.confirm({
    title: 'Delete Media',
    content: 'Are you sure you want to delete this media?',
    okText: 'OK',
    cancelText: 'Cancel',
    onOk: () => handleDeleteHotelMedia(mediaUrl),
  });
};

const handleDeleteHotelMedia = async (mediaUrl) => {
  try {
    const fileName = mediaUrl.split('/').pop(); // Trích xuất tên file
    const response = await deleteMediaHotel(hotel[0]._id, fileName); // Gửi request xóa
    message.success(response.message);
    setCurrentHotelMedia((prev) => prev.filter((item) => item !== mediaUrl)); // Cập nhật state
  } catch (error) {
    console.error('Error deleting media:', error);
    message.error(error.message);
  }
};

  return (
    <div className="Setting-page">
      <div className="Setting-container">


        <div className="content">
          <h3>General Setting</h3>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label="Hotel Name"
              name="hotelName"
              rules={[{ required: true, message: 'Please input your hotel name!' }]}
            >
              <Input placeholder="Enter hotel name" />
            </Form.Item>

            {/* <Form.Item
              label="Hotel Address (City, Country)"
              name="hotelAddress"
              rules={[{ required: true, message: 'Please input your hotel address!' }]}
            >
              <Input
                placeholder="Enter hotel address, city, country"
                onBlur={(e) => {
                  const [city, country] = e.target.value.split(',').map((part) => part.trim());
                  if (city && country) {
                    // Use dummy coordinates for demo purposes
                    setLatitude(37.7749); // Dummy latitude
                    setLongitude(-122.4194); // Dummy longitude
                    initializeMap(37.7749, -122.4194);
                  }
                }}
              />
            </Form.Item> */}
            <Form.Item
              label="Hotel Location"
              name="hotelAddress"
              rules={[{ required: true, message: 'Please input your hotel address!' }]}
            >
              <div className="map-container" ref={mapRef}>
              </div>
            </Form.Item>
            {/* <div className="map-container">
              <h4>Hotel Location</h4>
              <div ref={mapRef} className="map-preview" style={{ height: '400px', width: '100%' }} />
            </div> */}
            <Form.Item label="Upload Images/Videos">
              <div>
                <div style={{ textAlign: 'right', marginBottom: '10px' }}>
                  <Button
                    icon={<UploadOutlined />}
                    onClick={() => document.getElementById('upload-hotel-media-input').click()}
                  >
                    Upload Media
                  </Button>
                  <input
                    id="upload-hotel-media-input"
                    type="file"
                    accept="image/*,video/*"
                    style={{ display: 'none' }}
                    onChange={handleUploadHotelMedia}
                  />
                </div>

                <Carousel
                  autoplay
                  dots
                  arrows
                  effect="fade"
                  autoplaySpeed={5000}
                >
                  {currentHotelMedia.length > 0 ? (
                    currentHotelMedia.map((item, index) => {
                      const mediaUrl = `http://localhost:5000${item}`;
                      const isVideo = item.endsWith('.mp4') || item.endsWith('.webm');
                      return (
                        <div key={index} style={{ position: 'relative', textAlign: 'center' }}>
                          {isVideo ? (
                            <video src={mediaUrl} controls className="modal-video" />
                          ) : (
                            <img src={mediaUrl} alt={`media-${index}`} className="modal-image" />
                          )}
                          <div
                            className="delete-overlay"
                            onClick={() => handleDeleteHotelMediaConfirm(item)}
                          >
                            <DeleteOutlined style={{ fontSize: 24, color: 'red' }} />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div
                      style={{
                        height: '200px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: '#f0f0f0',
                        border: '1px dashed #d9d9d9',
                      }}
                    >
                      <img
                        src="https://via.placeholder.com/200x200?text=No+Image"
                        alt="No Media"
                        className="modal-image"
                      />
                    </div>
                  )}
                </Carousel>
              </div>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save Setting
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Setting;
