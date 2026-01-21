import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { registerInfluencer, selectAuthLoading, selectAuthError, clearError, signupInfluencerSchema, type SignupInfluencerFormValues } from '../features/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import KartrLine from '../components/KartrLine.tsx';
import bg_img from "../assets/auth/bg_img.png";

const SignupInfluencer: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isLoading = useAppSelector(selectAuthLoading);
  const authError = useAppSelector(selectAuthError);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupInfluencerFormValues>({
    resolver: zodResolver(signupInfluencerSchema),
  });

  useEffect(() => {
    return () => { dispatch(clearError()); };
  }, [dispatch]);

  const onSubmit = async (data: SignupInfluencerFormValues) => {
    dispatch(clearError());
    const result = await dispatch(registerInfluencer(data));
    if (registerInfluencer.fulfilled.match(result)) navigate('/YoutubeAnalysis');
  };

  return (
    <motion.div className="flex items-center justify-center mb-12 min-h-screen"  style={{ backgroundImage: `url(${bg_img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
      <Card className="w-full max-w-lg bg-white/90 backdrop-blur-md shadow-2xl border-0 my-12 bg-gradient-to-br 
  from-[#f6f7ff] via-[#f3e8ff] to-[#eaf6ff]" >
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-4xl font-bold text-gray-800 mb-2 font-serif">Sign Up as Influencer</CardTitle>
          <CardDescription className="text-lg text-gray-600">Join our platform and start influencing</CardDescription>
          <KartrLine width={140} color="#ec4899" text="Kartr" />
        </CardHeader>
        <CardContent className="px-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
              <Input id="firstName" placeholder="Enter your first name" {...register('firstName')} className="h-12 text-base" />
              {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name (Optional)</Label>
              <Input id="lastName" placeholder="Enter your last name" {...register('lastName')} className="h-12 text-base" />
              {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile" className="text-sm font-medium text-gray-700">Mobile Number</Label>
              <Input id="mobile" type="tel" placeholder="Enter your 10-digit mobile number" {...register('mobile')} className="h-12 text-base" />
              {errors.mobile && <p className="text-sm text-red-500">{errors.mobile.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
              <Input id="email" type="email" placeholder="Enter your email" {...register('email')} className="h-12 text-base" />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
              <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password (min 8 characters)" {...register('password')} className="h-12 text-base pr-12" />
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
                {isLoading ? 'Signing up...' : 'Sign Up'}
              </Button>
            </motion.div>
          </form>
        </CardContent>
        <CardFooter className="justify-center pt-6">
          <p className="text-sm text-gray-600">
            Already have an account? <a href="/login" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">Log in</a>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default SignupInfluencer;