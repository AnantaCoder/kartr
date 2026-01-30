
import React from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Star, ExternalLink, Award, Briefcase, BarChart } from 'lucide-react';

export interface InfluencerOrBrand {
    name: string;
    handle?: string; // Optional for brands
    engagement_rate?: number; // Optional for brands
    subscribers?: string; // Optional for brands
    industry?: string; // For brands
    score: number;
    thumbnail_url?: string;
}

interface TopInfluencersProps {
    influencers: InfluencerOrBrand[];
    niche: string;
    themeColor: string;
    mode?: 'creator' | 'brand'; // 'creator' = viewing creators (default), 'brand' = viewing brands
    onApply?: (brandName: string) => void;
}

const TopInfluencers: React.FC<TopInfluencersProps> = ({ influencers, niche, themeColor, mode = 'creator', onApply }) => {
    const isBrandView = mode === 'brand';
    const title = isBrandView ? `Top ${niche} Sponsors` : `Top ${niche} Creators`;
    const subtitle = isBrandView ? "High-paying brands looking for partners" : "Perfect alignment for your brand";

    return (
        <div className="mt-12 space-y-8">
            <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl bg-${themeColor}-500/10 border border-${themeColor}-500/20 text-${themeColor}-400`}>
                    {isBrandView ? <Briefcase className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                </div>
                <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-wider">{title}</h3>
                    <p className={`text-[10px] text-gray-500 font-bold uppercase tracking-widest ${isBrandView ? 'text-purple-400' : 'text-emerald-400'}`}>
                        {subtitle}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {influencers.map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`group relative bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 transition-all duration-500 shadow-2xl overflow-hidden ${isBrandView ? 'hover:border-purple-500/30' : 'hover:border-emerald-500/30'}`}
                    >
                        {/* Status Badge */}
                        <div className={`absolute top-6 right-6 p-2 rounded-full ${isBrandView ? 'bg-purple-500/10' : 'bg-emerald-500/10'}`}>
                            <Star className={`w-4 h-4 ${isBrandView ? 'text-purple-400 fill-purple-400' : 'text-emerald-400 fill-emerald-400'}`} />
                        </div>

                        <div className="flex flex-col items-center text-center mb-8">
                            {item.thumbnail_url ? (
                                <div className="w-20 h-20 rounded-full mb-4 border-4 border-white/5 overflow-hidden">
                                    <img src={item.thumbnail_url} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-${themeColor}-500 to-${themeColor}-800 flex items-center justify-center text-3xl font-black text-white mb-4 border-4 border-white/5`}>
                                    {item.name.charAt(0)}
                                </div>
                            )}
                            <h4 className={`text-xl font-black text-white uppercase tracking-tight transition-colors ${isBrandView ? 'group-hover:text-purple-400' : 'group-hover:text-emerald-400'}`}>
                                {item.name}
                            </h4>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                                {isBrandView ? item.industry : item.handle}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-white/5 rounded-2xl p-4 text-center">
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">
                                    {isBrandView ? 'Match' : 'Eng. Rate'}
                                </p>
                                <p className="text-lg font-black text-white">
                                    {isBrandView ? 'High' : `${item.engagement_rate}%`}
                                </p>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-4 text-center">
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">
                                    {isBrandView ? 'Budget' : 'Followers'}
                                </p>
                                <p className="text-lg font-black text-white">
                                    {isBrandView ? '$$$' : item.subscribers}
                                </p>
                            </div>
                        </div>

                        <div className={`flex items-center justify-between p-4 rounded-2xl border mb-8 ${isBrandView ? 'bg-purple-500/5 border-purple-500/10' : 'bg-emerald-500/5 border-emerald-500/10'}`}>
                            <div className="flex items-center gap-2">
                                <Award className={`w-4 h-4 ${isBrandView ? 'text-purple-400' : 'text-emerald-400'}`} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${isBrandView ? 'text-purple-400' : 'text-emerald-400'}`}>Alignment Score</span>
                            </div>
                            <span className={`text-lg font-black ${isBrandView ? 'text-purple-400' : 'text-emerald-400'}`}>{item.score}%</span>
                        </div>

                        <button
                            onClick={() => onApply && onApply(item.name)}
                            className={`w-full py-4 rounded-[24px] bg-white/5 border border-white/10 text-white font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 cursor-pointer ${isBrandView ? 'group-hover:bg-purple-600 group-hover:border-purple-600' : 'group-hover:bg-emerald-600 group-hover:border-emerald-600'}`}
                        >
                            {isBrandView ? 'Apply Now' : 'Partner Now'}
                            <ExternalLink className="w-4 h-4" />
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default TopInfluencers;
