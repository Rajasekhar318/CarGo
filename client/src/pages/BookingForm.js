import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import DatePicker, { registerLocale } from 'react-datepicker';
import enGB from 'date-fns/locale/en-GB'; // Import locale for datepicker
import { ArrowLeft, Calendar, Clock, MapPin, DollarSign, Info, Car, XCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatCurrency } from '../utils/formatCurrency';
import { calculateDaysBetween, calculateHoursBetween } from '../utils/dateUtils';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth to get user details

registerLocale('en-GB', enGB); // Register the locale

const BookingForm = () => {
  const { id } = useParams(); // Car ID
  const navigate = useNavigate();
  const { user } = useAuth(); // Get current user from AuthContext
  const [car, setCar] = useState(null);
  const [loadingCar, setLoadingCar] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState(null);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [bookingType, setBookingType] = useState('daily'); // 'hourly' or 'daily'
  const [specialRequests, setSpecialRequests] = useState('');

  const [totalAmount, setTotalAmount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [availabilityMessage, setAvailabilityMessage] = useState('');
  const [isCarAvailable, setIsCarAvailable] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Fetch car details on component mount
  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        setLoadingCar(true);
        const response = await axios.get(`/api/cars/${id}`);
        setCar(response.data);
        setPickupLocation(response.data.location); // Set default pickup location
        setDropoffLocation(response.data.location); // Set default dropoff location
        setError(null);
      } catch (err) {
        console.error('Error fetching car details:', err);
        setError('Failed to load car details. Please try again.');
      } finally {
        setLoadingCar(false);
      }
    };
    fetchCarDetails();
  }, [id]);

  // Calculate total amount and check availability whenever relevant fields change
  useEffect(() => {
    const calculateAndCheckAvailability = async () => {
      if (!car || !startDate || !endDate) {
        setTotalAmount(0);
        setDuration(0);
        setAvailabilityMessage('Please select valid dates.');
        setIsCarAvailable(false);
        return;
      }

      const startDateTime = new Date(startDate);
      const endDateTime = new Date(endDate);

      // Set times for accurate calculation and validation
      if (bookingType === 'hourly') {
        const [startHour, startMinute] = startTime.split(':').map(Number);
        startDateTime.setHours(startHour, startMinute, 0, 0);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        endDateTime.setHours(endHour, endMinute, 0, 0);
      } else {
        // For daily, ensure end date is at least one day after start date
        startDateTime.setHours(0, 0, 0, 0);
        endDateTime.setHours(23, 59, 59, 999);
      }

      // Basic date/time range validation
      if (startDateTime >= endDateTime) {
        setTotalAmount(0);
        setDuration(0);
        setAvailabilityMessage('End date/time must be after start date/time.');
        setIsCarAvailable(false);
        return;
      }

      let calculatedDuration;
      let calculatedAmount;

      if (bookingType === 'daily') {
        calculatedDuration = calculateDaysBetween(startDate, endDate);
        calculatedAmount = calculatedDuration * car.pricePerDay;
      } else { // hourly
        calculatedDuration = calculateHoursBetween(startDateTime, endDateTime);
        calculatedAmount = calculatedDuration * car.pricePerHour;
      }

      setDuration(calculatedDuration);
      setTotalAmount(calculatedAmount);

      // Check car availability with backend
      try {
        const response = await axios.post(`/api/cars/${id}/check-availability`, {
          startDate: startDateTime.toISOString(),
          endDate: endDateTime.toISOString(),
        });
        setIsCarAvailable(response.data.available);
        setAvailabilityMessage(response.data.message);
      } catch (err) {
        console.error('Availability check error:', err);
        setIsCarAvailable(false);
        setAvailabilityMessage('Failed to check availability. Please try again.');
      }
    };

    calculateAndCheckAvailability();
  }, [car, startDate, endDate, startTime, endTime, bookingType, id]);

  const generateTimeOptions = () => {
    const times = [];
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 60; j += 30) { // Every 30 minutes
        const hour = String(i).padStart(2, '0');
        const minute = String(j).padStart(2, '0');
        times.push(`${hour}:${minute}`);
      }
    }
    return times;
  };

  const validateForm = () => {
    const errors = {};
    if (!startDate) errors.startDate = 'Start date is required.';
    if (!endDate) errors.endDate = 'End date is required.';

    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);

    if (bookingType === 'hourly') {
      const [startHour, startMinute] = startTime.split(':').map(Number);
      startDateTime.setHours(startHour, startMinute, 0, 0);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      endDateTime.setHours(endHour, endMinute, 0, 0);
    } else {
      startDateTime.setHours(0, 0, 0, 0);
      endDateTime.setHours(23, 59, 59, 999);
    }

    if (startDateTime >= endDateTime) {
      errors.dateRange = 'End date/time must be after start date/time.';
    }

    if (!pickupLocation.trim()) errors.pickupLocation = 'Pickup location is required.';
    if (!dropoffLocation.trim()) errors.dropoffLocation = 'Dropoff location is required.';
    if (!isCarAvailable) errors.availability = 'Car is not available for the selected period.';
    if (totalAmount <= 0) errors.amount = 'Booking amount must be greater than zero.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const displayRazorpay = async (orderData, bookingDetails) => {
    const options = {
      key: orderData.key_id, // Enter the Key ID generated from the Dashboard
      amount: orderData.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 means 50000 paise or ₹500.
      currency: orderData.currency,
      name: "CarGo Car Rental",
      description: `Rental for ${orderData.carTitle}`,
      image: "/placeholder.svg?height=100&width=100", // You can use your logo here
      order_id: orderData.orderId, // This is the Order ID created in the backend
      handler: async function (response) {
        // Payment successful, now verify payment and create booking
        try {
          setBookingLoading(true);
          const verifyResponse = await axios.post('/api/bookings/verify-payment', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            bookingDetails: bookingDetails, // Pass all booking details to backend
          });
          toast.success(verifyResponse.data.message || 'Booking confirmed and payment successful!');
          navigate(`/bookings/${verifyResponse.data.booking._id}`);
        } catch (err) {
          console.error('Payment verification or booking creation failed:', err);
          const errorMessage = err.response?.data?.message || 'Payment verification failed. Please contact support.';
          toast.error(errorMessage);
        } finally {
          setBookingLoading(false);
        }
      },
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
        contact: user?.phone || '',
      },
      notes: {
        carId: id,
        userId: user?._id,
      },
      theme: {
        color: "#3B82F6" // Blue color for Razorpay theme
      }
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please correct the errors in the form.');
      return;
    }

    setBookingLoading(true);
    try {
      const bookingDetails = {
        carId: id,
        startDate: startDate.toISOString().split('T')[0], // YYYY-MM-DD
        endDate: endDate.toISOString().split('T')[0],     // YYYY-MM-DD
        startTime,
        endTime,
        bookingType,
        pickupLocation,
        dropoffLocation,
        specialRequests,
      };

      // First, create a Razorpay order on the backend
      const orderResponse = await axios.post('/api/bookings/create-razorpay-order', bookingDetails);
      
      // Then, display the Razorpay payment gateway
      displayRazorpay(orderResponse.data, bookingDetails);

    } catch (err) {
      console.error('Error initiating payment:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to initiate payment.';
      toast.error(errorMessage);
      setBookingLoading(false); // Ensure loading is false if payment initiation fails
    }
  };

  if (loadingCar) {
    return <LoadingSpinner text="Loading car details for booking..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage message="Car not found for booking." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Car Details</span>
        </button>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Book Your Car</h1>

          {/* Car Info Summary */}
          <div className="flex items-center space-x-4 mb-8 p-4 bg-blue-50 rounded-lg">
            <img
              src={car.image || "/placeholder.svg?height=80&width=120&query=car"}
              alt={car.title}
              className="w-24 h-20 object-cover rounded-md"
            />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{car.title}</h2>
              <p className="text-gray-600">{car.brand} {car.model} ({car.year})</p>
              <p className="text-gray-700 font-medium">
                {formatCurrency(car.pricePerDay)}/day | {formatCurrency(car.pricePerHour)}/hour
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Booking Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Booking Type</label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="bookingType"
                    value="daily"
                    checked={bookingType === 'daily'}
                    onChange={(e) => setBookingType(e.target.value)}
                    className="form-radio text-blue-600"
                  />
                  <span className="ml-2 text-gray-900">Daily Rental</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="bookingType"
                    value="hourly"
                    checked={bookingType === 'hourly'}
                    onChange={(e) => setBookingType(e.target.value)}
                    className="form-radio text-blue-600"
                  />
                  <span className="ml-2 text-gray-900">Hourly Rental</span>
                </label>
              </div>
            </div>

            {/* Dates and Times */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  minDate={new Date()}
                  dateFormat="dd/MM/yyyy"
                  locale="en-GB"
                  className={`mt-1 input-field ${formErrors.startDate ? 'border-red-500' : ''}`}
                  placeholderText="Select start date"
                  required
                />
                {formErrors.startDate && <p className="text-red-500 text-xs mt-1">{formErrors.startDate}</p>}
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate || new Date()}
                  dateFormat="dd/MM/yyyy"
                  locale="en-GB"
                  className={`mt-1 input-field ${formErrors.endDate ? 'border-red-500' : ''}`}
                  placeholderText="Select end date"
                  required
                />
                {formErrors.endDate && <p className="text-red-500 text-xs mt-1">{formErrors.endDate}</p>}
                {formErrors.dateRange && <p className="text-red-500 text-xs mt-1">{formErrors.dateRange}</p>}
              </div>
              {bookingType === 'hourly' && (
                <>
                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Start Time</label>
                    <select
                      id="startTime"
                      name="startTime"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="mt-1 input-field"
                    >
                      {generateTimeOptions().map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">End Time</label>
                    <select
                      id="endTime"
                      name="endTime"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="mt-1 input-field"
                    >
                      {generateTimeOptions().map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                    {formErrors.timeRange && <p className="text-red-500 text-xs mt-1">{formErrors.timeRange}</p>}
                  </div>
                </>
              )}
            </div>

            {/* Locations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="pickupLocation" className="block text-sm font-medium text-gray-700">Pickup Location</label>
                <input
                  type="text"
                  id="pickupLocation"
                  name="pickupLocation"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className={`mt-1 input-field ${formErrors.pickupLocation ? 'border-red-500' : ''}`}
                  placeholder="e.g., Mumbai Airport"
                  required
                />
                {formErrors.pickupLocation && <p className="text-red-500 text-xs mt-1">{formErrors.pickupLocation}</p>}
              </div>
              <div>
                <label htmlFor="dropoffLocation" className="block text-sm font-medium text-gray-700">Dropoff Location</label>
                <input
                  type="text"
                  id="dropoffLocation"
                  name="dropoffLocation"
                  value={dropoffLocation}
                  onChange={(e) => setDropoffLocation(e.target.value)}
                  className={`mt-1 input-field ${formErrors.dropoffLocation ? 'border-red-500' : ''}`}
                  placeholder="e.g., Mumbai Central"
                  required
                />
                {formErrors.dropoffLocation && <p className="text-red-500 text-xs mt-1">{formErrors.dropoffLocation}</p>}
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700">Special Requests (Optional)</label>
              <textarea
                id="specialRequests"
                name="specialRequests"
                rows="3"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="mt-1 input-field"
                placeholder="Any specific requests for your rental (e.g., child seat, GPS, etc.)"
              ></textarea>
            </div>

            {/* Availability and Total Amount */}
            <div className="p-4 bg-gray-100 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Duration:</span>
                <span className="text-gray-900 font-semibold">
                  {duration} {bookingType === 'hourly' ? 'hours' : 'days'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Estimated Total:</span>
                <span className="text-2xl font-bold text-blue-600">{formatCurrency(totalAmount)}</span>
              </div>
              <div className={`flex items-center space-x-2 text-sm ${isCarAvailable ? 'text-green-600' : 'text-red-600'}`}>
                {isCarAvailable ? <Info className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                <span>{availabilityMessage}</span>
              </div>
              {formErrors.availability && <p className="text-red-500 text-xs mt-1">{formErrors.availability}</p>}
              {formErrors.amount && <p className="text-red-500 text-xs mt-1">{formErrors.amount}</p>}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={bookingLoading || !isCarAvailable || totalAmount <= 0}
                className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bookingLoading ? (
                  <LoadingSpinner size="small" text="" />
                ) : (
                  <Calendar className="h-5 w-5" />
                )}
                <span>{bookingLoading ? 'Processing Payment...' : 'Confirm Booking & Pay'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
