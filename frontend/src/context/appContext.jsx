import axios from 'axios';
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authService, restaurantService, utilsService } from '../config/services';
import { toast, Toaster } from 'react-hot-toast';
import { BiLoader } from 'react-icons/bi';

const GEO_OPTIONS = {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 10000,
};


const appContext = createContext(undefined);


export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuth, setIsAuth] = useState(false);
    const [loading, setLoading] = useState(true);

    const [location, setLocation] = useState(null);
    const [loadingLocation, setLoadingLocation] = useState(true);
    const [locationError, setLocationError] = useState(null);
    const [city, setCity] = useState(<BiLoader className="w-5 h-5 text-gray-500 animate-spin" />)

    const [cart, setCart] = useState([]);
    const [subTotal, setSubTotal] = useState(0);
    const [quantity, setQuantity] = useState(0);


    async function fetchUser() {
        try {
            const token = localStorage.getItem('token');
            if (!token) { setLoading(false); return; };

            const { data } = await axios.get(`${authService}/api/auth/my-profile`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUser(data.user);
            setIsAuth(true);

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchCart() {

        if (!user || user.role !== 'customer') return;

        try {
            const { data } = await axios.get(`${restaurantService}/api/cart/fetch-cart`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            )
            setCart(data.cart || []);
            setSubTotal(data.subTotal || 0);
            setQuantity(data.cartLength || 0);

        } catch (error) {
            console.log(error);
            toast.error('Failed to fetch cart');
        }
    }

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        if (user && user.role === 'customer')
            fetchCart();
    }, [user]);

    useEffect(() => {
        console.log("USER STATE:", user);
    }, [user]);

    const requestLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setLocationError('unsupported');
            setLoadingLocation(false);
            toast.error('Geolocation is not supported in this browser');
            return;
        }

        setLoadingLocation(true);
        setLocationError(null);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const res = await axios.get(`${utilsService}/api/utils/reverse-geocode`, {
                        params: { lat: latitude, lon: longitude },
                    });

                    const data = await res.data;

                    setLocation({
                        latitude,
                        longitude,
                        formattedAddress: data.display_name || 'Your location',
                    });
                    setCity(
                        data.address?.city ||
                        data.address?.village ||
                        data.address?.town ||
                        'Your area'
                    );
                } catch {
                    setLocation({
                        latitude,
                        longitude,
                        formattedAddress: 'Your location',
                    });
                    setCity('Your area');
                } finally {
                    setLoadingLocation(false);
                }
            },
            (err) => {
                setLoadingLocation(false);
                if (err.code === 1) {
                    setLocationError('denied');
                    toast.error('Location access denied');
                } else if (err.code === 3) {
                    setLocationError('timeout');
                    toast.error('Location request timed out — try again');
                } else {
                    setLocationError('unavailable');
                    toast.error('Could not detect your location');
                }
            },
            GEO_OPTIONS
        );
    }, []);

    useEffect(() => {
        requestLocation();
    }, [requestLocation]);

    return (
        <appContext.Provider value={{
            user,
            setUser,
            isAuth,
            setIsAuth,
            loading,
            setLoading,
            city,
            location,
            loadingLocation,
            locationError,
            requestLocation,
            cart,
            fetchUser,
            fetchCart,
            subTotal,
            quantity,
        }}>
            {children}
            <Toaster />
        </appContext.Provider>
    );
};

export const useAppData = () => {
    const context = useContext(appContext);
    if (!context) throw new Error('useAppData must be used within AppProvider');
    return context;
};
