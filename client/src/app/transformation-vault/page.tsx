"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { Calendar as CalendarIcon, Upload, Camera, X } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NavBar from "@/components/ui/nav-bar";

const POSE_OPTIONS = [
  { value: "FRONT_LAT_SPREAD", label: "Front Lat Spread" },
  { value: "SIDE_TRICEPS", label: "Side Triceps" },
  { value: "FRONT_DOUBLE_BICEPS", label: "Front Double Biceps" },
  { value: "REAR_LAT_SPREAD", label: "Rear Lat Spread" },
  { value: "BACK_DOUBLE_BICEPS", label: "Back Double Biceps" },
  { value: "SIDE_CHEST", label: "Side Chest" },
  { value: "MOST_MUSCULAR", label: "Most Muscular" },
  { value: "SIDE_CHEST_POSE", label: "Side Chest Pose" },
  { value: "FREESTYLING", label: "Freestyling" },
];

interface Transformation {
  id: number;
  gcsObjectName: string; // Returned from the server
  dateTaken: string;     // e.g. "2025-03-24"
  pose: string;
}

interface GroupedTransformations {
  [pose: string]: Transformation[];
}

/**
 * SignedImage component fetches a short-lived signed URL from the backend
 * for a given gcsObjectName and displays the image.
 */
function SignedImage({ gcsObjectName, dateTaken }: { gcsObjectName: string; dateTaken: string; }) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSignedUrl() {
      try {
        const res = await fetch(
          `http://localhost:8080/api/transformation/image-url?objectName=${encodeURIComponent(gcsObjectName)}`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("Failed to get signed URL");
        const data = await res.json();
        setSignedUrl(data.signedUrl);
      } catch (e) {
        console.error(e);
      }
    }
    fetchSignedUrl();
  }, [gcsObjectName]);

  return (
    <>
      {signedUrl ? (
        <img
          src={signedUrl}
          alt={`Transformation from ${dateTaken}`}
          className="w-full h-full object-cover rounded-lg"
        />
      ) : (
        <div className="flex justify-center items-center min-h-full">
          Loading...
        </div>
      )}
    </>
  );
}

