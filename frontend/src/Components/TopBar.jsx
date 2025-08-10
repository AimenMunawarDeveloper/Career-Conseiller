import React from "react";
import { IoSearchOutline } from "react-icons/io5";
import { useApp } from "../Context/AppContext";
import { FaUserCircle } from "react-icons/fa";
import { RxHamburgerMenu } from "react-icons/rx";

export default function TopBar() {
  const { user } = useApp();
  const { toggleSidebar } = useApp();

  return (
    <div className="h-16 w-full bg-purple-500 border-b-2 border-black flex items-center justify-between px-4 md:px-6 lg:px-8">
      <div className="flex items-center gap-3 md:gap-6 flex-1 max-w-md">
        <RxHamburgerMenu
          className="cursor-pointer text-xl md:text-2xl hover:text-purple-200 transition-colors duration-200"
          onClick={() => toggleSidebar()}
        />
        <div className="flex items-center gap-2 border-2 border-black rounded-md p-2 flex-1">
          <IoSearchOutline className="text-lg md:text-xl" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none text-white placeholder-white/70 text-sm md:text-base flex-1"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <FaUserCircle className="text-2xl md:text-3xl" />
        <div className="hidden sm:block">
          <h2 className="text-sm md:text-base font-medium">{user?.username}</h2>
          <h4 className="text-xs md:text-sm text-white/80">{user?.email}</h4>
        </div>
      </div>
    </div>
  );
}
