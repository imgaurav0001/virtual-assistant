import React from "react";

function Card({ image, children, onClick, selected }) {
  return (
    <div
      onClick={onClick}
      className={`
        w-[120px] h-[170px] 
        bg-gradient-to-br from-purple-500/20 to-pink-500/20 
        rounded-2xl overflow-hidden shadow-md 
        border-4 ${selected ? "border-purple-500" : "border-transparent"} 
        ${selected ? "scale-100 shadow-md" : "hover:scale-110 hover:shadow-[0_0_20px_rgba(168,85,247,0.7)] hover:border-purple-500 transition-all duration-300 ease-in-out"}
        cursor-pointer 
        flex items-center justify-center text-white text-4xl font-bold
        backdrop-blur-sm
      `}
    >
      {image ? (
        <img
          src={image}
          alt="Assistant"
          className="w-full h-full object-cover rounded-2xl"
        />
      ) : (
        children
      )}
    </div>
  );
}

export default Card;
