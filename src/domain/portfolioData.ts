export type RouteId =
  | 'home'
  | 'about'
  | 'spaces'
  | 'work'
  | 'work-zenith'
  | 'work-deadzone'
  | 'notes';

export interface RouteSpec {
  id: RouteId;
  path: string;
  label: string;
  scrollAnchor: number; // Normalized 0.0 -> 1.0 scroll progress
  chapterNumber: string;
  chapterTitle: string;
  subtitle: string;
  dominantAccent: 'cobalt' | 'amber' | 'dual';
}

export interface CameraKeyframe {
  position: [number, number, number];
  lookAt: [number, number, number];
  fov: number;
  signatureScale: number;
  signatureRotation: [number, number, number];
  signaturePosition: [number, number, number];
  foldDepth: number; // 0 = nested threshold alignment, 1 = unfolded spatial planes & bridges
  wireframeMix: number; // 0 = solid architectural mass, 1 = structural edge wireframe
  gridElevation: number; // 0 = calm foundation, 1 = elevated architectural corridors
  cobaltIntensity: number; // 0.0 -> 1.0 Electric Cobalt (#526BFF)
  amberIntensity: number; // 0.0 -> 1.0 Warm Amber (#F0A65A)
}

export interface ProjectCaseStudy {
  narrativeArc: string;
  problemAndPurpose: string;
  keySystemDecisions: string[];
  whatWasBuilt: string[];
  whyItMatters: string;
}

export interface ProjectRecord {
  id: 'zenith' | 'deadzone-bastion';
  routeId: 'work-zenith' | 'work-deadzone';
  path: string;
  index: string;
  title: string;
  category: string;
  liveUrl: string;
  domain: string;
  summary: string;
  architectureNotes: string[];
  spatialCoordinate: string;
  accentColor: 'cobalt' | 'amber';
  caseStudy: ProjectCaseStudy;
}

export interface InterestCluster {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  areas: string[];
  reflection: string;
  coordinate: string;
}

export interface ExternalProfile {
  id: string;
  label: string;
  handle: string;
  domain: string;
  url: string;
  ariaLabel: string;
}

export type SpatialTargetId = 'wordmark' | 'the-fold' | 'zenith' | 'deadzone-bastion';

export interface SpatialInspectionTarget {
  id: SpatialTargetId;
  label: string;
  coordinate: string;
  title: string;
  summary: string;
  detail: string;
  accent: 'cobalt' | 'amber';
  actionLabel?: string;
  actionPathOrUrl?: string;
}

export type ArchitecturalStatusCode =
  | 'ENVIRONMENT SHIFTING'
  | 'STRUCTURE DISCOVERED'
  | 'VIEWPOINT UPDATED'
  | 'ANOTHER LAYER'
  | 'EXPLORATION AVAILABLE';

export interface ArchitecturalStatusEvent {
  id: string;
  code: ArchitecturalStatusCode;
  detail: string;
  accent: 'cobalt' | 'amber';
}

export const SPATIAL_INSPECTION_TARGETS: Record<
  SpatialTargetId,
  SpatialInspectionTarget
