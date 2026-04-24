import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import ExamAttemptPage from "./pages/ExamAttemptPage";
import RoomsPage from "./pages/RoomsPage";
import RoomDetailPage from "./pages/RoomDetailPage";
import PlansPage from "./pages/PlansPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import BadgesPage from "./pages/BadgesPage";
import ProfilePage from "./pages/ProfilePage";
import ExamsPage from "./pages/ExamsPage";
import SelfStudyPage from "./pages/SelfStudyPage";
import QuestionDetailPage from "./pages/QuestionDetailPage";

export default function App() {
  const location = useLocation();

  useEffect(() => {
    document.body.classList.toggle("self-study-body", location.pathname !== "/");
    return () => {
      document.body.classList.remove("self-study-body");
    };
  }, [location.pathname]);

  return (
    <>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Auth Pages */}
        <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
        <Route path="/auth/:mode" element={<AuthPage />} />
        
        {/* Dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/exams/:slug" element={<ExamAttemptPage />} />
        <Route path="/exams/:slug" element={<ExamAttemptPage />} />
        <Route path="/exams" element={<ExamsPage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/rooms/:slug" element={<RoomDetailPage />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/badges" element={<BadgesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/self-study" element={<SelfStudyPage />} />
        <Route path="/self-study/question/:id" element={<QuestionDetailPage />} />
        
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
