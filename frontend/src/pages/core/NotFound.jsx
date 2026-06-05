import React from 'react'
import notFound from '../../assets/images/not-found.gif'
import { Link } from 'react-router-dom'

const NotFound = () => {
    return (
        <div className="h-screen flex items-center justify-center px-6">

            <div className='flex flex-col-reverse md:flex-row items-center justify-center gap-10 max-w-5xl w-full'>

                {/* Left Text */}
                <div className='space-y-4 text-center md:text-left'>

                    <h1 className='text-7xl text-center font-bold text-[#FF3469]'>
                        404
                    </h1>

                    <h2 className='text-3xl text-center font-semibold text-stone-700'>
                        Oh snap!
                    </h2>

                    <p className='text-stone-500 max-w-md leading-relaxed'>
                        Something went wrong with this page.
                        You can watch this tiny berry bumping
                        over and over again or go back home
                        and take it from scratch.
                    </p>

                    <Link to="/" className='flex justify-center'>
                        <button className='rounded-sm px-3 py-2 cursor-pointer bg-[#FF3469] text-white font-semibold'>Go Home &#x2192;</button>
                    </Link>

                </div>

                {/* Right Image */}
                <div className='flex justify-center items-center'>
                    <img
                        src={notFound}
                        width={320}
                        alt="Not Found..."
                    />
                </div>

            </div>

        </div>
    )
}

export default NotFound
