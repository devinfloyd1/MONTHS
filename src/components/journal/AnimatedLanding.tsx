'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedLandingProps {
  isVisible: boolean;
  onComplete: () => void;
}

export default function AnimatedLanding({ isVisible, onComplete }: AnimatedLandingProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#FEFDFB]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          onAnimationComplete={(definition) => {
            if (definition === 'exit') {
              onComplete();
            }
          }}
        >
          <motion.h1
            className="text-6xl md:text-8xl text-[#8B7355]"
            style={{ fontFamily: "'Dancing Script', cursive" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              duration: 0.8,
              ease: 'easeOut',
              exit: { duration: 0.4 }
            }}
            onAnimationComplete={() => {
              setTimeout(() => {
                onComplete();
              }, 1500);
            }}
          >
            MONTHS
          </motion.h1>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
