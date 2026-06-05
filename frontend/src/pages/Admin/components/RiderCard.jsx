import React from 'react'
import DetailRow from '../utils/DetailRow';

const RiderCard = ({ item, actionLabel, onAction, actionClass }) => (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="flex flex-col sm:flex-row">
            <div className="sm:w-36 shrink-0 bg-gray-100 flex items-center justify-center p-4">
                {item.image ? (
                    <img
                        src={item.image}
                        alt={item.name}
                        className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow"
                    />
                ) : (
                    <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs text-center px-2">
                        No photo
                    </div>
                )}
            </div>

            <div className="flex-1 p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                    <span
                        className={`shrink-0 text-xs px-2 py-1 rounded-full ${item.isVerified
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                            }`}
                    >
                        {item.isVerified ? 'Verified' : 'Pending'}
                    </span>
                </div>

                <DetailRow label="Email" value={item.email} breakAll />
                <DetailRow label="Phone" value={item.phone} />
                <DetailRow label="Aadhaar" value={item.adhaar} />
                <DetailRow label="Driving license" value={item.drivingLicense} />

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

export default RiderCard
