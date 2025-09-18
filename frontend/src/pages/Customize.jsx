import React, { useRef, useState, useContext } from "react";
import { FiImage, FiArrowLeft } from "react-icons/fi";
import Card from "../components/Card";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

import Image1 from "../assets/Image1.jpg";
import Image2 from "../assets/Image2.jpg";
import Image3 from "../assets/Image3.jpg";
import Image4 from "../assets/Image4.jpg";
import Image5 from "../assets/Image5.jpg";
import Image6 from "../assets/Image6.jpg";
import Image7 from "../assets/Image7.jpg";
import Image8 from "../assets/Image8.jpg";
import Image9 from "../assets/Image9.jpg";

function Customize() {
  const { setUserData } = useContext(UserContext);
  const navigate = useNavigate();

  const [galleryImage, setGalleryImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const inputRef = useRef();

  const images = [Image1, Image2, Image3, Image4, Image5, Image6, Image7, Image8, Image9];

  const handleUploadClick = () => inputRef.current.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imgURL = URL.createObjectURL(file);
      setGalleryImage(imgURL);
      setSelectedImage(imgURL);
    }
  };

  const handleSelect = (img) => setSelectedImage(img);

  const handleNext = () => {
    if (!selectedImage) return;

    // ✅ Save assistant image consistently
    setUserData((prev) => ({
      ...prev,
      assistantImage: selectedImage,
    }));

    navigate("/customize2");
  };

  const handleBack = () => {
    navigate("/sign-up"); // Go back to sign-up
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-purple-600 flex flex-col justify-start items-center p-6 relative">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="absolute top-6 left-6 text-white bg-purple-600 p-2 rounded-full shadow-lg hover:bg-purple-700 transition-all duration-300"
      >
        <FiArrowLeft size={24} />
      </button>

      <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold mb-8 text-center">
        Select your Virtual Assistant
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 justify-center w-full max-w-5xl">
        {images.map((img, idx) => (
          <Card
            key={idx}
            image={img}
            onClick={() => handleSelect(img)}
            selected={selectedImage === img}
          />
        ))}

        {/* Upload Card */}
        <Card onClick={handleUploadClick} selected={selectedImage === galleryImage}>
          {galleryImage ? (
            <img
              src={galleryImage}
              alt="Uploaded"
              className="w-full h-full object-cover rounded-2xl"
            />
          ) : (
            <FiImage className="text-4xl text-white" />
          )}
        </Card>
      </div>

      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {selectedImage && (
        <div className="mt-8 mb-4">
          <button
            onClick={handleNext}
            className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-3xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default Customize;
