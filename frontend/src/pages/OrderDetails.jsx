// import React, { useEffect, useState } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import api from "../store/api/api";
// import OrderTracking from '../components/OrderTracking/OrderTracking';
// import { toast } from 'react-toastify';

// const OrderDetails = () => {
//     const { id } = useParams();
//     const [order, setOrder] = useState(null);
//     const [loading, setLoading] = useState(true);

//     // You could also fetch from Redux store if you have all orders there, 
//     // but fetching fresh data for details is safer for real-time status.

//     useEffect(() => {
//         const fetchOrder = async () => {
//             try {
//                 const { data } = await api.get(`/orders/${id}`);
//                 setOrder(data);
//             } catch (err) {
//                 toast.error('Failed to load order details');
//                 console.error(err);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchOrder();
//     }, [id]);

//     if (loading) {
//         return (
//             <div className="min-h-screen flex justify-center items-center">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
//             </div>
//         );
//     }

//     if (!order) {
//         return (
//             <div className="max-w-7xl mx-auto px-4 py-12 text-center">
//                 <h2 className="text-2xl font-bold text-gray-800">Order not found</h2>
//                 <Link to="/orders" className="text-primary-600 hover:underline mt-4 inline-block">Back to My Orders</Link>
//             </div>
//         );
//     }

//     return (
//         <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
//             {/* Breadcrumb */}
//             <nav className="flex mb-8 text-gray-500 text-sm">
//                 <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
//                 <span className="mx-2">/</span>
//                 <Link to="/orders" className="hover:text-primary-600 transition-colors">My Orders</Link>
//                 <span className="mx-2">/</span>
//                 <span className="text-gray-900 font-medium">#{order._id || id}</span>
//             </nav>

//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//                 {/* Left Column: Tracking & Items */}
//                 <div className="lg:col-span-2 space-y-8">

//                     {/* Tracking Card */}
//                     <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100">
//                         <h2 className="text-xl font-bold text-gray-900 mb-6">Order Status</h2>
//                         <OrderTracking
//                             status={order.orderStatus}
//                             history={order.statusHistory}
//                             createdAt={order.createdAt}
//                         />
//                     </div>

//                     {/* Items Card */}
//                     <div className="bg-white rounded-2xl shadow-soft overflow-hidden border border-gray-100">
//                         <div className="p-6 border-b border-gray-100">
//                             <h2 className="text-xl font-bold text-gray-900">Items Ordered</h2>
//                         </div>
//                         <div className="divide-y divide-gray-100">
//                             {(order.items || []).map((item, index) => (
//                                 <div key={index} className="p-6 flex gap-4">
//                                     <div className="w-20 h-20 rounded-xl bg-gray-50 p-2 flex-shrink-0 border border-gray-100">
//                                         {item.productImage || item.productId?.images?.[0] ? (
//                                             <img
//                                                 src={item.productImage || item.productId?.images?.[0]}
//                                                 alt={item.productName}
//                                                 className="w-full h-full object-contain mix-blend-multiply"
//                                             />
//                                         ) : (
//                                             <div className="w-full h-full flex items-center justify-center text-gray-400">
//                                                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
//                                             </div>
//                                         )}
//                                     </div>
//                                     <div>
//                                         <h3 className="font-semibold text-gray-900 mb-1">
//                                             {item.productName || item.productId?.name || 'Product'}
//                                         </h3>
//                                         <p className="text-sm text-gray-500 mb-2">
//                                             Quantity: {item.quantity} × ₹{item.price}
//                                         </p>
//                                         <p className="text-primary-600 font-bold">
//                                             ₹{(item.quantity * item.price).toFixed(2)}
//                                         </p>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 </div>

