export type RouteId =
  | 'home'
  | 'about'
  | 'work'
  | 'work-zenith'
  | 'work-deadzone'
  | 'notes'
  | 'contact';

export interface RouteSpec {
  id: RouteId;
  path: string;
  label: string;
  scrollAnchor: number; // Normalized 0..1 world progress
  chapterIndex: string;
  subtitle: string;
}

export interface CameraKeyframe {
  position: [number, number, number];
  lookAt: [number, number, number];
  fov: number;
  signatureScale: number;
  signatureRotation: [number, number, number];
  signaturePosition: [number, number, number];
  paradoxSeparation: number;
  wireframeMix: number;
  gridElevation: number;
}

export interface ProjectRecord {
  id: 'zenith' | 'deadzone-bastion';
  routeId: 'work-zenith' | 'work-deadzone';
  path: string;
  index: string;
  title: string;
  category: string;
  liveUrl: string;
  primaryActionLabel: string;
  shortSummary: string;
  coreIdea: string;
  spatialRepresentation: string;
  verifiedStatus: string;
  verifiedCapabilities: string[];
  architecturalNotes: string[];
  visualMotif: 'concentric-focus' | 'tactical-bastion';
}

export interface InterestCluster {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  coordinate: string;
  areas: string[];
  reflection: string;
}

export interface MarginNote {
  id: string;
  title: string;
  category: string;
  date: string;
  body: string;
  isUserAdded?: boolean;
}

export interface ExternalProfile {
  id: string;
  label: string;
  handle: string;
  domain: string;
  url: string;
  ariaLabel: string;
}

export const ROUTES: RouteSpec[] = [
  {
    id: 'home',
    path: '/',
    label: 'Home',
    scrollAnchor: 0.0,
    chapterIndex: '01',
    subtitle: 'Arrival & Monumental Installation',
  },
  {
    id: 'about',
    path: '/about',
    label: 'About',
    scrollAnchor: 0.25,
    chapterIndex: '02',
    subtitle: 'Still Becoming — Portrait in Paradox',
  },
  {
    id: 'work',
    path: '/work',
    label: 'Work',
    scrollAnchor: 0.5,
    chapterIndex: '03',
    subtitle: 'Investigations & Built Artifacts',
  },
  {
    id: 'work-zenith',
    path: '/work/zenith',
    label: 'Zenith',
    scrollAnchor: 0.54,
    chapterIndex: '03.A',
    subtitle: 'Case Study · Focus & Accountability Platform',
  },
  {
    id: 'work-deadzone',
    path: '/work/deadzone-bastion',
    label: 'Deadzone Bastion',
    scrollAnchor: 0.58,
    chapterIndex: '03.B',
    subtitle: 'Case Study · Tactical Tower-Defense Game',
  },
  {
    id: 'notes',
    path: '/notes',
    label: 'Notes',
    scrollAnchor: 0.75,
    chapterIndex: '04',
    subtitle: 'Margins, Exploration & Synthesis',
  },
  {
    id: 'contact',
    path: '/contact',
    label: 'Contact',
    scrollAnchor: 1.0,
    chapterIndex: '05',
    subtitle: 'The Exit That Continues',
  },
];

