import { useState } from 'react';
import { Plus, X, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import { skincareAPI } from '../api/skincare.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const IngredientChecker = () => {
  const [ingredients, setIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const commonIngredients = [
    'retinol', 'niacinamide', 'salicylic acid', 'hyaluronic acid', 
    'vitamin c', 'glycolic acid', 'benzoyl peroxide', 'ceramides',
    'peptides', 'alpha arbutin', 'azelaic acid', 'lactic acid'
  ];

  const addIngredient = (ingredient) => {
    const trimmed = ingredient.trim().toLowerCase();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed]);
      setNewIngredient('');
      setAnalysis(null); // Clear previous analysis
    }
  };

  const removeIngredient = (ingredient) => {
    setIngredients(ingredients.filter(i => i !== ingredient));
    setAnalysis(null); // Clear analysis when ingredients change
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addIngredient(newIngredient);
    }
  };

  const analyzeIngredients = async () => {
    if (ingredients.length === 0) return;
    
    setLoading(true);
    try {
      const result = await skincareAPI.analyzeIngredients(ingredients);
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing ingredients:', error);
      alert('Error analyzing ingredients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ingredient Checker</h1>
        <p className="text-gray-600 mt-1">
          Check for potential conflicts and safety warnings in your skincare routine
        </p>
      </div>

      {/* Add Ingredients */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Add Ingredients to Check
        </h2>
        
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            placeholder="Enter ingredient name..."
            value={newIngredient}
            onChange={(e) => setNewIngredient(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            onClick={() => addIngredient(newIngredient)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>

        {/* Common Ingredients */}
        <div>
          <p className="text-sm text-gray-600 mb-3">Common ingredients:</p>
          <div className="flex flex-wrap gap-2">
            {commonIngredients.map((ingredient) => (
              <button
                key={ingredient}
                onClick={() => addIngredient(ingredient)}
                disabled={ingredients.includes(ingredient)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {ingredient}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Current Ingredients */}
      {ingredients.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Your Ingredients ({ingredients.length})
            </h2>
            <button
              onClick={analyzeIngredients}
              disabled={loading}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <LoadingSpinner size="sm" text="" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>Analyze</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {ingredients.map((ingredient) => (
              <div
                key={ingredient}
                className="flex items-center space-x-2 bg-purple-50 text-purple-700 px-3 py-2 rounded-full"
              >
                <span className="capitalize">{ingredient}</span>
                <button
                  onClick={() => removeIngredient(ingredient)}
                  className="text-purple-500 hover:text-purple-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Analysis Results
          </h2>

          {/* Warnings */}
          {analysis.warnings && analysis.warnings.length > 0 ? (
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="font-medium text-amber-800">Potential Conflicts</h3>
              </div>
              <div className="space-y-3">
                {analysis.warnings.map((warning, warningIndex) => (
                  <div key={warningIndex} className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-amber-800 font-medium mb-2">{warning.message}</p>
                    {warning.ingredients && (
                      <div className="flex flex-wrap gap-1">
                        {warning.ingredients.map((ingredient) => (
                          <span
                            key={ingredient}
                            className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-sm capitalize"
                          >
                            {ingredient}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h3 className="font-medium text-green-800">No Conflicts Detected</h3>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">
                  Great! No known conflicts were found between your selected ingredients.
                </p>
              </div>
            </div>
          )}

          {/* Safety Notes */}
          {analysis.safety && analysis.safety.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Safety Notes</h3>
              <div className="space-y-2">
                {analysis.safety.map((note, noteIndex) => (
                  <div key={noteIndex} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-blue-800 text-sm">{note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Disclaimer:</strong> This tool provides general guidance based on common ingredient interactions. 
          Always patch test new products and consult with a dermatologist for personalized advice, 
          especially if you have sensitive skin or specific skin conditions.
        </p>
      </div>
    </div>
  );
};

export default IngredientChecker;