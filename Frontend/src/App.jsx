import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { checkAuth } from "./authSlice";

// Pages
import LandingPage from "./pages/LandingPage";
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import AdminDashboard from "./pages/AdminDashboard";
import ProblemForm from "./pages/ProblemForm";
import ProblemPage from "./pages/ProblemPage";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import BookmarksPage from "./pages/BookmarksPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import StudyPlansPage from "./pages/StudyPlansPage";
import StudyPlanDetail from "./pages/StudyPlanDetail";
import CreateStudyPlan from "./pages/CreateStudyPlan";
import ContestsPage from "./pages/ContestsPage";
import CreateContest from "./pages/CreateContest";
import CommunityPage from "./pages/CommunityPage";
import DiscussionDetail from "./pages/DiscussionDetail";
import NotFound from "./pages/NotFound";
import SubmissionsPage from "./pages/SubmissionsPage";

// Guard Component for Admin Routes
const AdminRoute = () => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950"><span className="loading loading-spinner text-primary"></span></div>;

  // Check if authenticated AND role is admin
  if (isAuthenticated && user?.role === 'admin') {
    return <Outlet />;
  }

  // Redirect if not admin
  return <Navigate to="/" replace />;
};

function App() {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950"><span className="loading loading-ring loading-lg text-primary"></span></div>;

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
      <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/" />} />
      <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/" />} />

      {/* Protected User Routes */}
      <Route path="/problems" element={isAuthenticated ? <Homepage /> : <Navigate to="/login" />} />
      <Route path="/problem/:id" element={isAuthenticated ? <ProblemPage /> : <Navigate to="/login" />} />
      <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
      <Route path="/bookmarks" element={isAuthenticated ? <BookmarksPage /> : <Navigate to="/login" />} />
      <Route path="/leaderboard" element={isAuthenticated ? <LeaderboardPage /> : <Navigate to="/login" />} />
      <Route path="/submissions" element={isAuthenticated ? <SubmissionsPage /> : <Navigate to="/login" />} />
      <Route path="/study-plans" element={isAuthenticated ? <StudyPlansPage /> : <Navigate to="/login" />} />
      <Route path="/study-plans/create" element={isAuthenticated ? <CreateStudyPlan /> : <Navigate to="/login" />} />
      <Route path="/study-plans/:planId" element={isAuthenticated ? <StudyPlanDetail /> : <Navigate to="/login" />} />
      <Route path="/contests" element={isAuthenticated ? <ContestsPage /> : <Navigate to="/login" />} />
      <Route path="/community" element={isAuthenticated ? <CommunityPage /> : <Navigate to="/login" />} />
      <Route path="/community/post/:id" element={isAuthenticated ? <DiscussionDetail /> : <Navigate to="/login" />} />

      {/* Protected Admin Routes */}
      <Route path="/admin" element={<AdminRoute />}>
        <Route index element={<AdminDashboard />} />
        <Route path="create" element={<ProblemForm />} />
        <Route path="edit/:id" element={<ProblemForm />} />
        <Route path="contest/create" element={<CreateContest />} />
      </Route>

      {/* Catch all - Redirects to Home */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App;