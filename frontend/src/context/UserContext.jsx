// frontend/src/context/UserContext.jsx
import React, { createContext, useEffect, useState } from "react";
import axios from "axios";

export const UserContext = createContext();

function UserContextProvider({ children }) {
  // 👇 Use your deployed backend URL here
  const serverUrl =
    import.meta.env.MODE === "production"
      ? "https://virtual-assistant-backend-fkfw.onrender.com" // backend on Render
      : "http://localhost:8000"; // local dev

  const [userData, setUserData] = useState(undefined); // undefined while loading

  // ------------------ Get Current User ------------------
  const handleCurrentUser = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/users/me`, {
        withCredentials: true,
      });
      setUserData(result.data.user);
      console.log("✅ Current user:", result.data.user);
    } catch (error) {
      console.log("ℹ️ No user logged in yet.");
      setUserData(null);
    }
  };

  // ------------------ Ask Gemini Assistant ------------------
  const getGeminiResponse = async (command) => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/users/askToAssistant`,
        { command },
        { withCredentials: true }
      );

      // We expect an object { type, userinput, response }
      return result.data;
    } catch (error) {
      console.error(
        "❌ Error fetching Gemini response:",
        error?.response?.data ?? error.message ?? error
      );
      return null;
    }
  };

  useEffect(() => {
    handleCurrentUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        serverUrl,
        userData,
        setUserData,
        getGeminiResponse,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export default UserContextProvider;
