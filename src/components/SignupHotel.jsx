import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, Form, message } from 'antd';
import { signup, sendVerificationCode } from '../api/api';
import { ArrowLeftOutlined } from '@ant-design/icons';
import './style/Signup.css';

const SignUpHotelOwner = () => {
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); 
  const [userInfo, setUserInfo] = useState({}); 
  const [latitude, setLatitude] = useState(16.047079); 
  const [longitude, setLongitude] = useState(108.206230);  
  const [city, setCity] = useState(''); 
  const [country, setCountry] = useState(''); 
  const mapRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (step === 2) {
      initializeMap(latitude, longitude);
    }
  }, [step]);

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
      draggable: true,
    });
  
    // Reverse geocoding function
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
  
    // Get address when marker is dragged
    marker.addListener('dragend', () => {
      const position = marker.getPosition();
      setLatitude(position.lat());
      setLongitude(position.lng());
      getAddressFromLatLng(position.lat(), position.lng());
    });
  
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Search for an address...';
    input.style.width = '150px';
    input.style.margin = '15px';
    input.style.padding = '5px';
    map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(input);
  
    const autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);
  
    // Get address when a place is selected
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
      getAddressFromLatLng(place.geometry.location.lat(), place.geometry.location.lng());
    });
  };

  const handleUserInfoSubmit = (values) => {
    setUserInfo(values); // Save user info to state
    setStep(2); // Move to step 2
  };

  const handleHotelInfoSubmit = async (values) => {
    const { hotelName, amenities } = values;
    console.log(city);
    console.log(country);
    console.log(latitude);
    console.log(longitude);
    try {
      const response = await signup({
        ...userInfo, // Include user info
        role: 'hotelOwner',
        hotel: {
          name: hotelName,
          location: {
            city: city, // No city value required
            country: country, // No country value required
            lat: latitude,
            Lng: longitude,
          },
          amenities: amenities ? amenities.split(',') : [],
          rating: '5.0',
        },
      });

      if (response.success) {
        // Trigger email verification
        await sendVerificationCode(userInfo.email);
        navigate('/verify-email', { state: { email: userInfo.email } });
      } else {
        setError(response.message || 'Failed to create account');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    }
  };

  const handleBack = () => {
    setStep(1); // Go back to user information form
  };

  return (
    <div className="signup-container">
      <Form
        onFinish={step === 1 ? handleUserInfoSubmit : handleHotelInfoSubmit}
        className="signup-form"
      >
        {step === 2 && (
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            className="back-button"
          />
        )}
        <h2>{step === 1 ? 'Sign Up as Hotel Owner' : 'Hotel Information'}</h2>
        {step === 1 && (
          <>
            <Form.Item
              name="name"
              rules={[{ required: true, message: 'Please enter your name' }]}
            >
              <Input placeholder="Your Name" className="input-field" />
            </Form.Item>
            <Form.Item
              name="email"
              rules={[{ required: true, message: 'Please enter your email' }]}
            >
              <Input placeholder="Your Email" className="input-field" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Please enter your password' },
                { min: 6, message: 'Password must be at least 6 characters' },
              ]}
            >
              <Input.Password placeholder="Password" className="input-field" />
            </Form.Item>
            <Form.Item
              name="country"
              rules={[{ required: true, message: 'Please enter your country' }]}
            >
              <Input placeholder="Your Country" className="input-field" />
            </Form.Item>
            <Form.Item
              name="phonenumber"
              rules={[{ required: true, message: 'Please enter your phone number' }]}
            >
              <Input placeholder="Your Phone Number" className="input-field" />
            </Form.Item>
          </>
        )}
        {step === 2 && (
          <>
            <Form.Item
              name="hotelName"
              rules={[{ required: true, message: 'Please enter your hotel name' }]}
            >
              <Input placeholder="Hotel Name" className="input-field" />
            </Form.Item>
            <Form.Item>
              <div className="map-container">
                <div ref={mapRef} className="map-preview" style={{ height: '100%', width: '100%' }} />
              </div>
            </Form.Item>
            <Form.Item name="amenities">
              <Input placeholder="Amenities (comma-separated, e.g., WiFi, Pool, Gym)" className="input-field" style = {{paddingTop: 15}} />
            </Form.Item>
          </>
        )}
        {error && <p className="error-text">{error}</p>}
        <Form.Item>
          <Button type="primary" htmlType="submit" className="signup-button">
            {step === 1 ? 'Continue' : 'Sign Up'}
          </Button>
        </Form.Item>
        {step === 1 && (
          <p className="signup-link">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        )}
      </Form>
    </div>
  );
};

export default SignUpHotelOwner;
