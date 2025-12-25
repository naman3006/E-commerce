/* eslint-disable react-hooks/rules-of-hooks */
import React, { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import OptimizedImage from '../common/OptimizedImage';
import { motion } from 'framer-motion';

const ProductCard = memo(({ product }) => {
  // Validate product data
  if (!product || !product._id) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden p-4">
        <div className="text-center text-gray-500">
          <p>Invalid product data</p>
        </div>
      </div>
    );
  }

  // Memoize derived data to prevent unnecessary recalculations
  const displayData = useMemo(() => {
    return {
      id: product._id || product.id,
      name: product.title || product.name || 'Unnamed Product',
      image: product.image || product.images?.[0] || '/placeholder.svg',
      price: product.price ? `₹${product.price.toFixed(2)}` : 'N/A',
      description: (product.description || '').substring(0, 100),
      rating: product.rating || 0,
      stock: product.stock || 0,
      stockStatus: product.stockStatus || 'out-of-stock',
    };
  }, [product]);

  return (
    <Link
      to={`/products/${displayData.id}`}
      aria-label={`View ${displayData.name}`}
      className="block h-full w-full"
    >
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="group bg-white rounded-2xl shadow-soft overflow-hidden h-full flex flex-col border border-gray-100/50 relative isolate"
      >
        {/* Image Container */}
        <div className="relative w-full pt-[100%] overflow-hidden bg-gray-50 group-hover:bg-gray-100 transition-colors duration-500">
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <OptimizedImage
              src={displayData.image}
              alt={displayData.name}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {product.discount > 0 && (
              <span className="bg-red-500/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg border border-red-400/20 uppercase tracking-wider animate-fade-in">
                -{product.discount}% OFF
              </span>
            )}
            {displayData.stockStatus === 'out-of-stock' && (
              <span className="bg-gray-800/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg border border-gray-700/50 uppercase tracking-wider">
                Sold Out
              </span>
            )}
            {product.isNew && (
              <span className="bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg border border-emerald-400/20 uppercase tracking-wider">
                New
              </span>
            )}
          </div>

          {/* Quick Action Overlay */}
          <div className="absolute bottom-4 left-0 right-0 px-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-10">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-white/95 backdrop-blur-md text-gray-900 font-bold py-3 rounded-xl shadow-lg hover:bg-primary-600 hover:text-white transition-colors duration-300 text-sm uppercase tracking-wide"
            >
              View Details
            </motion.button>
          </div>
        </div>

        {/* Content Container */}
        <div className="p-5 flex flex-col flex-grow bg-white relative z-20">
          <div className="mb-2">
            <div className="flex justify-between items-start mb-2">
              {displayData.rating > 0 ? (
                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-md">
                  <span className="text-yellow-500 text-xs">★</span>
                  <span className="text-xs font-bold text-yellow-700">{displayData.rating.toFixed(1)}</span>
                </div>
              ) : <div></div>}

              <div className="bg-gray-100 p-1.5 rounded-full text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </div>
            </div>

            <h3 className="text-base font-bold text-gray-900 line-clamp-2 font-display text-lg leading-snug group-hover:text-primary-600 transition-colors duration-300 h-12">
              {displayData.name}
            </h3>
          </div>

          {/* Description omitted for cleaner card, visible on hover or details page if needed, OR keep concise */}
          {/* <p className="text-sm text-gray-500 line-clamp-1 mb-4 font-body leading-relaxed h-5 opacity-80">
              {displayData.description}
            </p> */}

          {/* Footer: Price & Action */}
          <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Price</span>
              <span className="text-xl font-bold text-gray-900 font-display">{displayData.price}</span>
            </div>

            <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center transform group-hover:border-primary-200 group-hover:bg-primary-50 group-hover:text-primary-600 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
});

ProductCard.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string,
    id: PropTypes.string,
    title: PropTypes.string,
    name: PropTypes.string,
    image: PropTypes.string,
    images: PropTypes.arrayOf(PropTypes.string),
    price: PropTypes.number,
    description: PropTypes.string,
    rating: PropTypes.number,
    stock: PropTypes.number,
    stockStatus: PropTypes.string,
    discount: PropTypes.number,
  }),
};

ProductCard.displayName = 'ProductCard';

export default ProductCard;