import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Car, PlusCircle, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const AddCar = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    model: '',
    year: '',
    pricePerDay: '',
    pricePerHour: '',
    fuelType: 'Petrol', // Default value
    transmission: 'Automatic', // Default value
    mileage: '',
    seats: '',
    image: '',
    location: '',
    description: '',
    features: '' // Comma-separated string for now
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error for the field when user starts typing
    if (errors[name]) {
      setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
    }
  };

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

    setLoading(true);
    try {
      const carData = {
        ...formData,
        year: parseInt(formData.year),
        pricePerDay: parseFloat(formData.pricePerDay),
        pricePerHour: parseFloat(formData.pricePerHour),
        mileage: parseFloat(formData.mileage),
        seats: parseInt(formData.seats),
        features: formData.features.split(',').map(f => f.trim()).filter(f => f) // Convert comma-separated string to array
      };

      const response = await axios.post('/api/admin/cars', carData);
      toast.success(response.data.message || 'Car added successfully!');
      navigate('/admin/cars'); // Redirect to admin cars list
    } catch (error) {
      console.error('Error adding car:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Failed to add car.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Add New Car</h1>
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
                {errors.pricePerHour && <p className="text-red-500 text-xs mt-1">{errors.pricePerHour}</p>}
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

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <LoadingSpinner size="small" text="" />
                ) : (
                  <PlusCircle className="h-5 w-5" />
                )}
                <span>{loading ? 'Adding Car...' : 'Add Car'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCar;
