import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Homepage from './Homepage';
import AddStudent from './AddStudent';

// Simple hash-based router; extends routing when more pages are added.
function Router() {
  const [route, setRoute] = React.useState(() => getRoute(window.location.hash));

  React.useEffect(() => {
    const onHash = () => setRoute(getRoute(window.location.hash));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // After success on AddStudent, navigate to dashboard.
  function handleNavToDashboard() {
    window.location.hash = "#/dashboard";
  }

  // Route mappings
  if (!route || route === "/") return <Homepage />;
  if (route === "/dashboard" || route === "/students") return <App />;
  if (route === "/add") return <AddStudent onSuccessNav={handleNavToDashboard} />;
  // 404
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#fff"
    }}>
      <h2 style={{ color: "#1976d2" }}>404 Page Not Found</h2>
      <a href="#/" style={{ color: "#007bff", fontWeight: 600, textDecoration: "none", marginTop: 18 }}>
        &larr; Return to Home
      </a>
    </div>
  );
}

function getRoute(hash) {
  // E.g. "#/dashboard?a=1" => "/dashboard"
  return hash ? hash.replace(/^#/, '').split(/[?&]/)[0] : "/";
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);
