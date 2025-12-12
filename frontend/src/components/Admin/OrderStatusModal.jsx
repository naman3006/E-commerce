import React, { useState } from 'react';

const OrderStatusModal = ({ isOpen, onClose, currentStatus, onUpdate, loading }) => {
    const [status, setStatus] = useState(currentStatus);
    const [note, setNote] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const trackingNumber = formData.get('trackingNumber');
        const courierService = formData.get('courierService');

        onUpdate(status, note, trackingNumber, courierService);
    };

    const statuses = [
        { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
        { value: 'processing', label: 'Processing', color: 'bg-indigo-100 text-indigo-800' },
        { value: 'shipped', label: 'Shipped', color: 'bg-purple-100 text-purple-800' },
        { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
        { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden transform transition-all">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-gray-900">Update Order Status</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
                        <div className="grid grid-cols-2 gap-2">
                            {statuses.map((s) => (
                                <button
                                    key={s.value}
                                    type="button"
                                    onClick={() => setStatus(s.value)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${status === s.value
                                        ? `${s.color} border-transparent ring-2 ring-offset-1 ring-blue-500`
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reason / Note <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="e.g. Package arrived at local facility"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                        />
                    </div>

                    {status === 'shipped' && (
                        <div className="grid grid-cols-2 gap-4 animate-fade-in">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Courier Service</label>
                                <input
                                    type="text"
                                    name="courierService"
                                    placeholder="e.g. FedEx"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Number</label>
                                <input
                                    type="text"
                                    name="trackingNumber"
                                    placeholder="e.g. 123456789"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-center items-center"
                        >
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                'Update Status'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OrderStatusModal;
