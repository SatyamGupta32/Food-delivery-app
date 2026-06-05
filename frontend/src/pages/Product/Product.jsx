import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  BiArrowBack,
  BiMinus,
  BiPlus,
  BiHeart,
} from "react-icons/bi";
import { restaurantService } from "../../config/services";
import { useAppData } from "../../context/appContext";
import Loading from "../core/Loading";

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { cart, fetchCart } = useAppData();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [loadingState, setLoadingState] = useState({
    itemId: null,
    action: null,
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(
          `${restaurantService}/api/menu/item/${id}`
        );

        setProduct(data.item);

        if (data.relatedProducts) {
          setRelatedProducts(data.relatedProducts);
        }
      } catch (error) {
        console.log(error);
        toast.error("Failed to fetch product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const getItemQuantity = (productId) => {
    const cartItem = cart.find(
      (item) => item.itemId?._id === productId
    );

    return cartItem?.quantity || 0;
  };

  const addToCart = async (restaurantId, itemId) => {
    try {
      setLoadingState({
        itemId,
        action: "add",
      });

      await axios.post(
        `${restaurantService}/api/cart/add-cart`,
        {
          restaurantId,
          itemId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "token"
            )}`,
          },
        }
      );

      await fetchCart();
      toast.success("Added to cart");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        "Failed to add item"
      );
    } finally {
      setLoadingState({
        itemId: null,
        action: null,
      });
    }
  };

  const incQty = async (itemId) => {
    try {
      setLoadingState({
        itemId,
        action: "inc",
      });

      await axios.put(
        `${restaurantService}/api/cart/inc-cart`,
        { itemId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "token"
            )}`,
          },
        }
      );

      await fetchCart();
    } catch (error) {
      toast.error("Failed");
    } finally {
      setLoadingState({
        itemId: null,
        action: null,
      });
    }
  };

  const decQty = async (itemId) => {
    try {
      setLoadingState({
        itemId,
        action: "dec",
      });

      await axios.put(
        `${restaurantService}/api/cart/dec-cart`,
        { itemId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "token"
            )}`,
          },
        }
      );

      await fetchCart();
    } catch (error) {
      toast.error("Failed");
    } finally {
      setLoadingState({
        itemId: null,
        action: null,
      });
    }
  };

  if (loading) return <Loading />;

  if (!product) {
    return (
      <div className="text-center py-20">
        Product not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-28">

      {/* MOBILE UI */}

      <div className="lg:hidden">

        <div className="relative">

          <img
            src={product.image}
            alt={product.name}
            className="w-full h-80 object-cover"
          />

          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 bg-white shadow-md p-3 rounded-full"
          >
            <BiArrowBack className="w-5 h-5" />
          </button>

        </div>

        <div className="relative -mt-8 z-10 bg-white rounded-t-[35px] px-5 py-6">

          <div className="flex justify-between gap-4">

            <div>

              <h1 className="text-2xl font-bold">
                {product.name}
              </h1>

              <p className="text-gray-500 mt-1">
                {product.restaurant?.name}
              </p>

            </div>

            <h2 className="text-3xl font-bold text-red-500">
              ₹{product.price}
            </h2>

          </div>

          <div className="mt-5 bg-purple-100 border border-purple-200 rounded-xl p-4">

            <p className="text-purple-700 font-medium">
              🎉 Minimum order ₹199 to get 10% OFF
            </p>

          </div>

          <Link
            to={`/restaurant/${product.restaurant?._id}`}
            className="block mt-5"
          >
            <div className="border rounded-xl p-4 flex items-center gap-4">

              <img
                src={product.restaurant?.image}
                alt=""
                className="w-14 h-14 rounded-lg object-cover"
              />

              <div>

                <h3 className="font-semibold">
                  {product.restaurant?.name}
                </h3>

                <p className="text-sm text-gray-500">
                  Visit Restaurant →
                </p>

              </div>

            </div>
          </Link>

          <div className="mt-8">

            <h3 className="font-semibold text-xl mb-3">
              Description
            </h3>

            <p className="text-gray-600 leading-7">
              {product.description}
            </p>

          </div>

          {
            relatedProducts.length > 0 && (

              <div className="mt-10">

                <h2 className="font-bold text-xl mb-4">
                  More From This Restaurant
                </h2>

                <div className="flex gap-4 overflow-x-auto pb-2">

                  {
                    relatedProducts.map(item => (

                      <Link
                        key={item._id}
                        to={`/product/${item._id}`}
                        className="min-w-44 bg-white border rounded-xl overflow-hidden"
                      >

                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-32 object-cover"
                        />

                        <div className="p-3">

                          <h3 className="text-sm font-medium line-clamp-2">
                            {item.name}
                          </h3>

                          <p className="mt-2 font-bold text-red-500">
                            ₹{item.price}
                          </p>

                        </div>

                      </Link>

                    ))
                  }

                </div>

              </div>

            )
          }

        </div>

      </div>

      {/* DESKTOP UI */}

      <div className="hidden lg:block">

        <div className="max-w-7xl mx-auto px-4 py-8">

          <button
            onClick={() => navigate(-1)}
            className="mb-5 flex items-center gap-2 text-gray-600 hover:text-black"
          >
            <BiArrowBack />
            Back
          </button>

          <div className="grid lg:grid-cols-2 gap-10">

            <div className="bg-white rounded-2xl overflow-hidden shadow">

              <img
                src={product.image}
                alt={product.name}
                className="w-full h-150 object-contain p-6"
              />

            </div>

            <div className="bg-white rounded-2xl p-8 shadow">

              <h1 className="text-4xl font-bold">
                {product.name}
              </h1>

              <button
                onClick={() =>
                  navigate(`/restaurant/${product.restaurant?._id}`)
                }
                className="mt-3 text-red-500 font-medium"
              >
                {product.restaurant?.name}
              </button>

              <h2 className="text-5xl font-bold text-green-600 mt-8">
                ₹{product.price}
              </h2>

              <div className="mt-6 bg-purple-100 border border-purple-200 rounded-xl p-4">

                <p className="font-medium text-purple-700">
                  🎉 Minimum order ₹199 to get 10% OFF
                </p>

              </div>

              <div className="mt-8">

                <h3 className="font-semibold text-2xl mb-3">
                  Description
                </h3>

                <p className="text-gray-600 leading-8">
                  {product.description}
                </p>

              </div>

            </div>

          </div>

          {
            relatedProducts.length > 0 && (

              <div className="mt-14">

                <h2 className="text-3xl font-bold mb-6">
                  More From This Restaurant
                </h2>

                <div className="grid grid-cols-4 gap-5">

                  {
                    relatedProducts.map(item => (

                      <Link
                        key={item._id}
                        to={`/product/${item._id}`}
                        className="bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition"
                      >

                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-52 object-cover"
                        />

                        <div className="p-4">

                          <h3 className="font-medium line-clamp-2">
                            {item.name}
                          </h3>

                          <p className="mt-2 font-bold text-red-500">
                            ₹{item.price}
                          </p>

                        </div>

                      </Link>

                    ))
                  }

                </div>

              </div>

            )
          }

        </div>

      </div>

      {/* STICKY CART */}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-50">

        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">

          <div>

            <p className="text-sm text-gray-500">
              Total
            </p>

            <h3 className="font-bold text-xl">
              ₹{product.price * (getItemQuantity(product._id) || 1)}
            </h3>

          </div>

          {
            getItemQuantity(product._id) > 0 ? (

              <div className="flex items-center border rounded-xl overflow-hidden">

                <button
                  disabled={
                    loadingState.itemId === product._id &&
                    loadingState.action === "dec"
                  }
                  onClick={() => decQty(product._id)}
                  className="px-5 py-3"
                >
                  <BiMinus />
                </button>

                <span className="px-6 font-semibold">
                  {getItemQuantity(product._id)}
                </span>

                <button
                  disabled={
                    loadingState.itemId === product._id &&
                    loadingState.action === "inc"
                  }
                  onClick={() => incQty(product._id)}
                  className="px-5 py-3"
                >
                  <BiPlus />
                </button>

              </div>

            ) : (

              <button
                onClick={() =>
                  addToCart(
                    product.restaurant?._id,
                    product._id
                  )
                }
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl font-semibold"
              >
                Add To Cart
              </button>

            )
          }

        </div>

      </div>

    </div>
  );
};

export default Product;