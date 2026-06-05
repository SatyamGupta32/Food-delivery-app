import { useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { restaurantService } from "../../../config/services";
import { BiLoaderCircle, BiSearch } from "react-icons/bi";
import { Link } from "react-router-dom";
import { useAppData } from "../../../context/appContext";
import toast from "react-hot-toast";
import { BiMinus, BiPlus } from "react-icons/bi";

const SearchResults = () => {

    const { cart, fetchCart } = useAppData();
    const [products, setProducts] = useState([]);
    const [maxPrice, setMaxPrice] = useState(1000);
    const [sort, setSort] = useState("");
    const [restaurants, setRestaurants] = useState([]);
    const [loadingState, setLoadingState] = useState({
        itemId: null,
        action: null
    });

    const [searchParams] = useSearchParams();

    const query = searchParams.get("query");

    useEffect(() => {

        const fetchData = async () => {
            try {
                const { data } = await axios.get(
                    `${restaurantService}/api/menu/search?query=${query}`
                );

                setRestaurants(data.restaurants || []);
                setProducts(data.products || []);
            } catch (error) {
                console.log(error);
            }
        };

        fetchData();
    }, [query]);

    const filteredProducts = useMemo(() => {

        let result = [...products];

        result = result.filter(item => item.price <= maxPrice);

        if (sort === "low-high") {
            result.sort((a, b) => a.price - b.price);
        }

        if (sort === "high-low") {
            result.sort((a, b) => b.price - a.price);
        }

        return result;

    }, [products, maxPrice, sort]);

    const getItemQuantity = (productId) => {

        const cartItem = cart.find(
            item => item.itemId?._id === productId
        );

        return cartItem?.quantity || 0;
    };

    const addToCart = async (restaurantId, itemId) => {
        try {
            await axios.post(
                `${restaurantService}/api/cart/add-cart`,
                {restaurantId, itemId },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            await fetchCart();
        } catch (error) {
            toast.error(
                error?.response?.data?.message || "Failed to add item"
            );
        }
    };

    const incQty = async (itemId) => {
        setLoadingState({
            itemId: itemId,
            action: "inc"
        });
        try {
            await axios.put(
                `${restaurantService}/api/cart/inc-cart`,
                { itemId },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            await fetchCart();
        } catch (error) {
            toast.error(
                error?.response?.data?.message || "Failed"
            );
        } finally {
            setLoadingState({
                itemId: null,
                action: null
            });
        }
    };

    const decQty = async (itemId) => {
        try {
            setLoadingState({
                itemId: itemId,
                action: "dec"
            });
            await axios.put(
                `${restaurantService}/api/cart/dec-cart`,
                { itemId },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            await fetchCart();
        } catch (error) {
            toast.error(
                error?.response?.data?.message || "Failed"
            );
        } finally {
            setLoadingState({
                itemId: null,
                action: null
            });
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">

            {/* Heading */}

            <div className="mb-8">

                <h1 className="text-3xl font-bold">
                    Search Results
                </h1>

                <p className="text-gray-500 mt-1">
                    Showing results for "{query}"
                </p>

            </div>

            <div className="grid lg:grid-cols-4 gap-8">

                {/* Filters */}

                <div className="bg-white rounded-xl border p-5 h-fit sticky top-28">

                    <h3 className="font-semibold text-lg mb-4">
                        Filters
                    </h3>

                    <div className="mb-5">

                        <label className="text-sm font-medium block mb-2">
                            Max Price ₹{maxPrice}
                        </label>

                        <input
                            type="range"
                            min="50"
                            max="1000"
                            value={maxPrice}
                            onChange={(e) =>
                                setMaxPrice(Number(e.target.value))
                            }
                            className="w-full"
                        />
                    </div>

                    <div>

                        <label className="text-sm font-medium block mb-2">
                            Sort
                        </label>

                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="w-full border rounded-lg p-2"
                        >
                            <option value="">
                                Recommended
                            </option>

                            <option value="low-high">
                                Price Low to High
                            </option>

                            <option value="high-low">
                                Price High to Low
                            </option>

                        </select>

                    </div>

                </div>

                {/* Products */}

                <div className="lg:col-span-3">

                    <div className="mb-4 text-sm text-gray-500">
                        {filteredProducts.length} items found
                    </div>

                    <div className="space-y-4">
                        {
                            filteredProducts.map(item => {
                                const isIncLoading = loadingState.itemId === item._id && loadingState.action === "inc";
                                const isDecLoading = loadingState.itemId === item._id && loadingState.action === "dec";

                                return (
                                    <Link
                                        to={`/product/${item._id}`}
                                        key={item._id}
                                        className="block"
                                    >
                                        <div
                                            key={item._id}
                                            className="bg-white border rounded-xl p-4 flex gap-4 hover:shadow-md transition"
                                        >

                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-32 h-32 rounded-xl object-cover"
                                            />

                                            <div className="flex-1">

                                                <h3 className="font-semibold text-lg">
                                                    {item.name}
                                                </h3>

                                                <p className="text-gray-500 text-sm mt-1">
                                                    {item.restaurantName}
                                                </p>

                                                <p className="font-bold text-green-600 mt-3">
                                                    ₹{item.price}
                                                </p>
                                                {
                                                    getItemQuantity(item._id) > 0 ? (

                                                        <div
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                            }}
                                                            className="mt-4 flex items-center border rounded-lg w-fit overflow-hidden"
                                                        >

                                                            <button disabled={isDecLoading} onClick={() => decQty(item._id)} className='px-3 py-2 border-r hover:bg-gray-100 disabled:opacity-50'>
                                                                <BiMinus className='w-5 h-5 text-red-600' />
                                                            </button>

                                                            <span className='text-center w-10 py-2 text-sm font-medium border-r'>{getItemQuantity(item._id)}</span>

                                                            <button disabled={isIncLoading} onClick={() => incQty(item._id)} className='px-3 py-2 hover:bg-gray-100 disabled:opacity-50'>
                                                                <BiPlus className='w-5 h-5 text-red-600' />
                                                            </button>

                                                        </div>

                                                    ) : (

                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();

                                                                addToCart(
                                                                    item.restaurant?._id,
                                                                    item._id
                                                                );
                                                            }}
                                                            className="mt-4 border border-red-500 text-red-500 px-7 py-1 rounded-lg hover:bg-red-500 hover:text-white"
                                                        >
                                                            ADD
                                                        </button>

                                                    )
                                                }
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })
                        }
                    </div>

                </div>

            </div>

        </div>
    );
};

export default SearchResults;