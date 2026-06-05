import toast from 'react-hot-toast';
import { useAppData } from '../../context/appContext'
import { useNavigate } from 'react-router-dom';
import { BiLogOut, BiMapPin, BiPackage } from 'react-icons/bi';
import { useState } from 'react';
import axios from 'axios';
import { authService } from '../../config/services';
import PasswordInput from '../../components/common/PasswordInput';
import { PASSWORD_RULE_MESSAGE, isPasswordStrong } from '../../utils/passwordValidation';

const Account = () => {

    const { user, setUser, setIsAuth, fetchUser } = useAppData();

    const firstLetter = user?.name?.charAt(0)?.toUpperCase() || '';
    const isCustomer = user?.role === 'customer';

    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const logoutHandler = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuth(false);
        navigate('/login');
        toast.success('Logged out successfully');
    }

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token || token === 'null') {
            toast.error('Authentication required. Please log in.');
            navigate('/login');
            return;
        }

        const normalizedNewPassword = String(newPassword || '');
        const normalizedCurrentPassword = String(currentPassword || '');

        if (!normalizedNewPassword) {
            toast.error('New password is required');
            return;
        }
        if (!isPasswordStrong(normalizedNewPassword)) {
            toast.error(PASSWORD_RULE_MESSAGE);
            return;
        }

        try {
            setLoading(true);

            const body = {
                newPassword: normalizedNewPassword,
            };

            if (normalizedCurrentPassword) body.currentPassword = normalizedCurrentPassword;

            const res = await axios.patch(`${authService}/api/auth/set-password`, body, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Keep auth token consistent with backend-issued token.
            if (res?.data?.token) localStorage.setItem('token', res.data.token);

            toast.success('Password updated successfully');
            setNewPassword('');
            setCurrentPassword('');
            setShowNewPassword(false);
            setShowCurrentPassword(false);
            fetchUser();
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                error.message ||
                'Unable to update password'
            );
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className='min-h-screen bg-gray-50 px-4 py-6'>
            <div className='mx-auto max-w-md rounded-lg bg-white shadow-sm'>
                <div className='flex items-center gap-4 border-b p-5'>
                    <div className='flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-xl font-semibold text-white'>
                        {firstLetter}
                    </div>
                    <div className='flex flex-col'>
                        <h2 className='text-xl font-semibold'>{user?.name}</h2>
                        <p className='text-gray-500'>{user?.email}</p>
                    </div>
                </div>
                <div className='divide-y'>
                    {isCustomer && (
                        <>
                            <div
                                className='flex cursor-pointer items-center gap-4 p-5 hover:bg-gray-50'
                                onClick={() => navigate('/orders')}
                            >
                                <BiPackage className='h-5 w-5 text-red-600' />
                                <span className='font-medium'>Your Orders</span>
                            </div>
                            <div
                                className='flex cursor-pointer items-center gap-4 p-5 hover:bg-gray-50'
                                onClick={() => navigate('/address')}
                            >
                                <BiMapPin className='h-5 w-5 text-red-600' />
                                <span className='font-medium'>Addresses</span>
                            </div>
                        </>
                    )}

                    <div className='p-5'>
                        <h3 className='mb-3 font-medium'>Change Password</h3>
                        <form onSubmit={handlePasswordUpdate} className='space-y-3'>
                            <div className='space-y-1'>
                                <label className='block text-sm text-gray-600'>New Password</label>
                                <PasswordInput
                                    autoComplete="new-password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder='Enter new password'
                                    showPassword={showNewPassword}
                                    onToggle={() => setShowNewPassword((value) => !value)}
                                />
                                <p className='text-xs text-gray-500'>
                                    {PASSWORD_RULE_MESSAGE}
                                </p>
                            </div>

                            <div className='space-y-1'>
                                <label className='block text-sm text-gray-600'>Current Password</label>
                                <PasswordInput
                                    autoComplete="current-password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder='Needed if you already have a password'
                                    showPassword={showCurrentPassword}
                                    onToggle={() => setShowCurrentPassword((value) => !value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-700'}`}
                            >
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    </div>

                    <div
                        className='flex cursor-pointer items-center gap-4 p-5 hover:bg-gray-50'
                        onClick={logoutHandler}
                    >
                        <BiLogOut className='h-5 w-5 text-red-600' />
                        <span className='font-medium'>Log Out</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Account
