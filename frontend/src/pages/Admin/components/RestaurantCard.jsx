import React from 'react'
import DetailRow from '../utils/DetailRow';

const RestaurantCard = ({ item, actionLabel, onAction, actionClass }) => (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="flex flex-col sm:flex-row">
            <div className="sm:w-40 h-40 sm:h-auto shrink-0 bg-gray-100">
                {item.image ? (
                    <img
                        src={item.image}
                        alt={item.restaurantName}
                        className="w-full h-full object-cover min-h-[160px]"
                    />
                ) : (
                    <div className="w-full h-full min-h-[160px] flex items-center justify-center text-gray-400 text-sm">
                        No image
                    </div>
                )}
            </div>

            <div className="flex-1 p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-bold text-gray-900">
                        {item.restaurantName || item.name}
                    </h3>
                    <span
                        className={`shrink-0 text-xs px-2 py-1 rounded-full ${item.isVerified
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                            }`}
                    >
                        {item.isVerified ? 'Verified' : 'Pending'}
                    </span>
                </div>

                <DetailRow label="Owner" value={item.ownerName} />
                <DetailRow label="Owner email" value={item.ownerEmail} breakAll />
                <DetailRow label="Phone" value={item.phone} />
                <DetailRow label="Address" value={item.address} />
                {item.description && item.description !== '—' && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                        <span className="font-semibold text-gray-900">About: </span>
                        {item.description}
                    </p>
                )}

                {item.ownerImage && (
                    <div className="flex items-center gap-2 pt-1">
                        <span className="text-xs font-semibold text-gray-500">Owner photo</span>
                        <img
                            src={item.ownerImage}
                            alt="Owner"
                            className="w-10 h-10 rounded-full object-cover border"
                        />
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => onAction(String(item._id))}
                    className={`mt-3 w-full py-2.5 rounded-lg font-medium text-white transition ${actionClass}`}
                >
                    {actionLabel}
                </button>
            </div>
        </div>
    </div>
);

export default RestaurantCard
