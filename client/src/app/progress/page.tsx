'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line as LineChart } from 'react-chartjs-2';
import NavBar from '@/components/ui/nav-bar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Flame,
  TrendingUp,
  Weight,
  Save,
  Calendar,
  X,
} from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Define data structures for logs
interface WorkoutLog {
  id: string;
  muscleGroup: string;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
  notes: string;
  date: string;
}

interface WeightLog {
  id: string;
  weight: number;
  date: string;
}

// Fallback muscle groups in case the API call fails
const defaultMuscleGroups = {
  Chest: ['Bench Press', 'Incline Press', 'Decline Press', 'Dumbbell Flyes'],
  Back: ['Pull-ups', 'Deadlifts', 'Barbell Rows', 'Lat Pulldowns'],
  Legs: ['Squats', 'Leg Press', 'Lunges', 'Calf Raises'],
  Shoulders: ['Military Press', 'Lateral Raises', 'Front Raises', 'Shrugs'],
  Arms: ['Bicep Curls', 'Tricep Extensions', 'Hammer Curls', 'Skull Crushers'],
  Core: ['Crunches', 'Planks', 'Russian Twists', 'Leg Raises'],
};

export default function ProgressPage() {
  // Logs and muscle groups are now loaded from the API.
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [muscleGroups, setMuscleGroups] = useState<{ [key: string]: string[] }>(defaultMuscleGroups);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('');
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [sets, setSets] = useState<string>('');
  const [reps, setReps] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [bodyWeight, setBodyWeight] = useState<string>('');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  // Fetch muscle groups from the backend API
  useEffect(() => {
    async function fetchMuscleGroups() {
      try {
        const res = await fetch('/api/workouts');
        if (!res.ok) throw new Error('Failed to fetch workouts');
        const data = await res.json();
        setMuscleGroups(data);
      } catch (error) {
        console.error('Error fetching muscle groups:', error);
        // Fallback to defaultMuscleGroups is already provided in state
      }
    }
    fetchMuscleGroups();
  }, []);

  // Fetch existing workout and weight logs from the backend
  useEffect(() => {
    async function fetchLogs() {
      try {
        const [workoutRes, weightRes] = await Promise.all([
          fetch('/api/workoutLogs'),
          fetch('/api/weightLogs')
        ]);
        if (!workoutRes.ok) throw new Error('Failed to fetch workout logs');
        if (!weightRes.ok) throw new Error('Failed to fetch weight logs');
        const workoutData = await workoutRes.json();
        const weightData = await weightRes.json();
        setWorkoutLogs(workoutData);
        setWeightLogs(weightData);
      } catch (error) {
        console.error('Error fetching logs:', error);
      }
    }
    fetchLogs();
  }, []);

  // Handle submitting a new workout log via the API
  const handleWorkoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: WorkoutLog = {
      id: Date.now().toString(), // Alternatively, let your backend generate the ID
      muscleGroup: selectedMuscleGroup,
      exercise: selectedExercise,
      sets: Number(sets),
      reps: Number(reps),
      weight: Number(weight),
      notes,
      date: new Date().toISOString(),
    };
    try {
      const res = await fetch('/api/workoutLogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog),
      });
      if (!res.ok) {
        throw new Error('Failed to save workout log');
      }
      // Optimistically update the state with the new log
      setWorkoutLogs([...workoutLogs, newLog]);
      // Reset form fields
      setSelectedExercise('');
      setSets('');
      setReps('');
      setWeight('');
      setNotes('');
    } catch (error) {
      console.error(error);
    }
  };

  // Handle submitting a new weight log via the API
  const handleWeightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: WeightLog = {
      id: Date.now().toString(),
      weight: Number(bodyWeight),
      date: new Date().toISOString(),
    };
    try {
      const res = await fetch('/api/weightLogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog),
      });
      if (!res.ok) {
        throw new Error('Failed to save weight log');
      }
      setWeightLogs([...weightLogs, newLog]);
      setBodyWeight('');
    } catch (error) {
      console.error(error);
    }
  };

  // Prepare chart data for the weight progress graph
  const weightChartData = {
    labels: weightLogs.map(log => new Date(log.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Body Weight (kg)',
        data: weightLogs.map(log => log.weight),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'white',
        },
      },
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'white',
        },
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'white',
        },
      },
    },
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
          className="text-center mb-12"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
            PROGRESS TRACKER
          </h1>
          <div className="w-24 h-1 mx-auto bg-gradient-to-r from-red-500 to-orange-500 rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Workout Logging Section */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-black/70 border-red-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-red-400">
                  <Flame className="mr-2 h-5 w-5" />
                  Log Workout
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleWorkoutSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Muscle Group</Label>
                    <Select
                      value={selectedMuscleGroup}
                      onValueChange={setSelectedMuscleGroup}
                    >
                      <SelectTrigger className="bg-black/50">
                        <SelectValue placeholder="Select muscle group" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(muscleGroups).map((group) => (
                          <SelectItem key={group} value={group}>
                            {group}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Exercise</Label>
                    <Select
                      value={selectedExercise}
                      onValueChange={setSelectedExercise}
                      disabled={!selectedMuscleGroup}
                    >
                      <SelectTrigger className="bg-black/50">
                        <SelectValue placeholder="Select exercise" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedMuscleGroup &&
                          muscleGroups[selectedMuscleGroup].map((exercise) => (
                            <SelectItem key={exercise} value={exercise}>
                              {exercise}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Sets</Label>
                      <Input
                        type="number"
                        value={sets}
                        onChange={(e) => setSets(e.target.value)}
                        className="bg-black/50"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Reps</Label>
                      <Input
                        type="number"
                        value={reps}
                        onChange={(e) => setReps(e.target.value)}
                        className="bg-black/50"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Weight (kg)</Label>
                      <Input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="bg-black/50"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="bg-black/50"
                      placeholder="How did it feel? Any achievements?"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                  >
                    <Save className="mr-2 h-4 w-4" /> Save Workout
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Weight Tracking and Visualization Section */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-8"
          >
            {/* Weight Input */}
            <Card className="bg-black/70 border-red-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-red-400">
                  <Weight className="mr-2 h-5 w-5" />
                  Log Body Weight
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleWeightSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Weight (kg)</Label>
                    <Input
                      type="number"
                      value={bodyWeight}
                      onChange={(e) => setBodyWeight(e.target.value)}
                      className="bg-black/50"
                      placeholder="0"
                      step="0.1"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                  >
                    <Save className="mr-2 h-4 w-4" /> Log Weight
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Weight Progress Chart */}
            <Card className="bg-black/70 border-red-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-red-400">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Weight Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <LineChart data={weightChartData} options={chartOptions} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Logs Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8"
        >
          <Card className="bg-black/70 border-red-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-red-400">
                <Calendar className="mr-2 h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workoutLogs.slice().reverse().slice(0, 5).map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/40 p-4 rounded-lg border border-red-500/10"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-red-400">{log.exercise}</h3>
                        <p className="text-sm text-gray-400">{log.muscleGroup}</p>
                        <p className="text-sm text-gray-400">
                          {new Date(log.date).toLocaleDateString()} • {log.sets} sets • {log.reps} reps • {log.weight}kg
                        </p>
                        {log.notes && (
                          <p className="mt-2 text-sm text-gray-300">{log.notes}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-red-400"
                        onClick={async () => {
                          // Optional: Make an API call to delete this log on the backend.
                          try {
                            const res = await fetch(`/api/workoutLogs/${log.id}`, {
                              method: 'DELETE',
                            });
                            if (!res.ok) throw new Error('Failed to delete log');
                            setWorkoutLogs(workoutLogs.filter(l => l.id !== log.id));
                          } catch (error) {
                            console.error(error);
                          }
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
