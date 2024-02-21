import React, { useEffect, useState, useRef } from "react";
import moment from "moment";
import "moment-timezone";
import apiService from "../../../../services/api";
import { backendURL, backendWsURL } from "../../../../../config";
import { useLocalStorage } from "usehooks-ts";

const ChatPanel = ({ activeChat, activeChatSetter, showupMessage , showPanel}) => {
  const [chats, setChats] = useState([]);
  const ws = useRef();
  const [isAuthenticated, saveisAuthenticated] = useLocalStorage("token", null);

  useEffect(() => {
    moment.tz.setDefault("Europe/Berlin");
    getChats();
  }, []);

  useEffect(() => {
    if (!chats.length) return;
    ws.current = new WebSocket(
      `ws://${backendWsURL}/ws/chat_panel/?token=${isAuthenticated}`
    );

    ws.current.onopen = () => {
      //do some thing
    };

    ws.current.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);

      setChats((prevChats) => {
        // ... your existing logic for updating chats ...

        return updatedChats;
      });
    };

    return () => {
      ws.current.close();
    };
  }, [chats]);

  const getChats = async () => {
    try {
      const response = await apiService.getChats();
      setChats(response);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  const formatDateTime = (datetime) => {
    return moment(datetime).fromNow(); // Example: "2 hours ago"
  };

  return (
    <div className={`md:py-9 md:px-5 py-4 px-4 w-full md:w-1/4 transition-opacity duration-300 ease-in-out ${!showPanel && ("hidden")} md:block `}>
      <div className="pt-2 relative mx-auto text-gray-600">
      <input
        className="border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none w-full"
        type="search"
        name="search"
        placeholder="Search"
      />
      <button type="submit" className="absolute right-0 top-0 mt-5 mr-4">
        <svg
          className="text-gray-600 h-4 w-4 fill-current"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          version="1.1"
          id="Capa_1"
          x="0px"
          y="0px"
          viewBox="0 0 56.966 56.966"
          style={{ enableBackground: "new 0 0 56.966 56.966" }}
          xmlSpace="preserve"
          width="512px"
          height="512px"
        >
          <path d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23  s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92  c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17  s-17-7.626-17-17S14.61,6,23.984,6z" />
        </svg>
      </button>
    </div>

    <h3 className="text-xs font-semibold uppercase text-gray-400 my-4">
        Chats
      </h3>
      <div className="divide-y divide-gray-200">
        {chats.map((chat, index) => (
          <button
            className={`w-full text-left py-2 focus:outline-none focus-visible:bg-gray-50 hover:bg-gray-200	border-b ${
              chat.user === activeChat ? "md:bg-gray-100" : ""
            }`}
            key={index}
            onClick={(e) => {
              activeChatSetter(chat.user);
            }}
          >
            <div className="flex items-center">
              <img
                className="rounded-full items-start flex-shrink-0 mr-3"
                src={backendURL + "/" + chat.photo}
                width="50"
                height="50"
                alt={chat.user}
              />
              <div>
                <h4 className="text-sm font-semibold text-gray-900">
                  {chat.user}
                </h4>
                <div className="text-[13px]">
                  {showupMessage? showupMessage : chat.showup_message} · {showupMessage? "now" :formatDateTime(chat.showup_message_time)}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatPanel;