export default function TransformationVaultPage() {
  const router = useRouter();

  // State for uploading a new transformation
  const [date, setDate] = useState<Date>(new Date());
  const [pose, setPose] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // State for the gallery
  const [transformations, setTransformations] = useState<GroupedTransformations>({});
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [expandedPose, setExpandedPose] = useState<string | null>(null);

  useEffect(() => {
    fetchTransformations();
  }, []);

  const fetchTransformations = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/transformation", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch transformations");
      }
      const data: Transformation[] = await response.json();
      // Group transformations by pose
      const grouped = data.reduce((acc: GroupedTransformations, curr) => {
        if (!acc[curr.pose]) {
          acc[curr.pose] = [];
        }
        acc[curr.pose].push(curr);
        return acc;
      }, {});
      setTransformations(grouped);
    } catch (err) {
      setGalleryError(err instanceof Error ? err.message : "Failed to load transformations");
    } finally {
      setLoadingGallery(false);
    }
  };

  // Remove getImageUrl since we now use SignedImage component

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      setSelectedFile(file);
      const fileReader = new FileReader();
      fileReader.onload = () => setPreviewUrl(fileReader.result as string);
      fileReader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      setSelectedFile(file);
      const fileReader = new FileReader();
      fileReader.onload = () => setPreviewUrl(fileReader.result as string);
      fileReader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !pose) {
      setError("Please select an image and pose");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // 1) Request a pre-signed URL from the backend
      const getUploadUrlResponse = await fetch("http://localhost:8080/api/transformation/upload-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          fileName: selectedFile.name,
          contentType: selectedFile.type,
        }),
      });
      if (!getUploadUrlResponse.ok) {
        throw new Error("Failed to get upload URL");
      }
      const { uploadUrl, objectName } = await getUploadUrlResponse.json();

      // 2) Upload file to GCS using the pre-signed URL
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: selectedFile,
        headers: { "Content-Type": selectedFile.type },
      });
      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image");
      }

      // 3) Save transformation in the database
      const saveResponse = await fetch("http://localhost:8080/api/transformation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          imageKey: objectName, // The backend stores this into gcsObjectName
          date: format(date, "yyyy-MM-dd"),
          pose,
        }),
      });
      if (!saveResponse.ok) {
        throw new Error("Failed to save transformation");
      }

      setSuccess("Progress photo uploaded successfully!");
      fetchTransformations(); // refresh gallery

      // Reset form
      setSelectedFile(null);
      setPreviewUrl(null);
      setPose("");
      setDate(new Date());

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white relative">
      {/* Background layers */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/images/malevolant-shrine.png')] bg-cover bg-center opacity-60"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/70"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 via-transparent to-red-900/20"></div>
      </div>

      <NavBar />

      <div className="flex-1 overflow-y-auto z-10 pb-16">
        {/* Title Area */}
        <motion.div
          className="relative pt-20 pb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="container mx-auto px-4 relative z-10">
            <motion.h1
              className="text-5xl font-extrabold text-center mb-4 relative"
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="relative inline-block">
                <span className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-800 blur-lg opacity-50"></span>
                <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-red-500 animate-gradient">
                  TRANSFORMATION VAULT
                </span>
              </span>
            </motion.h1>

            <motion.div
              className="w-32 h-1 mx-auto bg-gradient-to-r from-red-500 via-orange-400 to-red-500 rounded-full mb-4"
              initial={{ width: 0 }}
              animate={{ width: 128 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />

            <motion.p
              className="text-center text-gray-300 text-lg max-w-md mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Document your legendary transformation journey with pride
            </motion.p>
          </div>
        </motion.div>

        {/* Alerts */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="fixed right-6 bottom-6 z-50 space-y-4 min-w-[300px] max-w-md">
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="p-4 bg-black/80 backdrop-blur-md border-l-4 border-green-500 text-green-200 rounded-lg flex items-center justify-between shadow-lg shadow-green-900/30"
                >
                  <span className="flex items-center">{success}</span>
                  <button
                    onClick={() => setSuccess(null)}
                    className="hover:bg-black/30 p-1 rounded-full transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="p-4 bg-black/80 backdrop-blur-md border-l-4 border-red-500 text-red-200 rounded-lg flex items-center justify-between shadow-lg shadow-red-900/30"
                >
                  <span className="flex items-center">{error}</span>
                  <button
                    onClick={() => setError(null)}
                    className="hover:bg-black/30 p-1 rounded-full transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Upload Form & Gallery Columns */}
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* --- UPLOAD FORM COLUMN --- */}
              <div className="lg:w-1/2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <Card className="bg-black/70 backdrop-blur-md border border-red-500/30 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(239,68,68,0.3)] relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 to-black/70 mix-blend-overlay"></div>

                    {/* Glow effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                    />

                    <CardHeader className="relative z-10 border-b border-red-500/20 pb-4">
                      <CardTitle className="text-red-400 flex items-center text-xl">
                        <Camera className="mr-2 h-6 w-6 text-red-500" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">
                          ADD NEW PROGRESS PHOTO
                        </span>
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="relative z-10 p-6">
                      <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Image Upload */}
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-red-600">
                            Progress Photo
                          </label>
                          <div
                            className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${
                              previewUrl
                                ? "border-red-500/40"
                                : "border-red-500/20 border-dashed"
                            } rounded-lg hover:border-red-500/50 transition-all duration-300 ${
                              !previewUrl ? "hover:bg-red-950/10" : ""
                            }`}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                          >
                            <div className="space-y-2 text-center">
                              {previewUrl ? (
                                <div className="relative">
                                  <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="max-h-64 rounded-lg mx-auto object-contain"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedFile(null);
                                      setPreviewUrl(null);
                                    }}
                                    className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-full hover:bg-black/90 transition-colors"
                                  >
                                    <X className="h-4 w-4 text-white" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <Upload className="mx-auto h-12 w-12 text-red-500" />
                                  <div className="flex text-sm text-gray-300 justify-center">
                                    <label className="relative cursor-pointer rounded-md font-medium text-red-400 hover:text-red-300 focus-within:outline-none">
                                      <span>Upload a file</span>
                                      <input
                                        type="file"
                                        className="sr-only"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                      />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                  </div>
                                  <p className="text-xs text-gray-400">
                                    PNG, JPG, GIF up to 5MB
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Date Selection */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-red-600">
                            Date Taken
                          </label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal border-red-500/30 text-red-50 bg-black/40 hover:border-red-500/50 transition-all"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4 text-red-400" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-black/95 border-red-500/30 text-red-50">
                              <Calendar
                                mode="single"
                                selected={date}
                                onSelect={(d) => d && setDate(d)}
                                initialFocus
                                className="bg-black/95 text-red-50"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Pose Selection */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-red-600">
                            Pose
                          </label>
                          <Select value={pose} onValueChange={setPose}>
                            <SelectTrigger className="w-full border-red-500/30 text-red-50 bg-black/40 hover:border-red-500/50 transition-all">
                              <SelectValue placeholder="Select a pose" />
                            </SelectTrigger>
                            <SelectContent className="bg-black/95 border-red-500/30 text-red-50">
                              {POSE_OPTIONS.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                  className="text-red-50 focus:bg-red-950/50 focus:text-red-200"
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                          <Button
                            type="submit"
                            disabled={isUploading || !selectedFile || !pose}
                            className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 shadow-lg shadow-red-600/20 hover:shadow-red-600/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                          >
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shine"></span>
                            {isUploading ? (
                              <div className="flex items-center justify-center">
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="mr-2"
                                >
                                  <Upload className="h-4 w-4" />
                                </motion.div>
                                Uploading...
                              </div>
                            ) : (
                              <>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Progress Photo
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* --- GALLERY COLUMN --- */}
              <div className="lg:w-1/2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <Card className="bg-black/70 backdrop-blur-md border border-red-500/30 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(239,68,68,0.3)] relative">
                    <CardHeader className="relative z-10 border-b border-red-500/20 pb-4">
                      <CardTitle className="text-red-400 flex items-center text-xl">
                        <Camera className="mr-2 h-6 w-6 text-red-500" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">
                          YOUR TRANSFORMATION GALLERY
                        </span>
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="relative z-10 p-6">
                      {loadingGallery ? (
                        <div className="flex justify-center items-center min-h-[200px]">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full"
                          />
                        </div>
                      ) : galleryError ? (
                        <div className="text-red-500 text-center p-4">{galleryError}</div>
                      ) : Object.keys(transformations).length === 0 ? (
                        <div className="text-gray-400 text-center p-4">
                          No transformations uploaded yet. Start your journey by adding your first progress photo!
                        </div>
                      ) : (
                        <div className="space-y-6 max-h-[600px] overflow-y-auto">
                          {Object.entries(transformations).map(([poseKey, images]) => (
                            <motion.div
                              key={poseKey}
                              className="border border-red-500/20 rounded-lg p-4 hover:border-red-500/40 transition-all"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              <button
                                className="w-full flex justify-between items-center text-left"
                                onClick={() =>
                                  setExpandedPose(expandedPose === poseKey ? null : poseKey)
                                }
                              >
                                <h3 className="text-xl font-semibold text-red-400">
                                  {POSE_OPTIONS.find((p) => p.value === poseKey)?.label || poseKey}
                                </h3>
                                <span className="text-gray-400">({images.length} photos)</span>
                              </button>

                              <AnimatePresence>
                                {expandedPose === poseKey && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="mt-4 grid grid-cols-2 gap-4"
                                  >
                                    {images.map((transformation) => {
                                      let displayDate = "Unknown Date";
                                      try {
                                        const parsed = parseISO(transformation.dateTaken);
                                        if (!isNaN(parsed.getTime())) {
                                          displayDate = format(parsed, "MMM d, yyyy");
                                        }
                                      } catch {
                                        // Leave displayDate as "Unknown Date"
                                      }

                                      return (
                                        <motion.div
                                          key={transformation.id}
                                          className="relative aspect-square group"
                                          whileHover={{ scale: 1.05 }}
                                        >
                                          <SignedImage
                                            gcsObjectName={transformation.gcsObjectName}
                                            dateTaken={transformation.dateTaken}
                                          />
                                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 rounded-b-lg">
                                            <p className="text-white text-sm">{displayDate}</p>
                                          </div>
                                        </motion.div>
                                      );
                                    })}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shine {
          animation: shine 1.5s;
        }
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
