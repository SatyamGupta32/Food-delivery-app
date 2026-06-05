import React, { useEffect, useState } from 'react'
import { useAppData } from '../../context/appContext'
import { useNavigate } from 'react-router-dom';
import EmptyCart from '../core/EmptyCart';
import axios from 'axios';
import { restaurantService } from '../../config/services';
import toast from 'react-hot-toast';
import { BiCart, BiLoaderCircle, BiMinus, BiPlus } from 'react-icons/bi';

const Cart = () => {

    const { cart, subTotal, fetchCart, quantity } = useAppData();

    const navigate = useNavigate();

    const [loadingState, setLoadingState] = useState({
        itemId: null,
        action: null
    });
    const [clearCart, setClearCart] = useState(false);


    useEffect(() => {

        const interval = setInterval(() => {
            fetchCart();
        }, 10000);

        return () => clearInterval(interval);

    }, [fetchCart]);

    if (!cart || cart.length == 0) return <EmptyCart />;

    const restaurant = cart[0].restaurantId;
    const deliveryFee = subTotal < 250 ? 49 : 0;
    const platformFee = 7;
    const total = subTotal + deliveryFee + platformFee;

    const incQty = async (itemId) => {
        try {
            setLoadingState({
                itemId: itemId,
                action: "inc"
            });
            await axios.put(`${restaurantService}/api/cart/inc-cart`,
                { itemId },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    },
                },
            );
            await fetchCart();
        } catch (error) {
            toast.error(error.response.data.message || 'Something went wrong');
        } finally {
            setLoadingState({
                itemId: null,
                action: null
            });
        }
    }

    const decQty = async (itemId) => {
        try {
            setLoadingState({
                itemId: itemId,
                action: "dec"
            });
            await axios.put(`${restaurantService}/api/cart/dec-cart`,
                { itemId },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    },
                },
            );
            await fetchCart();
        } catch (error) {
            toast.error(error.response.data.message || 'Something went wrong');
        } finally {
            setLoadingState({
                itemId: null,
                action: null
            });
        }
    }

    const clearCartItems = async () => {
        try {
            setClearCart(true);
            await axios.delete(`${restaurantService}/api/cart/clear-cart`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    },
                },
            );
            await fetchCart();
        } catch (error) {
            toast.error(error.response.data.message || 'Something went wrong');
        } finally {
            setClearCart(false);
        }
    }

    const checkOut = () => {
        navigate('/checkout');
    }

    return (
        <div className='mx-auto max-w-5xl px-4 py-6 pb-40 space-y-6'>
            <div className='rounded-xl bg-white p-4 shadow-sm'>
                <h2 className='text-xl font-semibold'>{restaurant.name}</h2>
                <p className='text-sm text-gray-500'>{restaurant.autoLocation.formattedAddress}</p>
            </div>

            <div className='space-y-6'>
                {
                    cart.map((cartItem) => {
                        const item = cartItem.itemId;
                        const isIncLoading = loadingState.itemId === item._id && loadingState.action === "inc";
                        const isDecLoading = loadingState.itemId === item._id && loadingState.action === "dec";

                        return (
                            <div className='rounded-2xl bg-white p-4 shadow-sm' key={item._id}>
                                <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>

                                    {/* Left */}
                                    <div className='flex items-center gap-4 flex-1 min-w-0'>

                                        <img src={item.image} alt="item image" className='h-24 w-24 rounded-xl object-cover border' />

                                        <div className='min-w-0'>
                                            <h3 className='text-base sm:text-lg font-semibold text-stone-800 line-clamp-2'> {item.name} </h3>
                                            <p className='mt-1 text-sm text-gray-500'> ₹ {item.price} </p>
                                        </div>

                                    </div>


                                    {/* Right */}
                                    <div className='flex items-center justify-between sm:justify-end gap-4'>

                                        <div className='flex items-center overflow-hidden rounded-xl border'>

                                            <button disabled={isDecLoading} onClick={() => decQty(item._id)} className='px-3 py-2 border-r hover:bg-gray-100 disabled:opacity-50'>
                                                <BiMinus className='w-5 h-5 text-red-600' />
                                            </button>

                                            <span className='text-center w-10 py-2 text-sm font-medium border-r'> {cartItem.quantity} </span>

                                            <button disabled={isIncLoading} onClick={() => incQty(item._id)} className='px-3 py-2 hover:bg-gray-100 disabled:opacity-50'>
                                                <BiPlus className='w-5 h-5 text-red-600' />
                                            </button>

                                        </div>

                                        <p className='min-w-[70px] text-right text-base font-semibold text-stone-800'> ₹ {cartItem.quantity * item.price} </p>

                                    </div>

                                </div>
                            </div>
                        )
                    })
                }
            </div>


            <div className='rounded-xl bg-white p-4 shadow-sm space-y-3'>
                <div className='flex items-center justify-between text-sm'>
                    <span>Total Item's</span>
                    <span>{quantity}</span>
                </div>
                <div className='flex items-center justify-between text-sm'>
                    <span>Sub Total</span>
                    <span>₹ {subTotal}</span>
                </div>
                <div className='flex items-center justify-between text-sm'>
                    <span>Delivery Fee</span>
                    <span>{deliveryFee === 0 ? 'Free' : `₹ ${deliveryFee}`}</span>
                </div>
                <div className='flex items-center justify-between text-sm'>
                    <span>Platform Fee</span>
                    <span>₹ {platformFee}</span>
                </div>

                {
                    subTotal < 250 && <p className='text-xs text-gray-500'>
                        Add item worth ₹ {250 - subTotal} to get free delivery.
                    </p>
                }

                <div className='flex justify-between pt-2 text-base font-semibold border-t'>
                    <span>Grand Total</span>
                    <span>₹ {total}</span>
                </div>

            </div>


            <div className='rounded-xl min-w-full fixed bottom-0 left-0 right-0 z-50 bg-white p-4 shadow-sm space-y-3'>
                <div className='mx-auto max-w-5xl p-4 space-y-3'>

                    <button
                        onClick={checkOut}
                        className={`w-full mt-3 cursor-pointer rounded-xl py-3 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 ${!restaurant.isOpen ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!restaurant.isOpen}
                    >
                        {!restaurant.isOpen ? 'Restaurant is Closed' : 'Proceed to Checkout →'}
                    </button>

                    <button
                        onClick={clearCartItems}
                        className='w-full mt-3 cursor-pointer flex items-center justify-center rounded-xl py-3 border-red-600 text-sm font-semibold text-red-600 border bg-white hover:bg-red-100'
                    >
                        <span>Clear Cart</span>
                        <BiCart className='w-5 h-5 mr-2' />
                    </button>
                </div>
            </div>

        </div>
    )
}

export default Cart
