import { useEffect, useRef, useState } from "react";
import { useSocket } from "../../../context/socketContext";
import order from '../../../assets/sounds/order.mp3';
import axios from "axios";
import { restaurantService } from "../../../config/services";
import Loading from "../../core/Loading";
import OrderCard from './OrderCard';
import toast from "react-hot-toast";

const ACTIVE_STATUS = [
    'placed',
    'accepted',
    'preparing',
    'ready_for_rider',
    'rider_assigned',
    'picked_up',
];

const RestaurantOrders = ({ restaurantId }) => {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [audioUnlock, setAudioUnlock] = useState(() => {
        return localStorage.getItem('restaurant-audio') === 'true';
    });

    const { socket } = useSocket();

    const audioRef = useRef(null);

    useEffect(() => {
        audioRef.current = new Audio(order);
        audioRef.current.load();
        audioRef.current.preload = 'auto';
    }, []);

    useEffect(() => {
        const unlockAudio = async () => {
            if (audioUnlock && audioRef.current) {
                try {
                    await audioRef.current.play();
                    audioRef.current.pause();
                    audioRef.current.currentTime = 0;

                    window.removeEventListener('click', unlockAudio);
                } catch (err) {
                    console.log('Interaction needed to unlock audio');
                }
            }
        };

        if (audioUnlock) {
            window.addEventListener('click', unlockAudio);
        }

        return () => window.removeEventListener('click', unlockAudio);
    }, [audioUnlock]);

    const toggleAudio = async () => {

        const newState = !audioUnlock;

        setAudioUnlock(newState);

        localStorage.setItem('restaurant-audio', newState);
        
        if (newState && audioRef.current) {

            setTimeout(async () => {

                try {
                    audioRef.current.currentTime = 0;

                    await audioRef.current.play();

                } catch (err) {
                    console.log('Audio error:', err);
                }

            }, 400);
        }

        toast.success(newState ? 'Audio unlocked' : 'Audio disabled');
    };

    useEffect(() => {
        if (!socket) return;

        const onNewOrder = () => {
            console.log('New order recieved socket !');

            if (audioUnlock && audioRef.current) {
                audioRef.current.currentTime = 0;

                audioRef.current.play().catch((err) => {
                    console.error('Error playing audio:', err);
                });
            }

            fetchOrders();
        };

        socket.on('new-order', onNewOrder);

        return () => socket.off('new-order', onNewOrder);
    }, [socket, audioUnlock]);

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get(`${restaurantService}/api/order/restaurant-orders/${restaurantId}`, {
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
    }, [restaurantId]);


    useEffect(() => {
        if (!socket) return;

        const onUpdateOrder = () => {
            fetchOrders();
        };
        socket.on('order:rider_assigned', onUpdateOrder);
        socket.on('order:picked_up', onUpdateOrder);
        socket.on('order:delivered', onUpdateOrder);

        return () => {
            socket.off('order:rider_assigned', onUpdateOrder);
            socket.off('order:picked_up', onUpdateOrder);
            socket.off('order:delivered', onUpdateOrder);
        };
    }, [socket]);

    if (loading) return <Loading />;

    const activeOrders = orders.filter((order) => ACTIVE_STATUS.includes(order.status));
    const completedOrders = orders.filter((order) => !ACTIVE_STATUS.includes(order.status));

    return (
        <div className="space-y-6">
            {/* Active Orders */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold">
                    Active Orders
                </h3>
                {activeOrders.length === 0 ? (
                    <div className="bg-gray-100 border border-gray-200 rounded-2xl py-10 text-center text-gray-500">
                        No Active Orders
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeOrders.map((order) => (<OrderCard key={order._id} order={order} onStatusUpdate={fetchOrders} />))}
                    </div>
                )}
            </div>
            {/* Completed Orders */}
            <div className="space-y-3">
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
                            <OrderCard key={order._id} order={order} isCompleted={true} />
                        ))}
                    </div>
                )}
            </div>
            {/* Unlock audio Button */}
            <div className="fixed bottom-4 right-4 z-50">
                <div
                    className={`transition-all duration-300 overflow-hidden rounded-2xl shadow-lg border ${audioUnlock ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                    <button
                        onClick={toggleAudio}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-300 ${audioUnlock ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                        <span className="text-lg">
                            {audioUnlock ? '🔊' : '🔔'}
                        </span>

                        <div className="flex flex-col items-start">
                            <span className="text-sm font-semibold">
                                {audioUnlock ? 'Sound Enabled' : 'Enable Order Sound'}
                            </span>

                            <span className="text-[11px] opacity-90">
                                {audioUnlock ? 'You’ll hear new order alerts' : 'Tap to activate notifications'}
                            </span>
                        </div>

                        <div className={`w-10 h-5 rounded-full relative transition-all duration-300 ${audioUnlock ? 'bg-green-300' : 'bg-white/40'}`}>
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 ${audioUnlock ? 'left-5' : 'left-0.5'}`} />
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default RestaurantOrders
