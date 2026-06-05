import axios from 'axios';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { restaurantService } from '../../../config/services';
import {
    BiEdit,
    BiLogOut,
    BiSave,
    BiSolidMapPin,
    BiX
} from 'react-icons/bi';
import { useAppData } from '../../../context/appContext';

const RestaurantProfile = ({ restaurant, isSeller, onUpdate }) => {

    const [edit, setEdit] = useState(false);

    const [formData, setFormData] = useState({
        name: restaurant?.name || '',
        description: restaurant?.description || '',
    });

    const [loading, setLoading] = useState(false);

    const { setIsAuth, setUser } = useAppData();

    // sync state when restaurant updates
    useEffect(() => {
        setFormData({
            name: restaurant?.name || '',
            description: restaurant?.description || '',
        });
    }, [restaurant]);

    const toggleOpenStatus = async () => {

        try {

            setLoading(true);

            const { data } = await axios.put(
                `${restaurantService}/api/restaurant/status`,
                {
                    status: !restaurant?.isOpen,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            toast.success(data.message);

            onUpdate((prev) => ({
                ...prev,
                isOpen: data.restaurant.isOpen,
                lastActiveAt: data.restaurant.lastActiveAt,
            }));

        } catch (error) {

            console.log(error);

            toast.error(
                error?.response?.data?.message ||
                'Failed to update status'
            );

        } finally {
            setLoading(false);
        }
    };

    const saveChanges = async () => {

        try {

            setLoading(true);

            const { data } = await axios.put(
                `${restaurantService}/api/restaurant/edit-restaurant`,
                {
                    name: formData.name,
                    description: formData.description,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            onUpdate((prev) => ({
                ...prev,
                ...data.restaurant,
            }));

            toast.success(data.message);

            setEdit(false);

        } catch (error) {

            console.log(error);

            toast.error(
                error?.response?.data?.message ||
                'Failed to save changes'
            );

        } finally {
            setLoading(false);
        }
    };

    const logOutHandler = async () => {

        try {

            await axios.put(
                `${restaurantService}/api/restaurant/status`,
                {
                    status: false,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

        } catch (error) {

            console.log(error);

        } finally {

            localStorage.removeItem('token');

            setUser(null);
            setIsAuth(false);

            toast.success('Logged out successfully');
        }
    };

    return (
        <div className='mx-auto max-w-5xl lg:max-w-[80%] rounded-xl bg-white shadow-sm p-2 overflow-hidden'>

            <div className='flex flex-col lg:flex-row gap-2'>

                {/* LEFT CONTENT */}
                <div className='flex-1 order-2 lg:order-1'>

                    <div className='p-5 space-y-4 h-full flex flex-col'>

                        {/* TOP */}
                        <div className='flex justify-between items-start gap-4'>

                            <div className='flex-1'>

                                {edit ? (
                                    <input
                                        type='text'
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                name: e.target.value,
                                            }))
                                        }
                                        className='w-full text-2xl font-bold border-b border-gray-300 px-2 py-1 focus:outline-none focus:border-red-500'
                                    />
                                ) : (
                                    <h1 className='text-lg sm:text-2xl lg:text-3xl italic underline font-bold'>
                                        {restaurant?.name}
                                    </h1>
                                )}
                            </div>

                            {isSeller && (
                                <div className='flex gap-2 shrink-0'>

                                    {edit ? (
                                        <>
                                            <button
                                                onClick={saveChanges}
                                                disabled={loading}
                                                className='p-2 rounded-full text-green-600 hover:bg-green-100 transition'
                                            >
                                                <BiSave size={22} />
                                            </button>

                                            <button
                                                onClick={() => setEdit(false)}
                                                className='p-2 rounded-full text-red-600 hover:bg-red-100 transition'
                                            >
                                                <BiX size={22} />
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => setEdit(true)}
                                            className='p-2 rounded-full text-blue-600 hover:bg-blue-100 transition'
                                        >
                                            <BiEdit size={22} />
                                        </button>
                                    )}

                                </div>
                            )}

                        </div>

                        {/* LOCATION */}
                        <div className='flex items-center gap-3 text-gray-600'>

                            <BiSolidMapPin className='w-6 h-6 shrink-0' />

                            <p className='text-xs sm:text-sm lg:text-base'>
                                {restaurant?.autoLocation?.formattedAddress ||
                                    'Location unavailable'}
                            </p>

                        </div>

                        {/* DESCRIPTION */}
                        <div>

                            {edit ? (
                                <textarea
                                    rows='5'
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            description: e.target.value,
                                        }))
                                    }
                                    className='w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-red-500 resize-none'
                                />
                            ) : (
                                <p className='text-gray-600 text-justify leading-relaxed'>
                                    {restaurant?.description ||
                                        'No Description Available'}
                                </p>
                            )}

                        </div>

                        {/* STATUS */}
                        <div className='pt-4 border-t flex justify-between items-center mt-auto'>

                            <span className='text-sm font-medium text-gray-500'>
                                Restaurant Status
                            </span>

                            <button
                                onClick={toggleOpenStatus}
                                disabled={loading || !isSeller}
                                className={`
                                    px-4 py-1.5 rounded-full text-sm font-semibold transition-colors
                                    ${restaurant?.isOpen
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                    }
                                `}
                            >
                                {restaurant?.isOpen ? 'Open' : 'Closed'}
                            </button>

                        </div>

                        {/* FOOTER */}
                        <div className='flex justify-between items-center gap-3'>

                            <p className='text-xs text-gray-500'>
                                Created on{' '}
                                {new Date(
                                    restaurant?.createdAt
                                ).toLocaleDateString()}
                            </p>

                            <button
                                onClick={logOutHandler}
                                className='flex items-center gap-2 cursor-pointer px-4 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-600 transition-colors'
                            >
                                <BiLogOut size={20} />
                                Logout
                            </button>

                        </div>

                    </div>

                </div>

                {/* RIGHT IMAGE */}
                {restaurant?.image && (
                    <div className='order-1 lg:order-2 lg:w-[42%]'>

                        <img
                            src={restaurant.image}
                            alt='Restaurant'
                            className='h-64 lg:h-full w-full object-cover rounded-xl'
                        />

                    </div>
                )}

            </div>

        </div>
    );
};

export default RestaurantProfile;