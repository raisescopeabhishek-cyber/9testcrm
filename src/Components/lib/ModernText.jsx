import React from "react";

export default function ModernText({ text }) {
  return (
    <div>
      <h1
        className="font-bold text-lg sm:text-xl md:text-2xl text-transparent bg-clip-text 
                     bg-gradient-to-r from-gray-200 to-secondary-500 relative"
      >
        {text}
      </h1>
    </div>
  );
}
