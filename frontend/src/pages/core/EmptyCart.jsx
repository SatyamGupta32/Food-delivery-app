import {Link} from 'react-router-dom';
import emptyCart from '../../assets/images/empty-cart.gif';

const EmptyCart = () => {
    return (
        <div className="h-[90%] flex items-center justify-center px-6">

            <div className='flex flex-col-reverse md:flex-row items-center justify-center gap-10 max-w-5xl w-full'>

                {/* Left Text */}
                <div className='space-y-4 text-center md:text-left'>

                    <h1 className='text-7xl text-center font-bold text-[#FF3469]'>
                        Oops!
                    </h1>

                    <h2 className='text-3xl text-center font-semibold text-stone-700'>
                        Your Cart is Empty
                    </h2>

                    <p className='text-stone-500 max-w-md leading-relaxed'>
                        Looks like you haven’t added anything yet.
                        Explore delicious meals and fill your cart
                        with something tasty 😊😊😊😊.
                    </p>

                    <p className='text-stone-500 max-w-md leading-relaxed text-justify'>
                        Your next favorite bite might be just one tap away 😁😁.
                    </p>

                    <Link to="/" className='flex justify-center'>
                        <button className='rounded-sm px-3 py-2 cursor-pointer bg-[#FF3469] text-white font-semibold'>Browse Food &#x2192;</button>
                    </Link>

                </div>

                {/* Right Image */}
                <div className='flex justify-center items-center'>
                    <img
                        src={emptyCart}
                        width={320}
                        alt="Not Found..."
                    />
                </div>

            </div>

        </div>
    )
}

export default EmptyCart
