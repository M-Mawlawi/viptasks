import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Profile from "./components/Profile";
import ChatLog from "./components/Chat";
import apiService from "../../services/api";
import HttpError from "../../httpError";
import { useLocalStorage } from "usehooks-ts";
import { backendURL, backendWsURL } from "../../../config";
import ChatPanel from "./components/ChatPanel";

const ChatRoom = (props) => {
  const [messageInput, setMessageInput] = useState("");
  const [userName, setUserName] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [page, setPage] = useState(1);
  const chatLog = useRef(null);
  const ws = useRef();
  const [isAuthenticated, saveisAuthenticated] = useLocalStorage("token", null);
  const [userData, setUserData] = useLocalStorage("userData", null);
  const [profileData, setProfileData] = useState(null);
  const chatLogContainerRef = useRef(null);
  const [activeChat, setActiveChat] = useState("");
  const [showupMessage, setShowupMessage] = useState("");
  const [showPanel,setShowPanel] = useState(true);

  useEffect(() => {
    if (activeChat) {
      const fetchData = async () => {
        try {
          const getProfile = await apiService.getChatProfile(activeChat);
          setProfileData(getProfile);
        } catch (error) {
          console.error("Error fetching profile data:", error);
        }
      };
      fetchData();
    }
  }, [activeChat]);

  useEffect(() => {
    if (isAuthenticated) {
      setUserName(userData.username);
      setIsReady(true);
    }
  }, [isAuthReady]);

  useEffect(() => {
    if (!isReady || !activeChat) {
      return;
    }

    ws.current = new WebSocket(
      `ws://${backendWsURL}/ws/chat_panel/chat/${activeChat}/?token=${isAuthenticated}`
    );

    ws.current.onopen = () => {
      console.log("Connected to chat socket");
    };

    ws.current.onmessage = (event) => {
      setChatMessages((messages) => [...messages, JSON.parse(event.data)]);
      setShowupMessage(JSON.parse(event.data).content_object.text);
    };

    ws.current.onclose = (event) => {
      if (event.code === 4003) {
        console.log("Error: You are not assigned to this customer.");
      } else {
        console.log("WebSocket connection closed.");
      }
    };
    return () => {
      ws.current.close();
    };
  }, [isReady, activeChat]);

  const handleInputChange = (event) => {
    setMessageInput(event.target.value);
  };

  const handleSubmitf = (event) => {
    event.preventDefault(); // Prevent the default form submission behavior

    if (!messageInput.trim()) {
      return;
    }
    if (
      messageInput &&
      ws.current &&
      ws.current.readyState === WebSocket.OPEN
    ) {
      ws.current.send(
        JSON.stringify({
          message: `${messageInput}`,
          sender_username: `${userName}`,
        })
      );
      setMessageInput("");
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    if (chatLogContainerRef.current) {
      const { scrollHeight } = chatLogContainerRef.current;
      chatLogContainerRef.current.scrollTop = scrollHeight;
    }
  };
  const fetchMessages = async () => {
    if (isLoading || !hasNextPage || !activeChat) return;
  
    setIsLoading(true);
    const getMessages = await apiService.fetchMessages({
      roomName: activeChat,
      page: page,
    });
  
    if (!(getMessages instanceof HttpError)) {
      if (getMessages.error) {
        console.log(getMessages.error);
      } else {
        const newMessages = getMessages.messages;
        setChatMessages((prevMessages) => [...newMessages, ...prevMessages]);
        setHasNextPage(getMessages.next_page);
        setPage((prevPage) => prevPage + 1);
      }
    }
    setIsLoading(false);
  };
  

  useEffect(() => {
    if (isReady) {
      fetchMessages();
    }
  }, [isReady, activeChat]);

  const handleScroll = (event) => {
  const { scrollTop } = event.target;
  if (scrollTop <= 0) {
    // When the user scrolls to the top
    fetchMessages();
  }
};

  const activeChatSetter = (active) => {
    setActiveChat(active);
    setShowPanel(false);
  };
  const setMessageReaded = async () => {
    const readed = await apiService.readMessages(activeChat);
    if (!(readed instanceof HttpError)) {
      if (readed.error) {
        console.log(readed.error);
      } else {
        fetchMessages();
      }
    }
  };
  const toggleShowPanel = ()=>{
      setShowPanel(!showPanel);
  }
  return (
    <div className="flex">
      <ChatPanel
        activeChat={activeChat}
        activeChatSetter={activeChatSetter}
        showupMessage={showupMessage}
        showPanel={showPanel}
      />
      <div className={`flex-1 p:2 sm:p-6 justify-between md:flex flex-col h-[calc(100vh-55px)] md:h-screen shadow-[inset_0_0_4px_rgba(0,0,0,0.6)] ${showPanel && ("hidden")}`}>
        <Profile
          profileData={profileData}
          roomName={activeChat}
          togglePanel={()=>toggleShowPanel()}
        />
        <div
          id="messages"
          className="flex flex-col space-y-4 p-3 h-[73%] overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
          ref={chatLog}
          onScroll={handleScroll}
        >
          <ChatLog
            profileData={profileData}
            chatMessages={chatMessages}
            userName={userName}
            chatLogRef={chatLog}
            onChatLogClick={setMessageReaded}
          />
        </div>
        <div className="border-t-2 border-gray-200 px-4 py-4 sm:mb-0">
          <div className="relative flex">
            <form
              className="message-input-form w-full"
              onSubmit={handleSubmitf}
            >
              <input
                type="text"
                placeholder="Write your message!"
                value={messageInput}
                onChange={handleInputChange}
                className="w-full focus:outline-none focus:placeholder-gray-400 text-gray-600 placeholder-gray-600  bg-gray-200 rounded-md py-3"
              />
              <div className="absolute right-0 items-center inset-y-0 hidden sm:flex">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full h-10 w-10 transition duration-500 ease-in-out text-gray-500 hover:bg-gray-300 focus:outline-none"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="h-6 w-6 text-gray-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-lg px-4 py-3 transition duration-500 ease-in-out text-white bg-blue-500 hover:bg-blue-400 focus:outline-none"
                >
                  <span className="font-bold">Send</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-6 w-6 ml-2 transform rotate-90"
                  >
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
