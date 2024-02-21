import React, { useState, useEffect, useRef } from "react";
import authService from "../../services/auth";
import { useForm } from "react-hook-form";
import HttpError from "../../httpError";
import { useNavigate, useLocation } from "react-router-dom"; // Import Navigate
import { useLocalStorage } from "usehooks-ts";
import './signup-style.css';
import { backendURL } from '../../../config';


const Signup = () => {
    const [step, setStep] = useState(1);
    const {
        register,
        handleSubmit,
        formState: { errors },
      } = useForm();
      const location = useLocation();
    const navigate = useNavigate();
    const [isAuthenticated, saveisAuthenticated] = useLocalStorage("token", null);
    const handleSignup = async (data) => {
        const signup = await authService.signup(data);
        if (!(signup instanceof HttpError)) {
        const queryParams = new URLSearchParams(location.search);
        const nextUrl = queryParams.get("next");
        saveisAuthenticated(signup);
        navigate(nextUrl || "/");
        }
    };
    const handleNextClick = (data) => {
      if (step === 1) {
            console.log(data);
            setStep(2);
      }
    };
return(
        <div>
            <div className="sm:mx-auto sm:w-full sm:max-w-sm mb-5">
    <img className="mx-auto h-36 w-auto" src={`${backendURL}/static/img/logo.png`} alt="Vip Taskers"/>
    <h2 className="mt-5 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Signup</h2>
  </div>
        <form className="w-screen flex justify-between" onSubmit={handleSubmit(handleSignup)}>
        {step === 1 ? (
      <div
        id="userType"
        className="grid grid-cols-2 gap-2 w-full mx-auto px-2 sm:w-1/2"
      > 
                <div>
                    <input className="hidden" type="radio" id="tasker" value="tasker" name="userType" required {...register("userType", { required: true })} />
                    <label htmlFor="tasker" className="flex items-center flex-col p-4 border-2 border-gray-400 cursor-pointer">
                        <img src={`${backendURL}/static/img/tasker.png`} alt="Tasker" />
                        Tasker
                    </label>
                </div>
                <div>
                    <input className="hidden" type="radio" id="customer" value="customer" name="userType" {...register("userType", { required: true })}/>
                    <label htmlFor="customer" className="flex items-center flex-col p-4 border-2 border-gray-400 cursor-pointer">
                        <img src={`${backendURL}/static/img/customer.png`} alt="Customer" />
                        Customer
                    </label>
                </div>
                <button
          className="col-span-2 mt-4 px-3 py-1.5 bg-logo-blue text-white rounded hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          type="button"
          onClick={handleSubmit(handleNextClick)}
        >
          Next
        </button>
      </div>
      ):(
    <div
        id="userInfo"
        className="mx-auto w-full sm:w-1/2 px-2"
    > 
        <div>
        <label for="username" className="block text-sm font-medium leading-6 text-gray-900">Username</label>
        <div className="mt-2">
          <input id="username" name="username" type="text" autocomplete="username" required {...register("username", { required: true })} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
        </div>
      </div>
      <div className="flex justify-between">
        <div className="w-5.88/12">
            <label for="firstname" className="block text-sm font-medium leading-6 text-gray-900">Firstname</label>
            <div className="mt-2">
            <input id="firstname" name="firstname" type="text" autocomplete="firstname" required {...register("first_name", { required: true })} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
            </div>
        </div>
        <div className="w-5.88/12">
        <label for="lastname" className="block text-sm font-medium leading-6 text-gray-900">Lastname</label>
            <div className="mt-2">
            <input id="lastname" name="lastname" type="text" autocomplete="lastname" required {...register("last_name", { required: true })} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
            </div>
        </div>
      </div>
      <div>
        <label for="email" className="block text-sm font-medium leading-6 text-gray-900">Email</label>
        <div className="mt-2">
          <input id="email" name="email" type="email" autocomplete="email" required {...register("email", { required: true })} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
        </div>
      </div>
      <div>
        <div>
            <label for="password" className="block text-sm font-medium leading-6 text-gray-900">Password</label>
            <div className="mt-2">
            <input id="password" name="password" type="password" required {...register("password", { required: true })} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
            </div>
        </div>
        <div>
            <label for="password" className="block text-sm font-medium leading-6 text-gray-900">Confirm Password</label>
            <div className="mt-2">
            <input id="password_confirmation" name="password_confirmation" type="password" required {...register("password_confirmation", { required: true })} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
            </div>
        </div>
    </div>
      <div className="mt-2">
        <button type="submit" className="flex w-full justify-center rounded-md bg-logo-blue px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" onSubmit={handleSubmit(handleSignup)}>Sign Up</button>
      </div>
      </div>
      )}
    </form>
    </div>
)
}
export default Signup;