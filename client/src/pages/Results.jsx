import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import AnimatedPage from "./AnimatedPage";
import Breadcrumbs from "../components/Breadcrumbs";
import LoadingBubbles from "../components/LoadingBubbles";
import { searchSongs } from "../api/lyricsApi";

const PAGE_SIZE = 10;

function Results() {
  const { searchTerm } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [input, setInput] = useState(searchTerm || "");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loader = useRef(null);

  useEffect(() => {
    setResults([]);
    setPage(1);
    setHasMore(true);
    setError("");
    setInput(searchTerm || "");
  }, [searchTerm]);

  useEffect(() => {
    if (!searchTerm) return;
    setIsLoading(true);
    setError("");
    searchSongs(searchTerm, page, PAGE_SIZE)
      .then((newResults) => {
        setResults((prev) =>
          page === 1 ? newResults : [...prev, ...newResults]
        );
        setHasMore(newResults.length === PAGE_SIZE);
      })
      .catch(() => setError("Failed to fetch results"))
      .finally(() => setIsLoading(false));
  }, [searchTerm, page]);

  // Infinite scroll observer
  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !isLoading) {
        setPage((prev) => prev + 1);
      }
    },
    [hasMore, isLoading]
  );

  useEffect(() => {
    const option = { root: null, rootMargin: "20px", threshold: 1.0 };
    const observer = new window.IntersectionObserver(handleObserver, option);
    if (loader.current) observer.observe(loader.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  const handleCardClick = (id) => {
    navigate(`/songs/${id}`, { state: { searchTerm } });
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      navigate(`/search/${encodeURIComponent(input.trim())}`);
    }
  };

  const crumbs = [
    { label: "Home", link: "/" },
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
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Results for "
              <span className="text-purple-600">{searchTerm}</span>"
            </h1>
            <form onSubmit={handleSearchSubmit} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  className="w-full border-2 border-gray-300 bg-white text-gray-900 rounded-full py-3 pl-5 pr-12 text-lg focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="Search for an artist or their music..."
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-600 transition-colors"
                  aria-label="Search"
                >
                  <Icon icon="mdi:arrow-right-circle" className="h-7 w-7" />
                </motion.button>
              </div>
            </form>
          </motion.div>

          {error ? (
            <div>{error}</div>
          ) : (
            <div className="space-y-4">
              {results.length > 0 ? (
                results.map((song, index) => (
                  <motion.div
                    key={song.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex items-center p-4 cursor-pointer hover:shadow-md hover:border-purple-300 transition-all"
                    onClick={() => handleCardClick(song.id)}
                  >
                    <div className="w-24 h-24 bg-gray-200 rounded-md flex-shrink-0"></div>
                    <div className="ml-4">
                      <h2 className="text-xl font-bold text-gray-800">
                        {song.title}
                      </h2>
                      <p className="text-md text-gray-600">{song.artist}</p>
                      <a
                        href={song.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View on Genius
                      </a>
                    </div>
                  </motion.div>
                ))
              ) : (
                !isLoading && (
                  <div className="text-center py-4 text-gray-500">
                    No results found.
                  </div>
                )
              )}
              <div ref={loader} />
              {isLoading && (
                <div className="flex justify-center items-center h-32">
                  <LoadingBubbles />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}

export default Results;