import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const Login = () => {
  const navigate = useNavigate();

  const { backendURL, setIsLoggedIn,getUserData} = useContext(AppContext)
  const [state, setState] = useState('Sign Up')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')  
  const [password, setPassword] = useState('')

  const onSubmitHandler = async (e) => {
    console.log('backendURL:', backendURL);
    e.preventDefault();
    try {
      axios.defaults.withCredentials = true;
      if(state === 'Sign Up') {

        const { data } = await axios.post(backendURL + '/api/auth/register', { name, email, password })
        if(data.success){

          setIsLoggedIn(true);
          getUserData();
          navigate('/');
        }
        else{
          toast.error(data.message)
        }
      }
      else{
        const { data } = await axios.post(backendURL + '/api/auth/login', { email, password })
        if(data.success){
          setIsLoggedIn(true);
           getUserData();
          navigate('/');
        }
        else{
          toast.error(data.message)
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400'>
      <img onClick={()=>navigate('/')} src={assets.logo} alt="" className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'/>
      <div className='bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm'>
        <h2 className='text-3xl font-semibold text-white flex items-center text-center justify-center mb-3'>{state === 'Sign Up'?'Create Account':'Login'}</h2>
        <p className='text-center text-sm mb-6 '>{state === 'Sign Up'?'Create your account':'Login to your account'}</p>
        <form onSubmit={onSubmitHandler}>
          {state === 'Sign Up' && (
            <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C] '>
              <img src={assets.person_icon} alt="" />
              <input onChange={e=>setName(e.target.value)} value={name} className='bg-transparent outline-none' type="text" placeholder='Full name' required />
            </div>
          )}
          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C] '>
            <img src={assets.mail_icon} alt="" />
            <input onChange={e=>setEmail(e.target.value)} value={email} className='bg-transparent outline-none' type="email" placeholder='Email ID' required />
          </div>
          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C] '>
            <img src={assets.lock_icon} alt="" />
            <input onChange={e=>setPassword(e.target.value)} value={password} className='bg-transparent outline-none' type="password" placeholder='Password' required />
          </div>
          <p onClick={()=>navigate('/reset-password')} className='text-center mb-4 text-indigo-500 cursor-pointer'>Forget Password?</p>
          <button className='w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-full transition duration-300'>
            {state === 'Sign Up'?'Create Account':'Login'}
          </button>
        </form>
        {state === 'Sign Up' ? (
          <p className='text-gray-400 text-center text-xs mt-4'>
            Already have an account?  
            <span onClick={()=>setState('Login')} className='text-blue-400 cursor-pointer'>  Login here</span>
          </p>
        ) : (
          <p className='text-gray-400 text-center text-xs mt-4'>
            Don't have an account?  
            <span onClick={()=>setState('Sign Up')} className='text-blue-400 cursor-pointer'>Sign up</span>
          </p>
        )}
      </div>
    </div>
  )
}

export default Login