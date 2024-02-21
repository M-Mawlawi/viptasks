import React from "react";
import authService from "../../services/auth";
import { useForm } from "react-hook-form";
import HttpError from "../../httpError";
import { useNavigate, useLocation } from "react-router-dom"; // Import Navigate
import { useLocalStorage } from "usehooks-ts";
import { backendURL } from '../../../config';
import apiService from "../../services/api";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, saveisAuthenticated] = useLocalStorage("token", null);
  const [userData, setUserData] = useLocalStorage("userData", null);

  const handleLogin = async (data) => {
    const login = await authService.login(data);
    if (!(login instanceof HttpError)) {
      // Retrieve the "next" parameter from the URL
      const queryParams = new URLSearchParams(location.search);
      const nextUrl = queryParams.get("next");
      saveisAuthenticated(login.token);
      setUserData(login.data);
      // Redirect the user to the "next" URL (or a default route if "next" is not available)
      
      navigate(nextUrl || "/");
    }
  };
  return (<div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
  <div className="sm:mx-auto sm:w-full sm:max-w-sm">
    <img className="mx-auto h-36 w-auto" src={`${backendURL}/static/img/logo.png`} alt="Vip Taskers"/>
    <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Sign in to your account</h2>
  </div>
  
  <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
    <form className="space-y-6" onSubmit={handleSubmit(handleLogin)}>
      <div>
        <label for="username" className="block text-sm font-medium leading-6 text-gray-900">username</label>
        <div className="mt-2">
          <input id="username" name="username" type="username" autocomplete="username" required {...register("username", { required: true })} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
        </div>
      </div>
  
      <div>
        <div className="flex items-center justify-between">
          <label for="password" className="block text-sm font-medium leading-6 text-gray-900">Password</label>
          <div className="text-sm">
            <a href="/reset-password" className="font-semibold text-logo-blue hover:text-indigo-500">Forgot password?</a>
          </div>
        </div>
        <div className="mt-2">
          <input id="password" name="password" type="password" required {...register("password", { required: true })} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
        </div>
      </div>
  
      <div>
        <button type="submit" className="flex w-full justify-center rounded-md bg-logo-blue px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" onSubmit={handleSubmit(handleLogin)}>Sign in</button>
      </div>
    </form>
  
    <p className="mt-10 text-center text-sm text-gray-500">
      Not a member?
      <a href="/signup" className="font-semibold leading-6 text-logo-blue hover:text-indigo-500"> Signup</a>
    </p>
  </div>
  </div>
  );
};

export default Login;
