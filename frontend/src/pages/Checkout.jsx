// src/pages/Checkout.js
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { findMyAddresses } from "../store/slices/addressSlice";
import { createOrder } from "../store/slices/ordersSlice";
import { clearCart } from "../store/slices/cartSlice";
import { toast } from "react-toastify";
import { useTranslation } from 'react-i18next';
import { motion } from "framer-motion";
import OptimizedImage from "../components/common/OptimizedImage";

const Checkout = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cart, discountAmount, coupon } = useSelector((state) => state.cart);
  const { addresses, loading: addressesLoading } = useSelector(
    (state) => state.address
  );
  const { token, user } = useSelector((state) => state.auth);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");

  useEffect(() => {
    if (token) {
      dispatch(findMyAddresses());
    }
  }, [dispatch, token]);

  if (!token || !cart || cart.items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const getPrice = (item) => {
    return Number(item.productId?.price || item.price || 0);
  };

  const subtotal = cart.items.reduce(
    (sum, item) => sum + getPrice(item) * item.quantity,
    0
  );

  const shippingCost = subtotal > 1000 ? 0 : 40;
  const total = subtotal - (discountAmount || 0) + shippingCost;

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select address");
      return;
    }

    const addressObj = addresses.find((a) => a._id === selectedAddress);

    if (!addressObj) {
      toast.error("Address not found");
      return;
    }

    const orderData = {
      items: cart.items.map((item) => ({
        productId: item.productId?._id || item.productId || item._id, // Handle populated or flat structure
        quantity: Number(item.quantity),
        price: getPrice(item),
      })),
      totalAmount: total,
      paymentStatus: "pending",
      orderStatus: "pending",
      shippingAddress: {
        fullName: addressObj.fullName || user?.name || "Unknown",
        addressLine: addressObj.addressLine || addressObj.street || '',
        city: addressObj.city || '',
        state: addressObj.state || '',
        postalCode: addressObj.postalCode || addressObj.zipCode || '',
        country: addressObj.country || 'India',
        phone: addressObj.phone || user?.phone || "9999999999"
      },
      appliedCoupon: coupon?._id,
    };

    try {
      // 1. Create Order
      await dispatch(createOrder(orderData)).unwrap();

      // 2. Clear Cart
      dispatch(clearCart());

      navigate("/orders");
    } catch (err) {
      toast.error(err.message || "Order creation failed");
      console.error("Order creation failed", err);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-4xl mx-auto space-y-8 py-8 px-4"
    >
      <motion.h1 variants={itemVariants} className="text-3xl font-bold text-gray-900 font-display border-b pb-4">
        {t('checkout.title')}
      </motion.h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* Address Selection */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm">1</span>
              {t('checkout.shipping_address')}
            </h2>

            {addressesLoading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.length === 0 && (
                  <p className="text-gray-500 text-sm">No addresses found. Please add one.</p>
                )}
                {addresses.map((addr) => (
                  <motion.div
                    key={addr._id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedAddress(addr._id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddress === addr._id
                      ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 mt-1 flex items-center justify-center ${selectedAddress === addr._id ? 'border-primary-600' : 'border-gray-300'}`}>
                        {selectedAddress === addr._id && <div className="w-2.5 h-2.5 rounded-full bg-primary-600"></div>}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{addr.street}</p>
                        <p className="text-sm text-gray-500">{addr.city}, {addr.zipCode}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            <Link
              to="/addresses"
              className="mt-4 flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm border-2 border-dashed border-gray-200 rounded-xl p-3 justify-center hover:border-primary-300 hover:bg-primary-50 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              {t('checkout.add_address')}
            </Link>
          </motion.div>

          {/* Payment */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm">2</span>
              {t('checkout.payment_method')}
            </h2>
            <div className="space-y-3">
              {['card', 'paypal'].map((method) => (
                <motion.div
                  key={method}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setPaymentMethod(method)}
                  className={`p-4 rounded-xl border-2 cursor-pointer flex items-center justify-between ${paymentMethod === method ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === method ? 'border-primary-600' : 'border-gray-300'}`}>
                      {paymentMethod === method && <div className="w-2.5 h-2.5 rounded-full bg-primary-600"></div>}
                    </div>
                    <span className="capitalize font-medium text-gray-900">
                      {method === 'card' ? t('checkout.credit_card') : t('checkout.paypal')}
                    </span>
                  </div>
                  {/* Icons could go here */}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Order Summary Column */}
        <motion.div variants={itemVariants}>
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6 font-display">{t('checkout.order_summary')}</h2>
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {cart.items.map((item) => (
                <div key={item._id} className="flex gap-4 py-2">
                  <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                    {/* Placeholder for product image if available, else standard icon */}
                    {item.productId && item.productId.image ? (
                      <OptimizedImage src={item.productId.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 line-clamp-2">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="font-semibold text-gray-900">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 mt-6 pt-6 space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>{t('cart.subtotal')}</span>
                <span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{t('cart.discount')}</span>
                  <span className="font-medium">-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>{t('cart.shipping')}</span>
                <span>
                  {shippingCost === 0 ? (
                    <span className="text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-md text-sm">{t('cart.free')}</span>
                  ) : (
                    <span className="font-medium text-gray-900">₹{shippingCost.toFixed(2)}</span>
                  )}
                </span>
              </div>

              <div className="border-t border-gray-100 pt-4 mt-2">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xl font-bold text-gray-900">{t('cart.total')}</span>
                  <span className="text-2xl font-bold text-primary-600">₹{total.toFixed(2)}</span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePlaceOrder}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-500/20 hover:shadow-green-500/30 transition-all flex items-center justify-center gap-2"
                >
                  {t('checkout.place_order')}
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Checkout;
