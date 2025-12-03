import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../authSlice';
import { LogOut, User, Code2, ShieldAlert } from 'lucide-react';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <div className="navbar bg-gray-900 border-b border-gray-800 text-white px-4 md:px-8">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl normal-case gap-2 text-white hover:bg-gray-800">
          <Code2 className="text-orange-500" />
          <span className="font-bold">LeetCode<span className="text-orange-500">Clone</span></span>
        </Link>
      </div>
      <div className="flex-none gap-4">
        {user?.role === 'admin' && (
          <Link to="/admin" className="btn btn-sm btn-outline btn-warning gap-2">
            <ShieldAlert size={16} />
            Admin Panel
          </Link>
        )}
        
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle avatar placeholder">
            <div className="bg-gray-700 text-neutral-content rounded-full w-10">
              <span className="text-xl">{user?.firstName?.[0]?.toUpperCase() || 'U'}</span>
            </div>
          </label>
          <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-gray-800 rounded-box w-52 border border-gray-700">
            <li>
              <a className="justify-between hover:bg-gray-700">
                Profile
                <span className="badge badge-sm badge-primary">{user?.role}</span>
              </a>
            </li>
            <li><a onClick={handleLogout} className="text-red-400 hover:bg-gray-700 hover:text-red-300">Logout</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;