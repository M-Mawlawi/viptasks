import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HttpError from "../httpError";
import api from "../axios/conf";
import ChatRoom from '../pages/Chat';


const login = async({ username, password }) => {
    try {
        const response = await api.post(
            "/api-token-auth/", {
                username,
                password,
            }
        );
        // localStorage.setItem("token", response.data.token);
        return response.data;
    } catch (error) {
        console.log(error);
        return new HttpError(error);
    }
};

const logout = async() => {
    try {
        const response = await api.post(
            "/logout/"
        );
        // localStorage.removeItem('token');
        return response.data;
    } catch (error) {
        console.log(error);
        return new HttpError(error);
    }
};

const isAuthenticated = () => {
    // Check if a token is present in localStorage or any other authentication mechanism
    const token = localStorage.getItem('token'); // Assuming you store the token in localStorage
    return !!token; // Convert token presence to a boolean value
};

const resetPassword = async(email) => {
    try {
        const response = await api.post(
            "/password-reset/", {
                email
            }
        );
        return response.data;
    } catch (error) {
        console.log(error);
        return new HttpError(error);
    }
}

const signup = async(data) => {
    try {
        const response = await api.post(
            "/register/", data
        );
        // localStorage.setItem("token", response.data.token);
        return response.data.token;
    } catch (error) {
        console.log(error);
        return new HttpError(error);
    }
}

const passwordResetConfirm = async(newPassword, uid, token) => {
    try {
        const response = await api.post(
            `/password-reset-confirm/${uid}/${token}/`, {
                'new-password': newPassword,
            }
        );
        return response.data;
    } catch (error) {
        console.log(error);
        return new HttpError(error);
    }
}

const authService = { login, isAuthenticated, logout, resetPassword, passwordResetConfirm, signup };

export default authService;