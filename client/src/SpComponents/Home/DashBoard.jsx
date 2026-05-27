import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Menu, X } from "lucide-react";
import "./DashBoard.css";

const DashBoard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  // const [drawerOpen, setDrawerOpen] = useState(false);
  const [stats] = useState({
    earnings: 2450,
    bookings: 12,
    rating: 4.9,
    completedServices: 28
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/SpAuth");
          return;
        }

        const providerData = localStorage.getItem("provider");
        if (providerData) {
          const provider = JSON.parse(providerData);
          setUserName(provider.name);
          setLoading(false);
          return;
        }

        const response = await axios.get("http://localhost:3000/api/providers/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserName(response.data.name);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load user data");
        navigate("/SpAuth");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (

      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1>Welcome, {userName}!</h1>
          <p className="dashboard-subtitle">Here's what's happening with your business today</p>
        </header>

        <section className="stats-grid">
          {[
            { icon: "₹", title: "Total Earnings", value: stats.earnings, change: "+12% from last month" },
            { icon: "📅", title: "New Bookings", value: stats.bookings, change: "+3 from yesterday" },
            { icon: "⭐", title: "Service Rating", value: `${stats.rating}/5`, change: "98% positive feedback" },
            { icon: "✓", title: "Completed", value: stats.completedServices, change: "This month" }
          ].map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-content">
                <h3>{stat.title}</h3>
                <p className="stat-value">{stat.title.includes("Earnings") ? `₹${stat.value.toLocaleString()}` : stat.value}</p>
                <p className="stat-change positive">{stat.change}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="upcoming-appointments">
          <div className="section-header">
            <h2>Upcoming Appointments</h2>
            <button className="view-all" onClick={() => navigate("/SpBookings")}>View All</button>
          </div>
          
          <div className="appointments-list">
            {[
              { 
                image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=200",
                name: "Max - Golden Retriever",
                service: "Full Grooming Service",
                time: "Today • 2:00 PM",
                status: "confirmed"
              },
              {
                image: "https://images.unsplash.com/photo-1536590158209-e9d615d525e4?w=200",
                name: "Luna - Persian Cat",
                service: "Basic Grooming",
                time: "Tomorrow • 10:00 AM",
                status: "pending"
              }
            ].map((appointment, index) => (
              <div key={index} className="appointment-card">
                <img src={appointment.image} alt={appointment.name} className="pet-image" />
                <div className="appointment-details">
                  <h3>{appointment.name}</h3>
                  <p className="service-type">{appointment.service}</p>
                  <div className="appointment-meta">
                    <span className="appointment-time">{appointment.time}</span>
                    <span className={`appointment-status ${appointment.status}`}>
                      {appointment.status === "confirmed" ? "Confirmed" : "Pending"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
  );
};

export default DashBoard;