import { useEffect, useState } from 'react';
import axios from 'axios';
import { riderService } from '../../../config/services';
import toast from 'react-hot-toast';

const RiderOrderCard = ({ orderId, onAccepted, onExpired }) => {

    const [accepting, setAccepting] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(10);

    useEffect(() => {
        const intereval = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(intereval);
                    onExpired?.();
                    return 0;
                }
                return prev - 1;
            })
        }, 1000);

        return () => clearInterval(intereval);
    }, [orderId, onExpired]);

    const acceptOrder = async () => {
        setAccepting(true);
        try {
            await axios.post(`${riderService}/api/rider/accept-order/${orderId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                })

            toast.success('order accepted');
            onAccepted();
        } catch (error) {
            toast.error(error.response.data.message || 'failed to accept order')
        } finally {
            setAccepting(false);
        }
    };

    return (
        <div className="rounded-2xl border border-orange-200 bg-white shadow-sm overflow-hidden">

            {/* Header */}
            <div className="bg-orange-50 border-b border-orange-100 px-4 py-3 flex items-center justify-between">

                <div>
                    <p className="text-xs text-gray-500">
                        Incoming Order
                    </p>

                    <h3 className="font-semibold text-gray-800">
                        #{orderId.slice(-6)}
                    </h3>
                </div>

                <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-lg">
                    {secondsLeft}
                </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">

                <div className="flex items-center justify-between text-sm">

                    <span className="text-gray-500">
                        Status
                    </span>

                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-medium">
                        Waiting
                    </span>
                </div>

                <button
                    onClick={acceptOrder}
                    disabled={accepting}
                    className={`
                        w-full py-3 rounded-xl font-semibold transition-all duration-200
                        ${accepting
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                        }
                    `}
                >
                    {
                        accepting
                            ? 'Accepting...'
                            : 'Accept Order'
                    }
                </button>

                <p className="text-xs text-center text-gray-400">
                    This request will disappear in {secondsLeft}s
                </p>

            </div>
        </div>
    );
}

export default RiderOrderCard
