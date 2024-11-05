import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Form } from 'antd';
import { login } from '../api/api';

const Login = ({ setUser }) => {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    const { email, password } = values;

    const user = await login(email, password);
    if (user) {
      setUser(user);
      if (user.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (user.role === 'host') {
        navigate('/host-dashboard');
      } else {
        navigate('/user-dashboard');
      }
    } else {
      setError('Incorrect email or password');
    }
  };

  return (
    <div className="login-container" style={{ padding: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Form onFinish={handleLogin} className="login-form" style={{ width: '300px' }}>
        <Form.Item name="email" rules={[{ required: true, message: 'Please enter your email' }]}>
          <Input placeholder="Email" />
        </Form.Item>
        <Form.Item name="password" rules={[{ required: true, message: 'Please enter your password' }]}>
          <Input.Password placeholder="Password" />
        </Form.Item>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
            Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
