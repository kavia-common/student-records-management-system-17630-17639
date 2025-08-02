import React from "react";

/**
 * PUBLIC_INTERFACE
 * NavBar - Fixed navigation bar for all main pages (Home, Dashboard, Add Student, Analytics).
 * Minimal modern design, always visible at top.
 */
const navStyle = {
  position: "sticky",
  top: 0,
  zIndex: 100,
  width: "100%",
  background: "#1976d2",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 22px",
  height: 57,
  boxShadow: "0 4px 17px rgba(25,118,210,0.06)",
  fontFamily: "Segoe UI, Arial, sans-serif",
};

const itemStyle = {
  display: "inline-block",
  color: "#fff",
  textDecoration: "none",
  fontWeight: 600,
  fontSize: 16,
  padding: "0 22px",
  lineHeight: "57px",
  transition: "color 0.17s, background 0.16s",
  borderRadius: 0,
  cursor: "pointer",
};

function NavBar() {
  return (
    <nav style={navStyle}>
      <a href="#/" style={itemStyle}>Home</a>
      <a href="#/dashboard" style={itemStyle}>Dashboard</a>
      <a href="#/add" style={itemStyle}>Add Student</a>
      <a href="#/analytics" style={itemStyle}>Analytics</a>
    </nav>
  );
}

export default NavBar;
