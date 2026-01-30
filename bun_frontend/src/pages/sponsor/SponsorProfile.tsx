/**
 * Sponsor Profile Page
 * Displays sponsor's personal information and organization details
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Building2, Calendar, Shield, Edit2, Save, X } from 'lucide-react';
import { useSponsorGuard } from '../../hooks/useRoleGuard';
import { useAppSelector } from '../../store/hooks';
import { selectUser } from '../../store/slices/authSlice';

const SponsorProfile = () => {
    const { isLoading: authLoading } = useSponsorGuard();
    const user = useAppSelector(selectUser);
    const [isEditing, setIsEditing] = useState(false);

    // Form state for editing
    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        email: user?.email || '',
    });

    const handleSave = async () => {
        // TODO: Implement profile update API call
        setIsEditing(false);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
                    <p className="text-gray-400">Manage your account information</p>
                </motion.div>

                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 overflow-hidden"
                >
                    {/* Profile Header */}
                    <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600">
                        <div className="absolute -bottom-12 left-8">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-gray-900">
                                {user?.full_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'S'}
                            </div>
                        </div>
                        <button
                            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                            className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                        >
                            {isEditing ? (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save
                                </>
                            ) : (
                                <>
                                    <Edit2 className="w-4 h-4" />
                                    Edit
                                </>
                            )}
                        </button>
                        {isEditing && (
                            <button
                                onClick={() => setIsEditing(false)}
                                className="absolute top-4 right-28 flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 backdrop-blur-sm text-red-400 hover:bg-red-500/30 transition-colors"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                        )}
                    </div>

                    {/* Profile Content */}
                    <div className="pt-16 p-8">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-white">
                                {user?.full_name || user?.username}
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-medium">
                                    Sponsor
                                </span>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Username */}
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <div className="flex items-center gap-3 mb-2">
                                    <User className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm text-gray-400">Username</span>
                                </div>
                                <p className="text-white font-medium">{user?.username}</p>
                            </div>

                            {/* Email */}
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <div className="flex items-center gap-3 mb-2">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm text-gray-400">Email</span>
                                </div>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    />
                                ) : (
                                    <p className="text-white font-medium">{user?.email}</p>
                                )}
                            </div>

                            {/* Full Name */}
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <div className="flex items-center gap-3 mb-2">
                                    <Building2 className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm text-gray-400">Full Name</span>
                                </div>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    />
                                ) : (
                                    <p className="text-white font-medium">{user?.full_name || 'Not set'}</p>
                                )}
                            </div>

                            {/* Member Since */}
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <div className="flex items-center gap-3 mb-2">
                                    <Calendar className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm text-gray-400">Member Since</span>
                                </div>
                                <p className="text-white font-medium">
                                    {user?.date_registered
                                        ? new Date(user.date_registered).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })
                                        : 'N/A'}
                                </p>
                            </div>

                            {/* Account Status */}
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 md:col-span-2">
                                <div className="flex items-center gap-3 mb-2">
                                    <Shield className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm text-gray-400">Account Status</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-green-500" />
                                    <p className="text-white font-medium">Active</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default SponsorProfile;
