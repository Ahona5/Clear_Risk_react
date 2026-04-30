import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Profile from "./Profile";
import UserProfile from "./UserProfile";
import Users from "./Users";
import Activity from "./Activity";
import RiskDetail from "./RiskDetail";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        
        {/* Standard User Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/risk-profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/risk/:id" element={<ProtectedRoute><RiskDetail /></ProtectedRoute>} />
        
        {/* Admin-Only Protected Routes */}
        <Route path="/users" element={<ProtectedRoute requireAdmin={true}><Users /></ProtectedRoute>} />
        <Route path="/activity" element={<ProtectedRoute requireAdmin={true}><Activity /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;