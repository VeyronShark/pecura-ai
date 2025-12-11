import { Star, Heart, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

const ProductCard = ({ product, onAddToRoutine, showScore = false }) => {
  const [isFavorited, setIsFavorited] = useState(false);

  const handleFavorite = (e) => {
    e.preventDefault();
    setIsFavorited(!isFavorited);
  };

  const handleAddToRoutine = (e) => {
    e.preventDefault();
    onAddToRoutine?.(product);
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <button
          onClick={handleFavorite}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
        >
          <Heart
            className={`w-4 h-4 ${
              isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'
            }`}
          />
        </button>
        {showScore && product.score && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            {Math.round(product.score * 100)}% match
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm leading-tight">
              {product.name}
            </h3>
            <p className="text-gray-600 text-sm">{product.brand}</p>
          </div>
          <span className="text-lg font-bold text-purple-600">
            ${product.price}
          </span>
        </div>

        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2">
            {product.rating} ({product.reviews_count})
          </span>
        </div>

        <div className="mb-3">
          <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
            {product.type}
          </span>
        </div>

        {showScore && product.match_reason && (
          <p className="text-xs text-gray-600 mb-3 italic">
            {product.match_reason}
          </p>
        )}

        <div className="flex space-x-2">
          <button
            onClick={handleAddToRoutine}
            className="flex-1 bg-purple-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-1"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add to Routine</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;