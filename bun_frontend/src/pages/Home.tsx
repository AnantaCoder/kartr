import { Button } from '@/components/ui/button';
import React from 'react';

const Home: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-4">Welcome to Kartr</h1>
            <p className="text-lg text-gray-700">The influencer-sponsor connection platform. this is the frontend </p>
            <Button><span>Get Started</span></Button>
        </div>
    );
};

export default Home;
