import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";

import Logo from "../assets/logo.svg"

const NavBar = () => {
  const { isConnected } = useAccount();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isConnected) {
      navigate("/");
    }
  }, [isConnected]);

  return (
    <>
      <div className="w-full h-16 shadow-md fixed flex justify-between items-center  bg-white px-6 top-0">
        <img src={Logo} className="w-8"/>

        <div className="flex  gap-10">
          <h1 className="cursor-pointer" onClick={() => navigate("/")}>Home</h1>
          <h1 className="cursor-pointer" onClick={() => navigate("/continent")}>Continents</h1>
          <h1 className="cursor-pointer" onClick={() => navigate("/auction")}>Auctions</h1>
        </div>
      </div>
    </>
  );
};

export default NavBar;
