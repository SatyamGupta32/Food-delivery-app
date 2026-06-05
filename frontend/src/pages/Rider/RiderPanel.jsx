import axios from 'axios';
import { useEffect, useState } from 'react';
import { useAppData } from '../../context/appContext';
import RiderProfile from './components/RiderProfile';
import Loading from "../core/Loading";
import RiderOrders from './components/RiderOrders';
import toast from 'react-hot-toast';
import { riderService } from '../../config/services';
import AddRider from './components/AddRider';
import RiderIncome from './components/RiderIncome';

const RiderPanel = () => {

  const { user } = useAppData();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [hasActiveOrder, setHasActiveOrder] = useState(false);

  // fetch profile
  const fetchProfile = async () => {
    try {

      const { data } = await axios.get(
        `${riderService}/api/rider/myprofile`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setProfile(data.account || null);

    } catch (error) {

      if (error?.response?.status === 404) {
        setProfile(null);
        return;
      }

      console.log(error);

      toast.error(
        error?.response?.data?.message ||
        'Failed to fetch profile'
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  // heartbeat — online waiting for orders OR busy on active delivery
  useEffect(() => {
    const shouldHeartbeat = profile?.isAvailable || hasActiveOrder;
    if (!shouldHeartbeat) return;

    const sendHeartbeat = async () => {
      try {
        const { data } = await axios.patch(
          `${riderService}/api/rider/heartbeat`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        if (data.success && data.lastActiveAt) {
          setProfile((prev) =>
            prev ? { ...prev, lastActiveAt: data.lastActiveAt } : prev
          );
        }
      } catch (error) {
        console.log(error);
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 15000);

    return () => clearInterval(interval);
  }, [profile?.isAvailable, hasActiveOrder]);

  if (loading) return <Loading />;

  if (!profile) {
    return <AddRider onCreated={fetchProfile} />;
  }

  return (
    <div className='min-h-screen bg-gray-50 p-4 pb-20 lg:p-6 space-y-6'>
      <RiderProfile
        profile={profile}
        setProfile={setProfile}
        fetchProfile={fetchProfile}
        hasActiveOrder={hasActiveOrder}
      />
      <RiderIncome />
      <RiderOrders
        fetchProfile={fetchProfile}
        profile={profile}
        setActiveOrder={setActiveOrder}
        onActiveOrderChange={setHasActiveOrder}
      />
    </div>
  )
}

export default RiderPanel;
