// Styles
import "./styles/index.css";

// Components
import App from "./App.jsx";

// Store (Redux)
import store from "./store";
import { Provider } from "react-redux";

// React
import { createRoot } from "react-dom/client";

// Router
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>
);
