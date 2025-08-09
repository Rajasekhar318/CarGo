import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Car, Users, Calendar, DollarSign, PlusCircle, ListChecks, Clock, TrendingUp } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { formatCurrency, formatNumber } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/dateUtils';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/dashboard');
      setStats(response.data.stats);
      setRecentBookings(response.data.recentBookings);
      setMonthlyStats(response.data.monthlyStats);
      setError(null);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchDashboardData} />;
  }

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex space-x-4">
            <Link
              to="/admin/cars/add"
              className="btn-primary flex items-center space-x-2"
            >
              <PlusCircle className="h-5 w-5" />
              <span>Add New Car</span>
            </Link>

            <Link
              to="/admin/cars"
              className="btn-danger flex items-center space-x-2"
            >
              <PlusCircle className="h-5 w-5" />
              <span>Manage Cars</span>
            </Link>

            <Link
              to="/admin/bookings"
              className="btn-secondary flex items-center space-x-2"
            >
              <ListChecks className="h-5 w-5" />
              <span>Admin Bookings</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6 flex items-center space-x-4">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Car className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Cars</p>
              <h2 className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalCars)}</h2>
            </div>
          </div>
          <div className="card p-6 flex items-center space-x-4">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <h2 className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalUsers)}</h2>
            </div>
          </div>
          <div className="card p-6 flex items-center space-x-4">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Bookings</p>
              <h2 className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalBookings)}</h2>
            </div>
          </div>
          <div className="card p-6 flex items-center space-x-4">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <h2 className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Bookings</h2>
            {recentBookings.length === 0 ? (
              <p className="text-gray-600 text-center py-4">No recent bookings.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {recentBookings.map((booking) => (
                  <li key={booking._id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={booking.car?.image || "/placeholder.svg?height=40&width=40&query=car"}
                        alt={booking.car?.title}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{booking.car?.title}</p>
                        <p className="text-xs text-gray-500">by {booking.user?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(booking.totalAmount)}</p>
                      <p className="text-xs text-gray-500">{formatDateTime(booking.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Monthly Booking Stats */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Booking Trends ({new Date().getFullYear()})</h2>
            {monthlyStats.length === 0 ? (
              <p className="text-gray-600 text-center py-4">No monthly data available.</p>
            ) : (
              <div className="space-y-4">
                {monthlyStats.map((stat) => (
                  <div key={stat._id} className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">{monthNames[stat._id - 1]}</span>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{stat.count} bookings</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span>{formatCurrency(stat.revenue)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
