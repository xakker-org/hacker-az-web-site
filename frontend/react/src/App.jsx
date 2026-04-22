import { Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import ExamAttemptPage from "./pages/ExamAttemptPage";

export default function App() {
  return (
    <>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Auth Pages */}
        <Route path="/auth/:mode" element={<AuthPage />} />
        <Route path="/auth/login" element={<AuthPage />} />
        <Route path="/auth/register" element={<AuthPage />} />
        
        {/* Dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/exams/:slug" element={<ExamAttemptPage />} />
        <Route path="/exams/:slug" element={<ExamAttemptPage />} />
        
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
