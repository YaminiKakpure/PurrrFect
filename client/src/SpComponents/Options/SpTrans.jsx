import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SpTrans.css";
import { Clock, Calendar, User, CreditCard, DollarSign, CheckCircle, XCircle } from "lucide-react";
import { ChevronLeft } from 'lucide-react';

const SpTrans = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    timePeriod: 'month',
    paymentMethod: 'all',
    status: 'all'
  });

  // Fetch transactions from localStorage
  useEffect(() => {
    const fetchData = () => {
      try {
        const storedBookings = JSON.parse(localStorage.getItem('petCareBookings')) || [];
        const currentUserId = localStorage.getItem('userId');
        
        // Process transactions from bookings
        const providerTransactions = storedBookings
          .filter(booking => booking.provider?.id === currentUserId)
          .map(booking => ({
            id: booking.id,
            transactionId: booking.paymentId || `cash-${booking.id}`,
            customer: {
              name: booking.user?.name || 'Pet Owner',
              phone: booking.user?.phone || 'Not provided',
              email: booking.user?.email || 'Not provided'
            },
            pet: {
              name: booking.pet?.name || 'Pet',
              breed: booking.pet?.breed || 'Unknown breed'
            },
            service: booking.service?.name || 'Service',
            date: booking.date,
            time: booking.time,
            amount: booking.amount || booking.service?.price || 0,
            status: booking.paymentStatus || (booking.paymentMethod === 'online' ? 'paid' : 'pending'),
            method: booking.paymentMethod || 'cash',
            bookingStatus: booking.status
          }));
        
        setTransactions(providerTransactions);
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

  const filteredTransactions = transactions.filter(transaction => {
    // Time period filter
    const now = new Date();
    const transactionDate = new Date(transaction.date);
    
    if (filters.timePeriod === 'today' && 
        !(transactionDate.getDate() === now.getDate() && 
          transactionDate.getMonth() === now.getMonth() && 
          transactionDate.getFullYear() === now.getFullYear())) {
      return false;
    }
    
    if (filters.timePeriod === 'week' && 
        transactionDate < new Date(now - 7 * 24 * 60 * 60 * 1000)) {
      return false;
    }
    
    if (filters.timePeriod === 'month' && 
        transactionDate < new Date(now - 30 * 24 * 60 * 60 * 1000)) {
      return false;
    }
    
    // Payment method filter
    if (filters.paymentMethod !== 'all' && transaction.method !== filters.paymentMethod) {
      return false;
    }
    
    // Status filter
    if (filters.status !== 'all' && transaction.status !== filters.status) {
      return false;
    }
    
    return true;
  });

  // Calculate statistics
  const stats = {
    totalEarnings: transactions
      .filter(t => t.status === 'paid')
      .reduce((sum, t) => sum + t.amount, 0),
    pendingPayments: transactions.filter(t => t.status === 'pending').length,
    onlinePayments: transactions.filter(t => t.method === 'online').length,
    cashPayments: transactions.filter(t => t.method === 'cash').length
  };

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const formatTime = (timeString) => {
    return timeString || '--:--';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle size={16} color="#4CAF50" />;
      case 'pending': return <Clock size={16} color="#FF9800" />;
      default: return <XCircle size={16} color="#F44336" />;
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'online': return <CreditCard size={16} />;
      case 'cash': return <DollarSign size={16} />;
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
        <button onClick={() => navigate(-1)} className="back-button">
          <ChevronLeft size={24} />
        </button>
        <h1>Payment Transactions</h1>
      </div>

      {/* Stats Overview */}
      <div className="sp-trans-stats">
        <div className="stat-card total-earnings">
          <h3>Total Earnings</h3>
          <p>{formatCurrency(stats.totalEarnings)}</p>
        </div>
        <div className="stat-card pending-payments">
          <h3>Pending Payments</h3>
          <p>{stats.pendingPayments}</p>
        </div>
        <div className="stat-card payment-methods">
          <div>
            <CreditCard size={16} />
            <span>{stats.onlinePayments} online</span>
          </div>
          <div>
            <DollarSign size={16} />
            <span>{stats.cashPayments} cash</span>
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
                    <p className="pet-info">
                      {transaction.pet.name} • {transaction.pet.breed}
                    </p>
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
                    {getPaymentMethodIcon(transaction.method)} Method:
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
                    {getStatusIcon(transaction.status)} Status:
                  </span>
                  <span className={`status ${transaction.status}`}>
                    {transaction.status === 'paid' ? 'Completed' : 'Pending'}
                    {transaction.bookingStatus === 'cancelled' && ' (Booking Cancelled)'}
                  </span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Service:</span>
                  <span>{transaction.service}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-transactions">
            <p>No transactions found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpTrans;