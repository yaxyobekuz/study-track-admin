// Router
import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <div className="bg-gray-100">
      <Outlet />
    </div>
  );
};

export default RootLayout;
