import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Target, TrendingUp, Calendar, Plus, AlertCircle } from 'lucide-react';
import { skincareAPI } from '../api/skincare.js';
import ProductCard from '../components/ProductCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const Dashboard = () => {
  const [skinTypeResult, setSkinTypeResult] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [routine, setRoutine] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadDashboardData = async () => {
    try {
      // Load skin type result from localStorage
      const storedResult = localStorage.getItem('skinTypeResult');
      if (storedResult) {
        const result = JSON.parse(storedResult);
        setSkinTypeResult(result);
        
        // Load recommendations based on skin type
        await loadRecommendations();
      }
      
      // Load saved routine
      const storedRoutine = localStorage.getItem('skinRoutine');
      if (storedRoutine) {
        setRoutine(JSON.parse(storedRoutine));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    try {
      // Get sample product for recommendations (in real app, this would be based on skin type)
      const products = await skincareAPI.getProducts();
      if (products.length > 0) {
        const recs = await skincareAPI.getRecommendations(products[0].product_id, 4);
        setRecommendations(recs.recommendations || []);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const handleAddToRoutine = (product) => {
    const newRoutine = [...routine, { ...product, addedAt: new Date().toISOString() }];
    setRoutine(newRoutine);
    localStorage.setItem('skinRoutine', JSON.stringify(newRoutine));
  };

  const removeFromRoutine = (productId) => {
    const newRoutine = routine.filter(item => item.product_id !== productId);
    setRoutine(newRoutine);
    localStorage.setItem('skinRoutine', JSON.stringify(newRoutine));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  if (!skinTypeResult) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Take the Quiz First
          </h2>
          <p className="text-gray-600 mb-6">
            Complete our skin type quiz to get personalized recommendations and access your dashboard.
          </p>
          <Link
            to="/quiz"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Take Quiz Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="bg-white bg-opacity-20 p-3 rounded-full">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Welcome to Your Pecura AI Dashboard</h1>
            <p className="text-purple-100">
              Your skin type: <span className="font-semibold">{skinTypeResult.skin_type}</span>
              {skinTypeResult.confidence && (
                <span className="ml-2 text-sm">
                  ({Math.round(skinTypeResult.confidence * 100)}% confidence)
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Skin Type</p>
              <p className="text-xl font-bold text-gray-900">{skinTypeResult.skin_type}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Products in Routine</p>
              <p className="text-xl font-bold text-gray-900">{routine.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Days Active</p>
              <p className="text-xl font-bold text-gray-900">1</p>
            </div>
          </div>
        </div>
      </div>

      {/* Skin Type Description */}
      {skinTypeResult.description && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            About Your Skin Type
          </h2>
          <p className="text-gray-600">{skinTypeResult.description}</p>
        </div>
      )}

      {/* Recommended Products */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Recommended for You
          </h2>
          <Link
            to="/products"
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            View All Products
          </Link>
        </div>
        
        {recommendations.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendations.map((product) => (
              <ProductCard
                key={product.product_id}
                product={product}
                onAddToRoutine={handleAddToRoutine}
                showScore={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No recommendations available yet.</p>
            <Link
              to="/products"
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Browse all products
            </Link>
          </div>
        )}
      </div>

      {/* Current Routine */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Your Current Routine
          </h2>
          <Link
            to="/routine-builder"
            className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Build Routine</span>
          </Link>
        </div>

        {routine.length > 0 ? (
          <div className="space-y-4">
            {routine.map((product) => (
              <div key={product.product_id} className="flex items-center space-x-4 p-4 border rounded-lg">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.brand} • {product.type}</p>
                </div>
                <button
                  onClick={() => removeFromRoutine(product.product_id)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No products in your routine yet.</p>
            <Link
              to="/products"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Add Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;