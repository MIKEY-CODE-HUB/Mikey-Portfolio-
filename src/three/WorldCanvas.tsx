import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  CameraKeyframe,
  interpolateKeyframes,
  RouteId,
  ROUTES,
  SCENE_KEYFRAMES,
  SpatialTargetId,
} from '../domain/portfolioData';
import { AccentTone } from '../domain/thoughtsData';
import { createProceduralTextures } from './proceduralTextures';
import {
  createSignatureImpossibleObject,
  SurfaceFinishMode,
} from './signatureObject';
import { createCustomWordmark } from './customWordmark';
import { createProjectArtifacts } from './projectArtifacts';
import { RotateCcw } from 'lucide-react';

export interface WorldCanvasProps {
  activeRouteId: RouteId;
  scrollProgress: number; // 0..1 continuous scroll progress
  foldOverride: number | null;
  finishMode?: SurfaceFinishMode;
  reducedMotion: boolean;
  hoveredProjectId: 'zenith' | 'deadzone-bastion' | null;
  activeThoughtAccent?: AccentTone | null;
  stayingWithThought?: boolean;
  thoughtCameraOffset?: [number, number, number];
  inspectedTargetId?: SpatialTargetId | null;
  onInspectTarget: (targetId: SpatialTargetId) => void;
  onNavigateRoute: (path: string) => void;
  onManualExploreChange?: (isExploring: boolean) => void;
  onResetViewpoint?: () => void;
}

const _targetCamPos = new THREE.Vector3();
const _currentCamPos = new THREE.Vector3(0, 2.15, 12.2);
const _targetLookAt = new THREE.Vector3();
const _currentLookAt = new THREE.Vector3(0, 2.2, -1.8);
const _sphericalOffset = new THREE.Vector3();
const _spherical = new THREE.Spherical();
const _dummyObj = new THREE.Object3D();
const _instanceColor = new THREE.Color();

function dampValue(
  current: number,
  target: number,
  lambda: number,
  dt: number
): number {
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt));
}

function getContinuousScrollKeyframe(scrollProgress: number): CameraKeyframe {
  const primaryRoutes = ROUTES.filter(
    (r) => r.id !== 'work-zenith' && r.id !== 'work-deadzone'
  );
  const clamped = Math.max(0, Math.min(1, scrollProgress));

  for (let i = 0; i < primaryRoutes.length - 1; i++) {
    const curr = primaryRoutes[i];
    const next = primaryRoutes[i + 1];
    if (clamped >= curr.scrollAnchor && clamped <= next.scrollAnchor) {
      const span = Math.max(0.0001, next.scrollAnchor - curr.scrollAnchor);
      const localT = (clamped - curr.scrollAnchor) / span;
      return interpolateKeyframes(
        SCENE_KEYFRAMES[curr.id],
        SCENE_KEYFRAMES[next.id],
        localT
      );
    }
  }
  return SCENE_KEYFRAMES[primaryRoutes[primaryRoutes.length - 1].id];
}

