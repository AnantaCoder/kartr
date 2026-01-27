/**
 * Influencer Dashboard Page
 * Overview for influencers with their stats and invites
 */
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Youtube, Users, Eye, TrendingUp, Briefcase, Send } from 'lucide-react';
import { useInfluencerGuard } from '../../hooks/useRoleGuard';
import { useAppSelector } from '../../store/hooks';
import { selectUser } from '../../store/slices/authSlice';
import AnalyticsCard from '../../components/admin/AnalyticsCard';

const InfluencerDashboard = () => {
    const { isLoading: authLoading, isAuthorized } = useInfluencerGuard();
    const user = useAppSelector(selectUser);

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Welcome back, {user?.full_name || user?.username}!
                    </h1>
                    <p className="text-gray-400">Manage your profile and view campaign invites</p>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <AnalyticsCard
                        title="YouTube Channels"
                        value={0}
                        icon={Youtube}
                        color="red"
                    />
                    <AnalyticsCard
                        title="Total Subscribers"
                        value={0}
                        icon={Users}
                        color="purple"
                    />
                    <AnalyticsCard
                        title="Campaign Invites"
                        value={0}
                        icon={Briefcase}
                        color="blue"
                    />
                    <AnalyticsCard
                        title="Active Campaigns"
                        value={0}
                        icon={TrendingUp}
                        color="green"
                    />
                </div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                >
                    {/* Connect YouTube */}
                    <div className="rounded-2xl bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 p-6">
                        <Youtube className="w-10 h-10 text-red-500 mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">Connect YouTube</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Link your YouTube channel to showcase your analytics to sponsors.
                        </p>
                        <button className="w-full py-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors font-medium">
                            Connect Channel
                        </button>
                    </div>

                    {/* Connect Bluesky */}
                    <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 p-6">
                        <Send className="w-10 h-10 text-blue-400 mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">Connect Bluesky</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Link your Bluesky account for automated posting features.
                        </p>
                        <button className="w-full py-2.5 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors font-medium">
                            Connect Bluesky
                        </button>
                    </div>

                    {/* View Invites */}
                    <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 p-6">
                        <Briefcase className="w-10 h-10 text-purple-400 mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">Campaign Invites</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            View and respond to campaign invitations from sponsors.
                        </p>
                        <button className="w-full py-2.5 rounded-xl bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors font-medium">
                            View Invites
                        </button>
                    </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-700/50 flex items-center justify-center">
                            <TrendingUp className="w-8 h-8 text-gray-500" />
                        </div>
                        <p className="text-gray-400">No recent activity yet.</p>
                        <p className="text-gray-500 text-sm mt-2">
                            Connect your social accounts to start receiving campaign invites.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default InfluencerDashboard;
