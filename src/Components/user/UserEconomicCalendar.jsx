import React, { useState } from "react";
import Loader from "../../Components/Loader/Loader";
import ModernHeading from "../lib/ModernHeading";
import { FloatingParticles } from "../../utils/FloatingParticles";
import { AnimatedGrid } from "../../utils/AnimatedGrid";
export default function UserEconomicCalendar() {
  const [loading, setLoading] = useState(true);

  // <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 p-10 min-h-screen"></div>

  return (
    <div className="h-screen w-full mx-auto bg-gradient-to-br from-gray-900 via-black to-gray-900
 p-10 min-h-screen">
        <AnimatedGrid />

            <FloatingParticles/>

      <div className="py-2 mb-4">
        <ModernHeading text={"Economic Calendar"}></ModernHeading>
      </div>
      <div className="w-full flex flex-col items-center h-full relative">
        {loading && (
          <div className="h-screen -mt-5 w-full flex justify-center items-center">
            <Loader />
          </div>
        )}
        <div className="w-full h-full bg-secondary-800/10 p-4 shadow-4xl rounded-2xl flex flex-col justify-center items-center">
          <iframe
            src="https://s.tradingview.com/embed-widget/events/?locale=en#%7B%22width%22%3A%22100%25%22%2C%22height%22%3A%22%22%2C%22isTransparent%22%3Atrue%2C%22colorTheme%22%3A%22dark%22%2C%22importanceFilter%22%3A%22-1%2C0%2C1%22%7D"
            width="100%"
            height="100%"
            className="w-full h-full rounded-xl"
            title="Forex Market Economic Calendar"
            onLoad={() => setLoading(false)}
          ></iframe>
        </div>
      </div>
    </div>
  );
}