export const WorldCanvas: React.FC<WorldCanvasProps> = ({
  activeRouteId,
  scrollProgress,
  foldOverride,
  finishMode = 'obsidian',
  reducedMotion,
  hoveredProjectId,
  activeThoughtAccent = null,
  stayingWithThought = false,
  thoughtCameraOffset = [0, 0, 0],
  inspectedTargetId = null,
  onInspectTarget,
  onNavigateRoute,
  onManualExploreChange,
  onResetViewpoint,
}) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [webglAvailable, setWebglAvailable] = useState(true);
  const [hoveredSpatialLabel, setHoveredSpatialLabel] = useState<string | null>(
    null
  );
  const [isManualExploring, setIsManualExploring] = useState(false);
  const [showExploreHint, setShowExploreHint] = useState(true);

  const resetCameraRef = useRef<(() => void) | null>(null);

  const stateRef = useRef({
    activeRouteId,
    scrollProgress,
    foldOverride,
    finishMode,
    reducedMotion,
    hoveredProjectId,
    activeThoughtAccent,
    stayingWithThought,
    thoughtCameraOffset,
    inspectedTargetId,
    onInspectTarget,
    onNavigateRoute,
    onManualExploreChange,
  });

  useEffect(() => {
    stateRef.current = {
      activeRouteId,
      scrollProgress,
      foldOverride,
      finishMode,
      reducedMotion,
      hoveredProjectId,
      activeThoughtAccent,
      stayingWithThought,
      thoughtCameraOffset,
      inspectedTargetId,
      onInspectTarget,
      onNavigateRoute,
      onManualExploreChange,
    };
  }, [
    activeRouteId,
    scrollProgress,
    foldOverride,
    finishMode,
    reducedMotion,
    hoveredProjectId,
    activeThoughtAccent,
    stayingWithThought,
    thoughtCameraOffset,
    inspectedTargetId,
    onInspectTarget,
    onNavigateRoute,
    onManualExploreChange,
  ]);

  // Gently fade out the initial "Drag to explore" hint after the visitor has browsed for 10s
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowExploreHint(false);
    }, 10000);
    return () => window.clearTimeout(timer);
  }, []);

  const handleResetViewClick = useCallback(() => {
    if (resetCameraRef.current) {
      resetCameraRef.current();
    }
    if (onResetViewpoint) {
      onResetViewpoint();
    }
  }, [onResetViewpoint]);

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    const isHeadless =
      navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isHeadless,
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch {
      setWebglAvailable(false);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.24;
    renderer.setPixelRatio(
      isHeadless ? 1 : Math.min(window.devicePixelRatio || 1, 2)
    );
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = !isHeadless;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Allow vertical page scroll on touch while enabling horizontal orbit & pinch-zoom
    renderer.domElement.style.touchAction = 'pan-y pinch-zoom';
    renderer.domElement.style.cursor = 'grab';

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
    };
    renderer.domElement.addEventListener(
      'webglcontextlost',
      handleContextLost,
      false
    );

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111210);
    scene.fog = new THREE.FogExp2(0x111210, 0.025);

    const camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / Math.max(1, window.innerHeight),
      0.1,
      120
    );
    camera.position.copy(_currentCamPos);
    camera.lookAt(_currentLookAt);

    let envTexture: THREE.Texture | null = null;
    if (!isHeadless) {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      const envScene = new THREE.Scene();
      envScene.background = new THREE.Color(0x181917);

      const stripGeo = new THREE.PlaneGeometry(18, 4);
      const stripMat1 = new THREE.MeshBasicMaterial({ color: 0xf8f7f2 });
      const strip1 = new THREE.Mesh(stripGeo, stripMat1);
      strip1.position.set(0, 9, -9);
      strip1.lookAt(0, 0, 0);
      envScene.add(strip1);

      const stripMat2 = new THREE.MeshBasicMaterial({ color: 0x526bff });
      const strip2 = new THREE.Mesh(
        new THREE.PlaneGeometry(12, 3),
        stripMat2
      );
      strip2.position.set(-9, 3, 6);
      strip2.lookAt(0, 0, 0);
      envScene.add(strip2);

      const stripMat3 = new THREE.MeshBasicMaterial({ color: 0xf0a65a });
      const strip3 = new THREE.Mesh(
        new THREE.PlaneGeometry(12, 3),
        stripMat3
      );
      strip3.position.set(9, 2, -6);
      strip3.lookAt(0, 0, 0);
      envScene.add(strip3);

      envTexture = pmremGenerator.fromScene(envScene, 0.04).texture;
      scene.environment = envTexture;

      strip1.geometry.dispose();
      stripMat1.dispose();
      strip2.geometry.dispose();
      stripMat2.dispose();
      strip3.geometry.dispose();
      stripMat3.dispose();
      pmremGenerator.dispose();
    }

    // High-contrast architectural lighting rig
    const ambientLight = new THREE.AmbientLight(0xd8d4c8, 0.72);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xf8f7f2, 2.95);
    keyLight.position.set(7.5, 13.0, 9.0);
    keyLight.castShadow = !isHeadless;
    if (!isHeadless) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 36;
      const d = 11;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.bias = -0.0005;
    }
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0xe9e5da, 0x262724, 1.05);
    scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight(0xf8f7f2, 1.9);
    rimLight.position.set(-9.0, 7.5, -10.0);
    scene.add(rimLight);

    const uplight = new THREE.DirectionalLight(0xdcd8cc, 0.85);
    uplight.position.set(0.0, -8.0, 4.0);
    scene.add(uplight);

    const cobaltAccentLight = new THREE.PointLight(0x526bff, 1.65, 22);
    cobaltAccentLight.position.set(-5.0, 3.2, 2.5);
    scene.add(cobaltAccentLight);

    const amberAccentLight = new THREE.PointLight(0xf0a65a, 1.45, 22);
    amberAccentLight.position.set(5.0, 2.2, -2.5);
    scene.add(amberAccentLight);

    const textures = createProceduralTextures(renderer);

    // 1. Custom 3D Architectural Wordmark ("MIKEY") — Hero Focal Point
    const wordmark = createCustomWordmark();
    scene.add(wordmark.group);

    // 2. Signature Impossible Architectural Formation — THE FOLD
    const signatureObj = createSignatureImpossibleObject(
      textures.bumpTexture,
      textures.contactShadowTexture
    );
    scene.add(signatureObj.group);

    // 3. Dedicated 3D Project Monuments (01: Zenith, 02: Deadzone Bastion)
    const projectArtifacts = createProjectArtifacts(
      textures.bumpTexture,
      textures.contactShadowTexture
    );
    scene.add(projectArtifacts.group);

    // 4. Ground Architectural Datum Plane
    const floorGeo = new THREE.PlaneGeometry(75, 75);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x161715,
      map: textures.gridTexture,
      roughness: 0.72,
      metalness: 0.18,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -1.65;
    floorMesh.receiveShadow = !isHeadless;
    scene.add(floorMesh);

    // 5. COHERENT ARCHITECTURAL WORLD OF "THE FOLD"
    const worldArchGeometries: THREE.BufferGeometry[] = [];
    const worldArchMaterials: THREE.Material[] = [];

    const megaBoneMat = new THREE.MeshStandardMaterial({
      color: 0xdcd8cc,
      emissive: 0x201f1c,
      emissiveIntensity: 0.2,
      roughness: 0.38,
      metalness: 0.14,
      bumpMap: textures.bumpTexture,
      bumpScale: 0.01,
    });
    const megaCharcoalMat = new THREE.MeshStandardMaterial({
      color: 0x262825,
      emissive: 0x141513,
      emissiveIntensity: 0.28,
      roughness: 0.54,
      metalness: 0.24,
      bumpMap: textures.bumpTexture,
      bumpScale: 0.015,
    });
    const megaObsidianMat = new THREE.MeshPhysicalMaterial({
      color: 0x181917,
      roughness: 0.18,
      metalness: 0.68,
      clearcoat: 0.5,
    });
    const megaCobaltSeamMat = new THREE.MeshStandardMaterial({
      color: 0x526bff,
      emissive: 0x526bff,
      emissiveIntensity: 0.65,
      roughness: 0.2,
      metalness: 0.4,
    });
    const megaAmberSlitMat = new THREE.MeshStandardMaterial({
      color: 0xf0a65a,
      emissive: 0xf0a65a,
      emissiveIntensity: 0.65,
      roughness: 0.25,
      metalness: 0.3,
    });
    const megaEdgeBone = new THREE.LineBasicMaterial({
      color: 0xe9e5da,
      transparent: true,
      opacity: 0.72,
    });
    const megaEdgeSubtle = new THREE.LineBasicMaterial({
      color: 0x6e706a,
      transparent: true,
      opacity: 0.55,
    });
    const megaEdgeCobalt = new THREE.LineBasicMaterial({
      color: 0x526bff,
      transparent: true,
      opacity: 0.82,
    });

    worldArchMaterials.push(
      megaBoneMat,
      megaCharcoalMat,
      megaObsidianMat,
      megaCobaltSeamMat,
      megaAmberSlitMat,
      megaEdgeBone,
      megaEdgeSubtle,
      megaEdgeCobalt
    );

    function addArchBlock(
      parent: THREE.Object3D,
      size: [number, number, number],
      pos: [number, number, number],
      rot: [number, number, number],
      mat: THREE.Material,
      edgeMat: THREE.LineBasicMaterial
    ): THREE.Mesh {
      const geo = new THREE.BoxGeometry(size[0], size[1], size[2]);
      worldArchGeometries.push(geo);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(pos[0], pos[1], pos[2]);
      mesh.rotation.set(rot[0], rot[1], rot[2]);
      mesh.castShadow = !isHeadless;
      mesh.receiveShadow = !isHeadless;

      const edges = new THREE.EdgesGeometry(geo, 15);
      worldArchGeometries.push(edges);
      mesh.add(new THREE.LineSegments(edges, edgeMat));
      parent.add(mesh);
      return mesh;
    }

    const sanctuaryWorldGroup = new THREE.Group();
    sanctuaryWorldGroup.name = 'TheFoldSanctuaryWorld';
    scene.add(sanctuaryWorldGroup);

    // A. FOREGROUND PROSCENIUM PORTAL FRAME
    const foregroundPortalGroup = new THREE.Group();
    addArchBlock(
      foregroundPortalGroup,
      [0.95, 7.2, 1.2],
      [-7.2, 1.95, -0.4],
      [0, 0.14, 0],
      megaCharcoalMat,
      megaEdgeBone
    );
    addArchBlock(
      foregroundPortalGroup,
      [0.95, 7.2, 1.2],
      [7.2, 1.95, -0.4],
      [0, -0.14, 0],
      megaCharcoalMat,
      megaEdgeBone
    );
    addArchBlock(
      foregroundPortalGroup,
      [15.4, 0.34, 0.9],
      [0, 7.45, -0.4],
      [0, 0, 0],
      megaCharcoalMat,
      megaEdgeBone
    );
    addArchBlock(
      foregroundPortalGroup,
      [14.2, 0.04, 0.08],
      [0, 7.26, 0.04],
      [0, 0, 0],
      megaCobaltSeamMat,
      megaEdgeCobalt
    );
    sanctuaryWorldGroup.add(foregroundPortalGroup);

    // B. MIDGROUND FOLDED MEGASTRUCTURE FRAMES & CANTILEVERED WINGS
    const midgroundFoldGroup = new THREE.Group();
    addArchBlock(
      midgroundFoldGroup,
      [0.55, 5.8, 3.4],
      [-5.6, 1.25, -4.2],
      [0, 0.36, -0.04],
      megaBoneMat,
      megaEdgeBone
    );
    addArchBlock(
      midgroundFoldGroup,
      [0.55, 5.8, 3.4],
      [5.6, 1.25, -4.2],
      [0, -0.36, 0.04],
      megaBoneMat,
      megaEdgeBone
    );
    addArchBlock(
      midgroundFoldGroup,
      [4.2, 0.24, 1.2],
      [-4.6, 0.65, -2.6],
      [0, 0.12, 0],
      megaCharcoalMat,
      megaEdgeBone
    );
    addArchBlock(
      midgroundFoldGroup,
      [4.2, 0.24, 1.2],
      [4.6, 1.15, -2.6],
      [0, -0.12, 0],
      megaCharcoalMat,
      megaEdgeBone
    );
    sanctuaryWorldGroup.add(midgroundFoldGroup);

    // C. IMPOSSIBLE SUSPENDED BRIDGES & ELEVATED PASSAGES
    const bridgesGroup = new THREE.Group();
    addArchBlock(
      bridgesGroup,
      [11.8, 0.22, 0.75],
      [0, -0.65, -4.8],
      [0, -0.08, 0],
      megaCharcoalMat,
      megaEdgeBone
    );
    addArchBlock(
      bridgesGroup,
      [0.45, 2.8, 6.2],
      [-3.8, 0.15, -5.8],
      [0, 0.24, 0],
      megaObsidianMat,
      megaEdgeSubtle
    );
    addArchBlock(
      bridgesGroup,
      [0.45, 2.8, 6.2],
      [3.8, 0.15, -5.8],
      [0, -0.24, 0],
      megaObsidianMat,
      megaEdgeSubtle
    );
    sanctuaryWorldGroup.add(bridgesGroup);

    // D. DEEP HORIZON FOLDED SANCTUARY APERTURE
    const deepPassageGroup = new THREE.Group();
    addArchBlock(
      deepPassageGroup,
      [0.55, 4.2, 0.9],
      [-3.2, 0.45, -8.6],
      [0, 0.08, 0],
      megaBoneMat,
      megaEdgeBone
    );
    addArchBlock(
      deepPassageGroup,
      [0.55, 4.2, 0.9],
      [3.2, 0.45, -8.6],
      [0, -0.08, 0],
      megaBoneMat,
      megaEdgeBone
    );
    addArchBlock(
      deepPassageGroup,
      [2.2, 3.5, 0.8],
      [-1.95, 0.15, -9.2],
      [0, 0.18, 0],
      megaObsidianMat,
      megaEdgeSubtle
    );
    addArchBlock(
      deepPassageGroup,
      [2.2, 3.5, 0.8],
      [1.95, 0.15, -9.2],
      [0, -0.18, 0],
      megaObsidianMat,
      megaEdgeSubtle
    );
    addArchBlock(
      deepPassageGroup,
      [5.6, 0.32, 0.9],
      [0, 1.95, -9.2],
      [0, 0, 0],
      megaBoneMat,
      megaEdgeBone
    );
    addArchBlock(
      deepPassageGroup,
      [0.12, 3.1, 0.2],
      [0, 0.15, -9.8],
      [0, 0, 0],
      megaAmberSlitMat,
      megaEdgeBone
    );
    sanctuaryWorldGroup.add(deepPassageGroup);

    // E. SELECTIVE STRUCTURAL PIERS
    const pierCount = 16;
    const pierGeo = new THREE.BoxGeometry(0.32, 3.6, 0.32);
    const pierMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.42,
      metalness: 0.25,
      bumpMap: textures.bumpTexture,
      bumpScale: 0.01,
    });
    const instancedPiers = new THREE.InstancedMesh(pierGeo, pierMat, pierCount);
    instancedPiers.castShadow = !isHeadless;
    instancedPiers.receiveShadow = !isHeadless;

    const pierBaseData: Array<{
      x: number;
      y: number;
      z: number;
      scaleY: number;
      expandedY: number;
      layerDepth: number;
      rotY: number;
    }> = [];

    for (let i = 0; i < pierCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const row = Math.floor(i / 2);
      const tier = row % 2;
      const spreadX = 4.6 + tier * 2.4;
      const x = side * spreadX;
      const z = 1.8 - row * 1.65;
      const scaleY = 0.9 + ((i * 17) % 35) / 100;
      const y = (3.6 * scaleY) / 2 - 1.65;
      const expandedY = y + 0.9 + (row % 3) * 0.45;
      const rotY = side * (0.18 + tier * 0.14);

      pierBaseData.push({
        x,
        y,
        z,
        scaleY,
        expandedY,
        layerDepth: tier,
        rotY,
      });

      _dummyObj.position.set(x, y, z);
      _dummyObj.rotation.set(0, rotY, 0);
      _dummyObj.scale.set(1, scaleY, 1);
      _dummyObj.updateMatrix();
      instancedPiers.setMatrixAt(i, _dummyObj.matrix);

      if (i === 2) {
        _instanceColor.setHex(0x526bff);
      } else if (i === 5) {
        _instanceColor.setHex(0xf0a65a);
      } else if (i % 3 === 0) {
        _instanceColor.setHex(0xdcd8cc);
      } else {
        _instanceColor.setHex(0x3a3c38);
      }
      instancedPiers.setColorAt(i, _instanceColor);
    }
    instancedPiers.instanceMatrix.needsUpdate = true;
    if (instancedPiers.instanceColor) {
      instancedPiers.instanceColor.needsUpdate = true;
    }
    instancedPiers.computeBoundingSphere();
    instancedPiers.frustumCulled = false;
    scene.add(instancedPiers);

    if (!isHeadless) {
      renderer.compile(scene, camera);
    }

    // =========================================================================
    // 6. FREE 3D EXPLORATION (ORBIT DRAG, WHEEL/PINCH ZOOM, INERTIA, RAYCAST)
    // =========================================================================
    const pointer = { x: 0, y: 0 };
    const raycaster = new THREE.Raycaster();
    const mouseVec = new THREE.Vector2();
    const interactables: THREE.Object3D[] = [
      wordmark.clickProxy,
      signatureObj.clickProxy,
      projectArtifacts.zenithProxy,
      projectArtifacts.deadzoneProxy,
    ];
    let lastRaycastTime = 0;
    let isHoveringSignature = false;
    let isHoveringWordmark = false;
    let headlessFramesRemaining = 2;

    // Manual orbit & zoom state with velocity inertia
    let isPointerDown = false;
    let isDragging = false;
    let dragDistance = 0;
    let prevPointerX = 0;
    let prevPointerY = 0;

    let targetAzimuth = 0; // Horizontal orbit offset (radians), clamped [-1.85, 1.85]
    let targetPolar = 0; // Vertical elevation offset (radians), clamped [-0.52, 0.42]
    let targetDolly = 1.0; // Distance multiplier, clamped [0.50, 1.65]

    let dampedAzimuth = 0;
    let dampedPolar = 0;
    let dampedDolly = 1.0;

    let velAzimuth = 0;
    let velPolar = 0;
    let manualExploreActive = false;
    let lastKnownRouteId: RouteId = stateRef.current.activeRouteId;
    let lastManualScrollProg = stateRef.current.scrollProgress;

    const syncExplorationDOMState = () => {
      if (containerRef.current) {
        containerRef.current.setAttribute(
          'data-camera-explored',
          manualExploreActive ? 'true' : 'false'
        );
        containerRef.current.setAttribute(
          'data-camera-azimuth',
          targetAzimuth.toFixed(3)
        );
        containerRef.current.setAttribute(
          'data-camera-polar',
          targetPolar.toFixed(3)
        );
        containerRef.current.setAttribute(
          'data-camera-dolly',
          targetDolly.toFixed(3)
        );
      }
    };

    const markManualExploration = (active: boolean) => {
      if (manualExploreActive !== active) {
        manualExploreActive = active;
        setIsManualExploring(active);
        if (active) {
          setShowExploreHint(false);
        }
        if (stateRef.current.onManualExploreChange) {
          stateRef.current.onManualExploreChange(active);
        }
      }
      syncExplorationDOMState();
    };

    const resetManualCamera = () => {
      targetAzimuth = 0;
      targetPolar = 0;
      targetDolly = 1.0;
      velAzimuth = 0;
      velPolar = 0;
      headlessFramesRemaining = 2;
      markManualExploration(false);
    };

    resetCameraRef.current = resetManualCamera;
    syncExplorationDOMState();

    const startDrag = (clientX: number, clientY: number) => {
      isPointerDown = true;
      isDragging = false;
      dragDistance = 0;
      prevPointerX = clientX;
      prevPointerY = clientY;
      velAzimuth = 0;
      velPolar = 0;
      headlessFramesRemaining = 2;
    };

    const moveDrag = (clientX: number, clientY: number) => {
      const dx = clientX - prevPointerX;
      const dy = clientY - prevPointerY;
      prevPointerX = clientX;
      prevPointerY = clientY;
      dragDistance += Math.hypot(dx, dy);

      if (dragDistance > 4) {
        isDragging = true;
        renderer.domElement.style.cursor = 'grabbing';
        const dAz = -dx * 0.0056;
        const dPol = -dy * 0.0044;
        targetAzimuth = THREE.MathUtils.clamp(
          targetAzimuth + dAz,
          -1.85,
          1.85
        );
        targetPolar = THREE.MathUtils.clamp(
          targetPolar + dPol,
          -0.52,
          0.42
        );
        velAzimuth = dAz * 0.65;
        velPolar = dPol * 0.65;
        lastManualScrollProg = stateRef.current.scrollProgress;
        headlessFramesRemaining = 2;
        markManualExploration(true);
      }
    };

    const endDrag = () => {
      if (isPointerDown) {
        isPointerDown = false;
        isDragging = false;
        renderer.domElement.style.cursor =
          isHoveringSignature || isHoveringWordmark ? 'pointer' : 'grab';
        headlessFramesRemaining = 2;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      startDrag(e.clientX, e.clientY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      pointer.x = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      pointer.y = -(e.clientY / Math.max(1, window.innerHeight)) * 2 + 1;
      headlessFramesRemaining = 2;

      if (isPointerDown) {
        setHoveredSpatialLabel(null);
        moveDrag(e.clientX, e.clientY);
        return;
      }

      const now = performance.now();
      if (now - lastRaycastTime < 60) return;
      lastRaycastTime = now;

      // Only raycast against 3D structures visible in the current narrative region
      const currScroll = stateRef.current.scrollProgress;
      const currRoute = stateRef.current.activeRouteId;
      const activeInteractables: THREE.Object3D[] = [signatureObj.clickProxy];
      if (currScroll < 0.24 && currRoute === 'home') {
        activeInteractables.unshift(wordmark.clickProxy);
      }
      if (
        currRoute === 'work' ||
        currRoute === 'work-zenith' ||
        currRoute === 'work-deadzone' ||
        (currScroll >= 0.58 && currScroll <= 0.88)
      ) {
        activeInteractables.push(
          projectArtifacts.zenithProxy,
          projectArtifacts.deadzoneProxy
        );
      }

      mouseVec.set(pointer.x, pointer.y);
      raycaster.setFromCamera(mouseVec, camera);
      const hits = raycaster.intersectObjects(activeInteractables, false);
      if (hits.length > 0) {
        const hitObj = hits[0].object;
        isHoveringSignature = hitObj === signatureObj.clickProxy;
        isHoveringWordmark = hitObj === wordmark.clickProxy;
        renderer.domElement.style.cursor = 'pointer';

        if (isHoveringWordmark) {
          setHoveredSpatialLabel(
            'Inspect 3D Wordmark: MIKEY (Click to examine architectural relief)'
          );
        } else if (isHoveringSignature) {
          setHoveredSpatialLabel(
            'Inspect THE FOLD (Click to unfold nested frames & bridge)'
          );
        } else if (hitObj.userData?.projectId === 'zenith') {
          setHoveredSpatialLabel(
            'Inspect Artifact 01: Zenith (Click to open architectural study)'
          );
        } else if (hitObj.userData?.projectId === 'deadzone-bastion') {
          setHoveredSpatialLabel(
            'Inspect Artifact 02: Deadzone Bastion (Click to open study)'
          );
        }
      } else {
        isHoveringSignature = false;
        isHoveringWordmark = false;
        renderer.domElement.style.cursor = 'grab';
        setHoveredSpatialLabel(null);
      }
    };

    const handleMouseUp = () => {
      endDrag();
    };

    // Touch support: 1-finger horizontal/orbital drag + 2-finger pinch-to-zoom
    let touchPinchStartDist = 0;
    let touchStartDolly = 1.0;

    const handleTouchStart = (e: TouchEvent) => {
      headlessFramesRemaining = 2;
      if (e.touches.length === 1) {
        startDrag(e.touches[0].clientX, e.touches[0].clientY);
      } else if (e.touches.length === 2) {
        isPointerDown = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchPinchStartDist = Math.max(10, Math.hypot(dx, dy));
        touchStartDolly = targetDolly;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      headlessFramesRemaining = 2;
      if (e.touches.length === 2 && touchPinchStartDist > 0) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.max(10, Math.hypot(dx, dy));
        const scale = touchPinchStartDist / dist;
        targetDolly = THREE.MathUtils.clamp(
          touchStartDolly * scale,
          0.52,
          1.62
        );
        lastManualScrollProg = stateRef.current.scrollProgress;
        markManualExploration(true);
        return;
      }

      if (e.touches.length === 1 && isPointerDown) {
        const tx = e.touches[0].clientX;
        const ty = e.touches[0].clientY;
        const dx = tx - prevPointerX;
        const dy = ty - prevPointerY;
        // Orbit when horizontal gesture predominates so vertical page scroll is never trapped
        if (Math.abs(dx) > Math.abs(dy) * 0.75 || isDragging) {
          moveDrag(tx, ty);
        } else {
          prevPointerX = tx;
          prevPointerY = ty;
        }
      }
    };

    const handleTouchEnd = () => {
      touchPinchStartDist = 0;
      endDrag();
    };

    // Scroll-wheel zoom / dolly on the 3D canvas with sensible bounds
    const handleWheel = (e: WheelEvent) => {
      headlessFramesRemaining = 2;
      const zoomStep = e.deltaY * 0.0011;
      const nextDolly = THREE.MathUtils.clamp(
        targetDolly + zoomStep,
        0.52,
        1.62
      );

      // Prevent page scroll trap: only consume wheel event when pinching (ctrlKey),
      // when zooming in at top of page, or while actively in manual exploration within zoom bounds
      const withinZoomBounds = nextDolly > 0.53 && nextDolly < 1.61;
      if (
        e.ctrlKey ||
        e.metaKey ||
        (window.scrollY <= 2 && e.deltaY < 0 && withinZoomBounds) ||
        (manualExploreActive && withinZoomBounds)
      ) {
        e.preventDefault();
      }

      targetDolly = nextDolly;
      lastManualScrollProg = stateRef.current.scrollProgress;
      if (Math.abs(targetDolly - 1.0) > 0.025) {
        markManualExploration(true);
      } else {
        syncExplorationDOMState();
      }
    };

    const handleCanvasClick = (e: MouseEvent) => {
      // Do not trigger object clicks if the user was dragging to rotate the camera
      if (dragDistance > 6) {
        return;
      }
      headlessFramesRemaining = 2;
      const rect = renderer.domElement.getBoundingClientRect();
      mouseVec.x = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      mouseVec.y = -((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 + 1;
      raycaster.setFromCamera(mouseVec, camera);
      const hits = raycaster.intersectObjects(interactables, false);
      if (hits.length > 0) {
        const hitObj = hits[0].object;
        if (hitObj.userData?.inspectionTargetId) {
          stateRef.current.onInspectTarget(hitObj.userData.inspectionTargetId);
        } else if (hitObj.userData?.routePath) {
          stateRef.current.onNavigateRoute(hitObj.userData.routePath);
        }
      }
    };

    const handleResize = () => {
      headlessFramesRemaining = 2;
      camera.aspect = window.innerWidth / Math.max(1, window.innerHeight);
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('touchstart', handleTouchStart, {
      passive: true,
    });
    renderer.domElement.addEventListener('touchmove', handleTouchMove, {
      passive: true,
    });
    renderer.domElement.addEventListener('touchend', handleTouchEnd);
    renderer.domElement.addEventListener('wheel', handleWheel, {
      passive: false,
    });
    renderer.domElement.addEventListener('click', handleCanvasClick);
    window.addEventListener('resize', handleResize);

    const startTimeMs = performance.now();
    let prevTimeMs = startTimeMs;
    let animFrameId = 0;
    let lastStateKey = '';

    let dampedSigScale = 0.94;
    let dampedSigRotX = 0.08;
    let dampedSigRotY = -0.32;
    let dampedSigRotZ = 0.02;
    let dampedSigPosX = 0;
    let dampedSigPosY = 1.25;
    let dampedSigPosZ = -3.2;
    let dampedFold = 0.14;
    let dampedWireframe = 0.18;
    let dampedGridElev = 0.0;
    let dampedHover = 0;
    let dampedCobalt = 0.68;
    let dampedAmber = 0.24;

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);

      const {
        activeRouteId: routeId,
        scrollProgress: scrollProg,
        foldOverride: fOverride,
        finishMode: fMode,
        reducedMotion: rMotion,
        hoveredProjectId: hProjId,
        activeThoughtAccent: tAccent,
        stayingWithThought: stayThought,
        thoughtCameraOffset: tCamOffset,
        inspectedTargetId: inspId,
      } = stateRef.current;

      // If the user explicitly changed narrative chapters (via nav or chapter scroll),
      // gently ease manual camera offsets back toward the new chapter's composition
      if (routeId !== lastKnownRouteId) {
        lastKnownRouteId = routeId;
        setHoveredSpatialLabel(null);
        if (manualExploreActive && !isPointerDown) {
          targetAzimuth *= 0.25;
          targetPolar *= 0.25;
          targetDolly = THREE.MathUtils.lerp(targetDolly, 1.0, 0.7);
          if (
            Math.abs(targetAzimuth) < 0.04 &&
            Math.abs(targetPolar) < 0.04 &&
            Math.abs(targetDolly - 1.0) < 0.04
          ) {
            resetManualCamera();
          }
        }
      } else if (
        manualExploreActive &&
        !isPointerDown &&
        Math.abs(scrollProg - lastManualScrollProg) > 0.12
      ) {
        lastManualScrollProg = scrollProg;
        setHoveredSpatialLabel(null);
        targetAzimuth *= 0.5;
        targetPolar *= 0.5;
        targetDolly = THREE.MathUtils.lerp(targetDolly, 1.0, 0.5);
      }

      const currentStateKey = `${routeId}|${scrollProg.toFixed(2)}|${fOverride}|${fMode}|${rMotion}|${hProjId}|${tAccent}|${stayThought}|${tCamOffset.join(',')}|${inspId}|${targetAzimuth.toFixed(3)}|${targetPolar.toFixed(3)}|${targetDolly.toFixed(3)}`;
      if (currentStateKey !== lastStateKey) {
        lastStateKey = currentStateKey;
        headlessFramesRemaining = 2;
      }

      if (isHeadless) {
        if (headlessFramesRemaining <= 0) {
          return;
        }
        headlessFramesRemaining -= 1;
      }

      const nowMs = performance.now();
      const rawDelta = Math.max(0.001, (nowMs - prevTimeMs) / 1000);
      prevTimeMs = nowMs;
      const dt = isHeadless ? 0.5 : Math.min(rawDelta, 0.1);
      const elapsed = rMotion || isHeadless ? 0 : (nowMs - startTimeMs) / 1000;

      // Apply inertial coasting when pointer is released
      if (!isPointerDown && !isHeadless && !rMotion) {
        if (Math.abs(velAzimuth) > 0.0001 || Math.abs(velPolar) > 0.0001) {
          targetAzimuth = THREE.MathUtils.clamp(
            targetAzimuth + velAzimuth,
            -1.85,
            1.85
          );
          targetPolar = THREE.MathUtils.clamp(
            targetPolar + velPolar,
            -0.52,
            0.42
          );
          const friction = Math.exp(-7.5 * dt);
          velAzimuth *= friction;
          velPolar *= friction;
        }
      }

      const orbitLambda = rMotion || isHeadless ? 45 : 7.5;
      dampedAzimuth = isHeadless
        ? targetAzimuth
        : dampValue(dampedAzimuth, targetAzimuth, orbitLambda, dt);
      dampedPolar = isHeadless
        ? targetPolar
        : dampValue(dampedPolar, targetPolar, orbitLambda, dt);
      dampedDolly = isHeadless
        ? targetDolly
        : dampValue(dampedDolly, targetDolly, orbitLambda, dt);

      const baseKeyframe =
        routeId === 'work-zenith' || routeId === 'work-deadzone'
          ? SCENE_KEYFRAMES[routeId]
          : getContinuousScrollKeyframe(scrollProg);

      const isMobile = window.innerWidth < 768;
      const mobileZOffset = isMobile ? 2.6 : 0;

      let targetX =
        baseKeyframe.position[0] +
        (routeId === 'spaces' || routeId === 'notes' ? tCamOffset[0] : 0);
      let targetY =
        baseKeyframe.position[1] +
        (routeId === 'spaces' || routeId === 'notes' ? tCamOffset[1] : 0);
      let targetZ =
        baseKeyframe.position[2] +
        mobileZOffset +
        (routeId === 'spaces' || routeId === 'notes' ? tCamOffset[2] : 0);

      let lookX = baseKeyframe.lookAt[0];
      let lookY = baseKeyframe.lookAt[1];
      let lookZ = baseKeyframe.lookAt[2];

      if (inspId === 'wordmark') {
        targetX = 0.0;
        targetY = 3.25;
        targetZ = 8.4 + mobileZOffset;
        lookX = 0.0;
        lookY = 3.25;
        lookZ = -1.6;
      } else if (inspId === 'the-fold') {
        targetX = 0.85;
        targetY = 1.65;
        targetZ = 6.9 + mobileZOffset;
        lookX = 0.0;
        lookY = 1.25;
        lookZ = -3.2;
      }

      // Apply Spherical Orbit & Dolly Zoom around the chapter lookAt point
      _sphericalOffset.set(targetX - lookX, targetY - lookY, targetZ - lookZ);
      _spherical.setFromVector3(_sphericalOffset);
      _spherical.theta += dampedAzimuth;
      _spherical.phi = THREE.MathUtils.clamp(
        _spherical.phi + dampedPolar,
        0.32,
        Math.PI * 0.54
      );
      _spherical.radius = THREE.MathUtils.clamp(
        _spherical.radius * dampedDolly,
        4.4,
        21.5
      );
      _sphericalOffset.setFromSpherical(_spherical);

      // Subtle pointer parallax when not actively dragging
      const parallaxScale = isPointerDown
        ? 0
        : manualExploreActive
        ? 0.25
        : 1.0;
      const parallaxX =
        !rMotion && !isHeadless && !isMobile
          ? pointer.x * 0.52 * parallaxScale
          : 0;
      const parallaxY =
        !rMotion && !isHeadless && !isMobile
          ? pointer.y * 0.32 * parallaxScale
          : 0;

      const finalCamX = lookX + _sphericalOffset.x + parallaxX;
      const finalCamY = Math.max(-0.75, lookY + _sphericalOffset.y + parallaxY);
      const finalCamZ = lookZ + _sphericalOffset.z;

      _targetCamPos.set(finalCamX, finalCamY, finalCamZ);
      _targetLookAt.set(lookX, lookY, lookZ);

      const lambda = rMotion || isHeadless ? 40 : isPointerDown ? 14.0 : 4.6;
      const alpha = isHeadless ? 1 : 1 - Math.exp(-lambda * dt);

      _currentCamPos.lerp(_targetCamPos, alpha);
      _currentLookAt.lerp(_targetLookAt, alpha);

      camera.position.copy(_currentCamPos);
      camera.lookAt(_currentLookAt);

      if (Math.abs(camera.fov - baseKeyframe.fov) > 0.05) {
        camera.fov = isHeadless
          ? baseKeyframe.fov
          : dampValue(camera.fov, baseKeyframe.fov, lambda, dt);
        camera.updateProjectionMatrix();
      }

      let targetCobalt = baseKeyframe.cobaltIntensity;
      let targetAmber = baseKeyframe.amberIntensity;
      if (tAccent === 'cobalt') {
        targetCobalt = stayThought ? 1.0 : 0.88;
        targetAmber = 0.25;
      } else if (tAccent === 'amber') {
        targetAmber = stayThought ? 1.0 : 0.9;
        targetCobalt = 0.25;
      }

      dampedCobalt = isHeadless
        ? targetCobalt
        : dampValue(dampedCobalt, targetCobalt, lambda, dt);
      dampedAmber = isHeadless
        ? targetAmber
        : dampValue(dampedAmber, targetAmber, lambda, dt);

      cobaltAccentLight.intensity = 0.6 + dampedCobalt * 1.3;
      amberAccentLight.intensity = 0.6 + dampedAmber * 1.3;

      dampedSigScale = isHeadless
        ? baseKeyframe.signatureScale
        : dampValue(dampedSigScale, baseKeyframe.signatureScale, lambda, dt);
      dampedSigRotX = isHeadless
        ? baseKeyframe.signatureRotation[0]
        : dampValue(
            dampedSigRotX,
            baseKeyframe.signatureRotation[0],
            lambda,
            dt
          );
      dampedSigRotY = isHeadless
        ? baseKeyframe.signatureRotation[1]
        : dampValue(
            dampedSigRotY,
            baseKeyframe.signatureRotation[1],
            lambda,
            dt
          );
      dampedSigRotZ = isHeadless
        ? baseKeyframe.signatureRotation[2]
        : dampValue(
            dampedSigRotZ,
            baseKeyframe.signatureRotation[2],
            lambda,
            dt
          );
      dampedSigPosX = isHeadless
        ? baseKeyframe.signaturePosition[0]
        : dampValue(
            dampedSigPosX,
            baseKeyframe.signaturePosition[0],
            lambda,
            dt
          );
      dampedSigPosY = isHeadless
        ? baseKeyframe.signaturePosition[1]
        : dampValue(
            dampedSigPosY,
            baseKeyframe.signaturePosition[1],
            lambda,
            dt
          );
      dampedSigPosZ = isHeadless
        ? baseKeyframe.signaturePosition[2]
        : dampValue(
            dampedSigPosZ,
            baseKeyframe.signaturePosition[2],
            lambda,
            dt
          );

      const targetFold =
        fOverride !== null ? fOverride : baseKeyframe.foldDepth;
      dampedFold = isHeadless
        ? targetFold
        : dampValue(dampedFold, targetFold, lambda, dt);
      dampedWireframe = isHeadless
        ? baseKeyframe.wireframeMix
        : dampValue(dampedWireframe, baseKeyframe.wireframeMix, lambda, dt);
      dampedGridElev = isHeadless
        ? baseKeyframe.gridElevation
        : dampValue(dampedGridElev, baseKeyframe.gridElevation, lambda, dt);

      const sigHoveredOrInspected =
        isHoveringSignature || inspId === 'the-fold';
      dampedHover = isHeadless
        ? sigHoveredOrInspected
          ? 1
          : 0
        : dampValue(dampedHover, sigHoveredOrInspected ? 1 : 0, 8, dt);

      // Pause conflicting ambient rotation when visitor is actively dragging or exploring
      const motionScale =
        isPointerDown || manualExploreActive ? 0.0 : stayThought ? 0.15 : 1.0;

      signatureObj.group.scale.setScalar(dampedSigScale);
      signatureObj.group.position.set(
        dampedSigPosX,
        dampedSigPosY + Math.sin(elapsed * 0.45 * motionScale) * 0.04,
        dampedSigPosZ
      );
      signatureObj.group.rotation.set(
        dampedSigRotX,
        dampedSigRotY + elapsed * 0.035 * motionScale,
        dampedSigRotZ
      );

      signatureObj.updateState({
        elapsed: elapsed * motionScale,
        foldDepth: dampedFold,
        wireframeMix: dampedWireframe,
        finishMode: fMode,
        hoverIntensity: dampedHover,
        cobaltIntensity: dampedCobalt,
        amberIntensity: dampedAmber,
      });

      wordmark.updateState(
        scrollProg,
        elapsed * motionScale,
        isHoveringWordmark || inspId === 'wordmark'
      );
      if (inspId === 'the-fold') {
        wordmark.group.position.y += 2.2;
      }
      const wordmarkAspectScale = Math.min(
        1,
        Math.max(0.46, camera.aspect * 1.08)
      );
      wordmark.group.scale.setScalar(wordmarkAspectScale);

      projectArtifacts.updateState({
        elapsed: elapsed * motionScale,
        scrollProgress: scrollProg,
        activeRouteId: routeId,
        hoveredProjectId:
          hProjId ||
          (inspId === 'zenith'
            ? 'zenith'
            : inspId === 'deadzone-bastion'
            ? 'deadzone-bastion'
            : null),
      });

      midgroundFoldGroup.position.z = -dampedFold * 0.85;
      midgroundFoldGroup.rotation.y = (dampedFold - 0.14) * 0.12;
      bridgesGroup.position.y = dampedGridElev * 0.45;
      deepPassageGroup.position.z = -dampedFold * 1.1;

      for (let i = 0; i < pierCount; i++) {
        const base = pierBaseData[i];
        const currY = THREE.MathUtils.lerp(
          base.y,
          base.expandedY,
          dampedGridElev * 0.65
        );
        const sy = THREE.MathUtils.lerp(
          base.scaleY,
          base.scaleY * 1.35,
          dampedGridElev
        );
        const parallaxLayerShift =
          !rMotion && !isHeadless
            ? pointer.x * (0.14 * (2 - base.layerDepth)) * parallaxScale
            : 0;

        _dummyObj.position.set(base.x + parallaxLayerShift, currY, base.z);
        _dummyObj.rotation.set(0, base.rotY + dampedFold * 0.35, 0);
        _dummyObj.scale.set(1.0, sy, 1.0);
        _dummyObj.updateMatrix();
        instancedPiers.setMatrixAt(i, _dummyObj.matrix);
      }
      instancedPiers.instanceMatrix.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameId);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('touchstart', handleTouchStart);
      renderer.domElement.removeEventListener('touchmove', handleTouchMove);
      renderer.domElement.removeEventListener('touchend', handleTouchEnd);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      renderer.domElement.removeEventListener('click', handleCanvasClick);
      window.removeEventListener('resize', handleResize);

      wordmark.dispose();
      signatureObj.dispose();
      projectArtifacts.dispose();
      textures.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      pierGeo.dispose();
      pierMat.dispose();
      worldArchGeometries.forEach((g) => g.dispose());
      worldArchMaterials.forEach((m) => m.dispose());
      if (envTexture) envTexture.dispose();
      renderer.dispose();
    };
  }, []);

  const showResetButton =
    isManualExploring || inspectedTargetId !== null || foldOverride !== null;

  return (
    <>
      <div
        ref={containerRef}
        className="fixed inset-0 w-screen h-screen pointer-events-auto z-0 overflow-hidden bg-[#111210]"
        data-testid="world-canvas-container"
      >
        <div ref={canvasMountRef} className="w-full h-full" />

        {!webglAvailable && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25"
            aria-hidden="true"
          >
            <div className="w-96 h-96 border border-[#526BFF]/50 rotate-12 flex items-center justify-center">
              <div className="w-64 h-64 border border-[#F0A65A]/50 -rotate-24" />
            </div>
          </div>
        )}
      </div>

      {/* Subtle discoverability cue when hovering an interactive 3D structure (rendered above main z-10) */}
      {hoveredSpatialLabel && (
        <div
          className="fixed bottom-4 left-6 z-30 pointer-events-none bg-[#111210]/95 border border-[#526BFF] px-3.5 py-1.5 text-xs font-mono-tech text-[#F8F7F2]"
          role="status"
        >
          {hoveredSpatialLabel}
        </div>
      )}

      {/* Brief first-visit contextual hint that disappears once visitor interacts */}
      {showExploreHint && !showResetButton && (
        <div
          data-testid="explore-hint"
          className="fixed bottom-3.5 right-6 z-30 pointer-events-none bg-[#161715]/95 border border-[#454642]/80 px-3 py-1 text-[11px] font-mono-tech text-[#E9E5DA] flex items-center gap-2 transition-opacity duration-500"
        >
          <span
            className="inline-block w-3 h-[2px] bg-[#526BFF]"
            aria-hidden="true"
          />
          <span>Drag to explore · Scroll to zoom</span>
        </div>
      )}

      {/* Discreet Reset View action — only rendered when camera or structure is manually offset */}
      {showResetButton && (
        <button
          type="button"
          onClick={handleResetViewClick}
          data-testid="reset-view-button"
          aria-label="Reset 3D viewpoint to default composition"
          className="fixed bottom-3.5 right-6 z-30 pointer-events-auto px-3.5 py-1.5 text-xs font-mono-tech text-[#F8F7F2] bg-[#161715]/95 border border-[#888983] hover:border-[#F8F7F2] hover:bg-[#20211F] transition-colors cursor-pointer inline-flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-[#E9E5DA]"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#526BFF]" />
          <span>Reset view</span>
        </button>
      )}
    </>
  );
};
