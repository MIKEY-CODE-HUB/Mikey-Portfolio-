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

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];

  const obsidianMat = new THREE.MeshStandardMaterial({
    color: 0x20211f,
    roughness: 0.68,
    metalness: 0.22,
    bumpMap: bumpTexture,
    bumpScale: 0.012,
  });
  const boneMat = new THREE.MeshStandardMaterial({
    color: 0xe9e5da,
    roughness: 0.28,
    metalness: 0.16,
  });
  const metallicMat = new THREE.MeshStandardMaterial({
    color: 0x888983,
    roughness: 0.22,
    metalness: 0.82,
  });
  const cobaltAccentMat = new THREE.MeshStandardMaterial({
    color: 0x526bff,
    emissive: 0x526bff,
    emissiveIntensity: 0.42,
    roughness: 0.25,
    metalness: 0.4,
  });
  const amberAccentMat = new THREE.MeshStandardMaterial({
    color: 0xf0a65a,
    emissive: 0xf0a65a,
    emissiveIntensity: 0.38,
    roughness: 0.28,
    metalness: 0.35,
  });
  const lineMat = new THREE.LineBasicMaterial({
    color: 0xe9e5da,
    transparent: true,
    opacity: 0.45,
  });
  const shadowMat = new THREE.MeshBasicMaterial({
    map: contactShadowTexture,
    transparent: true,
    opacity: 0.45,
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
  zenithGroup.position.set(-3.2, 0.0, -2.4);

  const plinthGeo = new THREE.CylinderGeometry(1.15, 1.25, 0.24, 32);
  geometries.push(plinthGeo);
  const zenithPlinth = new THREE.Mesh(plinthGeo, obsidianMat);
  zenithPlinth.position.y = 0.12;
  zenithPlinth.castShadow = true;
  zenithPlinth.receiveShadow = true;
  zenithGroup.add(zenithPlinth);

  const ring1Geo = new THREE.TorusGeometry(0.95, 0.035, 16, 64);
  const ring2Geo = new THREE.TorusGeometry(0.68, 0.03, 16, 64);
  const ring3Geo = new THREE.TorusGeometry(0.42, 0.025, 16, 48);
  geometries.push(ring1Geo, ring2Geo, ring3Geo);

  const zRing1 = new THREE.Mesh(ring1Geo, boneMat);
  zRing1.position.y = 1.25;
  const zRing2 = new THREE.Mesh(ring2Geo, metallicMat);
  zRing2.position.y = 1.25;
  // Inner focus ring uses subtle Electric Cobalt (#526BFF)
  const zRing3 = new THREE.Mesh(ring3Geo, cobaltAccentMat);
  zRing3.position.y = 1.25;

  const spireGeo = new THREE.ConeGeometry(0.12, 1.8, 16);
  geometries.push(spireGeo);
  const zSpire = new THREE.Mesh(spireGeo, boneMat);
  zSpire.position.y = 1.1;
  zSpire.castShadow = true;

  const shieldGeo = new THREE.CylinderGeometry(
    1.1,
    1.1,
    1.4,
    24,
    1,
    true,
    -Math.PI * 0.4,
    Math.PI * 0.8
  );
  geometries.push(shieldGeo);
  const zShield = new THREE.Mesh(shieldGeo, obsidianMat);
  zShield.position.y = 1.15;

  const contactGeo = new THREE.CircleGeometry(1.65, 24);
  geometries.push(contactGeo);
  const zShadow = new THREE.Mesh(contactGeo, shadowMat);
  zShadow.rotation.x = -Math.PI / 2;
  zShadow.position.y = 0.015;

  const proxyGeo = new THREE.BoxGeometry(2.4, 2.6, 2.4);
  geometries.push(proxyGeo);
  const proxyMat = new THREE.MeshBasicMaterial({ visible: false });
  materials.push(proxyMat);
  const zenithProxy = new THREE.Mesh(proxyGeo, proxyMat);
  zenithProxy.position.y = 1.2;
  zenithProxy.userData = { projectId: 'zenith', routePath: '/work/zenith' };

  zenithGroup.add(zRing1, zRing2, zRing3, zSpire, zShield, zShadow, zenithProxy);
  group.add(zenithGroup);

  // ============================================================================
  // 2. DEADZONE BASTION ARTIFACT (Layered Defensive Geometry, Warm Amber Sightline)
  // ============================================================================
  const deadzoneGroup = new THREE.Group();
  deadzoneGroup.position.set(3.2, 0.0, -2.4);

  const hexBaseGeo = new THREE.CylinderGeometry(1.25, 1.35, 0.24, 6);
  geometries.push(hexBaseGeo);
  const dBase = new THREE.Mesh(hexBaseGeo, obsidianMat);
  dBase.position.y = 0.12;
  dBase.castShadow = true;
  dBase.receiveShadow = true;
  deadzoneGroup.add(dBase);

  const citadelGeo = new THREE.BoxGeometry(0.62, 1.65, 0.62);
  geometries.push(citadelGeo);
  const dCitadel = new THREE.Mesh(citadelGeo, metallicMat);
  dCitadel.position.y = 1.05;
  dCitadel.castShadow = true;
  const citadelEdges = new THREE.EdgesGeometry(citadelGeo);
  geometries.push(citadelEdges);
  dCitadel.add(new THREE.LineSegments(citadelEdges, lineMat));
  deadzoneGroup.add(dCitadel);

  const bastionWallGeo = new THREE.BoxGeometry(0.18, 0.85, 0.92);
  geometries.push(bastionWallGeo);
  const chevrons: THREE.Mesh[] = [];
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2 + Math.PI / 4;
    const wall = new THREE.Mesh(
      bastionWallGeo,
      i % 2 === 0 ? boneMat : obsidianMat
    );
    wall.position.set(Math.cos(angle) * 0.82, 0.66, Math.sin(angle) * 0.82);
    wall.rotation.y = -angle;
    wall.castShadow = true;
    chevrons.push(wall);
    deadzoneGroup.add(wall);
  }

  // Tactical perimeter sightline ring highlighted in Warm Amber (#F0A65A)
  const sightRingGeo = new THREE.RingGeometry(1.15, 1.22, 6);
  geometries.push(sightRingGeo);
  const sightRing = new THREE.Mesh(sightRingGeo, amberAccentMat);
  sightRing.rotation.x = -Math.PI / 2;
  sightRing.position.y = 0.26;
  deadzoneGroup.add(sightRing);

  const dShadow = new THREE.Mesh(contactGeo, shadowMat);
  dShadow.rotation.x = -Math.PI / 2;
  dShadow.position.y = 0.015;

  const deadzoneProxy = new THREE.Mesh(proxyGeo, proxyMat);
  deadzoneProxy.position.y = 1.2;
  deadzoneProxy.userData = {
    projectId: 'deadzone-bastion',
    routePath: '/work/deadzone-bastion',
  };

  deadzoneGroup.add(dShadow, deadzoneProxy);
  group.add(deadzoneGroup);

  return {
    group,
    zenithProxy,
    deadzoneProxy,
    updateState: ({ elapsed, scrollProgress, activeRouteId, hoveredProjectId }) => {
      const isWorkRoute = activeRouteId.startsWith('work');
      const distFromWork = Math.abs(scrollProgress - 0.6);
      const visibilityFactor = isWorkRoute
        ? 1
        : Math.max(0, 1 - distFromWork * 3.4);

      group.position.y = (1 - visibilityFactor) * -2.8;

      const zHover =
        hoveredProjectId === 'zenith' || activeRouteId === 'work-zenith'
          ? 1.8
          : 1.0;
      zRing1.rotation.y = elapsed * 0.25 * zHover;
      zRing1.rotation.x = Math.sin(elapsed * 0.4) * 0.22;
      zRing2.rotation.y = -elapsed * 0.38 * zHover;
      zRing2.rotation.z = Math.cos(elapsed * 0.35) * 0.35;
      zRing3.rotation.x = elapsed * 0.5 * zHover;
      cobaltAccentMat.emissiveIntensity = zHover > 1 ? 0.75 : 0.4;

      const dHover =
        hoveredProjectId === 'deadzone-bastion' ||
        activeRouteId === 'work-deadzone'
          ? 1.18
          : 1.0;
      dCitadel.rotation.y = elapsed * 0.14;
      amberAccentMat.emissiveIntensity = dHover > 1 ? 0.72 : 0.38;
      chevrons.forEach((wall, idx) => {
        const angle = (idx * Math.PI) / 2 + Math.PI / 4;
        const radius = (0.82 + Math.sin(elapsed * 1.4 + idx) * 0.05) * dHover;
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
