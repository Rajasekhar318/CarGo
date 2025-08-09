import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Car, Save, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const EditCar = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get car ID from URL
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    model: '',
    year: '',
    pricePerDay: '',
    pricePerHour: '',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    mileage: '',
    seats: '',
    image: '',
    location: '',
    description: '',
    features: '',
    isAvailable: true // Added for editing
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [carNotFound, setCarNotFound] = useState(false);

  useEffect(() => {
    fetchCarDetails();
  }, [id]);

  const fetchCarDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/cars/${id}`);
      const carData = response.data;
      setFormData({
        title: carData.title || '',
        brand: carData.brand || '',
        model: carData.model || '',
        year: carData.year || '',
        pricePerDay: carData.pricePerDay || '',
        pricePerHour: carData.pricePerHour || '',
        fuelType: carData.fuelType || 'Petrol',
        transmission: carData.transmission || 'Automatic',
        mileage: carData.mileage || '',
        seats: carData.seats || '',
        image: carData.image || '',
        location: carData.location || '',
        description: carData.description || '',
        features: carData.features ? carData.features.join(', ') : '', // Convert array to comma-separated string
        isAvailable: carData.isAvailable // Set availability
      });
      setError(null);
      setCarNotFound(false);
    } catch (error) {
      console.error('Error fetching car details:', error);
      if (error.response?.status === 404) {
        setCarNotFound(true);
        setError('Car not found.');
      } else {
        setError('Failed to load car details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    // Clear error for the field when user starts typing
    if (errors[name]) {
      setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
    }
  };

  const [errors, setErrors] = useState({}); // State for validation errors

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Car title is required';
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
    if (!formData.model.trim()) newErrors.model = 'Model is required';
    if (!formData.year || isNaN(formData.year) || formData.year < 1990 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Valid year (1990-current+1) is required';
    }
    if (!formData.pricePerDay || isNaN(formData.pricePerDay) || formData.pricePerDay <= 0) {
      newErrors.pricePerDay = 'Price per day must be a positive number';
    }
    if (!formData.pricePerHour || isNaN(formData.pricePerHour) || formData.pricePerHour <= 0) {
      newErrors.pricePerHour = 'Price per hour must be a positive number';
    }
    if (!formData.mileage || isNaN(formData.mileage) || formData.mileage < 0) {
      newErrors.mileage = 'Mileage must be a non-negative number';
    }
    if (!formData.seats || isNaN(formData.seats) || formData.seats < 2 || formData.seats > 8) {
      newErrors.seats = 'Seats must be between 2 and 8';
    }
    if (!formData.image.trim()) {
      newErrors.image = 'Image URL is required';
    } else if (!/^https?:\/\/\S+\.(png|jpe?g|gif|svg|webp)$/i.test(formData.image)) {
      newErrors.image = 'Please enter a valid image URL (png, jpg, gif, svg, webp)';
    }
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (formData.description.length > 500) newErrors.description = 'Description cannot exceed 500 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please correct the errors in the form.');
      return;
    }

    setSubmitting(true);
    try {
      const carData = {
        ...formData,
        year: parseInt(formData.year),
        pricePerDay: parseFloat(formData.pricePerDay),
        pricePerHour: parseFloat(formData.pricePerHour),
        mileage: parseFloat(formData.mileage),
        seats: parseInt(formData.seats),
        features: formData.features.split(',').map(f => f.trim()).filter(f => f)
      };

      const response = await axios.put(`/api/admin/cars/${id}`, carData);
      toast.success(response.data.message || 'Car updated successfully!');
      navigate('/admin/cars'); // Redirect to admin cars list
    } catch (error) {
      console.error('Error updating car:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Failed to update car.';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading car details..." />;
  }

  if (carNotFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage message={error} onRetry={fetchCarDetails} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/admin/cars')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Car List</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Car</h1>
          <div></div> {/* Placeholder for alignment */}
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Car Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`mt-1 input-field ${errors.title ? 'border-red-500' : ''}`}
                  placeholder="e.g., Toyota Camry"
                  required
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>
              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Brand</label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className={`mt-1 input-field ${errors.brand ? 'border-red-500' : ''}`}
                  placeholder="e.g., Toyota"
                  required
                />
                {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand}</p>}
              </div>
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700">Model</label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className={`mt-1 input-field ${errors.model ? 'border-red-500' : ''}`}
                  placeholder="e.g., Camry"
                  required
                />
                {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model}</p>}
              </div>
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year</label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className={`mt-1 input-field ${errors.year ? 'border-red-500' : ''}`}
                  placeholder="e.g., 2022"
                  required
                />
                {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="pricePerDay" className="block text-sm font-medium text-gray-700">Price Per Day (₹)</label>
                <input
                  type="number"
                  id="pricePerDay"
                  name="pricePerDay"
                  value={formData.pricePerDay}
                  onChange={handleChange}
                  className={`mt-1 input-field ${errors.pricePerDay ? 'border-red-500' : ''}`}
                  placeholder="e.g., 2500"
                  required
                />
                {errors.pricePerDay && <p className="text-red-500 text-xs mt-1">{errors.pricePerDay}</p>}
              </div>
              <div>
                <label htmlFor="pricePerHour" className="block text-sm font-medium text-gray-700">Price Per Hour (₹)</label>
                <input
                  type="number"
                  id="pricePerHour"
                  name="pricePerHour"
                  value={formData.pricePerHour}
                  onChange={handleChange}
                  className={`mt-1 input-field ${errors.pricePerHour ? 'border-red-500' : ''}`}
                  placeholder="e.g., 250"
                  required
                />
                {errors.pricePerHour && <p className className="text-red-500 text-xs mt-1">{errors.pricePerHour}</p>}
              </div>
            </div>

            {/* Specifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700">Fuel Type</label>
                <select
                  id="fuelType"
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                  className="mt-1 input-field"
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="CNG">CNG</option>
                </select>
              </div>
              <div>
                <label htmlFor="transmission" className="block text-sm font-medium text-gray-700">Transmission</label>
                <select
                  id="transmission"
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleChange}
                  className="mt-1 input-field"
                >
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>
              <div>
                <label htmlFor="mileage" className="block text-sm font-medium text-gray-700">Mileage (km/l)</label>
                <input
                  type="number"
                  id="mileage"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleChange}
                  className={`mt-1 input-field ${errors.mileage ? 'border-red-500' : ''}`}
                  placeholder="e.g., 15"
                  required
                />
                {errors.mileage && <p className="text-red-500 text-xs mt-1">{errors.mileage}</p>}
              </div>
              <div>
                <label htmlFor="seats" className="block text-sm font-medium text-gray-700">Number of Seats</label>
                <input
                  type="number"
                  id="seats"
                  name="seats"
                  value={formData.seats}
                  onChange={handleChange}
                  className={`mt-1 input-field ${errors.seats ? 'border-red-500' : ''}`}
                  placeholder="e.g., 5"
                  required
                />
                {errors.seats && <p className="text-red-500 text-xs mt-1">{errors.seats}</p>}
              </div>
            </div>

            {/* Image and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700">Image URL</label>
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className={`mt-1 input-field ${errors.image ? 'border-red-500' : ''}`}
                  placeholder="e.g., https://example.com/car.jpg"
                  required
                />
                {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`mt-1 input-field ${errors.location ? 'border-red-500' : ''}`}
                  placeholder="e.g., Mumbai"
                  required
                />
                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
              </div>
            </div>

            {/* Description and Features */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                className={`mt-1 input-field ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Provide a brief description of the car..."
              ></textarea>
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>
            <div>
              <label htmlFor="features" className="block text-sm font-medium text-gray-700">Features (comma-separated)</label>
              <input
                type="text"
                id="features"
                name="features"
                value={formData.features}
                onChange={handleChange}
                className="mt-1 input-field"
                placeholder="e.g., AC, GPS, Bluetooth"
              />
              <p className="mt-1 text-sm text-gray-500">Separate features with commas (e.g., AC, GPS, Bluetooth)</p>
            </div>

            {/* Availability */}
            <div className="flex items-center">
              <input
                id="isAvailable"
                name="isAvailable"
                type="checkbox"
                checked={formData.isAvailable}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isAvailable" className="ml-2 block text-sm font-medium text-gray-900">
                Mark as Available
              </label>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <LoadingSpinner size="small" text="" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                <span>{submitting ? 'Updating Car...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCar;
