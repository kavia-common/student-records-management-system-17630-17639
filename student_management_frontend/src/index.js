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

// Simple hash-based router with route params parsing.
function Router() {
  const [route, setRoute] = React.useState(() => getRoute(window.location.hash));
  const [params, setParams] = React.useState(() => getRouteParams(window.location.hash));

  React.useEffect(() => {
    const onHash = () => {
      setRoute(getRoute(window.location.hash));
      setParams(getRouteParams(window.location.hash));
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  function handleNavToDashboard() {
    window.location.hash = "#/dashboard";
  }

  // Route mappings
  if (!route || route === "/") return <Homepage />;
  if (route === "/dashboard" || route === "/students")
    return <ViewStudents />;
  if (route === "/add")
    return <AddStudent onSuccessNav={handleNavToDashboard} />;
  if (route === "/analytics")
    return <Analytics />;
  if (route.startsWith("/edit/") && params && params.id)
    return <EditStudent studentId={params.id} onSuccessNav={handleNavToDashboard} />;
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

// Helper to parse route and route params from hash (only ONE definition)
function getRoute(hash) {
  return hash ? hash.replace(/^#/, '').split(/[?&]/)[0] : "/";
}
function getRouteParams(hash) {
  const h = hash ? hash.replace(/^#/, '').split(/[?&]/)[0] : "";
  const match = h.match(/^\/edit\/([a-zA-Z0-9_\-]+)$/);
  if (match) {
    return { id: match[1] };
  }
  return {};
}



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <NavBar />
    <Router />
  </React.StrictMode>
);
