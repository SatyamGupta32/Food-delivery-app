import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../config/services';
import toast from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';
import { FcGoogle } from 'react-icons/fc';
import { useAppData } from '../../context/appContext';
import PasswordInput from '../../components/common/PasswordInput';

const Login = () => {
    const [googleLoading, setGoogleLoading] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const { setUser, setIsAuth } = useAppData();

    const responseGoogle = async (authResult) => {

        if (!authResult?.code) {
            toast.error('Google login failed');
            setGoogleLoading(false);
            return;
        }

        try {

            const res = await axios.post(
                `${authService}/api/auth/google_login`,
                { code: authResult.code }
            );
            localStorage.setItem('token', res.data.token);

            setUser(res.data.user);
            setIsAuth(true);

            toast.success(res.data.message);

            navigate('/');

        } catch (error) {

            console.log(error);

            toast.error(
                error.response?.data?.message ||
                'Unable to reach auth server'
            );

        } finally {
            setGoogleLoading(false);
        }
    };

    const googleLogin = useGoogleLogin({
        onSuccess: responseGoogle,
        onError: () => {
            toast.error('Google Login Failed');
            setGoogleLoading(false);
        },
        flow: 'auth-code',
    });

    const handleGoogleLogin = () => {

        if (googleLoading || emailLoading) return;

        setGoogleLoading(true);

        googleLogin();
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        if (emailLoading || googleLoading) return;

        const normalizedEmail = String(email || '').trim();
        const normalizedPassword = String(password || '');

        if (!normalizedEmail || !normalizedPassword) {
            toast.error('Email and password are required');
            return;
        }

        try {
            setEmailLoading(true);
            const res = await axios.post(`${authService}/api/auth/email-login`, {
                email: normalizedEmail,
                password: normalizedPassword
            });

            localStorage.setItem('token', res.data.token);
            setUser(res.data.user);
            setIsAuth(true);

            toast.success(res.data.message || 'Logged in successfully');
            navigate('/');
        } catch (error) {
            const messages = error.response?.data?.messages;
            if (messages?.length) messages.forEach((msg, index) => { setTimeout(() => { toast.error(msg) }, index * 500) });
            else toast.error(error.response?.data?.message || error.message || 'Unable to login');
        } finally {
            setEmailLoading(false);
        }
    };

    return (
        <div className='flex min-h-screen w-full justify-center items-center bg-white px-4'>
            <div className="w-full max-w-sm space-y-6">
                <h1 className='text-center text-3xl font-bold text-red-600'>
                    Zomato
                </h1>
                <p className='text-center text-sm text-gray-500'>
                    Log in to continue
                </p>
                <button className={`flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 ${googleLoading || emailLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'}`}
                    onClick={handleGoogleLogin}
                    disabled={googleLoading || emailLoading}
                >
                    <FcGoogle size={24} />
                    <span className='flex items-center gap-2'>
                        {
                            googleLoading ?
                                'Signing in...' :
                                <span className='font-light'>
                                    Login with Google
                                </span>
                        }
                    </span>
                </button>

                <div className='flex items-center gap-3'>
                    <div className='h-px flex-1 bg-gray-200' />
                    <span className='text-xs text-gray-400'>OR</span>
                    <div className='h-px flex-1 bg-gray-200' />
                </div>

                <form onSubmit={handleEmailLogin} className='space-y-3'>
                    <div className='space-y-1'>
                        <label className='block text-sm text-gray-600'>Email</label>
                        <input
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-red-600'
                            placeholder='Enter your email'
                        />
                    </div>

                    <div className='space-y-1'>
                        <label className='block text-sm text-gray-600'>Password</label>
                        <PasswordInput
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder='Enter your password'
                            showPassword={showPassword}
                            onToggle={() => setShowPassword((value) => !value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={emailLoading || googleLoading}
                        className={`w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-70 disabled:cursor-not-allowed ${emailLoading || googleLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        {emailLoading ? 'Please wait...' : 'Login with Email'}
                    </button>

                </form>
                <p className='text-center text-sm text-gray-500'>
                    New to Zomato?{' '}
                    <Link to="/signup" className='font-medium text-red-600'>
                        Create account
                    </Link>
                </p>
                <p className='text-center text-xs text-gray-400'>
                    By continuing, you agree with our{" "}
                    <span className='text-red-600'>Terms of services & {" "}</span>
                    <span className='text-red-600'>Privacy Policy</span>
                </p>
            </div>
        </div>
    )
}

export default Login;
