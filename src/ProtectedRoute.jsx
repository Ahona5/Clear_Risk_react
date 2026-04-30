import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requireAdmin }) => {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireAdmin) {
    const isAdmin = user.role === "admin" || user.role === "moderator";
    if (!isAdmin) {
      // Redirect standard users away from admin-only routes to the safe dashboard
      return <Navigate to="/dashboard" replace />; 
    }
  }

  return children;
};

export default ProtectedRoute;
