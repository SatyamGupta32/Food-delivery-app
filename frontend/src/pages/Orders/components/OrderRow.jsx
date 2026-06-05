const statusColor = {
    placed: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-blue-100 text-blue-700',
    preparing: 'bg-orange-100 text-orange-700',
    ready_for_rider: 'bg-green-100 text-green-700',
    picked_up: 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
};

const OrderRow = ({ order, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="cursor-pointer bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
        >
            {/* top */}
            <div className="flex items-start justify-between gap-3">

                <div>
                    <h3 className="font-semibold text-gray-900">
                        Order #{order._id.slice(-6)}
                    </h3>

                    <p className="text-xs text-gray-500 mt-1">
                        {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                </div>

                <span
                    className={`px-3 py-1 rounded-full text-xs capitalize font-medium
                    ${statusColor[order.status] || 'bg-gray-100 text-gray-700'}
                    `}
                >
                    {order.status.replaceAll('_', ' ')}
                </span>

            </div>

            {/* bottom */}
            <div className="mt-4 pt-3 border-t flex justify-between items-center">

                <div>
                    <p className="text-xs text-gray-500">
                        Total
                    </p>

                    <h2 className="font-bold text-lg">
                        ₹{order.totalPrice}
                    </h2>
                </div>

                <span
                    className={`px-2 py-1 rounded-lg text-[11px]
                    ${order.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                >
                    {order.paymentStatus === 'paid'
                        ? '✅ Paid'
                        : '⏳ Pending'}
                </span>

            </div>
        </div>
    );
};

export default OrderRow;