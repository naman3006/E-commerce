// src/pages/Wishlist.js
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { useNavigate } from 'react-router-dom';
import WishlistCard from '../components/WishlistCard/WishlistCard';
import { addToCart } from '../store/slices/cartSlice';
import { removeFromWishlist } from '../store/slices/wishlistSlice';
import { toast } from 'react-toastify';

const Wishlist = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { wishlist } = useSelector((state) => state.wishlist);
  const { token } = useSelector((state) => state.auth);

  const handleAddToCartFromWishlist = (productId) => {
    if (!token) {
      navigate('/login');
      toast.info('Please log in to add items to your cart');
      return;
    }
    dispatch(addToCart({ productId, quantity: 1 }));
  };

  const wishlistItems = (wishlist?.productIds || []).filter(item => item !== null);

  if (!token || !wishlist || wishlistItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="bg-blue-50 p-6 rounded-full mb-6 animate-fade-in-up">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
        <p className="text-gray-500 mb-8 max-w-md">Looks like you haven't added anything to your wishlist yet. Explore our products and save your favorites!</p>
        <button
          onClick={() => navigate('/products')}
          className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl font-medium transform hover:-translate-y-1"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex justify-between items-end border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-500 mt-1">{wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {wishlistItems.map((item) => (
          <WishlistCard
            key={item._id || item.id}
            product={item}
            onAddToCart={(id) => handleAddToCartFromWishlist(id)}
            onRemove={(id) => dispatch(removeFromWishlist(id))}
          />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;