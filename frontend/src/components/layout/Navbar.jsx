import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useAppData } from '../../context/appContext';
import { BiMapPin, BiSearch } from 'react-icons/bi';
import Header from './Header';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { restaurantService } from '../../config/services';


const Navbar = () => {
    const { city } = useAppData();
    const navigate = useNavigate();
    const currLocation = useLocation();

    const [searchParams, setSearchParams] = useSearchParams();

    const searchQuery = searchParams.get('search') || '';
    const isHomePage = currLocation.pathname === '/';

    const [search, setSearch] = useState(searchQuery);
    const [loading, setLoading] = useState(false);
    const [productSuggestions, setProductSuggestions] = useState([]);
    const [restaurantSuggestions, setRestaurantSuggestions] = useState([]);


    useEffect(() => {
        setSearch(searchQuery);
    }, [searchQuery]);

    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         const value = search.trim();
    //         if (value === searchQuery) return;

    //         if (value)
    //             setSearchParams({ search: value }, { replace: true });
    //         else
    //             setSearchParams({}, { replace: true });
    //     }, 500);
    //     return () => clearTimeout(timer);
    // }, [search, searchQuery, setSearchParams]);

    useEffect(() => {

        if (search.length < 2) {
            setProductSuggestions([]);
            setRestaurantSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {

            try {

                setLoading(true);

                const { data } = await axios.get(
                    `${restaurantService}/api/menu/search?query=${search}`
                );

                setRestaurantSuggestions(data.restaurants || []);
                setProductSuggestions(data.products || []);

                console.log("restaurants", restaurantSuggestions);
                console.log("products", productSuggestions);
            } catch (err) {
                console.log(err);
            }
            finally {
                setLoading(false);
            }

        }, 300);

        return () => clearTimeout(timer);

    }, [search]);

    return (
        <div className='w-full bg-white shadow-sm fixed z-10 left-0 right-0 top-0'>
            {/* Navbar Header*/}
            <Header showCart={true} />
            {/* Search Bar */}
            {
                isHomePage
                && <div className='border-t px-4 py-3'>
                    <div className={`mx-auto relative flex max-w-7xl items-center shadow-sm ${(restaurantSuggestions.length > 0 || productSuggestions.length > 0) ? "border border-gray-200 rounded-t-xl rounded-b-none" : "border border-gray-200 rounded-xl"}`}>
                        <div className='flex items-center gap-2 px-3 border-r text-gray-700'>
                            <BiMapPin className='w-4 h-4 text-red-600' />
                            <span className='text-sm truncate max-w-35'>{city}</span>
                        </div>
                        <div className='w-full flex items-center gap-2 px-3'>
                            <BiSearch
                                className='w-5 h-5 text-gray-400'
                                onClick={() => {
                                    navigate(`/search?query=${search}`);
                                    setProductSuggestions([]);
                                    setRestaurantSuggestions([]);
                                }}
                            />
                            <input
                                type='text'
                                id='nvbar-search'
                                name='navbar-search'
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        navigate(`/search?query=${search}`);
                                        setProductSuggestions([]);
                                        setRestaurantSuggestions([]);
                                    }
                                }}
                                className='w-full py-3 text-sm outline-none placeholder:text-gray-400'
                                placeholder='Search for restaurant, cuisine or dish'
                            />

                        </div>
                        {
                            (restaurantSuggestions.length > 0 ||
                                productSuggestions.length > 0) && (

                                <div className='absolute top-full left-0 right-0 bg-white border border-t-0 border-gray-200 rounded-b-xl shadow-xl z-50 max-h-96 overflow-y-auto'>

                                    {/* Restaurants */}

                                    {restaurantSuggestions.length > 0 && (
                                        <>
                                            <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 bg-gray-50 border-b">
                                                Restaurants
                                            </div>

                                            {restaurantSuggestions.map(rest => (
                                                <div
                                                    key={rest._id}
                                                    className='flex gap-3 p-3 hover:bg-gray-100 cursor-pointer'
                                                    onClick={() => {
                                                        navigate(`/restaurant/${rest._id}`);
                                                        setRestaurantSuggestions([]);
                                                        setProductSuggestions([]);
                                                    }}
                                                >
                                                    <img
                                                        src={rest.image}
                                                        alt={rest.name}
                                                        className="w-12 h-12 rounded object-cover"
                                                    />

                                                    <div>
                                                        <h4 className="text-sm font-medium">
                                                            {rest.name}
                                                        </h4>

                                                        <p className="text-xs text-gray-500">
                                                            Restaurant
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    )}

                                    {/* Products */}

                                    {productSuggestions.length > 0 && (
                                        <>
                                            <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 bg-gray-50 border-b">
                                                Products
                                            </div>

                                            {productSuggestions.map(item => (
                                                <div
                                                    key={item._id}
                                                    className='flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-all duration-150 cursor-pointer border-b border-gray-100 last:border-b-0'
                                                    onClick={() => {
                                                        navigate(`/search?query=${item.name}`);
                                                        setProductSuggestions([]);
                                                        setRestaurantSuggestions([]);
                                                    }}
                                                >
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className='w-12 h-12 rounded object-cover'
                                                    />

                                                    <div>
                                                        <h4 className='text-sm font-medium'>
                                                            {item.name}
                                                        </h4>

                                                        <p className='text-xs text-gray-500'>
                                                            {item.restaurant?.name}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    )}

                                </div>
                            )
                        }
                    </div>
                </div>

            }
        </div>
    )
}

export default Navbar
