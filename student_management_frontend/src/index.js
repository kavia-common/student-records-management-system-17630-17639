import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Homepage from './Homepage';
import AddStudent from './AddStudent';
import ViewStudents from './ViewStudents';
import EditStudent from './EditStudent';
import NavBar from './NavBar';
import Analytics from './Analytics';

import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';

// Wrapper for passing navigation handlers to AddStudent/EditStudent components
function AddStudentWithNav() {
  const navigate = useNavigate();
  return <AddStudent onSuccessNav={() => navigate("/dashboard")} />;
}
function EditStudentWithNav() {
  const { id } = useParams();
  const navigate = useNavigate();
  return <EditStudent studentId={id} onSuccessNav={() => navigate("/dashboard")} />;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/dashboard" element={<ViewStudents />} />
        <Route path="/students" element={<Navigate to="/dashboard" replace />} />
        <Route path="/add" element={<AddStudentWithNav />} />
        <Route path="/edit/:id" element={<EditStudentWithNav />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="*" element={
          <div style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#fff"
          }}>
            <h2 style={{ color: "#1976d2" }}>404 Page Not Found</h2>
            <a href="/" style={{ color: "#007bff", fontWeight: 600, textDecoration: "none", marginTop: 18 }}>
              &larr; Return to Home
            </a>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