> = {
  wordmark: {
    id: 'wordmark',
    label: '3D Monumental Wordmark · MIKEY',
    coordinate: 'AXIS 00 · Y: +3.35 · Z: -1.60',
    title: 'MIKEY — Identity Framed by The Fold',
    summary:
      'Constructed in three-dimensional bone-white stone and brushed steel with deliberate depth reliefs across each letterform, framed by the outer sanctuary arch.',
    detail:
      'The M recesses into an inverted vault; the I floats above a displaced shadow plinth; the K pierces a vertical datum; the E staggers its horizontal cantilevers across three Z-planes that align from the arrival threshold; the Y extends hairline vectors into the upper horizon.',
    accent: 'cobalt',
    actionLabel: 'Read Portrait (Chapter 02)',
    actionPathOrUrl: '/about',
  },
  'the-fold': {
    id: 'the-fold',
    label: 'Signature Formation · THE FOLD',
    coordinate: 'FOLD 01 · NESTED FRAMES · Z: -3.10',
    title: 'The Fold — Space Bent Back Into Itself',
    summary:
      'An impossible architectural formation of nested monumental frames, hinged concrete planes, and a suspended bridge connecting foreground and distant chambers.',
    detail:
      'From the threshold, The Fold aligns into a coherent sanctuary portal. As the camera shifts or the structure unfolds, cantilevered planes hinge outward along an electric cobalt seam, exposing a narrow warm-amber aperture and a bridge spanning two contradictory depth layers.',
    accent: 'amber',
    actionLabel: 'Enter Quiet Spaces (Chapter 03)',
    actionPathOrUrl: '/spaces',
  },
  zenith: {
    id: 'zenith',
    label: '3D Artifact 01 · ZENITH',
    coordinate: 'SECTOR 04.A · X: -4.20 · Z: -2.40',
    title: 'Zenith — Focus & Productivity Architecture',
    summary:
      'Cantilevered three-tier focus tower in bone-white stone and electric cobalt edge illumination.',
    detail:
      'Each ascending tier represents a layer of cognitive clarity: eliminating interface friction so intention and execution occupy a single uninterrupted workspace.',
    accent: 'cobalt',
    actionLabel: 'Open Zenith Case Study',
    actionPathOrUrl: '/work/zenith',
  },
  'deadzone-bastion': {
    id: 'deadzone-bastion',
    label: '3D Artifact 02 · DEADZONE BASTION',
    coordinate: 'SECTOR 04.B · X: +4.20 · Z: -2.40',
    title: 'Deadzone Bastion — Tactical Defense Geometry',
    summary:
      'Interlocking hexagonal bastion perimeter with warm amber tactical scanning vectors.',
    detail:
      'Engineered to make spatial pressure, perimeter sightlines, and resource trade-offs immediately legible under real-time constraints.',
    accent: 'amber',
    actionLabel: 'Open Deadzone Case Study',
    actionPathOrUrl: '/work/deadzone-bastion',
  },
};

export const ROUTES: RouteSpec[] = [
  {
    id: 'home',
    path: '/',
    label: 'Threshold',
    scrollAnchor: 0.0,
    chapterNumber: '01',
    chapterTitle: 'The Threshold',
    subtitle: 'Every world begins with an assumption.',
    dominantAccent: 'cobalt',
  },
  {
    id: 'about',
    path: '/about',
    label: 'About',
    scrollAnchor: 0.24,
    chapterNumber: '02',
    chapterTitle: 'The Unfinished Self',
    subtitle: 'I am not a finished answer.',
    dominantAccent: 'amber',
  },
  {
    id: 'spaces',
    path: '/spaces',
    label: 'Quiet Spaces',
    scrollAnchor: 0.48,
    chapterNumber: '03',
    chapterTitle: 'The Quieter Spaces Between Structures',
    subtitle: 'Some thoughts do not ask to be solved. They ask to be noticed.',
    dominantAccent: 'amber',
  },
  {
    id: 'work',
    path: '/work',
    label: 'Work',
    scrollAnchor: 0.74,
    chapterNumber: '04',
    chapterTitle: 'Things Made Real',
    subtitle: 'An idea changes the moment you try to build it.',
    dominantAccent: 'cobalt',
  },
  {
    id: 'work-zenith',
    path: '/work/zenith',
    label: 'Zenith',
    scrollAnchor: 0.77,
    chapterNumber: '04.1',
    chapterTitle: 'Zenith — Case Study',
    subtitle:
      'Focus & Productivity Web Application — Engineered for Clarity Under Pressure',
    dominantAccent: 'cobalt',
  },
  {
    id: 'work-deadzone',
    path: '/work/deadzone-bastion',
    label: 'Deadzone Bastion',
    scrollAnchor: 0.81,
    chapterNumber: '04.2',
    chapterTitle: 'Deadzone Bastion — Case Study',
    subtitle:
      'Interactive Tactical & Survival Web Experience — Spatial Decision Systems',
    dominantAccent: 'amber',
  },
  {
    id: 'notes',
    path: '/notes',
    label: 'Explorations',
    scrollAnchor: 1.0,
    chapterNumber: '05',
    chapterTitle: 'Explorations & Continue the Conversation',
    subtitle:
      'Directions of study, curiosity, and verified coordinates beyond this world.',
    dominantAccent: 'dual',
  },
];

