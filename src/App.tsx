/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ABOUT_PARAGRAPHS,
  ArchitecturalStatusCode,
  ArchitecturalStatusEvent,
  EXTERNAL_PROFILES,
  INTEREST_CLUSTERS,
  PROJECTS,
  resolveRouteFromPath,
  resolveRouteFromScroll,
  RouteId,
  ROUTES,
  SCENE_KEYFRAMES,
  SPATIAL_INSPECTION_TARGETS,
  SpatialTargetId,
} from './domain/portfolioData';
import { AccentTone } from './domain/thoughtsData';
import { TopBar } from './components/TopBar';
import { QuieterSpacesChapter } from './components/QuieterSpacesChapter';
import { SocialPlatformIcon } from './components/SocialPlatformIcon';
import { WorldCanvas } from './three/WorldCanvas';
import {
  ArrowUpRight,
  Compass,
  Layers,
  ArrowLeft,
  Eye,
  X,
} from 'lucide-react';

export default function App() {
  const [activeRouteId, setActiveRouteId] = useState<RouteId>(() => {
    if (typeof window !== 'undefined') {
      return resolveRouteFromPath(window.location.pathname).id;
    }
    return 'home';
  });

  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [foldOverride, setFoldOverride] = useState<number | null>(null);
  const [reducedMotion] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  const [hoveredProjectId, setHoveredProjectId] = useState<
    'zenith' | 'deadzone-bastion' | null
  >(null);
  const [selectedClusterId, setSelectedClusterId] = useState<string>('all');
  const [foldPulseCount, setFoldPulseCount] = useState<number>(0);

  // Chapter 03 ("The Quieter Spaces") spatial state
  const [activeThoughtAccent, setActiveThoughtAccent] =
    useState<AccentTone | null>(null);
  const [stayingWithThought, setStayingWithThought] = useState<boolean>(false);
  const [thoughtCameraOffset, setThoughtCameraOffset] = useState<
    [number, number, number]
  >([0, 0, 0]);

  // Click-to-inspect 3D spatial target state
  const [inspectedTargetId, setInspectedTargetId] =
    useState<SpatialTargetId | null>(null);

  // Restrained Architectural Status Strip state
  const [statusEvent, setStatusEvent] =
    useState<ArchitecturalStatusEvent | null>({
      id: 'initial-threshold',
      code: 'EXPLORATION AVAILABLE',
      detail: 'THE FOLD · Nested Architectural World Ready to Inspect',
      accent: 'cobalt',
    });
  const statusTimeoutRef = useRef<number | null>(null);

  const triggerStatusEvent = useCallback(
    (
      code: ArchitecturalStatusCode,
      detail: string,
      accent: 'cobalt' | 'amber' = 'cobalt'
    ) => {
      if (statusTimeoutRef.current) {
        window.clearTimeout(statusTimeoutRef.current);
      }
      setStatusEvent({
        id: `${code}-${Date.now()}`,
        code,
        detail,
        accent,
      });
      statusTimeoutRef.current = window.setTimeout(() => {
        setStatusEvent(null);
      }, 4400);
    },
    []
  );

  useEffect(() => {
    return () => {
      if (statusTimeoutRef.current) {
        window.clearTimeout(statusTimeoutRef.current);
      }
    };
  }, []);

  // Section refs for smooth scroll & route synchronization across the 5 chapters
  const homeRef = useRef<HTMLElement | null>(null);
  const aboutRef = useRef<HTMLElement | null>(null);
  const spacesRef = useRef<HTMLElement | null>(null);
  const workRef = useRef<HTMLElement | null>(null);
  const notesRef = useRef<HTMLElement | null>(null);
  const continueConversationRef = useRef<HTMLDivElement | null>(null);
  const isProgrammaticScroll = useRef<boolean>(false);

  const getSectionElement = (routeId: RouteId): HTMLElement | null => {
    switch (routeId) {
      case 'home':
        return homeRef.current;
      case 'about':
        return aboutRef.current;
      case 'spaces':
        return spacesRef.current;
      case 'work':
      case 'work-zenith':
      case 'work-deadzone':
        return workRef.current;
      case 'notes':
        return notesRef.current;
      default:
        return homeRef.current;
    }
  };

  const navigateToPath = (path: string, pushHistory = true) => {
    const clean = path.replace(/\/+$/, '').toLowerCase() || '/';
    const isDirectContinue = clean === '/contact' || clean === '/afterword';
    const route = resolveRouteFromPath(path);
    setActiveRouteId(route.id);

    triggerStatusEvent(
      'ENVIRONMENT SHIFTING',
      `Chapter ${route.chapterNumber} · ${route.chapterTitle}`,
      route.dominantAccent === 'amber' ? 'amber' : 'cobalt'
    );

    if (pushHistory && window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }

    const targetEl = isDirectContinue
      ? continueConversationRef.current || notesRef.current
      : getSectionElement(route.id);

    if (targetEl) {
      isProgrammaticScroll.current = true;
      targetEl.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
      setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 750);
    }
  };

  const handleJumpToContinueConversation = () => {
    setActiveRouteId('notes');
    triggerStatusEvent(
      'EXPLORATION AVAILABLE',
      'Continue the Conversation · Verified Coordinates',
      'amber'
    );
    if (window.location.pathname !== '/notes') {
      window.history.pushState({}, '', '/notes');
    }
    const targetEl = continueConversationRef.current || notesRef.current;
    if (targetEl) {
      isProgrammaticScroll.current = true;
      targetEl.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
      setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 750);
    }
  };

  // Initial route scroll on mount & PopState listener
  useEffect(() => {
    const initialPathname = window.location.pathname;
    const initialRoute = resolveRouteFromPath(initialPathname);
    if (initialRoute.id !== 'home') {
      setTimeout(() => {
        const isDirectContinue =
          initialPathname.toLowerCase().includes('/contact') ||
          initialPathname.toLowerCase().includes('/afterword');
        const el = isDirectContinue
          ? continueConversationRef.current || notesRef.current
          : getSectionElement(initialRoute.id);
        if (el) {
          el.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
      }, 80);
    }

    const handlePopState = () => {
      const matched = resolveRouteFromPath(window.location.pathname);
      setActiveRouteId(matched.id);
      const el = getSectionElement(matched.id);
      if (el) {
        isProgrammaticScroll.current = true;
        el.scrollIntoView({
          behavior: reducedMotion ? 'auto' : 'smooth',
          block: 'start',
        });
        setTimeout(() => {
          isProgrammaticScroll.current = false;
        }, 700);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [reducedMotion]);

  // Continuous scroll observer that updates scrollProgress and activeRouteId
  useEffect(() => {
    const handleScroll = () => {
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      const progress =
        docHeight > 0 ? Math.max(0, Math.min(1, currentScroll / docHeight)) : 0;
      setScrollProgress(progress);

      if (!isProgrammaticScroll.current) {
        const derivedRoute = resolveRouteFromScroll(progress);
        setActiveRouteId((prev) => {
          if (
            (prev === 'work-zenith' || prev === 'work-deadzone') &&
            derivedRoute.id === 'work'
          ) {
            return prev;
          }
          if (prev !== derivedRoute.id) {
            window.history.replaceState({}, '', derivedRoute.path);
            return derivedRoute.id;
          }
          return prev;
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentKeyframe =
    SCENE_KEYFRAMES[activeRouteId] || SCENE_KEYFRAMES.home;
  const currentFoldValue =
    foldOverride !== null ? foldOverride : currentKeyframe.foldDepth;

  const handleInspectTarget = (targetId: SpatialTargetId) => {
    setInspectedTargetId(targetId);
    const targetInfo = SPATIAL_INSPECTION_TARGETS[targetId];
    if (targetId === 'the-fold') {
      setFoldPulseCount((c) => c + 1);
      const nextFold = currentFoldValue > 0.55 ? 0.14 : 0.84;
      setFoldOverride(nextFold);
      triggerStatusEvent(
        'STRUCTURE DISCOVERED',
        `${targetInfo.label} · Unfolded to ${Math.round(nextFold * 100)}%`,
        'amber'
      );
    } else if (targetId === 'wordmark') {
      triggerStatusEvent(
        'STRUCTURE DISCOVERED',
        `${targetInfo.label} · Camera Focused on Relief`,
        'cobalt'
      );
    } else if (targetId === 'zenith') {
      navigateToPath('/work/zenith');
    } else if (targetId === 'deadzone-bastion') {
      navigateToPath('/work/deadzone-bastion');
    }
  };

  const handleTriggerFoldPulse = () => {
    setFoldPulseCount((c) => c + 1);
    const nextFold =
      currentFoldValue < 0.45
        ? 0.68
        : currentFoldValue < 0.8
        ? 0.92
        : 0.14;
    setFoldOverride(nextFold);
    triggerStatusEvent(
      'ANOTHER LAYER',
      `The Fold Articulated · Nested Planes at ${Math.round(nextFold * 100)}%`,
      nextFold > 0.5 ? 'cobalt' : 'amber'
    );
  };

  const filteredClusters =
    selectedClusterId === 'all'
      ? INTEREST_CLUSTERS
      : INTEREST_CLUSTERS.filter((c) => c.id === selectedClusterId);

  const activeCaseStudyProject =
    activeRouteId === 'work-zenith'
      ? PROJECTS[0]
      : activeRouteId === 'work-deadzone'
      ? PROJECTS[1]
      : null;

  const inspectedTarget = inspectedTargetId
    ? SPATIAL_INSPECTION_TARGETS[inspectedTargetId]
    : null;

  return (
    <div className="relative min-h-screen bg-[#111210] text-[#F8F7F2] selection:bg-[#526BFF] selection:text-[#F8F7F2]">
      {/* Full-Viewport Native Three.js Architectural World Canvas */}
      <WorldCanvas
        activeRouteId={activeRouteId}
        scrollProgress={scrollProgress}
        foldOverride={foldOverride}
        reducedMotion={reducedMotion}
        hoveredProjectId={hoveredProjectId}
        activeThoughtAccent={activeThoughtAccent}
        stayingWithThought={stayingWithThought}
        thoughtCameraOffset={thoughtCameraOffset}
        inspectedTargetId={inspectedTargetId}
        onInspectTarget={handleInspectTarget}
        onNavigateRoute={(path) => navigateToPath(path)}
        onManualExploreChange={(exploring) => {
          if (exploring) {
            triggerStatusEvent(
              'VIEWPOINT UPDATED',
              'Free 3D Exploration Active · Drag to Orbit · Scroll to Zoom',
              'cobalt'
            );
          }
        }}
        onResetViewpoint={() => {
          setFoldOverride(null);
          setActiveThoughtAccent(null);
          setStayingWithThought(false);
          setThoughtCameraOffset([0, 0, 0]);
          setInspectedTargetId(null);
          triggerStatusEvent(
            'VIEWPOINT UPDATED',
            'Default Architectural Composition Restored',
            'cobalt'
          );
        }}
      />

      {/* Top Spatial Navigation Bar with Custom MIKEY Glyph & Status Strip */}
      <TopBar
        activeRouteId={activeRouteId}
        scrollProgress={scrollProgress}
        foldDepth={currentFoldValue}
        reducedMotion={reducedMotion}
        statusEvent={statusEvent}
        onDismissStatus={() => setStatusEvent(null)}
        onTriggerFoldPulse={handleTriggerFoldPulse}
        onNavigate={(path) => navigateToPath(path)}
        onJumpToContinueConversation={handleJumpToContinueConversation}
      />

      {/* Click-to-Inspect 3D Structure Drawer (Floating Architectural Readout) */}
      {inspectedTarget && (
        <aside
          aria-label="Inspected 3D structure details"
          data-testid="spatial-inspection-drawer"
          className={`fixed top-28 right-6 z-30 w-[min(420px,90vw)] bg-[#111210]/96 border p-6 space-y-4 pointer-events-auto shadow-2xl ${
            inspectedTarget.accent === 'cobalt'
              ? 'border-[#526BFF]'
              : 'border-[#F0A65A]'
          }`}
        >
          <div className="flex items-center justify-between gap-2 text-xs font-mono-tech">
            <span
              className={
                inspectedTarget.accent === 'cobalt'
                  ? 'text-[#526BFF]'
                  : 'text-[#F0A65A]'
              }
            >
              {inspectedTarget.label}
            </span>
            <button
              type="button"
              onClick={() => {
                setInspectedTargetId(null);
                setFoldOverride(null);
              }}
              aria-label="Close Readout"
              className="text-[#888983] hover:text-[#F8F7F2] inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Close Readout</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-[11px] font-mono-tech text-[#888983]">
            {inspectedTarget.coordinate}
          </div>

          <h2 className="font-editorial text-2xl text-[#F8F7F2]">
            {inspectedTarget.title}
          </h2>

          <p className="text-xs sm:text-sm text-[#E9E5DA] leading-relaxed">
            {inspectedTarget.summary}
          </p>

          <p className="text-xs text-[#888983] leading-relaxed">
            {inspectedTarget.detail}
          </p>

          {inspectedTarget.actionLabel && inspectedTarget.actionPathOrUrl && (
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-[#454642]/50">
              <button
                type="button"
                onClick={() => {
                  const dest = inspectedTarget.actionPathOrUrl!;
                  setInspectedTargetId(null);
                  navigateToPath(dest);
                }}
                className="px-4 py-2 text-xs font-medium bg-[#526BFF] text-[#F8F7F2] hover:bg-[#526BFF]/90 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {inspectedTarget.actionLabel} →
              </button>
            </div>
          )}
        </aside>
      )}

      {/* Main Continuous Spatial Story (5 Chapters) */}
      <main className="relative z-10 pointer-events-none">
        {/* ===================================================================
            CHAPTER 01 — THE THRESHOLD (MIKEY FRAMED BY THE FOLD)
            "Every world begins with an assumption."
        =================================================================== */}
        <section
          ref={homeRef}
          id="home"
          aria-label="Chapter 01: The Threshold"
          className="min-h-screen w-full max-w-[1360px] mx-auto px-6 md:px-12 pt-28 sm:pt-32 pb-14 flex flex-col justify-between"
        >
          {/* Top-left editorial chapter mark & keyboard-accessible 3D inspection triggers */}
          <div className="flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
            <div className="text-xs font-mono-tech text-[#888983] flex flex-wrap items-center gap-2">
              <span className="text-[#526BFF]">01 — THE THRESHOLD</span>
              <span aria-hidden="true">·</span>
              <span>“Every world begins with an assumption.”</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleInspectTarget('wordmark')}
                className="px-3 py-1.5 text-xs font-mono-tech text-[#E9E5DA] bg-[#161715]/90 border border-[#454642] hover:border-[#526BFF] transition-colors cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-[#526BFF]" />
                <span>Inspect 3D Wordmark</span>
              </button>
              <button
                type="button"
                onClick={() => navigateToPath('/spaces')}
                className="text-xs font-mono-tech text-[#888983] hover:text-[#F8F7F2] underline underline-offset-4 transition-colors cursor-pointer"
              >
                Jump to Quiet Spaces (03) →
              </button>
            </div>
          </div>

          {/* Central viewport intentionally kept open so the 3D MIKEY wordmark & THE FOLD command attention */}
          <div className="my-auto py-12 sm:py-24" aria-hidden="true" />

          {/* Bottom Split: Narrative Threshold, Actions & Discoverable Social Coordinates */}
          <div className="pointer-events-auto bg-[#111210]/90 border border-[#454642]/80 p-4 sm:p-5 md:p-6 space-y-3.5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-end">
              <div className="lg:col-span-7 space-y-1.5">
                <div className="flex items-center gap-3 text-xs font-mono-tech text-[#888983]">
                  <span
                    className="inline-block w-8 h-[2px] bg-[#526BFF]"
                    aria-hidden="true"
                  />
                  <span>PUBLIC IDENTITY · MIKEY · ARCHITECTURAL WORLD OF THE FOLD</span>
                </div>
                <h1
                  className="font-editorial text-2xl sm:text-4xl md:text-5xl font-normal tracking-tight text-[#F8F7F2]"
                  style={{ textWrap: 'balance' }}
                >
                  Computer science student. Builder. Perpetual learner.
                </h1>
                <p className="text-xs sm:text-base text-[#E9E5DA] max-w-2xl leading-relaxed">
                  I build to understand. I explore to find what understanding misses.
                </p>
              </div>

              <div className="lg:col-span-5 flex flex-wrap items-center lg:justify-end gap-2">
                <button
                  type="button"
                  onClick={() => navigateToPath('/about')}
                  className="px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium bg-[#526BFF] text-[#F8F7F2] hover:bg-[#526BFF]/90 active:scale-[0.99] transition-all whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Enter the world
                </button>
                <button
                  type="button"
                  onClick={() => navigateToPath('/work')}
                  className="px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium bg-[#20211F] text-[#F8F7F2] border border-[#888983] hover:border-[#F8F7F2] active:scale-[0.99] transition-all whitespace-nowrap shrink-0 cursor-pointer"
                >
                  View my work
                </button>
                <button
                  type="button"
                  onClick={() => handleInspectTarget('the-fold')}
                  className="px-3 py-2 sm:px-3.5 sm:py-2.5 text-xs font-mono-tech text-[#E9E5DA] hover:text-[#F8F7F2] border border-[#454642] hover:border-[#F0A65A] transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5 text-[#F0A65A]" />
                  <span>Unfold Structure ({foldPulseCount})</span>
                </button>
              </div>
            </div>

            {/* Quiet, Accessible Social Links Strip (All 5 Profiles Reachable on Desktop & Mobile) */}
            <nav
              aria-label="MIKEY social profiles"
              data-testid="threshold-social-links"
              className="pt-3 border-t border-[#454642]/50 flex flex-wrap items-center justify-between gap-2.5"
            >
              <span className="text-[11px] font-mono-tech text-[#888983]">
                VERIFIED COORDINATES
              </span>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 sm:gap-6">
                {EXTERNAL_PROFILES.map((profile) => (
                  <a
                    key={profile.id}
                    href={profile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={profile.ariaLabel}
                    className="group inline-flex items-center gap-1.5 text-xs text-[#E9E5DA] hover:text-[#F8F7F2] transition-colors py-0.5 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E9E5DA]"
                  >
                    <SocialPlatformIcon
                      platformId={profile.id}
                      className="w-3.5 h-3.5 text-[#888983] group-hover:text-[#526BFF] transition-colors shrink-0"
                    />
                    <span className="font-medium group-hover:underline underline-offset-4">
                      {profile.label}
                    </span>
                    <ArrowUpRight className="w-3 h-3 text-[#888983] group-hover:text-[#F8F7F2] transition-colors shrink-0" />
                  </a>
                ))}
              </div>
            </nav>
          </div>
        </section>

        {/* ===================================================================
            CHAPTER 02 — THE UNFINISHED SELF
            "I am not a finished answer."
        =================================================================== */}
        <section
          ref={aboutRef}
          id="about"
          aria-label="Chapter 02: The Unfinished Self"
          className="min-h-screen w-full max-w-[1360px] mx-auto px-6 md:px-12 py-28 flex items-center"
        >
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-7 bg-[#111210]/92 border border-[#454642]/75 p-8 md:p-12 pointer-events-auto space-y-6">
              <div className="flex items-center justify-between border-b border-[#454642]/50 pb-4">
                <span className="text-xs font-mono-tech text-[#F0A65A]">
                  02 — THE UNFINISHED SELF
                </span>
                <span className="text-xs font-mono-tech text-[#888983]">
                  “I am not a finished answer.”
                </span>
              </div>

              <h2
                className="font-editorial text-3xl sm:text-4xl md:text-5xl text-[#F8F7F2] leading-tight"
                style={{ textWrap: 'balance' }}
              >
                Where rigorous systems meet human contradiction.
              </h2>

              <div className="space-y-4 text-sm sm:text-base text-[#E9E5DA]/90 leading-relaxed">
                {ABOUT_PARAGRAPHS.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              {/* Warm Amber Reflection Inscription */}
              <div className="pt-4 border-t border-[#454642]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 text-xs font-mono-tech text-[#F0A65A]">
                  <span
                    className="inline-block w-5 h-[2px] bg-[#F0A65A]"
                    aria-hidden="true"
                  />
                  <span>
                    THE FOLD · Nested frames open as the perspective shifts
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => navigateToPath('/spaces')}
                  className="px-4 py-2 text-xs font-mono-tech text-[#111210] bg-[#E9E5DA] hover:bg-[#F8F7F2] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  Enter Quiet Spaces (03) →
                </button>
              </div>
            </div>

            {/* Right 5 Cols: Open 3D Viewport Corridor */}
            <div className="lg:col-span-5 hidden lg:block" aria-hidden="true" />
          </div>
        </section>

        {/* ===================================================================
            CHAPTER 03 — THE QUIETER SPACES BETWEEN STRUCTURES
            "Some thoughts do not ask to be solved. They ask to be noticed."
        =================================================================== */}
        <section
          ref={spacesRef}
          id="spaces"
          aria-label="Chapter 03: The Quieter Spaces Between Structures"
          className="min-h-screen w-full max-w-[1360px] mx-auto px-6 md:px-12 py-28"
        >
          <QuieterSpacesChapter
            reducedMotion={reducedMotion}
            onThoughtFocusChange={({
              accent,
              staying,
              cameraOffset,
              foldTarget,
            }) => {
              setActiveThoughtAccent(accent);
              setStayingWithThought(staying);
              setThoughtCameraOffset(cameraOffset);
              setFoldOverride(staying ? foldTarget : null);
              if (staying) {
                triggerStatusEvent(
                  'EXPLORATION AVAILABLE',
                  'Staying With Thought Fragment · Ambient Motion Quieted',
                  accent === 'cobalt' ? 'cobalt' : 'amber'
                );
              }
            }}
            onContinueToWork={() => navigateToPath('/work')}
          />
        </section>

        {/* ===================================================================
            CHAPTER 04 — THINGS MADE REAL (BUILT WORK & CASE STUDIES)
            "An idea changes the moment you try to build it."
        =================================================================== */}
        <section
          ref={workRef}
          id="work"
          aria-label="Chapter 04: Things Made Real"
          className="min-h-screen w-full max-w-[1360px] mx-auto px-6 md:px-12 py-28 flex flex-col justify-center"
        >
          <div className="w-full space-y-10 pointer-events-auto">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-[#111210]/90 border border-[#454642]/70 p-6 md:p-8">
              <div>
                <div className="text-xs font-mono-tech text-[#526BFF] mb-1">
                  04 — THINGS MADE REAL · “An idea changes the moment you try to build it.”
                </div>
                <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl text-[#F8F7F2]">
                  Built Systems &amp; Interactive Architectures
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {activeCaseStudyProject && (
                  <button
                    type="button"
                    onClick={() => navigateToPath('/work')}
                    className="px-3.5 py-2 text-xs font-mono-tech text-[#E9E5DA] bg-[#161715] border border-[#888983] hover:border-[#F8F7F2] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>All Built Work</span>
                  </button>
                )}
                <p className="text-xs font-mono-tech text-[#888983] max-w-xs">
                  Two verified deployments live on Vercel—accompanied by 3D spatial
                  monuments in the gallery behind you.
                </p>
              </div>
            </div>

            {/* Dedicated Case Study View when /work/zenith or /work/deadzone-bastion is active */}
            {activeCaseStudyProject ? (
              <article
                data-testid={`case-study-${activeCaseStudyProject.id}`}
                className={`bg-[#111210]/94 border p-8 md:p-12 space-y-8 ${
                  activeCaseStudyProject.accentColor === 'cobalt'
                    ? 'border-[#526BFF]'
                    : 'border-[#F0A65A]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#454642]/60">
                  <div>
                    <div className="text-xs font-mono-tech text-[#888983]">
                      ARCHITECTURAL CASE STUDY {activeCaseStudyProject.index} ·{' '}
                      {activeCaseStudyProject.spatialCoordinate}
                    </div>
                    <h3 className="font-editorial text-4xl sm:text-5xl text-[#F8F7F2] mt-1">
                      {activeCaseStudyProject.title}
                    </h3>
                    <p
                      className={`text-sm mt-1 ${
                        activeCaseStudyProject.accentColor === 'cobalt'
                          ? 'text-[#526BFF]'
                          : 'text-[#F0A65A]'
                      }`}
                    >
                      {activeCaseStudyProject.category}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={activeCaseStudyProject.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-3 text-xs sm:text-sm font-medium bg-[#E9E5DA] text-[#111210] hover:bg-[#F8F7F2] transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
                    >
                      <span>Launch Live Deployment</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        navigateToPath(
                          activeCaseStudyProject.id === 'zenith'
                            ? '/work/deadzone-bastion'
                            : '/work/zenith'
                        )
                      }
                      className="px-4 py-3 text-xs font-mono-tech text-[#E9E5DA] border border-[#454642] hover:border-[#888983] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Switch to{' '}
                      {activeCaseStudyProject.id === 'zenith'
                        ? 'Deadzone Bastion (02)'
                        : 'Zenith (01)'}{' '}
                      →
                    </button>
                  </div>
                </div>

                {/* Narrative Arc */}
                <div className="space-y-2">
                  <div className="text-xs font-mono-tech text-[#888983]">
                    01 · NARRATIVE PREMISE
                  </div>
                  <p className="font-editorial text-2xl sm:text-3xl text-[#F8F7F2] leading-snug">
                    “{activeCaseStudyProject.caseStudy.narrativeArc}”
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t border-[#454642]/50">
                  <div className="space-y-3">
                    <div className="text-xs font-mono-tech text-[#888983]">
                      02 · PROBLEM &amp; ARCHITECTURAL PURPOSE
                    </div>
                    <p className="text-sm sm:text-base text-[#E9E5DA] leading-relaxed">
                      {activeCaseStudyProject.caseStudy.problemAndPurpose}
                    </p>

                    <div className="pt-4 space-y-2">
                      <div className="text-xs font-mono-tech text-[#888983]">
                        03 · WHY IT MATTERS IN THE STORY
                      </div>
                      <p className="text-sm sm:text-base text-[#E9E5DA] leading-relaxed">
                        {activeCaseStudyProject.caseStudy.whyItMatters}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-xs font-mono-tech text-[#888983]">
                      04 · KEY SYSTEM DECISIONS &amp; WHAT WAS BUILT
                    </div>
                    <ul className="space-y-3 text-sm text-[#E9E5DA]">
                      {activeCaseStudyProject.caseStudy.keySystemDecisions.map(
                        (decision, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3 bg-[#161715] p-3.5 border border-[#454642]/60"
                          >
                            <span className="font-mono-tech text-xs text-[#526BFF] shrink-0">
                              0{idx + 1}
                            </span>
                            <span>{decision}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              </article>
            ) : (
              /* Dual Architectural Chambers for Zenith (01) and Deadzone Bastion (02) */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Project 01: Zenith (Electric Cobalt Accent) */}
                <article
                  onMouseEnter={() => setHoveredProjectId('zenith')}
                  onMouseLeave={() => setHoveredProjectId(null)}
                  className="bg-[#111210]/92 border border-[#454642]/80 hover:border-[#526BFF] transition-colors p-8 md:p-10 flex flex-col justify-between space-y-8"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-mono-tech text-[#888983] border-b border-[#454642]/50 pb-3">
                      <span className="text-[#526BFF]">
                        CHAMBER {PROJECTS[0].index} · 3D MONUMENT LEFT
                      </span>
                      <span>{PROJECTS[0].spatialCoordinate}</span>
                    </div>

                    <div>
                      <h3 className="font-editorial text-3xl sm:text-4xl text-[#F8F7F2]">
                        {PROJECTS[0].title}
                      </h3>
                      <p className="text-xs font-mono-tech text-[#888983] mt-1">
                        {PROJECTS[0].category}
                      </p>
                    </div>

                    <p className="text-sm sm:text-base text-[#E9E5DA]/90 leading-relaxed">
                      {PROJECTS[0].summary}
                    </p>

                    <ul className="space-y-2 pt-2 border-t border-[#454642]/40 text-xs sm:text-sm text-[#888983]">
                      {PROJECTS[0].architectureNotes.map((note, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <Layers className="w-3.5 h-3.5 text-[#526BFF] shrink-0 mt-1" />
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-[#454642]/50 flex flex-wrap items-center justify-between gap-4">
                    <span className="font-mono-tech text-xs text-[#888983]">
                      {PROJECTS[0].domain}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => navigateToPath(PROJECTS[0].path)}
                        className="px-3.5 py-2 text-xs font-mono-tech text-[#E9E5DA] border border-[#454642] hover:border-[#526BFF] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        Inspect Case Study
                      </button>
                      <a
                        href={PROJECTS[0].liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open live deployment of ${PROJECTS[0].title}`}
                        className="px-4 py-2 text-xs font-medium bg-[#526BFF] text-[#F8F7F2] hover:bg-[#526BFF]/90 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                      >
                        <span>Enter Zenith</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </article>

                {/* Project 02: Deadzone Bastion (Warm Amber Accent) */}
                <article
                  onMouseEnter={() => setHoveredProjectId('deadzone-bastion')}
                  onMouseLeave={() => setHoveredProjectId(null)}
                  className="bg-[#161715]/95 border border-[#888983]/60 hover:border-[#F0A65A] transition-colors p-8 md:p-10 flex flex-col justify-between space-y-8"
                >
                  <div className="space-y-5">
                    <div className="flex items-center justify-between text-xs font-mono-tech text-[#888983] border-b border-[#454642]/60 pb-3">
                      <span className="text-[#F0A65A]">
                        CHAMBER {PROJECTS[1].index} · 3D MONUMENT RIGHT
                      </span>
                      <span>{PROJECTS[1].spatialCoordinate}</span>
                    </div>

                    <div>
                      <h3 className="font-editorial text-3xl sm:text-4xl text-[#F8F7F2]">
                        {PROJECTS[1].title}
                      </h3>
                      <p className="text-xs font-mono-tech text-[#F0A65A] mt-1">
                        {PROJECTS[1].category}
                      </p>
                    </div>

                    <p className="text-sm sm:text-base text-[#E9E5DA]/90 leading-relaxed">
                      {PROJECTS[1].summary}
                    </p>

                    <div className="bg-[#111210] border border-[#454642]/60 p-4 space-y-2">
                      <div className="text-[11px] font-mono-tech text-[#888983]">
                        SYSTEM DYNAMICS &amp; TACTICAL LOOP
                      </div>
                      <ul className="space-y-1.5 text-xs text-[#E9E5DA]/85">
                        {PROJECTS[1].architectureNotes.map((note, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="font-mono-tech text-[#F0A65A]">
                              0{i + 1}
                            </span>
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#454642]/60 flex flex-wrap items-center justify-between gap-4">
                    <span className="font-mono-tech text-xs text-[#888983]">
                      {PROJECTS[1].domain}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => navigateToPath(PROJECTS[1].path)}
                        className="px-3.5 py-2 text-xs font-mono-tech text-[#E9E5DA] border border-[#454642] hover:border-[#F0A65A] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        Inspect Case Study
                      </button>
                      <a
                        href={PROJECTS[1].liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open live deployment of ${PROJECTS[1].title}`}
                        className="px-4 py-2 text-xs font-medium bg-[#20211F] text-[#F8F7F2] border border-[#F0A65A] hover:bg-[#F0A65A] hover:text-[#111210] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                      >
                        <span>Enter Bastion</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </article>
              </div>
            )}
          </div>
        </section>

        {/* ===================================================================
            CHAPTER 05 — EXPLORATIONS & CONTINUE THE CONVERSATION
        =================================================================== */}
        <section
          ref={notesRef}
          id="notes"
          aria-label="Chapter 05: Explorations and Continue the Conversation"
          className="min-h-screen w-full max-w-[1360px] mx-auto px-6 md:px-12 py-28 pb-20"
        >
          <div className="bg-[#111210]/92 border border-[#454642]/75 p-8 md:p-12 pointer-events-auto space-y-14">
            {/* Part 1: Disciplines of Study & Ongoing Curiosity */}
            <div>
              <div className="flex flex-wrap items-end justify-between gap-6 pb-6 border-b border-[#454642]/50">
                <div>
                  <div className="text-xs font-mono-tech text-[#F0A65A] mb-1">
                    05 — EXPLORATIONS · “We understand a world by the questions we carry through it.”
                  </div>
                  <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl text-[#F8F7F2]">
                    Disciplines of Study &amp; Curiosity
                  </h2>
                  <p className="text-sm text-[#888983] mt-2 max-w-2xl">
                    Genuine directions of study, problem-solving, and ongoing
                    exploration across computation, quantitative thinking, philosophy,
                    and strategy.
                  </p>
                </div>

                {/* Interactive Cluster Filter Controls */}
                <div
                  role="group"
                  aria-label="Filter interest clusters"
                  className="flex flex-wrap items-center gap-1 bg-[#161715] p-1 border border-[#454642]"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedClusterId('all')}
                    className={`px-3 py-1.5 text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      selectedClusterId === 'all'
                        ? 'bg-[#E9E5DA] text-[#111210] font-medium'
                        : 'text-[#888983] hover:text-[#E9E5DA]'
                    }`}
                  >
                    All Coordinates
                  </button>
                  {INTEREST_CLUSTERS.map((cluster) => (
                    <button
                      key={cluster.id}
                      type="button"
                      onClick={() => setSelectedClusterId(cluster.id)}
                      className={`px-3 py-1.5 text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        selectedClusterId === cluster.id
                          ? 'bg-[#E9E5DA] text-[#111210] font-medium'
                          : 'text-[#888983] hover:text-[#E9E5DA]'
                      }`}
                    >
                      {cluster.index}. {cluster.title.split('&')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interest Clusters Grid */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredClusters.map((cluster) => (
                  <div
                    key={cluster.id}
                    className="bg-[#161715]/90 border border-[#454642]/60 hover:border-[#888983] transition-colors p-6 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono-tech text-[#888983] mb-2">
                        <span>Cluster {cluster.index}</span>
                        <span>{cluster.coordinate}</span>
                      </div>
                      <h3 className="font-editorial text-2xl text-[#F8F7F2]">
                        {cluster.title}
                      </h3>
                      <p className="text-xs text-[#888983] mt-0.5">
                        {cluster.subtitle}
                      </p>

                      <ul className="mt-4 space-y-2 border-t border-[#454642]/40 pt-4 text-sm text-[#E9E5DA]">
                        {cluster.areas.map((area, i) => (
                          <li key={i} className="flex items-baseline gap-2.5">
                            <span className="font-mono-tech text-xs text-[#888983]">
                              0{i + 1}
                            </span>
                            <span>{area}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <p className="text-xs text-[#888983] leading-relaxed pt-3 border-t border-[#454642]/30">
                      {cluster.reflection}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Part 2: Surviving Interaction — "Continue the Conversation" */}
            <div
              ref={continueConversationRef}
              id="continue-conversation"
              data-testid="continue-the-conversation"
              className="pt-10 border-t border-[#454642]/70 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start"
            >
              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-center gap-3 text-xs font-mono-tech text-[#888983]">
                  <span
                    className="inline-block w-5 h-[2px] bg-[#526BFF]"
                    aria-hidden="true"
                  />
                  <span
                    className="inline-block w-5 h-[2px] bg-[#F0A65A]"
                    aria-hidden="true"
                  />
                  <span>OPEN COORDINATES · BEYOND THIS WORLD</span>
                </div>

                <h3 className="font-editorial text-3xl sm:text-4xl text-[#F8F7F2]">
                  Continue the Conversation
                </h3>

                <p className="text-sm sm:text-base text-[#E9E5DA]/90 leading-relaxed max-w-xl">
                  You have reached the far edge of these structures, yet the work and
                  questions here remain in motion. Connect directly across all five
                  verified profiles or step back into the built projects and
                  architectural spaces above.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <a
                    href={PROJECTS[0].liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 text-xs font-medium bg-[#526BFF] text-[#F8F7F2] hover:bg-[#526BFF]/90 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <span>Live: Zenith</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={PROJECTS[1].liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 text-xs font-medium bg-[#20211F] text-[#E9E5DA] border border-[#F0A65A]/80 hover:bg-[#F0A65A] hover:text-[#111210] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <span>Live: Deadzone Bastion</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => navigateToPath('/')}
                    className="px-4 py-2.5 text-xs font-mono-tech text-[#111210] bg-[#E9E5DA] hover:bg-[#F8F7F2] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Return to The Threshold (01) ↑
                  </button>
                </div>
              </div>

              <nav
                aria-label="Verified external social profiles"
                data-testid="verified-social-profiles"
                className="lg:col-span-6 bg-[#161715]/95 border border-[#454642]/80 p-6 md:p-8 space-y-4"
              >
                <div className="flex items-center justify-between gap-2 text-xs font-mono-tech text-[#888983]">
                  <span>VERIFIED EXTERNAL PROFILES · MIKEY</span>
                  <span>05 COORDINATES</span>
                </div>

                <div className="divide-y divide-[#454642]/50 border-t border-b border-[#454642]/50">
                  {EXTERNAL_PROFILES.map((profile, idx) => (
                    <a
                      key={profile.id}
                      href={profile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={profile.ariaLabel}
                      data-testid={`social-link-${profile.id}`}
                      className="py-3.5 px-2.5 flex items-center justify-between gap-4 group text-sm hover:bg-[#111210] transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#E9E5DA]"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="font-mono-tech text-xs text-[#888983] shrink-0">
                          0{idx + 1}
                        </span>
                        <span className="w-7 h-7 bg-[#111210] border border-[#454642] group-hover:border-[#526BFF] flex items-center justify-center text-[#E9E5DA] group-hover:text-[#526BFF] transition-colors shrink-0">
                          <SocialPlatformIcon
                            platformId={profile.id}
                            className="w-3.5 h-3.5"
                          />
                        </span>
                        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5 min-w-0">
                          <span className="font-medium text-[#F8F7F2] group-hover:underline underline-offset-4 shrink-0">
                            {profile.label}
                          </span>
                          <span
                            aria-hidden="true"
                            className="text-[#454642] shrink-0"
                          >
                            ·
                          </span>
                          <span className="font-mono-tech text-xs text-[#888983] break-all sm:break-normal">
                            {profile.handle}
                          </span>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-[#888983] group-hover:text-[#F8F7F2] transition-colors shrink-0" />
                    </a>
                  ))}
                </div>

                <footer className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono-tech text-[#888983]">
                  <span>MIKEY · Computer Science &amp; Software Architecture</span>
                  <button
                    type="button"
                    onClick={() => navigateToPath('/work')}
                    className="text-[#E9E5DA] hover:text-[#F8F7F2] underline underline-offset-4 cursor-pointer"
                  >
                    Revisit Built Work (04)
                  </button>
                </footer>
              </nav>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
