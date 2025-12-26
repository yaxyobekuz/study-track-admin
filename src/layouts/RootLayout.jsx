// Router
import { Outlet } from "react-router-dom";

// Components
import { Toaster } from "@/components/ui/sonner";

const RootLayout = () => {
  return (
    <div className="">
      <Outlet />
      <Toaster />
    </div>
  );
};

export default RootLayout;
