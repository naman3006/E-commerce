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

const Cart = () => {
  const dispatch = useDispatch();
  const { cart, loading } = useSelector((state) => state.cart);
  const { token } = useSelector((state) => state.auth);
  // Moved hooks to top level
  const [couponCode, setCouponCode] = useState('');
  const { coupon, discountAmount, couponError, couponLoading } = useSelector(state => state.cart);

  if (!token || loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p>Loading cart...</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Your cart is empty
        </h2>
        <Link
          to="/products"
          className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
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
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-200">
          {cart.items.map((item) => (
            <CartItem
              key={item._id || item.id}
              item={item}
              onUpdate={(id, qty) =>
                dispatch(updateCartItem({ id, updateData: { quantity: qty } }))
              }
              onRemove={(id) => dispatch(removeFromCart(id))}
            />
          ))}
        </div>
        <div className="p-6 bg-gray-50">
          <div className="flex justify-between items-center text-lg font-semibold">
            <div className="flex flex-col items-end w-full">
              <div className="flex justify-between w-full mb-2">
                <span>Subtotal:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>

              {/* Shipping Charge */}
              <div className="flex justify-between w-full mb-2 text-gray-600">
                <span>Shipping:</span>
                <span>
                  {total > 1000 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    <span>₹40.00</span>
                  )}
                </span>
              </div>

              {/* Coupon Section */}
              <div className="w-full max-w-sm mb-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon Code"
                    disabled={!!coupon}
                    className="flex-1 p-2 border rounded"
                  />
                  {coupon ? (
                    <button
                      onClick={handleRemoveCoupon}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                      {couponLoading ? 'Checking...' : 'Apply'}
                    </button>
                  )}
                </div>
                {couponError && <p className="text-red-500 text-sm mt-1">{couponError}</p>}
                {coupon && (
                  <p className="text-green-600 text-sm mt-1">
                    Coupon "{coupon.code}" applied!
                  </p>
                )}
              </div>

              {coupon && (
                <div className="flex justify-between w-full mb-2 text-green-600">
                  <span>Discount:</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between w-full text-xl border-t pt-2">
                <span>Total:</span>
                <span>₹{(total - discountAmount + (total > 1000 ? 0 : 40)).toFixed(2)}</span>
              </div>

              <div className="mt-4 flex justify-end w-full">
                <Link
                  to="/checkout"
                  className="bg-blue-500 text-white px-8 py-3 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
          <button
            onClick={() => dispatch(clearCart())}
            className="mt-4 text-sm text-red-500 hover:text-red-700 transition-colors"
          >
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
