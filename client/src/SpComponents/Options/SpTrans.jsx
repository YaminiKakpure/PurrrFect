import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SpTrans.css";

const SpTrans = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    timePeriod: 'month',
    amountRange: 'all',
    status: 'all'
  });
  const [stats, setStats] = useState({
    totalEarnings: 0,
    monthlyEarnings: 0,
    pendingPayments: 0,
    growthPercentage: 0
  });

  // Fetch transactions from localStorage
  useEffect(() => {
    const fetchData = () => {
      try {
        // Get transactions from bookings (both online and cash)
        const storedBookings = JSON.parse(localStorage.getItem('petCareBookings')) || [];
        const currentUserId = localStorage.getItem('userId');
        
        // Filter bookings for this provider and map to transactions
        const providerTransactions = storedBookings
          .filter(booking => booking.provider.id === currentUserId)
          .map(booking => ({
            id: booking.id,
            customer: booking.customerName || 'Customer',
            service: booking.service.name,
            date: booking.date,
            amount: booking.amount || booking.service.price,
            status: booking.paymentStatus || (booking.paymentMethod === 'online' ? 'paid' : 'pending'),
            method: booking.paymentMethod || 'cash',
            bookingStatus: booking.status
          }));
        
        // Add standalone payments if they exist
        const paymentHistory = JSON.parse(localStorage.getItem('paymentHistory')) || [];
        const providerPayments = paymentHistory
          .filter(payment => payment.providerId === currentUserId)
          .map(payment => ({
            id: payment.paymentId,
            customer: payment.customerName || 'Customer',
            service: payment.service,
            date: payment.date,
            amount: payment.amount,
            status: 'paid',
            method: 'online',
            bookingStatus: 'completed'
          }));
        
        const allTransactions = [...providerTransactions, ...providerPayments];
        setTransactions(allTransactions);

        // Calculate stats
        const total = allTransactions.reduce((sum, t) => t.status === 'paid' ? sum + t.amount : sum, 0);
        const monthly = allTransactions
          .filter(t => new Date(t.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
          .reduce((sum, t) => t.status === 'paid' ? sum + t.amount : sum, 0);
        const pending = allTransactions.filter(t => t.status === 'pending').length;
        
        // Simple growth calculation (for demo)
        const growth = monthly > 0 ? ((monthly / (total - monthly)) * 100 ): 0;

        setStats({
          totalEarnings: total,
          monthlyEarnings: monthly,
          pendingPayments: pending,
          growthPercentage: growth.toFixed(1)
        });
      } catch (error) {
        console.error("Error loading transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Set up storage event listener to sync across tabs
    const handleStorageChange = () => fetchData();
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
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
    
    // Amount range filter
    if (filters.amountRange === 'gt1000' && transaction.amount <= 1000) {
      return false;
    }
    
    if (filters.amountRange === 'lt1000' && transaction.amount >= 1000) {
      return false;
    }
    
    // Status filter
    if (filters.status !== 'all' && transaction.status !== filters.status) {
      return false;
    }
    
    return true;
  });

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="sp-trans-page">
        <div className="sp-app-bar">
          <button className="back-button" onClick={() => navigate(-1)}>
            ←
          </button>
          <h1>Transactions</h1>
        </div>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="sp-trans-page">
      {/* App Bar */}
      <div className="sp-app-bar">
        <button className="back-button" onClick={() => navigate(-1)}>
          ←
        </button>
        <h1>Transactions</h1>
      </div>

      {/* Hero Section */}
      <div className="sp-hero-section">
        <h2>Your earnings so far!</h2>
        <p>{formatCurrency(stats.totalEarnings)}</p>
        <span className={stats.growthPercentage >= 0 ? 'positive' : 'negative'}>
          {stats.growthPercentage >= 0 ? '↑' : '↓'} {Math.abs(stats.growthPercentage)}% from last month
        </span>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>This Month</h3>
            <p>{formatCurrency(stats.monthlyEarnings)}</p>
          </div>
          <div className="stat-card">
            <h3>Pending</h3>
            <p>{stats.pendingPayments} payments</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="sp-filters">
        <select 
          value={filters.timePeriod}
          onChange={(e) => handleFilterChange('timePeriod', e.target.value)}
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="all">All Time</option>
        </select>
        <select
          value={filters.amountRange}
          onChange={(e) => handleFilterChange('amountRange', e.target.value)}
        >
          <option value="all">All Amounts</option>
          <option value="gt1000">&gt; ₹1000</option>
          <option value="lt1000">&lt; ₹1000</option>
        </select>
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="paid">Completed</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Transactions List */}
      <div className="sp-transactions-list">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map(transaction => (
            <div className="transaction-card" key={transaction.id}>
              <div className="transaction-info">
                <div className="transaction-icon">
                  {transaction.method === 'online' ? '💳' : '💵'}
                </div>
                <div>
                  <h3>{transaction.customer}</h3>
                  <p>{transaction.service}</p>
                  <span>{formatDate(transaction.date)}</span>
                </div>
              </div>
              <div className="transaction-amount">
                <p>{formatCurrency(transaction.amount)}</p>
                <span className={`status ${transaction.status}`}>
                  {transaction.status === 'paid' ? 'Completed' : 'Pending'}
                  {transaction.bookingStatus === 'cancelled' && ' (Cancelled)'}
                </span>
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