export const SCENE_KEYFRAMES: Record<RouteId, CameraKeyframe> = {
  home: {
    position: [0, 1.8, 12.5],
    lookAt: [0, 1.1, 0],
    fov: 42,
    signatureScale: 1.15,
    signatureRotation: [0.14, -0.42, 0.04],
    signaturePosition: [0, 1.35, -1.2],
    paradoxSeparation: 0.18,
    wireframeMix: 0.08,
    gridElevation: 0.0,
  },
  about: {
    position: [-4.2, 2.4, 9.2],
    lookAt: [-0.8, 1.4, -0.5],
    fov: 40,
    signatureScale: 1.0,
    signatureRotation: [0.38, 0.65, -0.18],
    signaturePosition: [2.3, 1.6, -1.0],
    paradoxSeparation: 0.55,
    wireframeMix: 0.22,
    gridElevation: 0.35,
  },
  work: {
    position: [0.4, 3.2, 11.4],
    lookAt: [0, 1.0, -2.5],
    fov: 45,
    signatureScale: 0.92,
    signatureRotation: [0.22, 1.57, 0.0],
    signaturePosition: [0, 2.2, -3.6],
    paradoxSeparation: 0.35,
    wireframeMix: 0.68,
    gridElevation: 0.65,
  },
  'work-zenith': {
    position: [-3.8, 2.1, 7.4],
    lookAt: [-2.6, 1.2, -2.2],
    fov: 38,
    signatureScale: 0.78,
    signatureRotation: [0.1, 1.1, 0.05],
    signaturePosition: [1.4, 2.4, -4.4],
    paradoxSeparation: 0.12,
    wireframeMix: 0.45,
    gridElevation: 0.72,
  },
  'work-deadzone': {
    position: [3.8, 2.3, 7.4],
    lookAt: [2.6, 1.2, -2.2],
    fov: 38,
    signatureScale: 0.78,
    signatureRotation: [0.32, 2.05, -0.12],
    signaturePosition: [-1.4, 2.4, -4.4],
    paradoxSeparation: 0.48,
    wireframeMix: 0.78,
    gridElevation: 0.78,
  },
  notes: {
    position: [3.4, 3.8, 10.2],
    lookAt: [0.5, 1.6, -1.2],
    fov: 43,
    signatureScale: 0.88,
    signatureRotation: [0.52, 2.45, 0.24],
    signaturePosition: [-2.4, 1.8, -1.8],
    paradoxSeparation: 0.72,
    wireframeMix: 0.5,
    gridElevation: 0.9,
  },
  contact: {
    position: [0, 1.6, 9.6],
    lookAt: [0, 1.2, 0],
    fov: 38,
    signatureScale: 0.72,
    signatureRotation: [0.0, 0.785, 0.0],
    signaturePosition: [0, 1.3, -0.8],
    paradoxSeparation: 0.0,
    wireframeMix: 0.15,
    gridElevation: 1.0,
  },
};

export function resolveRouteFromPath(pathname: string): RouteSpec {
  const clean = pathname.replace(/\/+$/, '') || '/';
  const match = ROUTES.find((r) => r.path.toLowerCase() === clean.toLowerCase());
  return match || ROUTES[0];
}

export function resolveRouteFromScroll(progress: number): RouteSpec {
  const clamped = Math.max(0, Math.min(1, progress));
  const primaryRoutes = ROUTES.filter((r) => !r.id.startsWith('work-'));
  let closest = primaryRoutes[0];
  let minDiff = Math.abs(clamped - closest.scrollAnchor);

  for (const route of primaryRoutes) {
    const diff = Math.abs(clamped - route.scrollAnchor);
    if (diff < minDiff) {
      minDiff = diff;
      closest = route;
    }
  }
  return closest;
}

export function lerpNumber(a: number, b: number, t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return a + (b - a) * clamped;
}

export function dampValue(current: number, target: number, lambda: number, dt: number): number {
  if (dt <= 0) return current;
  return lerpNumber(current, target, 1 - Math.exp(-lambda * dt));
}

export function interpolateKeyframes(a: CameraKeyframe, b: CameraKeyframe, t: number): CameraKeyframe {
  const k = Math.max(0, Math.min(1, t));
  return {
    position: [
      lerpNumber(a.position[0], b.position[0], k),
      lerpNumber(a.position[1], b.position[1], k),
      lerpNumber(a.position[2], b.position[2], k),
    ],
    lookAt: [
      lerpNumber(a.lookAt[0], b.lookAt[0], k),
      lerpNumber(a.lookAt[1], b.lookAt[1], k),
      lerpNumber(a.lookAt[2], b.lookAt[2], k),
    ],
    fov: lerpNumber(a.fov, b.fov, k),
    signatureScale: lerpNumber(a.signatureScale, b.signatureScale, k),
    signatureRotation: [
      lerpNumber(a.signatureRotation[0], b.signatureRotation[0], k),
      lerpNumber(a.signatureRotation[1], b.signatureRotation[1], k),
      lerpNumber(a.signatureRotation[2], b.signatureRotation[2], k),
    ],
    signaturePosition: [
      lerpNumber(a.signaturePosition[0], b.signaturePosition[0], k),
      lerpNumber(a.signaturePosition[1], b.signaturePosition[1], k),
      lerpNumber(a.signaturePosition[2], b.signaturePosition[2], k),
    ],
    paradoxSeparation: lerpNumber(a.paradoxSeparation, b.paradoxSeparation, k),
    wireframeMix: lerpNumber(a.wireframeMix, b.wireframeMix, k),
    gridElevation: lerpNumber(a.gridElevation, b.gridElevation, k),
  };
}

