import React, { useState, useEffect, useRef } from "react";
import apiService from "../../services/api";
import { SlOptionsVertical } from 'react-icons/sl';
import { FaSave, FaTimes } from "react-icons/fa";
import { GrAdd ,GrSubtract} from 'react-icons/gr';

const Address = () => {
  const [addressOptions, setAddressOptions] = useState({}); // Use an object for address options
  const [activeAddress, setActiveAddress] = useState(null); // Keep track of active address
  const [addressData, setAddressData] = useState([]);
  const [editingAddress, setEditingAddress] = useState(null); // Keep track of the address being edited
  const [editedAddressData, setEditedAddressData] = useState({}); // Keep track of edited address data
  const [isAddingAddress, setIsAddingAddress] = useState(false); // Track if the user is adding a new address
  const canAddAddress = addressData.length < 3;
  const [newAddressData, setNewAddressData] = useState({
    name: "",
    street: "",
    number: "",
    city: "",
    state: "",
    zip: "",
  });

  // Function to toggle the "Add Address" form
  const toggleAddAddress = () => {
    setIsAddingAddress((prevState) => !prevState);
  };

  // Function to handle changes in the new address input fields
  const handleNewAddressChange = (e, field) => {
    setNewAddressData({
      ...newAddressData,
      [field]: e.target.value,
    });
  };

  // Function to add a new address
  const addNewAddress = async () => {
    try {
      // Implement your logic to add the new address
      // You can use API calls to create a new address
      await apiService.createAddress(newAddressData);
      toggleAddAddress(); // Close the "Add Address" form
      getAddresses(); // Refresh the address list
    } catch (error) {
      console.error("Error Adding Address:", error);
    }
  };
  useEffect(() => {
    getAddresses();
    const closeAddressOptions = () => {
      setAddressOptions({});
      setActiveAddress(null);
    };

    document.addEventListener("click", closeAddressOptions);

    return () => {
      document.removeEventListener("click", closeAddressOptions);
    };
  }, []);

  const deleteAddress = async (aId) => {
    try {
      await apiService.deleteAddress(aId);
      getAddresses();
    } catch (error) {
      console.error("Error Deleting Address:", error);
    }
  };

  const getAddresses = async () => {
    try {
      const getAddresses = await apiService.getAddresses();
      setAddressData(getAddresses);
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };

  const toggleAddressOptions = (addressId) => {
    setAddressOptions((prevState) => ({
      ...prevState,
      [addressId]: !prevState[addressId],
    }));
    setActiveAddress(addressId);
  };

  const startEditingAddress = (addressId) => {
    setEditingAddress(addressId);
    // Initialize the edited address data with the current address data
    const addressToEdit = addressData.find((address) => address.id === addressId);
    setEditedAddressData({ ...addressToEdit });
  };

  const stopEditingAddress = () => {
    setEditingAddress(null);
  };

  const saveEditedAddress = async (addressId) => {
    // Implement your logic to save the edited address
    // You can use API calls to update the address data
    try {
      await apiService.updateAddress(editedAddressData);
      stopEditingAddress();
      getAddresses(); // Refresh the address list
    } catch (error) {
      console.error("Error Editing Address:", error);
    }
  };

  const makeAddressPrimary = async (addressId) => {
    try {
      await apiService.makePrimaryAddress(addressId); // Send a request to your API
      getAddresses(); // Refresh the address list
    } catch (error) {
      console.error("Error making address primary:", error);
    }
  };
  return (
    <div className="sm:w-96 w-full mt-10">
      <h3 className="text-lg font-semibold flex justify-between mb-4">
        Addresses{" "}
        {canAddAddress && !isAddingAddress && (
          <button onClick={toggleAddAddress}>
            <GrAdd />
          </button>
        )}
        {isAddingAddress && (
          <button onClick={toggleAddAddress}>
          <GrSubtract />
        </button>
        )}
      </h3>
      {isAddingAddress && (
        <div className="bg-white shadow-md rounded-lg p-4 mb-4 relative flex flex-col gap-2">
          {/* Input fields for adding a new address */}
          <input
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            type="text"
            placeholder="Name"
            value={newAddressData.name}
            onChange={(e) => handleNewAddressChange(e, "name")}
          />
          <input
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            type="text"
            placeholder="Street"
            value={newAddressData.street}
            onChange={(e) => handleNewAddressChange(e, "street")}
          />
          <input
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            type="text"
            placeholder="Number"
            value={newAddressData.number}
            onChange={(e) => handleNewAddressChange(e, "number")}
          />
          <input
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            type="text"
            placeholder="City"
            value={newAddressData.city}
            onChange={(e) => handleNewAddressChange(e, "city")}
          />
          <input
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            type="text"
            placeholder="State"
            value={newAddressData.state}
            onChange={(e) => handleNewAddressChange(e, "state")}
          />
          <input
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            type="text"
            placeholder="Zip"
            value={newAddressData.zip}
            onChange={(e) => handleNewAddressChange(e, "zip")}
          />
          <button className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={addNewAddress}>Add Address</button>
        </div>
      )}
  {addressData.map((address) => (
    <div
      key={address.id}
      className="bg-white shadow-md rounded-lg p-4 mb-4 relative"
    >
      <div className="flex items-center gap-2">
        <div className="text-lg font-semibold w-full">
          {editingAddress === address.id ? (
            <>
              <label htmlFor={`name-${address.id}`} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Name:
              </label>
              <input
                type="text"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                id={`name-${address.id}`}
                value={editedAddressData.name}
                onChange={(e) => {
                  setEditedAddressData({
                    ...editedAddressData,
                    name: e.target.value,
                  });
                }}
              />
            </>
          ) : (
            <>
              {address.name}{" "}
              {address.is_primary && (
                <div className="text-green-500 font-bold">
                  Primary Address
                </div>
              )}
            </>
          )}
        </div>
        {editingAddress === address.id ? (
          <div className="text-xl w-12">
            <button onClick={() => saveEditedAddress(address.id)} className="text-green-500">
              <FaSave />
            </button>
            <button onClick={stopEditingAddress} >
              <FaTimes />
            </button>
          </div>
        ) : (
          <button
            className="text-gray-600 hover:text-gray-900 transition duration-300"
            onClick={(event) => {
              event.stopPropagation();
              toggleAddressOptions(address.id);
            }}
          >
            <SlOptionsVertical/>
          </button>
        )}
      </div>
      {editingAddress === address.id ? (
        <div className="flex flex-col ">
          <div className="mr-2">
            <label htmlFor={`street-${address.id}`} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Street:
            </label>
            <input
              type="text"
              id={`street-${address.id}`}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={editedAddressData.street}
              onChange={(e) => {
                setEditedAddressData({
                  ...editedAddressData,
                  street: e.target.value,
                });
              }}
            />
          </div>
          <div className="mr-2">
            <label htmlFor={`number-${address.id}`} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Number:
            </label>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              id={`number-${address.id}`}
              value={editedAddressData.number}
              onChange={(e) => {
                setEditedAddressData({
                  ...editedAddressData,
                  number: e.target.value,
                });
              }}
            />
          </div>
          <div className="mr-2">
            <label htmlFor={`city-${address.id}`} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              City:
            </label>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              id={`city-${address.id}`}
              value={editedAddressData.city}
              onChange={(e) => {
                setEditedAddressData({
                  ...editedAddressData,
                  city: e.target.value,
                });
              }}
            />
          </div>
          <div className="mr-2">
            <label htmlFor={`state-${address.id}`} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              State:
            </label>
            <input
              type="text"
              id={`state-${address.id}`}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={editedAddressData.state}
              onChange={(e) => {
                setEditedAddressData({
                  ...editedAddressData,
                  state: e.target.value,
                });
              }}
            />
          </div>
          <div className="mr-2">
            <label htmlFor={`zip-${address.id}`} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Zip:
            </label>
            <input
              type="text"
              id={`zip-${address.id}`}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={editedAddressData.zip}
              onChange={(e) => {
                setEditedAddressData({
                  ...editedAddressData,
                  zip: e.target.value,
                });
              }}
            />
          </div>
        </div>
      ) : (
        <>
          <p className="text-gray-600">
            {address.street} {address.number}
          </p>
          <p>
            {address.city} {address.state} {address.zip}
          </p>
        </>
      )}
      {activeAddress === address.id && addressOptions[address.id] && (
        <div className="absolute right-5 top-3.5 shadow-2xl rounded-lg p-4 grid justify-items-start bg-white border-2">
            <button onClick={() => startEditingAddress(address.id)}>Modify</button>
            <button onClick={() => deleteAddress(address.id)}>Delete</button>
            {address.is_primary ? null : (
            <button onClick={() => makeAddressPrimary(address.id)}>Make Primary</button>
            )}
        </div>
        )}

    </div>
  ))}
<div/>
</div>
  );
};

export default Address;
