import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    Play,
    Users,
    TrendingUp,
    Sparkles,
    Youtube,
    BarChart3,
    Zap,
    Shield,
    Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import BackgroundVideo from "../components/common/BackgroundVideo";

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const Home: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
            <BackgroundVideo />
            <Header />

            {/* HERO SECTION */}
            <section className="relative min-h-[90vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
                {/* Background Effects */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-purple-500/10 to-transparent rounded-full" />
                </div>

                <div className="relative z-10 max-w-5xl mx-auto text-center">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm mb-8"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>AI-Powered Influencer Analytics Platform</span>
                    </motion.div>

                    {/* Hero Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
                    >
                        Connect{" "}
                        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
                            Influencers
                        </span>
                        <br />
                        with{" "}
                        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Sponsors
                        </span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
                    >
                        Discover creator insights, analyze YouTube channels, and find perfect
                        brand partnerships—all powered by cutting-edge AI technology.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link to="/signup-influencer">
                            <Button
                                size="lg"
                                className="group bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-6 text-lg rounded-xl shadow-2xl shadow-purple-500/25 transition-all duration-300 hover:scale-105"
                            >
                                Get Started Free
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Link to="/YoutubeAnalysis">
                            <Button
                                size="lg"
                                variant="outline"
                                className="group border-white/20 text-black hover:bg-red/10 py-6 text-lg rounded-xl transition-all duration-300 cursor-pointer"
                            >
                                <Play className="w-5 h-5 mr-2" />
                                Try YouTube Analysis
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Stats Row */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
                    >
                        {[
                            { value: "10K+", label: "Creators" },
                            { value: "500+", label: "Brands" },
                            { value: "1M+", label: "Videos Analyzed" },
                            { value: "98%", label: "Accuracy" },
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section className="relative py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Section Header */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeInUp}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                            Powerful Features for{" "}
                            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Modern Creators
                            </span>
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Everything you need to analyze, connect, and grow your influence
                        </p>
                    </motion.div>

                    {/* Features Grid */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={staggerContainer}
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {[
                            {
                                icon: Youtube,
                                title: "YouTube Analytics",
                                description: "Deep dive into video performance, audience demographics, and growth trends with AI-powered insights.",
                                color: "from-red-500 to-orange-500"
                            },
                            {
                                icon: BarChart3,
                                title: "Sponsor Matching",
                                description: "Find the perfect brand partnerships based on your niche, audience, and content style.",
                                color: "from-purple-500 to-indigo-500"
                            },
                            {
                                icon: TrendingUp,
                                title: "Growth Tracking",
                                description: "Monitor your channel growth, engagement rates, and compare against industry benchmarks.",
                                color: "from-green-500 to-emerald-500"
                            },
                            {
                                icon: Sparkles,
                                title: "AI Recommendations",
                                description: "Get personalized content suggestions and optimization tips powered by machine learning.",
                                color: "from-pink-500 to-rose-500"
                            },
                            {
                                icon: Shield,
                                title: "Brand Safety",
                                description: "Ensure brand alignment with comprehensive content analysis and safety scoring.",
                                color: "from-blue-500 to-cyan-500"
                            },
                            {
                                icon: Zap,
                                title: "Real-time Data",
                                description: "Access live metrics and instant notifications for trending opportunities.",
                                color: "from-amber-500 to-yellow-500"
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                variants={fadeInUp}
                                className="group relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-white">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* HOW IT WORKS SECTION */}
            <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                            How It{" "}
                            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                Works
                            </span>
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Get started in minutes with our simple three-step process
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                step: "01",
                                title: "Connect Your Channel",
                                description: "Link your YouTube channel or paste any video URL to start analyzing content.",
                                icon: Users
                            },
                            {
                                step: "02",
                                title: "Get AI Insights",
                                description: "Our AI analyzes sponsorships, audience quality, and growth potential in seconds.",
                                icon: Sparkles
                            },
                            {
                                step: "03",
                                title: "Find Partnerships",
                                description: "Match with brands that align with your content and start earning more.",
                                icon: TrendingUp
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="relative text-center"
                            >
                                {/* Step Number */}
                                <div className="text-7xl font-bold text-white/5 absolute -top-4 left-1/2 -translate-x-1/2">
                                    {item.step}
                                </div>

                                {/* Icon */}
                                <div className="relative z-10 w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30">
                                    <item.icon className="w-8 h-8 text-white" />
                                </div>

                                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                                <p className="text-gray-400">{item.description}</p>

                                {/* Connector Line */}
                                {i < 2 && (
                                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-purple-500/50 to-transparent" />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA SECTION */}
            <section className="relative py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border border-purple-500/30 text-center overflow-hidden"
                    >
                        {/* Background Glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10" />
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />

                        <div className="relative z-10">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                                Ready to Grow Your{" "}
                                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    Influence?
                                </span>
                            </h2>
                            <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
                                Join thousands of creators and brands already using Kartr to connect and grow together.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link to="/signup-influencer">
                                    <Button
                                        size="lg"
                                        className=" text-purple-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-xl shadow-xl transition-all duration-300 hover:scale-105"
                                    >
                                        Start for Free
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </Link>
                                <Link to="/signup-sponsor">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="border-white/30 text-black hover:bg-white/10 px-8 py-6 text-lg rounded-xl cursor-pointer"
                                    >
                                        I'm a Brand
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Home;
