import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  RouteId,
  SCENE_KEYFRAMES,
  dampValue,
} from '../domain/portfolioData';
import { createProceduralTextures } from './proceduralTextures';
import {
  createSignatureImpossibleObject,
  SurfaceFinishMode,
} from './signatureObject';
import { createCustomWordmark } from './customWordmark';
import { createProjectArtifacts } from './projectArtifacts';

// Pre-allocated scratch math helpers at module scope (zero GC in render loop)
const _targetCamPos = new THREE.Vector3();
const _currentCamPos = new THREE.Vector3(0, 1.8, 12.5);
const _targetLookAt = new THREE.Vector3();
const _currentLookAt = new THREE.Vector3(0, 1.1, 0);
const _dummyObj = new THREE.Object3D();
const _instanceColor = new THREE.Color();

export interface WorldCanvasProps {
  activeRouteId: RouteId;
  scrollProgress: number;
  paradoxOverride: number | null;
  finishMode: SurfaceFinishMode;
  cameraPreset: 'narrative' | 'isometric' | 'elevation';
  reducedMotion: boolean;
  hoveredProjectId: string | null;
  onNavigateRoute: (path: string) => void;
  onInspectSignature: () => void;
}

export const WorldCanvas: React.FC<WorldCanvasProps> = ({
  activeRouteId,
  scrollProgress,
  paradoxOverride,
  finishMode,
  cameraPreset,
  reducedMotion,
  hoveredProjectId,
  onNavigateRoute,
  onInspectSignature,
}) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const [webglAvailable, setWebglAvailable] = useState<boolean>(true);

  // Store mutable props in ref so WebGL loop reads latest state without re-mounting
  const stateRef = useRef({
    activeRouteId,
    scrollProgress,
    paradoxOverride,
    finishMode,
    cameraPreset,
    reducedMotion,
    hoveredProjectId,
    onNavigateRoute,
    onInspectSignature,
  });

  useEffect(() => {
    stateRef.current = {
      activeRouteId,
      scrollProgress,
      paradoxOverride,
      finishMode,
      cameraPreset,
      reducedMotion,
      hoveredProjectId,
      onNavigateRoute,
      onInspectSignature,
    };
  }, [
    activeRouteId,
    scrollProgress,
    paradoxOverride,
    finishMode,
    cameraPreset,
    reducedMotion,
    hoveredProjectId,
    onNavigateRoute,
    onInspectSignature,
  ]);

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
      });
    } catch {
      setWebglAvailable(false);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(
      isHeadless ? 1 : Math.min(window.devicePixelRatio || 1, 2)
    );
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = !isHeadless;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x111210, 1);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111210);
    scene.fog = new THREE.FogExp2(0x111210, 0.036);

    // Studio PBR environment reflection via RoomEnvironment + PMREMGenerator
    let envTexture: THREE.Texture | null = null;
    if (!isHeadless) {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      envTexture = pmremGenerator.fromScene(
        new RoomEnvironment(),
        0.04
      ).texture;
      scene.environment = envTexture;
      pmremGenerator.dispose();
    }

    const camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / Math.max(1, window.innerHeight),
      0.1,
      120
    );
    camera.position.copy(_currentCamPos);
    camera.lookAt(_currentLookAt);

    // Studio 3-point warm/cool lighting rig
    const hemiLight = new THREE.HemisphereLight(
      0xdde2e6,
      0x181917,
      isHeadless ? 1.25 : 0.68
    );
    hemiLight.position.set(0, 25, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xf8f2e6, 1.9);
    keyLight.position.set(7, 13, 8);
    keyLight.castShadow = !isHeadless;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    const d = 8.5;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 35;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xb8c0c8, 0.85);
    rimLight.position.set(-8, 6, -9);
    scene.add(rimLight);

    // Procedural textures
    const textures = createProceduralTextures(renderer);

    // Architectural ground datum floor (offset safely at y = 0)
    const floorGeo = new THREE.PlaneGeometry(80, 80);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: textures.gridTexture,
      bumpMap: textures.bumpTexture,
      bumpScale: 0.01,
      roughness: 0.82,
      metalness: 0.15,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = 0;
    floorMesh.receiveShadow = !isHeadless;
    scene.add(floorMesh);

    // 1. Monumental 3D Wordmark "MIKEY"
    const wordmark = createCustomWordmark();
    scene.add(wordmark.group);

    // 2. Signature Impossible Object
    const signatureObj = createSignatureImpossibleObject(
      textures.bumpTexture,
      textures.contactShadowTexture
    );
    signatureObj.group.position.set(0, 1.35, -1.2);
    scene.add(signatureObj.group);

    // 3. Project Artifacts (Zenith & Deadzone Bastion)
    const projectArtifacts = createProjectArtifacts(
      textures.bumpTexture,
      textures.contactShadowTexture
    );
    scene.add(projectArtifacts.group);

    // 4. InstancedMesh: 48 Architectural Shelf / Coordinate Pillars
    const pillarCount = 48;
    const pillarGeo = new THREE.BoxGeometry(0.18, 2.6, 0.42);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.55,
      metalness: 0.35,
    });
    const instancedPillars = new THREE.InstancedMesh(
      pillarGeo,
      pillarMat,
      pillarCount
    );
    instancedPillars.castShadow = !isHeadless;
    instancedPillars.receiveShadow = !isHeadless;

    const pillarBaseData: Array<{
      x: number;
      y: number;
      z: number;
      scaleY: number;
      starY: number;
    }> = [];

    for (let i = 0; i < pillarCount; i++) {
      // Place pillars in two flanking architectural colonnades + deep horizon arc
      // so the central camera sightline (|x| < 6.2, z > -4.5) is 100% unobstructed
      const side = i % 2 === 0 ? -1 : 1;
      const row = Math.floor(i / 2);
      const spreadX = 6.8 + (row % 4) * 2.4;
      const x = side * spreadX;
      const z = 5.0 - row * 1.45;
      const scaleY = 0.75 + ((i * 19) % 35) / 100;
      const y = (2.6 * scaleY) / 2;
      const starY = 3.5 + ((i * 37) % 90) / 10;

      pillarBaseData.push({ x, y, z, scaleY, starY });

      _dummyObj.position.set(x, y, z);
      _dummyObj.rotation.set(0, side * 0.15, 0);
      _dummyObj.scale.set(1, scaleY, 1);
      _dummyObj.updateMatrix();
      instancedPillars.setMatrixAt(i, _dummyObj.matrix);

      const shade = 0.22 + ((i * 23) % 55) / 100;
      _instanceColor.setRGB(shade, shade, shade * 0.96);
      instancedPillars.setColorAt(i, _instanceColor);
    }
    instancedPillars.instanceMatrix.needsUpdate = true;
    if (instancedPillars.instanceColor) {
      instancedPillars.instanceColor.needsUpdate = true;
    }
    instancedPillars.computeBoundingSphere();
    instancedPillars.frustumCulled = false;
    scene.add(instancedPillars);

    if (!isHeadless) {
      renderer.compile(scene, camera);
    }

    // Pointer parallax & throttled raycasting
    const pointer = { x: 0, y: 0 };
    const raycaster = new THREE.Raycaster();
    const mouseVec = new THREE.Vector2();
    const interactables: THREE.Object3D[] = [
      signatureObj.clickProxy,
      projectArtifacts.zenithProxy,
      projectArtifacts.deadzoneProxy,
    ];
    let lastRaycastTime = 0;
    let isHoveringSignature = false;
    let headlessFramesRemaining = 2;

    const handlePointerMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      pointer.y = -(e.clientY / Math.max(1, window.innerHeight)) * 2 + 1;
      headlessFramesRemaining = 1;

      const now = performance.now();
      if (now - lastRaycastTime < 60) return;
      lastRaycastTime = now;

      mouseVec.set(pointer.x, pointer.y);
      raycaster.setFromCamera(mouseVec, camera);
      const hits = raycaster.intersectObjects(interactables, false);
      if (hits.length > 0) {
        isHoveringSignature = hits[0].object === signatureObj.clickProxy;
        renderer.domElement.style.cursor = 'pointer';
      } else {
        isHoveringSignature = false;
        renderer.domElement.style.cursor = 'default';
      }
    };

    const handleCanvasClick = (e: MouseEvent) => {
      headlessFramesRemaining = 2;
      const rect = renderer.domElement.getBoundingClientRect();
      mouseVec.x = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      mouseVec.y = -((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 + 1;
      raycaster.setFromCamera(mouseVec, camera);
      const hits = raycaster.intersectObjects(interactables, false);
      if (hits.length > 0) {
        const hitObj = hits[0].object;
        if (hitObj === signatureObj.clickProxy) {
          stateRef.current.onInspectSignature();
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

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    renderer.domElement.addEventListener('click', handleCanvasClick);
    window.addEventListener('resize', handleResize);

    // Animation loop with exponential damping (using performance.now() to avoid THREE.Clock deprecation)
    const startTimeMs = performance.now();
    let prevTimeMs = startTimeMs;
    let animFrameId = 0;
    let lastStateKey = '';

    let dampedSigScale = 1.15;
    let dampedSigRotX = 0.14;
    let dampedSigRotY = -0.42;
    let dampedSigRotZ = 0.04;
    let dampedSigPosX = 0;
    let dampedSigPosY = 1.35;
    let dampedSigPosZ = -1.2;
    let dampedParadox = 0.18;
    let dampedWireframe = 0.08;
    let dampedGridElev = 0.0;
    let dampedHover = 0;

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);

      const {
        activeRouteId: routeId,
        scrollProgress: scrollProg,
        paradoxOverride: pOverride,
        finishMode: fMode,
        cameraPreset: cPreset,
        reducedMotion: rMotion,
        hoveredProjectId: hProjId,
      } = stateRef.current;

      const currentStateKey = `${routeId}|${scrollProg.toFixed(2)}|${pOverride}|${fMode}|${cPreset}|${rMotion}|${hProjId}`;
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

      const keyframe = SCENE_KEYFRAMES[routeId] || SCENE_KEYFRAMES.home;
      const isMobile = window.innerWidth < 768;
      const mobileZOffset = isMobile ? 2.8 : 0;

      let targetX = keyframe.position[0];
      let targetY = keyframe.position[1];
      let targetZ = keyframe.position[2] + mobileZOffset;

      if (cPreset === 'isometric') {
        targetX = 8.2;
        targetY = 6.8;
        targetZ = 8.8 + mobileZOffset;
      } else if (cPreset === 'elevation') {
        targetX = 0.0;
        targetY = 1.5;
        targetZ = 8.4 + mobileZOffset;
      }

      const parallaxX = !rMotion && !isHeadless && !isMobile ? pointer.x * 0.45 : 0;
      const parallaxY = !rMotion && !isHeadless && !isMobile ? pointer.y * 0.28 : 0;

      _targetCamPos.set(targetX + parallaxX, targetY + parallaxY, targetZ);
      _targetLookAt.set(
        keyframe.lookAt[0],
        keyframe.lookAt[1],
        keyframe.lookAt[2]
      );

      const lambda = rMotion || isHeadless ? 40 : 4.2;
      const alpha = isHeadless ? 1 : 1 - Math.exp(-lambda * dt);

      _currentCamPos.lerp(_targetCamPos, alpha);
      _currentLookAt.lerp(_targetLookAt, alpha);

      camera.position.copy(_currentCamPos);
      camera.lookAt(_currentLookAt);

      if (Math.abs(camera.fov - keyframe.fov) > 0.05) {
        camera.fov = isHeadless ? keyframe.fov : dampValue(camera.fov, keyframe.fov, lambda, dt);
        camera.updateProjectionMatrix();
      }

      dampedSigScale = isHeadless ? keyframe.signatureScale : dampValue(dampedSigScale, keyframe.signatureScale, lambda, dt);
      dampedSigRotX = isHeadless ? keyframe.signatureRotation[0] : dampValue(dampedSigRotX, keyframe.signatureRotation[0], lambda, dt);
      dampedSigRotY = isHeadless ? keyframe.signatureRotation[1] : dampValue(dampedSigRotY, keyframe.signatureRotation[1], lambda, dt);
      dampedSigRotZ = isHeadless ? keyframe.signatureRotation[2] : dampValue(dampedSigRotZ, keyframe.signatureRotation[2], lambda, dt);
      dampedSigPosX = isHeadless ? keyframe.signaturePosition[0] : dampValue(dampedSigPosX, keyframe.signaturePosition[0], lambda, dt);
      dampedSigPosY = isHeadless ? keyframe.signaturePosition[1] : dampValue(dampedSigPosY, keyframe.signaturePosition[1], lambda, dt);
      dampedSigPosZ = isHeadless ? keyframe.signaturePosition[2] : dampValue(dampedSigPosZ, keyframe.signaturePosition[2], lambda, dt);

      const targetParadox =
        pOverride !== null ? pOverride : keyframe.paradoxSeparation;
      dampedParadox = isHeadless ? targetParadox : dampValue(dampedParadox, targetParadox, lambda, dt);
      dampedWireframe = isHeadless ? keyframe.wireframeMix : dampValue(dampedWireframe, keyframe.wireframeMix, lambda, dt);
      dampedGridElev = isHeadless ? keyframe.gridElevation : dampValue(dampedGridElev, keyframe.gridElevation, lambda, dt);
      dampedHover = isHeadless ? (isHoveringSignature ? 1 : 0) : dampValue(dampedHover, isHoveringSignature ? 1 : 0, 8, dt);

      signatureObj.group.scale.setScalar(dampedSigScale);
      signatureObj.group.position.set(
        dampedSigPosX,
        dampedSigPosY + Math.sin(elapsed * 0.45) * 0.04,
        dampedSigPosZ
      );
      signatureObj.group.rotation.set(
        dampedSigRotX,
        dampedSigRotY + elapsed * 0.04,
        dampedSigRotZ
      );

      signatureObj.updateState({
        elapsed,
        paradoxSeparation: dampedParadox,
        wireframeMix: dampedWireframe,
        finishMode: fMode,
        hoverIntensity: dampedHover,
      });

      wordmark.updateState(scrollProg, elapsed);

      projectArtifacts.updateState({
        elapsed,
        scrollProgress: scrollProg,
        activeRouteId: routeId,
        hoveredProjectId: hProjId,
      });

      for (let i = 0; i < pillarCount; i++) {
        const base = pillarBaseData[i];
        const ringIndex = Math.floor(i / 12);
        const angle = ((i % 12) / 12) * Math.PI * 2 + ringIndex * 0.26;
        const currY = THREE.MathUtils.lerp(base.y, base.starY, dampedGridElev);
        const sy = THREE.MathUtils.lerp(base.scaleY, 0.08, dampedGridElev);
        const sx = THREE.MathUtils.lerp(1.0, 0.35, dampedGridElev);

        _dummyObj.position.set(base.x, currY, base.z);
        _dummyObj.rotation.set(0, -angle + dampedGridElev * 0.6, 0);
        _dummyObj.scale.set(sx, sy, sx);
        _dummyObj.updateMatrix();
        instancedPillars.setMatrixAt(i, _dummyObj.matrix);
      }
      instancedPillars.instanceMatrix.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('click', handleCanvasClick);
      window.removeEventListener('resize', handleResize);

      wordmark.dispose();
      signatureObj.dispose();
      projectArtifacts.dispose();
      textures.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      pillarGeo.dispose();
      pillarMat.dispose();
      if (envTexture) envTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 w-screen h-screen pointer-events-auto z-0 overflow-hidden bg-[#111210]"
      data-testid="world-canvas-container"
    >
      <div ref={canvasMountRef} className="w-full h-full" />
      {!webglAvailable && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25"
          aria-hidden="true"
        >
          <div className="w-96 h-96 border border-[#888983] rotate-12 flex items-center justify-center">
            <div className="w-64 h-64 border border-[#E9E5DA] -rotate-24" />
          </div>
        </div>
      )}
    </div>
  );
};
