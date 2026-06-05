import { CgShoppingCart } from 'react-icons/cg';
import { Link } from 'react-router-dom';
import { useAppData } from '../../context/appContext';

const Header = ({ showCart = true }) => {

    const { isAuth, quantity } = useAppData();
    console.log("showCart", showCart);
    console.log("quantity", quantity);

    return (
        <div className='mx-auto max-w-7xl flex items-center justify-between px-4 py-3'>
            <Link to="/" className='text-2xl font-bold cursor-pointer text-red-600'>
                Zomato
            </Link>

            <div className='flex items-center gap-4'>
                {
                    showCart
                    && <Link to="/cart" className='relative'>
                        <CgShoppingCart className='w-6 h-6 text-red-600' />
                        <span className='absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full bg-red-600 text-sm text-white'>
                            {quantity}
                        </span>
                    </Link>
                }
                {
                    isAuth
                        ? <Link
                            to="/account"
                            className='font-medium text-red-600'>
                            Profile
                        </Link>
                        : <Link
                            to="/login"
                            className='font-medium text-red-600'>
                            Login
                        </Link>
                }
            </div>
        </div>
    )
}

export default Header
