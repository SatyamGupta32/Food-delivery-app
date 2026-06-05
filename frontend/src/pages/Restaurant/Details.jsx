import axios from 'axios';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import Loading from '../core/Loading';
import { restaurantService } from '../../config/services';
import RestaurantProfile from '../vendor/components/RestaurantProfile';
import Error from '../core/Error';
import NotFound from '../core/NotFound';
import MenuItems from '../vendor/components/MenuItems';

const Details = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const [error, setError] = useState('');

  const fetchRes = async () => {
    try {
      const { data } = await axios.get(`${restaurantService}/api/restaurant/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setRestaurant(data.restaurant || null);
    } catch (error) {

      console.log(error);

      const status = error?.response?.status;
      const message = error?.response?.data?.message;

      if (status === 404) {
        setRestaurant(null);
      } else {
        setError(message || 'Something went wrong');
        toast.error(message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItem = async () => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/menu/menu-items/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setItems(data.items || []);
      console.log(data.items);
    } catch (error) {
      console.log(error);
      toast.error('Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRes();
    fetchMenuItem();
  }, [id]);

  if (loading) return <Loading />;
  if (error) return <Error />;
  if (!restaurant) return <NotFound />;


  return (
    <div className='min-h-screen bg-gray-50 px-4 py-6 space-y-6'>
      <RestaurantProfile restaurant={restaurant} isSeller={false} onUpdate={setRestaurant} />

      <div className='rounded-xl bg-white shadow-sm p-4'>
        <MenuItems items={items} isSeller={false} onItemDeleted={() => { }} />
      </div>
    </div>
  )
}

export default Details
