import { toast } from "react-hot-toast";
import { useAppData } from "../../../context/appContext";
import { useState } from "react";
import axios from "axios";
import { restaurantService } from "../../../config/services";
import { BiLoader, BiMapPin, BiUpload } from "react-icons/bi";

const AddRestaurant = ({ onCreated }) => {

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [phone, setPhone] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const { loadingLocation, location, fetchUser } = useAppData();

    const handleSubmit = async () => {
        if (!name || !location || !image) return toast.error('All Field are required');

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('latitude', location.latitude);
            formData.append('longitude', location.longitude);
            formData.append('formattedAddress', location.formattedAddress);
            formData.append('file', image);
            formData.append('phone', phone);

            setSubmitting(true);
            const { data } = await axios.post(`${restaurantService}/api/restaurant/add-restaurant`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            toast.success(data.message || 'Restaurant Created Successfully');
            if (data.token) {
                localStorage.setItem('token', data.token);
                await fetchUser();
            }
            await onCreated?.();
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to create restaurant');
            console.log(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-6 pt-14">
            <div className="max-w-lg mx-auto bg-white rounded-xl shadow-sm space-y-5 p-6">
                <h1 className="text-xl font-bold">Add Restaurant</h1>
                <input
                    id="name"
                    type="text"
                    placeholder="Restaurant Name"
                    className="w-full px-3 py-2 border text-sm border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <input
                    id="phone"
                    type="tel"
                    placeholder="Restaurant Phone"
                    className="w-full px-3 py-2 border text-sm border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />

                <textarea
                    id="description"
                    type="text"
                    rows="7"
                    placeholder="Restaurant Description"
                    className="w-full px-3 py-2 border text-sm border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <label
                    htmlFor="image-input"
                    className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 text-sm text-gray-700 hover:border-gray-400 hover:bg-gray-50">
                    <BiUpload className="w-5 h-5 text-red-500" />
                    {image ? image.name : 'Upload Restaurant Image'}
                    <input
                        id="image-input"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files?.[0] || null)}
                        hidden
                    />
                </label>

                <div className="flex items-start gap-3 rounded-lg border p-4">
                    <BiMapPin className="mt-0.5 w-5 h-5 text-red-500" />
                    <div className='text-sm'>
                        {
                            loadingLocation ? <BiLoader className="w-5 h-5 text-gray-500 animate-spin" /> : (location?.formattedAddress || 'Location not found')
                        }
                    </div>
                </div>

                <button
                    id="submit-button"
                    className={`w-full flex items-center justify-center whitespace-nowrap border rounded-md text-md font-light capitalize transition-all px-5 py-3 cursor-pointer hover:border-gray-600 hover:bg-gray-100 ${submitting ? 'border-gray-300 bg-white text-gray-700 opacity-75 cursor-not-allowed' : 'border-red-600 bg-red-100 hover:border-red-600 hover:bg-red-100 cursor-pointer'} `}
                    onClick={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? <BiLoader className="w-5 h-5 text-gray-500 animate-spin" /> : 'Add Restaurant'}
                </button>
            </div>
        </div>
    );
};

export default AddRestaurant;
