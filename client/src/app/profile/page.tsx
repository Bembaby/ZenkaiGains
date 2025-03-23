'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// UI Components
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import NavBar from '@/components/ui/nav-bar';

import { Camera, Save, User, Edit, X, Check, Loader2, BookOpen, Flame, Star, Trophy } from 'lucide-react';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  profilePictureUrl: string;
  bio: string;
  powerLevel: number;
  joinedDate: string;
  completedWorkouts: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Only include fields that are editable (email is now hidden)
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:8080/auth/profile', {
      method: 'GET',
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch profile');
        return res.json();
      })
      .then((data: UserProfile) => {
        setProfile(data);
        setFormData({
          username: data.username,
          bio: data.bio || '',
        });
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to fetch profile');
        setIsLoading(false);
      });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const fileReader = new FileReader();
      fileReader.onload = () => setPreviewUrl(fileReader.result as string);
      fileReader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      let newProfilePictureUrl = profile?.profilePictureUrl || '';

      if (selectedFile) {
        const fileData = new FormData();
        fileData.append('profilePicture', selectedFile);
        const uploadRes = await fetch('http://localhost:8080/api/upload-profile-picture', {
          method: 'POST',
          body: fileData,
          credentials: 'include',
        });
        if (!uploadRes.ok) throw new Error('File upload failed');
        const { publicUrl } = await uploadRes.json();
        newProfilePictureUrl = publicUrl;
      }

      const updateRes = await fetch('http://localhost:8080/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: formData.username,
          bio: formData.bio,
          profilePictureUrl: newProfilePictureUrl,
        }),
      });

      if (!updateRes.ok) throw new Error('Failed to update profile');
      const updated = await updateRes.json();
      setProfile(updated);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        username: profile.username,
        bio: profile.bio || '',
      });
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsEditing(false);
    setError(null);
  };

  const handleViewPublicProfile = () => {
    if (profile?.username) {
      router.push(`/public/profile/${profile.username}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-900 via-gray-900 to-black text-white">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.2, 1],
              }}
              transition={{
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <Loader2 className="h-16 w-16 text-red-500 mx-auto drop-shadow-[0_0_15px_rgba(239,68,68,0.7)]" />
            </motion.div>
            <motion.p 
              className="mt-6 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-600"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Powering up...
            </motion.p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-900 via-gray-900 to-black text-white">
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/images/anime-pattern.png')] bg-repeat"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-500/20 via-purple-500/20 to-blue-500/20"></div>
      </div>
      
      <NavBar />
      
      <motion.div 
        className="relative bg-gradient-to-r from-red-900 via-purple-900 to-red-900 py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated background energy effects */}
          <div className="absolute inset-0 bg-center z-0 opacity-30"
            style={{ backgroundImage: "url('/images/anime-action-bg.jpg')", backgroundSize: "cover" }}
          ></div>
          
          {/* Animated energy particles */}
          <div className="absolute inset-0">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-6 bg-red-500 rounded-full shadow-lg shadow-red-500/50"
                initial={{ 
                  x: Math.random() * 100 + "%", 
                  y: "120%", 
                  opacity: 0.3 + Math.random() * 0.7 
                }}
                animate={{ 
                  y: "-20%",
                  opacity: [0.7, 0, 0.7],
                  scale: [1, 1.5, 1]
                }}
                transition={{ 
                  duration: 2 + Math.random() * 4, 
                  repeat: Infinity, 
                  ease: "easeOut",
                  delay: Math.random() * 5
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 py-8">
          <motion.h1 
            className="text-5xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-400 to-red-500"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            WARRIOR PROFILE
          </motion.h1>
          
          <motion.div
            className="w-32 h-1 mx-auto bg-gradient-to-r from-red-500 via-yellow-400 to-red-500 rounded-full mb-4"
            initial={{ width: 0 }}
            animate={{ width: 128 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />
          
          <motion.p 
            className="text-center text-gray-200 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Update your battle stats and enhance your legend
          </motion.p>
        </div>
      </motion.div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence>
            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 bg-green-900/80 backdrop-blur-sm border-l-4 border-green-500 text-green-200 rounded-r-md flex items-center justify-between"
              >
                <div className="flex items-center">
                  <motion.div 
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <Check className="mr-2 h-5 w-5" />
                  </motion.div>
                  <span>{success}</span>
                </div>
                <button onClick={() => setSuccess(null)}>
                  <X className="h-5 w-5" />
                </button>
              </motion.div>
            )}
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 bg-red-900/80 backdrop-blur-sm border-l-4 border-red-500 text-red-200 rounded-r-md flex items-center justify-between"
              >
                <div className="flex items-center">
                  <motion.div 
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <X className="mr-2 h-5 w-5" />
                  </motion.div>
                  <span>{error}</span>
                </div>
                <button onClick={() => setError(null)}>
                  <X className="h-5 w-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="grid gap-8 md:grid-cols-7">
            {/* Profile Card */}
            <motion.div 
              className="md:col-span-3"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 border border-red-500/20 rounded-lg overflow-hidden shadow-[0_0_25px_rgba(239,68,68,0.3)] h-full relative">
                <div className="absolute inset-0 bg-[url('/images/anime-card-texture.png')] mix-blend-overlay opacity-20"></div>
                
                <CardHeader className="pb-0 relative z-10">
                  <CardTitle className="text-red-400 flex items-center">
                    <Flame className="mr-2 h-5 w-5 text-yellow-500" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-yellow-500">BATTLE STATS</span>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="relative z-10">
                  <div className="flex flex-col items-center justify-center py-6">
                    {/* Profile Picture with animated border */}
                    <div className="relative mb-6">
                      <motion.div 
                        className="absolute -inset-1 rounded-full bg-gradient-to-r from-red-600 via-yellow-400 to-red-600"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      />
                      
                      <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-gray-900 relative z-10 shadow-lg">
                        <img 
                          src={previewUrl || (profile?.profilePictureUrl || '/images/default-profile.jpg')} 
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {isEditing && (
                        <motion.div 
                          className="absolute bottom-0 right-0 z-20"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <label htmlFor="profile-picture" className="cursor-pointer">
                            <div className="bg-gradient-to-r from-red-600 to-red-800 text-white p-3 rounded-full shadow-lg shadow-red-600/30 hover:shadow-red-600/50 transition-all">
                              <Camera className="h-5 w-5" />
                            </div>
                            <input 
                              type="file" 
                              id="profile-picture" 
                              className="hidden" 
                              accept="image/*"
                              onChange={handleFileSelect}
                            />
                          </label>
                        </motion.div>
                      )}
                    </div>
                    
                    <motion.h2 
                      className="text-2xl font-bold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {profile?.username}
                    </motion.h2>
                    
                    {/* Power level glow effect */}
                    <motion.div
                      className="text-yellow-500 text-sm font-bold flex items-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Star className="h-4 w-4 mr-1 text-yellow-400" />
                      <span>POWER LEVEL {profile?.powerLevel?.toLocaleString() || ''}</span>
                    </motion.div>
                    
                    {/* Bio Display */}
                    {profile?.bio && !isEditing && (
                      <motion.div 
                        className="mt-6 text-center px-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <div className="flex items-center justify-center mb-2">
                          <BookOpen className="h-4 w-4 mr-2 text-red-400" />
                          <span className="text-gray-400 text-sm">WARRIOR BIO</span>
                        </div>
                        <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-md border border-gray-700/50">
                          <p className="text-gray-300 text-sm italic">"{profile.bio}"</p>
                        </div>
                      </motion.div>
                    )}
                    
                    <motion.div 
                      className="mt-6 w-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-400">Power Level</span>
                        <span className="text-red-400 font-bold">{profile?.powerLevel?.toLocaleString() || ''}</span>
                      </div>
                      <div className="w-full bg-gray-800/80 rounded-full h-3 p-0.5 backdrop-blur-sm">
                        <motion.div 
                          className="bg-gradient-to-r from-red-600 via-yellow-500 to-red-400 h-2 rounded-full relative"
                          style={{ width: '0%' }}
                          animate={{ width: `${Math.min(100, (profile?.powerLevel || 0) / 100)}%` }}
                          transition={{ duration: 1, delay: 0.6 }}
                        >
                          <motion.div 
                            className="absolute top-0 right-0 h-full w-1 bg-white rounded-full"
                            animate={{ 
                              opacity: [1, 0.5, 1],
                              boxShadow: [
                                '0 0 5px 2px rgba(255,255,255,0.7)',
                                '0 0 12px 4px rgba(255,255,255,0.9)',
                                '0 0 5px 2px rgba(255,255,255,0.7)'
                              ]
                            }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        </motion.div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="mt-6 w-full grid grid-cols-2 gap-4"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      <motion.div 
                        className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg border border-gray-700/50 hover:border-red-500/50 transition-colors"
                        whileHover={{ y: -5, boxShadow: '0 5px 15px rgba(239,68,68,0.3)' }}
                      >
                        <p className="text-gray-400 text-sm">Joined</p>
                        <p className="font-bold">
                          {profile?.joinedDate ? new Date(profile.joinedDate).toLocaleDateString() : ''}
                        </p>
                      </motion.div>
                      <motion.div 
                        className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg border border-gray-700/50 hover:border-red-500/50 transition-colors"
                        whileHover={{ y: -5, boxShadow: '0 5px 15px rgba(239,68,68,0.3)' }}
                      >
                        <p className="text-gray-400 text-sm">Workouts</p>
                        <div className="flex items-center">
                          <Trophy className="h-4 w-4 mr-1 text-yellow-500" />
                          <p className="font-bold">{profile?.completedWorkouts}</p>
                        </div>
                      </motion.div>
                    </motion.div>
                    
                    {!isEditing && (
                      <motion.div 
                        className="flex flex-col gap-4 mt-6 w-full"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                      >
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 w-full flex items-center justify-center shadow-lg shadow-red-600/20 hover:shadow-red-600/40 transition-all"
                            onClick={() => setIsEditing(true)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Profile
                          </Button>
                        </motion.div>
                        
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            className="bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 w-full flex items-center justify-center shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 transition-all"
                            onClick={handleViewPublicProfile}
                          >
                            <User className="mr-2 h-4 w-4" />
                            View Public Profile
                          </Button>
                        </motion.div>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Profile Edit Form */}
            <AnimatePresence>
              {isEditing && (
                <motion.div 
                  className="md:col-span-4"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 50, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Card className="bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 border border-red-500/20 shadow-[0_0_25px_rgba(239,68,68,0.3)] rounded-lg overflow-hidden h-full relative">
                    <div className="absolute inset-0 bg-[url('/images/anime-card-texture.png')] mix-blend-overlay opacity-20"></div>
                    
                    <CardHeader className="relative z-10">
                      <CardTitle className="text-red-400 flex items-center">
                        <Edit className="mr-2 h-5 w-5 text-red-500" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-yellow-500">EDIT YOUR LEGEND</span>
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="relative z-10">
                      <form onSubmit={handleSubmit}>
                        <div className="space-y-6">
                          <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            <div className="flex items-center mb-2">
                              <User className="h-4 w-4 mr-2 text-red-400" />
                              <Label htmlFor="username" className="text-gray-200">Warrior Name</Label>
                            </div>
                            <div className="relative">
                              <Input
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                className="bg-gray-800/60 backdrop-blur-sm border-gray-700 focus:border-red-500 focus:ring-red-500/30 text-white"
                                disabled={isSubmitting}
                              />
                              <div className="absolute inset-0 pointer-events-none border border-red-500/0 focus-within:border-red-500/50 rounded-md transition-colors"></div>
                            </div>
                          </motion.div>
                          
                          <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                          >
                            <div className="flex items-center mb-2">
                              <BookOpen className="h-4 w-4 mr-2 text-red-400" />
                              <Label htmlFor="bio" className="text-gray-200">Warrior Bio</Label>
                            </div>
                            <div className="relative">
                              <Textarea
                                id="bio"
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                className="bg-gray-800/60 backdrop-blur-sm border-gray-700 focus:border-red-500 focus:ring-red-500/30 text-white min-h-32"
                                placeholder="Share your fitness goals and journey..."
                                disabled={isSubmitting}
                              />
                              <div className="absolute inset-0 pointer-events-none border border-red-500/0 focus-within:border-red-500/50 rounded-md transition-colors"></div>
                            </div>
                            <p className="text-gray-400 text-xs mt-2">Tell other warriors about your fitness journey and goals.</p>
                          </motion.div>
                          
                          <motion.div 
                            className="flex gap-4 pt-4"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                          >
                            <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Button
                                type="submit"
                                className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 w-full shadow-lg shadow-red-600/20 hover:shadow-red-600/40 transition-all"
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? (
                                  <>
                                    <motion.div
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    >
                                      <Loader2 className="mr-2 h-4 w-4" />
                                    </motion.div>
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                  </>
                                )}
                              </Button>
                            </motion.div>
                            
                            <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                className="border-red-600 text-red-400 hover:bg-red-800/20 w-full"
                                disabled={isSubmitting}
                              >
                                Cancel
                              </Button>
                            </motion.div>
                          </motion.div>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}