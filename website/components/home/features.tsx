"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const features = [
  { step: "Step 1", content: "Plug existing cameras into the system to stream live video for AI processing." },
  { step: "Step 2", content: "Each video frame is analyzed in real-time to detect violations with high accuracy." },
  { step: "Step 3", content: "Violations automatically trigger alerts and notify relevant personnel immediately." },
];

const FeatureSection = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [progress, setProgress] = useState(0);
  const [, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (progress < 100) {
        setProgress((prev) => prev + 3.33);
      } else {
        setCurrentFeature((prev) => (prev + 1) % features.length);
        setProgress(0);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [progress]);

  return (
    <div className="flex justify-center items-center p-8 md:p-12 min-h-screen">
      <div className="mx-auto w-full max-w-7xl">
        <h2 className="mb-10 md:mb-12 font-extrabold text-3xl md:text-4xl lg:text-5xl text-center">How It Works</h2>
        <div className="flex flex-col mx-auto max-w-xl">
          {/* Features List */}
          <div className="space-y-8 order-2 md:order-1">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-6 md:gap-8"
                initial={{ opacity: 0.3 }}
                animate={{ opacity: index === currentFeature ? 1 : 0.3 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className={`w-8 h-8 md:w-10 md:h-10 text-secondary rounded-full flex items-center justify-center ${index === currentFeature ? "bg-blue-500 scale-110" : "bg-gray-500"
                    } border-2 ${index === currentFeature ? "border-blue-400" : "border-gray-400"
                    }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="font-semibold text-lg">{index + 1}</span>
                </motion.div>

                <div className="flex-1">
                  <h3 className="font-semibold text-xl md:text-2xl">{feature.step}</h3>
                  <p className="text-sm md:text-lg">{feature.content}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureSection;
