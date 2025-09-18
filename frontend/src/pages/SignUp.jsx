import React, { useState, useContext } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import img from "../assets/Image1.jpg";
import axios from "axios";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom"; // ✅ useNavigate instead of Navigate

function SignUp() {
  const { serverUrl, setUserData } = useContext(UserContext);
  const navigate = useNavigate(); // ✅ use hook

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setError("");

    try {
      let result = await axios.post(
        `${serverUrl}/api/auth/signup`,
        { name, email, password },
        { withCredentials: true }
      );

      // ✅ save user in context
      setUserData(result.data.user);

      console.log("Signup success:", result.data);
      alert("✅ Account created successfully!");
      localStorage.setItem("token", result.data.token);

      // ✅ redirect after success
      navigate("/customize");
    } catch (error) {
      console.error("Signup error:", error);
      setUserData(null);
      setError("❌ Failed to create account. Please try again.");
    }
  };

  return (
    <div
      className="w-full h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center"
      style={{ backgroundImage: `url(${img})` }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-[90%] max-w-[500px] bg-white/20 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/30 flex flex-col items-center"
      >
        <h1 className="text-white text-[30px] font-semibold text-center mb-8">
          Register to <span className="text-blue-400">Virtual Assistant</span>
        </h1>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your Name"
          className="w-full h-[55px] mb-5 outline-none border border-white/40 bg-transparent text-white placeholder-gray-300 px-5 rounded-full focus:border-blue-400 transition"
          required
        />

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your Email"
          className="w-full h-[55px] mb-5 outline-none border border-white/40 bg-transparent text-white placeholder-gray-300 px-5 rounded-full focus:border-blue-400 transition"
          required
        />

        <div className="relative w-full mb-2">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your Password"
            className={`w-full h-[55px] outline-none border ${
              error ? "border-red-500" : "border-white/40"
            } bg-transparent text-white placeholder-gray-300 px-5 rounded-full focus:border-blue-400 transition`}
            required
          />
          <span
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          className="w-full h-[55px] bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-full shadow-lg hover:opacity-90 transition"
        >
          Sign Up
        </button>

        <p className="text-gray-200 mt-6 text-sm">
          Already have an account?{" "}
          <a href="/sign-in" className="text-blue-400 hover:underline">
            Sign in
          </a>
        </p>
      </form>
    </div>
  );
}

export default SignUp;
