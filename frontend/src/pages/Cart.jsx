import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import CartItem from "../components/CartItem/CartItem";
import { Link } from "react-router-dom";
import {
  clearCart,
  removeFromCart,
  updateCartItem,
  validateCoupon,
  removeCoupon
} from "../store/slices/cartSlice";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from 'react-i18next';

const Cart = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { cart, loading } = useSelector((state) => state.cart);
  const { token } = useSelector((state) => state.auth);
  // Moved hooks to top level
  const [couponCode, setCouponCode] = useState('');
  const { coupon, discountAmount, couponError, couponLoading } = useSelector(state => state.cart);

  if (!token || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"
        ></motion.div>
        <p className="text-gray-500 animate-pulse">Loading cart...</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
      >
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="mb-8 p-10 bg-indigo-50 rounded-full"
        >
          <svg className="w-24 h-24 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3 font-display">
          {t('cart.empty')}
        </h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Looks like you haven't added anything to your cart yet. Explore our products and find something you love!
        </p>
        <Link to="/products">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-all"
          >
            {t('cart.continue_shopping')}
          </motion.button>
        </Link>
      </motion.div>
    );
  }

  const total = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Coupon Logic
  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;

    // Collect product/category IDs for validation
    const productIds = cart.items.map(item => item.productId._id || item.productId);
    // Assuming backend populates categoryId in product, otherwise validation might fail for category-specific coupons
    // For now passing empty array if not available, backend handles checking applicableProducts.
    const categoryIds = cart.items.map(item => item.productId.categoryId).filter(Boolean);

    dispatch(validateCoupon({
      code: couponCode,
      cartTotal: total,
      productIds,
      categoryIds
    }));
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    setCouponCode('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 font-display">{t('cart.title')}</h1>
          <p className="text-gray-500 mt-2">{cart.items.length} items in your bag</p>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-7">
          <motion.div layout className="space-y-4">
            <AnimatePresence mode="popLayout">
              {cart.items.map((item) => (
                <motion.div
                  layout
                  key={item._id || item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
                  transition={{ layout: { duration: 0.3 } }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <CartItem
                    item={item}
                    onUpdate={(id, qty) =>
                      dispatch(updateCartItem({ id, updateData: { quantity: qty } }))
                    }
                    onRemove={(id) => dispatch(removeFromCart(id))}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => dispatch(clearCart())}
            className="mt-6 text-sm font-medium text-red-500 hover:text-red-600 transition-colors flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {t('cart.clear_btn')}
          </motion.button>
        </div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-5 lg:sticky lg:top-24 mt-8 lg:mt-0"
        >
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 font-display">Order Summary</h2>

            <div className="space-y-4">
              <div className="flex justify-between text-gray-600">
                <span>{t('cart.subtotal')}</span>
                <span className="font-medium text-gray-900">₹{total.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>{t('cart.shipping')}</span>
                <span>
                  {total > 1000 ? (
                    <span className="text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-md text-sm">{t('cart.free')}</span>
                  ) : (
                    <span className="font-medium text-gray-900">₹40.00</span>
                  )}
                </span>
              </div>

              <AnimatePresence>
                {coupon && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex justify-between text-green-600"
                  >
                    <span>{t('cart.discount')}</span>
                    <span className="font-medium">-₹{discountAmount.toFixed(2)}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-bold text-gray-900">{t('cart.total')}</span>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-primary-600 block">
                      ₹{(total - discountAmount + (total > 1000 ? 0 : 40)).toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">Inclusive of all taxes</span>
                  </div>
                </div>

                {/* Coupon Section */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Promo Code</label>
                  <div className="flex gap-2 relative">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder='Try "WELCOME"'
                      disabled={!!coupon}
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all disabled:opacity-50"
                    />
                    {coupon ? (
                      <button
                        onClick={handleRemoveCoupon}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 rounded-xl transition-colors font-medium "
                      >
                        ✕
                      </button>
                    ) : (
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode}
                        className="bg-gray-900 hover:bg-gray-800 text-white px-6 rounded-xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {couponLoading ? (
                          <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></div>
                        ) : 'Apply'}
                      </button>
                    )}
                  </div>
                  <AnimatePresence>
                    {couponError && (
                      <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {couponError}
                      </motion.p>
                    )}
                    {coupon && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-green-600 text-sm mt-2 flex items-center gap-1 bg-green-50 p-2 rounded-lg">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Coupon "{coupon.code}" applied!
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link to="/checkout" className="block w-full">
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 30px -10px rgba(79, 70, 229, 0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-primary-500/20 hover:shadow-2xl transition-all"
                  >
                    {t('cart.checkout_btn')}
                  </motion.button>
                </Link>

                <div className="mt-6 flex items-center justify-center gap-4 text-gray-400 grayscale opacity-70">
                  {/* Payment icons placeholder - could add actual SVGs here */}
                  <span className="text-xs font-medium">SECURE CHECKOUT</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Cart;
