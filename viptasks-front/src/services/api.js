import HttpError from "../httpError";
import api from "../axios/conf";

const getChatProfile = async(userName) => {
    try {
        const response = await api.get(
            `/chat/profile/${userName}`
        );
        return response.data;
    } catch (error) {
        console.error(error);

    }
}


const getProfile = async() => {
    try {
        const response = await api.get(
            `/profile/`
        );
        return response.data;
    } catch (error) {
        console.error(error);

    }
}

const getUserName = async() => {
    try {
        const response = await api.get(
            "/get_username/"
        );
        return response.data.username;
    } catch (error) {
        console.error(error);

    }
};

const fetchMessages = async({ roomName, page }) => {
    try {
        const response = await api.get(
            `/chat/messages/${roomName}/?page=${page}`
        );
        return response.data;
    } catch (error) {
        console.error(error);
        return new HttpError(error);
    }
};

const getChats = async() => {
    try {
        const response = await api.get(
            `/get_chats/`
        );
        return response.data;
    } catch (error) {
        console.error(error);
        return new HttpError(error);
    }
};

const getProducts = async(room) => {
    try {
        const response = await api.get(
            `/products/${room.room}`
        );
        return response.data;
    } catch (error) {
        console.error(error);
        return new HttpError(error);
    }
}

const getRooms = async() => {
    try {
        const response = await api.get(
            `/rooms/`
        );
        return response.data;
    } catch (error) {
        console.error(error);
        return new HttpError(error);
    }
}

const getSpecifications = async(pid) => {
    try {
        const response = await api.get(
            `items/${pid}/specifications/`
        );
        return response.data;
    } catch (error) {
        console.error(error);
        return new HttpError(error);
    }
}
const getCountryCodes = async() => {
    try {
        const response = await api.get(
            `country-codes/`
        );
        return response.data;
    } catch (error) {
        console.error(error);
        return new HttpError(error);
    }
}

const getAddresses = async() => {
    try {
        const response = await api.get(
            `get-addresses/`
        );
        return response.data;
    } catch (error) {
        console.error(error);
        return new HttpError(error);
    }
}

const deleteAddress = async(aId) => {
    try {
        const response = await api.get(
            `delete-addresses/${aId}`
        );
        return response.data;
    } catch (error) {
        console.error(error);
        return new HttpError(error);
    }
}

const updateAddress = async(updateData) => {
    try {
        const response = await api.post(
            `update-address/`, { updateData }
        );
        return response.data;
    } catch (error) {
        console.error(error);
        return new HttpError(error);
    }
}

const makePrimaryAddress = async(aId) => {
    try {
        const response = await api.post(
            `primary-address/`, { aId }
        );
        return response.data;
    } catch (error) {
        console.error(error);
        return new HttpError(error);
    }
}

const createAddress = async(newAddressData) => {
    try {
        const response = await api.post(
            `create-address/`, { newAddressData }
        );
        return response.data;
    } catch (error) {
        console.error(error);
        return new HttpError(error);
    }
}

const updateUserProfile = async(userData) => {
    try {
        const response = await api.post(
            `profile/edit/`, userData
        );
        return response.data;
    } catch (error) {
        console.error(error);
        return new HttpError(error);
    }
}
const readMessages = async(activeChat) => {
    try {
        const response = await api.post(
            `messages/read/`, { activeChat }
        );
        return response.data;
    } catch (error) {
        console.error(error);
        return new HttpError(error);
    }
}

const updateProfilePhoto = async(profilePhoto) => {
    try {
        const response = await api.post(
            `update-profile-photo/`, { profilePhoto }
        );
        return response.data;
    } catch (error) {
        console.error(error);
        return new HttpError(error);
    }
}
const saveHighlighted = async(data) => {
    try {
        const response = await api.post(
            `save-area/`, data
        );
        return response.data;
    } catch (error) {
        console.error(error);
        return new HttpError(error);
    }
}
const getAreas = async() => {
    try {
        const response = await api.get(
            `get-area/`
        );
        return response.data;
    } catch (error) {
        console.error(error);
        return new HttpError(error);
    }
}
const apiService = { getUserName, fetchMessages, getChats, getProfile, getProducts, getRooms, getSpecifications, getChatProfile, getCountryCodes, getAddresses, deleteAddress, updateAddress, makePrimaryAddress, createAddress, updateUserProfile, readMessages, updateProfilePhoto, saveHighlighted, getAreas };

export default apiService;