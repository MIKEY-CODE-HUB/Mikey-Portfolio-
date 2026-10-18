/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  ABOUT_PARAGRAPHS,
  EXTERNAL_PROFILES,
  INITIAL_MARGIN_NOTES,
  INTEREST_CLUSTERS,
  MarginNote,
  PROJECTS,
  RouteId,
  SCENE_KEYFRAMES,
  filterInterestsByCluster,
  resolveRouteFromPath,
  resolveRouteFromScroll,
} from './domain/portfolioData';
import { WorldCanvas } from './three/WorldCanvas';
import { SurfaceFinishMode } from './three/signatureObject';
import { TopBar } from './components/TopBar';
import { BottomControlDock } from './components/BottomControlDock';
import { SynthesisStudio } from './components/SynthesisStudio';
import { ArrowUpRight, ArrowLeft, Compass, Plus } from 'lucide-react';

const STORAGE_KEY_NOTES = 'mikey_portfolio_margin_notes_v1';

export default function App() {
  const [activeRouteId, setActiveRouteId] = useState<RouteId>(() =>
    resolveRouteFromPath(window.location.pathname).id
  );
  const [scrollProgress, setScrollProgress] = useState<number>(() => {
    const initial = resolveRouteFromPath(window.location.pathname);
    return initial.scrollAnchor;
  });

  // 3D Spatial Controls state
  const [paradoxOverride, setParadoxOverride] = useState<number | null>(null);
  const [finishMode, setFinishMode] = useState<SurfaceFinishMode>('obsidian');
  const [cameraPreset, setCameraPreset] = useState<
    'narrative' | 'isometric' | 'elevation'
  >('narrative');
  const [reducedMotion, setReducedMotion] = useState<boolean>(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);
  const [signatureInspectedCount, setSignatureInspectedCount] = useState(0);

  // Notes & Interests state
  const [selectedClusterId, setSelectedClusterId] = useState<string>('all');
  const [marginNotes, setMarginNotes] = useState<MarginNote[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return INITIAL_MARGIN_NOTES;
  });
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState('Technical Observation');
  const [newNoteBody, setNewNoteBody] = useState('');
  const [noteFormError, setNoteFormError] = useState<string | null>(null);
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Section refs for smooth scroll-to-section coordination
  const homeRef = useRef<HTMLElement | null>(null);
  const aboutRef = useRef<HTMLElement | null>(null);
  const workRef = useRef<HTMLElement | null>(null);
  const notesRef = useRef<HTMLElement | null>(null);
  const contactRef = useRef<HTMLElement | null>(null);
  const programmaticScrollRef = useRef<boolean>(false);

  const scrollToRouteSection = (routeId: RouteId, instant = false) => {
    const map: Record<string, HTMLElement | null> = {
      home: homeRef.current,
      about: aboutRef.current,
      work: workRef.current,
      'work-zenith': workRef.current,
      'work-deadzone': workRef.current,
      notes: notesRef.current,
      contact: contactRef.current,
    };
    const targetEl = map[routeId];
    if (targetEl) {
      programmaticScrollRef.current = true;
      const top = targetEl.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top,
        behavior: instant || reducedMotion ? 'auto' : 'smooth',
      });
      window.setTimeout(() => {
        programmaticScrollRef.current = false;
      }, instant || reducedMotion ? 150 : 700);
    }
  };

  // Navigate to any path with interruptible transition & URL sync
  const navigateToPath = (path: string, replace = false) => {
    const resolved = resolveRouteFromPath(path);
    programmaticScrollRef.current = true;
    if (window.location.pathname !== resolved.path) {
      if (replace) {
        window.history.replaceState({}, '', resolved.path);
      } else {
        window.history.pushState({}, '', resolved.path);
      }
    }
    setActiveRouteId(resolved.id);
    setScrollProgress(resolved.scrollAnchor);
    scrollToRouteSection(resolved.id);
  };

  // Handle initial route & ?autostart=1 query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resolved = resolveRouteFromPath(window.location.pathname);
    programmaticScrollRef.current = true;
    setActiveRouteId(resolved.id);
    setScrollProgress(resolved.scrollAnchor);

    if (params.get('autostart') === '1' && resolved.id === 'home') {
      setActiveRouteId('about');
      setScrollProgress(0.25);
      scrollToRouteSection('about', true);
    } else if (resolved.id !== 'home') {
      scrollToRouteSection(resolved.id, true);
    } else {
      programmaticScrollRef.current = false;
    }

    const onPopState = () => {
      const next = resolveRouteFromPath(window.location.pathname);
      programmaticScrollRef.current = true;
      setActiveRouteId(next.id);
      setScrollProgress(next.scrollAnchor);
      scrollToRouteSection(next.id, true);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Coordinate window scroll with continuous 3D camera and URL state
  useEffect(() => {
    const handleScroll = () => {
      if (programmaticScrollRef.current) return;

      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const rawProgress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
      setScrollProgress(rawProgress);

      // Preserve case-study sub-route when visitor is within the Work chapter
      setActiveRouteId((prevRoute) => {
        if (
          (prevRoute === 'work-zenith' || prevRoute === 'work-deadzone') &&
          Math.abs(rawProgress - 0.5) < 0.18
        ) {
          return prevRoute;
        }
        const nextSpec = resolveRouteFromScroll(rawProgress);
        if (nextSpec.id !== prevRoute) {
          window.history.replaceState({}, '', nextSpec.path);
        }
        return nextSpec.id;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddMarginNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteBody.trim()) {
      setNoteFormError('Both a title and note reflection are required.');
      return;
    }
    const created: MarginNote = {
      id: `note-${Date.now()}`,
      title: newNoteTitle.trim(),
      category: newNoteCategory.trim() || 'Margin Note',
      date: `Margin Entry · 0${marginNotes.length + 1}`,
      body: newNoteBody.trim(),
      isUserAdded: true,
    };
    const updated = [created, ...marginNotes];
    setMarginNotes(updated);
    try {
      localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(updated));
    } catch {
      // ignore storage quota errors
    }
    setNewNoteTitle('');
    setNewNoteBody('');
    setNoteFormError(null);
    setIsAddingNote(false);
  };

  const handleInspectSignature = () => {
    setSignatureInspectedCount((c) => c + 1);
    setParadoxOverride((prev) => {
      const current =
        prev !== null
          ? prev
          : SCENE_KEYFRAMES[activeRouteId].paradoxSeparation;
      return current > 0.5 ? 0.1 : 0.85;
    });
  };

  const currentParadoxValue =
    paradoxOverride !== null
      ? paradoxOverride
      : SCENE_KEYFRAMES[activeRouteId].paradoxSeparation;

  const activeCaseStudyProject =
    activeRouteId === 'work-zenith'
      ? PROJECTS[0]
      : activeRouteId === 'work-deadzone'
      ? PROJECTS[1]
      : null;

  const filteredClusters = filterInterestsByCluster(
    INTEREST_CLUSTERS,
    selectedClusterId
  );

  return (
    <div
      className="relative min-h-screen text-[#E9E5DA] selection:bg-[#E9E5DA] selection:text-[#111210]"
      data-route={activeRouteId}
    >
      {/* Full-bleed Native Three.js Continuous Environment */}
      <WorldCanvas
        activeRouteId={activeRouteId}
        scrollProgress={scrollProgress}
        paradoxOverride={paradoxOverride}
        finishMode={finishMode}
        cameraPreset={cameraPreset}
        reducedMotion={reducedMotion}
        hoveredProjectId={hoveredProjectId}
        onNavigateRoute={navigateToPath}
        onInspectSignature={handleInspectSignature}
      />

      {/* Persistent 3-Zone Top Navigation */}
      <TopBar activeRouteId={activeRouteId} onNavigate={navigateToPath} />

      {/* Main Continuous Spatial Narrative */}
      <main className="relative z-10 pointer-events-none">
        {/* ===================================================================
            CHAPTER 01: HOME / OPENING EXPERIENCE
        =================================================================== */}
        <section
          ref={homeRef}
          id="home"
          aria-label="Opening Installation"
          className="min-h-screen w-full max-w-[1360px] mx-auto px-6 md:px-12 pt-28 pb-28 flex flex-col justify-between"
        >
          {/* Top-left quiet architectural coordinate & skip control */}
          <div className="flex flex-wrap items-center justify-between gap-4 pointer-events-auto">
            <div className="text-xs font-mono-tech text-[#888983] flex items-center gap-2">
              <span>01. Arrival</span>
              <span aria-hidden="true">·</span>
              <span>Architectural Contradiction in Obsidian &amp; Bone</span>
            </div>
            <button
              type="button"
              onClick={() => navigateToPath('/about')}
              className="text-xs font-mono-tech text-[#888983] hover:text-[#F8F7F2] underline underline-offset-4 transition-colors cursor-pointer"
            >
              Skip Opening Sequence →
            </button>
          </div>

          {/* Central viewport intentionally kept open for the 3D MIKEY wordmark & Signature Impossible Object */}
          <div className="my-auto py-20" aria-hidden="true" />

          {/* Bottom Split: Concise Introduction & Actions without obscuring center 3D geometry */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pointer-events-auto bg-[#111210]/85 border border-[#454642]/60 p-6 md:p-8">
            <div className="lg:col-span-7 space-y-3">
              <div className="text-xs font-mono-tech text-[#888983]">
                PUBLIC IDENTITY · MIKEY
              </div>
              <h1
                className="font-editorial text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-[#F8F7F2]"
                style={{ textWrap: 'balance' }}
              >
                Computer science student. Builder. Perpetual learner.
              </h1>
              <p className="text-base sm:text-lg text-[#E9E5DA] max-w-2xl leading-relaxed">
                I build to understand. I explore to find what understanding misses.
              </p>
            </div>

            <div className="lg:col-span-5 flex flex-wrap items-center lg:justify-end gap-4">
              <button
                type="button"
                onClick={() => navigateToPath('/about')}
                className="px-5 py-3 text-xs sm:text-sm font-medium bg-[#E9E5DA] text-[#111210] hover:bg-[#F8F7F2] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Enter the world
              </button>
              <button
                type="button"
                onClick={() => navigateToPath('/work')}
                className="px-5 py-3 text-xs sm:text-sm font-medium bg-[#20211F] text-[#F8F7F2] border border-[#888983] hover:border-[#F8F7F2] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                View my work
              </button>
              <button
                type="button"
                onClick={handleInspectSignature}
                className="px-4 py-3 text-xs font-mono-tech text-[#888983] hover:text-[#E9E5DA] border border-[#454642] transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Shift Paradox ({signatureInspectedCount})</span>
              </button>
            </div>
          </div>
        </section>

        {/* ===================================================================
            CHAPTER 02: ABOUT — A HUMAN, HONEST PORTRAIT
        =================================================================== */}
        <section
          ref={aboutRef}
          id="about"
          aria-label="About MIKEY"
          className="min-h-screen w-full max-w-[1360px] mx-auto px-6 md:px-12 py-28 flex items-center"
        >
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Introspective Editorial Portrait */}
            <div className="lg:col-span-7 bg-[#111210]/90 border border-[#454642]/70 p-8 md:p-12 pointer-events-auto space-y-6">
              <div className="flex items-center justify-between text-xs font-mono-tech text-[#888983] pb-4 border-b border-[#454642]/50">
                <span>02. Portrait &amp; Direction</span>
                <span>Still Becoming</span>
              </div>

              <h2
                className="font-editorial text-3xl sm:text-4xl md:text-5xl text-[#F8F7F2] leading-tight"
                style={{ textWrap: 'balance' }}
              >
                My contradictions aren’t flaws I need to resolve.
              </h2>

              <div className="space-y-4 text-sm sm:text-base text-[#E9E5DA] leading-relaxed">
                {ABOUT_PARAGRAPHS.map((paragraph, idx) => (
                  <p
                    key={idx}
                    className={
                      idx === 0 || idx === 1
                        ? 'font-editorial text-xl sm:text-2xl text-[#F8F7F2]'
                        : 'text-[#E9E5DA]/90'
                    }
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="pt-6 border-t border-[#454642]/50 flex flex-wrap items-center justify-between gap-4">
                <div className="text-xs font-mono-tech text-[#888983]">
                  Computer Science · Systems Construction · Philosophical Inquiry
                </div>
                <button
                  type="button"
                  onClick={() => navigateToPath('/work')}
                  className="px-4 py-2 text-xs font-medium bg-[#E9E5DA] text-[#111210] hover:bg-[#F8F7F2] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Continue to Built Work →
                </button>
              </div>
            </div>

            {/* Right Column: Open Spatial Framing for the 3D Signature Object */}
            <div className="lg:col-span-5 lg:mt-24 bg-[#161715]/88 border border-[#454642]/60 p-6 pointer-events-auto space-y-4">
              <div className="text-xs font-mono-tech text-[#888983]">
                SPATIAL ANCHOR · IMPOSSIBLE MONOLITH
              </div>
              <h3 className="font-editorial text-2xl text-[#F8F7F2]">
                Perspective &amp; Construction
              </h3>
              <p className="text-sm text-[#888983] leading-relaxed">
                Seen from the arrival axis, the obsidian beams form a closed frame.
                From this oblique vantage point, the cantilevers separate into
                independent trajectories held in tension by a single translucent datum plane.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setParadoxOverride((prev) =>
                      prev !== null && prev > 0.5 ? 0.0 : 0.85
                    )
                  }
                  className="px-3.5 py-2 text-xs font-mono-tech border border-[#888983] text-[#E9E5DA] hover:bg-[#20211F] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Toggle Perspective Alignment
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            CHAPTER 03: WORK — REAL PROJECTS & CASE STUDIES
        =================================================================== */}
        <section
          ref={workRef}
          id="work"
          aria-label="Selected Work and Investigations"
          className="min-h-screen w-full max-w-[1360px] mx-auto px-6 md:px-12 py-28 flex flex-col justify-center"
        >
          <div className="bg-[#111210]/90 border border-[#454642]/70 p-8 md:p-12 pointer-events-auto">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#454642]/50">
              <div>
                <div className="text-xs font-mono-tech text-[#888983] mb-1">
                  03. Investigations &amp; Built Artifacts
                </div>
                <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl text-[#F8F7F2]">
                  {activeCaseStudyProject
                    ? `${activeCaseStudyProject.title} — Architectural Case Study`
                    : 'Real Software, Explored Through Structure'}
                </h2>
              </div>

              {activeCaseStudyProject ? (
                <button
                  type="button"
                  onClick={() => navigateToPath('/work')}
                  className="px-4 py-2 text-xs font-medium bg-[#20211F] text-[#F8F7F2] border border-[#888983] hover:border-[#F8F7F2] transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>All Investigations</span>
                </button>
              ) : (
                <div className="text-xs font-mono-tech text-[#888983]">
                  02 Verified Deployments · Select an Artifact
                </div>
              )}
            </div>

            {/* Expanded Case Study View (/work/zenith or /work/deadzone-bastion) */}
            {activeCaseStudyProject ? (
              <div
                className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10"
                data-testid={`case-study-${activeCaseStudyProject.id}`}
              >
                <div className="lg:col-span-7 space-y-6">
                  <div className="text-xs font-mono-tech text-[#888983] flex flex-wrap items-center gap-2">
                    <span>Artifact {activeCaseStudyProject.index}</span>
                    <span aria-hidden="true">·</span>
                    <span>{activeCaseStudyProject.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{activeCaseStudyProject.verifiedStatus}</span>
                  </div>

                  <p className="font-editorial text-2xl sm:text-3xl text-[#F8F7F2] leading-snug">
                    {activeCaseStudyProject.shortSummary}
                  </p>

                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-[#F8F7F2]">
                      The Underlying Question
                    </h3>
                    <p className="text-sm sm:text-base text-[#E9E5DA]/90 leading-relaxed">
                      {activeCaseStudyProject.coreIdea}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-[#F8F7F2]">
                      Spatial &amp; Architectural Translation
                    </h3>
                    <p className="text-sm text-[#888983] leading-relaxed">
                      {activeCaseStudyProject.spatialRepresentation}
                    </p>
                  </div>

                  <div className="pt-4 flex flex-wrap items-center gap-4">
                    <a
                      href={activeCaseStudyProject.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-3 text-xs sm:text-sm font-medium bg-[#E9E5DA] text-[#111210] hover:bg-[#F8F7F2] transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
                    >
                      <span>{activeCaseStudyProject.primaryActionLabel}</span>
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
                      className="px-4 py-3 text-xs font-mono-tech border border-[#454642] text-[#E9E5DA] hover:border-[#888983] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Switch to{' '}
                      {activeCaseStudyProject.id === 'zenith'
                        ? 'Deadzone Bastion'
                        : 'Zenith'}{' '}
                      Study →
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-[#161715] border border-[#454642]/70 p-6 space-y-6">
                  <div>
                    <div className="text-xs font-mono-tech text-[#888983] mb-3">
                      KNOWN PROJECT SCOPE &amp; DIRECTION
                    </div>
                    <ul className="space-y-2.5 text-sm text-[#E9E5DA]">
                      {activeCaseStudyProject.verifiedCapabilities.map(
                        (cap, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span className="font-mono-tech text-xs text-[#888983] mt-0.5">
                              0{i + 1}.
                            </span>
                            <span>{cap}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  <div className="pt-5 border-t border-[#454642]/50">
                    <div className="text-xs font-mono-tech text-[#888983] mb-3">
                      HONEST RECORD &amp; OBSERVATIONS
                    </div>
                    <ul className="space-y-2 text-xs text-[#888983] leading-relaxed">
                      {activeCaseStudyProject.architecturalNotes.map(
                        (note, i) => (
                          <li key={i}>{note}</li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              /* Dual Distinct Composition for Zenith vs Deadzone Bastion */
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Project 1: Zenith — Expansive, calm, horizon-oriented composition */}
                <article
                  onMouseEnter={() => setHoveredProjectId('zenith')}
                  onMouseLeave={() => setHoveredProjectId(null)}
                  className="lg:col-span-7 bg-[#161715]/95 border border-[#454642] p-7 md:p-9 flex flex-col justify-between transition-colors hover:border-[#E9E5DA]"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-mono-tech text-[#888983]">
                      <span>01 · Focus &amp; Accountability Platform</span>
                      <span>zenith-dusky-theta.vercel.app</span>
                    </div>

                    <h3 className="font-editorial text-3xl sm:text-4xl text-[#F8F7F2]">
                      Zenith
                    </h3>

                    <p className="text-sm sm:text-base text-[#E9E5DA] leading-relaxed">
                      {PROJECTS[0].shortSummary}
                    </p>

                    <p className="text-xs sm:text-sm text-[#888983] leading-relaxed">
                      {PROJECTS[0].coreIdea}
                    </p>

                    <div className="pt-2 text-xs font-mono-tech text-[#888983]">
                      Deep Work · Silent Coworking · Distraction Boundaries · Ambient Study
                    </div>
                  </div>

                  <div className="mt-8 pt-5 border-t border-[#454642]/50 flex flex-wrap items-center justify-between gap-4">
                    <a
                      href={PROJECTS[0].liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 text-xs font-medium bg-[#E9E5DA] text-[#111210] hover:bg-[#F8F7F2] transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
                    >
                      <span>Explore Zenith</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>

                    <button
                      type="button"
                      onClick={() => navigateToPath('/work/zenith')}
                      className="px-4 py-2.5 text-xs font-mono-tech text-[#E9E5DA] border border-[#454642] hover:border-[#E9E5DA] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Read Case Study →
                    </button>
                  </div>
                </article>

                {/* Project 2: Deadzone Bastion — Angular, structured, tactical perimeter composition */}
                <article
                  onMouseEnter={() => setHoveredProjectId('deadzone-bastion')}
                  onMouseLeave={() => setHoveredProjectId(null)}
                  className="lg:col-span-5 bg-[#20211F]/95 border border-[#888983]/60 p-7 md:p-9 flex flex-col justify-between transition-colors hover:border-[#F8F7F2]"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-mono-tech text-[#888983]">
                      <span>02 · Tactical Tower-Defense Game</span>
                      <span>Live Arena</span>
                    </div>

                    <h3 className="font-editorial text-3xl sm:text-4xl text-[#F8F7F2]">
                      Deadzone Bastion
                    </h3>

                    <p className="text-sm sm:text-base text-[#E9E5DA] leading-relaxed">
                      {PROJECTS[1].shortSummary}
                    </p>

                    <p className="text-xs sm:text-sm text-[#888983] leading-relaxed">
                      {PROJECTS[1].coreIdea}
                    </p>

                    <div className="pt-2 text-xs font-mono-tech text-[#888983]">
                      Perimeter Geometry · Wave Pressure · Tactical Decisions
                    </div>
                  </div>

                  <div className="mt-8 pt-5 border-t border-[#454642]/60 flex flex-wrap items-center justify-between gap-4">
                    <a
                      href={PROJECTS[1].liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 text-xs font-medium bg-[#E9E5DA] text-[#111210] hover:bg-[#F8F7F2] transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
                    >
                      <span>Explore Deadzone Bastion</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>

                    <button
                      type="button"
                      onClick={() => navigateToPath('/work/deadzone-bastion')}
                      className="px-4 py-2.5 text-xs font-mono-tech text-[#E9E5DA] border border-[#454642] hover:border-[#E9E5DA] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Read Case Study →
                    </button>
                  </div>
                </article>
              </div>
            )}
          </div>
        </section>

        {/* ===================================================================
            CHAPTER 04: NOTES & INTERESTS (THE MARGINS OF THE NOTEBOOK)
        =================================================================== */}
        <section
          ref={notesRef}
          id="notes"
          aria-label="Notes and Areas of Exploration"
          className="min-h-screen w-full max-w-[1360px] mx-auto px-6 md:px-12 py-28"
        >
          <div className="bg-[#111210]/92 border border-[#454642]/70 p-8 md:p-12 pointer-events-auto">
            <div className="flex flex-wrap items-end justify-between gap-6 pb-6 border-b border-[#454642]/50">
              <div>
                <div className="text-xs font-mono-tech text-[#888983] mb-1">
                  04. Margins, Learning &amp; Areas of Exploration
                </div>
                <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl text-[#F8F7F2]">
                  The Quieter Spaces Between Structures
                </h2>
                <p className="text-sm text-[#888983] mt-2 max-w-2xl">
                  Presented as genuine directions of study, curiosity, and ongoing
                  learning—never as claims of finished mastery.
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

            {/* Interest Clusters Grid (Clean unboxed typography, zero pill walls) */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredClusters.map((cluster) => (
                <div
                  key={cluster.id}
                  className="bg-[#161715]/90 border border-[#454642]/60 p-6 flex flex-col justify-between space-y-4"
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

            {/* Margin Notes Archive + Easy Way to Add New Notes */}
            <div className="mt-12 pt-10 border-t border-[#454642]/60">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <div className="text-xs font-mono-tech text-[#888983]">
                    MARGIN NOTEBOOK
                  </div>
                  <h3 className="font-editorial text-2xl sm:text-3xl text-[#F8F7F2]">
                    Working Notes &amp; Fragments
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingNote((prev) => !prev)}
                  className="px-4 py-2 text-xs font-medium bg-[#20211F] text-[#E9E5DA] border border-[#888983] hover:border-[#F8F7F2] transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingNote ? 'Close Margin Editor' : 'Append Margin Note'}</span>
                </button>
              </div>

              {isAddingNote && (
                <form
                  onSubmit={handleAddMarginNote}
                  className="mb-8 bg-[#161715] border border-[#888983] p-6 space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="note-title-input"
                        className="block text-xs text-[#E9E5DA] mb-1"
                      >
                        Note Title
                      </label>
                      <input
                        id="note-title-input"
                        type="text"
                        value={newNoteTitle}
                        onChange={(e) => setNewNoteTitle(e.target.value)}
                        placeholder="e.g., Notes on Graph Traversal & Intuition"
                        className="w-full bg-[#111210] border border-[#454642] p-2.5 text-sm text-[#F8F7F2] focus:border-[#E9E5DA] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="note-category-input"
                        className="block text-xs text-[#E9E5DA] mb-1"
                      >
                        Area of Inquiry
                      </label>
                      <input
                        id="note-category-input"
                        type="text"
                        value={newNoteCategory}
                        onChange={(e) => setNewNoteCategory(e.target.value)}
                        className="w-full bg-[#111210] border border-[#454642] p-2.5 text-sm text-[#F8F7F2] focus:border-[#E9E5DA] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="note-body-input"
                      className="block text-xs text-[#E9E5DA] mb-1"
                    >
                      Observation or Fragment
                    </label>
                    <textarea
                      id="note-body-input"
                      rows={3}
                      value={newNoteBody}
                      onChange={(e) => setNewNoteBody(e.target.value)}
                      placeholder="Record a technical observation, question, or philosophical fragment..."
                      className="w-full bg-[#111210] border border-[#454642] p-2.5 text-sm text-[#F8F7F2] focus:border-[#E9E5DA] focus:outline-none"
                    />
                  </div>

                  {noteFormError && (
                    <p role="alert" className="text-xs text-[#E9E5DA] bg-[#20211F] p-2 border border-[#888983]">
                      {noteFormError}
                    </p>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-medium bg-[#E9E5DA] text-[#111210] hover:bg-[#F8F7F2] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Save Margin Entry
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {marginNotes.map((note) => (
                  <article
                    key={note.id}
                    className="bg-[#161715]/80 border border-[#454642]/50 p-6 space-y-2.5"
                  >
                    <div className="text-xs font-mono-tech text-[#888983] flex items-center gap-2">
                      <span>{note.date}</span>
                      <span aria-hidden="true">·</span>
                      <span>{note.category}</span>
                    </div>
                    <h4 className="font-editorial text-xl text-[#F8F7F2]">
                      {note.title}
                    </h4>
                    <p className="text-sm text-[#E9E5DA]/90 leading-relaxed">
                      {note.body}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            {/* High-Thinking Inquiry & 1K/2K/4K Architectural Plate Synthesis Studio */}
            <SynthesisStudio />
          </div>
        </section>

        {/* ===================================================================
            CHAPTER 05: CONTACT & EXTERNAL PROFILES ("THE EXIT THAT CONTINUES")
        =================================================================== */}
        <section
          ref={contactRef}
          id="contact"
          aria-label="Contact and External Profiles"
          className="min-h-screen w-full max-w-[1360px] mx-auto px-6 md:px-12 py-28 flex items-center"
        >
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
            <div className="lg:col-span-7 bg-[#111210]/92 border border-[#454642]/70 p-8 md:p-12 pointer-events-auto space-y-6">
              <div className="text-xs font-mono-tech text-[#888983]">
                05. Horizon &amp; Continuity
              </div>

              <h2 className="font-editorial text-4xl sm:text-5xl text-[#F8F7F2]">
                The Exit That Continues
              </h2>

              <p className="text-base sm:text-lg text-[#E9E5DA] leading-relaxed">
                You’ve reached the edge of this little world. It doesn’t have to
                be the end of the conversation.
              </p>

              <p className="text-sm text-[#888983] leading-relaxed">
                If something here made you curious, feel free to reach out or
                follow what I’m building across these coordinates.
              </p>

              <div className="pt-4 divide-y divide-[#454642]/50 border-t border-b border-[#454642]/50">
                {EXTERNAL_PROFILES.map((profile, idx) => (
                  <a
                    key={profile.id}
                    href={profile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={profile.ariaLabel}
                    className="py-4 flex items-center justify-between gap-4 group text-sm hover:bg-[#161715] px-2 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-mono-tech text-xs text-[#888983]">
                        0{idx + 1}
                      </span>
                      <span className="font-medium text-[#F8F7F2] group-hover:underline">
                        {profile.label}
                      </span>
                      <span aria-hidden="true" className="text-[#454642]">
                        ·
                      </span>
                      <span className="font-mono-tech text-xs text-[#888983]">
                        {profile.handle}
                      </span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-[#888983] group-hover:text-[#F8F7F2] transition-colors shrink-0" />
                  </a>
                ))}
              </div>

              <footer className="pt-4 flex flex-wrap items-center justify-between gap-4 text-xs font-mono-tech text-[#888983]">
                <span>MIKEY · Computer Science &amp; Software Architecture</span>
                <button
                  type="button"
                  onClick={() => navigateToPath('/')}
                  className="hover:text-[#F8F7F2] underline underline-offset-4 cursor-pointer"
                >
                  Return to Origin (01) ↑
                </button>
              </footer>
            </div>

            <div className="lg:col-span-5" aria-hidden="true" />
          </div>
        </section>
      </main>

      {/* Collapsible Bottom 3D Viewport Control Dock (<= 15% footprint, zero side-panel clutter) */}
      <BottomControlDock
        paradoxValue={currentParadoxValue}
        onParadoxChange={(val) => setParadoxOverride(val)}
        finishMode={finishMode}
        onFinishModeChange={setFinishMode}
        cameraPreset={cameraPreset}
        onCameraPresetChange={setCameraPreset}
        reducedMotion={reducedMotion}
        onToggleReducedMotion={() => setReducedMotion((prev) => !prev)}
        onResetView={() => {
          setParadoxOverride(null);
          setFinishMode('obsidian');
          setCameraPreset('narrative');
        }}
      />
    </div>
  );
}
