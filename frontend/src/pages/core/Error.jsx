import React from 'react'
import error from '../../assets/images/404-error.gif'

const Error = ({err}) => {
  return (
      <div className="flex flex-col justify-center items-center h-screen">

          <div className='flex cursor-pointer flex-col justify-center items-center '>
              <img src={error} width={500} alt="Loading..." />
              <span className='text-3xl font-extralight text-stone-700 '>{err ? err : 'Error...'}</span>
          </div>
      </div>
  )
}

export default Error
