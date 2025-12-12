import React from 'react';
import { motion } from 'framer-motion';


const OrderTracking = ({
    status,
    history,
    createdAt,
    orderId,
    estimatedDelivery,
    trackingNumber,
    courierService
}) => {
    // Map backend status to UI steps
    const steps = [
        { key: 'pending', label: 'Ordered', description: 'Your order has been placed.' },
        { key: 'confirmed', label: 'Confirmed', description: 'Seller has processed your order.' },
        { key: 'processing', label: 'Packed', description: 'Your item has been packed.' },
        { key: 'shipped', label: 'Shipped', description: 'Your item has been shipped.' },
        { key: 'delivered', label: 'Delivered', description: 'Your item has been delivered.' },
    ];

    const getStepStatus = (stepKey) => {
        if (status === 'cancelled') return 'cancelled';
        const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
        const currentIndex = statusOrder.indexOf(status);
        const stepIndex = statusOrder.indexOf(stepKey);

        if (stepIndex <= currentIndex) return 'completed';
        return 'upcoming';
    };

    const getStepData = (stepKey) => {
        if (!history) return null;
        const entry = history.slice().reverse().find(h => h.status === stepKey);
        // Fallback for pending if not in history but created
        if (stepKey === 'pending' && !entry) {
            return {
                timestamp: createdAt,
                note: 'Your order has been placed.'
            };
        }
        return entry;
    };

    return (
        <div className="w-full bg-white font-sans">
            {status === 'cancelled' && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-700"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <div>
                        <p className="font-bold">Order Cancelled</p>
                        <p className="text-sm opacity-80">This order has been cancelled.</p>
                    </div>
                </motion.div>
            )}

            <div className="relative pl-4 md:pl-8 py-2">
                {steps.map((step, index) => {
                    const stepStatus = getStepStatus(step.key);
                    const isCompleted = stepStatus === 'completed';
                    const isLast = index === steps.length - 1;
                    const data = getStepData(step.key);
                    const dateObj = data?.timestamp ? new Date(data.timestamp) : null;

                    // Determine if the line *after* this dot should be green
                    // It should be green if THIS step is completed AND the NEXT step is completed
                    const nextStepKey = !isLast ? steps[index + 1].key : null;
                    const nextStepStatus = nextStepKey ? getStepStatus(nextStepKey) : 'upcoming';
                    const isLineActive = isCompleted && nextStepStatus === 'completed';

                    return (
                        <div key={step.key} className="relative pb-10 last:pb-0">
                            {/* Vertical Line Container */}
                            {!isLast && (
                                <div className="absolute left-[11px] top-4 bottom-0 w-[2px] bg-gray-200">
                                    {/* Animated Green Line */}
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: isLineActive ? '100%' : '0%' }}
                                        transition={{ duration: 0.5, delay: index * 0.3 }}
                                        className="absolute top-0 left-0 w-full bg-green-500"
                                    ></motion.div>
                                </div>
                            )}

                            <div className="flex gap-4 items-start">
                                {/* Dot */}
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.3, delay: index * 0.3 - 0.1 }}
                                    className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white transition-colors duration-300
                                    ${isCompleted ? 'border-green-500' : 'border-gray-300'}`}
                                >
                                    {isCompleted ? (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: index * 0.3 }}
                                            className="w-3 h-3 bg-green-500 rounded-full"
                                        ></motion.div>
                                    ) : (
                                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                    )}
                                </motion.div>

                                {/* Content */}
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.3 }}
                                    className="flex-1 -mt-1"
                                >
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
                                        <h3 className={`text-base font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                                            {step.label}
                                        </h3>
                                        {dateObj && (
                                            <span className="text-xs text-gray-500">
                                                {dateObj.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        )}
                                    </div>

                                    <div className={`text-sm mt-1 space-y-2 ${isCompleted ? 'text-gray-700' : 'text-gray-400'}`}>
                                        <p>{data?.note || step.description}</p>

                                        {/* Tracking Info (Only show on Shipped/Delivered if available) */}
                                        {step.key === 'shipped' && isCompleted && (trackingNumber || courierService) && (
                                            <div className="bg-blue-50 p-3 rounded-md border border-blue-100 text-blue-800 text-xs mt-2">
                                                {courierService && <p><span className="font-semibold">Courier:</span> {courierService}</p>}
                                                {trackingNumber && <p><span className="font-semibold">Tracking #:</span> {trackingNumber}</p>}
                                            </div>
                                        )}
                                    </div>

                                    {dateObj && (
                                        <p className="text-xs text-gray-400 mt-1">
                                            {dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    )}

                                    {/* Estimated Delivery for last step if not delivered */}
                                    {step.key === 'delivered' && !isCompleted && estimatedDelivery && status !== 'cancelled' && (
                                        <p className="text-sm text-green-600 mt-2 font-medium">
                                            Expected by {(() => {
                                                const d = new Date(estimatedDelivery);
                                                return isNaN(d.getTime()) ? 'Calculating...' : d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
                                            })()}
                                        </p>
                                    )}
                                </motion.div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderTracking;