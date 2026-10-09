import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LyricLine = ({ line, index, isOpen, onToggle }) => {
  if (line.section) {
    return (
      <p className="text-sm font-semibold uppercase tracking-wide text-gray-400 pt-4">
        {line.text}
      </p>
    );
  }

  const showTranslation =
    line.translation && line.translation.trim().toLowerCase() !== line.text.trim().toLowerCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(0.03 * index, 1) }}
      className="mb-2"
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        onClick={onToggle}
        className="cursor-pointer flex justify-between items-center"
      >
        <p className="text-lg">{line.text}</p>
      </motion.div>
      <AnimatePresence>
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
            {showTranslation && (
              <div>
                <h3 className="font-semibold text-md text-purple-700">Translation</h3>
                <p className="text-gray-600">{line.translation}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LyricLine;
