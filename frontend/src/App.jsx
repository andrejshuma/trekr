import { Navigate, Route, Routes } from "react-router-dom";

import LandingPage from "./pages/LandingPage/LandingPage.jsx";
import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";
import DashboardLayout from "./pages/Dashboard/DashboardLayout.jsx";
import ControlCenter from "./pages/Dashboard/pages/ControlCenter/ControlCenter.jsx";
import Training from "./pages/Dashboard/pages/Training/Training.jsx";
import TrainingTracking from "./pages/Dashboard/pages/Training/TrainingTracking.jsx";
import NewTrainingSession from "./pages/Dashboard/pages/Training/NewTrainingSession.jsx";
import Weight from "./pages/Dashboard/pages/Weight/Weight.jsx";
import Finance from "./pages/Dashboard/pages/Finance/Finance.jsx";
import Investing from "./pages/Dashboard/pages/Investing/Investing.jsx";
import InvestingTracking from "./pages/Dashboard/pages/Investing/InvestingTracking.jsx";
import NewInvestment from "./pages/Dashboard/pages/Investing/NewInvestment.jsx";
import Discipline from "./pages/Dashboard/pages/Discipline/Discipline.jsx";

function RequireAuth({ children }) {
  const token = localStorage.getItem("authToken");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <div data-theme="forest" className="min-h-screen w-full">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="control-center" replace />} />
          <Route path="control-center" element={<ControlCenter />} />
          <Route path="training" element={<Training />} />
          <Route path="training/tracking" element={<TrainingTracking />} />
          <Route
            path="training/sessions/new"
            element={<NewTrainingSession />}
          />
          <Route path="weight" element={<Weight />} />
          <Route path="finance" element={<Finance />} />
          <Route path="investing" element={<Investing />} />
          <Route path="investing/tracking" element={<InvestingTracking />} />
          <Route path="investing/assets/new" element={<NewInvestment />} />
          <Route path="discipline" element={<Discipline />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
