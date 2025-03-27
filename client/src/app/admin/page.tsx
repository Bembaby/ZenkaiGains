'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import NavBar from '@/components/ui/nav-bar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Shield, Plus, Save, X, Edit, Trash } from 'lucide-react';

// --- Interfaces ---
interface Muscle {
  id: number;
  name: string;
}

interface MuscleGroup {
  id: number;
  name: string;
  muscles: Muscle[];
}

interface ExerciseTarget {
  muscleId: number;
  percentage: number;
}

interface Exercise {
  id: number;
  name: string;
  description: string;
  targets: {
    muscle: Muscle;
    percentage: number;
  }[];
}

interface MeResponse {
  email: string;
  roles: string[];
}

// --- Admin Page Component ---
export default function AdminPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  // SECTION 1: Muscle Groups
  const [newMuscleGroup, setNewMuscleGroup] = useState('');
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [editingMuscleGroup, setEditingMuscleGroup] = useState<MuscleGroup | null>(null);
  const [editedName, setEditedName] = useState("");

  // SECTION 2: Muscles
  const [selectedGroupForMuscle, setSelectedGroupForMuscle] = useState<number | ''>('');
  const [newMuscle, setNewMuscle] = useState('');
  const [editingMuscle, setEditingMuscle] = useState<Muscle | null>(null);

  // SECTION 3: Exercise
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseDescription, setExerciseDescription] = useState('');
  const [exerciseTargets, setExerciseTargets] = useState<ExerciseTarget[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  // --- Check Admin Status ---
  useEffect(() => {
    async function checkAdminStatus() {
      try {
        const res = await fetch('http://localhost:8080/auth/me', {
          credentials: 'include',
        });
        if (!res.ok) {
          router.push('/');
          return;
        }
        const data: MeResponse = await res.json();
        if (data.roles.includes('ROLE_ADMIN')) {
          setIsAuthorized(true);
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/');
      }
    }
    checkAdminStatus();
  }, [router]);

  // --- Fetch Data (Muscle Groups & Muscles) ---
  useEffect(() => {
    if (!isAuthorized) return;

    async function fetchMuscleGroups() {
      try {
        const res = await fetch('http://localhost:8080/api/muscle-groups', { credentials: 'include' });
        const text = await res.text();
        console.log("Raw muscle groups response:", text);
        const data: MuscleGroup[] = JSON.parse(text);
        setMuscleGroups(data);
      } catch (error) {
        console.error('Error fetching muscle groups:', error);
      }
    }

    fetchMuscleGroups();
  }, [isAuthorized]);

  // --- Fetch Data (Exercises) ---
  useEffect(() => {
    if (!isAuthorized) return;

    async function fetchExercises() {
      try {
        const res = await fetch('http://localhost:8080/api/exercises', {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to fetch exercises');
        const data: Exercise[] = await res.json();
        setExercises(data);
      } catch (error) {
        console.error('Error fetching exercises:', error);
      }
    }

    fetchExercises();
  }, [isAuthorized]);

  if (!isAuthorized) return null;

  // --- SECTION 1: Handlers for Muscle Group Management ---
  const handleAddMuscleGroup = async () => {
    if (!newMuscleGroup.trim()) return;
    try {
      const res = await fetch('http://localhost:8080/api/muscle-groups', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newMuscleGroup }),
      });
      if (!res.ok) throw new Error('Failed to add muscle group');
      const addedGroup: MuscleGroup = await res.json();
      setMuscleGroups(prev => [...prev, addedGroup]);
      setNewMuscleGroup('');
    } catch (error) {
      console.error('Error adding muscle group:', error);
    }
  };

  const handleDeleteMuscleGroup = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:8080/api/muscle-groups/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete muscle group');
      setMuscleGroups(prev => prev.filter(group => group.id !== id));
    } catch (error) {
      console.error('Error deleting muscle group:', error);
    }
  };

  const handleEditMuscleGroup = async () => {
    if (!editingMuscleGroup || !editedName.trim()) return;
    try {
      const res = await fetch(`http://localhost:8080/api/muscle-groups/${editingMuscleGroup.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editedName }),
      });
      if (!res.ok) throw new Error('Failed to update muscle group');
      
      setMuscleGroups(prev => prev.map(group => 
        group.id === editingMuscleGroup.id ? { ...group, name: editedName } : group
      ));
      setEditingMuscleGroup(null);
      setEditedName("");
    } catch (error) {
      console.error('Error updating muscle group:', error);
    }
  };

  // --- SECTION 2: Handlers for Muscle Management ---
  const handleAddMuscle = async () => {
    if (!newMuscle.trim() || selectedGroupForMuscle === '') return;
  
    try {
      const res = await fetch('http://localhost:8080/api/muscles', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newMuscle.trim(),
          muscleGroupId: Number(selectedGroupForMuscle),
        }),
      });

      const text = await res.text();
      console.log("Add muscle response:", text);

      if (!res.ok) {
        throw new Error(`Failed to add muscle: ${text}`);
      }

      const addedMuscle = text ? JSON.parse(text) : null;
      if (addedMuscle) {
        setMuscleGroups(prev => prev.map(group => 
          group.id === Number(selectedGroupForMuscle) 
            ? { ...group, muscles: [...group.muscles, addedMuscle] }
            : group
        ));
      }
      setNewMuscle('');
      setSelectedGroupForMuscle('');
    } catch (error) {
      console.error('Error adding muscle:', error);
    }
  };
  
  const handleDeleteMuscle = async (muscleId: number, groupId: number) => {
    try {
      const res = await fetch(`http://localhost:8080/api/muscles/${muscleId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete muscle');
      
      setMuscleGroups(prev => prev.map(group => 
        group.id === groupId 
          ? { ...group, muscles: group.muscles.filter(m => m.id !== muscleId) } 
          : group
      ));
    } catch (error) {
      console.error('Error deleting muscle:', error);
    }
  };

  const handleEditMuscle = async () => {
    if (!editingMuscle || !editedName.trim()) return;
    
    try {
      const res = await fetch(`http://localhost:8080/api/muscles/${editingMuscle.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editedName }),
      });
      if (!res.ok) throw new Error('Failed to update muscle');
      
      setMuscleGroups(prev => prev.map(group => ({
        ...group,
        muscles: group.muscles.map(muscle => 
          muscle.id === editingMuscle.id ? { ...muscle, name: editedName } : muscle
        )
      })));
      
      setEditingMuscle(null);
      setEditedName("");
    } catch (error) {
      console.error('Error updating muscle:', error);
    }
  };

  // --- SECTION 3: Handlers for Exercise Management ---
  const handleAddExerciseTarget = () => {
    setExerciseTargets(prev => [...prev, { muscleId: 0, percentage: 0 }]);
  };

  const handleUpdateExerciseTarget = (index: number, field: 'muscleId' | 'percentage', value: string) => {
    setExerciseTargets(prev => {
      const newTargets = [...prev];
      newTargets[index] = {
        ...newTargets[index],
        [field]: Number(value),
      };
      return newTargets;
    });
  };

  const handleRemoveExerciseTarget = (index: number) => {
    setExerciseTargets(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddExercise = async () => {
    if (!exerciseName.trim() || exerciseTargets.length === 0) return;
    try {
      const res = await fetch('http://localhost:8080/api/exercises', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: exerciseName,
          description: exerciseDescription,
          targets: exerciseTargets,
        }),
      });
      if (!res.ok) throw new Error('Failed to add exercise');
      
      // Fetch updated exercises list
      const updatedRes = await fetch('http://localhost:8080/api/exercises', {
        credentials: 'include',
      });
      if (updatedRes.ok) {
        const updatedExercises: Exercise[] = await updatedRes.json();
        setExercises(updatedExercises);
      }

      // Reset exercise form
      setExerciseName('');
      setExerciseDescription('');
      setExerciseTargets([]);
    } catch (error) {
      console.error('Error adding exercise:', error);
    }
  };

  // --- Render ---
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Background Layers */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/images/malevolant-shrine.png')] bg-cover bg-center opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <NavBar />

      <main className="flex-1 container mx-auto pt-20 px-4 py-8 relative z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
            Admin Dashboard
          </h1>
          <div className="w-24 h-1 mx-auto bg-gradient-to-r from-red-500 to-orange-500 rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 gap-8">
          {/* Section 1: Add Muscle Group */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-black/70 border-red-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-red-400">
                  <Shield className="mr-2 h-5 w-5" />
                  Add Muscle Group
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Input
                    value={newMuscleGroup}
                    onChange={(e) => setNewMuscleGroup(e.target.value)}
                    placeholder="e.g., Chest, Back, Legs"
                    className="bg-black/50 text-orange-200 border-red-500/20"
                  />
                  <Button
                    onClick={handleAddMuscleGroup}
                    className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Section 2: Add Muscle */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-black/70 border-red-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-red-400">
                  <Shield className="mr-2 h-5 w-5" />
                  Add Muscle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-orange-200">Select Muscle Group</Label>
                  <Select
                    value={selectedGroupForMuscle?.toString() || ""}
                    onValueChange={(val) => setSelectedGroupForMuscle(Number(val))}
                  >
                    <SelectTrigger className="bg-black/50 text-orange-200 border-red-500/20">
                      <SelectValue placeholder="Choose a group" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto bg-black/90 border-red-500/20">
                      {muscleGroups.map((group) => (
                        <SelectItem
                          key={group.id}
                          value={group.id.toString()}
                          className="text-orange-200 focus:bg-red-500/20 focus:text-orange-100"
                        >
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Input
                    value={newMuscle}
                    onChange={(e) => setNewMuscle(e.target.value)}
                    placeholder="e.g., Upper Pectoralis"
                    className="bg-black/50 text-orange-200 border-red-500/20"
                  />
                  <Button
                    onClick={handleAddMuscle}
                    className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                    disabled={!selectedGroupForMuscle}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Section 3: Add Exercise */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="bg-black/70 border-red-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-red-400">
                  <Shield className="mr-2 h-5 w-5" />
                  Add Exercise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-orange-200">Exercise Name</Label>
                  <Input
                    value={exerciseName}
                    onChange={(e) => setExerciseName(e.target.value)}
                    placeholder="e.g., Bench Press"
                    className="bg-black/50 text-orange-200 border-red-500/20"
                  />
                </div>
                <div>
                  <Label className="text-orange-200">Exercise Description</Label>
                  <Input
                    value={exerciseDescription}
                    onChange={(e) => setExerciseDescription(e.target.value)}
                    placeholder="Enter a brief description"
                    className="bg-black/50 text-orange-200 border-red-500/20"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-orange-200">Exercise Targets</Label>
                    <Button
                      onClick={handleAddExerciseTarget}
                      className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Target
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-red-500/20 scrollbar-track-black/20">
                    {exerciseTargets.map((target, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm text-orange-200 bg-black/30 p-2 rounded border border-red-500/20"
                      >
                        <Select
                          value={target.muscleId ? target.muscleId.toString() : ""}
                          onValueChange={(val) => handleUpdateExerciseTarget(index, 'muscleId', val)}
                        >
                          <SelectTrigger className="bg-black/50 text-orange-200 border-red-500/20">
                            <SelectValue placeholder="Select muscle" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px] overflow-y-auto bg-black/90 border-red-500/20">
                            {muscleGroups.flatMap(group => group.muscles).map((muscle) => (
                              <SelectItem
                                key={muscle.id}
                                value={muscle.id.toString()}
                                className="text-orange-200 focus:bg-red-500/20 focus:text-orange-100"
                              >
                                {muscle.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={target.percentage ? target.percentage.toString() : ""}
                          onChange={(e) => handleUpdateExerciseTarget(index, 'percentage', e.target.value)}
                          placeholder="Percentage"
                          className="w-24 bg-black/50 text-orange-200 border-red-500/20"
                        />
                        <Button
                          onClick={() => handleRemoveExerciseTarget(index)}
                          variant="ghost"
                          size="icon"
                          className="text-orange-400 hover:text-red-400"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={handleAddExercise}
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                  disabled={!exerciseName.trim() || exerciseTargets.length === 0}
                >
                  Create Exercise
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Section 4: Exercise List */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card className="bg-black/70 border-red-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-red-400">
                  <Shield className="mr-2 h-5 w-5" />
                  Exercise List
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {exercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="bg-black/30 p-4 rounded-lg border border-red-500/20"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-orange-400">
                            {exercise.name}
                          </h3>
                          {exercise.description && (
                            <p className="text-sm text-orange-200/70">
                              {exercise.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        {exercise.targets.map((target, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between text-sm text-orange-200 bg-black/20 p-2 rounded"
                          >
                            <span>{target.muscle.name}</span>
                            <span className="text-orange-400">{target.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Section 5: Muscle Groups and Muscles List */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <Card className="bg-black/70 border-red-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-red-400">
                  <Shield className="mr-2 h-5 w-5" />
                  Muscle Groups & Muscles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {muscleGroups.map((group) => (
                    <div
                      key={group.id}
                      className="bg-black/30 p-4 rounded-lg border border-red-500/20"
                    >
                      <div className="flex justify-between items-center mb-3">
                        {editingMuscleGroup?.id === group.id ? (
                          <div className="flex items-center gap-2 flex-1 mr-2">
                            <Input
                              value={editedName}
                              onChange={(e) => setEditedName(e.target.value)}
                              className="bg-black/50 text-orange-200 border-red-500/20"
                            />
                            <Button
                              onClick={handleEditMuscleGroup}
                              className="bg-green-500/20 hover:bg-green-500/30 text-green-400"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => {
                                setEditingMuscleGroup(null);
                                setEditedName("");
                              }}
                              className="bg-red-500/20 hover:bg-red-500/30 text-red-400"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <h3 className="text-lg font-semibold text-orange-400">
                              {group.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => {
                                  setEditingMuscleGroup(group);
                                  setEditedName(group.name);
                                }}
                                className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteMuscleGroup(group.id)}
                                className="bg-red-500/20 hover:bg-red-500/30 text-red-400"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="pl-4 space-y-2">
                        {group.muscles.map((muscle) => (
                          <div
                            key={muscle.id}
                            className="flex items-center justify-between bg-black/20 p-2 rounded"
                          >
                            {editingMuscle?.id === muscle.id ? (
                              <div className="flex items-center gap-2 flex-1 mr-2">
                                <Input
                                  value={editedName}
                                  onChange={(e) => setEditedName(e.target.value)}
                                  className="bg-black/50 text-orange-200 border-red-500/20"
                                />
                                <Button
                                  onClick={handleEditMuscle}
                                  className="bg-green-500/20 hover:bg-green-500/30 text-green-400"
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => {
                                    setEditingMuscle(null);
                                    setEditedName("");
                                  }}
                                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <>
                                <span className="text-orange-200">{muscle.name}</span>
                                <div className="flex items-center gap-2">
                                  <Button
                                    onClick={() => {
                                      setEditingMuscle(muscle);
                                      setEditedName(muscle.name);
                                    }}
                                    className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    onClick={() => handleDeleteMuscle(muscle.id, group.id)}
                                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400"
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
