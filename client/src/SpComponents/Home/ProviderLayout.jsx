import React from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, LogOut, Home, User, Calendar, Bell, IndianRupee } from "lucide-react";
import { useState } from "react";
import "./ProviderLayout.css";

const ProviderLayout = ({ children, userName }) => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("provider");
      navigate("/SpAuth");
    }
  };

  const getInitials = (name) => {
    if (!name) return 'SP';
    const names = name.split(' ');
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  };

  const getAvatarColor = (name) => {
    if (!name) return '#4CAF50';
    const colors = ['#f0a84d', '#4CAF50', '#2196F3', '#FF5722', '#9C27B0'];
    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className={`dashboard-container ${drawerOpen ? 'drawer-open' : ''}`}>
      {/* Mobile Header */}
      <header className="mobile-header">
        <button className="menu-button" onClick={() => setDrawerOpen(!drawerOpen)}>
          {drawerOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <h1>Dashboard</h1>
      </header>

      {/* Side Drawer */}
      <aside className="dashboard-drawer">
        <div className="drawer-header">
          <div 
            className="user-avatar"
            style={{ backgroundColor: getAvatarColor(userName) }}
          >
            {getInitials(userName)}
          </div>
          <div className="user-info">
            <h3>{userName}</h3>
            {/* <p>Service Provider</p> */}
          </div>
        </div>

        <nav className="drawer-nav">
          <ul>
            <li className={window.location.pathname === "/Dashboard" ? "active" : ""}>
              <button onClick={() => navigate("/Dashboard")}>
                <Home size={18} />
                <span>Dashboard</span>
              </button>
            </li>
            <li className={window.location.pathname === "/SpProfile" ? "active" : ""}>
              <button onClick={() => navigate("/SpProfile")}>
                <User size={18} />
                <span>My Profile</span>
              </button>
            </li>
            <li className={window.location.pathname === "/SpBookings" ? "active" : ""}>
              <button onClick={() => navigate("/SpBookings")}>
                <Calendar size={18} />
                <span>Bookings</span>
              </button>
            </li>
            <li className={window.location.pathname === "/Sptrans" ? "active" : ""}>
              <button onClick={() => navigate("/Sptrans")}>
                <IndianRupee size={18} />
                <span>Transactions</span>
              </button>
            </li>
            <li className={window.location.pathname === "/SpNotif" ? "active" : ""}>
              <button onClick={() => navigate("/SpNotif")}>
                <Bell size={18} />
                <span>Notifications</span>
              </button>
            </li>
          </ul>
        </nav>

        <div className="drawer-footer">
          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-content">
        {children}
      </main>
    </div>
  );
};

export default ProviderLayout;