import axios from 'axios';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { BiUpload } from 'react-icons/bi';
import { restaurantService } from '../../../config/services';

const AddItems = ({ onItemAdded }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);


  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setImage(null);
  };

  const handleSubmit = async () => {

    if (!name || !description || !price || !image) return toast.error('Please fill all the fields');

    const formData = new FormData();

    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('file', image);



    try {
      setLoading(true);
      const res = await axios.post(`${restaurantService}/api/menu/add-items`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          }
        });
      toast.success('Item added successfully');
      resetForm();
      onItemAdded();
    } catch (error) {
      console.log(error);
      toast.error('Failed to add item\'s');
    } finally {
      setLoading(false);
    }

  };
  return (
    <div className='max-w-xl mx-auto space-y-4'>
      <h2 className='text-lg font-semibold'>Add Item's</h2>
      <input
        type="text"
        placeholder='Item Name'
        value={name}
        onChange={(e) => setName(e.target.value)}
        className='w-full px-3 py-2 border text-sm border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500'
      />
      <input
        type="text"
        placeholder='Item Description'
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className='w-full px-3 py-2 border text-sm border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500'
      />
      <input
        type="tel"
        inputMode="numeric"
        placeholder='Item Price'
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className='w-full px-3 py-2 border text-sm border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500'
      />
      <label
        htmlFor="image-input"
        className="flex cursor-pointer items-center gap-3 border-gray-300 rounded-lg border p-4 text-sm text-gray-700 hover:border-gray-400 hover:bg-gray-50">
        <BiUpload className="w-5 h-5 text-red-500" />
        {image ? image.name : 'Upload Item Image'}
        <input
          id="image-input"
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
          hidden
        />
      </label>
      <button
        disabled={loading}
        onClick={handleSubmit}
        className={`w-full whitespace-nowrap border rounded-md text-md font-medium capitalize transition-all px-5 py-3
         ${loading
            ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed opacity-75'
            : 'border-red-600 bg-red-100 text-red-700 hover:border-red-700 hover:bg-red-200 cursor-pointer'
          }`}
      >
        {loading ? 'Adding...' : 'Add Item'}
      </button>
    </div>
  )
}

export default AddItems;
