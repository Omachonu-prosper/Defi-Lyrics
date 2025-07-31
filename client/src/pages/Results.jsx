import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedPage from './AnimatedPage';
import Breadcrumbs from '../components/Breadcrumbs';
import LoadingBubbles from '../components/LoadingBubbles';

// Dummy data for demonstration
const dummyResults = [
  { id: 'lsdkdkd900', title: 'Bohemian Rhapsody', artist: 'Queen' },
  { id: 2, title: 'Stairway to Heaven', artist: 'Led Zeppelin' },
  { id: 3, title: 'Hotel California', artist: 'Eagles' },
  { id: 4, title: 'Like a Rolling Stone', artist: 'Bob Dylan' },
  { id: 5, title: 'Smells Like Teen Spirit', artist: 'Nirvana' },
];

function Results() {
  const { searchTerm } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // Simulate a 1.5 second fetch
    return () => clearTimeout(timer);
  }, []);

  const handleCardClick = (id) => {
    navigate(`/songs/${id}`, { state: { searchTerm } });
  };

  const crumbs = [
    { label: 'Home', link: '/' },
    { label: `Results for "${searchTerm}"` },
  ];

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-white p-4 sm:p-6 md:p-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <Breadcrumbs crumbs={crumbs} />
            <h1 className="text-3xl font-bold text-gray-900">
              Results for "<span className='text-purple-600'>{searchTerm}</span>"
            </h1>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingBubbles />
            </div>
          ) : (
            <div className="space-y-4">
              {dummyResults.map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex items-center p-4 cursor-pointer hover:shadow-md hover:border-purple-300 transition-all"
                  onClick={() => handleCardClick(result.id)}
                >
                  <div className="w-24 h-24 bg-gray-200 rounded-md flex-shrink-0"></div>
                  <div className="ml-4">
                    <h2 className="text-xl font-bold text-gray-800">{result.title}</h2>
                    <p className="text-md text-gray-600">{result.artist}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}

export default Results;