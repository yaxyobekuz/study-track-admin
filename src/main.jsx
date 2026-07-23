// Styles
import "animate.css";
import "./styles/scrollbars.css";
import "./styles/index.css";

// Toaster
import { Toaster } from "sonner";

// Routes
import Routes from "@/app/routes.jsx";

// Modal (Context)
import { ModalProvider } from "@/features/modal";

// React
import { createRoot } from "react-dom/client";

// Router
import { BrowserRouter } from "react-router-dom";

// TanStack Query
import queryClient from "@/app/query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <ModalProvider>
        <Routes />

        <Toaster
          richColors
          position="top-right"
          offset={{ top: 24 }}
          mobileOffset={{ top: 24 }}
        />
      </ModalProvider>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </BrowserRouter>,
);
