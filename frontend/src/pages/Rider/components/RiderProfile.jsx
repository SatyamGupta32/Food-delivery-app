import axios from 'axios';
import { useAppData } from "../../../context/appContext";
import { useState, useEffect } from 'react';
import { riderService } from "../../../config/services";
import toast from "react-hot-toast"; 

const RiderProfile = ({ profile, setProfile, hasActiveOrder = false }) => {

  const deliveryBlocksOnline = hasActiveOrder && !profile?.isAvailable;

  const { fetchUser, user } = useAppData(); 
  const [toggling, setToggling] = useState(false);
  const [editing, setEditing] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [drivingLicense, setDrivingLicense] = useState('');

  // sync form values
  useEffect(() => {
    if (profile && user) {
      setName(user?.name || '');
      setPhone(profile?.phone || '');
      setDrivingLicense(profile?.drivingLicense || '');
    }
  }, [profile, user]);

  // toggle availability
  const toggleAvailability = async () => {

    if (!navigator.geolocation) {
      return toast.error('Geolocation not supported');
    }

    setToggling(true);

    navigator.geolocation.getCurrentPosition(

      async (pos) => {

        try {

          const { data } = await axios.patch(
            `${riderService}/api/rider/availability`,
            {
              isAvailable: !profile?.isAvailable,
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
              }
            }
          );

          setProfile(data.rider);

          toast.success(
            data.rider.isAvailable
              ? "You're online now"
              : "You're offline now"
          );

        } catch (error) {

          console.log(error);

          toast.error(
            error?.response?.data?.message ||
            'Something went wrong'
          );

        } finally {
          setToggling(false);
        }
      },

      () => {
        toast.error('Location access denied');
        setToggling(false);
      }

    );
  };

  // update profile
  const updateProfile = async () => {

    try {

      const { data } = await axios.patch(
        `${riderService}/api/rider/update-profile`,
        { name, phone, drivingLicense },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setProfile(data.rider);

      await fetchUser();

      setEditing(false);

      toast.success(data.message);

    } catch (error) {

      console.log(error);

      toast.error(
        error?.response?.data?.message ||
        'Update failed'
      );
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">

      {/* PROFILE CARD */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

        <div className="p-6 lg:p-8 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

          {/* LEFT */}
          <div className="flex flex-col items-center text-center lg:flex-row lg:text-left lg:gap-6">

            <div className="relative">

              <img
                src={profile.picture}
                alt="rider"
                className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-md"
              />

              <span
                className={`absolute bottom-2 right-2 h-5 w-5 rounded-full border-2 border-white ${profile.isAvailable
                  ? "bg-green-500"
                  : "bg-red-500"
                  }`}
              />

            </div>

            <div className="mt-5 lg:mt-0 space-y-3">

              <div>
                <h2 className="text-3xl font-bold text-gray-800">
                  {user?.name}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {user?.email}
                </p>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-2">

                <span
                  className={`px-4 py-1 rounded-full text-sm font-medium ${profile.isVerified
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                    }`}
                >
                  {profile.isVerified
                    ? "Verified Rider"
                    : "Verification Pending"}
                </span>

                <span
                  className={`px-4 py-1 rounded-full text-sm font-medium ${profile.isAvailable
                    ? "bg-green-100 text-green-700"
                    : deliveryBlocksOnline
                      ? "bg-gray-100 text-gray-600"
                      : "bg-red-100 text-red-700"
                    }`}
                >
                  {profile.isAvailable
                    ? "Currently Online"
                    : deliveryBlocksOnline
                      ? "On delivery"
                      : "Currently Offline"}
                </span>

              </div>

            </div>

          </div>

          {/* RIGHT */}
          <div className="w-full lg:w-[380px]">

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4">

              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  Rider ID
                </p>

                <p className="font-medium text-gray-700 break-all">
                  {profile._id}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Joined
                  </p>

                  <p className="text-sm font-medium text-gray-700">
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Last Active
                  </p>

                  <p className="text-sm font-medium text-gray-700">
                    {
                      profile.lastActiveAt
                        ? new Date(profile.lastActiveAt)
                          .toLocaleString(
                            'en-GB',
                            {
                              day: '2-digit',
                              month: '2-digit',
                              year: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })
                        : profile.isAvailable
                          ? 'Online'
                          : 'Offline'
                    }
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* DETAILS CARD */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">

          <div className="flex items-center justify-between mb-6">

            <h3 className="text-xl font-semibold text-gray-800">
              Rider Details
            </h3>

            <button
              onClick={() => setEditing(!editing)}
              className="px-4 py-2 rounded-xl border text-sm font-medium hover:bg-gray-100 transition"
            >
              {editing ? "Cancel" : "Edit Profile"}
            </button>

          </div>

          {
            editing ? (

              <div className="space-y-5">

                <div>
                  <label className="text-sm text-gray-500">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2 w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-500">
                    Phone Number
                  </label>

                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-2 w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-500">
                    Driving License
                  </label>

                  <input
                    type="text"
                    value={drivingLicense}
                    onChange={(e) => setDrivingLicense(e.target.value)}
                    className="mt-2 w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <button
                  onClick={updateProfile}
                  className="w-full bg-red-600 text-white rounded-xl py-3 hover:bg-red-700 transition"
                >
                  Save Changes
                </button>

              </div>

            ) : (

              <div className="space-y-4">

                <div className="rounded-2xl border border-gray-200 bg-linear-to-br from-white to-gray-50 p-5">

                  <p className="text-xs uppercase tracking-wider text-gray-400">
                    Phone Number
                  </p>

                  <div className="mt-3 flex items-center justify-between">

                    <h4 className="text-lg font-semibold text-gray-800">
                      {profile.phone}
                    </h4>

                    <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                      📞
                    </div>

                  </div>

                </div>

                <div className="rounded-2xl overflow-hidden bg-linear-to-r from-slate-900 to-slate-800 text-white p-5 shadow-md">

                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-300">
                        Driving License
                      </p>

                      <h4 className="mt-3 text-lg font-semibold tracking-wide">
                        {profile.drivingLicense}
                      </h4>
                    </div>

                    <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center text-xl">
                      🪪
                    </div>

                  </div>

                </div>

                <div className="rounded-2xl overflow-hidden border border-orange-200 bg-linear-to-r from-orange-50 to-white p-5">

                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-xs uppercase tracking-widest text-orange-400">
                        Aadhaar Number
                      </p>

                      <h4 className="mt-3 text-lg font-bold tracking-[3px] text-gray-800">
                        {profile.adhaar}
                      </h4>
                    </div>

                    <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center text-xl">
                      🇮🇳
                    </div>

                  </div>

                </div>

              </div>

            )
          }

        </div>

        {/* AVAILABILITY */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">

          <div>

            <h3 className="text-xl font-semibold text-gray-800">
              Availability Status
            </h3>

            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              {deliveryBlocksOnline
                ? 'Complete your active delivery before accepting new orders.'
                : 'Stay near restaurant hotspots before going online.'}
            </p>

            <div className="mt-6 rounded-2xl bg-gray-50 border p-5">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-gray-400">
                    Current Status
                  </p>

                  <h4
                    className={`text-2xl font-bold mt-1 ${profile.isAvailable
                      ? "text-green-600"
                      : deliveryBlocksOnline
                        ? "text-gray-500"
                        : "text-red-600"
                      }`}
                  >
                    {profile.isAvailable
                      ? "ONLINE"
                      : deliveryBlocksOnline
                        ? "ON DELIVERY"
                        : "OFFLINE"}
                  </h4>
                </div>

                <div
                  className={`h-14 w-14 rounded-full flex items-center justify-center ${profile.isAvailable
                    ? "bg-green-100"
                    : deliveryBlocksOnline
                      ? "bg-gray-100"
                      : "bg-red-100"
                    }`}
                >
                  <div
                    className={`h-5 w-5 rounded-full ${profile.isAvailable
                      ? "bg-green-500"
                      : deliveryBlocksOnline
                        ? "bg-gray-400"
                        : "bg-red-500"
                      }`}
                  />
                </div>

              </div>

            </div>

          </div>

          <button
            onClick={toggleAvailability}
            disabled={toggling || deliveryBlocksOnline}
            className={`mt-6 w-full rounded-2xl py-4 font-medium transition ${deliveryBlocksOnline
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : profile.isAvailable
                ? "bg-gray-800 hover:bg-black text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
              }`}
          >
            {
              toggling
                ? "Please wait..."
                : deliveryBlocksOnline
                  ? "Finish delivery to go online"
                  : profile.isAvailable
                    ? "Go Offline"
                    : "Go Online"
            }
          </button>

          {deliveryBlocksOnline && (
            <p className="text-xs text-center text-gray-400 mt-2">
              Mark delivered below, then go online for new orders
            </p>
          )}

        </div>

      </div>

    </div>
  );
};

export default RiderProfile;