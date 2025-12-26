// Pages
import Home from "./pages/Home";

// Layouts
import RootLayout from "./layouts/RootLayout";

// Router
import { Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Home />} />
      </Route>
    </Routes>
  );
};

export default App;
