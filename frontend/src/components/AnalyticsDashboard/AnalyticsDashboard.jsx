import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './AnalyticsDashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
// const API_URL = import.meta.env.VITE_API_URL || 'https://lexmark-wow-soul-yesterday.trycloudflare.com';


const AnalyticsDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/analytics/dashboard`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setStats(response.data);
        } catch (error) {
            toast.error('Failed to fetch analytics data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };

    const formatPercentage = (value) => {
        const sign = value >= 0 ? '+' : '';
        return `${sign}${value.toFixed(1)}%`;
    };

    const getMonthName = (month) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[month - 1];
    };

    if (loading) {
        return (
            <div className="analytics-loading">
                <div className="spinner"></div>
                <p>Loading analytics...</p>
            </div>
        );
    }

    if (!stats) {
        return <div className="analytics-error">Failed to load analytics data</div>;
    }

    return (
        <div className="analytics-dashboard">
            <div className="dashboard-header">
                <h1>Analytics Dashboard</h1>
                <div className="date-range-selector">
                    <input
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    />
                    <span>to</span>
                    <input
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    />
                </div>
            </div>

            {/* Key Metrics */}
            <div className="metrics-grid">
                <div className="metric-card revenue">
                    <div className="metric-icon">💰</div>
                    <div className="metric-content">
                        <h3>Total Revenue</h3>
                        <div className="metric-value">{formatCurrency(stats.totalRevenue)}</div>
                        <div className={`metric-change ${stats.revenueGrowth >= 0 ? 'positive' : 'negative'}`}>
                            {formatPercentage(stats.revenueGrowth)} from last month
                        </div>
                    </div>
                </div>

                <div className="metric-card orders">
                    <div className="metric-icon">📦</div>
                    <div className="metric-content">
                        <h3>Total Orders</h3>
                        <div className="metric-value">{stats.totalOrders.toLocaleString()}</div>
                        <div className={`metric-change ${stats.ordersGrowth >= 0 ? 'positive' : 'negative'}`}>
                            {formatPercentage(stats.ordersGrowth)} from last month
                        </div>
                    </div>
                </div>

                <div className="metric-card products">
                    <div className="metric-icon">🛍️</div>
                    <div className="metric-content">
                        <h3>Active Products</h3>
                        <div className="metric-value">{stats.totalProducts.toLocaleString()}</div>
                        <div className="metric-subtitle">In catalog</div>
                    </div>
                </div>

                <div className="metric-card customers">
                    <div className="metric-icon">👥</div>
                    <div className="metric-content">
                        <h3>Total Customers</h3>
                        <div className="metric-value">{stats.totalCustomers.toLocaleString()}</div>
                        <div className="metric-subtitle">Registered users</div>
                    </div>
                </div>

                <div className="metric-card aov">
                    <div className="metric-icon">💳</div>
                    <div className="metric-content">
                        <h3>Avg Order Value</h3>
                        <div className="metric-value">{formatCurrency(stats.averageOrderValue)}</div>
                        <div className="metric-subtitle">Per transaction</div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-section">
                {/* Revenue Chart */}
                <div className="chart-card">
                    <h2>Revenue Trend (Last 6 Months)</h2>
                    <div className="bar-chart">
                        {stats.revenueByMonth.map((item, index) => {
                            const maxRevenue = Math.max(...stats.revenueByMonth.map(i => i.revenue));
                            const height = (item.revenue / maxRevenue) * 100;

                            return (
                                <div key={index} className="bar-container">
                                    <div className="bar-value">{formatCurrency(item.revenue)}</div>
                                    <div className="bar" style={{ height: `${height}%` }}>
                                        <div className="bar-fill"></div>
                                    </div>
                                    <div className="bar-label">
                                        {getMonthName(item._id.month)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Orders by Status */}
                <div className="chart-card">
                    <h2>Orders by Status</h2>
                    <div className="status-chart">
                        {stats.ordersByStatus.map((item, index) => {
                            const total = stats.ordersByStatus.reduce((sum, i) => sum + i.count, 0);
                            const percentage = ((item.count / total) * 100).toFixed(1);

                            return (
                                <div key={index} className="status-item">
                                    <div className="status-info">
                                        <span className={`status-dot ${item._id}`}></span>
                                        <span className="status-name">{item._id}</span>
                                    </div>
                                    <div className="status-bar-container">
                                        <div
                                            className={`status-bar ${item._id}`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                    <div className="status-count">
                                        {item.count} ({percentage}%)
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Top Selling Products */}
            <div className="top-products-section">
                <h2>Top Selling Products</h2>
                <div className="products-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Product</th>
                                <th>Sold</th>
                                <th>Price</th>
                                <th>Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.topSellingProducts.map((product, index) => (
                                <tr key={product._id}>
                                    <td className="rank">#{index + 1}</td>
                                    <td className="product-info">
                                        {product.thumbnail && (
                                            <img src={product.thumbnail} alt={product.title} />
                                        )}
                                        <span>{product.title}</span>
                                    </td>
                                    <td>{product.soldCount}</td>
                                    <td>{formatCurrency(product.price)}</td>
                                    <td className="revenue">
                                        {formatCurrency(product.soldCount * product.price)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="recent-orders-section">
                <h2>Recent Orders</h2>
                <div className="orders-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Payment</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentOrders.map((order) => (
                                <tr key={order._id}>
                                    <td className="order-id">#{order._id.slice(-8)}</td>
                                    <td>{order.userId?.name || 'N/A'}</td>
                                    <td>{formatCurrency(order.totalAmount)}</td>
                                    <td>
                                        <span className={`status-badge ${order.orderStatus}`}>
                                            {order.orderStatus}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`payment-badge ${order.paymentStatus}`}>
                                            {order.paymentStatus}
                                        </span>
                                    </td>
                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
