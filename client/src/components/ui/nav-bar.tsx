"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function NavBar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:8080/auth/me", {
          method: "GET",
          credentials: "include",
        });
        if (res.ok) {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
      } catch (error) {
        setAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:8080/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        setAuthenticated(false);
        window.location.href = "/";
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-black/90 backdrop-blur-md shadow-lg shadow-red-900/20 py-2" 
          : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo / Branding */}
        <div 
            className="flex items-center space-x-2 cursor-pointer group" 
            onClick={() => router.push(authenticated ? "/home" : "/")}
        >

          <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center overflow-hidden border border-red-700">
            <span className="text-white font-bold text-xl">ZG</span>
          </div>
          <motion.span 
            className="font-extrabold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            ZenkaiGains
          </motion.span>
        </div>

        {/* Navigation Menu - Center */}
        <NavigationMenu className="hidden md:block">
          <NavigationMenuList className="flex items-center space-x-1">
            <NavigationMenuItem>
              <NavButton label="Home" onClick={() => router.push("/")} />
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavButton label="Training Arcs" onClick={() => router.push("/splits")} />
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavButton label="Progress Tracker" onClick={() => router.push("/progress")} />
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavButton label="Transformation Vault" onClick={() => router.push("/photo-vault")} />
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Authentication Buttons */}
        {authenticated ? (
          <div className="flex space-x-3">
            <Button 
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white border-none"
              size="sm"
            >
              Logout
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push("/profile")}
              className="border-red-600 text-red-500 hover:bg-red-900/20"
              size="sm"
            >
              Profile
            </Button>
          </div>
        ) : (
          <div className="flex space-x-3">
            <Button 
              onClick={() => router.push("/login")}
              className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white border-none"
              size="sm"
            >
              Power Up
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push("/register")}
              className="border-red-600 text-red-500 hover:bg-red-900/20"
              size="sm"
            >
              Join the Battle
            </Button>
          </div>
        )}

        {/* Mobile Menu Button - Only visible on small screens */}
        <div className="md:hidden">
          <Button 
            variant="ghost"
            size="icon"
            className="text-red-500 hover:bg-red-900/20"
            onClick={() => console.log("Mobile menu toggle")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </Button>
        </div>
      </div>
    </motion.nav>
  );
}

// Custom Nav Button Component
type NavButtonProps = {
  label: string;
  onClick: () => void;
};

function NavButton({ label, onClick }: NavButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="relative px-4 py-2 text-gray-200 hover:text-red-400 transition-colors"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      {label}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-red-500"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
    </motion.button>
  );
}
