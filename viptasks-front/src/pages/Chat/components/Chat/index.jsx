import React from "react";
import { backendURL } from "../../../../../config";
import moment from "moment";
import "moment-timezone";
import { BsCheck, BsCheckAll } from "react-icons/bs";

const ChatLog = (props) => {
  const { chatMessages, onChatLogClick } = props; // Add the onChatLogClick prop

  const formatDateTime = (datetime) => {
    return moment(datetime).format("HH:mm"); // Example: "2 hours ago"
  };

  if (!chatMessages || chatMessages.length === 0) {
    // Render a fallback message when the messages array is empty or undefined
    return <div>Start Chat to see messages</div>;
  }

  return (
    // Wrap the entire component in a clickable div with onClick
    <div onClick={onChatLogClick} className="chat-log-wrapper">
      {chatMessages.map((message, index, array) => {
        const nextMessage = array[index + 1];
        const isSameSenderAsNext =
          nextMessage && message.sender_username === nextMessage.sender_username;
        const messageKey = message.id || index;
        return !message.content_object.text && !message.content_object.image ? (
          <div key={messageKey} className="message message-invalid">
            <p className="message-text">Invalid message</p>
          </div>
        ) : message.content_object.text ? (
          message.sender_username !== props.userName ? (
            <div className="chat-message my-2">
              <div className="flex items-end">
                <div
                  className={`flex flex-col space-y-2 text-xs max-w-xs ${
                    isSameSenderAsNext ? "mx-8" : "mx-2"
                  } order-2 items-start`}
                >
                  <div className="grid pb-2 pr-3 pt-2 pl-4 text-gray-600 rounded-lg inline-block rounded-bl-none bg-gray-300 ">
                    <span>{message.content_object.text}</span>
                    <span className="flex justify-start gap-1 mt-2">
                      {formatDateTime(message.created_at)}
                    </span>
                  </div>
                </div>
                {!isSameSenderAsNext && (
                  <img
                    src={backendURL + props.profileData.profile_photo}
                    alt="My profile"
                    className="w-6 h-6 rounded-full order-1"
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="chat-message my-2">
              <div className="flex items-end justify-end">
                <div
                  className={`flex flex-col space-y-2 text-xs max-w-xs mx-2 order-1 items-end`}
                >
                  <div className="grid pb-2 pr-4 pt-2 pl-3 rounded-lg inline-block rounded-br-none bg-blue-600 text-white ">
                    <span>{message.content_object.text}</span>
                    <span className="text-white flex justify-end gap-1 mt-2">
                      {message.readed ? (
                        <BsCheckAll className="h-5" />
                      ) : (
                        <BsCheck className="h-5" />
                      )}
                      {formatDateTime(message.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        ) : (
          <div key={messageKey} className="message message-image">
            <img
              className="message-img"
              src={backendURL + message.content_object.image}
              alt="Chat"
            />
          </div>
        );
      })}
    </div>
  );
};

export default ChatLog;
