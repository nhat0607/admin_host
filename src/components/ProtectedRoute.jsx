import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, user }) => {
  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.status === 'Ban') {
    return <Navigate to="/banned" />;
  }

  return children;
};

export default ProtectedRoute;
