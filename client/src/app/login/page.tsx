"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { useToast } from "@/contexts/ToastProvider";
import { useAuth } from "@/hooks/auth";
import { API_URL } from "@/lib/config";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import LoadingScreen from "@/components/LoadingScreen";
import { useAuthRedirect } from "@/hooks/auth";
import { motion } from "framer-motion";
import NavBar from "@/components/ui/nav-bar";

const Login: React.FC = () => {
  const { showError, showSuccess } = useToast();
  const { login } = useAuth();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isMounted = useRef(false);

  const searchParams = useSearchParams();
  const verified = searchParams.get("verified");

  useEffect(() => {
    if (verified === "true" && !isMounted.current) {
      showSuccess("Your account has been verified");
      isMounted.current = true;
    }
  }, [verified]);

  const { isAuthLoading, isAuthenticated } = useAuthRedirect({
    redirectTo: '/home',
    protectedRoute: false,
    shouldRedirect: false
  });

  // If already authenticated, redirect to home
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/home');
    }
  }, [isAuthenticated, router]);

  if (isAuthLoading) {
    return <LoadingScreen />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showError("Please enter your email and password");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error(await response.text() || "Failed to login")
      }

      showSuccess("Login successful")
      await login()
      router.replace("/home")

    } catch (error) {
      if (error instanceof Error) {
        showError(error.message || "An unknown error occurred");
      } else {
        showError("An unknown error occurred");
      }
    } finally {
      setIsLoading(false)
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showError("Please enter your email address");
      return;
    }
  
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/auth/forgot-password?email=${encodeURIComponent(email)}`, {
        method: "POST",
        credentials: "include",
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to send reset link");
      }
  
      showSuccess("Password reset email sent");
      setEmail("");
      setTimeout(() => {
        setIsForgotPassword(false);
      }, 2000);
    } catch (error) {
      if (error instanceof Error) {
        showError(error.message);
      } else {
        showError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Navigation Bar */}
      <NavBar />

      {/* Login Section */}
      <div className="flex-grow flex items-center justify-center relative py-12 px-4">
        {/* Background Image and Overlay */}
        <div
          className="absolute inset-0 bg-center z-0"
          style={{ 
            backgroundImage: "url('/images/anime-gym-bg.jpg')", 
            opacity: 0.3,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>
        
        {/* Red Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/50 via-black/70 to-red-900/50 z-1"></div>
        
        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full space-y-6 bg-gray-900/90 p-8 rounded-lg border border-red-700 shadow-lg shadow-red-500/20 backdrop-blur-sm z-10"
        >
          {/* Logo Section */}
          <div className="relative flex items-center justify-center">
            {isForgotPassword && (
              <button
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="absolute left-0 text-red-500 hover:text-red-400 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                <span className="ml-1">Back</span>
              </button>
            )}
            <div className="text-center">
              <Link href="/">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-red-400 mb-2">
                  ZENKAI GAINS
                </h1>
              </Link>
              <p className="text-lg text-gray-300">
                {isForgotPassword 
                  ? "Restore your power level" 
                  : "Sign in to continue your training"}
              </p>
            </div>
          </div>

          {/* Form Section with anime-styled inputs */}
          <form
            className="mt-8 space-y-6"
            onSubmit={isForgotPassword ? handleForgotPassword : handleLogin}
          >
            {/* Email Input */}
            <div className="relative">
              <label
                htmlFor="email"
                className="text-sm font-bold text-red-400 block mb-2 uppercase tracking-wider"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 pr-3 py-3 w-full bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Input (only for login) */}
            {!isForgotPassword && (
              <div className="relative">
                <label
                  htmlFor="password"
                  className="text-sm font-bold text-red-400 block mb-2 uppercase tracking-wider"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 py-3 w-full bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-500"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-400 cursor-pointer focus:outline-none"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Remember Me & Forgot Password (only for login) */}
            {!isForgotPassword && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-700 rounded cursor-pointer bg-gray-800"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-300 cursor-pointer"
                  >
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="font-medium text-red-400 hover:text-red-300 cursor-pointer"
                  >
                    Forgot your password?
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold rounded-md transition-all duration-200 text-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isForgotPassword ? "SENDING..." : "POWERING UP..."}
                </span>
              ) : (
                isForgotPassword ? "SEND POWER RESET" : "UNLOCK YOUR POWER"
              )}
            </Button>

            {/* Social Login */}
            {!isForgotPassword && (
              <div className="mt-1">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-900 text-gray-400">
                      Or continue with
                    </span>
                  </div>
                </div>
                <div className="mt-6">
                  <Button
                    type="button"
                    onClick={() => {
                      const clientId = "1090175341224-fmv0448rh2t2km73hgs3mbmdqtr6l3ba.apps.googleusercontent.com";
                      const redirectUri = encodeURIComponent("http://localhost:8080/oauth/google/callback");
                      const scope = encodeURIComponent("profile email");
                      const responseType = "code";
                      const accessType = "offline";
                      const prompt = "consent";
                      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&access_type=${accessType}&prompt=${prompt}`;
                      window.location.href = googleAuthUrl;
                    }}
                    className="w-full flex items-center justify-center py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md text-gray-200 font-medium transition-all duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                      />
                    </svg>
                    CONTINUE WITH GOOGLE
                  </Button>
                </div>
              </div>
            )}
          </form>

          {/* Sign Up Link */}
          {!isForgotPassword && (
            <div className="text-center mt-4">
              <p className="text-gray-300">
                New to the arena?{" "}
                <Link
                  href="/register"
                  className="font-medium text-red-400 hover:text-red-300"
                >
                  START YOUR JOURNEY
                </Link>
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center mt-6 text-xs text-gray-400">
            <p>
              By continuing, you agree to our{" "}
              <span className="text-red-400 hover:text-red-300 cursor-pointer">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-red-400 hover:text-red-300 cursor-pointer">
                Privacy Policy
              </span>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Energy particles effect overlay */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-20 overflow-hidden">
        <div className="absolute w-20 h-20 bg-red-500 rounded-full blur-xl animate-pulse" style={{ top: '20%', left: '70%' }}></div>
        <div className="absolute w-16 h-16 bg-red-600 rounded-full blur-xl animate-pulse" style={{ top: '60%', left: '20%', animationDelay: '1s' }}></div>
        <div className="absolute w-24 h-24 bg-red-700 rounded-full blur-xl animate-pulse" style={{ top: '40%', left: '80%', animationDelay: '2s' }}></div>
      </div>
    </div>
  );
};

export default Login;