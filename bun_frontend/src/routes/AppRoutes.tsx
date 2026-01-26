import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import SignupInfluencer from '../pages/SignupInfluencer';
import SignupSponsor from '../pages/SignupSponsor';
import YoutubeAnalysis from '../pages/YoutubeAnalysis';
import ForgotPassword from '../pages/ForgotPassword';
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import AutoPosting from '../pages/AutoPosting';
import VirtualAi from '../pages/VirtualAi';
import MvpShowcase from '../pages/MvpShowcase';
import AdStudio from '../pages/AdStudio';

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup-influencer" element={<SignupInfluencer />} />
            <Route path="/signup-sponsor" element={<SignupSponsor />} />
            <Route path="/YoutubeAnalysis" element={<YoutubeAnalysis />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/auto-posting" element={<AutoPosting />} />
            <Route path="/VirtualAi" element={<VirtualAi />} />
            <Route path="/innovation-lab" element={<MvpShowcase />} />
            <Route path="/ad-studio" element={<AdStudio />} />
        </Routes>
    );
};

export default AppRoutes;
