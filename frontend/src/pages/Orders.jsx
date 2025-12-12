// src/pages/Orders.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import OrderCard from '../components/OrderCard/OrderCard';
import { findMyOrders } from '../store/slices/ordersSlice';
import { toast } from 'react-toastify';

const Orders = () => {
  const dispatch = useDispatch();
  const { myOrders, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(findMyOrders());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
      <div className="space-y-4">
        {myOrders.map((order) => (
          <OrderCard key={order._id || order.id} order={order} />
        ))}
      </div>
    </div>
  );
};

export default Orders;