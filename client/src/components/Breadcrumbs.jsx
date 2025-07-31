import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';

const Breadcrumbs = ({ crumbs }) => {
  return (
    <nav className="flex flex-wrap items-center text-sm text-gray-500 mb-4">
      {crumbs.map((crumb, index) => (
        <div key={index} className="flex items-center mr-2">
          {index > 0 && <Icon icon="mdi:chevron-right" className="h-4 w-4 mx-1" />}
          {crumb.link ? (
            <Link to={crumb.link} className="hover:text-purple-600 transition-colors whitespace-nowrap">
              {crumb.label}
            </Link>
          ) : (
            <span className="font-semibold text-gray-700 whitespace-nowrap">{crumb.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumbs;