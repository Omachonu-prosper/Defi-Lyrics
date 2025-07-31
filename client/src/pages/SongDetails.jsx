import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import AnimatedPage from './AnimatedPage';
import Breadcrumbs from '../components/Breadcrumbs';
import LyricLine from '../components/LyricLine';

// Dummy data for demonstration
const dummySong = {
  id: 'lsdkdkd900',
  title: 'Bohemian Rhapsody',
  artist: 'Queen',
  album: 'A Night at the Opera',
  year: '1975',
  lyrics: [
    { text: 'Is this the real life?', meaning: 'A question about the nature of reality.', translation: '¿Es esta la vida real?' },
    { text: 'Is this just fantasy?', meaning: 'A question about the nature of dreams.', translation: '¿Es esto solo fantasía?' },
    { text: 'Caught in a landslide,', meaning: 'A feeling of being overwhelmed.', translation: 'Atrapado en un derrumbe,' },
    { text: 'No escape from reality', meaning: 'A feeling of being trapped.', translation: 'Sin escape de la realidad' },
  ],
  overallMeaning: 'This song is a journey through the mind of a young man who has just killed someone and is about to be executed. It is a reflection on life, death, and the meaning of it all.'
};

function SongDetails() {
  const { id } = useParams();
  const location = useLocation();
  const { searchTerm } = location.state || { searchTerm: 'your search' }; // Fallback

  const crumbs = [
    { label: 'Home', link: '/' },
    { label: `Results for "${searchTerm}"`, link: `/search/${searchTerm}` },
    { label: dummySong.title },
  ];

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-white p-4 sm:p-6 md:p-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <Breadcrumbs crumbs={crumbs} />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Left Column: Poster and Details */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="md:col-span-1"
            >
              <div className="bg-slate-100 w-full h-auto aspect-square rounded-lg shadow-md mb-6 flex items-center justify-center">
                <Icon icon="mdi:music-note" className="text-slate-400 h-24 w-24" />
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{dummySong.title}</h1>
                <p className="text-2xl text-gray-600 font-medium">{dummySong.artist}</p>
                <div className="pt-4">
                  <div className="flex justify-between text-md text-gray-500">
                    <strong className="text-gray-700">Album</strong>
                    <span>{dummySong.album}</span>
                  </div>
                  <hr className="my-2"/>
                  <div className="flex justify-between text-md text-gray-500">
                    <strong className="text-gray-700">Year</strong>
                    <span>{dummySong.year}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Lyrics and Meaning */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="md:col-span-2"
            >
              <div className="mb-10">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Lyrics</h2>
                <div className="space-y-2">
                  {dummySong.lyrics.map((line, index) => (
                    <LyricLine key={index} line={line} index={index} />
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">The Deeper Meaning</h2>
                <p className="text-gray-700 text-lg leading-relaxed">{dummySong.overallMeaning}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}

export default SongDetails;
