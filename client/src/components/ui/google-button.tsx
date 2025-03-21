"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";

interface GoogleOAuthButtonProps {
  label?: string;
}

const GoogleOAuthButton: React.FC<GoogleOAuthButtonProps> = ({ label = "Continue with Google" }) => {
  const handleGoogleOAuth = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUriEnv = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;
    if (!clientId || !redirectUriEnv) {
      console.error("Missing Google OAuth environment variables");
      return;
    }
    const redirectUri = encodeURIComponent(redirectUriEnv);
    const scope = encodeURIComponent("profile email");
    const responseType = "code";
    const accessType = "offline";
    const prompt = "consent";
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&access_type=${accessType}&prompt=${prompt}`;
    window.location.href = googleAuthUrl;
  };

  return (
    <Button
      type="button"
      onClick={handleGoogleOAuth}
      className="w-full py-3 bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white font-bold rounded-md transition-all duration-200 text-lg flex items-center justify-center"
    >
      <i className="fab fa-google mr-2 text-red-500"></i>
      {label}
    </Button>
  );
};

export default GoogleOAuthButton;
