'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function BeginnerSplitsPage() {
  const router = useRouter();

  // Array of beginner splits with anime/gym bro flavor
  const beginnerSplits = [
    {
      title: "3-Day Full-Body Anime Assault",
      description: "Unleash your inner warrior with full-body routines.",
      details: "Channel the strength of your favorite anime heroes with explosive compound lifts and dynamic movements."
    },
    {
      title: "2-Day Dynamic Training",
      description: "Short on time? Ignite your passion with dynamic duo sessions.",
      details: "This routine blends high-intensity circuits and explosive moves that push you to new limits."
    },
    {
      title: "Circuit of Champions",
      description: "Feel like a champion in every rep with fast-paced circuits.",
      details: "Endure a relentless series of exercises designed to build raw power and unstoppable energy."
    },
    {
      title: "Push/Pull: The Legendary Split",
      description: "Train like a true anime warrior by splitting your workouts.",
      details: "Alternate between push and pull movements focusing on power, precision, and that extra edge."
    }
  ];

  return (
    <div 
      className="min-h-screen bg-cover bg-center" 
      style={{ backgroundImage: "url('/anime-gym-bg.jpg')" }}  // Ensure you have this background image or update the URL.
    >
      <div className="bg-black bg-opacity-70 min-h-screen">
        <div className="container mx-auto py-12 px-4">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white text-center mb-8 drop-shadow-lg">
            Beginner Workout Splits: Anime Edition
          </h1>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
            {beginnerSplits.map((split, index) => (
              <Card 
                key={index} 
                className="bg-gray-800 bg-opacity-80 border border-gray-700 hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
              >
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-yellow-300">
                    {split.title}
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-300">
                    {split.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-100">{split.details}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Button 
              onClick={() => router.back()} 
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg font-semibold shadow-xl"
            >
              Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
