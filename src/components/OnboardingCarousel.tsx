import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface OnboardingSlide {
  id: string;
  title: string;
  desc: string;
  imageUrl: string;
}

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'slide-1',
    title: 'Welcome to Stash',
    desc: 'Your premium, private visual brain. Click dots or swipe to learn how to master it in seconds.',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'slide-2',
    title: 'Capture Everything',
    desc: 'Upload screenshots of clothes, recipes, travel spots, or articles to stash them.',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'slide-3',
    title: 'Local AI Analysis',
    desc: 'Our engine runs OCR, summarizes details, and classifies items into smart collections.',
    imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'slide-4',
    title: 'Aesthetic Collections',
    desc: 'Explore your items automatically cataloged under Shopping, Travel, Design, and Recipes.',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'slide-5',
    title: 'Textual Search',
    desc: 'Search for text contained inside your screenshots. Never lose a clipping again.',
    imageUrl: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=400',
  },
];

export default function OnboardingCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % ONBOARDING_SLIDES.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + ONBOARDING_SLIDES.length) % ONBOARDING_SLIDES.length);
  };

  return (
    <div className="my-3 flex flex-col w-full relative z-10 select-none">
      <span className="text-[10px] uppercase font-display tracking-widest text-[#8A8A93] font-bold mb-2.5 px-0.5">
        ONBOARDING GUIDE
      </span>

      {/* Slide Box */}
      <div className="relative overflow-hidden h-[124px] w-full glass-panel-base glass-border-diagonal bg-white/[0.04] rounded-2xl flex border border-white/5">
        <AnimatePresence mode="wait">
          {ONBOARDING_SLIDES.map((slide, index) => {
            if (index !== activeIndex) return null;
            return (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="absolute inset-0 flex flex-row"
              >
                {/* Slide Image */}
                <div className="w-[110px] h-full shrink-0 relative overflow-hidden">
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/10" />
                </div>

                {/* Slide Text Content */}
                <div className="flex-1 p-3.5 flex flex-col justify-center text-left">
                  <h4 className="text-[13px] font-bold text-white font-sans mb-1">
                    {slide.title}
                  </h4>
                  <p className="text-[10px] text-[#8A8A93] font-sans leading-relaxed">
                    {slide.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Carousel Click Interceptor for clicking directly on sides of card */}
        <div 
          onClick={handlePrev} 
          className="absolute left-0 top-0 bottom-0 w-12 cursor-pointer z-20"
          title="Previous Slide"
        />
        <div 
          onClick={handleNext} 
          className="absolute right-0 top-0 bottom-0 w-12 cursor-pointer z-20"
          title="Next Slide"
        />
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center items-center gap-1.5 mt-3">
        {ONBOARDING_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-350 cursor-pointer outline-none ${
              i === activeIndex 
                ? 'w-3.5 bg-white' 
                : 'w-1.5 bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
