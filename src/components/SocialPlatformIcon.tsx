import React from 'react';

export interface SocialPlatformIconProps {
  platformId: string;
  className?: string;
}

export const SocialPlatformIcon: React.FC<SocialPlatformIconProps> = ({
  platformId,
  className = 'w-5 h-5',
}) => {
  switch (platformId) {
    case 'linkedin':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V23h-4V8.5zm7.5 0h3.83v1.98h.05c.53-1 1.84-2.05 3.78-2.05 4.04 0 4.79 2.66 4.79 6.12V23h-4v-7.5c0-1.79-.03-4.09-2.49-4.09-2.5 0-2.88 1.95-2.88 3.96V23H8V8.5z" />
        </svg>
      );

    case 'github':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M12 1.5a10.5 10.5 0 0 0-3.32 20.46c.52.1.71-.23.71-.5v-1.77c-2.92.64-3.54-1.41-3.54-1.41-.48-1.21-1.17-1.53-1.17-1.53-.95-.65.07-.64.07-.64 1.06.07 1.61 1.08 1.61 1.08.94 1.6 2.46 1.14 3.06.87.09-.68.37-1.14.67-1.4-2.33-.26-4.78-1.16-4.78-5.19 0-1.15.41-2.09 1.08-2.82-.11-.27-.47-1.34.1-2.8 0 0 .88-.28 2.89 1.08a10.02 10.02 0 0 1 5.26 0c2.01-1.36 2.89-1.08 2.89-1.08.57 1.46.21 2.53.1 2.8.67.73 1.08 1.67 1.08 2.82 0 4.04-2.46 4.92-4.8 5.18.38.33.71.97.71 1.96v2.9c0 .28.19.61.72.5A10.5 10.5 0 0 0 12 1.5z" />
        </svg>
      );

    case 'codeforces':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <rect x="3" y="10.5" width="4.5" height="9.5" rx="1.2" />
          <rect x="9.75" y="4.5" width="4.5" height="15.5" rx="1.2" />
          <rect x="16.5" y="7.5" width="4.5" height="12.5" rx="1.2" />
        </svg>
      );

    case 'instagram':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <rect x="2.5" y="2.5" width="19" height="19" rx="5" ry="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      );

    case 'spotify':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M12 1.5C6.2 1.5 1.5 6.2 1.5 12S6.2 22.5 12 22.5 22.5 17.8 22.5 12 17.8 1.5 12 1.5zm4.82 15.16a.65.65 0 0 1-.9.22c-2.46-1.5-5.56-1.84-9.21-1a.65.65 0 1 1-.3-1.27c3.99-.91 7.42-.52 10.19 1.17.31.19.41.59.22.88zm1.28-2.86a.82.82 0 0 1-1.12.27c-2.82-1.73-7.11-2.24-10.44-1.22a.82.82 0 1 1-.48-1.56c3.81-1.16 8.54-.6 11.77 1.39.38.23.5.74.27 1.12zm.11-2.98C14.84 8.82 9.27 8.64 6.05 9.62a.98.98 0 1 1-.57-1.88c3.7-1.12 9.85-.9 13.72 1.4a.98.98 0 0 1-.99 1.68z" />
        </svg>
      );

    default:
      return null;
  }
};
