import axios from 'axios';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { riderService } from '../../../config/services';

const STATUS_LABELS = {
    rider_assigned: 'Assigned — pick up from restaurant',
    picked_up: 'Picked up — deliver to customer',
};

const ActiveRiderOrder = ({ order, onUpdated, fetchProfile }) => {
    const [updating, setUpdating] = useState(false);

    const updateStatus = async () => {
        setUpdating(true);
        try {
            const { data } = await axios.put(
                `${riderService}/api/rider/update-status/${order._id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            toast.success(data.message || 'Order updated');
            onUpdated(data.order);

            if (data.order?.status === 'delivered') {
                fetchProfile?.();
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to update order');
        } finally {
            setUpdating(false);
        }
    };

    const actionLabel =
        order.status === 'rider_assigned'
            ? 'Mark Picked Up'
            : order.status === 'picked_up'
              ? 'Mark Delivered'
              : null;

    const restaurantAddress =
        order.restaurantId?.autoLocation?.formattedAddress ||
        order.restaurantName;

    return (
        <div className="rounded-2xl animate-fade-in pb-8 border border-green-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-green-50 border-b border-green-100 px-5 py-4 flex items-center justify-between">
                <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Active Delivery</p>
                    <h3 className="text-lg font-semibold text-gray-800">
                        #{order._id.slice(-6)}
                    </h3>
                </div>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium capitalize">
                    {order.status.replace(/_/g, ' ')}
                </span>
            </div>

            <div className="p-5 space-y-4">
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-3">
                    <div>
                        <p className="text-xs text-gray-400 uppercase">Restaurant</p>
                        <p className="font-semibold text-gray-800">{order.restaurantName}</p>
                        <p className="text-sm text-gray-500 mt-1">{restaurantAddress}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase">Deliver to</p>
                        <p className="text-sm text-gray-700">{order.deliveryAddress?.formattedAddress}</p>
                        <p className="text-sm text-gray-500 mt-1">
                            Customer: <a href={`tel:${order.deliveryAddress?.mobile}`} className='text-blue-500 hover:text-blue-600'>{order.deliveryAddress?.mobile}</a>
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Items</span>
                    <span className="font-medium text-gray-800">{order.items?.length || 0}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Your earning</span>
                    <span className="font-semibold text-green-700">₹{order.riderAmount}</span>
                </div>

                <p className="text-sm text-gray-600">{STATUS_LABELS[order.status]}</p>

                {actionLabel && (
                    <button
                        onClick={updateStatus}
                        disabled={updating}
                        className={`w-full py-3 rounded-xl font-semibold transition ${
                            updating
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                        }`}
                    >
                        {updating ? 'Updating...' : actionLabel}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ActiveRiderOrder;
