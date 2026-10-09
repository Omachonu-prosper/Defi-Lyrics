import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import AnimatedPage from './AnimatedPage';
import Breadcrumbs from '../components/Breadcrumbs';
import LyricLine from '../components/LyricLine';
import DefinitionProgress from '../components/DefinitionProgress';
import { streamSongDefinition } from '../api/lyricsApi';

function SongDetails() {
  const { id } = useParams();
  const location = useLocation();
  const { searchTerm } = location.state || { searchTerm: 'your search' }; // Fallback
  const [song, setSong] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [steps, setSteps] = useState([]);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [attempt, setAttempt] = useState(0);
  const [openLines, setOpenLines] = useState(() => new Set());

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setSteps([]);
    setStartedAt(Date.now());
    return streamSongDefinition(id, {
      onProgress: (step) => setSteps((prev) => [...prev, step]),
      onResult: (data) => {
        setSong(data);
        setOpenLines(new Set());
        setIsLoading(false);
      },
      onError: (err) => {
        setError(err);
        setIsLoading(false);
      },
    });
  }, [id, attempt]);

  const definableLines = song
    ? song.lines.flatMap((line, index) => (line.section ? [] : [index]))
    : [];
  const allOpen = definableLines.length > 0 && definableLines.every((index) => openLines.has(index));

  const toggleLine = (index) => {
    setOpenLines((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleAll = () => setOpenLines(allOpen ? new Set() : new Set(definableLines));

  const crumbs = [
    { label: 'Home', link: '/' },
    { label: `Results for "${searchTerm}"`, link: `/search/${searchTerm}` },
    { label: song?.title || 'Song' },
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

          {isLoading ? (
            <DefinitionProgress steps={steps} startedAt={startedAt} />
          ) : error ? (
            <div className="max-w-xl mx-auto text-center py-16 text-gray-600">
              <Icon icon="mdi:alert-circle-outline" className="h-12 w-12 mx-auto mb-4 text-red-400" />
              <p className="text-lg text-gray-800">{error.msg}</p>
              {steps.length > 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  Failed while: {steps[steps.length - 1].message}
                </p>
              )}
              {error.request_id && (
                <p className="mt-2 text-sm text-gray-400">
                  Reference: <code className="font-mono">{error.request_id}</code>
                </p>
              )}
              {error.status !== 404 && error.status !== 422 && (
                <button
                  onClick={() => setAttempt((n) => n + 1)}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-2 text-white hover:bg-purple-700 transition-colors"
                >
                  <Icon icon="mdi:refresh" className="h-5 w-5" />
                  Try again
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {/* Left Column: Poster and Details */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="md:col-span-1"
              >
                {song.art_url ? (
                  <img
                    src={song.art_url}
                    alt={song.title}
                    className="w-full aspect-square object-cover rounded-lg shadow-md mb-6"
                  />
                ) : (
                  <div className="bg-slate-100 w-full h-auto aspect-square rounded-lg shadow-md mb-6 flex items-center justify-center">
                    <Icon icon="mdi:music-note" className="text-slate-400 h-24 w-24" />
                  </div>
                )}
                <div className="space-y-2">
                  <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{song.title}</h1>
                  <p className="text-2xl text-gray-600 font-medium">{song.artist}</p>
                  <div className="pt-4">
                    <div className="flex justify-between text-md text-gray-500">
                      <strong className="text-gray-700">Album</strong>
                      <span>{song.album || '—'}</span>
                    </div>
                    <hr className="my-2"/>
                    <div className="flex justify-between text-md text-gray-500">
                      <strong className="text-gray-700">Released</strong>
                      <span>{song.release_date || '—'}</span>
                    </div>
                    <hr className="my-2"/>
                    <div className="flex justify-between text-md text-gray-500">
                      <strong className="text-gray-700">Language</strong>
                      <span>{song.detected_language || '—'}</span>
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
                {song.low_confidence && (
                  <div className="mb-8 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-800 flex gap-3">
                    <Icon icon="mdi:alert-outline" className="h-6 w-6 flex-shrink-0" />
                    <p>
                      We're only {Math.round(song.confidence * 100)}% confident in this explanation.
                      Take it with a pinch of salt.
                    </p>
                  </div>
                )}
                <div className="mb-10">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">The Deeper Meaning</h2>
                  <p className="text-gray-700 text-lg leading-relaxed">{song.overall_meaning}</p>
                </div>
                <div className="mb-10">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Context</h2>
                  <p className="text-gray-700 text-lg leading-relaxed">{song.context}</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-3xl font-bold text-gray-900">Lyrics</h2>
                    <button
                      onClick={toggleAll}
                      className="inline-flex items-center gap-1 rounded-full border border-purple-200 px-4 py-1.5 text-sm font-medium text-purple-700 hover:bg-purple-50 transition-colors"
                    >
                      <Icon icon={allOpen ? 'mdi:unfold-less-horizontal' : 'mdi:unfold-more-horizontal'} className="h-5 w-5" />
                      {allOpen ? 'Collapse all' : 'Expand all'}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {song.lines.map((line, index) => (
                      <LyricLine
                        key={index}
                        line={line}
                        index={index}
                        isOpen={openLines.has(index)}
                        onToggle={() => toggleLine(index)}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}

export default SongDetails;
