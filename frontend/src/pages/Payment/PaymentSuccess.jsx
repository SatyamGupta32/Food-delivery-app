import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { useAppData } from '../../context/appContext';
import { BiCart, BiCheckCircle, BiFoodMenu } from 'react-icons/bi';

const PaymentSuccess = () => {

    const { payId } = useParams();
    const navigate = useNavigate();
    const { fetchCart } = useAppData();

    useEffect(() => {
        fetchCart();
    }, []);

    return (
        <div className='min-h-[93vh] flex items-center justify-center bg-linear-to-b from-red-50 to-white px-4'>

            <div className='w-full max-w-lg mx-auto rounded-2xl bg-white p-6 shadow-xl border border-red-100 text-center space-y-5'>

                <div className='bg-red-100 w-fit mx-auto p-4 rounded-full'>
                    <BiCheckCircle size={90} className='text-red-500' />
                </div>

                <div>
                    <h3 className='text-3xl font-bold text-gray-800'>
                        Payment Successful 🎉
                    </h3>

                    <p className='text-sm text-gray-500 mt-2'>
                        Your Razorpay payment has been completed successfully.
                    </p>
                </div>

                {
                    payId && (
                        <div className="flex items-center justify-center gap-4 rounded-xl bg-red-50 border border-red-100 p-3">
                            <p className='text-xs text-red-500 font-semibold uppercase tracking-wide'>
                                Razorpay Payment ID:
                            </p>

                            <p className='text-sm text-gray-500 font-mono break-all'>
                                {payId}
                            </p>
                        </div>
                    )
                }

                <div className='flex flex-col gap-3 items-center justify-center pt-2'>

                    <button
                        className='rounded-xl px-3 py-3 cursor-pointer bg-[#FF3469] text-white font-semibold w-full text-center flex items-center justify-center hover:bg-red-700 transition'
                        onClick={() => navigate('/')}
                    >
                        <BiFoodMenu size={18} className='mr-2' />
                        Browse Food →
                    </button>

                    <button
                        className='rounded-xl px-3 py-3 cursor-pointer text-[#FF3469] border border-red-200 bg-white font-semibold w-full text-center flex items-center justify-center hover:bg-red-50 transition'
                        onClick={() => navigate('/orders')}
                    >
                        <BiCart size={18} className='mr-2' />
                        Your Orders →
                    </button>

                </div>
            </div>
        </div>
    )
}

export default PaymentSuccess
