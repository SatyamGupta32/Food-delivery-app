import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react'
import { useSocket } from '../../../context/socketContext';
import { useAppData } from '../../../context/appContext';
import zingzen from '../../../assets/sounds/zing-zen.mp3';
import toast from 'react-hot-toast';
import { riderService } from '../../../config/services';
import RiderOrderCard from './RiderOrderCard';
import ActiveRiderOrder from './ActiveRiderOrder';
import DeliveryMap from '../../../components/map/DeliveryMap';

const RiderOrders = ({ fetchProfile, profile, onActiveOrderChange, setActiveOrder }) => {

    
    const [incomingOrders, setIncomingOrders] = useState([]);
    const [currentOrders, setCurrentOrders] = useState(null);
    const [loading, setLoading] = useState(true);
    const [audioUnlock, setAudioUnlock] = useState(() => {
        return localStorage.getItem('rider-audio') === 'true';
    });
    const { socket } = useSocket();

    const audioRef = useRef(null);

    useEffect(() => {
        audioRef.current = new Audio(zingzen);
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
                    // एक बार अनलॉक होने के बाद लिसनर हटा दें
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

        localStorage.setItem('rider-audio', newState);

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

        toast.success(newState ? 'Audio enabled' : 'Audio disabled');
    };

    useEffect(() => {
        if (!socket) return;
        const onAvailableOrders = ({ orderId }) => {
            setIncomingOrders((prev) => prev.includes(orderId) ? prev : [...prev, orderId]);

            if (audioUnlock && audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch((err) => {
                    console.error('Error playing audio:', err);
                });
            }

            setTimeout(() => {
                setIncomingOrders((prev) => prev.filter((id) => id !== orderId));
            }, 10000);
        };

        socket.on('order-available', onAvailableOrders);

        return () => socket.off('order-available', onAvailableOrders);
    }, [socket, audioUnlock]);

    const fetchCurrentOrder = async () => {
        try {
            const { data } = await axios.get(`${riderService}/api/rider/current-orders`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const order = data.order || null;
            setCurrentOrders(order);
            setActiveOrder?.(order);
            onActiveOrderChange?.(!!order);
            if (order && profile?.isAvailable) {
                fetchProfile?.();
            }
        } catch (error) {
            console.log(error);
            setCurrentOrders(null);
            setActiveOrder?.(null);
            onActiveOrderChange?.(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrentOrder();
    }, [profile?._id]);

    const removeIncomingOrder = (orderId) => {
        setIncomingOrders((prev) =>
            prev.filter((id) => id !== orderId)
        );
    };

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            {/* Active delivery — persists after reload */}
            {!loading && currentOrders && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                    <ActiveRiderOrder
                        order={currentOrders}
                        fetchProfile={fetchProfile}
                        onUpdated={(order) => {
                            if (order?.status === 'delivered') {
                                setCurrentOrders(null);
                                setActiveOrder?.(null);
                                onActiveOrderChange?.(false);
                            } else {
                                setCurrentOrders(order);
                                setActiveOrder?.(null);
                                onActiveOrderChange?.(true);
                            }
                        }}
                    />

                    {currentOrders && (
                        <DeliveryMap order={currentOrders} role="rider" />
                    )}
                </div>
            )}

            {/* Incoming Orders */}
            {profile.isAvailable && incomingOrders.length > 0 && (
                <div className='mx-auto max-w-md rounded-xl bg-white shadow-sm p-4 space-y-3'> 
                    <h3 className='text-lg font-semibold text-gray-700'>Incoming Orders</h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {incomingOrders.map((orderId) => (
                            <div key={orderId} className='bg-gray-100 border border-gray-200 rounded-xl'>
                                <RiderOrderCard
                                    key={orderId}
                                    orderId={orderId}
                                    onExpired={() => removeIncomingOrder(orderId)}
                                    onAccepted={() => {
                                        fetchProfile();
                                        fetchCurrentOrder();
                                        removeIncomingOrder(orderId);
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {/* Unlock audio Button */}
            <div className="fixed bottom-4 right-4 z-1000">
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
    )
}

export default RiderOrders
