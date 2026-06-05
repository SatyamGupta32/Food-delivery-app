import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../../config/services';
import { useAppData } from '../../context/appContext';
import PasswordInput from '../../components/common/PasswordInput';
import { PASSWORD_RULE_MESSAGE, isPasswordStrong } from '../../utils/passwordValidation';

const Singup = () => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { setUser, setIsAuth } = useAppData();

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    if (loading) return;

    const normalizedName = String(name || '').trim();
    const normalizedEmail = String(email || '').trim();
    const normalizedPassword = String(password || '');

    if (!normalizedName || !normalizedEmail || !normalizedPassword) {
      toast.error('Name, email, and password are required');
      return;
    }
    if (!isPasswordStrong(normalizedPassword)) {
      toast.error(PASSWORD_RULE_MESSAGE);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${authService}/api/auth/email-signup`, {
        name: normalizedName,
        email: normalizedEmail,
        password: normalizedPassword
      });

      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      setIsAuth(true);

      toast.success(res.data.message || 'Signed up successfully');
      navigate('/');
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        error.message ||
        'Unable to signup'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen w-full justify-center items-center bg-white px-4'>
      <div className="w-full max-w-sm space-y-6">
        <h1 className='text-center text-3xl font-bold text-red-600'>
          Zomato
        </h1>
        <p className='text-center text-sm text-gray-500'>
          Create your account
        </p>

        <form onSubmit={handleEmailSignup} className='space-y-3'>
          <div className='space-y-1'>
            <label className='block text-sm text-gray-600'>Name</label>
            <input
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-red-600'
              placeholder='Enter your name'
            />
          </div>

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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Enter your password'
              showPassword={showPassword}
              onToggle={() => setShowPassword((value) => !value)}
            />
            <p className='text-xs text-gray-500'>
              {PASSWORD_RULE_MESSAGE}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className='w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-70 disabled:cursor-not-allowed'
          >
            {loading ? 'Please wait...' : 'Create Account'}
          </button>
        </form>

        <p className='text-center text-sm text-gray-500'>
          Already have an account?{' '}
          <Link to="/login" className='font-medium text-red-600'>
            Login
          </Link>
        </p>

        <p className='text-center text-xs text-gray-400'>
          By continuing, you agree with our{' '}
          <span className='text-red-600'>Terms of services</span>
          {' '}and{' '}
          <span className='text-red-600'>Privacy Policy</span>
        </p>
      </div>
    </div>
  )
}

export default Singup
