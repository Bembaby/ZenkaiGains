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

import {
  Camera,
  Save,
  User,
  Edit,
  X,
  Check,
  Loader2,
  BookOpen,
  Flame,
  Star,
  Trophy,
  Calendar,
} from 'lucide-react';

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

  // Editable fields
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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

        const uploadRes = await fetch(
          'http://localhost:8080/api/upload-profile-picture',
          {
            method: 'POST',
            body: fileData,
            credentials: 'include',
          }
        );
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

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-black text-white">
        <div className="absolute inset-0 bg-[url('/images/malevolant-shrine.png')] bg-cover bg-center opacity-40"></div>
        <NavBar />
        <div className="flex-1 flex items-center justify-center relative z-10 px-4">
          <Card className="w-full max-w-2xl bg-black/80 border-red-500/50 backdrop-blur-sm">
            <div className="text-center">
              <motion.div
                animate={{
                  rotate: 360,
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
                }}
              >
                <Loader2 className="h-16 w-16 text-red-500 mx-auto drop-shadow-[0_0_15px_rgba(239,68,68,0.7)]" />
              </motion.div>
              <motion.p
                className="mt-6 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-600"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Powering up...
              </motion.p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-black text-white relative">
      {/* Background images and layers */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/images/malevolant-shrine.png')] bg-cover bg-center opacity-70"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-500/5 via-transparent to-red-900/10"></div>
      </div>

      {/* NavBar */}
      <NavBar />

      {/* Content Container - Make it scrollable if needed */}
      <div className="flex-1 overflow-y-auto">
        {/* Hero / Title Area */}
        <motion.div
          className="relative pt-16 pb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 overflow-hidden">
            {/* Red energy overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 to-black/30 z-0" />

            {/* Animated energy particles */}
            <div className="absolute inset-0">
              {Array.from({ length: 15 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-6 bg-red-500 rounded-full shadow-lg shadow-red-500/50"
                  initial={{
                    x: Math.random() * 100 + '%',
                    y: '120%',
                    opacity: 0.3 + Math.random() * 0.7,
                  }}
                  animate={{
                    y: '-20%',
                    opacity: [0.7, 0, 0.7],
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 4,
                    repeat: Infinity,
                    ease: 'easeOut',
                    delay: Math.random() * 5,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="container mx-auto px-4 relative z-10">
            <motion.h1
              className="text-4xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-red-500"
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              WARRIOR PROFILE
            </motion.h1>

            <motion.div
              className="w-24 h-1 mx-auto bg-gradient-to-r from-red-500 via-orange-400 to-red-500 rounded-full mb-2"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />

            <motion.p
              className="text-center text-gray-200 text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Update your stats and enhance your legend
            </motion.p>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="container mx-auto px-4 relative z-10">
          {/* Success and Error Messages - Fixed position on the side */}
          <div className="fixed right-4 bottom-4 z-50 space-y-4 min-w-[300px] max-w-md">
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  className="p-4 bg-black/80 backdrop-blur-sm border-l-4 border-green-500 text-green-200 rounded-lg flex items-center justify-between shadow-lg shadow-green-900/20"
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
                  <button 
                    onClick={() => setSuccess(null)}
                    className="ml-2 hover:text-green-100 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  className="p-4 bg-black/80 backdrop-blur-sm border-l-4 border-red-500 text-red-200 rounded-lg flex items-center justify-between shadow-lg shadow-red-900/20"
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
                  <button 
                    onClick={() => setError(null)}
                    className="ml-2 hover:text-red-100 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid gap-8 md:grid-cols-12 items-start max-w-6xl mx-auto">
            {/* Profile Card */}
            <motion.div
              className={`col-span-12 md:col-span-8 lg:col-span-6 ${
                isEditing ? 'md:col-start-1 lg:col-start-1' : 'md:col-start-3 lg:col-start-4'
              }`}
              initial={{ x: -50, opacity: 0 }}
              animate={{ 
                x: 0, 
                opacity: 1,
              }}
              transition={{ 
                duration: 0.6,
                layout: { duration: 0.3 }
              }}
              layout
            >
              <Card className="bg-black/70 backdrop-blur-sm border border-red-500/20 rounded-lg overflow-hidden shadow-[0_0_25px_rgba(239,68,68,0.3)] relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-900/10 to-black/50 mix-blend-overlay"></div>

                <CardHeader className="pb-0 relative z-10">
                  <CardTitle className="text-red-400 flex items-center">
                    <Flame className="mr-2 h-5 w-5 text-orange-500" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">
                      BATTLE STATS
                    </span>
                  </CardTitle>
                </CardHeader>

                <CardContent className="relative z-10 p-6">
                  <div className="flex flex-col items-center justify-center">
                    {/* Profile Picture */}
                    <div className="relative mb-6">
                      <motion.div
                        className="absolute -inset-1 rounded-full bg-gradient-to-r from-red-600 via-orange-400 to-red-600"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 8,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      />
                      <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-black relative z-10 shadow-lg">
                        <img
                          src={
                            previewUrl ||
                            profile?.profilePictureUrl ||
                            '/images/default-profile.jpg'
                          }
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

                    {/* Username */}
                    <motion.h2
                      className="text-2xl font-bold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {profile?.username}
                    </motion.h2>

                    {/* Power Level */}
                    <motion.div
                      className="text-orange-500 text-sm font-bold flex items-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Star className="h-4 w-4 mr-1 text-orange-400" />
                      <span>
                        POWER LEVEL {profile?.powerLevel?.toLocaleString() || ''}
                      </span>
                    </motion.div>

                    {/* Bio (if not editing) */}
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
                        <div className="bg-black/60 backdrop-blur-sm p-4 rounded-md border border-red-900/30">
                          <p className="text-gray-300 text-sm italic">"{profile.bio}"</p>
                        </div>
                      </motion.div>
                    )}

                    {/* Power Level Bar */}
                    <motion.div
                      className="mt-6 w-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-400">Power Level</span>
                        <span className="text-red-400 font-bold">
                          {profile?.powerLevel?.toLocaleString() || ''}
                        </span>
                      </div>
                      <div className="w-full bg-black/50 rounded-full h-3 p-0.5 backdrop-blur-sm">
                        <motion.div
                          className="bg-gradient-to-r from-red-600 via-orange-500 to-red-400 h-2 rounded-full relative"
                          style={{ width: '0%' }}
                          animate={{
                            width: `${Math.min(
                              100,
                              (profile?.powerLevel || 0) / 100
                            )}%`,
                          }}
                          transition={{ duration: 1, delay: 0.6 }}
                        >
                          <motion.div
                            className="absolute top-0 right-0 h-full w-1 bg-white rounded-full"
                            animate={{
                              opacity: [1, 0.5, 1],
                              boxShadow: [
                                '0 0 5px 2px rgba(255,255,255,0.7)',
                                '0 0 12px 4px rgba(255,255,255,0.9)',
                                '0 0 5px 2px rgba(255,255,255,0.7)',
                              ],
                            }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Joined + Workouts */}
                    <motion.div
                      className="mt-6 w-full grid grid-cols-2 gap-4"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      {/* Joined */}
                      <motion.div
                        className="bg-black/60 backdrop-blur-sm p-4 rounded-lg border border-red-900/30 hover:border-red-500/50 transition-colors"
                        whileHover={{
                          y: -5,
                          boxShadow: '0 5px 15px rgba(239,68,68,0.3)',
                        }}
                      >
                        <div className="flex items-center mb-1">
                          <Calendar className="h-4 w-4 mr-1 text-red-400" />
                          <p className="text-gray-400 text-sm">Joined</p>
                        </div>
                        <p className="font-bold text-sm text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                          {formatDate(profile?.joinedDate)}
                        </p>
                      </motion.div>

                      {/* Workouts */}
                      <motion.div
                        className="bg-black/60 backdrop-blur-sm p-4 rounded-lg border border-red-900/30 hover:border-red-500/50 transition-colors"
                        whileHover={{
                          y: -5,
                          boxShadow: '0 5px 15px rgba(239,68,68,0.3)',
                        }}
                      >
                        <p className="text-gray-400 text-sm">Workouts</p>
                        <div className="flex items-center">
                          <Trophy className="h-4 w-4 mr-1 text-orange-500" />
                          <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                            {profile?.completedWorkouts}
                          </p>
                        </div>
                      </motion.div>
                    </motion.div>

                    {/* Edit / View Public if not editing */}
                    {!isEditing && (
                      <motion.div
                        className="flex flex-col gap-4 mt-6 w-full"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 w-full flex items-center justify-center shadow-lg shadow-red-600/20 hover:shadow-red-600/40 transition-all"
                            onClick={() => setIsEditing(true)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Profile
                          </Button>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            className="bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 w-full flex items-center justify-center shadow-lg shadow-red-600/20 hover:shadow-red-600/40 transition-all"
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

            {/* Edit Form */}
            <AnimatePresence mode="popLayout">
              {isEditing && (
                <motion.div
                  className="md:col-span-5"
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 300, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <Card className="bg-black/70 backdrop-blur-sm border-red-500/20 shadow-[0_0_25px_rgba(239,68,68,0.3)] rounded-lg overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-red-900/10 to-black/50 mix-blend-overlay"></div>

                    <CardHeader className="relative z-10">
                      <CardTitle className="text-red-400 flex items-center">
                        <Edit className="mr-2 h-5 w-5 text-red-500" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">
                          EDIT YOUR LEGEND
                        </span>
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="relative z-10 p-6">
                      <form onSubmit={handleSubmit} className="text-red-50">
                        <div className="space-y-6">
                          {/* USERNAME */}
                          <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            <div className="flex items-center mb-2">
                              <User className="h-4 w-4 mr-2 text-red-500" />
                              <p className="text-gray-400 text-sm">Username</p>
                            </div>
                            <Label htmlFor="username" className="sr-only">
                              Username
                            </Label>
                            <Input
                              id="username"
                              name="username"
                              placeholder="Enter your warrior name"
                              value={formData.username}
                              onChange={handleInputChange}
                              className="bg-black/40 border-red-500/20 text-red-50 placeholder:text-red-200/30 focus-visible:ring-red-500"
                            />
                          </motion.div>

                          {/* BIO */}
                          <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                          >
                            <div className="flex items-center mb-2">
                              <BookOpen className="h-4 w-4 mr-2 text-red-500" />
                              <p className="text-gray-400 text-sm">Bio</p>
                            </div>
                            <Label htmlFor="bio" className="sr-only">
                              Bio
                            </Label>
                            <Textarea
                              id="bio"
                              name="bio"
                              placeholder="Tell your story..."
                              value={formData.bio}
                              onChange={handleInputChange}
                              className="bg-black/40 border-red-500/20 text-red-50 placeholder:text-red-200/30 focus-visible:ring-red-500"
                            />
                          </motion.div>

                          {/* BUTTONS */}
                          <motion.div
                            className="flex items-center justify-end gap-4 pt-4"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                          >
                            <Button
                              variant="outline"
                              type="button"
                              onClick={handleCancel}
                              className="text-red-400 border-red-500/30 hover:bg-red-950/30 hover:text-red-300"
                            >
                              <X className="mr-2 h-4 w-4" />
                              Cancel
                            </Button>

                            <Button
                              type="submit"
                              disabled={isSubmitting}
                              className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 flex items-center shadow-lg shadow-red-600/20 hover:shadow-red-600/40 transition-all"
                            >
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
