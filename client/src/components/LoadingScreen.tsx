import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const LoadingScreen = ({ message }: { message?: string }) => {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        setDimensions({
            width: window.innerWidth,
            height: window.innerHeight
        });
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-red-900/20"></div>
            
            {/* Animated power-up effect */}
            <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="relative w-32 h-32">
                    {/* Outer ring */}
                    <motion.div
                        className="absolute inset-0 border-4 border-red-500 rounded-full"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 0.8, 0.5],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                    
                    {/* Inner ring */}
                    <motion.div
                        className="absolute inset-4 border-4 border-red-400 rounded-full"
                        animate={{
                            scale: [1, 0.8, 1],
                            opacity: [0.8, 0.5, 0.8],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.5,
                        }}
                    />
                    
                    {/* Center dot */}
                    <motion.div
                        className="absolute inset-8 bg-red-500 rounded-full"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [1, 0.8, 1],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                </div>
            </motion.div>

            {/* Loading text */}
            <motion.div
                className="relative z-10 text-center mt-40"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <h2 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">
                    {message || "POWERING UP"}
                </h2>
                <p className="text-gray-400 text-sm">Preparing your training session...</p>
            </motion.div>

            {/* Anime-style energy particles */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-red-500 rounded-full"
                        initial={{
                            x: Math.random() * dimensions.width,
                            y: Math.random() * dimensions.height,
                            opacity: 0,
                        }}
                        animate={{
                            y: [null, -100],
                            opacity: [0, 0.5, 0],
                        }}
                        transition={{
                            duration: 2 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                            ease: "easeOut",
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default LoadingScreen;
