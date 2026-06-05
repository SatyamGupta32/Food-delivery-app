import React from 'react'
import { useNavigate } from 'react-router-dom';
import { getRestaurantStatusLabel, isRestaurantLive } from '../../../utils/restaurantStatus';

const ResCard = ({ restaurant }) => {

    const navigate = useNavigate();
    const statusLabel = getRestaurantStatusLabel(restaurant);
    const isLive = isRestaurantLive(restaurant);
    const dimmed = !!statusLabel;

    return (
        <div
            className={`cursor-pointer overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md ${dimmed ? 'opacity-80' : ''}`}
            onClick={() => navigate(`/restaurant/${restaurant._id}`)}
        >
            <div className='relative h-40 w-full overflow-hidden'>
                <img
                    src={restaurant.image}
                    alt="restaurant image"
                    className={`h-full w-full object-cover transition duration-300 hover:scale-105 ${dimmed ? 'grayscale brightness-75' : ''}`}
                />
                {
                    statusLabel && (
                        <div className='absolute inset-0 flex items-center justify-center rounded bg-black/60 text-md font-semibold text-white'>
                            {statusLabel}
                        </div>
                    )
                }
            </div>

            <div className='p-3 space-y-1'>
                <h3 className='text-base text-gray-800 truncate font-semibold'>{restaurant.name}</h3>
                <p className='text-sm text-gray-500'>  {
                    restaurant.distanceKm < 1
                        ? `${restaurant.distanceMeter} m away`
                        : `${restaurant.distanceKm} km away`
                }</p>
                {restaurant.isOpen && !isLive && (
                    <p className='text-xs text-sky-600'>Temporarily offline — check back soon⌚</p>
                )}
            </div>
        </div>
    )
}

export default ResCard;
