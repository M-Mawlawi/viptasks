import React from "react";
import { Navigate } from "react-router-dom";

const RedirectToLogin = () => {
    // Get the current URL (to determine where the user came from)
    const currentUrl = window.location.pathname;

    // Define the URLs to exclude from redirection
    const excludedUrls = ['/login', '/logout'];

    // Check if the current URL is in the excludedUrls array
    if (!excludedUrls.includes(currentUrl)) {
        // Construct the login URL with the "next" parameter
        const loginUrl = `/login?next=${encodeURIComponent(currentUrl)}`;

        // Redirect the user to the login page with the "next" parameter
        return <Navigate to = { loginUrl }
        />;
    } else {
        // If it's an excluded URL, you can handle it differently or simply do nothing
        return null; // Or return a different component if needed
    }
};

export default RedirectToLogin;