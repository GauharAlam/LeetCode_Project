import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { checkAuth } from "./authSlice";

// Pages
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import ProblemForm from "./pages/ProblemForm";
import ProblemPage from "./pages/ProblemPage"; // Import the new page

// Guard Component for Admin Routes
const AdminRoute = () => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-950"><span className="loading loading-spinner text-primary"></span></div>;
  
  // Check if authenticated AND role is admin
  if (isAuthenticated && user?.role === 'admin') {
    return <Outlet />;
  }

  // Redirect if not admin
  return <Navigate to="/" replace />;
};

function App(){
  const {isAuthenticated, loading} = useSelector((state)=>state.auth);
  const dispatch = useDispatch();

  useEffect(()=>{
    dispatch(checkAuth());
  },[dispatch]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-950"><span className="loading loading-ring loading-lg text-primary"></span></div>;

  return(
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={!isAuthenticated ? <Login/> : <Navigate to="/"/>} />
      <Route path="/signup" element={!isAuthenticated ? <Signup/> : <Navigate to="/"/>} />

      {/* Protected User Routes */}
      <Route path="/" element={isAuthenticated ? <Homepage/> : <Navigate to="/login"/>} />
      
      {/* THIS IS THE MISSING ROUTE */}
      <Route path="/problem/:id" element={isAuthenticated ? <ProblemPage/> : <Navigate to="/login"/>} />

      {/* Protected Admin Routes */}
      <Route path="/admin" element={<AdminRoute />}>
        <Route index element={<AdminDashboard />} />
        <Route path="create" element={<ProblemForm />} />
        <Route path="edit/:id" element={<ProblemForm />} />
      </Route>

      {/* Catch all - Redirects to Home */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App;