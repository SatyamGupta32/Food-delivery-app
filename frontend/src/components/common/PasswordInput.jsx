import { BiHide, BiShow } from 'react-icons/bi';

const PasswordInput = ({
  value,
  onChange,
  autoComplete,
  placeholder,
  showPassword,
  onToggle,
}) => {
  return (
    <div className='relative'>
      <input
        type={showPassword ? 'text' : 'password'}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        className='w-full rounded-md border border-gray-300 px-3 py-2 pr-11 outline-none focus:border-red-600'
        placeholder={placeholder}
      />
      <button
        type="button"
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        title={showPassword ? 'Hide password' : 'Show password'}
        onClick={onToggle}
        className='absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-500 hover:text-red-600'
      >
        {showPassword ? <BiHide className='h-5 w-5' /> : <BiShow className='h-5 w-5' />}
      </button>
    </div>
  );
};

export default PasswordInput;