export const ABOUT_PARAGRAPHS: string[] = [
  'Still becoming.',
  "I'm MIKEY.",
  "I'm studying computer science, building software, and figuring out what I'm capable of along the way.",
  'I like learning how things work. I like taking an idea that exists only in my head and seeing what survives when I try to build it.',
  "I'm interested in the space where logic meets imagination, where a question becomes an experiment, and where the result doesn't always match the original idea.",
  "I don't want to fit neatly into one category. I'm interested in exploring different ideas without pretending they all lead to the same destination.",
  "I'm working towards becoming a stronger engineer, understanding difficult ideas more deeply, and building things that are useful, technically sound, and interesting to experience.",
  "I'm not presenting those ambitions as accomplishments. They're directions I'm working towards.",
  "This isn't a finished definition of me. It's a record of what I'm exploring.",
];

export const PROJECTS: ProjectRecord[] = [
  {
    id: 'zenith',
    routeId: 'work-zenith',
    path: '/work/zenith',
    index: '01',
    title: 'Zenith',
    category: 'Focus & Accountability Platform',
    liveUrl: 'https://zenith-dusky-theta.vercel.app/',
    primaryActionLabel: 'Explore Zenith',
    shortSummary:
      'A focus and accountability platform centered on deep work, silent coworking, distraction protection, and ambient study experiences.',
    coreIdea:
      'Sustained attention is fragile in modern digital environments. Zenith explores how environmental boundaries, intentional session framing, and quiet shared presence can protect deep concentration without gamified noise.',
    spatialRepresentation:
      'Represented spatially through concentric temporal rings, calibrated boundary planes, and an unobstructed central locus of attention.',
    verifiedStatus: 'Live Web Deployment (Vercel)',
    verifiedCapabilities: [
      'Deep work session framing & temporal boundaries',
      'Silent coworking & shared accountability direction',
      'Distraction protection & environmental focus controls',
      'Ambient study atmosphere design',
    ],
    architecturalNotes: [
      'Designed around reducing cognitive friction before and during concentration blocks.',
      'Balances personal autonomy with subtle structural accountability.',
      'Ongoing exploration: refining session state continuity and ambient environment controls.',
    ],
    visualMotif: 'concentric-focus',
  },
  {
    id: 'deadzone-bastion',
    routeId: 'work-deadzone',
    path: '/work/deadzone-bastion',
    index: '02',
    title: 'Deadzone Bastion',
    category: 'Tactical Zombie Tower-Defense Game',
    liveUrl: 'https://deadzone-bastion.vercel.app/',
    primaryActionLabel: 'Explore Deadzone Bastion',
    shortSummary:
      'A tactical zombie tower-defense game exploring spatial perimeter control, resource pressure, and layered defensive decision-making.',
    coreIdea:
      'Every defensive structure is a hypothesis tested under wave pressure. Deadzone Bastion investigates how clear tactical geometry and real-time trade-offs create tension in a contained environment.',
    spatialRepresentation:
      'Represented spatially through interlocking defensive chevrons, sightline vectors, and a fortified central bastion under converging pressure.',
    verifiedStatus: 'Live Web Deployment (Vercel)',
    verifiedCapabilities: [
      'Tactical tower-defense perimeter layout',
      'Wave-based survival pressure in a contained arena',
      'Real-time placement and defensive line management',
      'Browser-native interactive deployment',
    ],
    architecturalNotes: [
      'Contrasts Zenith’s calm interior stillness with active spatial calculations under time constraints.',
      'Built to explore state updates, target prioritization, and responsive browser rendering.',
      'Additional technical specifications and telemetry remain open for future documentation as the project evolves.',
    ],
    visualMotif: 'tactical-bastion',
  },
];

