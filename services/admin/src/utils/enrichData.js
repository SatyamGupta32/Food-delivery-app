import axios from 'axios';
import { AUTH_SERVICE, INTERNAL_SERVICE_KEY } from '../config/env.js';

export const fetchUsersMap = async (userIds) => {
    const uniqueIds = [
        ...new Set(
            userIds
                .map((id) => id?.toString?.() ?? String(id))
                .filter(Boolean)
        ),
    ];

    if (!uniqueIds.length) return new Map();

    try {
        const { data } = await axios.get(`${AUTH_SERVICE}/api/auth/internal/users`, {
            params: { ids: uniqueIds.join(',') },
            headers: { 'x-internal-key': INTERNAL_SERVICE_KEY },
        });

        return new Map(
            (data.users || []).map((user) => [user._id.toString(), user])
        );
    } catch (error) {
        console.error('Auth users fetch failed:', error.message);
        return new Map();
    }
};

export const enrichRiders = async (riders) => {
    const usersMap = await fetchUsersMap(riders.map((r) => r.userId));

    return riders.map((rider) => {
        const user = usersMap.get(rider.userId?.toString());
        return {
            ...rider,
            _id: rider._id,
            userId: rider.userId?.toString(),
            name: user?.name || 'Unknown',
            email: user?.email || '—',
            image: rider.picture || user?.image || null,
            phone: rider.phone || '—',
            adhaar: rider.adhaar || '—',
            drivingLicense: rider.drivingLicense || '—',
            isVerified: rider.isVerified,
        };
    });
};

export const enrichRestaurants = async (restaurants) => {
    const usersMap = await fetchUsersMap(restaurants.map((r) => r.ownerId));

    return restaurants.map((restaurant) => {
        const user = usersMap.get(restaurant.ownerId?.toString());
        return {
            ...restaurant,
            _id: restaurant._id,
            userId: restaurant.ownerId?.toString(),
            restaurantName: restaurant.name,
            ownerName: user?.name || 'Unknown',
            ownerEmail: user?.email || '—',
            ownerImage: user?.image || null,
            image: restaurant.image || null,
            description: restaurant.description || '—',
            address: restaurant.autoLocation?.formattedAddress || '—',
            phone: restaurant.phone || '—',
            isVerified: restaurant.isVerified,
        };
    });
};