export const SCENE_KEYFRAMES: Record<RouteId, CameraKeyframe> = {
  home: {
    position: [0, 2.15, 12.2],
    lookAt: [0, 2.2, -1.8],
    fov: 40,
    signatureScale: 0.94,
    signatureRotation: [0.08, -0.32, 0.02],
    signaturePosition: [0, 1.25, -3.2],
    foldDepth: 0.14,
    wireframeMix: 0.18,
    gridElevation: 0.0,
    cobaltIntensity: 0.68,
    amberIntensity: 0.24,
  },
  about: {
    position: [-4.2, 2.45, 9.6],
    lookAt: [0.4, 1.65, -1.8],
    fov: 40,
    signatureScale: 1.08,
    signatureRotation: [0.28, 0.64, -0.1],
    signaturePosition: [2.1, 1.35, -2.0],
    foldDepth: 0.62,
    wireframeMix: 0.28,
    gridElevation: 0.28,
    cobaltIntensity: 0.35,
    amberIntensity: 0.85,
  },
  spaces: {
    position: [0.0, 2.55, 10.4],
    lookAt: [0.0, 1.55, -2.2],
    fov: 38,
    signatureScale: 0.98,
    signatureRotation: [0.06, 1.12, 0.02],
    signaturePosition: [1.8, 1.5, -2.5],
    foldDepth: 0.48,
    wireframeMix: 0.38,
    gridElevation: 0.52,
    cobaltIntensity: 0.55,
    amberIntensity: 0.88,
  },
  work: {
    position: [0.0, 3.1, 10.8],
    lookAt: [0, 1.2, -2.6],
    fov: 44,
    signatureScale: 0.88,
    signatureRotation: [0.18, 1.57, 0.0],
    signaturePosition: [0, 2.25, -4.4],
    foldDepth: 0.38,
    wireframeMix: 0.72,
    gridElevation: 0.74,
    cobaltIntensity: 0.92,
    amberIntensity: 0.45,
  },
  'work-zenith': {
    position: [-3.6, 2.15, 6.8],
    lookAt: [-3.2, 1.25, -2.4],
    fov: 38,
    signatureScale: 0.78,
    signatureRotation: [0.1, 1.1, 0.05],
    signaturePosition: [1.4, 2.35, -4.6],
    foldDepth: 0.18,
    wireframeMix: 0.48,
    gridElevation: 0.76,
    cobaltIntensity: 0.95,
    amberIntensity: 0.3,
  },
  'work-deadzone': {
    position: [3.6, 2.25, 6.8],
    lookAt: [3.2, 1.25, -2.4],
    fov: 38,
    signatureScale: 0.78,
    signatureRotation: [0.28, 2.05, -0.1],
    signaturePosition: [-1.4, 2.35, -4.6],
    foldDepth: 0.54,
    wireframeMix: 0.82,
    gridElevation: 0.82,
    cobaltIntensity: 0.38,
    amberIntensity: 0.95,
  },
  notes: {
    position: [2.8, 3.15, 9.6],
    lookAt: [0.0, 1.65, -2.4],
    fov: 41,
    signatureScale: 0.94,
    signatureRotation: [0.34, 2.15, 0.14],
    signaturePosition: [-1.8, 1.65, -2.6],
    foldDepth: 0.78,
    wireframeMix: 0.46,
    gridElevation: 0.92,
    cobaltIntensity: 0.74,
    amberIntensity: 0.74,
  },
};

export function resolveRouteFromPath(pathname: string): RouteSpec {
  const clean = pathname.replace(/\/+$/, '').toLowerCase() || '/';
  // Gracefully map legacy /contact or /afterword paths to Chapter 05 where "Continue the Conversation" lives
  if (clean === '/contact' || clean === '/afterword') {
    return ROUTES.find((r) => r.id === 'notes')!;
  }
  const match = ROUTES.find((r) => r.path.toLowerCase() === clean);
  return match || ROUTES[0];
}

export function resolveRouteFromScroll(progress: number): RouteSpec {
  const clamped = Math.max(0, Math.min(1, progress));
  const primaryRoutes = ROUTES.filter(
    (r) => r.id !== 'work-zenith' && r.id !== 'work-deadzone'
  );
  let closest = primaryRoutes[0];
  let minDistance = Math.abs(clamped - closest.scrollAnchor);

  for (const route of primaryRoutes) {
    const dist = Math.abs(clamped - route.scrollAnchor);
    if (dist < minDistance) {
      minDistance = dist;
      closest = route;
    }
  }
  return closest;
}

