"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import LoadingScreen from "@/components/LoadingScreen";
import { useAuthRedirect } from "@/hooks/auth";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import NavBar from "@/components/ui/nav-bar";

export default function LandingPage() {
  const router = useRouter();
  const { isAuthLoading, isAuthenticated } = useAuthRedirect({
    redirectTo: "/home",
    protectedRoute: false,
    shouldRedirect: false
  });

  if (isAuthLoading) {
    return <LoadingScreen />;
  }

  const handleLoginClick = () => {
    // If already authenticated, push to /home
    if (isAuthenticated) {
      router.push("/home");
    } else {
      router.push("/login");
    }
  };
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Navigation Bar */}
      <NavBar />

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center p-8 overflow-hidden min-h-screen">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-center z-0"
          style={{ 
            backgroundImage: "url('/images/anime-gym-bg.jpg')", 
            opacity: 0.4,
            backgroundSize: "cover",
            backgroundPosition: "center",
            width: "100vw",
            height: "100vh"
          }}
        ></div>

        {/* Full-width silhouette */}
        <div className="absolute inset-0 z-5 overflow-hidden opacity-80">
          <img
            src="/images/anime-hero-silhouette.png"
            alt="Anime silhouette"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Glowing overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/50 via-black/40 to-red-900/50 z-10"></div>

        {/* Text & CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-20"
        >
          <h1 className="text-5xl sm:text-7xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-red-400 drop-shadow-lg">
            POWER UP YOUR FITNESS
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mb-8 font-medium drop-shadow-lg text-center mx-auto">
            Train like your favorite anime heroes. Break your limits and transform your body!
          </p>
          <div className="space-x-6">
            <Button
              onClick={handleLoginClick}
              size="lg"
              className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-lg px-8 py-6 rounded-md"
            >
              JOIN THE BATTLE
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/register')}
              size="lg"
              className="border-2 border-red-600 text-red-400 hover:bg-red-800/20 text-lg px-8 py-6 rounded-md"
            >
              START YOUR JOURNEY
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Main Content: Workout Split Cards with Anime Themes */}
      <section className="container mx-auto px-4 py-16 relative z-10">
        <h2 className="text-3xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">
          CHOOSE YOUR TRAINING ARC
        </h2>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Beginner Card */}
          <motion.div
            whileHover={{ y: -10, scale: 1.03 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Card
              className="cursor-pointer bg-gradient-to-br from-gray-900 to-gray-800 border-t-2 border-green-500 shadow-lg shadow-green-500/20 text-white h-full"
              onClick={() => router.push('/splits/beginner')}
            >
              <div className="h-48 relative overflow-hidden bg-gradient-to-br from-green-900 to-green-800">
                <img
                  src="/images/anime-beginner.jpg"
                  alt="Beginner anime character"
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-full object-contain"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-50"></div>
              </div>
              <CardHeader>
                <CardTitle className="text-green-400">ROOKIE TRAINING</CardTitle>
                <CardDescription className="text-gray-300">
                  First steps to awakening your power
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Master the fundamentals and build your foundation with these beginner-friendly 3-day training splits inspired by anime newcomers.
                </p>
                <Button className="mt-4 bg-green-600 hover:bg-green-700">Start Training</Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Intermediate Card */}
          <motion.div
            whileHover={{ y: -10, scale: 1.03 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Card
              className="cursor-pointer bg-gradient-to-br from-gray-900 to-gray-800 border-t-2 border-blue-500 shadow-lg shadow-blue-500/20 text-white h-full"
              onClick={() => router.push('/splits/intermediate')}
            >
              <div className="h-48 relative overflow-hidden bg-gradient-to-br from-blue-900 to-blue-800">
                <img
                  src="/images/anime-intermediate.jpg"
                  alt="Intermediate anime character"
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-full object-contain"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-50"></div>
              </div>
              <CardHeader>
                <CardTitle className="text-blue-400">LIMIT BREAKER</CardTitle>
                <CardDescription className="text-gray-300">
                  Push beyond your current power level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Intensify your training with these 4-5 day splits that will challenge your limits, just like your favorite characters during their power-up arcs.
                </p>
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700">Level Up</Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Advanced Card */}
          <motion.div
            whileHover={{ y: -10, scale: 1.03 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Card
              className="cursor-pointer bg-gradient-to-br from-gray-900 to-gray-800 border-t-2 border-red-500 shadow-lg shadow-red-500/20 text-white h-full"
              onClick={() => router.push('/splits/advanced')}
            >
              <div className="h-48 relative overflow-hidden bg-gradient-to-br from-red-900 to-red-800">
                <img
                  src="/images/anime-advanced.jpg"
                  alt="Advanced anime character"
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-full object-contain"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-50"></div>
              </div>
              <CardHeader>
                <CardTitle className="text-red-400">ULTRA INSTINCT MODE</CardTitle>
                <CardDescription className="text-gray-300">
                  Unlock your final form
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Train like the legendary heroes with these intense 6+ day splits designed to push your body to its absolute limits for maximum transformation.
                </p>
                <Button className="mt-4 bg-red-600 hover:bg-red-700">Go Beyond</Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">
            LEGENDARY FEATURES
          </h2>

          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-gray-800/50 p-6 rounded-lg border-l-4 border-red-500">
              <div className="text-red-500 text-3xl mb-4">🔥</div>
              <h3 className="text-xl font-bold mb-2 text-white">Progress Tracking</h3>
              <p className="text-gray-400">
                Monitor your strength and endurance gains with detailed progress charts, just like power level tracking in your favorite anime.
              </p>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-lg border-l-4 border-red-500">
              <div className="text-red-500 text-3xl mb-4">💪</div>
              <h3 className="text-xl font-bold mb-2 text-white">Technique Guides</h3>
              <p className="text-gray-400">
                Perfect your form with anime-inspired technique guides that break down each movement like a special move tutorial.
              </p>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-lg border-l-4 border-red-500">
              <div className="text-red-500 text-3xl mb-4">🏆</div>
              <h3 className="text-xl font-bold mb-2 text-white">Achievement System</h3>
              <p className="text-gray-400">
                Unlock badges and achievements as you complete workouts and reach new milestones in your fitness journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">
            WARRIOR TESTIMONIALS
          </h2>

          <div className="grid gap-8 md:grid-cols-2">
            {/* First Testimonial */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl border border-gray-700 relative mt-12">
              <div className="absolute -top-20 left-4 w-16 h-24">
                <img 
                  src="/images/anime-user-1.jpg" 
                  alt="Katsuki M." 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="pt-4 pl-20">
                <p className="text-gray-300 italic mb-4">
                  "This training program helped me increase my power level by over 9000! The beginner routines were perfect for someone just starting their hero journey."
                </p>
                <p className="text-red-500 font-bold">- Katsuki M.</p>
              </div>
            </div>

            {/* Second Testimonial */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl border border-gray-700 relative mt-12">
              <div className="absolute -top-20 left-4 w-16 h-24">
                <img 
                  src="/images/anime-user-2.jpg" 
                  alt="Mikasa A." 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="pt-4 pl-20">
                <p className="text-gray-300 italic mb-4">
                  "The advanced workout splits pushed me beyond my limits. I've never felt stronger! Now I can protect my friends with my newfound strength."
                </p>
                <p className="text-red-500 font-bold">- Mikasa A.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-red-900 to-black relative overflow-hidden">
        <div
          className="absolute inset-0 bg-center opacity-20"
          style={{ 
            backgroundImage: "url('/images/anime-action-bg.jpg')",
            backgroundSize: "cover"
          }}
        ></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold mb-6 text-white">BEGIN YOUR HERO'S JOURNEY TODAY</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join thousands of anime-inspired fitness warriors and unlock your true potential. Your transformation starts now!
          </p>
          <Button
            onClick={() => router.push('/register')}
            size="lg"
            className="bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-xl px-10 py-6 rounded-md"
          >
            CREATE YOUR LEGEND
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
