'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import NavBar from '@/components/ui/nav-bar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, Trophy, Calendar, Dumbbell } from 'lucide-react';

interface UserProfile {
  id: string;
  username: string;
  profilePictureUrl: string;
  bio: string;
  powerLevel: number;
  joinedDate: string;
  completedWorkouts: number;
}

export default function PublicProfilePage() {
  const params = useParams();
  const username = params?.username as string;
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) {
      setError('Username not provided');
      setIsLoading(false);
      return;
    }

    fetch(`http://localhost:8080/api/public/profile/${username}`, {
      method: 'GET',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch profile');
        return res.json();
      })
      .then((data: UserProfile) => {
        setProfile(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to fetch profile');
        setIsLoading(false);
      });
  }, [username]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-black text-white">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-red-500 mx-auto" />
            <p className="mt-4 text-xl text-gray-400">Powering up...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col bg-black text-white">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-none shadow-lg shadow-red-500/10 max-w-md w-full">
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-red-400 mb-4">Warrior Not Found</h2>
                <p className="text-gray-300 mb-6">{error || 'This profile could not be loaded.'}</p>
                <Button
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => window.history.back()}
                >
                  Return to Previous Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <NavBar />
      <div className="relative bg-gradient-to-r from-red-900 to-black py-16">
        <div 
          className="absolute inset-0 bg-center z-0 opacity-20"
          style={{ backgroundImage: "url('/images/anime-action-bg.jpg')", backgroundSize: "cover" }}
        ></div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
            {profile.username}'S LEGEND
          </h1>
          <p className="text-center text-gray-300">
            Witness the warrior's journey
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-none shadow-lg shadow-red-500/10">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Profile Picture */}
                <div className="flex-shrink-0">
                  <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-red-600 shadow-lg shadow-red-600/30">
                    <img 
                      src={profile.profilePictureUrl || '/images/default-profile.jpg'} 
                      alt={`${profile.username}'s profile`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                {/* Profile Info */}
                <div className="flex-grow text-center md:text-left">
                  <h2 className="text-3xl font-bold mb-2">{profile.username}</h2>
                  
                  {/* Power Level */}
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <div className="flex items-center">
                        <Trophy className="h-4 w-4 mr-2 text-red-400" />
                        <span className="text-gray-400">Power Level</span>
                      </div>
                      <span className="text-red-400 font-bold">{profile.powerLevel?.toLocaleString() || ''}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-red-600 to-red-400 h-2 rounded-full" 
                        style={{ width: `${Math.min(100, (profile.powerLevel || 0) / 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-red-400" />
                      <div>
                        <p className="text-gray-400 text-sm">Joined</p>
                        <p className="font-bold">
                          {profile.joinedDate ? new Date(profile.joinedDate).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Dumbbell className="h-5 w-5 mr-2 text-red-400" />
                      <div>
                        <p className="text-gray-400 text-sm">Workouts Completed</p>
                        <p className="font-bold">{profile.completedWorkouts}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bio Section */}
              {profile.bio && (
                <div className="mt-8 bg-gray-800/50 p-6 rounded-lg">
                  <div className="flex items-center mb-3">
                    <BookOpen className="h-5 w-5 mr-2 text-red-400" />
                    <h3 className="text-xl font-semibold text-gray-200">Warrior Bio</h3>
                  </div>
                  <p className="text-gray-300">{profile.bio}</p>
                </div>
              )}
              
              {/* Achievements could go here in the future */}
              
              <div className="mt-8 flex justify-center">
                <Button
                  className="bg-gray-700 hover:bg-gray-600"
                  onClick={() => window.history.back()}
                >
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}