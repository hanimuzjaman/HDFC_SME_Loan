import { Routes, Route } from "react-router-dom";
import StartPage from "./pages/StartPage.jsx";
import CheckClient from "./pages/CheckClient.jsx";
import DashBoard from "./pages/DashBoard.jsx";
import UserNotFound from "./pages/UserNotFound.jsx"; 
import KYC_Upload from "./pages/Documents/KYC_Upload.jsx"; 
import BusinessProofUpload from "./pages/Documents/BusinessProofPage.jsx";
import IncomeProofPage from "./pages/Documents/IncomeProofPage.jsx";


function App() {
  return (
    <Routes>
      <Route path="/" element={<StartPage />} />
      <Route path="/check-client" element={<CheckClient />} />
      <Route path="/dashboard" element={<DashBoard />} />
      <Route path="/UserNotFound" element={<UserNotFound />} />
      <Route path="/kyc-upload" element={<KYC_Upload />} />
      <Route path="/business-proof-upload" element={<BusinessProofUpload />} />
      <Route path="/income-proof-upload" element={<IncomeProofPage />} />
    </Routes>
  );
}

export default App;