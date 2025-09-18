import React, { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Make sure these files exist at these exact paths and are .gif files
import User_Voice_Icon from "../assets/User_Voice_Icon.gif";
import Assistant_Voice_icon from "../assets/Assistant_Voice_icon.gif";

function Home() {
  const { userData, setUserData, serverUrl, getGeminiResponse } = useContext(UserContext);
  const navigate = useNavigate();
  const lastTranscriptRef = useRef("");
  const recognitionRef = useRef(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const voicesRef = useRef([]);

  const [voiceState, setVoiceState] = useState('idle'); // 'idle', 'listening', 'speaking'

  useEffect(() => {
    const loadVoices = () => { voicesRef.current = window.speechSynthesis.getVoices(); };
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
    } catch (err) { console.error("❌ Logout error:", err); }
    localStorage.removeItem("token");
    setUserData(null);
    navigate("/sign-in");
  };

  const speak = (data) => {
    const text = data.response;
    const lang = data.language;
    if (!text || typeof text !== "string") return;

    if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const targetLang = lang === "hi" ? "hi-IN" : "en-IN";
    utterance.lang = targetLang;

    const femaleVoice = voicesRef.current.find(voice => voice.lang === targetLang && voice.name.includes("Female"));
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    } else {
        const googleVoice = voicesRef.current.find(
            (voice) => voice.lang === targetLang && voice.name.includes("Google")
        );
        if(googleVoice) utterance.voice = googleVoice;
    }
    
    utterance.onstart = () => setVoiceState('speaking');
    utterance.onend = () => setVoiceState('idle');
    utterance.onerror = (e) => {
      console.error("❌ Speech error:", e);
      setVoiceState('idle');
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleCommand = (data) => {
    if (!data) return;
    if (data.response) speak(data);
    
    const type = data.type ?? "general";
    const userinput = data.userinput ?? data.userInput ?? "";

    setTimeout(() => {
        switch (type) {
          case "google_open":
            window.open("https://www.google.com", "_blank");
            break;
          case "google_search":
            if (userinput) window.open(`https://www.google.com/search?q=${encodeURIComponent(userinput)}`, "_blank");
            break;
          case "youtube_search":
          case "youtube_play":
            if (userinput) window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(userinput)}`, "_blank");
            break;
          case "wikipedia_search":
            if (userinput) window.open(`https://en.wikipedia.org/wiki/${encodeURIComponent(userinput)}`, "_blank");
            break;
          case "facebook_open":
            if (userinput) window.open(`https://www.facebook.com/search/top?q=${encodeURIComponent(userinput)}`, "_blank");
            break;
          case "instagram_open":
            if (userinput) window.open(`https://www.instagram.com/${encodeURIComponent(userinput.replace(/\s+/g, ''))}`, "_blank");
            break;
          case "twitter_open":
            if (userinput) window.open(`https://twitter.com/search?q=${encodeURIComponent(userinput)}`, "_blank");
            break;
          case "gmail_open":
            window.open("https://mail.google.com/", "_blank");
            break;
          case "google_maps_open":
            if (userinput) window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(userinput)}`, "_blank");
            break;
          case "weather_show":
            if (userinput) window.open(`https://www.google.com/search?q=weather+in+${encodeURIComponent(userinput)}`, "_blank");
            break;
          case "calculator_open":
            window.open("https://www.google.com/search?q=calculator", "_blank");
            break;
          default:
            break;
        }
    }, 100);
  };

  const startRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-IN";

    recognition.onaudiostart = () => setVoiceState('listening');
    recognition.onaudioend = () => setVoiceState('idle');

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim();
      if (!transcript || transcript === lastTranscriptRef.current) return;
      lastTranscriptRef.current = transcript;
      console.log("🎤 Transcribed text:", transcript);
      try {
        const data = await getGeminiResponse(transcript);
        console.log("🤖 Assistant response object:", data);
        handleCommand(data);
      } catch (err) {
        console.error("❌ Error calling assistant:", err);
        speak({ response: "Sorry, I couldn't process that.", language: "en" });
      }
    };
    recognition.onerror = (err) => {
      if (err.error !== "no-speech") console.error("❌ Speech recognition error:", err);
    };
    recognition.onend = () => {
      setTimeout(() => { try { recognitionRef.current?.start(); } catch {} }, 400);
    };
    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) { console.error("Could not start recognition:", e); }
  };

  const handleInteraction = () => {
    if (!hasInteracted && userData) {
      setHasInteracted(true);
      const greeting = `Hello ${userData.name}, I am ${userData.assistantName}, a virtual assistant. How can I assist you?`;
      speak({ response: greeting, language: "en" });
      startRecognition();
    }
  };

  return (
    <div
      onClick={handleInteraction}
      className="min-h-screen bg-gradient-to-b from-black to-purple-600 flex flex-col justify-center items-center p-6 relative cursor-pointer"
    >
      <button onClick={handleLogout} className="absolute top-6 right-6 bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-full shadow-lg z-20">
        Logout
      </button>

      {/* --- UI CHANGE: STATIC ASSISTANT IMAGE --- */}
      {/* This div now ONLY shows the static image you chose. */}
      <div className="w-64 h-64 flex justify-center items-center overflow-hidden rounded-2xl shadow-2xl border-4 border-purple-400">
        <img
          src={userData?.assistantImage}
          alt={userData?.assistantName || "Assistant"}
          className="w-full h-full object-cover"
        />
      </div>

      <h2 className="mt-6 text-white text-2xl md:text-3xl font-bold text-center drop-shadow-lg">
        I'm {userData?.assistantName || "Your Assistant"}
      </h2>

      {/* --- UI CHANGE: GIFS MOVED TO THE BOTTOM --- */}
      {/* This new div is positioned at the bottom to show the animations. */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-32 h-20 flex justify-center items-center">
        {voiceState === 'listening' && (
          <img src={User_Voice_Icon} alt="User is speaking" className="w-full h-full object-contain" />
        )}
        {voiceState === 'speaking' && (
          <img src={Assistant_Voice_icon} alt="Assistant is speaking" className="w-full h-full object-contain" />
        )}
      </div>

      {!hasInteracted && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center backdrop-blur-sm z-10">
          <h3 className="text-white text-4xl font-bold animate-pulse">
            Click anywhere to begin
          </h3>
        </div>
      )}
    </div>
  );
}

export default Home;