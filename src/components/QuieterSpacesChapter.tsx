import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  MIKEY_ORIGINAL_THOUGHTS,
  DRAFT_THOUGHT_FRAGMENTS,
  ThoughtFragment,
  AccentTone,
} from '../domain/thoughtsData';
import { ArrowRight, Sparkles, Compass } from 'lucide-react';

export interface QuieterSpacesChapterProps {
  reducedMotion?: boolean;
  onThoughtFocusChange: (params: {
    accent: AccentTone | null;
    staying: boolean;
    cameraOffset: [number, number, number];
    paradoxTarget: number;
  }) => void;
  onContinueToWork: () => void;
}

export const QuieterSpacesChapter: React.FC<QuieterSpacesChapterProps> = ({
  reducedMotion = false,
  onThoughtFocusChange,
  onContinueToWork,
}) => {
  const [stayedThoughtId, setStayedThoughtId] = useState<string | null>(null);
  const [activeDraftIndex, setActiveDraftIndex] = useState<number>(0);

  const sectionRootRef = useRef<HTMLDivElement | null>(null);
  const originalCardsRef = useRef<Array<HTMLElement | null>>([]);
  const draftStageRef = useRef<HTMLDivElement | null>(null);
  const stayReflectionRef = useRef<HTMLDivElement | null>(null);

  const activeDraft = DRAFT_THOUGHT_FRAGMENTS[activeDraftIndex];

  // Subtle GSAP fade-in & scale entrance for the original thought monoliths on viewport arrival
  useEffect(() => {
    if (reducedMotion) return;
    const cards = originalCardsRef.current.filter(
      (el): el is HTMLElement => el !== null
    );
    if (cards.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        {
          opacity: 0.15,
          scale: 0.985,
          y: 12,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.14,
          ease: 'power2.out',
          overwrite: 'auto',
          clearProps: 'transform',
        }
      );
    }, sectionRootRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  // Subtle GSAP fade-in & scale animation whenever a new philosophical draft fragment appears
  useEffect(() => {
    if (reducedMotion || !draftStageRef.current) return;
    const planes = draftStageRef.current.querySelectorAll(
      '[data-fragment-plane]'
    );
    if (planes.length === 0) return;

    const tween = gsap.fromTo(
      planes,
      {
        opacity: 0.18,
        scale: 0.986,
        y: 8,
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.48,
        stagger: 0.08,
        ease: 'power2.out',
        overwrite: 'auto',
        clearProps: 'transform',
      }
    );

    return () => {
      tween.kill();
    };
  }, [activeDraftIndex, reducedMotion]);

  // Subtle GSAP reveal when "Stay with this thought" opens a quiet inquiry fragment
  useEffect(() => {
    if (reducedMotion || !stayedThoughtId || !stayReflectionRef.current) return;

    const tween = gsap.fromTo(
      stayReflectionRef.current,
      {
        opacity: 0,
        scale: 0.988,
        y: 6,
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.42,
        ease: 'power2.out',
        overwrite: 'auto',
        clearProps: 'transform',
      }
    );

    return () => {
      tween.kill();
    };
  }, [stayedThoughtId, reducedMotion]);

  const handleToggleStay = (fragment: ThoughtFragment) => {
    const nextStayed = stayedThoughtId === fragment.id ? null : fragment.id;
    setStayedThoughtId(nextStayed);
    if (nextStayed) {
      onThoughtFocusChange({
        accent: fragment.accent,
        staying: true,
        cameraOffset: fragment.cameraShiftOffset,
        paradoxTarget: fragment.paradoxTarget,
      });
    } else {
      onThoughtFocusChange({
        accent: null,
        staying: false,
        cameraOffset: [0, 0, 0],
        paradoxTarget: 0.45,
      });
    }
  };

  const handleSelectDraft = (index: number) => {
    const clamped =
      (index + DRAFT_THOUGHT_FRAGMENTS.length) % DRAFT_THOUGHT_FRAGMENTS.length;
    setActiveDraftIndex(clamped);
    const frag = DRAFT_THOUGHT_FRAGMENTS[clamped];
    const isStaying = stayedThoughtId === frag.id;
    onThoughtFocusChange({
      accent: frag.accent,
      staying: isStaying,
      cameraOffset: frag.cameraShiftOffset,
      paradoxTarget: frag.paradoxTarget,
    });
  };

  return (
    <div
      ref={sectionRootRef}
      className="w-full space-y-20 pointer-events-auto"
    >
      {/* Chapter Header: Editorial Novel Opening */}
      <div className="max-w-3xl bg-[#111210]/90 border border-[#454642]/70 p-8 md:p-10 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono-tech text-[#888983]">
          <span>CHAPTER 03 — THE QUIETER SPACES BETWEEN STRUCTURES</span>
          <span className="text-[#F0A65A]">Contemplative Region</span>
        </div>
        <h2
          className="font-editorial text-3xl sm:text-4xl md:text-5xl text-[#F8F7F2] leading-tight"
          style={{ textWrap: 'balance' }}
        >
          Not everything meaningful needs to announce itself.
        </h2>
        <p className="text-sm sm:text-base text-[#888983] leading-relaxed">
          Between the larger architectural structures, movement slows. Here, personal
          thought fragments and open contradictions hang in space—invitations to pause
          before ideas harden into code.
        </p>
      </div>

      {/* PART I: MIKEY'S TWO ORIGINAL THOUGHTS (Preserved Verbatim, Distinct Spatial Presentations) */}
      <div className="space-y-16">
        {/* Original Thought 1: The Mirrors in Your Mind (Warm Amber Wall Plane) */}
        {(() => {
          const mirrorThought = MIKEY_ORIGINAL_THOUGHTS[0];
          const isStaying = stayedThoughtId === mirrorThought.id;
          return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <article
                ref={(el) => {
                  originalCardsRef.current[0] = el;
                }}
                className={`lg:col-span-8 bg-[#111210]/92 border transition-colors p-8 md:p-12 space-y-6 will-change-transform ${
                  isStaying
                    ? 'border-[#F0A65A]'
                    : 'border-[#454642]/80 hover:border-[#888983]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono-tech text-[#888983]">
                  <span>THOUGHT FRAGMENT 01 · PERSONAL ARCHIVE (MIKEY)</span>
                  <span className="text-[#F0A65A]">Interior Reflection</span>
                </div>

                <blockquote
                  className="font-editorial text-3xl sm:text-4xl md:text-[42px] text-[#F8F7F2] leading-[1.22]"
                  style={{ textWrap: 'balance' }}
                >
                  “{mirrorThought.text}”
                </blockquote>

                <div className="pt-4 border-t border-[#454642]/50 flex flex-wrap items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => handleToggleStay(mirrorThought)}
                    aria-expanded={isStaying}
                    className={`px-4 py-2 text-xs font-mono-tech transition-colors cursor-pointer whitespace-nowrap shrink-0 border ${
                      isStaying
                        ? 'bg-[#F0A65A] text-[#111210] border-[#F0A65A] font-medium'
                        : 'bg-[#161715] text-[#E9E5DA] border-[#454642] hover:border-[#F0A65A]'
                    }`}
                  >
                    {isStaying ? 'Release This Thought' : 'Stay with this thought'}
                  </button>

                  <span className="text-xs font-mono-tech text-[#888983]">
                    Plane I · West Elevation
                  </span>
                </div>

                {isStaying && (
                  <div
                    ref={stayReflectionRef}
                    className="mt-4 pt-5 border-t border-[#F0A65A]/40 space-y-2 will-change-transform"
                    data-testid="reflection-mikey-mirrors"
                  >
                    <div className="text-xs font-mono-tech text-[#F0A65A]">
                      QUIET INQUIRY · NO ANSWER REQUIRED
                    </div>
                    <p className="font-editorial italic text-xl sm:text-2xl text-[#E9E5DA] leading-relaxed">
                      {mirrorThought.stayWithThoughtQuestion}
                    </p>
                  </div>
                )}
              </article>

              <div className="lg:col-span-4 hidden lg:block" aria-hidden="true" />
            </div>
          );
        })()}

        {/* Original Thought 2: Stepping Stone to Real Family (Electric Cobalt Horizon Beam) */}
        {(() => {
          const familyThought = MIKEY_ORIGINAL_THOUGHTS[1];
          const isStaying = stayedThoughtId === familyThought.id;
          return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-4 hidden lg:block" aria-hidden="true" />

              <article
                ref={(el) => {
                  originalCardsRef.current[1] = el;
                }}
                className={`lg:col-span-8 bg-[#111210]/92 border transition-colors p-8 md:p-12 space-y-6 will-change-transform ${
                  isStaying
                    ? 'border-[#526BFF]'
                    : 'border-[#454642]/80 hover:border-[#888983]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono-tech text-[#888983]">
                  <span>THOUGHT FRAGMENT 02 · PERSONAL ARCHIVE (MIKEY)</span>
                  <span className="text-[#526BFF]">Horizon &amp; Belonging</span>
                </div>

                <blockquote
                  className="font-editorial text-3xl sm:text-4xl md:text-[42px] text-[#F8F7F2] leading-[1.22]"
                  style={{ textWrap: 'balance' }}
                >
                  “{familyThought.text}”
                </blockquote>

                <div className="pt-4 border-t border-[#454642]/50 flex flex-wrap items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => handleToggleStay(familyThought)}
                    aria-expanded={isStaying}
                    className={`px-4 py-2 text-xs font-mono-tech transition-colors cursor-pointer whitespace-nowrap shrink-0 border ${
                      isStaying
                        ? 'bg-[#526BFF] text-[#F8F7F2] border-[#526BFF] font-medium'
                        : 'bg-[#161715] text-[#E9E5DA] border-[#454642] hover:border-[#526BFF]'
                    }`}
                  >
                    {isStaying ? 'Release This Thought' : 'Stay with this thought'}
                  </button>

                  <span className="text-xs font-mono-tech text-[#888983]">
                    Plane II · East Cantilever
                  </span>
                </div>

                {isStaying && (
                  <div
                    ref={stayReflectionRef}
                    className="mt-4 pt-5 border-t border-[#526BFF]/40 space-y-2 will-change-transform"
                    data-testid="reflection-mikey-family"
                  >
                    <div className="text-xs font-mono-tech text-[#526BFF]">
                      QUIET INQUIRY · NO ANSWER REQUIRED
                    </div>
                    <p className="font-editorial italic text-xl sm:text-2xl text-[#E9E5DA] leading-relaxed">
                      {familyThought.stayWithThoughtQuestion}
                    </p>
                  </div>
                )}
              </article>
            </div>
          );
        })()}
      </div>

      {/* PART II: CURATED DRAFT FRAGMENTS & OPPOSING CONTRADICTIONS (Clearly marked status: draft) */}
      <div className="bg-[#161715]/94 border border-[#454642]/80 p-8 md:p-12 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#454642]/50">
          <div>
            <div className="text-xs font-mono-tech text-[#888983] flex items-center gap-2">
              <span>SPATIAL DIALECTIC · RESONANT FRAGMENTS</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#F0A65A]">Status: Creative Drafts</span>
            </div>
            <h3 className="font-editorial text-2xl sm:text-3xl text-[#F8F7F2] mt-1">
              Opposing Planes &amp; Unfinished Sentences
            </h3>
            <p className="text-xs text-[#888983] mt-1">
              Curated creative draft fragments written for this architectural space—stored
              separately from MIKEY’s original statements so they can be explored, revised,
              or questioned over time.
            </p>
          </div>

          {/* Fragment Coordinate Index Selector */}
          <div
            role="group"
            aria-label="Navigate draft thought fragments"
            className="flex items-center gap-1.5 bg-[#111210] p-1.5 border border-[#454642]"
          >
            {DRAFT_THOUGHT_FRAGMENTS.map((frag, idx) => {
              const isSelected = idx === activeDraftIndex;
              return (
                <button
                  key={frag.id}
                  type="button"
                  onClick={() => handleSelectDraft(idx)}
                  aria-label={`Inspect draft fragment ${idx + 1}`}
                  className={`px-3 py-1 text-xs font-mono-tech transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    isSelected
                      ? frag.accent === 'cobalt'
                        ? 'bg-[#526BFF] text-[#F8F7F2] font-medium'
                        : 'bg-[#F0A65A] text-[#111210] font-medium'
                      : 'text-[#888983] hover:text-[#E9E5DA]'
                  }`}
                >
                  0{idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Spatial Reading Stage for the Active Draft Fragment (Single or Opposing Contradiction Planes) */}
        <div
          ref={draftStageRef}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
          data-testid="draft-fragment-stage"
          data-active-fragment={activeDraft.id}
        >
          <div
            data-fragment-plane="primary"
            className={`${
              activeDraft.pairedContradictionText ? 'lg:col-span-6' : 'lg:col-span-12'
            } bg-[#111210] border border-[#454642]/70 p-7 md:p-9 flex flex-col justify-between space-y-5 will-change-transform`}
          >
            <div className="text-xs font-mono-tech text-[#888983] flex items-center justify-between">
              <span>
                FRAGMENT 0{activeDraftIndex + 1} · {activeDraft.register.toUpperCase()}
              </span>
              <span>metadata: draft</span>
            </div>

            <p
              className="font-editorial text-2xl sm:text-3xl text-[#F8F7F2] leading-snug"
              style={{ textWrap: 'balance' }}
            >
              “{activeDraft.text}”
            </p>

            <div className="text-xs font-mono-tech text-[#888983]">
              North Plane · Primary Proposition
            </div>
          </div>

          {activeDraft.pairedContradictionText && (
            <div
              data-fragment-plane="counter"
              className="lg:col-span-6 bg-[#111210] border border-[#526BFF]/50 p-7 md:p-9 flex flex-col justify-between space-y-5 will-change-transform"
            >
              <div className="text-xs font-mono-tech text-[#526BFF] flex items-center justify-between">
                <span>COUNTER-PLANE · DIALECTICAL TENSION</span>
                <span>metadata: draft</span>
              </div>

              <p
                className="font-editorial text-2xl sm:text-3xl text-[#E9E5DA] leading-snug"
                style={{ textWrap: 'balance' }}
              >
                “{activeDraft.pairedContradictionText}”
              </p>

              <div className="text-xs font-mono-tech text-[#888983]">
                South Plane · Opposing Perspective
              </div>
            </div>
          )}
        </div>

        {/* Interactive "Stay with this thought" & Fragment Navigation */}
        <div className="pt-4 border-t border-[#454642]/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => handleToggleStay(activeDraft)}
              aria-expanded={stayedThoughtId === activeDraft.id}
              className={`px-4 py-2 text-xs font-mono-tech transition-colors cursor-pointer whitespace-nowrap shrink-0 border inline-flex items-center gap-2 ${
                stayedThoughtId === activeDraft.id
                  ? 'bg-[#F0A65A] text-[#111210] border-[#F0A65A] font-medium'
                  : 'bg-[#111210] text-[#E9E5DA] border-[#454642] hover:border-[#E9E5DA]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {stayedThoughtId === activeDraft.id
                  ? 'Release This Thought'
                  : 'Stay with this thought'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectDraft(activeDraftIndex + 1)}
              className="px-4 py-2 text-xs font-mono-tech text-[#E9E5DA] bg-[#111210] border border-[#454642] hover:border-[#888983] transition-colors cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-2"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Next Spatial Fragment →</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onContinueToWork}
            className="px-4 py-2 text-xs font-medium text-[#F8F7F2] bg-[#526BFF] hover:bg-[#526BFF]/90 transition-colors cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-2"
          >
            <span>See Ideas Made Real (Chapter 04)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {stayedThoughtId === activeDraft.id && (
          <div
            ref={stayReflectionRef}
            className="pt-5 border-t border-[#F0A65A]/40 space-y-2 will-change-transform"
            data-testid={`reflection-${activeDraft.id}`}
          >
            <div className="text-xs font-mono-tech text-[#F0A65A]">
              REFLECTIVE PAUSE · STAYING WITH FRAGMENT 0{activeDraftIndex + 1}
            </div>
            <p className="font-editorial italic text-xl sm:text-2xl text-[#F8F7F2] leading-relaxed">
              {activeDraft.stayWithThoughtQuestion}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
