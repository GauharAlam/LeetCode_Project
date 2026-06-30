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
            <div className="min-h-screen bg-canvas">
                <Navbar />
                <div className="flex items-center justify-center h-[80vh]">
                    <span className="loading loading-spinner loading-lg text-ember-400"></span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-canvas">
                <Navbar />
                <div className="flex items-center justify-center h-[80vh]">
                    <p className="text-text-muted">{error}</p>
                </div>
            </div>
        );
    }

    const getInitials = () => {
        const first = profile?.firstName?.[0] || '';
        const last = profile?.lastName?.[0] || '';
        return (first + last).toUpperCase() || 'U';
    };

    const InfoField = ({ label, value, icon: Icon, field, placeholder }) => (
        <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-text-muted text-xs font-mono uppercase tracking-wide">
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
            </div>
            {isEditing && field !== 'username' && field !== 'role' && field !== 'emailId' ? (
                <input
                    type="text"
                    value={editData[field] || ''}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    placeholder={placeholder || `Enter ${label.toLowerCase()}`}
                    className="input-af py-2 px-3 text-sm"
                />
            ) : (
                <p className="text-text-primary text-sm font-medium pl-1">{value || 'N/A'}</p>
            )}
        </div>
    );

    const SocialField = ({ label, value, icon: Icon, field, placeholder }) => (
        <div className="flex items-center gap-4 p-3 bg-inset rounded-control border border-border-subtle">
            <div className="w-10 h-10 rounded-lg bg-surface border border-border-subtle flex items-center justify-center text-text-muted">
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] micro-label text-text-muted">{label}</p>
                {isEditing ? (
                    <input
                        type="text"
                        value={editData[field] || ''}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                        placeholder={placeholder || `Enter ${label} URL`}
                        className="w-full bg-transparent border-b border-border-subtle/50 py-1 text-text-primary focus:outline-none focus:border-ember-400 transition-colors text-sm"
                    />
                ) : (
                    <p className="text-text-primary text-sm font-medium truncate">{value || 'N/A'}</p>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-canvas text-text-primary">
            <Navbar />

            <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 border-b border-border-subtle pb-4">
                    <div>
                        <h1 className="text-3xl font-bold font-display text-text-primary">My Profile</h1>
                        <p className="text-text-secondary text-sm">Manage your account and settings</p>
                    </div>
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="btn-secondary-af px-4 py-2 text-sm flex items-center gap-2"
                        >
                            <Edit3 className="w-4 h-4 text-text-muted" />
                            Edit Profile
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={handleCancel}
                                className="btn-secondary-af px-4 py-2 text-sm flex items-center gap-2"
                            >
                                <X className="w-4 h-4 text-text-muted" />
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="btn-ember px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-50"
                            >
                                {saving ? (
                                    <span className="loading loading-spinner loading-sm"></span>
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                Save Changes
                            </button>
                        </div>
                    )}
                </div>

                {/* Profile Card */}
                <div className="card-af p-6 mb-6 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-2xl bg-ember-600 border border-border-default flex items-center justify-center text-text-primary text-4xl font-bold font-display">
                            {getInitials()}
                        </div>

                        {/* User Info */}
                        <div className="text-center sm:text-left">
                            <div className="flex items-center gap-3 mb-2 justify-center sm:justify-start">
                                {isEditing ? (
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <input
                                            type="text"
                                            value={editData.firstName || ''}
                                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                                            placeholder="First Name"
                                            className="input-af py-1 px-3 text-base"
                                        />
                                        <input
                                            type="text"
                                            value={editData.lastName || ''}
                                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                                            placeholder="Last Name"
                                            className="input-af py-1 px-3 text-base"
                                        />
                                    </div>
                                ) : (
                                    <h2 className="text-2xl font-bold text-text-primary font-display">
                                        {profile?.firstName} {profile?.lastName}
                                    </h2>
                                )}
                            </div>
                            <p className="text-text-muted text-xs font-mono mb-1">@{profile?.emailId?.split('@')[0]}</p>
                            <p className="text-text-secondary text-sm font-mono">{profile?.emailId}</p>
                        </div>
                    </div>

                    {/* Role Badge */}
                    <div className="badge-steel text-[10px] px-2.5 py-1 font-mono font-bold flex items-center gap-1.5 self-center sm:self-start">
                        <Shield className="w-3.5 h-3.5" />
                        {profile?.role?.toUpperCase()}
                    </div>
                </div>

                {/* Personal Information */}
                <div className="card-af p-6 mb-6">
                    <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2 font-display">
                        <User className="w-5 h-5 text-ember-400" />
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
                        <div className="md:col-span-2">
                            <InfoField
                                label="Bio"
                                value={profile?.bio}
                                icon={FileText}
                                field="bio"
                                placeholder="Tell us about yourself"
                            />
                        </div>
                    </div>
                </div>

                {/* Social Information */}
                <div className="card-af p-6">
                    <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2 font-display">
                        <Globe className="w-5 h-5 text-ember-400" />
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
