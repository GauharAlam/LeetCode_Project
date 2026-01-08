import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../authSlice';
import { useTheme } from '../contexts/ThemeContext';
import { LogOut, Code2, ShieldAlert, LayoutDashboard, UserCircle, ListChecks, Home, Sun, Moon, Bookmark, Trophy, BookOpen, Swords } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="navbar bg-gray-900/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 dark:border-gray-800 text-white px-4 md:px-8 sticky top-0 z-50">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl normal-case gap-2 text-white hover:bg-gray-800">
          <Code2 className="text-orange-500" />
          <span className="font-bold">LeetCode<span className="text-orange-500">Clone</span></span>
        </Link>
      </div>

      {isAuthenticated ? (
        <div className="flex-none gap-2">
          {/* Navigation Links */}
          <Link
            to="/"
            className={`btn btn-sm btn-ghost gap-2 ${isActive('/') ? 'text-orange-500' : 'text-gray-300 hover:text-white'}`}
          >
            <Home size={16} />
            <span className="hidden sm:inline">Home</span>
          </Link>

          <Link
            to="/problems"
            className={`btn btn-sm btn-ghost gap-2 ${isActive('/problems') ? 'text-orange-500' : 'text-gray-300 hover:text-white'}`}
          >
            <ListChecks size={16} />
            <span className="hidden sm:inline">Problems</span>
          </Link>

          <Link
            to="/dashboard"
            className={`btn btn-sm btn-ghost gap-2 ${isActive('/dashboard') ? 'text-orange-500' : 'text-gray-300 hover:text-white'}`}
          >
            <LayoutDashboard size={16} />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          {user?.role === 'admin' && (
            <Link to="/admin" className="btn btn-sm btn-outline btn-warning gap-2">
              <ShieldAlert size={16} />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="btn btn-sm btn-ghost btn-circle"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun size={18} className="text-yellow-400" />
            ) : (
              <Moon size={18} className="text-blue-400" />
            )}
          </button>

          {/* User Dropdown */}
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar placeholder">
              <div className="bg-gradient-to-br from-orange-500 to-purple-500 text-neutral-content rounded-full w-10">
                <span className="text-xl">{user?.firstName?.[0]?.toUpperCase() || 'U'}</span>
              </div>
            </label>
            <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-gray-800 rounded-box w-56 border border-gray-700">
              <li className="menu-title px-4 py-2">
                <span className="text-gray-400 text-xs">Signed in as</span>
                <span className="text-white font-medium truncate">{user?.emailId || 'user@email.com'}</span>
              </li>
              <div className="divider my-1"></div>
              <li>
                <Link to="/dashboard" className="hover:bg-gray-700">
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/problems" className="hover:bg-gray-700">
                  <ListChecks size={16} />
                  Problems
                </Link>
              </li>
              <li>
                <Link to="/bookmarks" className="hover:bg-gray-700">
                  <Bookmark size={16} />
                  Saved Problems
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="hover:bg-gray-700">
                  <Trophy size={16} />
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link to="/contests" className="hover:bg-gray-700">
                  <Swords size={16} />
                  Contests
                </Link>
              </li>
              <li>
                <Link to="/study-plans" className="hover:bg-gray-700">
                  <BookOpen size={16} />
                  Study Plans
                </Link>
              </li>
              <li>
                <Link to="/profile" className="justify-between hover:bg-gray-700">
                  <span className="flex items-center gap-2">
                    <UserCircle size={16} />
                    Profile
                  </span>
                  <span className="badge badge-sm badge-primary">{user?.role}</span>
                </Link>
              </li>
              <div className="divider my-1"></div>
              <li>
                <a onClick={handleLogout} className="text-red-400 hover:bg-gray-700 hover:text-red-300">
                  <LogOut size={16} />
                  Log Out
                </a>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="flex-none gap-2">
          {/* Theme Toggle for non-auth users */}
          <button
            onClick={toggleTheme}
            className="btn btn-sm btn-ghost btn-circle"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun size={18} className="text-yellow-400" />
            ) : (
              <Moon size={18} className="text-blue-400" />
            )}
          </button>
          <Link to="/login" className="btn btn-sm btn-ghost text-gray-300 hover:text-white">
            Log In
          </Link>
          <Link to="/signup" className="btn btn-sm bg-orange-500 hover:bg-orange-600 text-white border-none">
            Sign Up
          </Link>
        </div>
      )}
    </div>
  );
};

export default Navbar;