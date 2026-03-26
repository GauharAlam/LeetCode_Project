import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../authSlice';
import { useTheme } from '../contexts/ThemeContext';
import {
  LogOut, ShieldAlert, LayoutDashboard, UserCircle,
  ListChecks, Sun, Moon, Bookmark, Trophy, BookOpen,
  Swords, Menu, X, ChevronDown, FileCode2
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navLinks = [
    { path: '/problems', label: 'Problems' },
    { path: '/community', label: 'Community' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/study-plans', label: 'Study Plans' },
    { path: '/contests', label: 'Contests' },
  ];

  return (
    <nav className="sticky top-4 z-50 mx-4 md:mx-8 mb-4">
      <div className="bg-white/30 dark:bg-neutral-900/30 backdrop-blur-xl border border-white/20 dark:border-neutral-800/20 rounded-full px-4 md:px-6 py-2 shadow-lg flex items-center justify-between transition-all duration-500">

        {/* Left — Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img
            src="/algoforge-logo.png"
            alt="AlgoForge"
            className="h-8 w-8 rounded-full object-cover"
          />
          <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight hidden sm:inline">
            Algo<span className="text-gray-900 dark:text-white">Forge</span>
          </span>
        </Link>

        {/* Center — Nav Links (desktop) */}
        {isAuthenticated && (
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive(path)
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        )}

        {/* Right — Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle — half-circle icon like masterji */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full flex items-center justify-center border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-neutral-500 transition-all duration-200"
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {isAuthenticated ? (
            <>
              {/* Admin badge */}
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border border-gray-300 dark:border-gray-500 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800/20 transition-colors"
                >
                  <ShieldAlert size={14} />
                  Admin
                </Link>
              )}

              {/* User dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {user?.firstName?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <ChevronDown size={14} className={`text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-gray-200/50 dark:border-neutral-800/50 rounded-2xl shadow-lg py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User info */}
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-neutral-800">
                      <p className="text-xs text-gray-500 dark:text-gray-500">Signed in as</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user?.emailId || 'user@email.com'}
                      </p>
                    </div>

                    {/* Links */}
                    <div className="py-1">
                      {[
                        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                        { to: '/problems', icon: ListChecks, label: 'Problems' },
                        { to: '/bookmarks', icon: Bookmark, label: 'Saved Problems' },
                        { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
                        { to: '/contests', icon: Swords, label: 'Contests' },
                        { to: '/submissions', icon: FileCode2, label: 'Submissions' },
                        { to: '/study-plans', icon: BookOpen, label: 'Study Plans' },
                        { to: '/profile', icon: UserCircle, label: 'Profile' },
                      ].map(({ to, icon: Icon, label }) => (
                        <Link
                          key={to}
                          to={to}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                        >
                          <Icon size={16} className="text-gray-400 dark:text-gray-500" />
                          {label}
                        </Link>
                      ))}
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-100 dark:border-neutral-800 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-500/10 w-full transition-colors"
                      >
                        <LogOut size={16} />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </>
          ) : (
            /* Not authenticated */
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-1.5 rounded-full text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2 rounded-full text-sm font-semibold bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                Start
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile nav — slides down */}
      {isAuthenticated && mobileOpen && (
        <div className="md:hidden mt-2 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md border border-gray-200/50 dark:border-neutral-800/50 rounded-2xl px-4 py-3 shadow-sm transition-colors duration-300">
          <div className="flex flex-col gap-1">
            {navLinks.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive(path)
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800'
                }`}
              >
                {label}
              </Link>
            ))}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800/20 transition-colors"
              >
                <ShieldAlert size={14} />
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;