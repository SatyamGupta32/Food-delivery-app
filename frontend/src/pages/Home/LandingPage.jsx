import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useAppData } from '../../context/appContext';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { restaurantService } from '../../config/services';
import Loading from '../core/Loading';
import ResCard from '../vendor/components/ResCard';
import { useSocket } from '../../context/socketContext';
import { BiMapPin } from 'react-icons/bi';

const LOCATION_MESSAGES = {
  denied: 'Location is blocked. Allow location in your browser settings to see nearby restaurants.',
  timeout: 'Location took too long. Check GPS / network and try again.',
  unavailable: 'Could not detect your location. Please try again.',
  unsupported: 'Your browser does not support location services.',
};

const LandingPage = () => {

  const { location, loadingLocation, locationError, requestLocation } = useAppData();
  const { socket } = useSocket();

  const [searchParams] = useSearchParams();
  const search = searchParams.get('search');

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRestaurants = async () => {
    if (!location?.latitude || !location?.longitude) return;

    try {
      setLoading(true);
      const { data } = await axios.get(`${restaurantService}/api/restaurant/nearby`, {
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
          search,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setRestaurants(data.restaurants ?? []);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!location?.latitude || !location?.longitude) return;
    fetchRestaurants();
  }, [location?.latitude, location?.longitude, search]);

  useEffect(() => {
    if (!socket) return;

    const onStatusUpdate = ({ restaurantId, isOpen }) => {
      setRestaurants((prev) =>
        prev.map((res) => {
          if (res._id !== restaurantId) return res;
          const updated = { ...res, isOpen };
          if (!isOpen) updated.isLive = false;
          return updated;
        })
      );
    };

    socket.on('restaurant-status-update', onStatusUpdate);
    return () => socket.off('restaurant-status-update', onStatusUpdate);
  }, [socket]);

  if (loadingLocation) return <Loading />;

  if (locationError) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center gap-4">
        <BiMapPin className="w-14 h-14 text-red-500" />
        <h2 className="text-xl font-semibold text-gray-800">Location required</h2>
        <p className="text-gray-500 max-w-md">
          {LOCATION_MESSAGES[locationError] || LOCATION_MESSAGES.unavailable}
        </p>
        <button
          type="button"
          onClick={requestLocation}
          className="px-6 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition"
        >
          Allow location &amp; retry
        </button>
      </div>
    );
  }

  if (!location) return <Loading />;

  if (loading) return <Loading />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {
        restaurants.length > 0 ?
          (
            <div className="grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
              {
                restaurants.map((res) => (
                  <ResCard key={res._id} restaurant={res} />
                ))
              }
            </div>
          ) : (
            <div className="min-h-[70vh] flex items-center justify-center text-gray-500 text-lg font-semibold">
              No Restaurant Found
            </div>
          )
      }
    </div>
  );
};

export default LandingPage;
