import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useClerk } from '@clerk/clerk-react';
import {
  LogOut, ShieldAlert, LayoutDashboard, UserCircle,
  ListChecks, Bookmark, Trophy, BookOpen,
  Swords, Menu, X, ChevronDown, FileCode2, HelpCircle
} from 'lucide-react';


const Navbar = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { signOut } = useClerk();

  const handleLogout = async () => {
    await signOut();
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

  // Get user initials for avatar
  const getInitials = () => {
    const first = user?.firstName?.[0] || '';
    const last = user?.lastName?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-surface border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Left — Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <img
              src="/algoforge-logo.png"
              alt="AlgoForge"
              className="h-7 w-7 rounded-lg object-cover"
            />
            <span className="text-base font-bold text-text-primary tracking-tight hidden sm:inline font-display">
              Algo<span className="text-ember-400">Forge</span>
            </span>
          </Link>

          {/* Center — Nav Links (desktop) */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`relative px-4 py-4 text-sm font-medium transition-colors duration-200 ${isActive(path)
                      ? 'text-text-primary'
                      : 'text-text-secondary hover:text-text-primary'
                    }`}
                >
                  {label}
                  {/* Active indicator — 2px ember bottom border */}
                  {isActive(path) && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-ember-400 rounded-full" />
                  )}
                </Link>
              ))}
            </div>
          )}

          {/* Right — Actions */}
          <div className="flex items-center gap-2">

            {isAuthenticated ? (
              <>
                {/* Admin badge */}
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-steel-500/10 border border-steel-500/20 text-steel-300 hover:bg-steel-500/15 transition-colors"
                  >
                    <ShieldAlert size={13} />
                    Admin
                  </Link>
                )}

                {/* User dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
                    className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-elevated transition-colors"
                  >
                    {/* Avatar — initials on ember bg */}
                    <div className="w-8 h-8 rounded-lg bg-ember-600 flex items-center justify-center">
                      <span className="text-xs font-bold text-text-primary">
                        {getInitials()}
                      </span>
                    </div>
                    <ChevronDown size={14} className={`text-text-muted transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-surface border border-border-subtle rounded-xl shadow-lg shadow-black/20 py-2 animate-fade-in-up">
                      {/* User info */}
                      <div className="px-4 py-2 border-b border-border-subtle">
                        <p className="text-xs text-text-muted">Signed in as</p>
                        <p className="text-sm font-medium text-text-primary truncate">
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
                          { to: '/support', icon: HelpCircle, label: 'Help & Support' },
                        ].map(({ to, icon: Icon, label }) => (
                          <Link
                            key={to}
                            to={to}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-elevated hover:text-text-primary transition-colors"
                          >
                            <Icon size={16} className="text-text-muted" />
                            {label}
                          </Link>
                        ))}
                      </div>

                      {/* Logout */}
                      <div className="border-t border-border-subtle pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-elevated hover:text-text-primary w-full transition-colors"
                        >
                          <LogOut size={16} className="text-text-muted" />
                          Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile menu toggle */}
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-text-secondary hover:bg-elevated transition-colors"
                >
                  {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
              </>
            ) : (
              /* Not authenticated */
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-1.5 rounded-control text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="btn-ember px-5 py-2 text-sm font-semibold"
                >
                  Start Forging
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {isAuthenticated && mobileOpen && (
        <div className="md:hidden border-t border-border-subtle bg-surface">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(path)
                    ? 'bg-elevated text-ember-400'
                    : 'text-text-secondary hover:bg-elevated hover:text-text-primary'
                  }`}
              >
                {label}
              </Link>
            ))}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-steel-300 hover:bg-elevated transition-colors"
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