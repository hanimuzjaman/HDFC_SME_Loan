import { Routes, Route } from "react-router-dom";
import StartPage from "./pages/StartPage.jsx";
import CheckClient from "./pages/CheckClient.jsx";
import DashBoard from "./pages/DashBoard.jsx";
import UserNotFound from "./pages/UserNotFound.jsx";  

function App() {
  return (
    <Routes>
      <Route path="/" element={<StartPage />} />
      <Route path="/check-client" element={<CheckClient />} />
      <Route path="/dashboard" element={<DashBoard />} />
      <Route path="/UserNotFound" element={<UserNotFound />} />
    </Routes>
  );
}

export default App;