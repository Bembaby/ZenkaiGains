"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Dumbbell, Plus, X, Sword, Scroll } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SplitsNavBar from "@/components/ui/splits-nav-bar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Split {
  id: number;
  name: string;
  muscleGroups: string[];
}

export default function SplitsPage() {
  const [splitName, setSplitName] = useState("");
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([]);
  const [existingSplits, setExistingSplits] = useState<Split[]>([
    { id: 1, name: "Shinobi Split", muscleGroups: ["Push", "Pull", "Legs"] },
    { id: 2, name: "Saiyan Power", muscleGroups: ["Upper", "Lower"] },
    { id: 3, name: "Demon Slayer", muscleGroups: ["Full Body"] },
  ]);

  const availableMuscleGroups = [
    "Push",
    "Pull",
    "Legs",
    "Upper",
    "Lower",
    "Core",
    "Full Body",
  ];

  const handleAddMuscleGroupToSplit = (group: string) => {
    setSelectedMuscleGroups([...selectedMuscleGroups, group]);
  };

  const handleRemoveMuscleGroup = (index: number) => {
    setSelectedMuscleGroups(selectedMuscleGroups.filter((_, i) => i !== index));
  };

  const handleCreateSplit = async () => {
    // TODO: Implement backend integration
    console.log("Creating split:", { name: splitName, muscleGroups: selectedMuscleGroups });
  };

  const handleSelectSplit = async (split: Split) => {
    // TODO: Implement backend integration
    console.log("Selected split:", split);
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Image with Overlay */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{ 
          backgroundImage: 'url("/images/infinite_void.jpg")',
          filter: 'brightness(0.6)'
        }}
      />
      
      <SplitsNavBar />

      <main className="relative z-10 container mx-auto pt-20 px-4 py-8">
        <motion.div
          className="text-center mb-12"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-violet-600 mb-4">
            Forge Your Path
          </h1>
          <p className="text-purple-200 text-lg">
            Create your legendary workout split or choose from existing templates
          </p>
        </motion.div>

        <Tabs defaultValue="create" className="max-w-4xl mx-auto">
          <TabsList className="grid grid-cols-2 w-[400px] mx-auto mb-8 bg-purple-950/50">
            <TabsTrigger 
              value="create"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-purple-200"
            >
              <Sword className="w-4 h-4 mr-2" />
              Create New
            </TabsTrigger>
            <TabsTrigger 
              value="select"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-purple-200"
            >
              <Scroll className="w-4 h-4 mr-2" />
              Select Existing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <Card className="border-purple-500/20 bg-purple-950/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-purple-400">
                  <Dumbbell className="mr-2 h-5 w-5" />
                  Design Your Workout Split
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="splitName" className="text-purple-200 mb-2 block">Split Name</Label>
                  <Input
                    id="splitName"
                    value={splitName}
                    onChange={(e) => setSplitName(e.target.value)}
                    placeholder="e.g., Ultra Instinct"
                    className="bg-purple-950/50 border-purple-500/20 text-purple-200 placeholder:text-purple-400/50"
                  />
                </div>

                <div>
                  <Label className="text-purple-200 mb-2 block">Available Muscle Groups</Label>
                  <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/20 scrollbar-track-black/20">
                    {availableMuscleGroups.map((group) => (
                      <Button
                        key={group}
                        variant="outline"
                        onClick={() => handleAddMuscleGroupToSplit(group)}
                        className="border-purple-500/20 text-purple-200 hover:bg-purple-500/20 hover:text-purple-100 flex-shrink-0"
                        disabled={selectedMuscleGroups.includes(group)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        {group}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-purple-200 mb-2 block">Selected Muscle Groups (Order matters)</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedMuscleGroups.map((group, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-purple-800/30 text-purple-200 px-3 py-1.5 rounded-lg"
                      >
                        <span>{group}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMuscleGroup(index)}
                          className="ml-2 hover:bg-purple-700/30 p-1 h-auto"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleCreateSplit}
                  disabled={!splitName || selectedMuscleGroups.length === 0}
                  className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white"
                >
                  Create Split
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="select">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {existingSplits.map((split) => (
                <motion.div
                  key={split.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-purple-500/20 bg-purple-950/30 backdrop-blur-sm hover:bg-purple-900/40 transition-colors cursor-pointer"
                        onClick={() => handleSelectSplit(split)}>
                    <CardHeader>
                      <CardTitle className="text-purple-400">{split.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {split.muscleGroups.map((group, index) => (
                          <span
                            key={index}
                            className="bg-purple-800/30 text-purple-200 px-3 py-1 rounded-lg text-sm"
                          >
                            {group}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
