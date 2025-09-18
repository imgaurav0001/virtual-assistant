import React, { createContext, useEffect, useState } from "react";
import axios from "axios";

export const UserContext = createContext();

function UserContextProvider({ children }) {
  // --- START OF DEPLOYMENT-SAFE CODE ---
  // This automatically sets the correct backend URL for local dev vs. production
  const serverUrl = import.meta.env.MODE === 'production'
    ? "" // On Vercel, the backend is at the same domain
    : "http://localhost:8000"; // On your local machine
  // --- END OF DEPLOYMENT-SAFE CODE ---

  const [userData, setUserData] = useState(undefined);

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

  const getGeminiResponse = async (command) => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/users/askToAssistant`,
        { command },
        { withCredentials: true }
      );
      return result.data;
    } catch (error) {
      console.error("❌ Error fetching Gemini response:", error?.response?.data ?? error.message ?? error);
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