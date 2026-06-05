import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { adminService } from '../../config/services';
import Loading from '../core/Loading';
import { motion } from 'framer-motion';
import RiderCard from './components/RiderCard';
import RestaurantCard from './components/RestaurantCard';
import SectionBlock from './utils/SectionBlock';
import StatCard from './components/StatCard';

const config = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
});

const AdminDashboard = () => {
    const [pendingRestaurants, setPendingRestaurants] = useState([]);
    const [verifiedRestaurants, setVerifiedRestaurants] = useState([]);
    const [pendingRiders, setPendingRiders] = useState([]);
    const [verifiedRiders, setVerifiedRiders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('restaurant');
    const tabContentRef = useRef(null);

    const switchTab = (key) => {
        setTab(key);
        requestAnimationFrame(() => {
            if (tabContentRef.current) tabContentRef.current.scrollTop = 0;
        });
    };

    const fetchData = async () => {
        try {
            const cfg = config();

            const [
                { data: pendingRestaurantsRes },
                { data: pendingRidersRes },
                { data: verifiedRestaurantsRes },
                { data: verifiedRidersRes },
            ] = await Promise.all([
                axios.get(`${adminService}/api/v1/admin/pending/restaurants`, cfg),
                axios.get(`${adminService}/api/v1/admin/pending/riders`, cfg),
                axios.get(`${adminService}/api/v1/admin/verified/restaurants`, cfg),
                axios.get(`${adminService}/api/v1/admin/verified/riders`, cfg),
            ]);

            setPendingRestaurants(pendingRestaurantsRes.restaurants || []);
            setPendingRiders(pendingRidersRes.riders || []);
            setVerifiedRestaurants(verifiedRestaurantsRes.restaurants || []);
            setVerifiedRiders(verifiedRidersRes.riders || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const verifyRestaurant = async (id) => {
        try {
            await axios.patch(`${adminService}/api/v1/admin/verify/restaurant/${id}`, {}, config());
            fetchData();
        } catch (error) {
            console.log(error);
        }
    };

    const unverifyRestaurant = async (id) => {
        try {
            await axios.patch(`${adminService}/api/v1/admin/unverify/restaurant/${id}`, {}, config());
            fetchData();
        } catch (error) {
            console.log(error);
        }
    };

    const verifyRider = async (id) => {
        try {
            await axios.patch(`${adminService}/api/v1/admin/verify/rider/${id}`, {}, config());
            fetchData();
        } catch (error) {
            console.log(error);
        }
    };

    const unverifyRider = async (id) => {
        try {
            await axios.patch(`${adminService}/api/v1/admin/unverify/rider/${id}`, {}, config());
            fetchData();
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 max-w-full mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Admin Dashboard</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    label="Pending Restaurants"
                    value={pendingRestaurants.length}
                    accent="border-l-amber-500"
                />
                <StatCard
                    label="Verified Restaurants"
                    value={verifiedRestaurants.length}
                    accent="border-l-green-500"
                />
                <StatCard
                    label="Pending Riders"
                    value={pendingRiders.length}
                    accent="border-l-amber-500"
                />
                <StatCard
                    label="Verified Riders"
                    value={verifiedRiders.length}
                    accent="border-l-green-500"
                />
            </div>

            <div className="flex bg-gray-200 rounded-xl p-1 mb-4 shadow-sm">
                {['restaurant', 'rider'].map((key) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => switchTab(key)}
                        onMouseDown={(e) => e.preventDefault()}
                        className="relative flex-1 py-3 capitalize"
                    >
                        {tab === key && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-red-500 rounded-lg"
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                        )}
                        <span
                            className={`relative z-10 font-medium ${tab === key ? 'text-white' : 'text-gray-600'
                                }`}
                        >
                            {key === 'restaurant' ? 'Restaurants' : 'Riders'}
                        </span>
                    </button>
                ))}
            </div>

            <div
                ref={tabContentRef}
                className="admin-tab-scroll h-[min(48rem,78vh)] overflow-y-auto overscroll-contain rounded-xl border border-gray-200 bg-white/60 p-4 shadow-inner scroll-smooth"
            >
                {tab === 'restaurant' && (
                    <div className="space-y-10">
                        <SectionBlock
                            title="Pending Restaurants"
                            emptyText="No pending restaurants"
                            items={pendingRestaurants}
                            renderCard={(item) => (
                                <RestaurantCard
                                    key={item._id}
                                    item={item}
                                    actionLabel="Verify Restaurant"
                                    onAction={verifyRestaurant}
                                    actionClass="bg-green-600 hover:bg-green-700"
                                />
                            )}
                        />
                        <SectionBlock
                            title="Verified Restaurants"
                            emptyText="No verified restaurants yet"
                            items={verifiedRestaurants}
                            renderCard={(item) => (
                                <RestaurantCard
                                    key={item._id}
                                    item={item}
                                    actionLabel="Cancel Verification"
                                    onAction={unverifyRestaurant}
                                    actionClass="bg-red-600 hover:bg-red-700"
                                />
                            )}
                        />
                    </div>
                )}

                {tab === 'rider' && (
                    <div className="space-y-10">
                        <SectionBlock
                            title="Pending Riders"
                            emptyText="No pending riders"
                            items={pendingRiders}
                            renderCard={(item) => (
                                <RiderCard
                                    key={item._id}
                                    item={item}
                                    actionLabel="Verify Rider"
                                    onAction={verifyRider}
                                    actionClass="bg-green-600 hover:bg-green-700"
                                />
                            )}
                        />
                        <SectionBlock
                            title="Verified Riders"
                            emptyText="No verified riders yet"
                            items={verifiedRiders}
                            renderCard={(item) => (
                                <RiderCard
                                    key={item._id}
                                    item={item}
                                    actionLabel="Cancel Verification"
                                    onAction={unverifyRider}
                                    actionClass="bg-red-600 hover:bg-red-700"
                                />
                            )}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
