// src/components/ReviewCard/ReviewCard.js
import React from 'react';
import { useSelector } from 'react-redux';

const ReviewCard = ({ review }) => {
  const { user } = useSelector((state) => state.auth);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
    ));
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center space-x-2 mb-2">
        {renderStars(review.rating)}
        <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
      </div>
      <p className="text-gray-900">{review.text}</p>
      {user?.id === review.userId && (
        <button className="mt-2 text-sm text-red-500 hover:text-red-700">Delete</button>
      )}
    </div>
  );
};

export default ReviewCard;  