//                 {/* Right Column: Summary & Address */}
//                 <div className="space-y-8">
//                     {/* Shipping Address */}
//                     <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100">
//                         <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Delivery Address</h3>
//                         <div className="text-gray-600 leading-relaxed">
//                             {order.shippingAddress && typeof order.shippingAddress === 'object' ? (
//                                 <>
//                                     <p className="font-semibold text-gray-900 mb-1">{order.shippingAddress.fullName}</p>
//                                     <p>{order.shippingAddress.addressLine}</p>
//                                     <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
//                                     <p>{order.shippingAddress.postalCode}</p>
//                                     <p>{order.shippingAddress.country}</p>
//                                     <p className="mt-2 text-sm text-gray-500">{order.shippingAddress.phone}</p>
//                                 </>
//                             ) : (
//                                 <p>{JSON.stringify(order.shippingAddress)}</p>
//                             )}
//                         </div>
//                     </div>

//                     {/* Price Breakdown */}
//                     <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100">
//                         <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Order Summary</h3>
//                         <div className="space-y-3 text-sm">
//                             <div className="flex justify-between text-gray-600">
//                                 <span>Subtotal</span>
//                                 <span>₹{order.subtotal?.toFixed(2) || (order.totalAmount - (order.shippingCost || 0)).toFixed(2)}</span>
//                             </div>
//                             <div className="flex justify-between text-gray-600">
//                                 <span>Shipping</span>
//                                 <span className="text-green-600">
//                                     {order.shippingCost === 0 ? 'Free' : `₹${order.shippingCost}`}
//                                 </span>
//                             </div>
//                             {order.discount > 0 && (
//                                 <div className="flex justify-between text-green-600">
//                                     <span>Discount</span>
//                                     <span>-₹{order.discount.toFixed(2)}</span>
//                                 </div>
//                             )}
//                             <div className="pt-3 mt-3 border-t border-gray-100 flex justify-between font-bold text-lg text-gray-900">
//                                 <span>Total</span>
//                                 <span>₹{order.totalAmount.toFixed(2)}</span>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Help Card */}
//                     <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
//                         <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
//                         <p className="text-sm text-blue-700 mb-4">
//                             If you have issues with this order, please contact our support team.
//                         </p>
//                         <button className="w-full py-2 bg-white text-blue-600 font-semibold rounded-lg shadow-sm border border-blue-200 hover:bg-blue-50 transition-colors">
//                             Contact Support
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default OrderDetails;


import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from "../store/api/api";
import OrderTracking from '../components/OrderTracking/OrderTracking';
import { toast } from 'react-toastify';
import { useSocket } from '../contexts/SocketContext';

