import React, { useEffect, useState, useRef } from 'react';
import Products from "../../components/Products";
import { useParams } from "react-router-dom";
import apiService from "../../services/api";
import { backendURL } from '../../../config';
import { useLocalStorage } from "usehooks-ts";
import Header from '../../components/Header';

const Home = (props)=>{
    const { room } = useParams();
    const [rooms, setRooms] = useState([]);
    const defaultRoom = "sleeping-room";
    const selectedRoom = room || defaultRoom;
    useEffect(() => {
        getRooms();
    }, []);
    const getRooms = async()=>{
        try {
            const response = await apiService.getRooms();
            setRooms(response);
        } catch (error) {
            console.error('Error fetching Rooms:', error);
        }
        
    }
    return(
        <div>
        <Header/>
<nav className="bg-logo-blue">
    <div className="max-w-screen-xl px-4 py-3 mx-auto">
        <div className="flex items-center justify-center">
            <ul className="flex flex-row gap-6 font-medium mt-0 text-sm">
            {rooms.map((room, index) => (
                <li key={index}>
                    <a
                    href={`${room.room.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-white hover:underline"
                    aria-current="page"
                    >
                    {room.room}
                    </a>
                </li>
            ))}
            </ul>
        </div>
    </div>
</nav>
            <Products room={selectedRoom}/>
            
        </div>
    );
}

export default Home;