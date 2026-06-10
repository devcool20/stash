import { motion } from 'motion/react';
import Lottie from 'lottie-react';
import birdyAnimation from '../birdy.json';

interface SplashScreenProps {
  onFinish?: () => void;
  key?: string | number | null;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        {/* Lottie Bird Animation */}
        <div className="w-24 h-24 flex items-center justify-center">
          <Lottie 
            animationData={birdyAnimation} 
            loop={true} 
            className="w-24 h-24"
          />
        </div>

        {/* SVG Liquid Wave Typography */}
        <div className="h-16 flex items-center justify-center">
          <svg width="240" height="64" viewBox="0 0 240 64" className="select-none">
            <defs>
              <clipPath id="text-clip-large">
                <text
                  fontSize="48"
                  fontWeight="700"
                  fontFamily="Lato, sans-serif"
                  letterSpacing="-1.0px"
                  x="120"
                  y="48"
                  textAnchor="middle"
                >
                  Stash
                </text>
              </clipPath>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="50%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
              <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#EC4899" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#34D399" />
              </linearGradient>
            </defs>

            {/* Base Background Text */}
            <text
              fill="rgba(255, 255, 255, 0.15)"
              fontSize="48"
              fontWeight="700"
              fontFamily="Lato, sans-serif"
              letterSpacing="-1.0px"
              x="120"
              y="48"
              textAnchor="middle"
            >
              Stash
            </text>

            <g clipPath="url(#text-clip-large)">
              {/* Wave 1 */}
              <path
                className="wave-anim-1"
                d="M 0 28 Q 50 18, 100 28 T 200 28 T 300 28 T 400 28 T 500 28 L 500 80 L 0 80 Z"
                fill="url(#grad1)"
                opacity="0.6"
              />

              {/* Wave 2 */}
              <path
                className="wave-anim-2"
                d="M 0 32 Q 50 42, 100 32 T 200 32 T 300 32 T 400 32 T 500 32 L 500 80 L 0 80 Z"
                fill="url(#grad2)"
                opacity="0.85"
              />
            </g>
          </svg>
        </div>
      </div>
    </motion.div>
  );
}
