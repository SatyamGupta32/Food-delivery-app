import React from 'react'
import loading from '../../assets/images/loading.gif'

const Loading = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen">

      <div className='flex cursor-pointer flex-col justify-center items-center '>
        <img src={loading} width={300} alt="Loading..." />
        <span className='text-3xl font-extralight text-stone-700 '>Loading...</span>

      </div>
    </div>
  )
}

export default Loading
