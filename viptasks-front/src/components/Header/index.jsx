import { backendURL } from "../../../config";
import { useLocalStorage } from "usehooks-ts";
import { useState } from "react";

const Header = () => {
  const [isAuthenticated, saveisAuthenticated] = useLocalStorage("token", null);
  const [userData, setUserData] = useLocalStorage("userData", null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  return (
    <nav className="bg-white border-gray-200">
      <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl relative">
        <a href="/" className="flex items-center">
          <img
            src={`${backendURL}/static/img/logo.png`}
            alt="Vip Taskers"
            className="h-20 mr-3"
          />
        </a>
        {isAuthenticated ? (
          <div>
            <button
                id="dropdownAvatarNameButton"
                onClick={toggleMenu} // Call the toggleMenu function here
                className="flex items-center text-sm font-medium text-gray-900 rounded-full hover:text-blue-600 dark:hover:text-blue-500 md:mr-0 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:text-white"
                type="button"
                >
              <img
                className="w-8 h-8 mr-2 rounded-full"
                src={backendURL+userData.profile_photo}
                alt="user photo"
              />
              {userData.username}
              <svg
                className="w-2.5 h-2.5 ml-2.5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="m1 1 4 4 4-4"
                />
              </svg>
            </button>
            {isMenuOpen ? (
            <div
              id="dropdownAvatarName"
              className="z-10 absolute -translate-x-1/2 sm:translate-x-0 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600"
            >
              <div className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                <div className="font-medium ">{userData.first_name} {userData.last_name}</div>
                <div className="truncate">{userData.email}</div>
              </div>
              <ul
                className="py-2 text-sm text-gray-700 dark:text-gray-200"
                aria-labelledby="dropdownInformdropdownAvatarNameButtonationButton"
              >
                <li>
                  <a
                    href="/profile"
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    Profile
                  </a>
                </li>
                <li>
                  <a
                    href="/settings"
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    Settings
                  </a>
                </li>
                <li>
                  <a
                    href="/messages"
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    Messages
                  </a>
                </li>
              </ul>
              <div className="py-2">
                <a
                  href="logout"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                >
                  Sign out
                </a>
              </div>
            </div>
            ):null}
          </div>
            
        ) : (
          <div className="flex items-center">
            <a
              href="/login"
              className="text-sm  text-logo-blue hover:underline mr-2"
            >
              Login
            </a>
            <a
              href="/signup"
              className="text-sm  text-logo-blue hover:underline mr-2"
            >
              Signup
            </a>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;
