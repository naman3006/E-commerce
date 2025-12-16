// src/pages/Checkout.js
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Navigate } from "react-router-dom";
import { findMyAddresses } from "../store/slices/addressSlice";
import { createOrder } from "../store/slices/ordersSlice";
import { clearCart } from "../store/slices/cartSlice";
import { toast } from "react-toastify";

import { useTranslation } from 'react-i18next';

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



  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">{t('checkout.title')}</h1>

      {/* Address Selection */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">{t('checkout.shipping_address')}</h2>
        {addressesLoading ? (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        ) : (
          <select
            value={selectedAddress}
            onChange={(e) => setSelectedAddress(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('checkout.select_address')}</option>
            {addresses.map((addr) => (
              <option key={addr._id} value={addr._id}>
                {addr.street}, {addr.city}, {addr.zipCode}
              </option>
            ))}
          </select>
        )}
        <Link
          to="/addresses"
          className="text-blue-500 hover:underline mt-2 inline-block"
        >
          {t('checkout.add_address')}
        </Link>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">{t('checkout.order_summary')}</h2>
        <ul className="space-y-2">
          {cart.items.map((item) => (
            <li key={item._id} className="flex justify-between">
              <span>
                {item.name} x {item.quantity}
              </span>
              <span>₹{(item.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="border-t pt-4 mt-4 space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>{t('cart.subtotal')}:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>{t('cart.discount')}:</span>
              <span>-₹{discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>{t('cart.shipping')}:</span>
            <span>
              {shippingCost === 0 ? (
                <span className="text-green-600">{t('cart.free')}</span>
              ) : (
                <span>₹{shippingCost.toFixed(2)}</span>
              )}
            </span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>{t('cart.total')}:</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">{t('checkout.payment_method')}</h2>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="card">{t('checkout.credit_card')}</option>
          <option value="paypal">{t('checkout.paypal')}</option>
        </select>
      </div>

      <button
        onClick={handlePlaceOrder}
        className="w-full bg-green-500 text-white py-4 rounded-md hover:bg-green-600 transition-colors font-semibold text-lg"
      >
        {t('checkout.place_order')}
      </button>
    </div>
  );
};

export default Checkout;
