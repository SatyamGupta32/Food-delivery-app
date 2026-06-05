import axios from 'axios';
import React, { useState } from 'react'
import toast from 'react-hot-toast';
import { BiCartAdd, BiLoader, BiTrash, BiMinus, BiPlus } from 'react-icons/bi';
import { CgEye } from 'react-icons/cg';
import { FiEyeOff } from 'react-icons/fi';
import { restaurantService } from '../../../config/services';
import { useAppData } from '../../../context/appContext';
import Confirm from '../../core/confirm';
import { Link } from "react-router-dom";

const MenuItems = ({ items = [], isSeller, onItemDeleted }) => {

  const [loadingState, setLoadingState] = useState({
    itemId: null,
    action: null
  });

  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);

  const { cart, fetchCart } = useAppData();

  const getItemQuantity = (productId) => {
    const cartItem = cart.find(
      item => item.itemId?._id === productId
    );

    return cartItem?.quantity || 0;
  };

  const handleDeleteItem = async (itemId) => {
    if (!showConfirm) {
      setSelectedItemId(itemId);
      setShowConfirm(true);
      return;
    }

    try {
      await axios.delete(`${restaurantService}/api/menu/delete-item/${selectedItemId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      toast.success('Item deleted successfully');
      onItemDeleted();
    } catch (error) {
      console.log(error);
      toast.error('Failed to delete item');
    } finally {
      setShowConfirm(false);
      setSelectedItemId(null);
    }
  };

  const toggleAvailability = async (itemId) => {

    try {
      const { data } = await axios.put(`${restaurantService}/api/menu/toggle-item/${itemId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
      toast.success(data.message);
      onItemDeleted();
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || 'Failed to toggle item');
    }
  };

  const addToCart = async (restaurantId, itemId) => {
    try {
      setLoadingState({
        itemId,
        action: "add"
      });

      const { data } = await axios.post(`${restaurantService}/api/cart/add-cart`,
        { restaurantId, itemId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );
      toast.success(data.message);
      fetchCart();
      console.log(cart);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || 'Failed to add item to cart');
    } finally {
      setLoadingState({
        itemId: null,
        action: null
      });
    }
  }

  const incQty = async (itemId) => {
    try {
      setLoadingState({
        itemId,
        action: "inc"
      });

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
      toast.error(error?.response?.data?.message || "Failed");
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
        itemId,
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
      toast.error(error?.response?.data?.message || "Failed");
    } finally {
      setLoadingState({
        itemId: null,
        action: null
      });
    }
  };

  return (
    <>
      <div className='grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4'>
        {
          items.map((item) => {
            const isAddLoading =
              loadingState.itemId === item._id &&
              loadingState.action === "add";
            return (
              <Link
                to={`/product/${item._id}`}
                key={item._id}
              >
                <div
                  key={item._id}
                  className={`relative flex gap-4 crounded-lg bg-white p-4 shadow-lg border-gray-300 transition ${!item.isAvailable ? 'opacity-70' : ''}`}
                >
                  <div className='relative shrink-0'>
                    <img
                      src={item.image}
                      alt="item-image"
                      className={`h-30 w-20 object-cover border border-gray-300 rounded-md ${!item.isAvailable ? 'grayscale brightness-75' : ''}`}
                    />
                    {
                      !item.isAvailable &&
                      <span className='absolute inset-0 flex items-center justify-center rounded bg-black/60 text-xs font-semibold text-white'>
                        Not Available
                      </span>
                    }
                  </div>
                  <div className='flex flex-1 flex-col justify-between'>
                    <div className='flex flex-col gap-3'>
                      <h3 className='font-semibold text-sm'>{item.name}</h3>
                      {
                        item.description && (
                          <p className='text-xs line-clamp-3 text-gray-500'>{item.description}</p>
                        )
                      }
                    </div>
                    <div className='flex items-center justify-between'>
                      <p className='font-medium text-sm'>₹ {item.price}</p>

                      {
                        isSeller && (
                          <div className='flex gap-2'>
                            <button
                              onClick={() => toggleAvailability(item._id)}
                              className='rounded-lg p-2 text-gray-600 hover:bg-gray-100 cursor-pointer'
                            >
                              {item.isAvailable ? <CgEye className='w-5 h-4' /> : <FiEyeOff className='w-5 h-5' />}
                            </button>

                            <button
                              onClick={() => handleDeleteItem(item._id)}
                              className='rounded-lg p-2 text-red-600 hover:bg-red-100 cursor-pointer'
                            >
                              <BiTrash className='w-5 h-5' />
                            </button>
                          </div>
                        )
                      }

                      {
                        !isSeller && (
                          <>
                            {
                              getItemQuantity(item._id) > 0 ? (

                                <div className="flex items-center border rounded-lg overflow-hidden">

                                  <button
                                    disabled={loadingState.itemId === item._id && loadingState.action === "dec"}
                                    onClick={() => decQty(item._id)}
                                    className="px-2 py-2 border-r"
                                  >
                                    <BiMinus />
                                  </button>

                                  <span className="px-3">
                                    {getItemQuantity(item._id)}
                                  </span>

                                  <button
                                    disabled={loadingState.itemId === item._id && loadingState.action === "inc"}
                                    onClick={() => incQty(item._id)}
                                    className="px-2 py-2 border-l"
                                  >
                                    <BiPlus />
                                  </button>

                                </div>

                              ) : (

                                <button
                                  disabled={!item.isAvailable}
                                  onClick={() => addToCart(item.restaurantId, item._id)}
                                  className="rounded-lg p-2 text-red-500 hover:bg-red-100"
                                >
                                  <BiCartAdd className="w-5 h-5" />
                                </button>

                              )
                            }
                          </>
                        )
                      }
                    </div>
                  </div>
                </div>
              </Link>
            )
          })
        }
      </div>
      {
        showConfirm && (
          <Confirm
            onCancel={() => {
              setShowConfirm(false);
              setSelectedItemId(null);
            }}
            onDelete={() => handleDeleteItem()}
          />
        )
      }
    </>
  )
}

export default MenuItems
