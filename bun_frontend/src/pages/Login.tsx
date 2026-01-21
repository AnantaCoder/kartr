import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { login, selectAuthLoading, selectAuthError, clearError, loginSchema, type LoginFormValues } from '../features/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import KartrLine from '../components/KartrLine.tsx';
import bg_img from "../assets/auth/bg_img.png";

const Login: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const isLoading = useAppSelector(selectAuthLoading);
    const authError = useAppSelector(selectAuthError);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    useEffect(() => {
        return () => { dispatch(clearError()); };
    }, [dispatch]);

    const onSubmit = async (data: LoginFormValues) => {
        dispatch(clearError());
        const result = await dispatch(login(data));
        if (login.fulfilled.match(result)) navigate('/');
    };

    return (
        <motion.div className="flex flex-col min-h-screen  justify-between" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center justify-center flex-1  "style={{ backgroundImage: `url(${bg_img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <Card className="w-full max-w-lg bg-white/90 backdrop-blur-md shadow-2xl border-0 mt-5  " >
                    <CardHeader className="text-center pb-8">
                        <CardTitle className="text-4xl font-bold text-gray-800 mb-2 font-serif">Welcome Back</CardTitle>
                        <CardDescription className="text-lg text-gray-600">Login in to your account to continue</CardDescription>
                        <KartrLine width={140} color="#ec4899" text="Kartr" />
                    </CardHeader>
                    <CardContent className="px-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                                <Input id="email" type="email" placeholder="Enter your email" {...register('email')} className="h-12 text-base" />
                                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                            </div>
                            <div className="space-y-2 relative">
                                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" {...register('password')} className="h-12 text-base pr-12" />
                                <button type="button" onClick={() => setShowPassword(prev => !prev)} className="absolute pr-2 right-2 top-1/2 text-gray-500 hover:text-gray-700 transition-colors" style={{ transform: 'translateX(10px)' }}>
                                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                                </button>
                                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                            </div>
                            {authError && (
                                <motion.p className="text-sm text-red-500 text-center bg-red-50 p-3 rounded-md" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
                                    {authError}
                                </motion.p>
                            )}
                            <motion.div whileTap={{ scale: 0.98 }} className="pt-2">
                                <Button type="submit" className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 transition-colors" disabled={isLoading}>
                                    {isLoading ? 'Logging in...' : 'Log In'}
                                </Button>
                            </motion.div>
                        </form>
                    </CardContent>
                    <CardFooter className="justify-center pt-6">
                        <div className="text-center text-sm text-gray-600 space-y-2">
                            <p>Don't have an account?</p>
                            <div className="flex justify-center space-x-4">
                                <a href="/signup-influencer" className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors">Sign up as Influencer</a>
                                <span className="text-gray-400">|</span>
                                <a href="/signup-sponsor" className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors">Sign up as Sponsor</a>
                            </div>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </motion.div>
    );
};

export default Login;
