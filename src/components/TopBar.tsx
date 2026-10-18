import React from 'react';
import { RouteId, ROUTES } from '../domain/portfolioData';

export interface TopBarProps {
  activeRouteId: RouteId;
  onNavigate: (path: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ activeRouteId, onNavigate }) => {
  const primaryNavRoutes = ROUTES.filter((r) => !r.id.startsWith('work-'));

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between gap-8 px-6 md:px-10 py-4 bg-[#111210]/90 border-b border-[#454642]/40">
      {/* Zone 1: Brand Title, single text element */}
      <a
        href="/"
        onClick={(e) => handleLinkClick(e, '/')}
        className="font-editorial text-xl font-semibold tracking-wider text-[#F8F7F2] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#E9E5DA]"
      >
        MIKEY
      </a>

      {/* Zone 2: 5 concise single-line text navigation links */}
      <nav
        aria-label="Primary spatial destinations"
        className="flex items-center gap-4 sm:gap-7 overflow-x-auto no-scrollbar text-xs sm:text-sm font-medium"
      >
        {primaryNavRoutes.map((route) => {
          const isActive =
            activeRouteId === route.id ||
            (route.id === 'work' && activeRouteId.startsWith('work-'));
          return (
            <a
              key={route.id}
              href={route.path}
              onClick={(e) => handleLinkClick(e, route.path)}
              aria-current={isActive ? 'page' : undefined}
              className={`whitespace-nowrap shrink-0 py-1 transition-colors border-b ${
                isActive
                  ? 'text-[#F8F7F2] border-[#E9E5DA]'
                  : 'text-[#888983] border-transparent hover:text-[#E9E5DA]'
              }`}
            >
              {route.label}
            </a>
          );
        })}
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="hidden sm:flex items-center shrink-0">
        <button
          type="button"
          onClick={() =>
            onNavigate(activeRouteId === 'work' ? '/contact' : '/work')
          }
          className="px-4 py-2 text-xs font-medium text-[#111210] bg-[#E9E5DA] hover:bg-[#F8F7F2] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F8F7F2]"
        >
          {activeRouteId === 'work' ? 'Reach Out' : 'View Work'}
        </button>
      </div>
    </header>
  );
};
