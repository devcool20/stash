import { motion, AnimatePresence } from 'motion/react';
import { Check, Loader2 } from 'lucide-react';

export interface LoadingState {
  text: string;
}

interface MultiStepLoaderProps {
  loadingStates: LoadingState[];
  loading: boolean;
  duration?: number;
  loop?: boolean;
  value?: number;
}

export function MultiStepLoader({
  loadingStates,
  loading,
  duration = 2000,
  loop = true,
  value: controlledValue,
}: MultiStepLoaderProps) {
  // If controlledValue is passed, use it; otherwise maintain local timer state
  const [localValue, setLocalValue] = React.useState(0);
  const activeValue = controlledValue !== undefined ? controlledValue : localValue;

  React.useEffect(() => {
    if (!loading || controlledValue !== undefined) {
      setLocalValue(0);
      return;
    }
    const interval = setInterval(() => {
      setLocalValue((prev) => {
        if (prev < loadingStates.length - 1) {
          return prev + 1;
        } else if (loop) {
          return 0;
        } else {
          return prev;
        }
      });
    }, duration);

    return () => clearInterval(interval);
  }, [loading, loadingStates.length, duration, loop, controlledValue]);

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 w-full h-full z-[150] flex items-center justify-center bg-black/90 backdrop-blur-2xl text-white select-none"
        >
          <div className="max-w-md w-full p-6 flex flex-col justify-center relative">
            <div className="space-y-6">
              <div className="flex flex-col mb-4">
                <span className="text-[9px] font-mono tracking-widest text-[#8A8A93] uppercase">INTELLIGENT SANDBOX CORE</span>
                <h3 className="font-display font-medium text-lg text-white mt-1">PROCESSING PIPELINE</h3>
              </div>

              <div className="space-y-4">
                {loadingStates.map((state, index) => {
                  const isCompleted = index < activeValue;
                  const isActive = index === activeValue;

                  return (
                    <motion.div
                      key={index}
                      initial={{ y: 15, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-center space-x-4 text-left"
                    >
                      <div className="relative flex items-center justify-center w-6 h-6 shrink-0">
                        {isCompleted ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-5 h-5 rounded-full bg-white flex items-center justify-center"
                          >
                            <Check className="w-3.5 h-3.5 text-black" strokeWidth={3} />
                          </motion.div>
                        ) : isActive ? (
                          <div className="w-5 h-5 rounded-full border border-white flex items-center justify-center relative">
                            <Loader2 className="w-3.5 h-3.5 text-white animate-spin" strokeWidth={2.5} />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center" />
                        )}
                      </div>

                      <span
                        className={`text-xs font-mono tracking-tight transition-colors duration-300 ${
                          isCompleted
                            ? 'text-white/40 line-through'
                            : isActive
                            ? 'text-white font-semibold'
                            : 'text-white/15'
                        }`}
                      >
                        {state.text}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import React from 'react';
