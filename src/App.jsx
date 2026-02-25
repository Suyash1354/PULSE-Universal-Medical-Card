import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import PharmacistDashboard from "./pages/PharmacistDashboard";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"            element={<HomePage />} />
        <Route path="/patient"     element={<PatientDashboard />} />
        <Route path="/doctor"      element={<DoctorDashboard />} />
        <Route path="/pharmacist"  element={<PharmacistDashboard />} />
        {/* Catch all unknown routes → back to home */}
        <Route path="*"            element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;