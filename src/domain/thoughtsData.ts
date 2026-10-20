export type ThoughtOrigin = 'mikey-original' | 'draft';
export type AccentTone = 'amber' | 'cobalt' | 'monochrome';

export interface ThoughtFragment {
  id: string;
  text: string;
  origin: ThoughtOrigin;
  status: 'original' | 'draft';
  register:
    | 'introspective'
    | 'challenging'
    | 'quiet'
    | 'dialectical'
    | 'constructive';
  accent: AccentTone;
  spatialPresentation:
    | 'monolith-wall'
    | 'opposing-planes'
    | 'horizon-beam'
    | 'still-chamber';
  pairedContradictionText?: string;
  stayWithThoughtQuestion: string;
  cameraShiftOffset: [number, number, number];
  foldTarget: number;
}

/**
 * Central structured content file for "03 — THE QUIETER SPACES BETWEEN STRUCTURES".
 * Strictly separates MIKEY's original supplied thoughts from newly generated draft fragments.
 */
export const MIKEY_ORIGINAL_THOUGHTS: ThoughtFragment[] = [
  {
    id: 'mikey-mirrors',
    text: 'The mirrors in your mind can reflect the best of yourself not the worst of someone else.',
    origin: 'mikey-original',
    status: 'original',
    register: 'introspective',
    accent: 'amber',
    spatialPresentation: 'monolith-wall',
    stayWithThoughtQuestion:
      "What changes when you stop using someone else's worst moment as the measure of your own character?",
    cameraShiftOffset: [-1.4, 0.35, -1.1],
    foldTarget: 0.16,
  },
  {
    id: 'mikey-family',
    text: 'The family you think is family is just a stepping stone to real family.',
    origin: 'mikey-original',
    status: 'original',
    register: 'challenging',
    accent: 'cobalt',
    spatialPresentation: 'horizon-beam',
    stayWithThoughtQuestion:
      'What makes a relationship feel like belonging rather than obligation?',
    cameraShiftOffset: [1.4, 0.25, -0.9],
    foldTarget: 0.68,
  },
];

export const DRAFT_THOUGHT_FRAGMENTS: ThoughtFragment[] = [
  {
    id: 'draft-becoming-memory',
    text: 'The version of you that someone remembers is not the same as the person you are becoming.',
    origin: 'draft',
    status: 'draft',
    register: 'quiet',
    accent: 'amber',
    spatialPresentation: 'still-chamber',
    stayWithThoughtQuestion:
      'What are you still becoming, even if you cannot yet describe it?',
    cameraShiftOffset: [-0.8, 0.5, -0.6],
    foldTarget: 0.42,
  },
  {
    id: 'draft-contradiction-protection',
    text: 'Sometimes the most interesting thing about a contradiction is what both sides are trying to protect.',
    pairedContradictionText:
      'The mind can build a prison from the same thoughts it once used to imagine freedom.',
    origin: 'draft',
    status: 'draft',
    register: 'dialectical',
    accent: 'cobalt',
    spatialPresentation: 'opposing-planes',
    stayWithThoughtQuestion:
      'When two of your own convictions disagree, what is each side trying to keep safe?',
    cameraShiftOffset: [0.0, 0.65, -1.4],
    foldTarget: 0.84,
  },
  {
    id: 'draft-maturity-certainty',
    text: 'Perhaps maturity is not becoming certain. Perhaps it is becoming more careful with certainty.',
    pairedContradictionText:
      'Knowing what you believe is useful. Knowing why you believe it is more difficult.',
    origin: 'draft',
    status: 'draft',
    register: 'introspective',
    accent: 'amber',
    spatialPresentation: 'opposing-planes',
    stayWithThoughtQuestion:
      'Which of your current certainties would become stronger if you allowed yourself to question it?',
    cameraShiftOffset: [1.1, -0.2, -0.8],
    foldTarget: 0.28,
  },
  {
    id: 'draft-connection-direction',
    text: 'Not every connection is a destination. Some people reveal a direction; others reveal a boundary.',
    origin: 'draft',
    status: 'draft',
    register: 'quiet',
    accent: 'monochrome',
    spatialPresentation: 'monolith-wall',
    stayWithThoughtQuestion:
      'Can a chapter matter deeply without needing to last forever?',
    cameraShiftOffset: [-1.1, 0.15, -0.7],
    foldTarget: 0.52,
  },
  {
    id: 'draft-idea-reality',
    text: 'An idea is easy to love before reality asks you to build it.',
    pairedContradictionText:
      'An unfinished person can still make something meaningful.',
    origin: 'draft',
    status: 'draft',
    register: 'constructive',
    accent: 'cobalt',
    spatialPresentation: 'horizon-beam',
    stayWithThoughtQuestion:
      'What survives when an idea leaves your head and meets the constraints of real construction?',
    cameraShiftOffset: [0.4, 0.4, -1.5],
    foldTarget: 0.36,
  },
];

export const ALL_THOUGHT_FRAGMENTS: ThoughtFragment[] = [
  ...MIKEY_ORIGINAL_THOUGHTS,
  ...DRAFT_THOUGHT_FRAGMENTS,
];

export function getThoughtById(id: string): ThoughtFragment {
  return (
    ALL_THOUGHT_FRAGMENTS.find((t) => t.id === id) || MIKEY_ORIGINAL_THOUGHTS[0]
  );
}
