/**
 * Sponsor Dashboard Page
 * Overview with campaigns, quick stats, and discovery shortcut
 */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, BarChart2, Users, Briefcase, TrendingUp } from 'lucide-react';
import { useSponsorGuard } from '../../hooks/useRoleGuard';
import { useCampaigns } from '../../hooks/useCampaigns';
import CampaignCard from '../../components/campaign/CampaignCard';
import CampaignForm from '../../components/campaign/CampaignForm';
import AnalyticsCard from '../../components/admin/AnalyticsCard';
import type { Campaign, CampaignCreateRequest, CampaignUpdateRequest } from '../../types/campaign';

const SponsorDashboard = () => {
    const navigate = useNavigate();
    const { isLoading: authLoading, isAuthorized } = useSponsorGuard();
    const {
        campaigns,
        loading,
        error,
        loadCampaigns,
        create,
        update,
        remove,
        activate,
        pause,
        selectedCampaign,
        selectCampaign,
    } = useCampaigns();

    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        if (isAuthorized) {
            loadCampaigns();
        }
    }, [isAuthorized, loadCampaigns]);

    const handleCreate = async (data: CampaignCreateRequest | CampaignUpdateRequest) => {
        await create(data as CampaignCreateRequest);
        setShowForm(false);
    };

    const handleUpdate = async (data: CampaignCreateRequest | CampaignUpdateRequest) => {
        if (selectedCampaign) {
            await update(selectedCampaign.id, data);
            selectCampaign(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this campaign?')) {
            await remove(id);
        }
    };

    const handleFindInfluencers = (campaign: Campaign) => {
        navigate(`/sponsor/discovery?campaign=${campaign.id}`);
    };

    // Calculate stats
    const activeCampaigns = campaigns.filter((c) => c.status === 'active').length;
    const totalMatched = campaigns.reduce((sum, c) => sum + c.matched_influencers_count, 0);

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
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
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Sponsor Dashboard</h1>
                        <p className="text-gray-400">Manage your campaigns and find influencers</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/sponsor/discovery')}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors font-medium"
                        >
                            <Search className="w-4 h-4" />
                            Discover Influencers
                        </button>
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-colors font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            New Campaign
                        </button>
                    </div>
                </motion.div>

                {/* Error Alert */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400"
                    >
                        {error}
                    </motion.div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <AnalyticsCard
                        title="Total Campaigns"
                        value={campaigns.length}
                        icon={Briefcase}
                        color="blue"
                    />
                    <AnalyticsCard
                        title="Active Campaigns"
                        value={activeCampaigns}
                        icon={TrendingUp}
                        color="green"
                    />
                    <AnalyticsCard
                        title="Total Influencers Matched"
                        value={totalMatched}
                        icon={Users}
                        color="purple"
                    />
                </div>

                {/* Campaigns Grid */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Your Campaigns</h2>
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                        </div>
                    ) : campaigns.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-16 bg-white/5 rounded-2xl border border-white/10"
                        >
                            <Briefcase className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-white mb-2">No campaigns yet</h3>
                            <p className="text-gray-400 mb-6">Create your first campaign to start finding influencers</p>
                            <button
                                onClick={() => setShowForm(true)}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium"
                            >
                                <Plus className="w-4 h-4" />
                                Create Campaign
                            </button>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {campaigns.map((campaign) => (
                                <CampaignCard
                                    key={campaign.id}
                                    campaign={campaign}
                                    onEdit={(c) => {
                                        selectCampaign(c);
                                    }}
                                    onDelete={handleDelete}
                                    onActivate={activate}
                                    onPause={pause}
                                    onFindInfluencers={handleFindInfluencers}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Create/Edit Form Modal */}
                {(showForm || selectedCampaign) && (
                    <CampaignForm
                        campaign={selectedCampaign}
                        onSubmit={selectedCampaign ? handleUpdate : handleCreate}
                        onCancel={() => {
                            setShowForm(false);
                            selectCampaign(null);
                        }}
                        loading={loading}
                    />
                )}
            </div>
        </div>
    );
};

export default SponsorDashboard;
