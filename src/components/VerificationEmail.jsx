import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Input, Form } from 'antd';
import { verifyEmail, sendVerificationCode } from '../api/api'; // API functions
import './style/Verify.css'

const VerifyEmail = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(60); // Countdown for resend
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setIsResendDisabled(false);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerification = async (values) => {
    const { code } = values;

    try {
      const response = await verifyEmail({ email, code });
      if (response.success) {
        setSuccess('Email verified! Please wait for admin approval.');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(response.message || 'Invalid verification code');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    }
  };

  const handleResend = async () => {
    try {
      setError('');
      setSuccess('');
      setIsResendDisabled(true);
      setCountdown(60); // Reset countdown
      const response = await sendVerificationCode(email);
      if (response.success) {
        setSuccess('Verification email resent successfully.');
      } else {
        setError(response.message || 'Failed to resend verification email');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while resending email');
    }
  };

  return (
    <div className="verify-container">
      <Form onFinish={handleVerification} className="verify-form">
        <h2>Verify Your Email</h2>
        <p>Please enter the verification code sent to {email}</p>
        <Form.Item name="code" rules={[{ required: true, message: 'Please enter the verification code' }]}>
          <Input placeholder="Verification Code" style={{marginBottom: 20}}/>
        </Form.Item>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: '48%' }} className="btn-verify">
            Verify
          </Button>
          <Button
            type="link"
            onClick={handleResend}
            disabled={isResendDisabled}
            style={{ width: '48%' }}
            className="btn-verify"
            >
            Resend Code {isResendDisabled && `(${countdown}s)`}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default VerifyEmail;
