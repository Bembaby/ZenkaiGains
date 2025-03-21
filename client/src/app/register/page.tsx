"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { API_URL } from "@/lib/config";
import { useToast } from "@/contexts/ToastProvider";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth";
import LoadingScreen from "@/components/LoadingScreen";
import { useAuthRedirect } from "@/hooks/auth";
import { motion } from "framer-motion";

const Register = () => {
  const { showError, showInfo } = useToast();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  //Redirect logic and avoiding initial page render
  const { isAuthLoading } = useAuthRedirect({
    redirectTo: '/home',
    protectedRoute: false
  });

  if (isAuthLoading) {
    return <LoadingScreen />;
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Register form submitted");


    // Validate input locally
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      showError("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      showError("Passwords do not match");
      return;
    }
    if (!agreeTerms) {
      showError("You must agree to the Terms of Service and Privacy Policy");
      return;
    }


    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
        }),
      });
      console.log("Fetch response received:", response);


      if (!response.ok) {
        const errorText = await response.text();
        console.error("Registration error:", errorText);
        throw new Error(errorText || "Registration failed");
      }


      const successText = await response.text();
      console.log("Registration success:", successText);
      showInfo("Registration successful! Please check your email or spam to verify your account.");
     
    } catch (err: any) {
      console.error("Error during registration:", err);
      showError(err.message);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white py-12 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div 
        className="absolute inset-0 bg-center z-0 opacity-30"
        style={{ 
          backgroundImage: "url('/images/anime-gym-bg.jpg')", 
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      ></div>
      
      {/* Red Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/50 via-black/70 to-red-900/50 z-5"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-md w-full space-y-8 bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-lg shadow-xl border-t-2 border-red-500 relative z-10"
      >
        {/* Logo Section */}
        <div className="text-center">
          <Link href="/">
            <h1 className="text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-red-400">
              ZENKAI GAINS
            </h1>
          </Link>
          <p className="text-gray-300">Begin your legendary training journey</p>
        </div>
        
        {/* Form Section */}
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          {/* First Name */}
          <div className="relative">
            <label htmlFor="firstName" className="text-sm font-medium text-gray-300 block mb-2">
              First Name
            </label>
            <div className="relative">
              <i className="fas fa-user absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500"></i>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="pl-10 pr-3 py-2 w-full bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-white"
                placeholder="Enter your first name"
              />
            </div>
          </div>
          
          {/* Last Name */}
          <div className="relative">
            <label htmlFor="lastName" className="text-sm font-medium text-gray-300 block mb-2">
              Last Name
            </label>
            <div className="relative">
              <i className="fas fa-user absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500"></i>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="pl-10 pr-3 py-2 w-full bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-white"
                placeholder="Enter your last name"
              />
            </div>
          </div>
          
          {/* Email */}
          <div className="relative">
            <label htmlFor="email" className="text-sm font-medium text-gray-300 block mb-2">
              Email Address
            </label>
            <div className="relative">
              <i className="fas fa-envelope absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500"></i>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 pr-3 py-2 w-full bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-white"
                placeholder="Enter your email"
              />
            </div>
          </div>
          
          {/* Password */}
          <div className="relative">
            <label htmlFor="password" className="text-sm font-medium text-gray-300 block mb-2">
              Password
            </label>
            <div className="relative">
              <i className="fas fa-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500"></i>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 py-2 w-full bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-white"
                placeholder="Create a password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400 cursor-pointer"
              >
                <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>
          </div>
          
          {/* Confirm Password */}
          <div className="relative">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300 block mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <i className="fas fa-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500"></i>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 pr-10 py-2 w-full bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-white"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400 cursor-pointer"
              >
                <i className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>
          </div>
          
          {/* Terms and Conditions */}
          <div className="flex items-center">
            <input
              id="agree-terms"
              name="agree-terms"
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-700 rounded cursor-pointer bg-gray-800"
            />
            <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-300 cursor-pointer">
              I agree to the <span className="text-red-500 hover:text-red-400 cursor-pointer">Terms of Service</span>{" "}
              and <span className="text-red-500 hover:text-red-400 cursor-pointer">Privacy Policy</span>
            </label>
          </div>
          
          {/* Register Button */}
          <Button 
            type="submit" 
            className="w-full text-md h-full bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <i className="fas fa-spinner fa-spin mr-2"></i>
                POWERING UP...
              </span>
            ) : (
              "START YOUR JOURNEY"
            )}
          </Button>
          
          {/* Social Registration */}
          <div className="mt-1">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">Or join with</span>
              </div>
            </div>
            <div className="mt-6">
              <Button
                type="button"
                onClick={() => {
                  // Step 1: Set your Google OAuth parameters
                  const clientId = "1090175341224-fmv0448rh2t2km73hgs3mbmdqtr6l3ba.apps.googleusercontent.com";
                  const redirectUri = encodeURIComponent("http://localhost:8080/oauth/google/callback");
                  const scope = encodeURIComponent("profile email");
                  const responseType = "code";
                  const accessType = "offline";
                  const prompt = "consent";

                  // Step 2: Construct the Google authorization URL
                  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&access_type=${accessType}&prompt=${prompt}`;

                  // Step 3: Redirect the user to Google
                  window.location.href = googleAuthUrl;
                }}
                className="w-full text-md bg-gray-800 py-2 px-4 border border-gray-700 rounded-md hover:bg-gray-700 cursor-pointer whitespace-nowrap text-white"
              >
                <i className="fab fa-google mr-2 text-red-500"></i>
                JOIN WITH GOOGLE
              </Button>
            </div>
          </div>
        </form>
        
        {/* Sign In Link */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-400">
            Already a warrior?{" "}
            <a href="/login" className="font-medium text-red-500 hover:text-red-400">
              RETURN TO BATTLE
            </a>
          </p>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-4 text-xs text-gray-500">
          <p>
            By continuing, you agree to our <span className="text-red-500 hover:text-red-400">Terms of Service</span>{" "}
            and <span className="text-red-500 hover:text-red-400">Privacy Policy</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;