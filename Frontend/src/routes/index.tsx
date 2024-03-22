import { Route, Routes } from "react-router-dom";
import Main from "../pages/main";
import Auction from "../pages/Auction";
import Continent from "../pages/Continent";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/auction" element={<Auction />} />
      <Route path="/continent" element={<Continent />} />
    </Routes>
  );
};

export default AppRoutes;
