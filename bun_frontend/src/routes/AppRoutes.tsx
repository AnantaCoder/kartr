import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import SignupInfluencer from '@/pages/SignupInfluencer';
import SignupSponsor from '@/pages/SignupSponsor';
import YoutubeAnalysis from '@/pages/YoutubeAnalysis';

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup-influencer" element={<SignupInfluencer />} />
            <Route path="/signup-sponsor" element={<SignupSponsor />} />
            <Route path="/YoutubeAnalysis" element={<YoutubeAnalysis />} />
        </Routes>
    );
};

export default AppRoutes;
