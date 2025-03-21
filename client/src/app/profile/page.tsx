'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

// UI Components
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import NavBar from '@/components/ui/nav-bar';

import { Camera, Save, User, Mail, Edit, X, Check, Loader2 } from 'lucide-react';

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

  const [formData, setFormData] = useState({
    username: '',
    email: '',
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
          email: data.email,
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
        email: profile.email,
        bio: profile.bio || '',
      });
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsEditing(false);
    setError(null);
  };

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
            WARRIOR PROFILE
          </h1>
          <p className="text-center text-gray-300">
            Update your battle stats and enhance your legend
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-950 border-l-4 border-green-500 text-green-200 flex items-center justify-between"
            >
              <div className="flex items-center">
                <Check className="mr-2 h-5 w-5" />
                <span>{success}</span>
              </div>
              <button onClick={() => setSuccess(null)}>
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          )}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-950 border-l-4 border-red-500 text-red-200 flex items-center justify-between"
            >
              <div className="flex items-center">
                <X className="mr-2 h-5 w-5" />
                <span>{error}</span>
              </div>
              <button onClick={() => setError(null)}>
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          )}
          <div className="grid gap-8 md:grid-cols-7">
            {/* Profile Card */}
            <div className="md:col-span-3">
              <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-none shadow-lg shadow-red-500/10 h-full">
                <CardHeader className="pb-0">
                  <CardTitle className="text-red-400">BATTLE STATS</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-6">
                    {/* Profile Picture */}
                    <div className="relative mb-4">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-red-600 shadow-lg shadow-red-600/30">
                        <img 
                          src={previewUrl || (profile?.profilePictureUrl || '/images/default-profile.jpg')} 
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {isEditing && (
                        <div className="absolute bottom-0 right-0">
                          <label htmlFor="profile-picture" className="cursor-pointer">
                            <div className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors">
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
                        </div>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold">{profile?.username}</h2>
                    <p className="text-gray-400">{profile?.email}</p>
                    <div className="mt-6 w-full">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-400">Power Level</span>
                        <span className="text-red-400 font-bold">{profile?.powerLevel?.toLocaleString() || ''}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-red-600 to-red-400 h-2 rounded-full" 
                          style={{ width: `${Math.min(100, (profile?.powerLevel || 0) / 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="mt-6 w-full grid grid-cols-2 gap-4">
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <p className="text-gray-400 text-sm">Joined</p>
                        <p className="font-bold">
                          {profile?.joinedDate ? new Date(profile.joinedDate).toLocaleDateString() : ''}
                        </p>
                      </div>
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <p className="text-gray-400 text-sm">Workouts</p>
                        <p className="font-bold">{profile?.completedWorkouts}</p>
                      </div>
                    </div>
                    {!isEditing && (
                      <Button
                        className="mt-6 bg-red-600 hover:bg-red-700 w-full flex items-center justify-center"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Profile Edit Form */}
            <div className="md:col-span-4">
              <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-none shadow-lg shadow-red-500/10 h-full">
                <CardHeader>
                  <CardTitle className="text-red-400">
                    {isEditing ? 'EDIT YOUR LEGEND' : 'WARRIOR DETAILS'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center mb-2">
                          <User className="h-4 w-4 mr-2 text-red-400" />
                          <Label htmlFor="username" className="text-gray-200">Warrior Name</Label>
                        </div>
                        {isEditing ? (
                          <Input
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className="bg-gray-800 border-gray-700 focus:border-red-500 text-white"
                            disabled={isSubmitting}
                          />
                        ) : (
                          <p className="text-lg text-gray-300">{profile?.username}</p>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center mb-2">
                          <Mail className="h-4 w-4 mr-2 text-red-400" />
                          <Label htmlFor="email" className="text-gray-200">Communication Scroll (Email)</Label>
                        </div>
                        {isEditing ? (
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="bg-gray-800 border-gray-700 focus:border-red-500 text-white"
                            disabled={isSubmitting}
                          />
                        ) : (
                          <p className="text-lg text-gray-300">{profile?.email}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="bio" className="block mb-2 text-gray-200">Warrior Bio</Label>
                        {isEditing ? (
                          <Textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            className="bg-gray-800 border-gray-700 focus:border-red-500 text-white min-h-32"
                            placeholder="Share your fitness goals and journey..."
                            disabled={isSubmitting}
                          />
                        ) : (
                          <p className="text-gray-300 whitespace-pre-wrap">{profile?.bio}</p>
                        )}
                      </div>
                      {isEditing && (
                        <div className="flex gap-4 pt-4">
                          <Button
                            type="submit"
                            className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 flex-1"
                            disabled={isSubmitting}
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
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            className="border-red-600 text-red-400 hover:bg-red-800/20 flex-1"
                            disabled={isSubmitting}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
