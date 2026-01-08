import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axiosClient from '../utils/axiosClient';
import { useSelector, useDispatch } from 'react-redux';
import { checkAuth } from '../authSlice';
import {
    User,
    Mail,
    Shield,
    Edit3,
    Save,
    X,
    MapPin,
    Building2,
    Briefcase,
    GraduationCap,
    Globe,
    Github,
    Linkedin,
    Twitter,
    Youtube,
    Instagram,
    Code2,
    FileText
} from 'lucide-react';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [saving, setSaving] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await axiosClient.get('/problem/profile');
            setProfile(data);
            setEditData(data);
        } catch (err) {
            console.error("Failed to fetch profile", err);
            setError("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setEditData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data } = await axiosClient.put('/problem/profile', editData);
            setProfile(data);
            setIsEditing(false);
            // Refresh auth state to update navbar
            dispatch(checkAuth());
        } catch (err) {
            console.error("Failed to update profile", err);
            setError("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditData(profile);
        setIsEditing(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0d1117] text-gray-300">
                <Navbar />
                <div className="flex items-center justify-center h-[80vh]">
                    <span className="loading loading-spinner loading-lg text-blue-500"></span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0d1117] text-gray-300">
                <Navbar />
                <div className="flex items-center justify-center h-[80vh]">
                    <p className="text-red-400">{error}</p>
                </div>
            </div>
        );
    }

    const InfoField = ({ label, value, icon: Icon, field, placeholder }) => (
        <div className="space-y-1">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Icon className="w-4 h-4" />
                <span>{label}</span>
            </div>
            {isEditing ? (
                <input
                    type="text"
                    value={editData[field] || ''}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    placeholder={placeholder || `Enter ${label.toLowerCase()}`}
                    className="w-full bg-[#0d1117] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
            ) : (
                <p className="text-white">{value || 'N/A'}</p>
            )}
        </div>
    );

    const SocialField = ({ label, value, icon: Icon, field, placeholder }) => (
        <div className="flex items-center gap-4 p-3 bg-[#0d1117] rounded-lg border border-gray-800">
            <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                <Icon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex-1">
                <p className="text-xs text-gray-500">{label}</p>
                {isEditing ? (
                    <input
                        type="text"
                        value={editData[field] || ''}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                        placeholder={placeholder || `Enter ${label} URL`}
                        className="w-full bg-transparent border-b border-gray-700 py-1 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm"
                    />
                ) : (
                    <p className="text-white text-sm truncate">{value || 'N/A'}</p>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0d1117] text-gray-300 font-sans">
            <Navbar />

            <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">My Profile</h1>
                        <p className="text-gray-500 mt-1">Manage your account and settings</p>
                    </div>
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#161b22] border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            <Edit3 className="w-4 h-4" />
                            Edit
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={handleCancel}
                                className="flex items-center gap-2 px-4 py-2 bg-[#161b22] border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {saving ? (
                                    <span className="loading loading-spinner loading-sm"></span>
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                Save
                            </button>
                        </div>
                    )}
                </div>

                {/* Profile Card */}
                <div className="bg-[#161b22] rounded-xl border border-gray-800 p-6 mb-6">
                    <div className="flex items-center gap-6">
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
                            {profile?.firstName?.[0]?.toUpperCase() || 'U'}
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                {isEditing ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={editData.firstName || ''}
                                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                                            placeholder="First Name"
                                            className="bg-[#0d1117] border border-gray-700 rounded-lg px-3 py-1 text-white text-xl font-bold focus:outline-none focus:border-blue-500"
                                        />
                                        <input
                                            type="text"
                                            value={editData.lastName || ''}
                                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                                            placeholder="Last Name"
                                            className="bg-[#0d1117] border border-gray-700 rounded-lg px-3 py-1 text-white text-xl font-bold focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                ) : (
                                    <h2 className="text-2xl font-bold text-white">
                                        {profile?.firstName} {profile?.lastName}
                                    </h2>
                                )}
                            </div>
                            <p className="text-gray-500 text-sm mb-1">@{profile?.emailId?.split('@')[0]}</p>
                            <p className="text-gray-400 text-sm">{profile?.emailId}</p>
                        </div>

                        {/* Role Badge */}
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30">
                            <Shield className="w-4 h-4 text-blue-400" />
                            <span className="text-blue-400 text-sm font-medium uppercase">{profile?.role}</span>
                        </div>
                    </div>
                </div>

                {/* Personal Information */}
                <div className="bg-[#161b22] rounded-xl border border-gray-800 p-6 mb-6">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-400" />
                        Personal Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InfoField
                            label="Full Name"
                            value={`${profile?.firstName || ''} ${profile?.lastName || ''}`.trim()}
                            icon={User}
                            field="firstName"
                            placeholder="First Name"
                        />
                        <InfoField
                            label="Username"
                            value={`@${profile?.emailId?.split('@')[0] || 'unknown'}`}
                            icon={User}
                            field="username"
                        />
                        <InfoField
                            label="Email"
                            value={profile?.emailId}
                            icon={Mail}
                            field="emailId"
                        />
                        <InfoField
                            label="Role"
                            value={profile?.role?.toUpperCase()}
                            icon={Shield}
                            field="role"
                        />
                        <InfoField
                            label="Bio"
                            value={profile?.bio}
                            icon={FileText}
                            field="bio"
                            placeholder="Tell us about yourself"
                        />
                    </div>
                </div>

                {/* Social Information */}
                <div className="bg-[#161b22] rounded-xl border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-purple-400" />
                        Social Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <SocialField
                            label="Location"
                            value={profile?.location}
                            icon={MapPin}
                            field="location"
                            placeholder="City, Country"
                        />
                        <SocialField
                            label="Company"
                            value={profile?.company}
                            icon={Building2}
                            field="company"
                            placeholder="Your company"
                        />
                        <SocialField
                            label="Job Title"
                            value={profile?.jobTitle}
                            icon={Briefcase}
                            field="jobTitle"
                            placeholder="Software Engineer"
                        />
                        <SocialField
                            label="Institution"
                            value={profile?.institution}
                            icon={GraduationCap}
                            field="institution"
                            placeholder="University/College"
                        />
                        <SocialField
                            label="Website"
                            value={profile?.website}
                            icon={Globe}
                            field="website"
                            placeholder="https://yourwebsite.com"
                        />
                        <SocialField
                            label="GitHub"
                            value={profile?.github}
                            icon={Github}
                            field="github"
                            placeholder="https://github.com/username"
                        />
                        <SocialField
                            label="LinkedIn"
                            value={profile?.linkedin}
                            icon={Linkedin}
                            field="linkedin"
                            placeholder="https://linkedin.com/in/username"
                        />
                        <SocialField
                            label="Twitter / X"
                            value={profile?.twitter}
                            icon={Twitter}
                            field="twitter"
                            placeholder="https://twitter.com/username"
                        />
                        <SocialField
                            label="YouTube"
                            value={profile?.youtube}
                            icon={Youtube}
                            field="youtube"
                            placeholder="https://youtube.com/@channel"
                        />
                        <SocialField
                            label="Instagram"
                            value={profile?.instagram}
                            icon={Instagram}
                            field="instagram"
                            placeholder="https://instagram.com/username"
                        />
                        <SocialField
                            label="LeetCode"
                            value={profile?.leetcode}
                            icon={Code2}
                            field="leetcode"
                            placeholder="https://leetcode.com/username"
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
