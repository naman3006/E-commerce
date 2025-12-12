/* eslint-disable no-unused-vars */
// src/components/OrderCard/OrderCard.js
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getPaymentStatus, initiatePayment, verifyPayment } from '../../store/slices/paymentsSlice';
import { findMyOrders, cancelOrder } from '../../store/slices/ordersSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { toast } from 'react-toastify';

const OrderCard = ({ order }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status: paymentStatus } = useSelector((state) => state.payments);

  const orderId = order?._id || order?.id;

  React.useEffect(() => {
    if (!orderId) return;
    dispatch(getPaymentStatus(orderId));
  }, [dispatch, orderId]);

  const orderStatus = order.orderStatus || order.status;
  const orderPaymentStatus = order.paymentStatus || order.paymentStatus;

  const orderStatusColor = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    shipped: 'bg-blue-100 text-blue-800',
    delivered: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold">Order #{orderId}</h3>
        <span className={`px-2 py-1 rounded-full text-sm font-medium ${orderStatusColor[order.status] || 'bg-gray-100 text-gray-800'}`}>
          {order.status}
        </span>
      </div>
      <p className="text-gray-600 mb-4">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
      <div className="flex justify-between items-center">
        <span className="font-semibold">Total: ₹{order.totalAmount || order.total || 0}</span>
        <span className="mr-4">Payment: <span className="uppercase">{order.paymentStatus || (paymentStatus?.status) || 'pending'}</span></span>
        {(order.status === 'pending' || order.orderStatus === 'pending') && (order.paymentStatus === 'pending' || !order.paymentStatus) && (
          <div className="flex space-x-2">
            <button
              onClick={async () => {
                if (!orderId) return;
                try {
                  const res = await dispatch(initiatePayment(orderId)).unwrap();
                  await dispatch(verifyPayment({ transactionId: res.transactionId, status: 'success' })).unwrap();
                  dispatch(findMyOrders());
                } catch (err) {
                  toast.error('Payment failed');
                }
              }}
              className="bg-green-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm"
            >
              Pay Now
            </button>
            <button
              onClick={async () => {
                if (!window.confirm('Are you sure you want to cancel this order? Items will be added back to your cart.')) return;
                try {
                  await dispatch(cancelOrder(orderId)).unwrap();

                  if (order.items && order.items.length > 0) {
                    for (const item of order.items) {
                      const productId = item.productId._id || item.productId;
                      const qty = item.quantity;
                      dispatch(addToCart({ productId, quantity: qty }));
                    }
                  }

                  toast.info('Order cancelled. Items added back to cart.');
                  dispatch(findMyOrders());

                  // Redirect to Home as requested
                  navigate('/');
                } catch (err) {
                  console.error('Cancel order error:', err);
                  toast.error(err.message || err.error || 'Failed to cancel order.');
                }
              }}
              className="bg-red-600 text-white px-3 py-1 rounded ml-2" // Added margin-left for spacing
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Footer / Actions */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end items-center gap-3">
        <button
          onClick={() => navigate(`/orders/${orderId}`)}
          className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
        >
          Track Order
        </button>
      </div>
    </div>
  );
};

export default OrderCard;