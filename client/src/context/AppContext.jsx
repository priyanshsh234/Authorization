
import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";



export const AppContext = createContext();

export const AppContextProvider = (props) => {
    axios.defaults.withCredentials = true;
    useEffect(() => {
        getAuthState();
    }, []);
    const backendURL = import.meta.env.VITE_BACKEND_URL;
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(false);

    const getAuthState = async () => {
        try{
            const {data} = await axios.get(backendURL + '/api/auth/is-auth');
            if(data.success){
                setIsLoggedIn(true);
                getUserData();
            } }
            catch (error) {
                
                toast.error(error.response?.data?.message || error.message);
            }
        }

    

    const getUserData = async () => {
        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.get(backendURL + '/api/user/data',{ withCredentials: true });
            data.success ? setUserData(data.userData) : toast.error(data.message);

        } catch (error) {
           toast.error(data.message);
             
        }}

    const value = {
        backendURL, isLoggedIn,
        setIsLoggedIn,
        userData, setUserData,getUserData
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
}