import React, { useContext, useRef, useState } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext.jsx'
import axios from 'axios'
import { toast } from 'react-toastify'

const EmailVerify = () => {
  const navigate = useNavigate();
  const { backendURL, setUserData, setIsLoggedIn } = useContext(AppContext);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(
        backendURL + '/api/auth/verify-account',
        { otp },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success('Email verified successfully!');
        setUserData(data.userData); // assuming backend returns updated user
        setIsLoggedIn(true);
        isAccountVerified(true); // assuming you have a function to set account verified status
        navigate('/');
      } else {
        toast.error(data.message || 'Invalid OTP');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    }
    setLoading(false);
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen  bg-gradient-to-br from-blue-200 to-purple-400'>
      <img onClick={()=>navigate('/')} src={assets.logo} alt="" className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'/>
      <form onSubmit={handleVerify} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
        <h1 className='text-indigo-300 text-xl text-center text-white mb-6'>Email Verify OTP</h1>
        <p className='text-indigo-300 text-sm text-center mb-6'>Enter the OTP sent to your email</p>
        <input
          type="text"
          placeholder='Enter the OTP'
          value={otp}
          onChange={e => setOtp(e.target.value)}
          className='w-full px-4 py-2 mb-6 rounded-full bg-[#333A5C] text-indigo-200 placeholder-indigo-400 outline-none focus:ring-2 focus:ring-indigo-400 transition'
          required
        />
        <button
          type="submit"
          className='w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 rounded-lg'
          disabled={loading}
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>
    </div>
  )
}

export default EmailVerify