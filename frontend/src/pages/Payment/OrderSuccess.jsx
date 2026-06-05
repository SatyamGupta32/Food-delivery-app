import axios from 'axios';
import React, { useState } from 'react'
import { useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { utilsService } from '../../config/services';
import { useAppData } from '../../context/appContext';
import toast from 'react-hot-toast';
import { BiCart, BiCheckCircle, BiFoodMenu } from 'react-icons/bi';

const OrderSuccess = () => {

    const [searchParams] = useSearchParams();
    const session_id = searchParams.get('session_id');
    const { payId } = useParams();

    const { fetchCart } = useAppData();

    const navigate = useNavigate();

    useEffect(() => {
        const verifyPayment = async () => {
            if (!session_id) return;
            if (payId) return;

            try {
                const { data } = await axios.post(`${utilsService}/api/payment/stripe/verify`, { session_id });
                toast.success('Payment successful 🎉🎊🎊');
                await fetchCart();
                navigate(`/order-success/${data.paymentId}`);
                return data;
            } catch (err) {
                console.log(err);
                toast.error('Payment failed refresh page please !!');
            }
        };
        if (session_id) {
            verifyPayment();
        }
    }, [session_id]);

    return (
        <div className='min-h-[93vh] flex items-center justify-center bg-linear-to-b from-indigo-50 to-white px-4'>
            <div className='w-full max-w-lg mx-auto rounded-2xl bg-white p-6 shadow-xl text-center space-y-5 border border-indigo-100'>

                <div className='bg-indigo-100 w-fit mx-auto p-4 rounded-full'>
                    <BiCheckCircle size={90} className='text-indigo-600' />
                </div>

                <div>
                    <h3 className='text-3xl font-bold text-gray-800'>
                        Stripe Payment Successful ✨
                    </h3>

                    <p className='text-sm text-gray-500 mt-2'>
                        Your payment has been verified and your order is now confirmed.
                    </p>
                </div>

                {
                    payId && (
                        <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-3 flex items-center justify-center gap-4">
                            <p className='text-xs text-indigo-500 font-semibold uppercase tracking-wide'>
                                Stripe Payment ID:
                            </p>

                            <p className='text-sm text-gray-700 font-mono break-all'>
                                {payId}
                            </p>
                        </div>
                    )
                }

                <div className='flex flex-col gap-3 items-center justify-center pt-2'>

                    <button
                        className='rounded-xl px-3 py-3 cursor-pointer bg-indigo-600 text-white font-semibold w-full text-center flex items-center justify-center hover:bg-indigo-700 transition'
                        onClick={() => navigate('/')}
                    >
                        <BiFoodMenu size={18} className='mr-2' />
                        Browse Food →
                    </button>

                    <button
                        className='rounded-xl px-3 py-3 cursor-pointer text-indigo-600 border border-indigo-200 bg-white font-semibold w-full text-center flex items-center justify-center hover:bg-indigo-50 transition'
                        onClick={() => navigate('/orders')}
                    >
                        <BiCart size={18} className='mr-2' />
                        Your Orders →
                    </button>

                </div>
            </div>
        </div>
    )
};

export default OrderSuccess; 
