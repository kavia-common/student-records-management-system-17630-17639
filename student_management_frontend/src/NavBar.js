import React from "react";
import { Link, useLocation } from "react-router-dom";

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
  const { pathname } = useLocation();
  const routes = [
    { path: "/", label: "Home" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/add", label: "Add Student" },
    { path: "/analytics", label: "Analytics" },
  ];

  return (
    <nav style={navStyle}>
      {routes.map((route) => (
        <Link
          key={route.path}
          to={route.path}
          style={{
            ...itemStyle,
            background: pathname === route.path ? "rgba(255,255,255,0.13)" : "transparent",
            color: "#fff",
            textDecoration: "none",
          }}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  );
}

export default NavBar;
