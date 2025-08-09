import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ArrowLeft, Calendar, Clock, DollarSign, MapPin, User, Car, Info, Phone, Mail, XCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate, formatDateTime } from '../utils/dateUtils';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/bookings/${id}`);
      setBooking(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      if (error.response?.status === 404) {
        setError('Booking not found.');
      } else {
        setError('Failed to load booking details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await axios.patch(`/api/bookings/${id}/cancel`);
        toast.success('Booking cancelled successfully!');
        fetchBookingDetails(); // Refresh details
      } catch (error) {
        console.error('Error cancelling booking:', error);
        const errorMessage = error.response?.data?.message || 'Failed to cancel booking.';
        toast.error(errorMessage);
      }
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading booking details..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage message={error} onRetry={fetchBookingDetails} />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage message="Booking not found." />
      </div>
    );
  }

  const canCancel = booking.status === 'confirmed' && new Date(booking.startDate) > new Date();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to My Bookings</span>
        </button>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h1 className="text-3xl font-bold text-gray-900">Booking #{booking.bookingId}</h1>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
              'bg-red-100 text-red-800'
            }`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          </div>

          {/* Car Details */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Car className="h-6 w-6 text-blue-600" />
              <span>Car Details</span>
            </h2>
            <div className="flex flex-col md:flex-row items-center md:space-x-6 bg-gray-50 p-4 rounded-lg">
              <img
                src={booking.car?.image || "/placeholder.svg?height=100&width=150&query=car"}
                alt={booking.car?.title}
                className="w-32 h-24 object-cover rounded-md mb-4 md:mb-0"
              />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{booking.car?.title}</h3>
                <p className="text-gray-600">{booking.car?.brand} {booking.car?.model} ({booking.car?.year})</p>
                <p className="text-gray-600">
                  {formatCurrency(booking.car?.pricePerDay)}/day | {formatCurrency(booking.car?.pricePerHour)}/hour
                </p>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-blue-600" />
              <span>Booking Information</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-500">Start Date</div>
                  <div className="font-medium">{formatDate(booking.startDate)}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-500">End Date</div>
                  <div className="font-medium">{formatDate(booking.endDate)}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-500">Pickup Time</div>
                  <div className="font-medium">{booking.startTime}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-500">Dropoff Time</div>
                  <div className="font-medium">{booking.endTime}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-500">Pickup Location</div>
                  <div className="font-medium">{booking.pickupLocation}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-500">Dropoff Location</div>
                  <div className="font-medium">{booking.dropoffLocation}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Info className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-500">Booking Type</div>
                  <div className="font-medium">{booking.bookingType.charAt(0).toUpperCase() + booking.bookingType.slice(1)}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-500">Duration</div>
                  <div className="font-medium">{booking.duration} {booking.bookingType === 'hourly' ? 'hours' : 'days'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Total Amount */}
          <div className="mb-8 p-4 bg-blue-50 rounded-lg flex justify-between items-center">
            <h2 className="text-xl font-bold text-blue-800 flex items-center space-x-2">
              <DollarSign className="h-6 w-6" />
              <span>Total Amount</span>
            </h2>
            <span className="text-3xl font-bold text-blue-800">{formatCurrency(booking.totalAmount)}</span>
          </div>

          {/* User Details (for admin or if user wants to see their own details) */}
          {booking.user && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <User className="h-6 w-6 text-blue-600" />
                <span>User Details</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">Name</div>
                    <div className="font-medium">{booking.user.name}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium">{booking.user.email}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <div className="font-medium">{booking.user.phone}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Special Requests */}
          {booking.specialRequests && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Info className="h-6 w-6 text-blue-600" />
                <span>Special Requests</span>
              </h2>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{booking.specialRequests}</p>
            </div>
          )}

          {/* Action Button */}
          {canCancel && (
            <button
              onClick={handleCancelBooking}
              className="w-full btn-danger flex items-center justify-center space-x-2 mt-4"
            >
              <XCircle className="h-5 w-5" />
              <span>Cancel Booking</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
