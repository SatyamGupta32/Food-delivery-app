import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../context/socketContext";
import axios from "axios";
import { restaurantService } from "../../config/services";
import Loading from "../core/Loading";
import OrderRow from "./components/OrderRow";

const ACTIVE_STATUS = ['placed', 'accepted', 'preparing', 'ready_for_rider', 'rider_assigned', 'picked_up'];

const MyOrders = () => {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const { socket } = useSocket();

    const fetchOrders = async () => {
        try {
            const { data } = await axios(`${restaurantService}/api/order/my-orders`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setOrders(data.orders || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        if (!socket) return;

        const onUpdateOrder = () => {
            fetchOrders();
        };
        socket.on('Order-Update', onUpdateOrder);
        socket.on('order:rider_assigned', onUpdateOrder);
        socket.on('order:picked_up', onUpdateOrder);
        socket.on('order:delivered', onUpdateOrder);

        return () => {
            socket.off('Order-Update', onUpdateOrder);
            socket.off('order:rider_assigned', onUpdateOrder);
            socket.off('order:picked_up', onUpdateOrder);
            socket.off('order:delivered', onUpdateOrder);
        }
    }, [socket]);


    if (loading) return <Loading />;

    if (orders.length === 0)
        return (
            <div className="min-h-[93vh] bg-gray-50 flex items-center justify-center">
                <p className="to-gray-500">No order yet....</p>
            </div>
        );

    const activeOrders = orders.filter((order) => ACTIVE_STATUS.includes(order.status));
    const completedOrders = orders.filter((order) => !ACTIVE_STATUS.includes(order.status));

    return (
        <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
            <h1 className="text-2xl font-semibold text-center">My Orders</h1>

            <section className="space-y-3">
                <h3 className="text-lg font-semibold">
                    Active Orders
                </h3>

                {activeOrders.length === 0 ? (
                    <div className="bg-gray-100 border border-gray-200 rounded-2xl py-10 text-center text-gray-500">
                        No Active Orders
                    </div>
                ) :
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {activeOrders.map((order) => (
                            <OrderRow key={order._id} order={order} onClick={() => navigate(`/order/${order._id}`)} />
                        ))}
                    </div>
                }
            </section>

            <section className="space-y-3">
                <h3 className="text-lg font-semibold">
                    Completed Orders
                </h3>


                {completedOrders.length === 0 ? (
                    <div className="bg-gray-100 border border-gray-200 rounded-2xl py-10 text-center text-gray-500">
                        No Completed Orders
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {completedOrders.map((order) => (
                            <OrderRow key={order._id} order={order} onClick={() => navigate(`/order/${order._id}`)} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}

export default MyOrders
