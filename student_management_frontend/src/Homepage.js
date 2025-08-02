import React from "react";
import { Link } from "react-router-dom";

/**
 * PUBLIC_INTERFACE
 * Homepage (Landing Page) for the Student Management System.
 *
 * Features:
 * - Heading: 'Student Management System'
 * - Description about the system
 * - Navigation buttons for "Admin Dashboard" and "Add New Student"
 * - Modern, minimal styling using provided CSS variables/colors
 * - Optional logo/banner (simple SVG icon in this example)
 */
function Homepage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 18px",
      }}
    >
      {/* Logo/Banner */}
      <div style={{ marginBottom: 15 }}>
        {/* Simple academic logo SVG */}
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-label="Logo" style={{ display: "block", margin: "0 auto" }}>
          <rect x="8" y="38" width="56" height="18" rx="9" fill="#1976d2" opacity="0.12"/>
          <ellipse cx="36" cy="24" rx="22" ry="12" fill="#1976d2"/>
          <rect x="27" y="20" width="18" height="14" rx="4" fill="#fff" />
          <rect x="32" y="28" width="8" height="4" rx="2" fill="#ffc107"/>
          <rect x="36" y="38" width="4" height="12" rx="2" fill="#1976d2"/>
        </svg>
      </div>
      <h1
        style={{
          fontWeight: 800,
          letterSpacing: "0.02em",
          fontSize: "2.3rem",
          marginBottom: 8,
        }}
      >
        Student Management System
      </h1>
      <p
        style={{
          maxWidth: 440,
          fontSize: "1.07rem",
          color: "var(--text-primary)",
          opacity: 0.8,
          marginBottom: 33,
          lineHeight: "1.55",
        }}
      >
        Easily manage student records as an admin. Quickly add new students, view all records, edit details, or analyze student data — all in a fast, minimal, modern interface.
      </p>
      <div
        style={{
          display: "flex",
          gap: "18px",
          marginBottom: 40,
          flexWrap: "wrap",
        }}
      >
        <NavBtn
          to="/dashboard"
          label="Admin Dashboard"
          style={{
            background: "var(--button-bg)",
            color: "var(--button-text)",
          }}
        />
        <NavBtn
          to="/add"
          label="Add New Student"
          style={{
            background: "#ffc107",
            color: "#333",
          }}
        />
      </div>
      <div style={{ color: "#aaa", fontSize: 14 }}>
        &copy; {new Date().getFullYear()} Minimal Student Records Admin Tool
      </div>
    </div>
  );
}

/**
 * Minimal navigational button component for links
 */
function NavBtn({ to, label, style }) {
  return (
    <Link
      to={to}
      style={{
        display: "inline-block",
        padding: "13px 32px",
        fontWeight: 700,
        fontSize: 17,
        borderRadius: 9,
        textDecoration: "none",
        letterSpacing: "0.02em",
        boxShadow: "0 1.5px 7px rgba(25,118,210,0.07)",
        transition: "background 0.2s, color 0.2s, transform 0.15s",
        outline: "none",
        ...style,
      }}
      onMouseDown={e => e.currentTarget.style.transform = "scale(0.96)"}
      onMouseUp={e => e.currentTarget.style.transform = ""}
      onBlur={e => e.currentTarget.style.transform = ""}
      tabIndex={0}
    >
      {label}
    </Link>
  );
}

export default Homepage;
