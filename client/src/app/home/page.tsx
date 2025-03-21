"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import LoadingScreen from "@/components/LoadingScreen";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import NavBar from "@/components/ui/nav-bar";

interface UserProfile {
  username: string;
  level: number;
  exp: number;
  nextLevel: number;
  workoutsCompleted: number;
  streak: number;
  profilePictureUrl: string;
}

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState<UserProfile | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:8080/auth/profile", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          router.push("/");
        } else {
          const user = await response.json();
          setUserData({
            username: user.username,
            level: user.powerLevel || 1,
            exp: user.exp || 0,
            nextLevel: 500, // Can be dynamically set later
            workoutsCompleted: user.completedWorkouts || 0,
            streak: user.streak || 0,
            profilePictureUrl: user.profilePictureUrl || "/images/default-profile.jpg",
          });
          setLoading(false);
        }
      } catch (error: unknown) {
        setError("Error checking authentication");
        router.push("/");
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:8080/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        setError("");
        window.location.href = "/";
      } else {
        setError("Logout failed");
      }
    } catch (error: unknown) {
      setError("Logout error");
    }
  };

  if (loading || !userData) return <LoadingScreen />;

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Navigation Bar */}
      <NavBar />

      {/* Hero Section with User Stats */}
      <section className="relative flex flex-col items-center justify-center p-8 overflow-hidden min-h-[50vh]">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-center z-0"
          style={{
            backgroundImage: "url('/images/dojo-background.jpg')",
            opacity: 0.4,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/50 via-black/40 to-red-900/50 z-10"></div>

        {/* User profile and stats */}
        <div className="relative z-20 w-full max-w-5xl flex flex-col md:flex-row items-center md:items-start justify-between">
          {/* Left side - Character avatar and basic stats */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-8 md:mb-0 flex flex-col items-center md:items-start"
          >
            <div className="relative">
              <div className="h-32 w-32 md:h-40 md:w-40 rounded-full overflow-hidden border-4 border-red-600 shadow-lg shadow-red-600/50">
                <img
                  src={userData.profilePictureUrl}
                  alt="Your avatar"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-red-600 rounded-full h-12 w-12 flex items-center justify-center text-xl font-bold border-2 border-black">
                {userData.level}
              </div>
            </div>
            <h2 className="text-2xl font-bold mt-4 mb-1">Welcome back, {userData.username}!</h2>
            <p className="text-gray-300">Power Level: {userData.level}</p>
            
            {/* Progress bar */}
            <div className="mt-2 w-full max-w-xs">
              <div className="text-sm flex justify-between">
                <span>EXP: {userData.exp}/{userData.nextLevel}</span>
                <span>{Math.round((userData.exp/userData.nextLevel) * 100)}%</span>
              </div>
              <div className="h-2 w-full bg-gray-700 rounded-full mt-1">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                  style={{ width: `${(userData.exp/userData.nextLevel) * 100}%` }}
                ></div>
              </div>
            </div>
          </motion.div>

          {/* Right side - Stats and achievements */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="bg-gray-900/80 p-6 rounded-lg border-l-4 border-red-500 w-full md:max-w-sm"
          >
            <h3 className="text-xl font-bold mb-4 text-red-400">BATTLE STATS</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold">{userData.workoutsCompleted}</div>
                <div className="text-sm text-gray-400">Workouts</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{userData.streak} 🔥</div>
                <div className="text-sm text-gray-400">Day Streak</div>
              </div>
            </div>
            <div className="mt-6">
              <Button
                onClick={() => router.push('/start-workout')}
                size="lg"
                className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-lg py-6 rounded-md"
              >
                START TODAY'S TRAINING
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content: Today's Training and Stats */}
      <section className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Current Program */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">
              YOUR CURRENT ARC: STRENGTH SAGA
            </h2>
            
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-t-2 border-red-500 shadow-lg shadow-red-500/20 text-white overflow-hidden">
              <div className="h-40 relative overflow-hidden">
                <img
                  src="/images/current-program-banner.jpg"
                  alt="Current training program"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4">
                  <h3 className="text-2xl font-bold">TITAN STRENGTH PROTOCOL</h3>
                  <p className="text-gray-300">Day 3 of 5: Upper Body Power</p>
                </div>
              </div>
              
              <CardContent className="pt-6">
                <h4 className="text-xl mb-4 font-semibold">Today's Training:</h4>
                
                <div className="space-y-4">
                  {/* Exercise List */}
                  <div className="bg-gray-800/50 p-4 rounded-md border-l-4 border-red-500 flex justify-between items-center">
                    <div>
                      <h5 className="font-bold">Bench Press</h5>
                      <p className="text-gray-400 text-sm">4 sets x 8 reps</p>
                    </div>
                    <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/20">
                      Start
                    </Button>
                  </div>
                  
                  <div className="bg-gray-800/50 p-4 rounded-md border-l-4 border-red-500 flex justify-between items-center">
                    <div>
                      <h5 className="font-bold">Weighted Pull-ups</h5>
                      <p className="text-gray-400 text-sm">4 sets x 6-8 reps</p>
                    </div>
                    <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/20">
                      Start
                    </Button>
                  </div>
                  
                  <div className="bg-gray-800/50 p-4 rounded-md border-l-4 border-red-500 flex justify-between items-center">
                    <div>
                      <h5 className="font-bold">Overhead Press</h5>
                      <p className="text-gray-400 text-sm">3 sets x 10 reps</p>
                    </div>
                    <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/20">
                      Start
                    </Button>
                  </div>
                  
                  <Button className="w-full bg-red-600 hover:bg-red-700 mt-4">
                    VIEW FULL WORKOUT
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Sidebar - Progress and Challenges */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">
              POWER METRICS
            </h2>
            
            {/* Weekly Activity */}
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-t-2 border-blue-500 shadow-lg shadow-blue-500/20 text-white mb-6">
              <CardHeader>
                <CardTitle className="text-blue-400">WEEKLY TRAINING</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  {/* Simple weekly calendar with activity dots */}
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="text-sm text-gray-400">{day}</div>
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center mt-2 
                        ${i < 3 ? 'bg-blue-500/80' : i === 3 ? 'border-2 border-dashed border-blue-500 text-blue-400' : 'bg-gray-700'}`}>
                        {i < 3 ? '✓' : i === 3 ? '!' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Challenges */}
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-t-2 border-green-500 shadow-lg shadow-green-500/20 text-white">
              <CardHeader>
                <CardTitle className="text-green-400">ACTIVE QUESTS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-800/50 p-3 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-bold">100 Push-Up Challenge</h5>
                      <span className="text-sm text-green-400">78/100</span>
                    </div>
                    <div className="h-2 w-full bg-gray-700 rounded-full">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: '78%' }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/50 p-3 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-bold">Weekly Consistency</h5>
                      <span className="text-sm text-green-400">3/5</span>
                    </div>
                    <div className="h-2 w-full bg-gray-700 rounded-full">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: '60%' }}
                      ></div>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full border-green-500 text-green-400 hover:bg-green-500/20">
                    VIEW ALL QUESTS
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Workout Programs Section */}
      <section className="py-12 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">
            TRAINING ARCS
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Program Cards */}
            <motion.div whileHover={{ y: -10, scale: 1.03 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Card className="cursor-pointer bg-gradient-to-br from-gray-900 to-gray-800 border-t-2 border-purple-500 shadow-lg shadow-purple-500/20 text-white h-full">
                <div className="h-40 relative overflow-hidden">
                  <img
                    src="/images/strength-program.jpg"
                    alt="Strength Training"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-purple-400">TITAN STRENGTH</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm mb-4">
                    Unlock superhuman strength with this high-intensity program focused on compound lifts.
                  </p>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">Start</Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ y: -10, scale: 1.03 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Card className="cursor-pointer bg-gradient-to-br from-gray-900 to-gray-800 border-t-2 border-blue-500 shadow-lg shadow-blue-500/20 text-white h-full">
                <div className="h-40 relative overflow-hidden">
                  <img
                    src="/images/hypertrophy-program.jpg"
                    alt="Hypertrophy Training"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-blue-400">ULTIMATE FORM</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm mb-4">
                    Build an impressive physique with this volume-focused program designed for maximum muscle growth.
                  </p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Start</Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ y: -10, scale: 1.03 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Card className="cursor-pointer bg-gradient-to-br from-gray-900 to-gray-800 border-t-2 border-green-500 shadow-lg shadow-green-500/20 text-white h-full">
                <div className="h-40 relative overflow-hidden">
                  <img
                    src="/images/endurance-program.jpg"
                    alt="Endurance Training"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-green-400">LIMITLESS STAMINA</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm mb-4">
                    Develop unstoppable endurance with this program designed to push your cardio to new heights.
                  </p>
                  <Button className="w-full bg-green-600 hover:bg-green-700">Start</Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ y: -10, scale: 1.03 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Card className="cursor-pointer bg-gradient-to-br from-gray-900 to-gray-800 border-t-2 border-yellow-500 shadow-lg shadow-yellow-500/20 text-white h-full">
                <div className="h-40 relative overflow-hidden">
                  <img
                    src="/images/agility-program.jpg"
                    alt="Agility Training"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-yellow-400">NINJA REFLEXES</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm mb-4">
                    Master lightning-fast movements and reactions with this agility-focused training regimen.
                  </p>
                  <Button className="w-full bg-yellow-600 hover:bg-yellow-700">Start</Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          <div className="text-center mt-8">
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-red-600 text-red-400 hover:bg-red-800/20 text-lg px-8 py-6 rounded-md"
            >
              EXPLORE ALL TRAINING ARCS
            </Button>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">
            TRAINING GUILD
          </h2>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Community Leaderboard */}
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-l-4 border-red-500 shadow-lg text-white">
              <CardHeader>
                <CardTitle>THIS WEEK'S TOP WARRIORS</CardTitle>
                <CardDescription className="text-gray-400">
                  The most dedicated heroes in our community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Leaderboard entries */}
                  <div className="flex items-center p-3 bg-gray-800/50 rounded-md">
                    <div className="font-bold text-xl mr-4 text-red-500">1</div>
                    <div className="h-10 w-10 rounded-full overflow-hidden mr-4">
                      <img src="/images/user-rank1.jpg" alt="Top ranked user" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <div className="font-bold">DragonSlayer92</div>
                      <div className="text-sm text-gray-400">Level 24 • 15 workouts</div>
                    </div>
                    <div className="text-xl font-bold text-yellow-400">🏆</div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-gray-800/50 rounded-md">
                    <div className="font-bold text-xl mr-4 text-red-500">2</div>
                    <div className="h-10 w-10 rounded-full overflow-hidden mr-4">
                      <img src="/images/user-rank2.jpg" alt="Second ranked user" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <div className="font-bold">TitanShifter</div>
                      <div className="text-sm text-gray-400">Level 22 • 12 workouts</div>
                    </div>
                    <div className="text-xl font-bold text-gray-400">🥈</div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-gray-800/50 rounded-md">
                    <div className="font-bold text-xl mr-4 text-red-500">3</div>
                    <div className="h-10 w-10 rounded-full overflow-hidden mr-4">
                      <img src="/images/user-rank3.jpg" alt="Third ranked user" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <div className="font-bold">UltraInstinct</div>
                      <div className="text-sm text-gray-400">Level 19 • 10 workouts</div>
                    </div>
                    <div className="text-xl font-bold text-amber-700">🥉</div>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full mt-4 border-red-500 text-red-400 hover:bg-red-800/20">
                  VIEW FULL RANKINGS
                </Button>
              </CardContent>
            </Card>
            
            {/* Community Events */}
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-l-4 border-blue-500 shadow-lg text-white">
              <CardHeader>
                <CardTitle>UPCOMING TOURNAMENTS</CardTitle>
                <CardDescription className="text-gray-400">
                  Join special events and challenges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Events */}
                  <div className="p-4 bg-gray-800/50 rounded-md border-l-4 border-yellow-500">
                    <div className="text-sm text-yellow-400 mb-1">STARTS IN 2 DAYS</div>
                    <h4 className="text-lg font-bold mb-1">30-Day Transformation Challenge</h4>
                    <p className="text-sm text-gray-400 mb-2">
                      Compete with others to make the most impressive transformation in 30 days.
                    </p>
                    <div className="flex justify-between text-sm">
                      <span>125 participants</span>
                      <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">Join</Button>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-800/50 rounded-md border-l-4 border-purple-500">
                    <div className="text-sm text-purple-400 mb-1">WEEKLY EVENT</div>
                    <h4 className="text-lg font-bold mb-1">Sunday Showdown: Max Lift</h4>
                    <p className="text-sm text-gray-400 mb-2">
                      Test your strength against other warriors in weekly max lift challenges.
                    </p>
                    <div className="flex justify-between text-sm">
                      <span>87 participants</span>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">Join</Button>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full mt-4 border-blue-500 text-blue-400 hover:bg-blue-800/20">
                  VIEW ALL EVENTS
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-br from-red-900 to-black relative overflow-hidden">
        <div
          className="absolute inset-0 bg-center opacity-20"
          style={{ 
            backgroundImage: "url('/images/anime-action-bg.jpg')",
            backgroundSize: "cover"
          }}
        ></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold mb-6 text-white">SURPASS YOUR LIMITS TODAY</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Ready to take on today's challenge? Push beyond your current power level and unlock new abilities!
          </p>
          <Button
            onClick={() => router.push('/start-workout')}
            size="lg"
            className="bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-xl px-10 py-6 rounded-md"
          >
            START YOUR TRAINING
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-10 text-center text-sm text-gray-500">
        <div className="container mx-auto px-4">
          <div className="flex justify-center space-x-6 mb-6">
            <a href="#" className="text-gray-400 hover:text-red-500">
              Instagram
            </a>
            <a href="#" className="text-gray-400 hover:text-red-500">
              Twitter
            </a>
            <a href="#" className="text-gray-400 hover:text-red-500">
              Discord
            </a>
            <a href="#" className="text-gray-400 hover:text-red-500">
              YouTube
            </a>
          </div>
          <p>© {new Date().getFullYear()} ZenkaiGains. All rights reserved.</p>
          <p className="mt-2 text-gray-600">Plus Ultra!</p>
        </div>
      </footer>
    </div>
  );
}