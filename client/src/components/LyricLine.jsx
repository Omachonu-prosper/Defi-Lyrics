import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import LoadingBubbles from './LoadingBubbles';

const LyricLine = ({ line, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      setIsLoading(true);
      setTimeout(() => {
        setIsOpen(true);
        setIsLoading(false);
      }, 800); // Simulate a delay
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 * index }}
      className="mb-2"
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        onClick={handleClick}
        className="cursor-pointer flex justify-between items-center"
      >
        <p className="text-lg">{line.text}</p>
      </motion.div>
      <AnimatePresence>
        {isLoading && <LoadingBubbles />}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="pl-4 border-l-2 border-purple-200"
          >
            <div className="mb-2">
              <h3 className="font-semibold text-md text-purple-700">Meaning</h3>
              <p className="text-gray-600">{line.meaning}</p>
            </div>
            <div>
              <h3 className="font-semibold text-md text-purple-700">Translation</h3>
              <p className="text-gray-600">{line.translation}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LyricLine;