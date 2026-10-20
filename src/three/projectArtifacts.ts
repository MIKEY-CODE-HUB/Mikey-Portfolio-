import * as THREE from 'three';

export interface ProjectArtifactsController {
  group: THREE.Group;
  zenithProxy: THREE.Mesh;
  deadzoneProxy: THREE.Mesh;
  updateState: (params: {
    elapsed: number;
    scrollProgress: number;
    activeRouteId: string;
    hoveredProjectId: string | null;
  }) => void;
  dispose: () => void;
}

export function createProjectArtifacts(
  bumpTexture: THREE.CanvasTexture,
  contactShadowTexture: THREE.CanvasTexture
): ProjectArtifactsController {
  const group = new THREE.Group();
  group.name = 'ProjectArtifactsEnvironment';
  group.visible = false;
  group.position.y = -5.2;

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];

  const obsidianMat = new THREE.MeshStandardMaterial({
    color: 0x343632,
    emissive: 0x181917,
    emissiveIntensity: 0.3,
    roughness: 0.52,
    metalness: 0.26,
    bumpMap: bumpTexture,
    bumpScale: 0.014,
  });
  const boneMat = new THREE.MeshStandardMaterial({
    color: 0xf2efe6,
    emissive: 0xe9e5da,
    emissiveIntensity: 0.16,
    roughness: 0.26,
    metalness: 0.16,
  });
  const metallicMat = new THREE.MeshStandardMaterial({
    color: 0xa4a69e,
    roughness: 0.2,
    metalness: 0.85,
  });
  const cobaltAccentMat = new THREE.MeshStandardMaterial({
    color: 0x526bff,
    emissive: 0x526bff,
    emissiveIntensity: 0.62,
    roughness: 0.22,
    metalness: 0.45,
  });
  const amberAccentMat = new THREE.MeshStandardMaterial({
    color: 0xf0a65a,
    emissive: 0xf0a65a,
    emissiveIntensity: 0.58,
    roughness: 0.24,
    metalness: 0.38,
  });
  const lineMat = new THREE.LineBasicMaterial({
    color: 0xf8f7f2,
    transparent: true,
    opacity: 0.75,
  });
  const shadowMat = new THREE.MeshBasicMaterial({
    map: contactShadowTexture,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  materials.push(
    obsidianMat,
    boneMat,
    metallicMat,
    cobaltAccentMat,
    amberAccentMat,
    lineMat,
    shadowMat
  );

  // ============================================================================
  // 1. ZENITH ARTIFACT (Concentration, Temporal Boundaries, Electric Cobalt Ring)
  // ============================================================================
  const zenithGroup = new THREE.Group();
  zenithGroup.position.set(-3.4, 0.0, -2.4);

  const plinthGeo = new THREE.CylinderGeometry(1.22, 1.32, 0.28, 32);
  geometries.push(plinthGeo);
  const zenithPlinth = new THREE.Mesh(plinthGeo, obsidianMat);
  zenithPlinth.position.y = 0.14;
  zenithPlinth.castShadow = true;
  zenithPlinth.receiveShadow = true;
  zenithGroup.add(zenithPlinth);

  const ring1Geo = new THREE.TorusGeometry(1.02, 0.042, 16, 64);
  const ring2Geo = new THREE.TorusGeometry(0.74, 0.036, 16, 64);
  const ring3Geo = new THREE.TorusGeometry(0.46, 0.032, 16, 48);
  geometries.push(ring1Geo, ring2Geo, ring3Geo);

  const zRing1 = new THREE.Mesh(ring1Geo, boneMat);
  zRing1.position.y = 1.32;
  const zRing2 = new THREE.Mesh(ring2Geo, metallicMat);
  zRing2.position.y = 1.32;
  const zRing3 = new THREE.Mesh(ring3Geo, cobaltAccentMat);
  zRing3.position.y = 1.32;

  const spireGeo = new THREE.ConeGeometry(0.14, 1.95, 16);
  geometries.push(spireGeo);
  const zSpire = new THREE.Mesh(spireGeo, boneMat);
  zSpire.position.y = 1.15;
  zSpire.castShadow = true;

  const shieldGeo = new THREE.CylinderGeometry(
    1.18,
    1.18,
    1.48,
    24,
    1,
    true,
    -Math.PI * 0.4,
    Math.PI * 0.8
  );
  geometries.push(shieldGeo);
  const zShield = new THREE.Mesh(shieldGeo, obsidianMat);
  zShield.position.y = 1.18;
  const shieldEdges = new THREE.EdgesGeometry(shieldGeo);
  geometries.push(shieldEdges);
  zShield.add(new THREE.LineSegments(shieldEdges, lineMat));

  const contactGeo = new THREE.CircleGeometry(1.75, 24);
  geometries.push(contactGeo);
  const zShadow = new THREE.Mesh(contactGeo, shadowMat);
  zShadow.rotation.x = -Math.PI / 2;
  zShadow.position.y = 0.015;

  const proxyGeo = new THREE.BoxGeometry(2.5, 2.7, 2.5);
  geometries.push(proxyGeo);
  const proxyMat = new THREE.MeshBasicMaterial({ visible: false });
  materials.push(proxyMat);
  const zenithProxy = new THREE.Mesh(proxyGeo, proxyMat);
  zenithProxy.position.y = 1.25;
  zenithProxy.userData = {
    projectId: 'zenith',
    routePath: '/work/zenith',
    inspectionTargetId: 'zenith',
  };

  zenithGroup.add(
    zRing1,
    zRing2,
    zRing3,
    zSpire,
    zShield,
    zShadow,
    zenithProxy
  );
  group.add(zenithGroup);

  // ============================================================================
  // 2. DEADZONE BASTION ARTIFACT (Layered Defensive Geometry, Warm Amber Sightline)
  // ============================================================================
  const deadzoneGroup = new THREE.Group();
  deadzoneGroup.position.set(3.4, 0.0, -2.4);

  const hexBaseGeo = new THREE.CylinderGeometry(1.3, 1.4, 0.28, 6);
  geometries.push(hexBaseGeo);
  const dBase = new THREE.Mesh(hexBaseGeo, obsidianMat);
  dBase.position.y = 0.14;
  dBase.castShadow = true;
  dBase.receiveShadow = true;
  const hexEdges = new THREE.EdgesGeometry(hexBaseGeo);
  geometries.push(hexEdges);
  dBase.add(new THREE.LineSegments(hexEdges, lineMat));
  deadzoneGroup.add(dBase);

  const citadelGeo = new THREE.BoxGeometry(0.66, 1.75, 0.66);
  geometries.push(citadelGeo);
  const dCitadel = new THREE.Mesh(citadelGeo, metallicMat);
  dCitadel.position.y = 1.1;
  dCitadel.castShadow = true;
  const citadelEdges = new THREE.EdgesGeometry(citadelGeo);
  geometries.push(citadelEdges);
  dCitadel.add(new THREE.LineSegments(citadelEdges, lineMat));
  deadzoneGroup.add(dCitadel);

  const bastionWallGeo = new THREE.BoxGeometry(0.2, 0.92, 0.96);
  geometries.push(bastionWallGeo);
  const wallEdges = new THREE.EdgesGeometry(bastionWallGeo);
  geometries.push(wallEdges);
  const chevrons: THREE.Mesh[] = [];
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2 + Math.PI / 4;
    const wall = new THREE.Mesh(
      bastionWallGeo,
      i % 2 === 0 ? boneMat : obsidianMat
    );
    wall.position.set(Math.cos(angle) * 0.86, 0.68, Math.sin(angle) * 0.86);
    wall.rotation.y = -angle;
    wall.castShadow = true;
    wall.add(new THREE.LineSegments(wallEdges, lineMat));
    chevrons.push(wall);
    deadzoneGroup.add(wall);
  }

  const sightRingGeo = new THREE.RingGeometry(1.18, 1.26, 6);
  geometries.push(sightRingGeo);
  const sightRing = new THREE.Mesh(sightRingGeo, amberAccentMat);
  sightRing.rotation.x = -Math.PI / 2;
  sightRing.position.y = 0.29;
  deadzoneGroup.add(sightRing);

  const dShadow = new THREE.Mesh(contactGeo, shadowMat);
  dShadow.rotation.x = -Math.PI / 2;
  dShadow.position.y = 0.015;

  const deadzoneProxy = new THREE.Mesh(proxyGeo, proxyMat);
  deadzoneProxy.position.y = 1.25;
  deadzoneProxy.userData = {
    projectId: 'deadzone-bastion',
    routePath: '/work/deadzone-bastion',
    inspectionTargetId: 'deadzone-bastion',
  };

  deadzoneGroup.add(dShadow, deadzoneProxy);
  group.add(deadzoneGroup);

  return {
    group,
    zenithProxy,
    deadzoneProxy,
    updateState: ({
      elapsed,
      scrollProgress,
      activeRouteId,
      hoveredProjectId,
    }) => {
      const isWorkRoute = activeRouteId.startsWith('work');
      const distFromWork = Math.abs(scrollProgress - 0.74);
      const visibilityFactor = isWorkRoute
        ? 1
        : Math.max(0, 1 - distFromWork * 3.2);

      group.visible = visibilityFactor > 0.02;
      group.position.y = (1 - visibilityFactor) * -5.2;

      const zHover =
        hoveredProjectId === 'zenith' || activeRouteId === 'work-zenith'
          ? 1.8
          : 1.0;
      zRing1.rotation.y = elapsed * 0.25 * zHover;
      zRing1.rotation.x = Math.sin(elapsed * 0.4) * 0.22;
      zRing2.rotation.y = -elapsed * 0.38 * zHover;
      zRing2.rotation.z = Math.cos(elapsed * 0.35) * 0.35;
      zRing3.rotation.x = elapsed * 0.5 * zHover;
      cobaltAccentMat.emissiveIntensity = zHover > 1 ? 0.88 : 0.55;

      const dHover =
        hoveredProjectId === 'deadzone-bastion' ||
        activeRouteId === 'work-deadzone'
          ? 1.18
          : 1.0;
      dCitadel.rotation.y = elapsed * 0.14;
      amberAccentMat.emissiveIntensity = dHover > 1 ? 0.85 : 0.52;
      chevrons.forEach((wall, idx) => {
        const angle = (idx * Math.PI) / 2 + Math.PI / 4;
        const radius = (0.86 + Math.sin(elapsed * 1.4 + idx) * 0.05) * dHover;
        wall.position.x = Math.cos(angle) * radius;
        wall.position.z = Math.sin(angle) * radius;
      });
    },
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
    },
  };
}
