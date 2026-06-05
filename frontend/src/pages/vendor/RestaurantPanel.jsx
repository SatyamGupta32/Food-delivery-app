import axios from "axios";
import { useState, useEffect } from "react";
import { restaurantService } from "../../config/services";
import Loading from "../core/Loading";
import RestaurantProfile from "./components/RestaurantProfile";
import MenuItems from "./components/MenuItems";
import AddRestaurant from "./components/AddRestaurant";
import AddItems from "./components/AddItems";
import Sales from "./components/Sales";
import toast from "react-hot-toast";
import RestaurantOrders from "./components/RestaurantOrders";


const RestaurantPanel = () => {

  const [restaurant, setRestaurant] = useState(null);

  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState('menu');


  const fetchMyRest = async () => {
    try {
      const { data } = await axios.get(`${restaurantService}/api/restaurant/my-restaurant`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setRestaurant(data.restaurant || null);

      if (data.token) localStorage.setItem('token', data.token);

    } catch (error) {
      if (error?.response?.status === 404) {
        setRestaurant(null);
        return;
      }
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRest();
  }, [])

  useEffect(() => {
    console.log("RESTAURANT STATE:", restaurant);
  }, [restaurant]);

  const [MenuItem, setMenuItem] = useState([]);

  const fetchMenuItem = async (restaurantId) => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/menu/menu-items/${restaurantId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setMenuItem(data.items);
      console.log(data.items);
    } catch (error) {
      console.log(error);
      toast.error('Failed to fetch menu items');
    }
  };

  useEffect(() => {
    if (restaurant?._id) fetchMenuItem(restaurant._id);
  }, [restaurant]);

  useEffect(() => {

    if (!restaurant?.isOpen) return;

    const interval = setInterval(async () => {

      try {

        await axios.patch(
          `${restaurantService}/api/restaurant/heartbeat`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

      } catch (error) {
        console.log(error);
      }

    }, 15000);

    return () => clearInterval(interval);

  }, [restaurant?.isOpen]);

  if (loading) return <Loading />;

  if (!restaurant) return <AddRestaurant onCreated={fetchMyRest} />;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 pb-25 space-y-6">

      <RestaurantProfile restaurant={restaurant} isSeller={true} onUpdate={setRestaurant} />

      <RestaurantOrders restaurantId={restaurant._id} />

      <div className="rounded-xl bg-white shadow-sm">
        <div className="flex border-b">
          {[
            { key: 'menu', label: 'menu item\'s' },
            { key: 'add-cart', label: 'add item' },
            { key: 'sales', label: 'sales' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`flex-1 flex items-center justify-center cursor-pointer px-4 py-3 text-center text-sm font-medium transition-colors
                ${tab === item.key ?
                  'bg-gray-100 border-b-2 border-b-red-600 text-red-600' :
                  'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {tab === 'menu' && (
            <MenuItems
              items={MenuItem}
              isSeller={true}
              onItemDeleted={() => fetchMenuItem(restaurant._id)}
            />
          )}
          {tab === 'add-cart' && (
            <AddItems
              onItemAdded={() => fetchMenuItem(restaurant._id)}
            />
          )}
          {tab === 'sales' && (
            <Sales />
          )}
        </div>
      </div>

    </div>
  )
}

export default RestaurantPanel
