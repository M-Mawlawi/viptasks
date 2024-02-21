import './App.css';
import React, { Fragment, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import RedirectToLogin from './pages/Login/redirect';
import Home from './pages/Home';
import ChatRoom from './pages/Chat';
import { useLocalStorage } from "usehooks-ts";
import Logout from './pages/Logout';
import ChatPanel from './pages/Chat/components/ChatPanel';
import PasswordReset from './pages/PasswordReset';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';
import MappingComponent from './pages/Settings/components/Mapping';


const App = () => {
  const [isAuthenticated, saveisAuthenticated] = useLocalStorage("token", null);
  // const isAuthenticated = authService.isAuthenticated();

  return (
    <Router>
      <Fragment>
        <Routes>
          <Route path="/mapping/" element={<MappingComponent/>}/>
          <Route path="/reset-password/:uid/:token/" element={<PasswordReset/>}/>
          <Route path="/reset-password/" element={<PasswordReset/>}/>
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to={'/'} /> // Redirect to intendedPath or home
              ) : (
                <Login />
              )
            }
          />
          <Route
            path="/signup"
            element={
              isAuthenticated ? (
                <Navigate to={'/'} /> // Redirect to intendedPath or home
              ) : (
                <Signup />
              )
            }
          />
          <Route
            path="/:room"
            element={<Home/>}
          />
          <Route
            path="/"
            element={<Home/>}
          />
          <Route
            path="/chat"
            element={isAuthenticated ? <ChatPanel /> : <RedirectToLogin />}
          />
          <Route
            path="/profile"
            element={<Profile/>}
          />
          <Route 
            path="/tasks"
            element={<Tasks/>}
          />
          <Route
            path="/messages/"
            element={isAuthenticated ? <ChatRoom /> : <RedirectToLogin />}
          />
          <Route path="/logout" element={<Logout/>} />
        </Routes>
      </Fragment>
    </Router>
  );
};

export default App;
