import { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, Sun, Moon, Save, AlertCircle } from 'lucide-react';
import { skincareAPI } from '../api/skincare.js';
import ProductCard from '../components/ProductCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const RoutineBuilder = () => {
  const [products, setProducts] = useState([]);
  const [morningRoutine, setMorningRoutine] = useState([]);
  const [eveningRoutine, setEveningRoutine] = useState([]);
  const [activeTab, setActiveTab] = useState('morning');
  const [loading, setLoading] = useState(true);
  const [showProductSelector, setShowProductSelector] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load products
      const productsData = await skincareAPI.getProducts();
      setProducts(productsData);

      // Load saved routines
      const savedMorning = localStorage.getItem('morningRoutine');
      const savedEvening = localStorage.getItem('eveningRoutine');
      
      if (savedMorning) {
        setMorningRoutine(JSON.parse(savedMorning));
      }
      if (savedEvening) {
        setEveningRoutine(JSON.parse(savedEvening));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToRoutine = (product) => {
    const routineItem = {
      ...product,
      order: activeTab === 'morning' ? morningRoutine.length : eveningRoutine.length,
      addedAt: new Date().toISOString()
    };

    if (activeTab === 'morning') {
      const newRoutine = [...morningRoutine, routineItem];
      setMorningRoutine(newRoutine);
      localStorage.setItem('morningRoutine', JSON.stringify(newRoutine));
    } else {
      const newRoutine = [...eveningRoutine, routineItem];
      setEveningRoutine(newRoutine);
      localStorage.setItem('eveningRoutine', JSON.stringify(newRoutine));
    }
    
    setShowProductSelector(false);
  };

  const removeFromRoutine = (productId) => {
    if (activeTab === 'morning') {
      const newRoutine = morningRoutine.filter(item => item.product_id !== productId);
      setMorningRoutine(newRoutine);
      localStorage.setItem('morningRoutine', JSON.stringify(newRoutine));
    } else {
      const newRoutine = eveningRoutine.filter(item => item.product_id !== productId);
      setEveningRoutine(newRoutine);
      localStorage.setItem('eveningRoutine', JSON.stringify(newRoutine));
    }
  };

  const moveProduct = (productId, direction) => {
    const routine = activeTab === 'morning' ? morningRoutine : eveningRoutine;
    const currentIndex = routine.findIndex(item => item.product_id === productId);
    
    if (
      (direction === 'up' && currentIndex > 0) ||
      (direction === 'down' && currentIndex < routine.length - 1)
    ) {
      const newRoutine = [...routine];
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      [newRoutine[currentIndex], newRoutine[targetIndex]] = 
      [newRoutine[targetIndex], newRoutine[currentIndex]];
      
      if (activeTab === 'morning') {
        setMorningRoutine(newRoutine);
        localStorage.setItem('morningRoutine', JSON.stringify(newRoutine));
      } else {
        setEveningRoutine(newRoutine);
        localStorage.setItem('eveningRoutine', JSON.stringify(newRoutine));
      }
    }
  };

  const saveRoutines = () => {
    // Combine both routines for the main routine storage
    const combinedRoutine = [...morningRoutine, ...eveningRoutine];
    localStorage.setItem('skinRoutine', JSON.stringify(combinedRoutine));
    alert('Routines saved successfully!');
  };

  const currentRoutine = activeTab === 'morning' ? morningRoutine : eveningRoutine;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading routine builder..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Routine Builder</h1>
          <p className="text-gray-600 mt-1">
            Create your perfect morning and evening skincare routines
          </p>
        </div>
        <button
          onClick={saveRoutines}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Routines</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('morning')}
            className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 font-medium transition-colors ${
              activeTab === 'morning'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Sun className="w-5 h-5" />
            <span>Morning Routine</span>
            <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
              {morningRoutine.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('evening')}
            className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 font-medium transition-colors ${
              activeTab === 'evening'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Moon className="w-5 h-5" />
            <span>Evening Routine</span>
            <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
              {eveningRoutine.length}
            </span>
          </button>
        </div>

        {/* Routine Content */}
        <div className="p-6">
          {currentRoutine.length > 0 ? (
            <div className="space-y-4">
              {currentRoutine.map((product, index) => (
                <div key={product.product_id} className="flex items-center space-x-4 p-4 border rounded-lg bg-gray-50">
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => moveProduct(product.product_id, 'up')}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ↑
                    </button>
                    <span className="text-sm font-medium text-gray-600">
                      {index + 1}
                    </span>
                    <button
                      onClick={() => moveProduct(product.product_id, 'down')}
                      disabled={index === currentRoutine.length - 1}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ↓
                    </button>
                  </div>
                  
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.brand}</p>
                    <span className="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs mt-1">
                      {product.type}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Step {index + 1}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => removeFromRoutine(product.product_id)}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No products in your {activeTab} routine
              </h3>
              <p className="text-gray-600 mb-6">
                Add products to build your perfect {activeTab} skincare routine
              </p>
              <button
                onClick={() => setShowProductSelector(true)}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>
          )}

          {currentRoutine.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <button
                onClick={() => setShowProductSelector(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Product</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product Selector Modal */}
      {showProductSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Add Product to {activeTab === 'morning' ? 'Morning' : 'Evening'} Routine
                </h2>
                <button
                  onClick={() => setShowProductSelector(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.product_id}
                    product={product}
                    onAddToRoutine={addToRoutine}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-2">Routine Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Apply products from thinnest to thickest consistency</li>
              <li>• Use sunscreen as the last step in your morning routine</li>
              <li>• Wait 10-15 minutes between active ingredients</li>
              <li>• Start slowly with new active ingredients</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutineBuilder;