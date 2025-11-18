import React from 'react';

// Improved Male Icon
export const IconMale: React.FC = () => (
  <svg
    width="20" // increased size
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="3" r="2" fill="#333942" /> {/* Head */}
    <rect x="11" y="5" width="2" height="7" fill="#333942" /> {/* Body */}
    <rect x="8" y="12" width="2" height="6" fill="#333942" /> {/* Left leg */}
    <rect x="14" y="12" width="2" height="6" fill="#333942" /> {/* Right leg */}
    <rect x="7" y="5" width="2" height="4" fill="#333942" /> {/* Left arm */}
    <rect x="15" y="5" width="2" height="4" fill="#333942" /> {/* Right arm */}
  </svg>
);

// Female Icon with skirt
export const IconFemale: React.FC = () => (
  <svg
    width="20" // increased size
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="3" r="2" fill="#f04b55" /> {/* Head */}
    <path d="M10 5h4l2 6h-8l2-6z" fill="#f04b55" /> {/* Skirt */}
    <rect x="11" y="11" width="2" height="6" fill="#f04b55" /> {/* Legs */}
    <rect x="7" y="5" width="2" height="4" fill="#f04b55" /> {/* Left arm */}
    <rect x="15" y="5" width="2" height="4" fill="#f04b55" /> {/* Right arm */}
  </svg>
);
