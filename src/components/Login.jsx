import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, Form, Typography, message } from 'antd';
import { login, resetpassword } from '../api/api';
import { ArrowLeftOutlined } from '@ant-design/icons';
import './style/Login.css';

const { Title } = Typography;

const Login = ({ setUser }) => {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [showForgotPasswordForm, setShowForgotPasswordForm] = useState(false);

  const handleLogin = async (values) => {
    const { email, password } = values;

    try {
      const user = await login(email, password);
      // console.log(user);
      if (user) {
        setUser(user.data);
        console.log(user);
        if (user.data?.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (user.data?.role === 'hotelOwner') {
          navigate('/host/dashboard');
        } else if (user.data?.role === 'user') {
          navigate('/user/dashboard');
        } else {
          message.error(user.message);
        }
      } else {
        setError(user.message);
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPasswordForm(true); // Show forgot password form
  };

  const handleBack = () => {
    setShowForgotPasswordForm(false); // Go back to login form
  };

  const handleResetPassword = async (values) => {
    const { email } = values;

    try {
      await resetpassword(email); // Call resetpassword API
      message.success('A new password has been sent to your email.');
      setShowForgotPasswordForm(false); // Go back to login form on success
    } catch (err) {
      message.error('Failed to reset password. Please try again.');
    }
  };

  return (
    <div className="login-container">
      {showForgotPasswordForm ? (
        <Form onFinish={handleResetPassword} className="forgot-password-form">
          <div className="forgot-password-header">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
              className="back-button"
            />
          </div>
          <div className="forgot-password-content">
            <Title>Reset your password</Title>
            <p className="help-text">
              Enter your email address and we’ll send you an email with a new password.
            </p>
            <Form.Item
              name="email"
              rules={[{ required: true, message: 'Please enter your email' }]}
            >
              <Input placeholder="Email" className="input-field" />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="login-button"
                style={{ marginTop: 100 }}
              >
                Reset password
              </Button>
            </Form.Item>
          </div>
        </Form>
      ) : (
        <Form onFinish={handleLogin} className="login-form">
          <div className="title">
            <span
              style={{
                color: '#223864',
                fontSize: '2rem',
                fontWeight: 'bold',
                fontFamily: 'Arial, sans-serif',
              }}
            >
              Stay
            </span>
            <span style={{ fontSize: '2rem', fontFamily: 'Arial, sans-serif' }}>
              Finder
            </span>
          </div>
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Please enter your email' }]}
          >
            <Input placeholder="Email" className="input-field" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password placeholder="Password" className="input-field" />
          </Form.Item>
          <div className="login-links">
            <Link className="forgot-password-link" onClick={handleForgotPassword}>
              Forgot password?
            </Link>
            <p className="signup-link">
              New to this site? <Link to="/signup-hotel">Sign Up</Link>
            </p>
          </div>
          {error && <p className="error-text">{error}</p>}
          <Form.Item>
            <Button type="primary" htmlType="submit" className="login-button">
              Log In
            </Button>
          </Form.Item>
        </Form>
      )}
    </div>
  );
};

export default Login;
