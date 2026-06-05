import axios from 'axios';
import { useAppData } from '../../context/appContext';
import { toast } from 'react-hot-toast';
import { restaurantService, utilsService } from '../../config/services';
import { useEffect, useState } from 'react';
import EmptyCart from '../core/EmptyCart';
import { useNavigate } from 'react-router-dom';
import { BiCreditCard, BiLoader } from 'react-icons/bi';
import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_KEY } from '../../config/env';


const Checkout = () => {

  const navigate = useNavigate();

  const { cart, subTotal, quantity } = useAppData();
  const [addresses, setAddresses] = useState([]);
  const [selectAddressId, setSelectAddressId] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [loadingRazorpay, setLoadingRazorpay] = useState(false);
  const [loadingStripe, setLoadingStripe] = useState(false);

  const isAddressSelected = Boolean(selectAddressId);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!cart || cart.length === 0) {
        setLoadingAddress(false)
        return;
      }

      try {
        const { data } = await axios.get(`${restaurantService}/api/address/get-address`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
        setAddresses(data.address || []);
      } catch (error) {
        console.log(error);
        toast.error('Failed to load addresses');
      } finally {
        setLoadingAddress(false);
      }
    };
    fetchAddresses();
  }, [cart]);

  if (!cart || cart.length === 0) return <EmptyCart />

  const restaurant = cart[0]?.restaurantId;

  const deliveryFee = subTotal < 250 ? 49 : 0;
  const platformFee = 7;
  const total = subTotal + deliveryFee + platformFee;

  const createNewOrder = async (paymentMethod) => {
    if (!['razorpay', 'stripe'].includes(paymentMethod)) {
      return toast.error('Invalid payment method');
    }
    if (!selectAddressId) return toast.error('Please select a delivery address');

    try {
      const { data } = await axios.post(`${restaurantService}/api/order/create`, {
        paymentMethod,
        addressId: selectAddressId,
      },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          }
        }
      );
      return data;
    } catch (error) {
      toast.error('Failed to create order');
    }
  };

  const payWithRazorpay = async () => {
    try {
      setLoadingRazorpay(true);

      const order = await createNewOrder('razorpay');

      if (!order) return;

      const { orderId, total } = order;
      const { data } = await axios.post(`${utilsService}/api/payment/razorpay/create`, { orderId });

      const { rpOrderId, key } = data;

      const options = {
        key,
        amount: total * 100,
        currency: 'INR',
        name: 'Zomato',
        description: 'food order payment',
        order_id: rpOrderId,
        handler: async (res) => {
          try {
            await axios.post(`${utilsService}/api/payment/razorpay/verify`, {
              rp_order_id: res.razorpay_order_id,
              rp_payment_id: res.razorpay_payment_id,
              rp_signature: res.razorpay_signature,
              orderId
            });

            toast.success('Payment successful 🎉🎊🎊');
            navigate(`/payment-success/${res.razorpay_payment_id}`);
          } catch (error) {
            toast.error('Payment failed');
          }
        },
        theme: {
          color: '#E23744',
        }
      }

      console.log(data);
      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.log(error);
      toast.error('Payment failed refresh page please !!');
    } finally {
      setLoadingRazorpay(false);
    }
  };

  const stripePromise = loadStripe(STRIPE_KEY);

  const payWithStripe = async () => {
    try {
      setLoadingStripe(true);

      const order = await createNewOrder('stripe');

      if (!order) return;

      const { orderId } = order;

      const stripe = await stripePromise;

      const { data } = await axios.post(`${utilsService}/api/payment/stripe/create`, { orderId });

      if (data.url) window.location.href = data.url;

      console.log('stripe order', order);

    } catch (err) {
      console.log(err);
      toast.error('Payment failed refresh page please !!');
    } finally {
      setLoadingStripe(false);
    }
  }
  return (
    <div className='mx-auto max-w-5xl px-4 py-6 space-y-6 pb-40'>

      {/* HEADER */}
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Checkout</h1>
        <span className='text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full'>
          {quantity} items
        </span>
      </div>

      {/* RESTAURANT CARD */}
      <div className='rounded-2xl bg-white p-5 shadow-sm border'>
        <h2 className='text-lg font-semibold'>{restaurant?.name}</h2>
        <p className='text-sm text-gray-500 mt-1'>
          {restaurant?.autoLocation?.formattedAddress}
        </p>
      </div>

      {/* ADDRESS SECTION */}
      <div className="rounded-2xl bg-white p-5 shadow-sm space-y-4 border">
        <div className="font-semibold text-base">Delivery Address</div>

        {loadingAddress ? (
          <p className='text-sm text-gray-500'>Loading addresses...</p>
        ) : addresses.length === 0 ? (
          <p className='text-sm text-gray-500'>No saved addresses found</p>
        ) : (
          <div className='space-y-3'>
            {addresses.map((add) => (
              <label
                key={add._id}
                className={`flex gap-3 rounded-xl border p-4 cursor-pointer transition-all duration-200 ${selectAddressId === add._id
                  ? 'border-red-500 bg-red-50'
                  : 'hover:bg-gray-50'
                  }`}
              >
                <input
                  type="radio"
                  checked={selectAddressId === add._id}
                  onChange={() => setSelectAddressId(add._id)}
                />

                <div className='flex-1'>
                  <p className='text-sm font-medium'>{add.formattedAddress}</p>
                  <p className='text-xs text-gray-500'>{add.mobile}</p>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* ORDER SUMMARY */}
      <div className="rounded-2xl bg-white p-5 shadow-sm space-y-4 border">
        <h3 className="font-semibold text-base">Order Summary</h3>

        <div className='space-y-3'>
          {cart.map((cartItem) => {
            const item = cartItem.itemId;

            return (
              <div key={cartItem._id} className="flex justify-between text-sm">
                <span className='text-gray-700'>
                  {item.name} × {cartItem.quantity}
                </span>
                <span className='font-medium'>
                  ₹{item.price * cartItem.quantity}
                </span>
              </div>
            );
          })}
        </div>

        <hr />

        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>₹{subTotal}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Delivery Fee</span>
          <span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Platform Fee</span>
          <span>₹{platformFee}</span>
        </div>

        {subTotal < 250 && (
          <p className='text-xs text-gray-500'>
            Add ₹{250 - subTotal} more for free delivery 🎯
          </p>
        )}

        <div className='flex justify-between pt-3 text-base font-bold border-t'>
          <span>Total</span>
          <span>₹{total}</span>
        </div>
      </div>

      {/* PAYMENT FIXED BAR */}
      <div className='fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg'>
        <div className='mx-auto max-w-5xl p-4 space-y-3'>

          <div className='flex items-center justify-between'>
            <h3 className='text-base font-semibold'>Payment</h3>
            <span className={`text-xs px-3 py-1 rounded-full ${isAddressSelected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
              }`}>
              {isAddressSelected ? 'select Payment method' : 'Select address'}
            </span>
          </div>

          {/* RAZORPAY */}
          <button
            onClick={payWithRazorpay}
            disabled={!isAddressSelected || loadingRazorpay}
            className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition ${isAddressSelected && !loadingRazorpay
              ? 'bg-red-600 hover:bg-red-700 cursor-pointer'
              : 'bg-red-300 cursor-not-allowed'
              }`}
          >
            {loadingRazorpay ? (
              <BiLoader className='animate-spin' />
            ) : (
              <BiCreditCard />
            )}
            Pay with Razorpay
          </button>

          {/* STRIPE */}
          <button
            onClick={payWithStripe}
            disabled={!isAddressSelected || loadingStripe}
            className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold border transition ${isAddressSelected && !loadingStripe
              ? 'text-red-600 border-red-600 hover:bg-red-50 cursor-pointer'
              : 'text-gray-400 border-gray-300 cursor-not-allowed'
              }`}
          >
            {loadingStripe ? (
              <BiLoader className='animate-spin' />
            ) : (
              <BiCreditCard />
            )}
            Pay with Stripe
          </button>

        </div>
      </div>

    </div>
  );
}

export default Checkout
