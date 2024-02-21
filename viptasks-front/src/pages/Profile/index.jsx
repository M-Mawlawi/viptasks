import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { backendURL } from "../../../config";
import Header from "../../components/Header";
import apiService from "../../services/api";
import Address from "../../components/Address";
import { useLocalStorage } from "usehooks-ts";
import ImageEditorOverlay from "../../components/UploadImage";

const Profile = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const [userData, setUserData] = useLocalStorage("userData", null);
  const [editData, setEditData] = useState(false);
  const [countryCodes, setCountryCodes] = useState([]);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleEdit = async () => {
    try {
      const getCountryCodes = await apiService.getCountryCodes();
      setCountryCodes(getCountryCodes);
    } catch (error) {
      console.error("Error fetching country data:", error);
    }
    setEditData(true);
  };

  const onSubmit = async (data) => {
    try {
      const userUpdate = await apiService.updateUserProfile(data);
      setEditData(false);
      setUserData(userUpdate.userData);
      reset();
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  const handleImageUpload = () => {
    document.getElementById("fileInput").click();
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result);
        setShowImageEditor(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSave = async (editedImage) => {
    try {
      const profilePhoto = await apiService.updateProfilePhoto(editedImage);
      userData["profile_photo"] = profilePhoto.profile_photo;
      setUserData(userData);
      setShowImageEditor(false);
    } catch (error) {
      console.error("Error updating profile photo:", error);
    }
  };
  return (
    <>
      <Header />
      <div className="container mx-auto sm:mt-10 p-5">
        <div className="bg-slate-200 shadow-md rounded-lg px-8 py-6">
          <div className="text-center sm:mt-10">
            <img
              src={backendURL + userData.profile_photo}
              alt="Profile Picture"
              className="w-24 h-24 mx-auto rounded-full"
            />
            <button onClick={handleImageUpload}>Change Image</button>
            <input
              type="file"
              id="fileInput"
              accept="image/*"
              onChange={handleFileInputChange}
              style={{ display: "none" }}
            />

            {showImageEditor && (
              <ImageEditorOverlay
                image={selectedImage}
                onClose={() => setShowImageEditor(false)}
                onSave={handleImageSave}
              />
            )}
            <h2 className="mt-4 text-xl font-semibold">
              {userData.first_name} {userData.last_name}
            </h2>
            <p className="text-gray-600">@{userData.username}</p>
            <div className="flex items-center justify-center mt-2">
              <svg
                className="w-4 h-4 text-yellow-300 mr-1"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 22 20"
              >
                <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
              </svg>
              <p className="ml-2 text-sm font-bold text-gray-900">4.95</p>
              <span className="w-1 h-1 mx-1.5 bg-gray-500 rounded-full dark:bg-gray-400" />
              <a
                href="#"
                className="text-sm font-medium text-gray-900 underline hover:no-underline"
              >
                73 reviews
              </a>
            </div>
          </div>
          <div className="flex justify-between flex-col sm:flex-row">
            <div>
              <div className="mt-6">
                <h3 className="text-2xl font-semibold">User Information</h3>
                {editData ? (
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="grid sm:grid-cols-[min-content,auto] gap-2 sm:w-92 sm:mt-4 text-xl sm:text-lg"
                  >
                    {/* Firstname */}
                    <label
                      htmlFor="firstname"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Firstname:
                    </label>
                    <input
                      {...register("first_name")}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      type="text"
                      id="firstname"
                      placeholder={userData.first_name}
                    />
                    {/* Lastname */}
                    <label
                      htmlFor="lastname"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Lastname:
                    </label>
                    <input
                      {...register("last_name")}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      type="text"
                      id="lastname"
                      placeholder={userData.last_name}
                    />
                    {/* Email */}
                    <label
                      htmlFor="email"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Email:
                    </label>
                    <input
                      {...register("email")}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      type="text"
                      id="email"
                      placeholder={userData.email}
                    />
                    {/* Profession */}
                    <label
                      htmlFor="profession"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Profession:
                    </label>
                    <input
                      {...register("profession")}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      type="text"
                      id="profession"
                      placeholder={userData.profession}
                    />
                    {/* Phone */}
                    <label
                      htmlFor="phone"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Phone:
                    </label>
                    <select
                      {...register("phone_country_code")}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      name="phone_country_code"
                      id="phone-country-code"
                    >
                      <option value="">----------</option>
                      {countryCodes.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <span></span>
                    <input
                      {...register("phone")}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder={userData.phone}
                      pattern="[0-9]{10}"
                    />
                    {/* Submit Button */}

                    <div className="mt-6 flex justify-around col-span-2">
                      <div className="mt-4">
                        <button
                          type="submit"
                          className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        >
                          Submit
                        </button>
                      </div>
                      <div className="mt-4">
                        <button
                          type="cancel"
                          className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                          onClick={() => {
                            setEditData(false);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="mt-4 grid justify-start gap-y-2">
                    <p className="text-gray-600">Email: {userData.email}</p>
                    <p className="text-gray-600">
                      Profession: {userData.profession}
                    </p>
                    <p className="text-gray-600">
                      Phone: +{userData.phone_country_code} {userData.phone}
                    </p>
                  </div>
                )}
              </div>
              {editData ? null : (
                <div className="mt-6">
                  <div className="mt-4">
                    <button
                      onClick={handleEdit}
                      className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
            <Address />
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
