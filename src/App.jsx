import { Routes, Route } from "react-router-dom";
import StartPage from "./pages/StartPage.jsx";
import CheckClient from "./pages/CheckClient.jsx";
import DashBoard from "./pages/DashBoard.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<StartPage />} />
      <Route path="/check-client" element={<CheckClient />} />
      <Route path="/dashboard" element={<DashBoard />} />
    </Routes>
  );
}

export default App;