const OrderDetails = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const socket = useSocket();

    // You could also fetch from Redux store if you have all orders there,
    // but fetching fresh data for details is safer for real-time status.
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await api.get(`/orders/${id}`);
                // Log the response for debugging (remove in production)
                console.log('Fetched order:', data);
                setOrder(data);
            } catch (err) {
                toast.error('Failed to load order details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    // Listen for real-time updates
    useEffect(() => {
        if (socket && order) {
            const handleOrderUpdate = (payload) => {
                if (payload.orderId === order._id) {
                    setOrder(prev => ({ ...prev, ...payload.order })); // Merge updates
                    toast.info(`Order status updated to ${payload.status}`);
                }
            };

            socket.on('order_update', handleOrderUpdate);

            return () => {
                socket.off('order_update', handleOrderUpdate);
            };
        }
    }, [socket, order]);

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12 text-center">
                <h2 className="text-2xl font-bold text-gray-800">Order not found</h2>
                <Link to="/orders" className="text-primary-600 hover:underline mt-4 inline-block">Back to My Orders</Link>
            </div>
        );
    }

    // Compute subtotal dynamically from items to avoid missing order.subtotal
    const subtotal = order.items?.reduce((sum, item) => {
        const price = item.price || 0;
        return sum + (item.quantity || 0) * price;
    }, 0) || 0;

    // Safe defaults
    const shippingCost = order.shippingCost || 0;
    const discount = order.discount || 0;
    const totalAmount = order.totalAmount || (subtotal + shippingCost - discount); // Fallback computation

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
            {/* Breadcrumb */}
            <nav className="flex mb-8 text-gray-500 text-sm">
                <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
                <span className="mx-2">/</span>
                <Link to="/orders" className="hover:text-primary-600 transition-colors">My Orders</Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900 font-medium">#{order._id || id}</span>
            </nav>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Tracking & Items */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Tracking Card */}
                    <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100">
                        <div className="mb-10 animate-slide-up">
                            <OrderTracking
                                status={order.orderStatus}
                                history={order.statusHistory}
                                createdAt={order.createdAt}
                                orderId={order._id}
                                trackingNumber={order.trackingNumber}
                                courierService={order.courierService}
                                estimatedDelivery={order.estimatedDeliveryDate || (order.createdAt ? new Date(new Date(order.createdAt).setDate(new Date(order.createdAt).getDate() + 5)) : null)}
                            />
                        </div>
                    </div>
                    {/* Items Card */}
                    <div className="bg-white rounded-2xl shadow-soft overflow-hidden border border-gray-100">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Items Ordered</h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {(order.items || []).length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <p>No items found in this order.</p>
                                </div>
                            ) : (
                                (order.items || []).map((item, index) => {
                                    // Safe calc for item total (handle undefined price/quantity)
                                    const itemPrice = item.price || 0;
                                    const itemQuantity = item.quantity || 0;
                                    const itemTotal = itemQuantity * itemPrice;
                                    return (
                                        <div key={index} className="p-6 flex gap-4">
                                            <div className="w-20 h-20 rounded-xl bg-gray-50 p-2 flex-shrink-0 border border-gray-100">
                                                {item.productImage || item.productId?.images?.[0] ? (
                                                    <img
                                                        src={item.productImage || item.productId?.images?.[0]}
                                                        alt={item.productName}
                                                        className="w-full h-full object-contain mix-blend-multiply"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-1">
                                                    {item.productName || item.productId?.name || 'Product'}
                                                </h3>
                                                <p className="text-sm text-gray-500 mb-2">
                                                    Quantity: {itemQuantity} × ₹{itemPrice.toFixed(2)}
                                                </p>
                                                <p className="text-primary-600 font-bold">
                                                    ₹{isNaN(itemTotal) ? '0.00' : itemTotal.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
                {/* Right Column: Summary & Address */}
                <div className="space-y-8">
                    {/* Shipping Address */}
                    <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Delivery Address</h3>
                        <div className="text-gray-600 leading-relaxed">
                            {order.shippingAddress && typeof order.shippingAddress === 'object' ? (
                                <>
                                    <p className="font-semibold text-gray-900 mb-1">{order.shippingAddress.fullName}</p>
                                    <p>{order.shippingAddress.addressLine}</p>
                                    <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                                    <p>{order.shippingAddress.postalCode}</p>
                                    <p>{order.shippingAddress.country}</p>
                                    <p className="mt-2 text-sm text-gray-500">{order.shippingAddress.phone}</p>
                                </>
                            ) : (
                                <p>{JSON.stringify(order.shippingAddress)}</p>
                            )}
                        </div>
                    </div>
                    {/* Price Breakdown */}
                    <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Order Summary</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toFixed(2)}</span> {/* Now always computed safely */}
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span className="text-green-600">
                                    {shippingCost === 0 ? 'Free' : `₹${shippingCost.toFixed(2)}`}
                                </span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span>-₹{discount.toFixed(2)}</span> {/* Safe now with default */}
                                </div>
                            )}
                            <div className="pt-3 mt-3 border-t border-gray-100 flex justify-between font-bold text-lg text-gray-900">
                                <span>Total</span>
                                <span>₹{totalAmount.toFixed(2)}</span> {/* Safe with fallback computation */}
                            </div>
                        </div>
                    </div>
                    {/* Help Card */}
                    <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                        <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
                        <p className="text-sm text-blue-700 mb-4">
                            If you have issues with this order, please contact our support team.
                        </p>
                        <button className="w-full py-2 bg-white text-blue-600 font-semibold rounded-lg shadow-sm border border-blue-200 hover:bg-blue-50 transition-colors">
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;