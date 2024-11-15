
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './style/BannedPage.css'; 

const BannedPage = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate("/");
  };

  return (
    <div className="banned-container">
      <h1>Access Denied</h1>
      <p>Your account has been banned. Please contact support if you believe this is a mistake.</p>
      <button onClick={handleGoBack} className="go-back-button">Go Back to Login</button>
    </div>
  );
};

export default BannedPage;
