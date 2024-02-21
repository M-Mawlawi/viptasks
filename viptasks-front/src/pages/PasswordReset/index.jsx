import React, { useState, useEffect, useRef , CSSProperties } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import authService from "../../services/auth";
import { Accept, Reject } from "../../components/AcceptReject";
import ClipLoader from "react-spinners/ClipLoader";


const PasswordReset = () => {
  const { uid, token } = useParams();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [color, setColor] = useState("#0d66ec");
  const handleFormSubmit = async (data) => {
    if (data.email) {
      // Handle password reset request here
      try {
        setLoading(true); // Start loading
        const passReset = await authService.resetPassword(data.email);
        setResetSuccess(true);
      } catch (error) {
        // Handle error, e.g., display an error message
        console.error(error);
      } finally {
        setLoading(false); // Stop loading
      }
    } else if (data["new-password"]) {
      // Handle password reset confirmation here
      try {
        setLoading(true); // Start loading
        const passConfirm = await authService.passwordResetConfirm(
          data["new-password"],
          uid,
          token
        );
        setResetSuccess(true);
      } catch (error) {
        // Handle error, e.g., display an error message
        console.error(error);
      } finally {
        setLoading(false); // Stop loading
      }
    }
    setFormSubmitted(true);
  };
  return (
    <div>
      {loading ? (
        <div>
          <ClipLoader
            color={color}
            loading={loading}
            size={150}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      ) : formSubmitted && resetSuccess ? (
        <Accept /> // Render the Accept component if the form was successfully submitted
      ) : formSubmitted && !resetSuccess ? (
        <Reject /> // Render the Reject component if there was an error
      ) : (
        // Render the form if it hasn't been submitted yet
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          {!uid || !token ? (
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                email :
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  {...register("email", { required: true })}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
          ) : (
            <div>
              <label
                htmlFor="new-password"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                new-password :
              </label>
              <div className="mt-2">
                <input
                  id="new-password"
                  name="new-password"
                  type="password"
                  required
                  {...register("new-password", { required: true })}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
          )}
          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-logo-blue px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onSubmit={handleSubmit(handleFormSubmit)}
            >
              Submit
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PasswordReset;
