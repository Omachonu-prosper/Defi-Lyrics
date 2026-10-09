import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

const DefinitionProgress = ({ steps, startedAt }) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const elapsed = Math.max(0, Math.floor((now - startedAt) / 1000));

  return (
    <div className="max-w-xl mx-auto py-12">
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Defining this song</h2>
        <span className="text-sm text-gray-400 tabular-nums">{elapsed}s</span>
      </div>
      <ul className="space-y-3">
        {steps.length === 0 && (
          <li className="flex items-center gap-3 text-gray-500">
            <Icon icon="mdi:loading" className="h-5 w-5 animate-spin text-purple-500" />
            Connecting…
          </li>
        )}
        {steps.map((step, index) => {
          const isCurrent = index === steps.length - 1;
          return (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center gap-3 ${isCurrent ? 'text-gray-900' : 'text-gray-400'}`}
            >
              <Icon
                icon={isCurrent ? 'mdi:loading' : 'mdi:check-circle'}
                className={`h-5 w-5 flex-shrink-0 ${isCurrent ? 'animate-spin text-purple-500' : 'text-green-500'}`}
              />
              {step.message}
            </motion.li>
          );
        })}
      </ul>
      <p className="mt-8 text-sm text-gray-400">
        The first time a song is looked up, our AI writes and double-checks the explanation, which can take a minute.
        After that it loads instantly.
      </p>
    </div>
  );
};

export default DefinitionProgress;
