import { useState } from 'react'
import { useAppData } from '../../context/appContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import { authService } from '../../config/services';
import toast from 'react-hot-toast';
import rider from '../../assets/images/rider.jpg';
import seller from '../../assets/images/seller.jpg';
import customer from '../../assets/images/customer.jpg';


const SelectRole = () => {

    const [role, setRole] = useState(null);

    const { user, setUser } = useAppData();
    const navigate = useNavigate();

    const roles = ["customer", "rider", "seller"];

    const images = { customer: customer, rider: rider, seller: seller };

    const addRole = async () => {
        const token = localStorage.getItem('token');
        if (!token || token === 'null') {
            toast.error('Authentication required. Please log in.');
            navigate('/login');
            return;
        }

        try {
            const { data } = await axios.put(`${authService}/api/auth/add-role`, { role }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            localStorage.setItem('token', data.token);
            setUser(data.user);
            navigate('/', { replace: true });
        } catch (error) {
            console.error(error); 
            const message = error?.response?.data?.message || error?.message || 'Something went wrong';
            toast.error(message);
        }
    }
    return (
        <div className='flex min-h-screen items-center justify-center bg-white px-4 py-5 md:py-4'>
            <div className='flex w-full max-w-5xl max-h-screen flex-col gap-10'>
                <h1 className='text-center text-3xl font-bold'>
                    Select Role
                </h1>

                <div className='flex flex-col gap-3 md:flex-row'>
                    {roles.map((r) => {
                        return (
                            <button
                                key={r}
                                className={`w-full whitespace-nowrap border rounded-md text-md font-medium capitalize transition-all px-5 py-3 cursor-pointer hover:border-gray-600 hover:bg-gray-100 ${role === r ? 'border-red-600 bg-red-100 hover:border-red-600 hover:bg-red-100' : 'border-gray-300 bg-white text-gray-700'} `}
                                onClick={() => setRole(r)}
                            >
                                <span className='flex flex-col items-center gap-4'>
                                    <div className="max-w-xl w-full mx-auto">
                                        <img src={images[r]} alt={r} className="w-20 md:w-40 h-20 md:h-40 mx-auto" />
                                    </div>
                                    continue as {r}
                                </span>
                            </button>
                        )
                    })}
                </div>
                <button
                    disabled={!role}
                    onClick={addRole}
                    className={`w-full whitespace-nowrap border rounded-md text-md font-medium capitalize transition-all px-5 py-3 hover:border-gray-600 hover:bg-gray-100 ${role ? ' hover:border-red-600 hover:bg-red-100 cursor-pointer' : 'border-gray-300 bg-white text-gray-700 opacity-75 cursor-not-allowed'} `}
                >
                    Next
                </button>
            </div>
        </div>

    )
}

export default SelectRole