export const INTEREST_CLUSTERS: InterestCluster[] = [
  {
    id: 'systems-engineering',
    index: 'I',
    title: 'Software Engineering & Systems',
    subtitle: 'Turning abstract models into working software',
    coordinate: 'X: -14.2 · Z: +08.4',
    areas: [
      'Software engineering and full-stack development',
      'Python and JavaScript',
      'React.js, Node.js, and Express.js',
      'AI and machine learning',
      'Competitive programming and algorithms',
    ],
    reflection:
      'Approached as an ongoing craft of translating ideas into reliable code, studying algorithmic trade-offs, and understanding what happens beneath high-level abstractions.',
  },
  {
    id: 'quantitative-math',
    index: 'II',
    title: 'Mathematics & Quantitative Reasoning',
    subtitle: 'Formal structures, uncertainty, and state spaces',
    coordinate: 'X: +11.8 · Z: +04.1',
    areas: [
      'Quantitative finance',
      'Probability and statistics',
      'Linear algebra',
      'Calculus',
    ],
    reflection:
      'Exploring how mathematical language models uncertainty, multidimensional transformations, and continuous change.',
  },
  {
    id: 'philosophy-humanities',
    index: 'III',
    title: 'Philosophy, Mind & Literature',
    subtitle: 'What formal systems leave out',
    coordinate: 'X: -09.6 · Z: -12.0',
    areas: [
      'Philosophy and psychology',
      'Literature and poetry',
      'Politics and deep conversations',
    ],
    reflection:
      'Examining human contradiction, perception, language, and ethical questions that resist purely mechanical answers.',
  },
  {
    id: 'strategy-culture',
    index: 'IV',
    title: 'Strategy, Play & Narrative Worlds',
    subtitle: 'Finite rules and imaginative exploration',
    coordinate: 'X: +15.0 · Z: -09.5',
    areas: [
      'Chess and Sudoku',
      'Cricket and other sports',
      'Reading books, watching movies, and anime',
    ],
    reflection:
      'Finding balance between combinatorial board strategy, team athletics, and long-form storytelling.',
  },
];

export const INITIAL_MARGIN_NOTES: MarginNote[] = [
  {
    id: 'margin-paradox',
    title: 'On Contradiction as Structure',
    category: 'Architectural Direction',
    date: 'Margin Entry · 01',
    body: 'My contradictions aren’t flaws I need to resolve. Being drawn simultaneously to deterministic algorithms and open-ended poetry creates a wider frame of reference than either discipline alone.',
  },
  {
    id: 'margin-understanding',
    title: 'Building vs. Exploring',
    category: 'Working Principle',
    date: 'Margin Entry · 02',
    body: 'I build to understand. I explore to find what understanding misses. Construction tests whether an idea holds together; exploration reveals the assumptions that construction took for granted.',
  },
];

export const EXTERNAL_PROFILES: ExternalProfile[] = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    handle: 'harshit-shukla-3386973a5',
    domain: 'linkedin.com',
    url: 'https://www.linkedin.com/in/harshit-shukla-3386973a5/',
    ariaLabel: 'Visit MIKEY (Harshit Shukla) on LinkedIn',
  },
  {
    id: 'github',
    label: 'GitHub',
    handle: 'MIKEY-CODE-HUB',
    domain: 'github.com',
    url: 'https://github.com/MIKEY-CODE-HUB',
    ariaLabel: 'Visit MIKEY-CODE-HUB on GitHub',
  },
  {
    id: 'codeforces',
    label: 'Codeforces',
    handle: 'MIKEY1903',
    domain: 'codeforces.com',
    url: 'https://codeforces.com/profile/MIKEY1903',
    ariaLabel: 'Visit MIKEY1903 profile on Codeforces',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    handle: '@the__harshit_shukla',
    domain: 'instagram.com',
    url: 'https://www.instagram.com/the__harshit_shukla/?__pwa=1',
    ariaLabel: 'Visit @the__harshit_shukla on Instagram',
  },
  {
    id: 'spotify',
    label: 'Spotify',
    handle: 'MIKEY Audio Profile',
    domain: 'open.spotify.com',
    url: 'https://open.spotify.com/user/iw0dm14kexc8oatemiwymcqa9',
    ariaLabel: 'Listen to MIKEY on Spotify',
  },
];

export function filterInterestsByCluster(
  clusters: InterestCluster[],
  selectedClusterId: string
): InterestCluster[] {
  if (!selectedClusterId || selectedClusterId === 'all') {
    return clusters;
  }
  return clusters.filter((c) => c.id === selectedClusterId);
}
