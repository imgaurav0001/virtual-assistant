import React, { useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

function Customize2() {
  const [assistantName, setAssistantName] = useState("");
  const [showButton, setShowButton] = useState(false);

  const { userData, setUserData, serverUrl } = useContext(UserContext);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const value = e.target.value;
    setAssistantName(value);
    setShowButton(value.trim().length > 0);
  };

  const handleCreateClick = async () => {
    if (!assistantName.trim()) return;

    try {
      const formData = new FormData();
      formData.append("assistant", assistantName);

      if (userData?.assistantImage) {
        if (userData.assistantImage.startsWith("blob:")) {
          const response = await fetch(userData.assistantImage);
          const blob = await response.blob();
          formData.append("assistantImage", blob, "assistant.jpg");
        } else {
          formData.append("imageUrl", userData.assistantImage);
        }
      }

      const res = await axios.post(
        `${serverUrl}/api/users/updateAssistant`,
        formData,
        { withCredentials: true }
      );

      setUserData(res.data.user);

      console.log("✅ Assistant Created:");
      console.dir(res.data.user, { depth: null });

      navigate("/"); // ✅ go to home
    } catch (err) {
      console.error("❌ Error creating assistant:", err.response || err);
    }
  };

  const handleBack = () => {
    navigate("/customize"); // back to image selection
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-purple-600 flex flex-col justify-center items-center p-6 relative">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="absolute top-6 left-6 text-white bg-purple-600 p-2 rounded-full shadow-lg hover:bg-purple-700 transition-all duration-300"
      >
        <FiArrowLeft size={24} />
      </button>

      <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold mb-8 text-center">
        Enter your Virtual Assistant's Name
      </h1>

      <input
        type="text"
        value={assistantName}
        onChange={handleInputChange}
        placeholder="eg - Bixby"
        className="w-full max-w-md px-6 py-3 rounded-full border-2 border-gray-400 
                   focus:border-purple-400 focus:ring-2 focus:ring-purple-500 
                   outline-none transition-all duration-300 
                   text-lg text-black placeholder-black bg-white shadow-md"
      />

      {showButton && (
        <button
          onClick={handleCreateClick}
          className="mt-6 px-8 py-3 rounded-full bg-purple-600 text-white font-semibold 
                     text-lg shadow-lg hover:bg-purple-700 transition-all duration-300"
        >
          Create
        </button>
      )}
    </div>
  );
}

export default Customize2;
