import axios from "axios";
import { useEffect, useState } from "react";
import { restaurantService } from "../../../config/services";
import Loading from "../../core/Loading";

const Sales = () => {

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSales = async () => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/restaurant/sales`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setStats({
        totalRevenue: data.totalRevenue ?? 0,
        restaurantIncome: data.restaurantIncome ?? 0,
        totalOrders: data.totalOrders ?? 0,
        completedOrders: data.completedOrders ?? 0,
        todayRevenue: data.todayRevenue ?? 0,
        monthlyRevenue: data.monthlyRevenue ?? 0,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  if (loading) return <Loading />;

  if (!stats) {
    return (
      <p className="text-center text-gray-500 py-8">Could not load sales data</p>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">

      <div className="bg-green-50 rounded-xl p-4">
        <p className="text-sm text-gray-500">Total Revenue</p>
        <h3 className="text-2xl font-bold">
          ₹{Math.round(stats.totalRevenue)}
        </h3>
      </div>

      <div className="bg-blue-50 rounded-xl p-4">
        <p className="text-sm text-gray-500">Your Income</p>
        <h3 className="text-2xl font-bold">
          ₹{Math.round(stats.restaurantIncome)}
        </h3>
      </div>

      <div className="bg-yellow-50 rounded-xl p-4">
        <p className="text-sm text-gray-500">Paid Orders</p>
        <h3 className="text-2xl font-bold">
          {stats.totalOrders}
        </h3>
      </div>

      <div className="bg-purple-50 rounded-xl p-4">
        <p className="text-sm text-gray-500">Delivered</p>
        <h3 className="text-2xl font-bold">
          {stats.completedOrders}
        </h3>
      </div>

      <div className="bg-orange-50 rounded-xl p-4">
        <p className="text-sm text-gray-500">Today</p>
        <h3 className="text-2xl font-bold">
          ₹{Math.round(stats.todayRevenue)}
        </h3>
      </div>

      <div className="bg-red-50 rounded-xl p-4">
        <p className="text-sm text-gray-500">This Month</p>
        <h3 className="text-2xl font-bold">
          ₹{Math.round(stats.monthlyRevenue)}
        </h3>
      </div>

    </div>
  );
};

export default Sales;
