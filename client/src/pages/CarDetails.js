import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Calendar, Fuel, Users, Settings, MapPin, Star, Clock } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCarDetails();
  }, [id]);

  const fetchCarDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/cars/${id}`);
      setCar(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching car details:', error);
      if (error.response?.status === 404) {
        setError('Car not found');
      } else {
        setError('Failed to load car details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/book/${id}` } } });
    } else {
      navigate(`/book/${id}`);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading car details..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage message={error} onRetry={fetchCarDetails} />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage message="Car not found" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Cars</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Car Image */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={car.image || "/placeholder.svg?height=400&width=600&query=car"}
                alt={car.title}
                className="w-full h-96 object-cover"
              />
            </div>
          </div>

          {/* Car Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{car.title}</h1>
                  <p className="text-xl text-gray-600">{car.brand} {car.model} • {car.year}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">₹{car.pricePerDay}</div>
                  <div className="text-sm text-gray-500">per day</div>
                  <div className="text-lg font-semibold text-gray-700 mt-1">₹{car.pricePerHour}/hour</div>
                </div>
              </div>

              {/* Car Specs */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Fuel className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-500">Fuel Type</div>
                    <div className="font-medium">{car.fuelType}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Settings className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-500">Transmission</div>
                    <div className="font-medium">{car.transmission}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-500">Seats</div>
                    <div className="font-medium">{car.seats} passengers</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-500">Mileage</div>
                    <div className="font-medium">{car.mileage} km/l</div>
                  </div>
                </div>
              </div>

              {/* Location and Rating */}
              <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">{car.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="font-medium">{car.rating || 'New'}</span>
                  <span className="text-gray-500">({car.totalBookings} bookings)</span>
                </div>
              </div>

              {/* Availability Status */}
              <div className="mb-6">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  car.isAvailable 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {car.isAvailable ? 'Available' : 'Not Available'}
                </div>
              </div>

              {/* Book Now Button */}
              <button
                onClick={handleBookNow}
                disabled={!car.isAvailable}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Calendar className="h-5 w-5" />
                <span>{car.isAvailable ? 'Book Now' : 'Not Available'}</span>
              </button>

              {!isAuthenticated && (
                <p className="text-center text-sm text-gray-600 mt-2">
                  <Link to="/login" className="text-blue-600 hover:text-blue-700">
                    Sign in
                  </Link> to book this car
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Description and Features */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Description */}
          {car.description && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-600 leading-relaxed">{car.description}</p>
            </div>
          )}

          {/* Features */}
          {car.features && car.features.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Features</h2>
              <ul className="space-y-2">
                {car.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Similar Cars */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Cars</h2>
          <div className="text-center py-8 text-gray-500">
            <p>Similar cars will be displayed here</p>
            <Link
              to="/cars"
              className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Browse All Cars
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetails;
