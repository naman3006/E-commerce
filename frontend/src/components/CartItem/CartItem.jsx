// src/components/CartItem/CartItem.js
import React from 'react';
import OptimizedImage from '../common/OptimizedImage';
import { getOptimizedImageUrl } from '../../utils/urlUtils';

const CartItem = ({ item, onUpdate, onRemove }) => {
  // Extract product details from the nested productId object if it exists (populated)
  // otherwise fallback to item properties (legacy support)
  const product = item.productId || {};
  const title = product.title || item.title || 'Product';
  // Price and quantity are stored on the cart item itself
  const { price, quantity } = item;

  const itemId = item._id || item.id || product._id; // Handle different ID locations

  const handleQuantityChange = (newQty) => {
    onUpdate(itemId, newQty);
  };

  // Helper to get image from product details
  const imageSrc = getOptimizedImageUrl(
    product.thumbnail ||
    (product.images && product.images[0]) ||
    item.thumbnail ||
    (item.images && item.images[0])
  );

  return (
    <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
      <div className="flex items-center gap-4 flex-1">
        <OptimizedImage
          src={imageSrc}
          alt={title}
          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-100"
        />
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2">{title}</h3>
          <p className="text-primary-600 font-medium">₹{price}</p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
        <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-1">
          <button
            onClick={() => handleQuantityChange(Math.max(1, item.quantity - 1))}
            className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-primary-600 font-bold transition-colors"
          >
            -
          </button>
          <span className="w-8 text-center font-medium text-gray-900">{item.quantity}</span>
          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-primary-600 font-bold transition-colors"
          >
            +
          </button>
        </div>
        <button
          onClick={() => itemId && onRemove(itemId)}
          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors group"
          title="Remove item"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>
    </div>
  );
};

export default CartItem;