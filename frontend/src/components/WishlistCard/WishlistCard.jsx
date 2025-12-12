import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const WishlistCard = ({ product, onAddToCart, onRemove }) => {
    const {
        _id,
        id,
        title,
        name,
        images,
        thumbnail,
        price,
        description = '',
        stock = 0,
        stockStatus = 'out-of-stock'
    } = product;

    const displayId = _id || id;
    const displayName = title || name || 'Unnamed Product';
    const displayImage = thumbnail || (images && images[0]) || '/placeholder.jpg';
    const displayPrice = price ? `₹${price.toFixed(2)}` : 'N/A';
    const isOutOfStock = stock <= 0 || stockStatus === 'out-of-stock';

    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col sm:flex-row h-full">
            {/* Image Section */}
            <div className="relative w-full sm:w-48 h-48 sm:h-auto flex-shrink-0 bg-gray-50">
                <Link to={`/products/${displayId}`} className="block w-full h-full">
                    <img
                        src={displayImage}
                        alt={displayName}
                        className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                    />
                </Link>
                {isOutOfStock && (
                    <div className="absolute top-2 left-2 bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                        Out of Stock
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <Link to={`/products/${displayId}`} className="group">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{displayName}</h3>
                        </Link>
                    </div>

                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{description}</p>

                    <div className="flex items-baseline space-x-2 mb-4">
                        <span className="text-2xl font-bold text-gray-900">{displayPrice}</span>
                        {/* Placeholder for discount logic if needed later */}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3 mt-4 sm:mt-0 pt-4 border-t border-gray-100 sm:border-0 sm:pt-0">
                    <button
                        onClick={() => onAddToCart(displayId)}
                        disabled={isOutOfStock}
                        className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 shadow-sm flex items-center justify-center space-x-2
                    ${isOutOfStock
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md active:transform active:scale-95'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                    </button>
                    <button
                        onClick={() => onRemove(displayId)}
                        className="p-2.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-200"
                        aria-label="Remove from wishlist"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

WishlistCard.propTypes = {
    product: PropTypes.object.isRequired,
    onAddToCart: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired
};

export default WishlistCard;
