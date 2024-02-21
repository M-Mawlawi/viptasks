import React from 'react'
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useLocalStorage } from "usehooks-ts";
import authService from '../../services/auth';

function Logout() {
    const [isAuthenticated, saveisAuthenticated] = useLocalStorage("token", null);
    const [userData, setUserData] = useLocalStorage("userData", null);
    const navigate = useNavigate();
    const handleLogout = async()=>{
        await authService.logout();
        saveisAuthenticated(null);
        setUserData(null);
        navigate("/");
    }
    useEffect(() => {handleLogout();}, []);
    
  return (
    <div>Logging you out</div>
  )
}

export default Logout