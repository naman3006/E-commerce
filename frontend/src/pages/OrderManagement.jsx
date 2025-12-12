// src/pages/OrderManagement.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { findAllOrders, updateOrderStatus } from '../store/slices/ordersSlice';
import { selectUser } from '../store/slices/authSlice';
import { toast } from 'react-toastify';
import OrderStatusModal from '../components/Admin/OrderStatusModal'; // Add import

const OrderManagement = () => {
    const dispatch = useDispatch();
    const { allOrders, loading } = useSelector((state) => state.orders);
    const user = useSelector(selectUser);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [orderToUpdate, setOrderToUpdate] = useState(null);

    useEffect(() => {
        if (user?.role === 'admin') {
            dispatch(findAllOrders());
        }
    }, [dispatch, user]);

    const openStatusModal = (order) => {
        setOrderToUpdate(order);
        setStatusModalOpen(true);
    };

    const handleStatusUpdate = async (newStatus, note, trackingNumber, courierService) => {
        if (!orderToUpdate) return;
        try {
            await dispatch(updateOrderStatus({
                id: orderToUpdate._id,
                statusData: {
                    orderStatus: newStatus,
                    note: note,
                    ...(trackingNumber && { trackingNumber }),
                    ...(courierService && { courierService })
                }
            })).unwrap();
            dispatch(findAllOrders());
            setStatusModalOpen(false);
            setOrderToUpdate(null);
            toast.success('Order status updated successfully');
        } catch (error) {
            toast.error('Failed to update order status');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
            processing: 'bg-indigo-100 text-indigo-800 border-indigo-300',
            shipped: 'bg-purple-100 text-purple-800 border-purple-300',
            delivered: 'bg-green-100 text-green-800 border-green-300',
            cancelled: 'bg-red-100 text-red-800 border-red-300',
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const getPaymentStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-50 text-yellow-700',
            paid: 'bg-green-50 text-green-700',
            failed: 'bg-red-50 text-red-700',
            refunded: 'bg-gray-50 text-gray-700',
        };
        return colors[status] || 'bg-gray-50 text-gray-700';
    };

    const filteredOrders = allOrders.filter((order) => {
        const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
        const matchesSearch =
            order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
                <p className="text-gray-600">Manage and track all customer orders</p>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search Orders
                        </label>
                        <input
                            type="text"
                            placeholder="Search by Order ID, Customer Email, or Name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filter by Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Orders</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-sm font-medium text-gray-600">Total Orders</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{allOrders.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-sm font-medium text-gray-600">Pending</h3>
                    <p className="text-2xl font-bold text-yellow-600 mt-2">
                        {allOrders.filter(o => o.orderStatus === 'pending').length}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-sm font-medium text-gray-600">Processing</h3>
                    <p className="text-2xl font-bold text-blue-600 mt-2">
                        {allOrders.filter(o => o.orderStatus === 'processing').length}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-sm font-medium text-gray-600">Delivered</h3>
                    <p className="text-2xl font-bold text-green-600 mt-2">
                        {allOrders.filter(o => o.orderStatus === 'delivered').length}
                    </p>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Order ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Items
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Payment
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredOrders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        #{order._id?.slice(-8)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm">
                                            <div className="font-medium text-gray-900">
                                                {order.userId?.name || order.userId?.email || 'N/A'}
                                            </div>
                                            <div className="text-gray-500">
                                                {order.customerEmail || order.userId?.email || 'N/A'}
                                            </div>
                                            {order.customerPhone && (
                                                <div className="text-gray-500">{order.customerPhone}</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {order.items?.length || 0} items
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                        ₹{order.totalAmount?.toFixed(2) || '0.00'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                                            {order.paymentStatus || 'pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(order.orderStatus)}`}>
                                            {order.orderStatus || 'pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => openStatusModal(order)}
                                            className="text-gray-700 hover:text-gray-900 bg-gray-100 border border-gray-200 px-3 py-1 rounded-md transition-colors flex items-center gap-1"
                                        >
                                            <span>Update</span>
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredOrders.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No orders found</p>
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                                    <p className="text-gray-600">Order ID: #{selectedOrder._id}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Customer Information */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Name</p>
                                        <p className="font-medium">{selectedOrder.userId?.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Email</p>
                                        <p className="font-medium">{selectedOrder.customerEmail || selectedOrder.userId?.email || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Phone</p>
                                        <p className="font-medium">{selectedOrder.customerPhone || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">User ID</p>
                                        <p className="font-medium text-xs">{selectedOrder.userId?._id || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Items</h3>
                                <div className="space-y-3">
                                    {selectedOrder.items?.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-4">
                                                {item.productImage && (
                                                    <img src={item.productImage} alt={item.productName} className="w-16 h-16 object-cover rounded" />
                                                )}
                                                <div>
                                                    <p className="font-medium">{item.productName || item.productId?.title || 'Product'}</p>
                                                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Summary</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">₹{selectedOrder.subtotal?.toFixed(2) || '0.00'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Shipping</span>
                                        <span className="font-medium">₹{selectedOrder.shippingCost?.toFixed(2) || '0.00'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tax</span>
                                        <span className="font-medium">₹{selectedOrder.tax?.toFixed(2) || '0.00'}</span>
                                    </div>
                                    {selectedOrder.discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount</span>
                                            <span className="font-medium">-${selectedOrder.discount?.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between pt-2 border-t border-gray-300">
                                        <span className="font-semibold text-lg">Total</span>
                                        <span className="font-bold text-lg">₹{selectedOrder.totalAmount?.toFixed(2) || '0.00'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Shipping Address</h3>
                                <p className="text-gray-700">{selectedOrder.shippingAddress}</p>
                            </div>

                            {/* Additional Information */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Payment Method</p>
                                    <p className="font-medium">{selectedOrder.paymentMethod || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Payment Status</p>
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                                        {selectedOrder.paymentStatus || 'pending'}
                                    </span>
                                </div>
                                {selectedOrder.trackingNumber && (
                                    <div>
                                        <p className="text-sm text-gray-600">Tracking Number</p>
                                        <p className="font-medium">{selectedOrder.trackingNumber}</p>
                                    </div>
                                )}
                                {selectedOrder.customerNotes && (
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-600">Customer Notes</p>
                                        <p className="font-medium">{selectedOrder.customerNotes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Update Modal */}
            <OrderStatusModal
                isOpen={statusModalOpen}
                onClose={() => setStatusModalOpen(false)}
                currentStatus={orderToUpdate?.orderStatus}
                onUpdate={handleStatusUpdate}
                loading={loading}
            />
        </div>
    );
};

export default OrderManagement;
