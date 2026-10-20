import React from 'react';
import {
  ArchitecturalStatusEvent,
  RouteId,
  ROUTES,
} from '../domain/portfolioData';
import { MikeyGlyph } from './MikeyGlyph';
import { X } from 'lucide-react';

export interface TopBarProps {
  activeRouteId: RouteId;
  scrollProgress: number;
  foldDepth: number;
  reducedMotion: boolean;
  statusEvent: ArchitecturalStatusEvent | null;
  onDismissStatus: () => void;
  onTriggerFoldPulse: () => void;
  onNavigate: (path: string) => void;
  onJumpToContinueConversation: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeRouteId,
  scrollProgress,
  foldDepth,
  reducedMotion,
  statusEvent,
  onDismissStatus,
  onTriggerFoldPulse,
  onNavigate,
  onJumpToContinueConversation,
}) => {
  const navIds: RouteId[] = [
    'home',
    'about',
    'spaces',
    'work',
    'notes',
    'social',
  ];
  const primaryNavRoutes = ROUTES.filter((r) => navIds.includes(r.id));

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string
  ) => {
    e.preventDefault();
    onNavigate(path);
  };

  const activeRouteSpec =
    ROUTES.find((r) => r.id === activeRouteId) || ROUTES[0];
  const progressPercent = Math.min(
    100,
    Math.max(4, Math.round(scrollProgress * 100))
  );
  const progressAccentClass =
    activeRouteSpec.dominantAccent === 'amber'
      ? 'bg-[#F0A65A]'
      : 'bg-[#526BFF]';

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-[#111210]/94 border-b border-[#454642]/60">
      <div className="flex items-center justify-between gap-4 px-6 md:px-10 py-3.5">
        {/* Zone 1: Custom MIKEY Architectural Glyph + Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <MikeyGlyph
            activeRouteId={activeRouteId}
            foldDepth={foldDepth}
            isDiscovering={Boolean(statusEvent)}
            reducedMotion={reducedMotion}
            onTriggerFoldPulse={onTriggerFoldPulse}
          />
          <a
            href="/"
            onClick={(e) => handleLinkClick(e, '/')}
            className="font-editorial text-xl font-semibold tracking-wider text-[#F8F7F2] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#E9E5DA]"
          >
            MIKEY
          </a>
        </div>

        {/* Zone 2: 6 Responsive Chapter Navigation Items with Chapter Index & Active State */}
        <nav
          aria-label="Primary spatial destinations"
          className="flex items-center gap-3.5 sm:gap-6 overflow-x-auto no-scrollbar text-xs sm:text-sm font-medium"
        >
          {primaryNavRoutes.map((route) => {
            const isActive =
              activeRouteId === route.id ||
              (route.id === 'work' && activeRouteId.startsWith('work-'));
            const activeBorderColor =
              route.dominantAccent === 'amber'
                ? 'border-[#F0A65A]'
                : 'border-[#526BFF]';
            const indexColor = isActive
              ? route.dominantAccent === 'amber'
                ? 'text-[#F0A65A]'
                : 'text-[#526BFF]'
              : 'text-[#888983] group-hover:text-[#E9E5DA]';

            return (
              <a
                key={route.id}
                href={route.path}
                onClick={(e) => handleLinkClick(e, route.path)}
                aria-current={isActive ? 'page' : undefined}
                className={`group whitespace-nowrap shrink-0 py-1 transition-colors border-b-2 inline-flex items-baseline gap-1.5 ${
                  isActive
                    ? `text-[#F8F7F2] ${activeBorderColor}`
                    : 'text-[#888983] border-transparent hover:text-[#F8F7F2]'
                }`}
              >
                <span
                  className={`font-mono-tech text-[10px] transition-colors ${indexColor}`}
                >
                  {route.chapterNumber}
                </span>
                <span>{route.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action — Continue the Conversation */}
        <div className="hidden lg:flex items-center shrink-0">
          <button
            type="button"
            onClick={
              activeRouteId === 'social'
                ? () => onNavigate('/work')
                : onJumpToContinueConversation
            }
            className="px-4 py-2 text-xs font-medium text-[#111210] bg-[#E9E5DA] hover:bg-[#F8F7F2] active:scale-[0.99] transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F8F7F2]"
          >
            {activeRouteId === 'social'
              ? 'Explore Built Work'
              : 'Continue the Conversation'}
          </button>
        </div>
      </div>

      {/* Hairline Continuous Chapter Progress Indicator */}
      <div
        className="w-full h-[2px] bg-[#20211F] overflow-hidden"
        aria-hidden="true"
      >
        <div
          className={`h-full transition-all duration-300 ${progressAccentClass}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Slim Architectural Status Strip (Dismissible Instrument Readout on Meaningful Events) */}
      {statusEvent && (
        <div
          role="status"
          aria-live="polite"
          data-testid="architectural-status-strip"
          className="bg-[#161715]/95 border-b border-[#454642]/70 px-6 md:px-10 py-1.5 flex items-center justify-between gap-4 text-[11px] font-mono-tech text-[#E9E5DA]"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className={`inline-block w-3.5 h-[2px] shrink-0 ${
                statusEvent.accent === 'amber'
                  ? 'bg-[#F0A65A]'
                  : 'bg-[#526BFF]'
              }`}
              aria-hidden="true"
            />
            <span
              className={`font-semibold tracking-wider shrink-0 ${
                statusEvent.accent === 'amber'
                  ? 'text-[#F0A65A]'
                  : 'text-[#526BFF]'
              }`}
            >
              {statusEvent.code}
            </span>
            <span aria-hidden="true" className="text-[#454642] shrink-0">
              ·
            </span>
            <span className="text-[#E9E5DA] truncate">
              {statusEvent.detail}
            </span>
          </div>

          <button
            type="button"
            onClick={onDismissStatus}
            aria-label="Dismiss architectural status readout"
            className="text-[#888983] hover:text-[#F8F7F2] p-0.5 cursor-pointer shrink-0 inline-flex items-center gap-1"
          >
            <span className="hidden sm:inline text-[10px]">Dismiss</span>
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </header>
  );
};
