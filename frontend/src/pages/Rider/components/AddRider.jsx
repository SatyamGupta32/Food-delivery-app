import axios from 'axios';
import React, { useState } from 'react'
import { useAppData } from '../../../context/appContext';
import { BiLoader, BiUpload } from 'react-icons/bi';
import { riderService } from '../../../config/services';
import toast from 'react-hot-toast';

const AddRider = ({ onCreated }) => {

    const [picture, setPicture] = useState(null);
    const [phone, setPhone] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [adhaar, setAdhaar] = useState('');
    const [drivingLicense, setDrivingLicense] = useState('');

    const { location, fetchUser } = useAppData();


    const handleSubmit = async () => {
        if (!phone || !location?.latitude || !location?.longitude || !picture || !adhaar || !drivingLicense)
            return toast.error('All Field are required');

        try {
            const formData = new FormData();
            formData.append('phone', phone.replace(/\s/g, ''));
            formData.append('adhaar', adhaar.replace(/\s/g, ''));
            formData.append('drivingLicense', drivingLicense.replace(/\s/g, ''));
            formData.append('latitude', location.latitude);
            formData.append('longitude', location.longitude);
            formData.append('file', picture);

            setSubmitting(true);
            const { data } = await axios.post(`${riderService}/api/rider/create-profile`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            toast.success(data.message || 'Rider profile Created Successfully');
            if (data.token) {
                localStorage.setItem('token', data.token);
                await fetchUser();
            }
            await onCreated?.();
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to create profile');
            console.log(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-6">
            <div className="max-w-lg mx-auto bg-white rounded-xl shadow-sm space-y-5 p-6">
                <h1 className="text-xl font-bold">Add your Profile</h1>
                <input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={11} // 10 digit + 1 space
                    placeholder="98765 43210"
                    className="w-full px-3 py-2 border text-sm border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={phone}
                    onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 10);

                        const formatted = digits
                            .replace(/(\d{5})(\d+)/, '$1 $2');

                        setPhone(formatted);
                    }}
                />

                <input
                    type="text"
                    inputMode="numeric"
                    maxLength={14}
                    placeholder="1234 5678 9012"
                    className="w-full px-3 py-2 border text-sm border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={adhaar}
                    onChange={(e) => {
                        const value = e.target.value
                            .replace(/\D/g, '')
                            .slice(0, 12);

                        const formatted = value.replace(
                            /(\d{4})(\d{0,4})(\d{0,4})/,
                            (_, a, b, c) => [a, b, c].filter(Boolean).join(' ')
                        );

                        setAdhaar(formatted);
                    }}
                />

                <input
                    type="text"
                    maxLength={16}
                    placeholder="UP14 20230012345"
                    className="w-full px-3 py-2 border text-sm border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={drivingLicense}
                    onChange={(e) => {
                        let value = e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9]/g, '');

                        if (value.length > 4) {
                            value = value.slice(0, 4) + ' ' + value.slice(4);
                        }

                        setDrivingLicense(value);
                    }}
                />

                <label
                    htmlFor="image-input"
                    className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 text-sm text-gray-700 hover:border-gray-400 hover:bg-gray-50">
                    <BiUpload className="w-5 h-5 text-red-500" />
                    {picture ? picture.name : 'Upload Profile Image'}
                    <input
                        id="image-input"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPicture(e.target.files?.[0] || null)}
                        hidden
                    />
                </label>

                <button
                    id="submit-button"
                    className={`w-full flex items-center justify-center whitespace-nowrap border rounded-md text-md font-light capitalize transition-all px-5 py-3 cursor-pointer hover:border-gray-600 hover:bg-gray-100 ${submitting ? 'border-gray-300 bg-white text-gray-700 opacity-75 cursor-not-allowed' : 'border-red-600 bg-red-100 hover:border-red-600 hover:bg-red-100 cursor-pointer'} `}
                    onClick={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? <BiLoader className="w-5 h-5 text-gray-500 animate-spin" /> : 'Create Rider Profile'}
                </button>
            </div>
        </div>
    );
}

export default AddRider
