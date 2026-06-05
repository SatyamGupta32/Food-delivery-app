import { useEffect, useState } from "react";
import { ORDER_ACTIONS } from "../../../utils/orderFlow";
import toast from "react-hot-toast";
import axios from "axios";
import { restaurantService } from "../../../config/services";


const statusColor = {
    placed: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-blue-100 text-blue-700',
    preparing: 'bg-orange-100 text-orange-700',
    ready_for_rider: 'bg-green-100 text-green-700',
    picked_up: 'bg-green-100 text-green-700',
    completed: 'bg-green-100 text-green-700',
    default: 'bg-red-100 text-red-700',

};

const OrderCard = ({ order, onStatusUpdate, isCompleted = false }) => {
    const [loading, setLoading] = useState(false);
    const [retry, setRetry] = useState(0);

    const actions = ORDER_ACTIONS[order.status] || [];

    const startRetryTimer = () => {

        setRetry(10);

        const interval = setInterval(() => {

            setRetry((prev) => {

                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }

                return prev - 1;

            });

        }, 1000);

    };

    const updateStatus = async (status) => {
        try {
            setLoading(true);

            await axios.put(
                `${restaurantService}/api/order/${order._id}`,
                { status },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            toast.success('Order updated');

            onStatusUpdate?.();

        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.message || 'Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5 flex flex-col h-full">

            {/* Top */}
            <div className="flex flex-col justify-between gap-3">

                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">
                        Order #{order._id.slice(-6)}
                    </h3>
                    <span className={`inline-flex items-center justify-center whitespace-nowrap px-3 h-7 rounded-full text-xs font-medium capitalize ${statusColor[order.status] || statusColor.default}`} >
                        {order.status.replaceAll('_', ' ')}
                    </span>
                </div>
                <p className="text-sm text-gray-500">
                    {order.deliveryAddress?.formattedAddress}
                </p>


            </div>

            {/* Items */}
            <div className="mt-4 space-y-2 flex-1 overflow-y-auto max-h-40 pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">

                {order.items?.map((item) => (
                    <div
                        key={item._id}
                        className="flex items-start justify-between gap-3 text-sm"
                    >
                        <span className="text-gray-700 flex-1 min-w-0 wrap-break-word">
                            {item.quantity} × {item.name}
                        </span>

                        <span className="font-medium text-gray-900 shrink-0">
                            ₹{item.price * item.quantity}
                        </span>
                    </div>
                ))}

            </div>

            {/* Bottom */}
            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">

                <div>
                    <p className="text-sm font-medium text-gray-500">
                        Total Amount
                    </p>

                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-gray-900">
                            ₹{order.totalPrice}
                        </h2>

                        <span
                            className={`px-1 py-0.5 rounded-xs text-[10px] font-light ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                        >
                            {
                                order.paymentStatus === 'paid'
                                    ? '✅ Paid'
                                    : '⏳ Pending Payment'
                            }
                        </span>
                    </div>
                </div>

                {!isCompleted && (
                    <div className="flex gap-2 flex-wrap">
                        {actions.map((status) => (
                            <button
                                key={status}
                                disabled={loading}
                                onClick={() => updateStatus(status)}
                                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium transition-all duration-200 cursor-pointer capitalize"
                            >
                                {loading
                                    ? 'Updating...'
                                    : status.replaceAll('_', ' ')
                                }
                            </button>
                        ))}

                        {order.status === 'ready_for_rider' && (
                            <button
                                disabled={loading || retry > 0}
                                onClick={() => {
                                    updateStatus('ready_for_rider');
                                    startRetryTimer();
                                }}
                                className={`px-4 py-2 rounded-xl text-white text-sm font-medium transition-all duration-200 ${retry > 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 cursor-pointer'}`}
                            >
                                {retry > 0 ? `Retry in ${retry}s` : 'Retry Rider Search'}
                            </button>
                        )}
                    </div>
                )}
            </div>

        </div>
    );
};

export default OrderCard;