export function interpolateKeyframes(
  a: CameraKeyframe,
  b: CameraKeyframe,
  t: number
): CameraKeyframe {
  const clamped = Math.max(0, Math.min(1, t));
  const lerp = (x: number, y: number) => x + (y - x) * clamped;
  return {
    position: [
      lerp(a.position[0], b.position[0]),
      lerp(a.position[1], b.position[1]),
      lerp(a.position[2], b.position[2]),
    ],
    lookAt: [
      lerp(a.lookAt[0], b.lookAt[0]),
      lerp(a.lookAt[1], b.lookAt[1]),
      lerp(a.lookAt[2], b.lookAt[2]),
    ],
    fov: lerp(a.fov, b.fov),
    signatureScale: lerp(a.signatureScale, b.signatureScale),
    signatureRotation: [
      lerp(a.signatureRotation[0], b.signatureRotation[0]),
      lerp(a.signatureRotation[1], b.signatureRotation[1]),
      lerp(a.signatureRotation[2], b.signatureRotation[2]),
    ],
    signaturePosition: [
      lerp(a.signaturePosition[0], b.signaturePosition[0]),
      lerp(a.signaturePosition[1], b.signaturePosition[1]),
      lerp(a.signaturePosition[2], b.signaturePosition[2]),
    ],
    foldDepth: lerp(a.foldDepth, b.foldDepth),
    wireframeMix: lerp(a.wireframeMix, b.wireframeMix),
    gridElevation: lerp(a.gridElevation, b.gridElevation),
    cobaltIntensity: lerp(a.cobaltIntensity, b.cobaltIntensity),
    amberIntensity: lerp(a.amberIntensity, b.amberIntensity),
  };
}

export const PROJECTS: ProjectRecord[] = [
  {
    id: 'zenith',
    routeId: 'work-zenith',
    path: '/work/zenith',
    index: '01',
    title: 'Zenith',
    category: 'Focus & Productivity Web Application',
    liveUrl: 'https://zenith-dusky-theta.vercel.app/',
    domain: 'zenith-dusky-theta.vercel.app',
    summary:
      'An intentional workspace designed around cognitive clarity, task structuring, and distraction-free execution. Built to examine how software interfaces shape sustained human attention.',
    architectureNotes: [
      'Structured around low-friction state transitions so planning and active focus happen in a single unified flow.',
      'Designed with high-contrast visual hierarchy to reduce cognitive overhead during deep-work sessions.',
      'Deployed as a fast, responsive web application on Vercel.',
    ],
    spatialCoordinate: 'SECTOR 04.A · ELEVATION +2.15 · COBALT AXIS',
    accentColor: 'cobalt',
    caseStudy: {
      narrativeArc:
        'Most productivity tools multiply the number of surfaces demanding attention. Zenith began with the opposite premise: what happens to focus when an interface removes everything that is not the immediate commitment?',
      problemAndPurpose:
        'Examining how digital workspaces fragment human concentration—and engineering a calm, responsive environment where task sequencing and deep execution coexist without visual clutter.',
      keySystemDecisions: [
        'Single-plane state transitions between planning and active execution so context is never lost across modal layers.',
        'Restrained typographic hierarchy and high-contrast visual cues that remain legible during extended work sessions.',
        'Zero-latency client-side state responsiveness to keep keyboard and pointer interactions immediate.',
      ],
      whatWasBuilt: [
        'A live web application deployed on Vercel focused on intentional task prioritization and distraction-free execution.',
        'Streamlined session and task controls designed to minimize interface ceremony.',
      ],
      whyItMatters:
        'Zenith is an inquiry into attention: proving that software can respect human thought by doing less, more clearly.',
    },
  },
  {
    id: 'deadzone-bastion',
    routeId: 'work-deadzone',
    path: '/work/deadzone-bastion',
    index: '02',
    title: 'Deadzone Bastion',
    category: 'Interactive Tactical & Survival Web Experience',
    liveUrl: 'https://deadzone-bastion.vercel.app/',
    domain: 'deadzone-bastion.vercel.app',
    summary:
      'A systems-driven interactive web experience exploring defensive strategy, resource tension, and spatial decision-making under dynamic pressure.',
    architectureNotes: [
      'Models real-time state updates, perimeter defense logic, and tactical trade-offs in the browser.',
      'Balances immediate visual feedback with underlying deterministic game-loop mechanics.',
      'Built and deployed on Vercel for instant browser accessibility.',
    ],
    spatialCoordinate: 'SECTOR 04.B · ELEVATION +2.25 · AMBER AXIS',
    accentColor: 'amber',
    caseStudy: {
      narrativeArc:
        'Where Zenith studies calm and stillness, Deadzone Bastion studies pressure: how a player reads space, scarcity, and escalating risk when every decision carries an immediate structural cost.',
      problemAndPurpose:
        'Designing a browser-based tactical experience where defensive positioning, resource allocation, and spatial awareness remain legible even as pressure compounds.',
      keySystemDecisions: [
        'Deterministic update loop separating simulation state from visual feedback so tactical trade-offs feel fair and readable.',
        'Clear spatial perimeter geometry that communicates threat vectors and defensive coverage at a glance.',
        'Immediate browser deployment with zero installation barrier.',
      ],
      whatWasBuilt: [
        'An interactive tactical survival web application live on Vercel.',
        'Real-time perimeter defense, resource tension mechanics, and responsive tactical controls.',
      ],
      whyItMatters:
        'Deadzone Bastion turns abstract algorithmic rules and state machines into a tangible spatial experience under pressure.',
    },
  },
];

