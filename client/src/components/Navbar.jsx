
  import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets.js'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext.jsx'
import axios from 'axios'
import { toast } from 'react-toastify'

const Navbar = () => {
  const navigate = useNavigate();
  const { userData, backendURL, setUserData, setIsLoggedIn } = useContext(AppContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
    const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendURL + '/api/auth/send-verify-otp');
      if (data.success) {
        
        navigate('/email-verify');
        toast.success('Verification email sent successfully. Please check your inbox.');
        } else {
        toast.error(data.message);
      }
    }
    catch (error) {
      console.error('Error sending verification email:', error);
      toast.error('Failed to send verification email. Please try again later.');
  }
}
  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendURL + '/api/auth/logout');
      if (data.success) {
        setUserData(null);
        setIsLoggedIn(false);
        navigate('/');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  return (
    <nav className="flex items-center px-6 py-3 bg-white shadow">
      <img src={assets.logo} alt="Logo" className="h-10 mr-auto" />
      {userData ? (
        <div className="relative">
          <div
            className="w-8 h-8 flex justify-center items-center rounded-full bg-black text-white cursor-pointer"
            onClick={() => setDropdownOpen((open) => !open)}
            tabIndex={0}
          >
            {userData.name && userData.name[0].toUpperCase()}
          </div>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-gray-100 rounded shadow-lg z-10">
              <ul className="py-2 text-sm text-black">
                {userData.isAccountVerified === false && (
                  <li onClick={sendVerificationOtp} className="py-1 px-4 hover:bg-gray-200 cursor-pointer">Verify Email</li>
                )}
                <li
                  onClick={() => {
                    logout();
                    setDropdownOpen(false);
                  }}
                  className="py-1 px-4 hover:bg-gray-200 cursor-pointer"
                >
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => navigate('/login')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition duration-200"
        >
          Login
        </button>
      )}
    </nav>
  )
}
export default Navbar