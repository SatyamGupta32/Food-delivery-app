import React from 'react'
import { BiTrash } from 'react-icons/bi';

const Confirm = ({ onCancel, onDelete }) => {
    return (
        <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/20 backdrop-blur-sm">

            <div className="w-[320px] rounded-[28px] bg-white p-6 shadow-xl">

                <div className="flex flex-col items-center">

                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
                        <BiTrash size={30} className='text-red-500' />
                    </div>

                    <p className="mt-2 text-center text-sm text-gray-400">
                        Are you sure you want to delete this item?
                    </p>

                    <div className="mt-6 flex w-full gap-3">

                        <button
                            className="flex-1 rounded-xl border border-red-200 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50"
                            onClick={onCancel}
                        >
                            Cancel
                        </button>

                        <button
                            className="flex-1 rounded-xl bg-red-500 py-2 text-sm font-medium text-white transition hover:bg-red-600"
                            onClick={onDelete}
                        >
                            Delete
                        </button>

                    </div>

                </div>

            </div>

        </div>
    )
}

export default Confirm;
