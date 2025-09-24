import React from "react";
import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

const Header = () => {

  const navigate = useNavigate();

  
  return (
    <header className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-indigo-900 py-8 text-white  sticky top-0 z-50 w-full">

         <Sidebar />
      <div className="flex items-center justify-between px-6 py-4">
        {/* Title Centered */}
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-light mx-auto  text-center relative w-full">
          <span>📈 Forex SuperAdmin Dashboard</span>
          <div className="border-b border-white/30 w-24 mx-auto mt-1"></div>
        </h1>

        {/* User Actions (Optional) */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-4">
          <button className="hover:text-gray-300 transition">
            <User size={20} />
          </button>
          <button className="hover:text-gray-300 transition" onClick={()=>navigate("/authentication")}>
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
