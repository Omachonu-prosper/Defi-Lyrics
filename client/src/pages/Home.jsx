import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import AnimatedPage from './AnimatedPage';

function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim() === '') {
      setError('Please enter a search term.');
      return;
    }
    navigate(`/search/${searchTerm}`);
  };

  const handleChange = (e) => {
    setSearchTerm(e.target.value);
    if (error) {
      setError('');
    }
  };

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
            Define the Lyrics
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-md text-gray-600 mb-8"
          >
            What song is on your mind?
          </motion.p>
          <motion.form
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            onSubmit={handleSubmit}
          >
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={handleChange}
                className={`w-full border-2 ${error ? 'border-red-500' : 'border-gray-300'} bg-white text-gray-900 rounded-full py-3 pl-5 pr-12 text-lg focus:outline-none focus:border-purple-500 transition-colors`}
                placeholder="Enter a song title..."
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-600 transition-colors"
              >
                <Icon icon="mdi:arrow-right-circle" className="h-7 w-7" />
              </motion.button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </motion.form>
        </div>
      </div>
    </AnimatedPage>
  );
}

export default Home;
