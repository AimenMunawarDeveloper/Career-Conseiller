import React from "react";
import { IoSearchOutline } from "react-icons/io5";
import { useApp } from "../Context/AppContext";
import { FaUserCircle } from "react-icons/fa";
import { RxHamburgerMenu } from "react-icons/rx";

export default function TopBar() {
  const { user } = useApp();
  const { isOpen, toggleSidebar } = useApp();
  console.log(user);
  return (
    <div className="h-16 w-full bg-purple-500 border-b-2 border-black flex items-center justify-between px-10">
      <div className="flex items-center gap-6 w-1/2">
        {" "}
        <RxHamburgerMenu
          className="cursor-pointer text-2xl"
          onClick={() => toggleSidebar()}
        />
        <div className="flex items-center gap-2 border-2 border-black rounded-md p-2">
          <IoSearchOutline />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent outline-none text-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <FaUserCircle className="text-3xl" />
        <div>
          {" "}
          <h2>{user?.username}</h2>
          <h4>{user?.email}</h4>
        </div>
      </div>
    </div>
  );
}
