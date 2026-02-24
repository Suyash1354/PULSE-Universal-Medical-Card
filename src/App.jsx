import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PatientDashboard from "./pages/PatientDashboard";
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/patient" element={<PatientDashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;