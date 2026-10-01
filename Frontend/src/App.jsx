import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { checkAuth, setUnauthenticated } from "./authSlice";
import { useAuth } from "@clerk/clerk-react";
import { setClerkGetToken } from "./utils/axiosClient";
import { motion } from "framer-motion";

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
import SupportPage from "./pages/SupportPage";


// Guard Component for Admin Routes
const AdminRoute = () => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) return <div className="h-screen flex items-center justify-center bg-canvas"><span className="spinner-af text-ember-400"></span></div>;

  // Check if authenticated AND role is admin
  if (isAuthenticated && user?.role === 'admin') {
    return <Outlet />;
  }

  // Redirect if not admin
  return <Navigate to="/" replace />;
};

function App() {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const dispatch = useDispatch();

  // Tracks whether the initial session check already ran, so background
  // re-renders (e.g. Clerk refreshing its token helpers) never wipe the
  // page with the full-screen loader again.
  const checkedRef = useRef(false);
  const [booted, setBooted] = useState(false);
  useEffect(() => {
    if (isLoaded && !booted) setBooted(true);
  }, [isLoaded, booted]);

  // Sync Clerk auth state → axios token → Redux state.
  // checkAuth() fires exactly once per sign-in; the token getter is
  // re-synced on every change without re-dispatching.
  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) {
      setClerkGetToken(getToken);
      if (!checkedRef.current) {
        checkedRef.current = true;
        dispatch(checkAuth());
      }
    } else {
      checkedRef.current = false;
      setClerkGetToken(null);
      dispatch(setUnauthenticated());
    }
  }, [isLoaded, isSignedIn, getToken, dispatch]);

  if (!isLoaded || (!booted && isSignedIn && loading)) return <div className="h-screen flex items-center justify-center bg-canvas"><span className="loading loading-ring loading-lg text-ember-400"></span></div>;

  const PageTransition = ({ children }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
      <Route path="/login" element={!isAuthenticated ? <PageTransition><Login /></PageTransition> : <Navigate to="/" />} />
      <Route path="/signup" element={!isAuthenticated ? <PageTransition><Signup /></PageTransition> : <Navigate to="/" />} />
      <Route path="/forgot-password" element={!isAuthenticated ? <PageTransition><ForgotPassword /></PageTransition> : <Navigate to="/" />} />

      {/* Protected User Routes */}
      <Route path="/problems" element={isAuthenticated ? <PageTransition><Homepage /></PageTransition> : <Navigate to="/login" />} />
      <Route path="/problem/:id" element={isAuthenticated ? <PageTransition><ProblemPage /></PageTransition> : <Navigate to="/login" />} />
      <Route path="/dashboard" element={isAuthenticated ? <PageTransition><Dashboard /></PageTransition> : <Navigate to="/login" />} />
      <Route path="/profile" element={isAuthenticated ? <PageTransition><Profile /></PageTransition> : <Navigate to="/login" />} />
      <Route path="/bookmarks" element={isAuthenticated ? <PageTransition><BookmarksPage /></PageTransition> : <Navigate to="/login" />} />
      <Route path="/leaderboard" element={isAuthenticated ? <PageTransition><LeaderboardPage /></PageTransition> : <Navigate to="/login" />} />
      <Route path="/submissions" element={isAuthenticated ? <PageTransition><SubmissionsPage /></PageTransition> : <Navigate to="/login" />} />
      <Route path="/study-plans" element={isAuthenticated ? <PageTransition><StudyPlansPage /></PageTransition> : <Navigate to="/login" />} />
      <Route path="/study-plans/create" element={isAuthenticated ? <PageTransition><CreateStudyPlan /></PageTransition> : <Navigate to="/login" />} />
      <Route path="/study-plans/:planId" element={isAuthenticated ? <PageTransition><StudyPlanDetail /></PageTransition> : <Navigate to="/login" />} />
      <Route path="/contests" element={isAuthenticated ? <PageTransition><ContestsPage /></PageTransition> : <Navigate to="/login" />} />
      <Route path="/community" element={isAuthenticated ? <PageTransition><CommunityPage /></PageTransition> : <Navigate to="/login" />} />
      <Route path="/community/post/:id" element={isAuthenticated ? <PageTransition><DiscussionDetail /></PageTransition> : <Navigate to="/login" />} />
      <Route path="/support" element={isAuthenticated ? <PageTransition><SupportPage /></PageTransition> : <Navigate to="/login" />} />

      {/* Protected Admin Routes */}
      <Route path="/admin" element={<AdminRoute />}>
        <Route index element={<PageTransition><AdminDashboard /></PageTransition>} />
        <Route path="create" element={<PageTransition><ProblemForm /></PageTransition>} />
        <Route path="edit/:id" element={<PageTransition><ProblemForm /></PageTransition>} />
        <Route path="contest/create" element={<PageTransition><CreateContest /></PageTransition>} />
      </Route>

      {/* Catch all - Redirects to Home */}
      <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
    </Routes>
  );
}

export default App;