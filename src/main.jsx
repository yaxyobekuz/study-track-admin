// Styles
import "./styles/index.css";

// Components
import App from "./App.jsx";

// React
import { createRoot } from "react-dom/client";

// Router
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
