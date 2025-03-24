'use client';

import React, { useState, useEffect } from 'react';
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
} from "@/components/ui/select";
import {
  Shield,
  Plus,
  Save,
  X,
  Edit2,
} from 'lucide-react';

export default function AdminPage() {
  const [muscleGroups, setMuscleGroups] = useState<{ [key: string]: string[] }>({});
  const [newMuscleGroup, setNewMuscleGroup] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('');
  const [newExercise, setNewExercise] = useState('');
  const [editMode, setEditMode] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // Fetch existing muscle groups from the Spring Boot backend
  useEffect(() => {
    async function fetchMuscleGroups() {
      try {
        const res = await fetch('http://localhost:8080/api/workouts');
        if (!res.ok) throw new Error('Failed to fetch workouts');
        const data = await res.json();
        // Convert the response (array of MuscleGroup objects) into an object map for easier use on the client
        const muscleGroupsMap: { [key: string]: string[] } = {};
        data.forEach((mg: { name: string; exercises: string[] }) => {
          muscleGroupsMap[mg.name] = mg.exercises;
        });
        setMuscleGroups(muscleGroupsMap);
      } catch (error) {
        console.error('Error fetching muscle groups:', error);
      }
    }
    fetchMuscleGroups();
  }, []);

  const handleAddMuscleGroup = async () => {
    if (!newMuscleGroup.trim()) return;
    
    try {
      const res = await fetch('http://localhost:8080/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newMuscleGroup,
          exercises: [],
        }),
      });
      
      if (!res.ok) throw new Error('Failed to add muscle group');
      
      // Update local state if the backend call was successful
      setMuscleGroups({
        ...muscleGroups,
        [newMuscleGroup]: [],
      });
      setNewMuscleGroup('');
    } catch (error) {
      console.error('Error adding muscle group:', error);
    }
  };

  const handleAddExercise = async () => {
    if (!selectedMuscleGroup || !newExercise.trim()) return;
    
    try {
      const res = await fetch(`http://localhost:8080/api/workouts/${selectedMuscleGroup}/exercises`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exercise: newExercise,
        }),
      });
      
      if (!res.ok) throw new Error('Failed to add exercise');
      
      setMuscleGroups({
        ...muscleGroups,
        [selectedMuscleGroup]: [...(muscleGroups[selectedMuscleGroup] || []), newExercise],
      });
      setNewExercise('');
    } catch (error) {
      console.error('Error adding exercise:', error);
    }
  };

  const handleDeleteExercise = async (muscleGroup: string, exercise: string) => {
    try {
      const res = await fetch(`http://localhost:8080/api/workouts/${muscleGroup}/exercises/${exercise}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) throw new Error('Failed to delete exercise');
      
      setMuscleGroups({
        ...muscleGroups,
        [muscleGroup]: muscleGroups[muscleGroup].filter(e => e !== exercise),
      });
    } catch (error) {
      console.error('Error deleting exercise:', error);
    }
  };

  const handleDeleteMuscleGroup = async (muscleGroup: string) => {
    try {
      const res = await fetch(`http://localhost:8080/api/workouts/${muscleGroup}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) throw new Error('Failed to delete muscle group');
      
      const { [muscleGroup]: _, ...rest } = muscleGroups;
      setMuscleGroups(rest);
      if (selectedMuscleGroup === muscleGroup) {
        setSelectedMuscleGroup('');
      }
    } catch (error) {
      console.error('Error deleting muscle group:', error);
    }
  };

  const handleUpdateMuscleGroup = async (oldName: string) => {
    if (!editName.trim() || editName === oldName) {
      setEditMode(null);
      setEditName('');
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/api/workouts/${oldName}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newName: editName,
        }),
      });
      
      if (!res.ok) throw new Error('Failed to update muscle group');
      
      const exercises = muscleGroups[oldName];
      const { [oldName]: _, ...rest } = muscleGroups;
      setMuscleGroups({
        ...rest,
        [editName]: exercises,
      });
      
      if (selectedMuscleGroup === oldName) {
        setSelectedMuscleGroup(editName);
      }
      
      setEditMode(null);
      setEditName('');
    } catch (error) {
      console.error('Error updating muscle group:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/images/malevolant-shrine.png')] bg-cover bg-center opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      <NavBar />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        {/* Title Section */}
        <motion.div
          className="text-center mb-12 mt-16"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
            Workout Admin Page
          </h1>
          <div className="w-24 h-1 mx-auto bg-gradient-to-r from-red-500 to-orange-500 rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Muscle Group */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
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
                    placeholder="Enter muscle group name"
                    className="bg-black/50 text-orange-200 placeholder:text-orange-900/50"
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

          {/* Add Exercise */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-black/70 border-red-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-red-400">
                  <Shield className="mr-2 h-5 w-5" />
                  Add Exercise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-orange-200">Select Muscle Group</Label>
                  <Select
                    value={selectedMuscleGroup}
                    onValueChange={setSelectedMuscleGroup}
                  >
                    <SelectTrigger className="bg-black/50 text-orange-200 border-red-500/20">
                      <SelectValue placeholder="Select muscle group" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(muscleGroups).map((group) => (
                        <SelectItem key={group} value={group} className="text-orange-200">
                          {group}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Input
                    value={newExercise}
                    onChange={(e) => setNewExercise(e.target.value)}
                    placeholder="Enter exercise name"
                    className="bg-black/50 text-orange-200 placeholder:text-orange-900/50"
                  />
                  <Button
                    onClick={handleAddExercise}
                    className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                    disabled={!selectedMuscleGroup}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Current Workouts */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8"
        >
          <Card className="bg-black/70 border-red-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-red-400">
                <Shield className="mr-2 h-5 w-5" />
                Current Workouts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(muscleGroups).map(([group, exercises]) => (
                  <div key={group} className="bg-black/40 p-4 rounded-lg border border-red-500/10">
                    <div className="flex items-center justify-between mb-4">
                      {editMode === group ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="bg-black/50 w-48 text-orange-200"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-400 hover:text-green-300"
                            onClick={() => handleUpdateMuscleGroup(group)}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-gray-300"
                            onClick={() => {
                              setEditMode(null);
                              setEditName('');
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-orange-400">{group}</h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-orange-400 hover:text-orange-300"
                            onClick={() => {
                              setEditMode(group);
                              setEditName(group);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-red-400"
                        onClick={() => handleDeleteMuscleGroup(group)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {exercises.map((exercise) => (
                        <div
                          key={exercise}
                          className="flex items-center justify-between bg-black/30 p-2 rounded border border-red-500/10"
                        >
                          <span className="text-sm text-orange-200">{exercise}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-orange-400 hover:text-red-400"
                            onClick={() => handleDeleteExercise(group, exercise)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
