/**
 * Search Filters Component
 * Niche and keyword search inputs for discovery
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Tag, Sparkles } from 'lucide-react';

interface SearchFiltersProps {
    onSearch: (niche: string, keywords: string, description: string) => void;
    loading?: boolean;
}

const POPULAR_NICHES = [
    'Fashion',
    'Tech',
    'Gaming',
    'Beauty',
    'Fitness',
    'Food',
    'Travel',
    'Lifestyle',
    'Home Appliances',
    'Finance',
];

const SearchFilters = ({ onSearch, loading }: SearchFiltersProps) => {
    const [niche, setNiche] = useState('');
    const [keywords, setKeywords] = useState('');
    const [description, setDescription] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleSearch = () => {
        if (niche.trim()) {
            onSearch(niche.trim(), keywords.trim(), description.trim());
        }
    };

    const handleNicheClick = (selectedNiche: string) => {
        setNiche(selectedNiche);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 p-6"
        >
            {/* Primary Search */}
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
                {/* Niche Input */}
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Niche / Category *
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={niche}
                            onChange={(e) => setNiche(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="e.g., Fashion, Tech, Home Appliances"
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    </div>
                </div>

                {/* Keywords Input */}
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Keywords (comma-separated)
                    </label>
                    <input
                        type="text"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="e.g., dishwasher, kitchen, cooking"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>

                {/* Search Button */}
                <div className="flex items-end">
                    <button
                        onClick={handleSearch}
                        disabled={loading || !niche.trim()}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Searching...
                            </>
                        ) : (
                            <>
                                <Search className="w-4 h-4" />
                                Find Influencers
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Popular Niches */}
            <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Popular Niches</p>
                <div className="flex flex-wrap gap-2">
                    {POPULAR_NICHES.map((n) => (
                        <button
                            key={n}
                            onClick={() => handleNicheClick(n)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${niche === n
                                    ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {n}
                        </button>
                    ))}
                </div>
            </div>

            {/* Advanced Toggle */}
            <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
                <Sparkles className="w-4 h-4" />
                {showAdvanced ? 'Hide' : 'Show'} AI Description Search
            </button>

            {/* Advanced Search (AI Description) */}
            {showAdvanced && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4"
                >
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Campaign Description (for AI matching)
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your campaign in detail. The AI will use this to find the most relevant influencers based on their content..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                        💡 The more detail you provide, the better the AI can match influencers to your campaign.
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
};

export default SearchFilters;