export const INTEREST_CLUSTERS: InterestCluster[] = [
  {
    id: 'computation',
    index: '01',
    title: 'Computer Science & Systems',
    subtitle: 'Foundational Architecture',
    areas: [
      'Computer Science Fundamentals',
      'Software Engineering & System Design',
      'Algorithms & Data Structures',
      'AI / Machine Learning Exploration',
    ],
    reflection:
      'Approaching code not merely as syntax, but as a way of modeling how information moves, scales, and holds together under constraint.',
    coordinate: 'AXIS N.01',
  },
  {
    id: 'quantitative',
    index: '02',
    title: 'Quantitative & Analytical',
    subtitle: 'Patterns & Uncertainty',
    areas: [
      'Quantitative Thinking & Probability',
      'Economics & Market Behavior',
      'Strategic Decision-Making Under Uncertainty',
    ],
    reflection:
      'Studying how incentives, probability, and incomplete information shape decisions in complex systems.',
    coordinate: 'AXIS E.02',
  },
  {
    id: 'humanities',
    index: '03',
    title: 'Humanities & Mind',
    subtitle: 'Perception & Meaning',
    areas: [
      'Philosophy & Epistemology',
      'Psychology & Human Behavior',
      'Literature & Narrative Structure',
    ],
    reflection:
      'Examining human contradiction, perception, language, and ethical questions that resist purely mechanical answers.',
    coordinate: 'AXIS S.03',
  },
  {
    id: 'play-motion',
    index: '04',
    title: 'Strategy, Motion & Visual Worlds',
    subtitle: 'Tempo, Discipline & Form',
    areas: [
      'Chess — Positional Calculation & Tempo',
      'Basketball — Spatial Awareness & Flow',
      'Movies & Anime — Visual Storytelling & Worldbuilding',
    ],
    reflection:
      'Finding balance between combinatorial board strategy, team athletics, and long-form storytelling.',
    coordinate: 'AXIS W.04',
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
    ariaLabel: 'Visit MIKEY (MIKEY-CODE-HUB) on GitHub',
  },
  {
    id: 'codeforces',
    label: 'Codeforces',
    handle: 'MIKEY1903',
    domain: 'codeforces.com',
    url: 'https://codeforces.com/profile/MIKEY1903',
    ariaLabel: 'Visit MIKEY (MIKEY1903) on Codeforces',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    handle: '@the__harshit_shukla',
    domain: 'instagram.com',
    url: 'https://www.instagram.com/the__harshit_shukla/',
    ariaLabel: 'Visit MIKEY (@the__harshit_shukla) on Instagram',
  },
  {
    id: 'spotify',
    label: 'Spotify',
    handle: 'MIKEY · Soundscapes',
    domain: 'open.spotify.com',
    url: 'https://open.spotify.com/user/iw0dm14kexc8oatemiwymcqa9',
    ariaLabel: 'Visit MIKEY on Spotify',
  },
];

export const ABOUT_PARAGRAPHS: string[] = [
  'MIKEY is the public identity of a computer science student, builder, and perpetual learner who treats software and ideas as two sides of the same inquiry. Rather than viewing engineering as separate from philosophy or art, I am drawn to the places where logical systems meet human complexity.',
  'My current focus lies in understanding how things work from first principles—computer science, software engineering, algorithms, and AI/ML—while exploring quantitative thinking, economics, philosophy, psychology, and literature. Away from the terminal, I spend time studying chess positions, playing basketball, and immersing myself in films and anime that build unforgettable worlds.',
  'This space is not a static resume of finished certainties. It is an evolving architectural record of what I am building, questioning, and learning next.',
];
