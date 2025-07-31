import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedPage from './AnimatedPage';

function Results() {
  const { searchTerm } = useParams();

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-lg w-full">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Your search term is...
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-2xl text-purple-600 font-semibold"
          >
            {searchTerm}
          </motion.p>
        </div>
      </div>
    </AnimatedPage>
  );
}

export default Results;