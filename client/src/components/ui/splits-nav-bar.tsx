"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Flame, LineChart, User } from "lucide-react";

// Define the structure returned by /auth/me
interface MeResponse {
  email: string;
  roles: string[];
}

export default function SplitsNavBar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check authentication and admin status on mount using /auth/me
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("http://localhost:8080/auth/me", {
          method: "GET",
          credentials: "include",
        });
        if (res.ok) {
          const data: MeResponse = await res.json();
          setAuthenticated(true);
          if (data.roles.includes("ROLE_ADMIN")) {
            setIsAdmin(true);
          }
        } else {
          setAuthenticated(false);
          setIsAdmin(false);
        }
      } catch (error) {
        setAuthenticated(false);
        setIsAdmin(false);
      }
    }
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
          ? "bg-black/90 backdrop-blur-md shadow-lg shadow-purple-900/20 py-2" 
          : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo / Branding */}
        <div 
          className="flex items-center space-x-2 cursor-pointer group" 
          onClick={() => router.push("/home")}
        >
          <motion.div 
            className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center overflow-hidden border border-purple-700"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <span className="text-white font-bold text-xl">ZG</span>
          </motion.div>
          <motion.span 
            className="font-extrabold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600"
            whileHover={{ scale: 1.05 }}
          >
            ZenkaiGains
          </motion.span>
        </div>

        {/* Navigation Items */}
        <NavigationMenu>
          <NavigationMenuList className="flex items-center space-x-2">
            <NavigationMenuItem>
              <NavButton
                label="Home"
                icon={<Flame className="w-4 h-4" />}
                onClick={() => router.push("/home")}
              />
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavButton
                label="Progress"
                icon={<LineChart className="w-4 h-4" />}
                onClick={() => router.push("/progress")}
              />
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavButton
                label="Profile"
                icon={<User className="w-4 h-4" />}
                onClick={() => router.push("/profile")}
              />
            </NavigationMenuItem>
            {authenticated && (
              <NavigationMenuItem>
                <Button
                  variant="outline"
                  className="bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20 text-purple-100"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </motion.nav>
  );
}

// Custom Nav Button Component
interface NavButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

function NavButton({ label, icon, onClick }: NavButtonProps) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className="flex items-center space-x-1 text-purple-200 hover:text-purple-100 hover:bg-purple-500/20"
    >
      {icon}
      <span>{label}</span>
    </Button>
  );
}
