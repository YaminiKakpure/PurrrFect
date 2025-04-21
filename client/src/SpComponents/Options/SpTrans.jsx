import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Clock, Calendar, User, CreditCard, IndianRupeeIcon, CheckCircle, XCircle } from "lucide-react";
import "./SpTrans.css";
import axios from "axios";

const SpTrans = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    timePeriod: 'month',
    paymentMethod: 'all',
    status: 'all',
    bookingStatus: 'all'
  });

  // Function to fetch customer details by ID
  const fetchCustomerDetails = async (customerId) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/customers/${customerId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching customer details:", error);
      return {
        name: 'Customer',
        email: 'Not provided',
        phone: 'Not provided'
      };
    }
  };

  // Fetch transactions from localStorage and enrich with customer data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current provider info
        const providerData = JSON.parse(localStorage.getItem('provider'));
        if (!providerData || !providerData.id) {
          throw new Error("Provider data not found in localStorage");
        }

        // Get all bookings from localStorage
        const storedBookings = JSON.parse(localStorage.getItem('petCareBookings')) || [];
        
        // Process transactions for this provider only
        const enrichedTransactions = await Promise.all(
          storedBookings
            .filter(booking => {
              if (!booking || !booking.provider) return false;
              return booking.provider.id === providerData.id;
            })
            .map(async (booking) => {
              // Fetch customer details from API
              const customerDetails = booking.user?.id 
                ? await fetchCustomerDetails(booking.user.id)
                : {
                    name: booking.user?.name || 'Customer',
                    email: booking.user?.email || 'Not provided',
                    phone: booking.user?.phone || 'Not provided'
                  };

              return {
                id: booking.id,
                transactionId: booking.paymentId || `cash_${booking.id}`,
                customer: {
                  id: booking.user?.id,
                  name: customerDetails.name,
                  phone: customerDetails.phone,
                  email: customerDetails.email
                },
                service: {
                  id: booking.service?.id || booking.selectedService?.id,
                  name: booking.service?.name || booking.selectedService?.name || 'Service',
                  description: booking.service?.description || booking.selectedService?.description,
                  price: booking.service?.price || booking.selectedService?.price || 0,
                  duration: booking.service?.duration || '30'
                },
                date: booking.date,
                time: booking.time,
                amount: booking.amount || booking.service?.price || 0,
                status: booking.paymentStatus || (booking.paymentMethod === 'online' ? 'paid' : 'pending'),
                method: booking.paymentMethod || 'cash',
                bookingStatus: booking.status || 'confirmed',
                createdAt: booking.createdAt || new Date().toISOString(),
                updatedAt: booking.updatedAt || new Date().toISOString()
              };
            })
        );

        // Sort by date (newest first)
        enrichedTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setTransactions(enrichedTransactions);
      } catch (error) {
        console.error("Error loading transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.addEventListener('storage', fetchData);
    return () => window.removeEventListener('storage', fetchData);
  }, []);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const filterByTimePeriod = (transaction, period) => {
    const now = new Date();
    const transactionDate = new Date(transaction.date || transaction.createdAt);
    
    switch (period) {
      case 'today':
        return (
          transactionDate.getDate() === now.getDate() &&
          transactionDate.getMonth() === now.getMonth() &&
          transactionDate.getFullYear() === now.getFullYear()
        );
      case 'week':
        return transactionDate >= new Date(now.setDate(now.getDate() - 7));
      case 'month':
        return transactionDate >= new Date(now.setMonth(now.getMonth() - 1));
      case 'year':
        return transactionDate >= new Date(now.setFullYear(now.getFullYear() - 1));
      default:
        return true;
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (!filterByTimePeriod(transaction, filters.timePeriod)) return false;
    if (filters.paymentMethod !== 'all' && transaction.method !== filters.paymentMethod) return false;
    if (filters.status !== 'all' && transaction.status !== filters.status) return false;
    if (filters.bookingStatus !== 'all' && transaction.bookingStatus !== filters.bookingStatus) return false;
    return true;
  });

  // Calculate statistics
  const stats = {
    totalEarnings: transactions
      .filter(t => t.status === 'paid')
      .reduce((sum, t) => sum + t.amount, 0),
    pendingPayments: transactions.filter(t => t.status === 'pending').length,
    onlinePayments: transactions.filter(t => t.method === 'online').length,
    cashPayments: transactions.filter(t => t.method === 'cash').length,
    completedBookings: transactions.filter(t => t.bookingStatus === 'confirmed').length,
    cancelledBookings: transactions.filter(t => t.bookingStatus === 'cancelled').length
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    return timeString.includes(':') ? timeString.split(':').slice(0, 2).join(':') : timeString;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'paid': return <CheckCircle size={16} color="#4CAF50" />;
      case 'pending': return <Clock size={16} color="#FF9800" />;
      default: return <XCircle size={16} color="#F44336" />;
    }
  };

  const PaymentMethodIcon = ({ method }) => {
    switch (method) {
      case 'online': return <CreditCard size={16} color="#3F51B5" />;
      case 'cash': return <IndianRupeeIcon size={16} color="#4CAF50" />;
      default: return <CreditCard size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="sp-trans-loading">
        <div className="spinner"></div>
        <p>Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="sp-trans-container">
      {/* Header */}
      <div className="sp-trans-header">
        {/* <button onClick={() => navigate(-1)} className="back-button">
          <ChevronLeft size={24} />
        </button> */}
        <h1>Payment Transactions</h1>
      </div>

      {/* Stats Overview */}
      <div className="sp-trans-stats">
        <div className="stat-card total-earnings">
          <h3>Total Earnings --  {formatCurrency(stats.totalEarnings)}</h3>
        </div>
        <div className="stat-card pending-payments">
          <h3>Pending Payments -- {stats.pendingPayments}</h3>
        </div>
        <div className="stat-card payment-methods">
          <div>
            <CreditCard size={16} />
            <h3>{stats.onlinePayments} online</h3>
          </div>
          <div>
            <IndianRupeeIcon size={16} />
            <h3>{stats.cashPayments} cash</h3>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="sp-trans-filters">
        <select 
          value={filters.timePeriod}
          onChange={(e) => handleFilterChange('timePeriod', e.target.value)}
          className="filter-select"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="all">All Time</option>
        </select>
        
        <select
          value={filters.paymentMethod}
          onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
          className="filter-select"
        >
          <option value="all">All Methods</option>
          <option value="online">Online</option>
          <option value="cash">Cash</option>
        </select>
        
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="filter-select"
        >
          <option value="all">All Statuses</option>
          <option value="paid">Completed</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Transactions List */}
      <div className="sp-trans-list">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map(transaction => (
            <div key={transaction.id} className="transaction-card">
              <div className="transaction-header">
                <div className="user-info">
                  <div className="user-avatar">
                    <User size={20} />
                  </div>
                  <div>
                    <h3>{transaction.customer.name}</h3>
                  </div>
                </div>
                <div className="transaction-amount">
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
              
              <div className="transaction-details">
                <div className="detail-row">
                  <span className="detail-label">
                    <Calendar size={14} /> Date:
                  </span>
                  <span>{formatDate(transaction.date)} at {formatTime(transaction.time)}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">
                    <PaymentMethodIcon method={transaction.method} /> Method:
                  </span>
                  <span>
                    {transaction.method === 'online' ? 'Online Payment' : 'Cash Payment'}
                    {transaction.method === 'online' && transaction.transactionId && (
                      <span className="transaction-id">ID: {transaction.transactionId}</span>
                    )}
                  </span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">
                    <StatusIcon status={transaction.status} /> Status:
                  </span>
                  <span className={`status ${transaction.status}`}>
                    {transaction.status === 'paid' ? 'Completed' : 'Pending'}
                    {transaction.bookingStatus === 'cancelled' && ' (Booking Cancelled)'}
                  </span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Service:</span>
                  <span>{transaction.service.name}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-transactions">
            <p>No transactions found matching your filters</p>
            <button 
              className="reset-filters"
              onClick={() => setFilters({
                timePeriod: 'all',
                paymentMethod: 'all',
                status: 'all'
              })}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpTrans;