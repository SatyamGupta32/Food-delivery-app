import axios from 'axios';
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { useSocket } from '../../context/socketContext';
import { restaurantService } from '../../config/services';
import Loading from '../core/Loading';
import DeliveryMap from '../../components/map/DeliveryMap';

const OrderDetails = () => {

  const { id } = useParams();
  const { socket } = useSocket();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [riderLocation, setRiderLocation] = useState(null);

  const fetchOrder = async () => {
    try {
      const { data } = await axios.get(`${restaurantService}/api/order/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      });
      setOrder(data.order || null);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (!socket) return;

    const onUpdateOrder = () => {
      fetchOrder();
    };
    socket.on('Order-Update', onUpdateOrder);
    socket.on('order:rider_assigned', onUpdateOrder);
    socket.on('order:picked_up', onUpdateOrder);
    socket.on('order:delivered', onUpdateOrder);


    return () => {
      socket.off('Order-Update', onUpdateOrder);
      socket.off('order:rider_assigned', onUpdateOrder);
      socket.off('order:picked_up', onUpdateOrder);
      socket.off('order:delivered', onUpdateOrder);
    }
  }, [socket]);

  useEffect(() => {
    if (!socket || !order?.userId) return;

    const room = `user:${order.userId}`;
    socket.emit('join', room);

    return () => socket.emit('leave', room);
  }, [socket, order?.userId]);

  useEffect(() => {
    if (!socket) return;

    const onRiderLocation = ({ latitude, longitude, orderId }) => {
      if (orderId && orderId !== id) return;
      setRiderLocation([latitude, longitude]);
    };

    socket.on('rider:location', onRiderLocation);
    return () => socket.off('rider:location', onRiderLocation);
  }, [socket, id]);

  if (loading) return <Loading />;

  if (!order) return (
    <div className="min-h-[93vh] bg-gray-50 flex items-center justify-center">
      <p className="to-gray-500">No order yet....</p>
    </div>
  );
  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold">
                Order #{order._id.slice(-6)}
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>

            <div
              className={`px-4 py-2 rounded-full text-sm font-medium
            ${order.status === "placed" ? "bg-yellow-100 text-yellow-700" : order.status === "accepted" ? "bg-blue-100 text-blue-700" : order.status === "preparing" ? "bg-purple-100 text-purple-700" : order.status === "ready_for_rider" ? "bg-orange-100 text-orange-700" : order.status === "delivered" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`} >
              {order.status.replaceAll('_', ' ')}
            </div>
          </div>
        </div>

        {/* Restaurant + Address */}
        <div className="grid md:grid-cols-2 gap-5">

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-lg mb-3">
              Restaurant
            </h2>

            <p className="font-medium">
              {order.restaurantName}
            </p>

            <p className="text-gray-500 text-sm mt-2">
              Payment Method: {order.paymentMethod}
            </p>

            <p className="text-gray-500 text-sm">
              Payment Status: {order.paymentStatus}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-lg mb-3">
              Delivery Address
            </h2>

            <p className="text-sm text-gray-700">
              {order.deliveryAddress?.formattedAddress}
            </p>

            <p className="text-sm text-gray-500 mt-2">
              📞 {order.deliveryAddress?.mobile}
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-bold text-lg mb-4">
            Order Items
          </h2>

          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item._id}
                className="flex justify-between items-center border-b pb-3"
              >
                <div>
                  <p className="font-medium">
                    {item.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    Qty: {item.quantity}
                  </p>
                </div>

                <div className="font-semibold">
                  ₹{item.price * item.quantity}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6">

          <h2 className="font-bold text-lg mb-4">
            Bill Details
          </h2>

          <div className="space-y-3 text-sm">

            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{order.subTotal}</span>
            </div>

            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>₹{order.deliveryFee}</span>
            </div>

            <div className="flex justify-between">
              <span>Platform Fee</span>
              <span>₹{order.platformFee}</span>
            </div>

            <hr />

            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹{order.totalPrice}</span>
            </div>

          </div>
        </div>

      {(order.status === 'rider_assigned' || order.status === 'picked_up') && (
        <DeliveryMap
          order={order}
          role="customer"
          riderLocation={riderLocation}
        />
      )}
      </div>

    </div>
  )
}

export default OrderDetails
