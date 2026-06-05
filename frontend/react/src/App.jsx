import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import MissionDetailPage from "./pages/MissionDetailPage";
import MissionExamPage from "./pages/MissionExamPage";
import MissionsPage from "./pages/MissionsPage";
import PassContentPage from "./pages/PassContentPage";
import RoomsPage from "./pages/RoomsPage";
import RoomDetailPage from "./pages/RoomDetailPage";
import PlansPage from "./pages/PlansPage";
import PlanDetailPage from "./pages/PlanDetailPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ProfilePage from "./pages/ProfilePage";
import SelfStudyPage from "./pages/SelfStudyPage";
import QuestionDetailPage from "./pages/QuestionDetailPage";
import CoursesPage from "./pages/CoursesPage";
import CoursePage from "./pages/CoursePage";
import LessonPage from "./pages/LessonPage";

export default function App() {
  const location = useLocation();

  useEffect(() => {
    document.body.classList.toggle("self-study-body", true);
    return () => {
      document.body.classList.remove("self-study-body");
    };
  }, [location.pathname]);

  return (
    <>
      <Routes>
        {/* Root */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Auth */}
        <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
        <Route path="/auth/:mode" element={<AuthPage />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* ── Missions ── */}
        <Route path="/missions" element={<MissionsPage />} />
        <Route path="/missions/:slug" element={<MissionDetailPage />} />
        <Route path="/missions/:slug/passes/:passId" element={<PassContentPage />} />
        <Route path="/missions/:slug/exam" element={<MissionExamPage />} />

        {/* Rooms / Plans / Courses */}
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/rooms/:slug" element={<RoomDetailPage />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/plans/:slug" element={<PlanDetailPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:slug" element={<CoursePage />} />
        <Route path="/courses/:slug/lessons/:lessonId" element={<LessonPage />} />

        {/* Community */}
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Labs */}
        <Route path="/self-study" element={<SelfStudyPage />} />
        <Route path="/self-study/question/:id" element={<QuestionDetailPage />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}
