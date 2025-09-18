import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Customize from "./pages/Customize";
import Customize2 from "./pages/Customize2";
import Home from "./pages/Home";
import { UserContext } from "./context/UserContext";

function App() {
  const { userData } = useContext(UserContext);

  // Wait until userData loads
  if (userData === undefined) return null;

  return (
    <Routes>
      {/* Root route */}
      <Route
        path="/"
        element={
          !userData ? (
            <Navigate to="/sign-in" />
          ) : userData?.assistantImage && userData?.assistantName ? (
            <Home />
          ) : (
            <Navigate to="/customize" />
          )
        }
      />

      {/* Auth Routes */}
      <Route
        path="/sign-in"
        element={!userData ? <SignIn /> : <Navigate to="/" />}
      />
      <Route
        path="/sign-up"
        element={!userData ? <SignUp /> : <Navigate to="/" />}
      />

      {/* Customize Flow */}
      <Route
        path="/customize"
        element={userData ? <Customize /> : <Navigate to="/sign-in" />}
      />
      <Route
        path="/customize2"
        element={userData ? <Customize2 /> : <Navigate to="/sign-in" />}
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
