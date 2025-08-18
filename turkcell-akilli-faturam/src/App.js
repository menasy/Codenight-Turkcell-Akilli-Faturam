import "./App.css";
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import { UserProvider } from "./context/UserContext";
import { AppProvider } from "./context/AppContext";

// Protected Route Component
function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('currentUser');
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Public Route Component (redirect if already logged in)
function PublicRoute({ children }) {
  const isAuthenticated = localStorage.getItem('currentUser');
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <div className="App min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <AppProvider>
        <UserProvider>
          <Router>
            <Routes>
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/" 
                element={<Navigate to="/login" replace />} 
              />
              <Route 
                path="*" 
                element={<Navigate to="/login" replace />} 
              />
            </Routes>
          </Router>
        </UserProvider>
      </AppProvider>
    </div>
  );
}

export default App;
